import generate from 'babel-generator';
import { MODE, POLYGLOT_MODE_ENV } from './defaults';
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

export function isActiveMode() {
    const mode = process.env[POLYGLOT_MODE_ENV];
    return mode && mode.toString().toUpperCase() in MODE;
}

export function isExtractMode() {
    return process.env[POLYGLOT_MODE_ENV] === MODE.EXTRACT;
}

export function rmDirSync(path) {
    execSync(`rm -rf ${path}`);
}
