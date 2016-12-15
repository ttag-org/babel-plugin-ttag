import * as t from 'babel-types';
import { template2Msgid, msgid2Orig,
    isValidQuasiExpression, ast2Str, getQuasiStr, strToQuasi, hasExpressions } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import { ValidationError, NoTranslationError } from '../errors';
import tpl from 'babel-template';
import { hasTranslations, getPluralFunc, getNPlurals, pluralFnBody,
    makePluralFunc } from '../po-helpers';
import dedent from 'dedent';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;
const NAME = 'tag-ngettext';

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new ValidationError(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

function validateNPlural(exp) {
    if (!t.isIdentifier(exp) && !t.isNumericLiteral(exp) && !t.isMemberExpression(exp)) {
        throw new ValidationError(`${exp.type} '${ast2Str(exp)}' can not be used as plural number argument`);
    }
}

const validate = (path) => {
    const { node } = path;
    validateExpresssions(node.quasi.expressions);
    validateNPlural(node.tag.arguments[0]);
    const msgid = template2Msgid(node);
    if (msgid === '') {
        throw new ValidationError('Can not translate empty string');
    }
};

function ngettextTemplate(ngettext, pluralForm) {
    return tpl(`function NGETTEXT(n, args) { ${pluralFnBody(pluralForm)} }`)({ NGETTEXT: ngettext });
}

function getNgettextUID(state, pluralFunc) {
    /* eslint-disable no-underscore-dangle */
    if (! state.file.__ngettextUid) {
        const uid = state.file.scope.generateUidIdentifier('tag_ngettext');
        state.file.path.unshiftContainer('body',
            ngettextTemplate(uid, pluralFunc));
        state.file.__ngettextUid = uid;
    }
    return state.file.__ngettextUid;
}

function extract(path, config) {
    const { node } = path;
    const nplurals = getNPlurals(config.getHeaders());
    const msgid = config.isDedent() ? dedent(template2Msgid(node)) : template2Msgid(node);
    const translate = {
        [MSGID]: msgid,
        [MSGID_PLURAL]: msgid,
        [MSGSTR]: [],
    };

    for (let i = 0; i < nplurals; i++) {
        translate[MSGSTR][i] = '';
    }

    return translate;
}

function match({ node }, config) {
    return (t.isTaggedTemplateExpression(node) &&
        node.tag.callee &&
        node.tag.callee.name === config.getAliasFor(NAME));
}

function resolveDefault(nodePath, config) {
    const { node } = nodePath;
    const transStr = config.isDedent() ? dedent(getQuasiStr(node)) : getQuasiStr(node);
    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
    return nodePath;
}

function resolve(path, poData, config, state) {
    // TODO: handle when has no node argument.
    const { translations, headers } = poData;
    const { node } = path;
    const msgid = config.isDedent() ? dedent(template2Msgid(node)) : template2Msgid(node);
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    if (!hasTranslations(translationObj)) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    const args = translations[msgid][MSGSTR];
    const tagArg = node.tag.arguments[0];
    const exprs = node.quasi.expressions.map(({ name }) => name);

    if (t.isIdentifier(tagArg)) {
        return path.replaceWith(tpl('NGETTEXT(N, ARGS)')({
            NGETTEXT: getNgettextUID(state, getPluralFunc(headers)),
            N: t.identifier(tagArg.name),
            ARGS: t.arrayExpression(args.map((l) => {
                const { expression: { quasis, expressions } } = tpl(msgid2Orig(l, exprs))();
                return t.templateLiteral(quasis, expressions);
            })),
        }));
    }

    if (t.isLiteral(tagArg)) {
        const pluralFn = makePluralFunc(getPluralFunc(headers));
        const orig = msgid2Orig(pluralFn(tagArg.value, args), exprs);
        return path.replaceWith(tpl(orig)());
    }
    return path;
}

export default { match, extract, resolve, resolveDefault, validate, name: NAME };
