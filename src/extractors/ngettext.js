import * as t from '@babel/types';
import tpl from '@babel/template';
import { PO_PRIMITIVES } from '../defaults';
import {
    dedentStr, template2Msgid, ast2Str, validateAndFormatMsgid, getQuasiStr, strToQuasi,
} from '../utils';
import { pluralFnBody, makePluralFunc, hasUsefulInfo } from '../po-helpers';
import { ValidationError } from '../errors';

const NAME = 'ngettext';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function getMsgid(node, context) {
    const [msgidTag, ..._] = node.arguments.slice(0, -1);
    return template2Msgid(msgidTag, context);
}

function validateNPlural(exp) {
    if (!t.isIdentifier(exp) && !t.isNumericLiteral(exp) && !t.isMemberExpression(exp)) {
        throw new ValidationError(`${exp.type} '${ast2Str(exp)}' can not be used as plural argument`);
    }
}

const validate = (node, context) => {
    const msgidTag = node.arguments[0];
    const msgidAliases = context.getAliasesForFunc('msgid');
    if (!t.isTaggedTemplateExpression(msgidTag)) {
        throw new ValidationError(
            msgidAliases.length > 1
                ? `First argument must be tagged template expression. You should use one of '${msgidAliases}' tag`
                : `First argument must be tagged template expression. You should use '${msgidAliases[0]}' tag`,
        );
    }
    if (!context.hasAliasForFunc('msgid', msgidTag.tag.name)) {
        throw new ValidationError(
            msgidAliases.length > 1
                ? `Expected one of '${msgidAliases}' for the first argument but not '${msgidTag.tag.name}'`
                : `Expected '${msgidAliases[0]}' for the first argument but not '${msgidTag.tag.name}'`,
        );
    }
    const tags = node.arguments.slice(1, -1);

    // will throw validation error if tags has expressions with wrong format
    tags.forEach((quasi) => template2Msgid({ quasi }, context));

    if (!context.isNumberedExpressions()) {
        validateNPlural(node.arguments[node.arguments.length - 1]);
    }
    const msgid = template2Msgid(msgidTag, context);
    if (!hasUsefulInfo(msgid)) {
        throw new ValidationError(`Can not translate '${getQuasiStr(msgidTag)}'`);
    }
};

function match(node, context) {
    return (t.isCallExpression(node)
    && t.isIdentifier(node.callee)
    && context.hasAliasForFunc(NAME, node.callee.name)
    && node.arguments.length > 0
    && t.isTaggedTemplateExpression(node.arguments[0]));
}

function extract(node, context) {
    const tags = node.arguments.slice(0, -1);
    const msgid = context.isDedent()
        ? dedentStr(template2Msgid(tags[0], context))
        : template2Msgid(tags[0], context);
    const nplurals = context.getPluralsCount();
    if (tags.length !== nplurals) {
        throw new ValidationError(`Expected to have ${nplurals} plural forms but have ${tags.length} instead`);
    }
    // TODO: handle case when only 1 plural form
    const msgidPlural = context.isDedent()
        ? dedentStr(template2Msgid({ quasi: tags[1] }, context))
        : template2Msgid({ quasi: tags[1] }, context);
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
    if (!state.file.__ngettextUid) {
        const uid = state.file.scope.generateUidIdentifier('tag_ngettext');
        state.file.path.unshiftContainer('body',
            ngettextTemplate(uid, pluralFunc));
        state.file.__ngettextUid = uid;
    }
    return state.file.__ngettextUid;
}

function resolveDefault(node, context, state) {
    const tagArg = node.arguments[node.arguments.length - 1];
    node.arguments[0] = node.arguments[0].quasi;
    const args = node.arguments.slice(0, -1).map((quasi) => {
        const quasiStr = getQuasiStr({ quasi });
        const dedentedStr = context.isDedent() ? dedentStr(quasiStr) : quasiStr;
        return tpl.ast(strToQuasi(dedentedStr)).expression;
    });

    const nplurals = context.getPluralsCount();

    while (nplurals > args.length) {
        const last = args[args.length - 1];
        args.push(t.templateLiteral(last.quasis, last.expressions));
    }

    return tpl('NGETTEXT(N, ARGS)')({
        NGETTEXT: getNgettextUID(state, context.getPluralFormula()),
        N: tagArg,
        ARGS: t.arrayExpression(args),
    });
}

function resolve(node, translationObj, context, state) {
    const [msgidTag, ..._] = node.arguments.slice(0, -1);

    const args = translationObj[MSGSTR];
    const tagArg = node.arguments[node.arguments.length - 1];
    const exprs = msgidTag.quasi.expressions.map(ast2Str);

    if (t.isLiteral(tagArg)) {
        const pluralFn = makePluralFunc(context.getPluralFormula());
        const orig = validateAndFormatMsgid(pluralFn(tagArg.value, args), exprs);
        return tpl.ast(orig);
    }

    return tpl('NGETTEXT(N, ARGS)')({
        NGETTEXT: getNgettextUID(state, context.getPluralFormula()),
        N: tagArg,
        ARGS: t.arrayExpression(args.map((l) => {
            let quasis;
            let expressions;
            if (context.isNumberedExpressions()) {
                const transNode = tpl.ast(strToQuasi(l));
                quasis = transNode.expression.quasis;
                expressions = transNode.expression.expressions
                    .map(({ value }) => value)
                    .map((i) => msgidTag.quasi.expressions[i]);
            } else {
                const transNode = tpl.ast(validateAndFormatMsgid(l, exprs));
                quasis = transNode.expression.quasis;
                expressions = transNode.expression.expressions;
            }
            return t.templateLiteral(quasis, expressions);
        })),
    });
}

export default {
    match, extract, resolve, name: NAME, validate, resolveDefault, getMsgid,
};
