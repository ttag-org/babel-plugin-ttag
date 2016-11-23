import * as t from 'babel-types';
import { strToQuasi, getQuasiStr, stripTag } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import template from 'babel-template';
import { hasTranslations } from '../po-helpers';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function getMsgid(node) {
    return getQuasiStr(node);
}

function extract({ node }, config) {
    const nplurals = config.getNPlurals();
    const nodeStr = getMsgid(node);
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

function getNgettextUID(state, config) {
    /* eslint-disable no-underscore-dangle */
    if (! state.file.__ngettextUid) {
        const uid = state.file.scope.generateUidIdentifier('ngettext');
        state.file.path.unshiftContainer('body',
            ngettextTemplate(uid, config.getPluralForm()));
        state.file.__ngettextUid = uid;
    }
    return state.file.__ngettextUid;
}

function resolve(path, translations, config, state) {
    /* eslint-disable no-underscore-dangle */
    // TODO: handle when has no node argument.

    const { node } = path;
    const msgid = getMsgid(node);
    const translationObj = translations[msgid];

    if (!translationObj) {
        stripTag(path);
        return path;
    }

    if (!hasTranslations(translationObj)) {
        stripTag(path);
        return path;
    }

    const args = translations[msgid][MSGSTR];
    const tagArg = node.tag.arguments[0];
    const nPlurals = tagArg.type === 'Identifier' ? tagArg.name : tagArg.value;

    return path.replaceWith(template('NGETTEXT(N, ARGS)')(
        {
            NGETTEXT: getNgettextUID(state, config),
            N: t.identifier(nPlurals),
            ARGS: t.arrayExpression(args.map((l) => {
                const tliteral = template(strToQuasi(l))();
                return t.templateLiteral(
                    tliteral.expression.quasis,
                    tliteral.expression.expressions);
            })),
        }));
}

export default { match, extract, resolve };

