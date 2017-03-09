import * as t from 'babel-types';
import { template2Msgid, msgid2Orig, hasExpressions,
    isValidQuasiExpression, ast2Str, getQuasiStr, strToQuasi, dedentStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import { ValidationError } from '../errors';
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

function extract(node, context) {
    const msgid = context.isDedent() ? dedentStr(template2Msgid(node)) : template2Msgid(node);
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === context.getAliasFor(NAME);
}

function resolveDefault(nodePath, context) {
    const { node } = nodePath;
    const transStr = context.isDedent() ? dedentStr(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
    return nodePath;
}

function resolve(path, translation) {
    const transStr = translation[MSGSTR][0];
    const { node } = path;

    if (hasExpressions(node)) {
        const exprs = node.quasi.expressions.map(ast2Str);
        path.replaceWithSourceString(msgid2Orig(transStr, exprs));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME, getMsgid: template2Msgid };
