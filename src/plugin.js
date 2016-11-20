import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, hasTranslations } from './extract';
import { resolveTranslations } from './resolve';
import { buildPotData, makePotStr, parserPoTranslations } from './po-helpers';

export default function () {
    let configInst;
    const potEntries = [];

    function getConfig(rawConfg) {
        if (!configInst) {
            configInst = new Config(rawConfg);
        }
        return configInst;
    }

    return {
        post() {
            const config = getConfig();

            if (! config.isActiveMode()) {
                return;
            }

            if (config.isExtractMode() && potEntries.length) {
                const potStr = makePotStr(buildPotData(potEntries));
                const filepath = config.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression(nodePath, state) {
                const config = getConfig(state.opts);

                if (! config.isActiveMode()) {
                    return;
                }

                const filename = state.file.opts.filename;

                if (config.isExtractMode() && hasTranslations(nodePath, config)) {
                    const poEntry = extractPoEntry(nodePath, config, filename);
                    poEntry && potEntries.push(poEntry);
                }

                if (config.isResolveMode()) {
                    const poFilePath = config.getPoFilePath();
                    const translations = parserPoTranslations(poFilePath);
                    resolveTranslations(nodePath, config, translations);
                }
            },
        },
    };
}
