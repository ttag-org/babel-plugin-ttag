import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Config from './config';
import { extractPoEntry, hasTranslations } from './extract';
import { isActiveMode, isExtractMode } from './utils';
import { buildPotData, makePotStr } from './po-helpers';

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
            if (! isActiveMode()) {
                return;
            }

            const config = getConfig();

            if (isExtractMode() && potEntries.length) {
                const potStr = makePotStr(buildPotData(potEntries));
                const filepath = config.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression(nodePath, state) {
                if (! isActiveMode()) {
                    return;
                }
                const config = getConfig(state.opts);
                const filename = state.file.opts.filename;

                if (isExtractMode() && hasTranslations(nodePath, config)) {
                    const poEntry = extractPoEntry(nodePath, config, filename);
                    poEntry && potEntries.push(poEntry);
                }
            },
        },
    };
}
