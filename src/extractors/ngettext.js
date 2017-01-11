import * as t from 'babel-types';
import { PO_PRIMITIVES } from '../defaults';
import { dedentStr, template2Msgid, isValidQuasiExpression, ast2Str, msgid2Orig,
getQuasiStr, strToQuasi } from '../utils';
import { getNPlurals, getPluralFunc, pluralFnBody, makePluralFunc, hasTranslations,
hasTranslation } from '../po-helpers';
import { ValidationError, NoTranslationError } from '../errors';
import tpl from 'babel-template';

const NAME = 'ngettext';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function getMsgid(tag, config) {
    return config.isDedent() ? dedentStr(template2Msgid(tag)) : template2Msgid(tag);
}

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new ValidationError(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

function validateNPlural(exp) {
    if (!t.isIdentifier(exp) && !t.isNumericLiteral(exp) && !t.isMemberExpression(exp)) {
        throw new ValidationError(`${exp.type} '${ast2Str(exp)}' can not be used as plural argument`);
    }
}

const validate = (path, config) => {
    const { node } = path;
    const msgidTag = node.arguments[0];
    const msgidAlias = config.getAliasFor('msgid');
    if (! t.isTaggedTemplateExpression(msgidTag)) {
        throw new ValidationError(
            `First argument must be tagged template expression. You should use '${msgidAlias}' tag`);
    }
    if (msgidTag.tag.name !== msgidAlias) {
        throw new ValidationError(
            `Expected '${msgidAlias}' for the first argument but not '${msgidTag.tag.name}'`);
    }
    validateExpresssions(msgidTag.quasi.expressions);
    const tags = node.arguments.slice(1, -1);
    tags.forEach(({ expressions }) => validateExpresssions(expressions));
    validateNPlural(node.arguments[node.arguments.length - 1]);
    const msgid = getMsgid(msgidTag, config);
    if (!hasTranslation(msgid)) {
        throw new ValidationError(
            `No meaningful information in '${getQuasiStr(msgidTag)}' string`);
    }
};

function match({ node }, config) {
    return (t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === config.getAliasFor(NAME) &&
    node.arguments.length > 0);
}

function extract(path, config) {
    const tags = path.node.arguments.slice(0, -1);
    const msgid = getMsgid(tags[0], config);
    const nplurals = getNPlurals(config.getHeaders());
    if (tags.length !== nplurals) {
        throw new ValidationError(`Expected to have ${nplurals} plural forms but have ${tags.length} instead`);
    }
    // TODO: handle case when only 1 plural form
    const msgidPlural = getMsgid({ quasi: tags[1] }, config);
    const translate = {
        [MSGID]: msgid,
        [MSGID_PLURAL]: msgidPlural,
        [MSGSTR]: [],
    };

    for (let i = 0; i < nplurals; i++) {
        translate[MSGSTR][i] = '';
    }

    return translate;
}

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

function resolveDefault(path, poData, config, state) {
    const { headers } = poData;
    const tagArg = path.node.arguments[path.node.arguments.length - 1];
    path.node.arguments[0] = path.node.arguments[0].quasi;
    const args = path.node.arguments.slice(0, -1).map((quasi) => {
        const quasiStr = getQuasiStr({ quasi });
        const dedentedStr = config.isDedent() ? dedentStr(quasiStr) : quasiStr;
        return tpl(strToQuasi(dedentedStr))().expression;
    });

    const nplurals = getNPlurals(headers);

    while (nplurals > args.length) {
        const last = args[args.length - 1];
        args.push(t.templateLiteral(last.quasis, last.expressions));
    }

    path.replaceWith(tpl('NGETTEXT(N, ARGS)')({
        NGETTEXT: getNgettextUID(state, getPluralFunc(headers)),
        N: tagArg,
        ARGS: t.arrayExpression(args),
    }));
}

function resolve(path, poData, config, state) {
    const { translations, headers } = poData;
    const { node } = path;
    const [msgidTag, ..._] = node.arguments.slice(0, -1);
    const msgid = getMsgid(msgidTag, config);
    const translationObj = translations[msgid];

    if (!translationObj) {
        throw new NoTranslationError(`No "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    if (!hasTranslations(translationObj)) {
        throw new NoTranslationError(`No translation for "${msgid}" in "${config.getPoFilePath()}" file`);
    }

    const args = translationObj[MSGSTR];
    const tagArg = node.arguments[node.arguments.length - 1];
    const exprs = msgidTag.quasi.expressions.map(ast2Str);

    if (t.isIdentifier(tagArg) || t.isMemberExpression(tagArg)) {
        return path.replaceWith(tpl('NGETTEXT(N, ARGS)')({
            NGETTEXT: getNgettextUID(state, getPluralFunc(headers)),
            N: tagArg,
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

export default { match, extract, resolve, name: NAME, validate, resolveDefault };
