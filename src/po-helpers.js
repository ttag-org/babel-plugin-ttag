import * as bt from '@babel/types';
import fs from 'fs';
import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS, PO_PRIMITIVES, LOCATION } from './defaults';
import { strHasExpr } from './utils';
import dedent from 'dedent';

export function buildPotData(translations) {
    const data = {
        charset: 'UTF-8',
        headers: DEFAULT_HEADERS,
        translations: {
            '': {
            },
        },
    };

    for (const trans of translations) {
        const ctx = trans[PO_PRIMITIVES.MSGCTXT] || '';
        if (!data.translations[ctx]) {
            data.translations[ctx] = {};
        }

        if (!data.translations[ctx][trans.msgid]) {
            data.translations[ctx][trans.msgid] = trans;
            continue;
        }

        const oldTrans = data.translations[ctx][trans.msgid];

        // merge references
        if (oldTrans.comments && oldTrans.comments.reference &&
            trans.comments && trans.comments.reference &&
            !oldTrans.comments.reference.includes(trans.comments.reference)) {
            oldTrans.comments.reference = `${oldTrans.comments.reference}\n${trans.comments.reference}`;
        }
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

const tagRegex = {};
export function applyExtractedComments(poEntry, nodePath, tag) {
    if (!poEntry.comments) {
        poEntry.comments = {};
    }

    const node = nodePath.node;

    if (!(
        bt.isStatement(node) ||
        bt.isDeclaration(node)
    )) {
        // Collect parents' comments
        //
        applyExtractedComments(poEntry, nodePath.parentPath, tag);
    }

    const comments = node.leadingComments;
    let transComments = comments ? comments.map((c) => c.value) : [];
    if (tag) {
        if (!tagRegex[tag]) {
            tagRegex[tag] = new RegExp(`^\\s*${tag}\\s*(.*?)\\s*$`);
        }
        transComments = transComments
            .map((c) => c.match(tagRegex[tag]))
            .filter((match) => Boolean(match))
            .map((c) => dedent(c[1]));
    }

    if (transComments.length === 0) return;

    if (poEntry.comments.extracted) {
        poEntry.comments.extracted += '\n';
    } else {
        poEntry.comments.extracted = '';
    }
    poEntry.comments.extracted += transComments.join('\n');
}

export function applyFormat(poEntry) {
    const msgid = poEntry[PO_PRIMITIVES.MSGID];
    const hasExprs = strHasExpr(msgid);
    if (!hasExprs) {
        return poEntry;
    }
    if (!poEntry.comments) {
        poEntry.comments = {};
    }
    if (poEntry.comments.flag) {
        poEntry.comments.flag = `${poEntry.comments.flag}\njavascript-format`;
    } else {
        poEntry.comments.flag = 'javascript-format';
    }
    return poEntry;
}

export function makePotStr(data) {
    return gettextParser.po.compile(data);
}

const poDataCache = {};
// This function must use cache, because:
// 1. readFileSync is blocking operation (babel transforms are sync for now)
// 2. po data parse is quite CPU intensive operation that can also block
export function parsePoData(filepath) {
    if (poDataCache[filepath]) return poDataCache[filepath];
    const poRaw = fs.readFileSync(filepath);
    const parsedPo = gettextParser.po.parse(poRaw.toString());
    const translations = parsedPo.translations;
    const headers = parsedPo.headers;
    const data = { translations, headers };
    poDataCache[filepath] = data;
    return data;
}

const pluralRegex = /\splural ?=?([\s\S]*);?/;
export function getPluralFunc(headers) {
    try {
        let pluralFn = pluralRegex.exec(headers['plural-forms'])[1];
        if (pluralFn[pluralFn.length - 1] === ';') {
            pluralFn = pluralFn.slice(0, -1);
        }
        return pluralFn;
    } catch (err) {
        throw new Error(`Failed to parse plural func from headers "${JSON.stringify(headers)}"\n`);
    }
}

export function getNPlurals(headers) {
    const nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1];
    return parseInt(nplurals, 10);
}

export function hasTranslations(translationObj) {
    return translationObj[PO_PRIMITIVES.MSGSTR].reduce((r, t) => r && t.length, true);
}

export function isFuzzy(translationObj) {
    return (
        translationObj && translationObj.comments &&
        translationObj.comments.flag === 'fuzzy');
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

export function getDefaultPoData(headers) {
    return { headers, translations: { '': {} } };
}

const nonTextRegexp = /\${.*?}|\d|\s|[.,\/#!$%\^&\*;{}=\-_`~()]/g;
export function hasUsefulInfo(text) {
    const withoutExpressions = text.replace(nonTextRegexp, '');
    return Boolean(withoutExpressions.match(/\S/));
}
