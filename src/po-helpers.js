import * as bt from 'babel-types';
import fs from 'fs';
import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS, PO_PRIMITIVES, LOCATION } from './defaults';
import dedent from 'dedent';


function updatePotData(trans, defaultContext) {
    const oldTrans = defaultContext[trans.msgid];
    if (!oldTrans) {
        defaultContext[trans.msgid] = trans;
    } else if (
        oldTrans.comments && oldTrans.comments.reference &&
        trans.comments && trans.comments.reference &&
        ! oldTrans.comments.reference.match(trans.comments.reference)
    ) {
        // merge references
        oldTrans.comments.reference = `${oldTrans.comments.reference}\n${trans.comments.reference}`;
    }
}


export function buildPotData(translations, isSortedByMsgid) {
    const data = {
        charset: 'UTF-8',
        headers: DEFAULT_HEADERS,
        translations: {
            context: {
            },
        },
    };

    const defaultContext = data.translations.context;

    if (isSortedByMsgid) {
        for (const _ of Array(translations.length).keys()) {
            const trans = translations.dequeue();
            updatePotData(trans, defaultContext);
        }
    } else {
        for (const trans of translations) {
            updatePotData(trans, defaultContext);
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
            tagRegex[tag] = new RegExp(`^\s*${tag}\s*(.*?)\s*$`);
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

const pluralRegex = /\splural ?=?([\s\S]*);?/;
export function getPluralFunc(headers) {
    let pluralFn = pluralRegex.exec(headers['plural-forms'])[1];
    if (pluralFn[pluralFn.length - 1] === ';') {
        pluralFn = pluralFn.slice(0, -1);
    }
    return pluralFn;
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

export function getDefaultPoData(config) {
    return {
        headers: config.getHeaders(),
    };
}

const nonTextRegexp = /\${.*?}|\d|\s|[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
export function hasUsefulInfo(text) {
    const withoutExpressions = text.replace(nonTextRegexp, '');
    return Boolean(withoutExpressions.match(/\S/));
}

export function msgidComparator(e1, e2) {
    if (e1.msgid > e2.msgid) {
        return 1;
    }
    if (e2.msgid > e1.msgid) {
        return -1;
    }
    return 0;
}
