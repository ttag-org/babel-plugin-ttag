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
import PluginContext from './plugin-context';

const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

export default function () {
    let config;
    let disabledScopes = new Set();
    let potEntries = [];
    let poData = null;
    const context = new PluginContext();
    context.getNode = (nodePath) => nodePath.node;

    function extractOrResolve(nodePath, state) {
        if (isInDisabledScope(nodePath, disabledScopes)) {
            return;
        }

        if (!config) {
            config = new Config(state.opts);
        }
        config.setAliases(context.aliases);
        config.setImports(context.imports);

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
                if (config.isSortedByMsgid()) {
                    // TODO: maybe use heap datastructure to avoid sorting on each filesave
                    potEntries = potEntries.sort(msgidComparator);
                }
                const potStr = makePotStr(buildPotData(potEntries));
                const filepath = config.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: context.apply({
            TaggedTemplateExpression: extractOrResolve,
            CallExpression: extractOrResolve,
            Program: (nodePath) => {
                disabledScopes = new Set();
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            },
            BlockStatement: (nodePath) => {
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            }
        }),
    };
}
