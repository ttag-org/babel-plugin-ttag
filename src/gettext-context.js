import * as t from 'babel-types';
import { ast2Str } from './utils';

export function isContextTagCall(node, context) {
    return (
    t.isTaggedTemplateExpression(node) &&
    t.isMemberExpression(node.tag) &&
    t.isCallExpression(node.tag.object) &&
    t.isIdentifier(node.tag.object.callee) &&
    node.tag.object.callee.name === context.getAliasFor('context'));
}

export function isContextFnCall(node, context) {
    return (
        t.isCallExpression(node) &&
        t.isMemberExpression(node.callee) &&
        t.isCallExpression(node.callee.object) &&
        t.isIdentifier(node.callee.object.callee) &&
        node.callee.object.callee.name === context.getAliasFor('context')
    );
}

export function isValidFnCallContext(nodePath) {
    const node = nodePath.node;
    const argsLength = node.callee.object.arguments.length;

    if (argsLength !== 1) {
        throw nodePath.buildCodeFrameError(`Context function accepts only 1 argument but has ${argsLength} instead.`);
    }

    const contextStr = node.callee.object.arguments[0];

    if (!t.isLiteral(contextStr)) {
        throw nodePath.buildCodeFrameError(`Expected string as a context argument. Actual - "${ast2Str(contextStr)}".`);
    }

    return true;
}

export function isValidTagContext(nodePath) {
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
