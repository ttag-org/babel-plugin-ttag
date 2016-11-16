import * as t from 'babel-types';
import { getQuasiStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function extract(node, config) {
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

function match(node, config) {
    return (t.isTaggedTemplateExpression(node) &&
        node.tag.callee &&
        node.tag.callee.name === config.getAliasFor('ngettext'));
}

export default { match, extract };

