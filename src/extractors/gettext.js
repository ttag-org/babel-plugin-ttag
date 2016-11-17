import * as t from 'babel-types';
import { getQuasiStr, strToQuasi } from '../utils';
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

function resolve(path, translates) {
    const { node } = path;
    const msgid = getQuasiStr(node);
    const translation = translates[msgid];
    if (translation) {
        path.replaceWithSourceString(strToQuasi(translation[MSGSTR] || translation[MSGID]));
    }
}

export default { match, extract, resolve };
