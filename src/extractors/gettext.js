import * as t from 'babel-types';
import { getQuasiStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function extract(path) {
    const { node } = path;
    return {
        [MSGID]: getQuasiStr(node),
        [MSGSTR]: '',
    };
}

function match(path, config) {
    const { node } = path;
    return t.isTaggedTemplateExpression(node) && node.tag.name === config.getAliasFor('gettext');
}

export default { match, extract };
