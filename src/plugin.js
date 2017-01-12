import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, getExtractor } from './extract';
import { resolveEntries } from './resolve';
import { buildPotData, makePotStr, parsePoData, getDefaultPoData } from './po-helpers';
import { hasDisablingComment, isInDisabledScope, isC3poImport, hasImportSpecifier } from './utils';
import { ALIASES } from './defaults';

const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

export default function () {
    let config;
    let disabledScopes = new Set();
    const potEntries = [];
    let poData = null;
    let aliases = {};
    let imports = new Set();

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
                poEntry && potEntries.push(poEntry);
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
            if (config && config.isExtractMode() && potEntries.length) {
                const potStr = makePotStr(buildPotData(potEntries));
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
