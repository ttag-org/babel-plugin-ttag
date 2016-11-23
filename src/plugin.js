import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, getExtractor } from './extract';
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

    function processExpression(nodePath, state) {
        const config = getConfig(state.opts);
        const extractor = getExtractor(nodePath, config);
        if (!extractor) {
            return;
        }

        if (config.isExtractMode()) {
            const poEntry = extractPoEntry(extractor, nodePath, config, state);
            poEntry && potEntries.push(poEntry);
        }

        if (config.isResolveMode()) {
            const poFilePath = config.getPoFilePath();
            const translations = parserPoTranslations(poFilePath);
            extractor.resolve(nodePath, translations, config, state);
        } else {
            extractor.resolveDefault && extractor.resolveDefault(nodePath, config, state);
        }
    }

    return {
        post() {
            const config = getConfig();

            if (config.isExtractMode() && potEntries.length) {
                const potStr = makePotStr(buildPotData(potEntries));
                const filepath = config.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression: processExpression,
        },
    };
}
