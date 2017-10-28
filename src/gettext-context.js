import * as t from 'babel-types';
import { ast2Str } from './utils';

function isContextCall(node) {
    return (
    t.isTaggedTemplateExpression(node) &&
    t.isMemberExpression(node.tag) &&
    t.isCallExpression(node.tag.object) &&
    t.isIdentifier(node.tag.object.callee) &&
    node.tag.object.callee.name === 'c');
}

function isValidContext(nodePath) {
    const node = nodePath.node;
    const argsLength = node.tag.object.arguments.length;

    if (argsLength !== 1) {
        throw nodePath.buildCodeFrameError(`Context function accepts only 1 argument but has ${argsLength} instead.`);
    }

    const contextStr = node.tag.object.arguments[0];

    if (! t.isLiteral(contextStr)) {
        throw nodePath.buildCodeFrameError(`Expected string as a context argument. Actual - "${ast2Str(contextStr)}".`);
    }

    return true;
}

export function tryMatchContext(cb) {
    return (nodePath, state) => {
        const node = nodePath.node;
        if (isContextCall(node) && isValidContext(nodePath)) {
            nodePath._C3PO_GETTEXT_CONTEXT = node.tag.object.arguments[0].value;
            nodePath.node = t.taggedTemplateExpression(node.tag.property, node.quasi);
        }
        cb(nodePath, state);
    };
}
