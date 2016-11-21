import * as t from 'babel-types';
import { getQuasiStr, strToQuasi, hasExpressions } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

function extract({ node }) {
    return {
        [MSGID]: getQuasiStr(node),
        [MSGSTR]: '',
    };
}

function match({ node }, config) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === config.getAliasFor('gettext');
}

function resolve(path, translationObj) {
    const { node } = path;
    const transStr = translationObj[MSGSTR][0];

    if (hasExpressions(node)) {
        path.replaceWithSourceString(strToQuasi(transStr));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve };
