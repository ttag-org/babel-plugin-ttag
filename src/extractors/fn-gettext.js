import * as t from 'babel-types';
import { ast2Str } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function validateArgument(arg) {
    if (!t.isLiteral(arg)) {
        throw new Error(`You can not use ${arg.type} '${ast2Str(arg)}' as an argument to gettext`);
    }
}

const validate = (path) => {
    validateArgument(path.node.arguments[0]);
};

function extract(path, config) {
    const { node } = path;
    validate(path, config);
    const { value: msgid } = node.arguments[0];
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return (t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name === config.getAliasFor('fn-gettext') &&
        node.arguments.length > 0);
}

function resolveDefault(nodePath) {
    return nodePath.replaceWith(nodePath.node.arguments[0]);
}

function resolve(path, poData, config) {
    validate(path, config);
    const { translations } = poData;
    const { node } = path;
    const { value: msgid } = node.arguments[0];
    const translationObj = translations[msgid];

    if (!translationObj) {
        config.noTranslationOnResolve(`No "${msgid}" in "${config.getPoFilePath()}" file`);
        resolveDefault(path);
        return;
    }

    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        config.noTranslationOnResolve(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
        resolveDefault(path);
        return;
    }

    path.replaceWith(t.stringLiteral(transStr));
}

export default { match, extract, resolve, resolveDefault };
