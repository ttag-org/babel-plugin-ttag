import * as t from 'babel-types';
import { getQuasiStr } from '../utils';
import { PO_PRIMITIVES } from '../defaults';
import * as babylon from 'babylon';

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

// function getRootScope(nodePath) {
//     return nodePath.parent ? getRootScope(nodePath.parent) : nodePath;
// }

function resolve(path, translationObj, config) {
    const { node } = path;
    const pluralForm = config.getPluralForm();
    // const id = path.scope.generateUidIdentifier('nt');
    // const pluralFn = babylon.parse(`const nt = (n) => {
    //     return ${pluralForm};
    // }`);
    const nPlurals = node.tag.arguments[0].name;

    return path;
}

export default { match, extract, resolve };

