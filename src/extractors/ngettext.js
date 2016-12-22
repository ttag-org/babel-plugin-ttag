import * as t from 'babel-types';
import { PO_PRIMITIVES } from '../defaults';
import { dedentStr, template2Msgid } from '../utils';
import { getNPlurals } from '../po-helpers';
const NAME = 'ngettext';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function match({ node }, config) {
    return (t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === config.getAliasFor(NAME) &&
    node.arguments.length > 0);
}

function getMsgid(tag, config) {
    return config.isDedent() ? dedentStr(template2Msgid(tag)) : template2Msgid(tag);
}

function extract(path, config) {
    const tags = path.node.arguments.slice(0, -1);
    const msgid = getMsgid(tags[0], config);
    const nplurals = getNPlurals(config.getHeaders());
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

export default { match, extract, name: NAME };
