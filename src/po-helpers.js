import fs from 'fs';
import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS, PO_PRIMITIVES, LOCATION } from './defaults';

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


export function applyReference(poEntry, node, filepath, location) {
    if (!poEntry.comments) {
        poEntry.comments = {};
    }

    let reference = null;

    switch (location) {
        case LOCATION.FILE:
            reference = filepath; break;
        case LOCATION.NEVER:
            reference = null; break;
        default:
            reference = `${filepath}:${node.loc.start.line}`;
    }

    poEntry.comments.reference = reference;
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
    return /\splural ?=?([\s\S]*);/.exec(headers['plural-forms'])[1];
}

export function getNPlurals(headers) {
    const nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1];
    return parseInt(nplurals, 10);
}

export function hasTranslations(translationObj) {
    return translationObj[PO_PRIMITIVES.MSGSTR].reduce((r, t) => r && t.length, true);
}

export function pluralFnBody(pluralStr) {
    return `return args[+ (${pluralStr})];`;
}

const fnCache = {};
export function makePluralFunc(pluralStr) {
    /* eslint-disable no-new-func */
    let fn = fnCache[pluralStr];
    if (!fn) {
        fn = new Function('n', 'args', pluralFnBody(pluralStr));
        fnCache[pluralStr] = fn;
    }
    return fn;
}
