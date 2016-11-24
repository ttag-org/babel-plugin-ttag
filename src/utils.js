import generate from 'babel-generator';
import { execSync } from 'child_process';
import * as t from 'babel-types';

export function toArray(args) {
    return Array.isArray(args) ? args : [args];
}

export function quasiToStr(str) {
    return str.replace(/^`|`$/g, '');
}

export function getQuasiStr(node) {
    return quasiToStr(generate(node.quasi).code);
}

export function ast2Str(ast) {
    return generate(ast).code;
}

export function strToQuasi(str) {
    return `\`${str}\``;
}

export function unescapeUnicode(str) {
    const r = /\\u([\d\w]{4})/gi;
    return str.replace(r, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
}

export function rmDirSync(path) {
    execSync(`rm -rf ${path}`);
}

export function hasExpressions(node) {
    return Boolean(node.quasi.expressions.length);
}

export function stripTag(nodePath) {
    const { node } = nodePath;
    const transStr = getQuasiStr(node);

    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
}

// TODO: move this to polyglot.js lib
const msgid = (str, expr) => str.reduce((s, l, i) => s + l + (expr[i] && `\${ ${i} }` || ''), '');

export function template2Msgid(node) {
    const strs = node.quasi.quasis.map(({ value: { raw } }) => raw);
    const exprs = node.quasi.expressions || [];
    if (exprs.length) {
        return msgid(strs, exprs);
    }
    return node.quasi.quasis[0].value.raw;
}
