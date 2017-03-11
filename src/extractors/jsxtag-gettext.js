import * as t from 'babel-types';
import tpl from 'babel-template';
import gettext from './tag-gettext';
import { msgid2Orig, hasExpressions,
    ast2Str, getQuasiStr, dedentStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';

const { MSGSTR } = PO_PRIMITIVES;
const NAME = 'jsxtag-gettext';

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === context.getAliasFor(NAME);
}

function resolveDefault(node, context) {
    const transStr = context.isDedent() ? dedentStr(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        // node.quasi is TemplateLiteral with expressions and quasis.
        // We should return [quasis[0], expressions[0], quasis[1], ...]
        //
        const { quasis, expressions } = node.quasi;
        const items = [];

        quasis.forEach((quasi, i) => {
            if (quasi.value.cooked !== '') {
                items.push(t.stringLiteral(quasi.value.cooked));
            }
            if (expressions[i]) {
                items.push(expressions[i]);
            }
        });

        return t.arrayExpression(items);
    }
    return t.arrayExpression([t.stringLiteral(transStr)]);
}

function resolve(node, translation) {
    const transStr = translation[MSGSTR][0];

    if (hasExpressions(node)) {
        const exprs = node.quasi.expressions.map(ast2Str);
        return tpl(msgid2Orig(transStr, exprs))();
    }
    return t.stringLiteral(transStr);
}

export default {
    ...gettext,
    resolve,
    resolveDefault,
    match,
    name: NAME,
};
