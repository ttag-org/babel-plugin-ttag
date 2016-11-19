import fs from 'fs';
import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS } from './defaults';

export function buildPotData(translations) {
    const data = {
        charset: 'UTF-8',
        headers: DEFAULT_HEADERS,
        translations: {
            context: {
            },
        },
    };

    const defaultContext = data.translations.context;

    for (const trans of translations) {
        defaultContext[trans.msgid] = trans;
    }

    return data;
}


export function applyReference(poEntry, node, filepath) {
    if (!poEntry.comments) {
        poEntry.comments = {};
    }
    poEntry.comments.reference = `${filepath}:${node.loc.start.line}`;
    return poEntry;
}

export function makePotStr(data) {
    return gettextParser.po.compile(data);
}

export function parserPoTranslations(filepath) {
    const poRaw = fs.readFileSync(filepath);
    return gettextParser.po.parse(poRaw.toString()).translations[''];
}
