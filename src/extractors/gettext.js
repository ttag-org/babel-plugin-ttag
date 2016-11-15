import * as t from 'babel-types';
import { getQuasiStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function extract(node) {
    return {
        [MSGID]: getQuasiStr(node),
        [MSGSTR]: '',
    };
}

function match(node) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === 'gt';
}

export default { match, extract };
