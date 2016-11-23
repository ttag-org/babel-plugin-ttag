import fs from 'fs';
import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS, PO_PRIMITIVES } from './defaults';

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

export function parsePoData(filepath) {
    const poRaw = fs.readFileSync(filepath);
    const parsedPo = gettextParser.po.parse(poRaw.toString());
    const translations = parsedPo.translations[''];
    const headers = parsedPo.headers;
    return { translations, headers };
}

export function getPluralFunc(headers) {
    return /plural ?=?\(([\s\S]*)\);/.exec(headers['plural-forms'])[1];
}

export function hasTranslations(translationObj) {
    return translationObj[PO_PRIMITIVES.MSGSTR].reduce((r, t) => r && t.length, true);
}
