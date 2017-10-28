import * as t from 'babel-types';
import { ast2Str } from './utils';

export function isContextCall(node, context) {
    return (
    t.isTaggedTemplateExpression(node) &&
    t.isMemberExpression(node.tag) &&
    t.isCallExpression(node.tag.object) &&
    t.isIdentifier(node.tag.object.callee) &&
    node.tag.object.callee.name === context.getAliasFor('context'));
}

export function isValidContext(nodePath) {
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
