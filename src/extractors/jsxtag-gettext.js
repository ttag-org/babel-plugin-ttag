import * as t from 'babel-types';
import gettext from './tag-gettext';

const NAME = 'jsxtag-gettext';

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === context.getAliasFor(NAME);
}

function templateLiteral2Array({ quasis, expressions }) {
    const items = [];

    quasis.forEach((quasi, i) => {
        if (quasi.value.cooked !== '') {
            items.push(t.stringLiteral(quasi.value.cooked));
        }
        if (expressions[i]) {
            items.push(expressions[i]);
        }
    });

    return items;
}

function resolveDefault(node, context) {
    const resolved = gettext.resolveDefault(node, context);
    if (resolved.type === 'TemplateLiteral') {
        return t.arrayExpression(templateLiteral2Array(resolved));
    }
    return t.arrayExpression([resolved]);
}

function resolve(node, translation) {
    const resolved = gettext.resolve(node, translation);
    if (resolved.type === 'ExpressionStatement') {
        return t.arrayExpression(templateLiteral2Array(resolved.expression));
    }
    return t.arrayExpression([resolved]);
}

export default {
    ...gettext,
    resolve,
    resolveDefault,
    match,
    name: NAME,
};
