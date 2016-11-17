import Rx from 'rxjs/Rx';
import generate from 'babel-generator';
import fs from 'fs';
const { Observable } = Rx;

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

const readFile$ = Observable.bindNodeCallback(fs.readFile);

export const readFileStr$ = (filepath) => readFile$(filepath).map((data) => data.toString());
