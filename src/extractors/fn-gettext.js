import * as t from 'babel-types';
import { ast2Str } from '../utils';
import { ValidationError, NoTranslationError } from '../errors';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
const NAME = 'fn-gettext';

function validateArgument(arg) {
    if (!t.isLiteral(arg)) {
        throw new ValidationError(`You can not use ${arg.type} '${ast2Str(arg)}' as an argument to gettext`);
    }
    if (arg.type === 'TemplateLiteral') {
        throw new ValidationError('You can not use template literal as an argument to gettext');
    }
    if (arg.value === '') {
        throw new ValidationError('You can not pass empty string to gettext');
    }
}

const validate = (path) => {
    validateArgument(path.node.arguments[0]);
};

function extract(path) {
    const { node } = path;
    const { value: msgid } = node.arguments[0];
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return (t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name === config.getAliasFor(NAME) &&
        node.arguments.length > 0);
}

function resolveDefault(nodePath) {
    return nodePath.replaceWith(nodePath.node.arguments[0]);
}

function resolve(path, poData, config) {
    const { translations } = poData;
    const { node } = path;
    const { value: msgid } = node.arguments[0];
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    path.replaceWith(t.stringLiteral(transStr));
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME };
