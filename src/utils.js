import generate from 'babel-generator';
import { execSync } from 'child_process';

export function toArray(args) {
    return Array.isArray(args) ? args : [args];
}

export function getQuasiStr(node) {
    return generate(node.quasi).code.replace(/^`|`$/g, '');
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
