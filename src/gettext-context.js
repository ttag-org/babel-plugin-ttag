import * as t from 'babel-types';


function isContextCall(node) {
    return (
    t.isTaggedTemplateExpression(node) &&
    t.isMemberExpression(node.tag) &&
    t.isCallExpression(node.tag.object) &&
    t.isIdentifier(node.tag.object.callee) &&
    node.tag.object.callee.name === 'c');
}


export function tryMatchContext(cb) {
    return (nodePath, state) => {
        const node = nodePath.node;
        if (isContextCall(node)) {
            nodePath._C3PO_GETTEXT_CONTEXT = node.tag.object.arguments[0].value;
            nodePath.node = t.taggedTemplateExpression(node.tag.property, node.quasi);
        }
        cb(nodePath, state);
    };
}
