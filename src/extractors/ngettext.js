import * as t from 'babel-types';
import { stripTag, template2Msgid, msgid2Orig,
    isValidQuasiExpression, ast2Str } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import tpl from 'babel-template';
import { hasTranslations, getPluralFunc, getNPlurals, pluralFnBody,
    makePluralFunc } from '../po-helpers';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new Error(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

function validateNPlural(exp) {
    if (!t.isIdentifier(exp) && !t.isNumericLiteral(exp)) {
        throw new Error(`${exp.type} '${ast2Str(exp)}' can not be used as plural number argument`);
    }
}

const validate = (fn) => (path, ...args) => {
    const { node } = path;
    validateExpresssions(node.quasi.expressions);
    validateNPlural(node.tag.arguments[0]);
    return fn(path, ...args);
};

function ngettextTemplate(ngettext, pluralForm) {
    return tpl(`function NGETTEXT(n, args) { ${pluralFnBody(pluralForm)} }`)({ NGETTEXT: ngettext });
}

function getNgettextUID(state, pluralFunc) {
    /* eslint-disable no-underscore-dangle */
    if (! state.file.__ngettextUid) {
        const uid = state.file.scope.generateUidIdentifier('ngettext');
        state.file.path.unshiftContainer('body',
            ngettextTemplate(uid, pluralFunc));
        state.file.__ngettextUid = uid;
    }
    return state.file.__ngettextUid;
}

function extract({ node }, config) {
    const nplurals = getNPlurals(config.getHeaders());
    const nodeStr = template2Msgid(node);
    const translate = {
        [MSGID]: nodeStr,
        [MSGID_PLURAL]: nodeStr,
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
        node.tag.callee.name === config.getAliasFor('ngettext'));
}

function resolveDefault(nodePath) {
    return stripTag(nodePath);
}

function resolve(path, poData, config, state) {
    // TODO: handle when has no node argument.
    const { translations, headers } = poData;
    const { node } = path;
    const msgid = template2Msgid(node);
    const translationObj = translations[msgid];

    if (!translationObj || translationObj && !hasTranslations(translationObj)) {
        config.unresolvedAction(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
        stripTag(path);
        return path;
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

export default { match, extract: validate(extract), resolve: validate(resolve), resolveDefault };
