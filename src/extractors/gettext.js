import * as t from 'babel-types';
import { ast2Str } from '../utils';
import { ValidationError, NoTranslationError } from '../errors';
import { PO_PRIMITIVES } from '../defaults';
import { hasUsefulInfo } from '../po-helpers';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
const NAME = 'gettext';

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

function extract(path) {
    const { node } = path;
    const { value: msgid } = node.arguments[0];
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

function resolve(path, poData, context) {
    const { translations } = poData;
    const { node } = path;
    const { value: msgid } = node.arguments[0];
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${context.getPoFilePath()}" file`);
    }

    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${context.getPoFilePath()}" file`);
    }

    path.replaceWith(t.stringLiteral(transStr));
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME };
