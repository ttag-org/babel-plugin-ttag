import * as t from 'babel-types';
import { stripTag, template2Msgid, msgid2Orig } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import template from 'babel-template';
import { hasTranslations, getPluralFunc } from '../po-helpers';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function extract({ node }, config) {
    const nplurals = config.getNPlurals();
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

function ngettextTemplate(ngettext, pluralForm) {
    return template(`
          function NGETTEXT(n, args) {
            var res = ${pluralForm};
            return args[(typeof res === 'boolean') ? (res && 1 || 0) : res];
          }`)({ NGETTEXT: ngettext });
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

function resolve(path, poData, config, state) {
    /* eslint-disable no-underscore-dangle */
    // TODO: handle when has no node argument.
    const { translations, headers } = poData;
    const { node } = path;
    const msgid = template2Msgid(node);
    const translationObj = translations[msgid];

    if (!translationObj || translationObj && !hasTranslations(translationObj)) {
        stripTag(path);
        return path;
    }

    const args = translations[msgid][MSGSTR];
    const tagArg = node.tag.arguments[0];
    const nPlurals = tagArg.type === 'Identifier' ? tagArg.name : tagArg.value;
    const exprs = node.quasi.expressions.map(({ name }) => name);

    return path.replaceWith(template('NGETTEXT(N, ARGS)')(
        {
            NGETTEXT: getNgettextUID(state, getPluralFunc(headers)),
            N: t.identifier(nPlurals),
            ARGS: t.arrayExpression(args.map((l) => {
                const { expression: { quasis, expressions } } = template(msgid2Orig(l, exprs))();
                return t.templateLiteral(quasis, expressions);
            })),
        }));
}

export default { match, extract, resolve };

