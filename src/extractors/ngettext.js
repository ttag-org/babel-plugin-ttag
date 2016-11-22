import * as t from 'babel-types';
import { getQuasiStr, strToQuasi } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import template from 'babel-template';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function extract({ node }, config) {
    const nplurals = config.getNPlurals();
    const nodeStr = getQuasiStr(node);
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

function resolve(path, translationObj, config, state) {
    /* eslint-disable no-underscore-dangle */
    const { node } = path;
    const pluralForm = config.getPluralForm();

    // __ngettextUid is a secret flag for indicating wether ngettext was already declared.
    if (! state.file.__ngettextUid) {
        const uid = state.file.scope.generateUidIdentifier('ngettext');
        const ref = template(`
          function NGETTEXT(n, args) {
            var res = ${pluralForm};
            return args[(typeof res === 'boolean') ? (res && 1 || 0) : res];
          }`);
        state.file.path.unshiftContainer('body', ref({ NGETTEXT: uid }));
        state.file.__ngettextUid = uid;
    }

    const args = translationObj[MSGSTR];
    const resultFn = template('NGETTEXT(N, ARGS)');
    const nPlurals = node.tag.arguments[0].name;

    return path.replaceWith(resultFn(
        {
            NGETTEXT: state.file.__ngettextUid,
            N: t.identifier(nPlurals),
            ARGS: t.arrayExpression(args.map((l) => {
                const tliteral = template(strToQuasi(l))();
                return t.templateLiteral(tliteral.expression.quasis, tliteral.expression.expressions);
            })),
        }));
}

export default { match, extract, resolve };

