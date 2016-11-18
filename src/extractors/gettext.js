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
    let transStr = msgid;
    const hasExpressions = Boolean(node.quasi.expressions.length);
    const translationObj = translates[msgid];

    if (translationObj && translationObj[MSGSTR]) {
        transStr = translationObj[MSGSTR][0];
    }

    if (translationObj && hasExpressions) {
        path.replaceWithSourceString(strToQuasi(transStr));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }

}

export default { match, extract, resolve };
