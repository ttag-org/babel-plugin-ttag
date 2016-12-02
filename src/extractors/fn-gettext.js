import * as t from 'babel-types';
import { template2Msgid, msgid2Orig, hasExpressions, stripTag,
    isValidQuasiExpression, ast2Str } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function validateArgument(arg, config) {
    if (!t.isLiteral(arg)) {
        const fn = config.getAliasFor('fn-gettext');
        throw new Error(`You can not use ${arg.type} '${ast2Str(arg)}' as an argument to ${fn}`);
    }
}

const validate = (fn) => (path, ...args) => {
    validateArgument(path.node.arguments[0], args[0]);
    return fn(path, ...args);
};

function extract({ node }) {
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
    return stripTag(nodePath);
}

function resolve(path, poData, config) {
    // const { translations } = poData;
    // const { node } = path;
    // const msgid = template2Msgid(node);
    // const translationObj = translations[template2Msgid(node)];
    //
    // if (!translationObj) {
    //     config.unresolvedAction(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    //     resolveDefault(path);
    //     return;
    // }
    // const transStr = translationObj[MSGSTR][0];
    // if (!transStr.length) {
    //     config.unresolvedAction(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    //     resolveDefault(path);
    //     return;
    // }
    //
    // if (hasExpressions(node)) {
    //     const exprs = node.quasi.expressions.map(({ name }) => name);
    //     path.replaceWithSourceString(msgid2Orig(transStr, exprs));
    // } else {
    //     path.replaceWith(t.stringLiteral(transStr));
    // }
}

export default { match, extract: validate(extract), resolve: validate(resolve), resolveDefault };
