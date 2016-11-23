import * as t from 'babel-types';
import { getQuasiStr, strToQuasi, hasExpressions, stripTag } from '../utils';
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

function resolveDefault(nodePath) {
    return stripTag(nodePath);
}

function resolve(path, translations) {
    const { node } = path;
    const translationObj = translations[getQuasiStr(node)];
    if (!translationObj) {
        resolveDefault(path);
        return;
    }
    const transStr = translationObj[MSGSTR][0];
    if (!transStr.length) {
        resolveDefault(path);
        return;
    }

    if (hasExpressions(node)) {
        path.replaceWithSourceString(strToQuasi(transStr));
    } else {
        path.replaceWith(t.stringLiteral(transStr));
    }
}

export default { match, extract, resolve, resolveDefault };
