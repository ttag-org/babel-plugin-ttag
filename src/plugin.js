import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, getExtractor } from './extract';
import { resolveEntries } from './resolve';
import { buildPotData, makePotStr, parsePoData, getDefaultPoData,
msgidComparator } from './po-helpers';
import { hasDisablingComment, isInDisabledScope, isC3poImport, hasImportSpecifier } from './utils';
import { ALIASES } from './defaults';
import PriorityQueue from 'js-priority-queue';

const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

export default function () {
    let aliases = {};
    let config;
    let disabledScopes = new Set();
    let imports = new Set();
    let poData = null;
    let potEntries = [];
    let potEntriesSorted = new PriorityQueue({ comparator: msgidComparator });

    function extractOrResolve(nodePath, state) {
        if (isInDisabledScope(nodePath, disabledScopes)) {
            return;
        }

        if (!config) {
            config = new Config(state.opts);
        }
        config.setAliases(aliases);
        config.setImports(imports);

        const extractor = getExtractor(nodePath, config);
        if (!extractor) {
            return;
        }

        const alias = config.getAliasFor(extractor.name);

        if (!config.hasImport(alias)) {
            return;
        }

        if (config.isExtractMode()) {
            try {
                const poEntry = extractPoEntry(extractor, nodePath, config, state);
                if (config.isSortedByMsgid()) {
                    poEntry && potEntriesSorted.queue(poEntry);
                } else {
                    poEntry && potEntries.push(poEntry);
                }
            } catch (err) {
                // TODO: handle specific instances of errors
                throw nodePath.buildCodeFrameError(err.message);
            }
        }

        if (config.isResolveMode()) {
            const poFilePath = config.getPoFilePath();

            if (!poData) {
                poData = parsePoData(poFilePath);
            }

            try {
                resolveEntries(extractor, nodePath, poData, config, state);
            } catch (err) {
                // TODO: handle specific instances of errors
                throw nodePath.buildCodeFrameError(err.message);
            }
        } else {
            extractor.resolveDefault && extractor.resolveDefault(
                nodePath, getDefaultPoData(config), config, state);
        }
    }

    return {
        post() {
            if (config && config.isExtractMode() && (potEntries.length || potEntriesSorted.length)) {
                let potStr;
                if (config.isSortedByMsgid()) {
                    potStr = makePotStr(buildPotData(potEntriesSorted, true));
                } else {
                    potStr = makePotStr(buildPotData(potEntries));
                }
                const filepath = config.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression: extractOrResolve,
            CallExpression: extractOrResolve,
            Program: (nodePath) => {
                disabledScopes = new Set();
                aliases = {};
                imports = new Set();
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            },
            BlockStatement: (nodePath) => {
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            },
            ImportDeclaration: (nodePath) => {
                const { node } = nodePath;
                if (isC3poImport(node)) {
                    node.specifiers
                    .filter(({ local: { name } }) => reverseAliases[name])
                    .map((s) => imports.add(s.local.name));
                }
                if (isC3poImport(node) && hasImportSpecifier(node)) {
                    node.specifiers
                    .filter((s) => s.type === 'ImportSpecifier')
                    .filter(({ imported: { name } }) => reverseAliases[name])
                    .forEach(({ imported, local }) => {
                        aliases[reverseAliases[imported.name]] = local.name;
                        imports.add(local.name);
                    });
                }
            },
        },
    };
}
