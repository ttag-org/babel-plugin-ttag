import * as t from 'babel-types';
import { template2Msgid, strToQuasi, hasExpressions, stripTag,
    isValidQuasiExpression, ast2Str } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new Error(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

function extract({ node }) {
    validateExpresssions(node.quasi.expressions);
    return {
        [MSGID]: template2Msgid(node),
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === config.getAliasFor('gettext');
}

function resolveDefault(nodePath) {
    return stripTag(nodePath);
}

function resolve(path, poData, config) {
    const { translations } = poData;
    const { node } = path;
    const msgid = template2Msgid(node);
    const translationObj = translations[template2Msgid(node)];

    if (!translationObj) {
        config.unresolvedAction(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
        resolveDefault(path);
        return;
    }
    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        config.unresolvedAction(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
        resolveDefault(path);
        return;
    }

    if (hasExpressions(node)) {
        path.replaceWithSourceString(strToQuasi(transStr));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve, resolveDefault };
