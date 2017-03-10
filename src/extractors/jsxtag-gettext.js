import * as t from 'babel-types';
import gettext from './tag-gettext';
import { PO_PRIMITIVES } from '../defaults';
import { template2Msgid, msgid2Orig, hasExpressions,
    ast2Str, getQuasiStr, strToQuasi, dedentStr } from '../utils';
import { NoTranslationError } from '../errors';

const { MSGSTR } = PO_PRIMITIVES;
const NAME = 'jsxtag-gettext';

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === context.getAliasFor(NAME);
}

function resolveDefault(nodePath, poData, context) {
    const { node } = nodePath;
    const transStr = context.isDedent() ? dedentStr(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
    return nodePath;
}

function resolve(path, poData, context) {
    const { translations } = poData;
    const { node } = path;
    const msgid = context.isDedent() ? dedentStr(template2Msgid(node)) : template2Msgid(node);
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${context.getPoFilePath()}" file`);
    }

    const transStr = translationObj[MSGSTR][0];

    if (!transStr.length) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${context.getPoFilePath()}" file`);
    }

    if (hasExpressions(node)) {
        const exprs = node.quasi.expressions.map(ast2Str);
        path.replaceWithSourceString(msgid2Orig(transStr, exprs));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}


export default {
    ...gettext,
    resolveDefault,
    resolve,
    match,
    name: NAME,
};
