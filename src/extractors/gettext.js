import * as t from 'babel-types';
import { ast2Str } from '../utils';
import { ValidationError } from '../errors';
import { PO_PRIMITIVES } from '../defaults';
import { hasUsefulInfo } from '../po-helpers';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
const NAME = 'gettext';

function getMsgid(node) {
    return node.arguments[0].value;
}

function validateArgument(arg) {
    if (!t.isLiteral(arg)) {
        throw new ValidationError(`You can not use ${arg.type} '${ast2Str(arg)}' as an argument to gettext`);
    }
    if (arg.type === 'TemplateLiteral') {
        throw new ValidationError('You can not use template literal as an argument to gettext');
    }
    if (!hasUsefulInfo(arg.value)) {
        throw new ValidationError(`Can not translate '${arg.value}'`);
    }
}

const validate = (node) => {
    validateArgument(node.arguments[0]);
};

function extract(node) {
    const msgid = getMsgid(node);
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

function match(node, context) {
    return (t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name === context.getAliasFor(NAME) &&
        node.arguments.length > 0);
}

function resolveDefault(nodePath) {
    return nodePath.replaceWith(nodePath.node.arguments[0]);
}

function resolve(path, translation) {
    const transStr = translation[MSGSTR][0];
    path.replaceWith(t.stringLiteral(transStr));
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME, getMsgid };
