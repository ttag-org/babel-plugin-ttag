import * as t from 'babel-types';
import { template2Msgid, msgid2Orig, hasExpressions, stripTag,
    isValidQuasiExpression, ast2Str } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import { ValidationError, NoTranslationError } from '../errors';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
const NAME = 'tag-gettext';

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new ValidationError(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

const validate = (path) => {
    const { node } = path;
    validateExpresssions(node.quasi.expressions);
};

function extract(path) {
    const { node } = path;
    return {
        [MSGID]: template2Msgid(node),
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === config.getAliasFor(NAME);
}

function resolve(path, poData, config) {
    const { translations } = poData;
    const { node } = path;
    const msgid = template2Msgid(node);
    const translationObj = translations[template2Msgid(node)];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${config.getPoFilePath()}" file`);
    }
    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    if (hasExpressions(node)) {
        const exprs = node.quasi.expressions.map(({ name }) => name);
        path.replaceWithSourceString(msgid2Orig(transStr, exprs));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve, resolveDefault: stripTag, validate, name: NAME };
