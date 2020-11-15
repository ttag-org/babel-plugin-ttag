import * as t from '@babel/types';
import { ast2Str } from '../utils';
import { ValidationError } from '../errors';
import { PO_PRIMITIVES } from '../defaults';
import { hasUsefulInfo } from '../po-helpers';

const { MSGSTR } = PO_PRIMITIVES;
const NAME = 'gettext';

function getMsgid(node) {
    return node.arguments[0].value;
}

const validate = (node) => {
    const arg = node.arguments[0];
    if (!t.isLiteral(arg)) {
        throw new ValidationError(`You can not use ${arg.type} '${ast2Str(arg)}' as an argument to gettext`);
    }
    if (arg.type === 'TemplateLiteral') {
        throw new ValidationError('You can not use template literal as an argument to gettext');
    }
    if (!hasUsefulInfo(arg.value)) {
        throw new ValidationError(`Can not translate '${arg.value}'`);
    }
};

function match(node, context) {
    return (t.isCallExpression(node)
        && t.isIdentifier(node.callee)
        && context.hasAliasForFunc(NAME, node.callee.name)
        && node.arguments.length > 0);
}

function resolveDefault(node) {
    return node.arguments[0];
}

function resolve(node, translation) {
    const transStr = translation[MSGSTR][0];
    return t.stringLiteral(transStr);
}

export default {
    match, resolve, resolveDefault, validate, name: NAME, getMsgid,
};
