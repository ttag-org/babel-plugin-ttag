import * as t from 'babel-types';
import { template2Msgid, msgid2Orig, hasExpressions,
    isValidQuasiExpression, ast2Str, getQuasiStr, strToQuasi, dedentStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import { ValidationError, NoTranslationError } from '../errors';
import { hasUsefulInfo } from '../po-helpers';

const { MSGID, MSGSTR } = PO_PRIMITIVES;
const NAME = 'tag-gettext';

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new ValidationError(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

const validate = (node) => {
    validateExpresssions(node.quasi.expressions);
    const msgid = template2Msgid(node);
    if (! hasUsefulInfo(msgid)) {
        throw new ValidationError(`Can not translate '${getQuasiStr(node)}'`);
    }
};

function extract(path, config) {
    const { node } = path;
    const msgid = config.isDedent() ? dedentStr(template2Msgid(node)) : template2Msgid(node);
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === config.getAliasFor(NAME);
}

function resolveDefault(nodePath, poData, config) {
    const { node } = nodePath;
    const transStr = config.isDedent() ? dedentStr(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
    return nodePath;
}

function resolve(path, poData, config) {
    const { translations } = poData;
    const { node } = path;
    const msgid = config.isDedent() ? dedentStr(template2Msgid(node)) : template2Msgid(node);
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    const transStr = translationObj[MSGSTR][0];

    if (!transStr.length) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    if (hasExpressions(node)) {
        const exprs = node.quasi.expressions.map(ast2Str);
        path.replaceWithSourceString(msgid2Orig(transStr, exprs));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME };
