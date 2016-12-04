import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, getExtractor } from './extract';
import { buildPotData, makePotStr, parsePoData } from './po-helpers';
import { hasDisablingComment, isInDisabledScope } from './utils';

export default function () {
    let config;
    let disabledScopes = new Set();
    const potEntries = [];

    function processExpression(nodePath, state) {
        if (isInDisabledScope(nodePath, disabledScopes)) {
            return;
        }

        if (!config) {
            config = new Config(state.opts);
        }

        const extractor = getExtractor(nodePath, config);
        if (!extractor) {
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
            const poData = parsePoData(poFilePath);
            try {
                extractor.resolve(nodePath, poData, config, state);
            } catch (err) {
                // TODO: handle specific instances of errors
                throw nodePath.buildCodeFrameError(err.message);
            }
        } else {
            extractor.resolveDefault && extractor.resolveDefault(nodePath, config, state);
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
            TaggedTemplateExpression: processExpression,
            CallExpression: processExpression,
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
            },
        },
    };
}
