import * as t from '@babel/types';
import tpl from '@babel/template';
import {
    template2Msgid, validateAndFormatMsgid,
    hasExpressions, ast2Str, getQuasiStr, dedentStr, strToQuasi,
} from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import { ValidationError } from '../errors';
import { hasUsefulInfo } from '../po-helpers';

const { MSGSTR } = PO_PRIMITIVES;
const NAME = 'tag-gettext';

const validate = (node, context) => {
    const msgid = template2Msgid(node, context);
    if (!hasUsefulInfo(msgid)) {
        throw new ValidationError(`Can not translate '${getQuasiStr(node)}'`);
    }
};

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && context.hasAliasForFunc(NAME, node.tag.name);
}

function resolveDefault(node, context) {
    const transStr = context.isDedent() ? dedentStr(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        return node.quasi;
    }
    return t.stringLiteral(transStr);
}

function resolve(node, translation, context) {
    const transStr = translation[MSGSTR][0];

    if (hasExpressions(node)) {
        const transExpr = tpl.ast(strToQuasi(transStr));
        if (context.isNumberedExpressions()) {
            const exprs = transExpr.expression.expressions
                .map(({ value }) => value)
                .map((i) => node.quasi.expressions[i]);
            return t.templateLiteral(transExpr.expression.quasis, exprs);
        }
        const exprs = node.quasi.expressions.map(ast2Str);
        return tpl.ast(validateAndFormatMsgid(transStr, exprs)).expression;
    }
    return t.stringLiteral(transStr);
}

export default {
    match, resolve, resolveDefault, validate, name: NAME, getMsgid: template2Msgid,
};
