import generate from 'babel-generator';
import { execSync } from 'child_process';
import * as t from 'babel-types';
import { DISABLE_COMMENT, C3POID } from './defaults';

const disableRegExp = new RegExp(`\\b${DISABLE_COMMENT}\\b`);

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
const getMsgid = (str, exprs) => str.reduce((s, l, i) => s + l + (exprs[i] && `\${ ${i} }` || ''), '');


export const msgid2Orig = (msgid, exprs) => {
    return strToQuasi(exprs.reduce((r, expr, i) => r.replace(`\${ ${i} }`, `\${ ${expr} }`), msgid));
};

export function template2Msgid(node) {
    const strs = node.quasi.quasis.map(({ value: { raw } }) => raw);
    const exprs = node.quasi.expressions || [];
    if (exprs.length) {
        return getMsgid(strs, exprs);
    }
    return node.quasi.quasis[0].value.raw;
}

export function isValidQuasiExpression(expr) {
    return t.isIdentifier(expr) || t.isLiteral(expr) || t.isNumericLiteral(expr);
}

export function isInDisabledScope(node, disabledScopes) {
    let scope = node.scope;
    while (scope) {
        if (disabledScopes.has(scope.uid)) {
            return true;
        }
        scope = scope.parent;
    }
    return false;
}

export function hasDisablingComment(node) {
    if (!node.body || !node.body.length) {
        return false;
    }
    for (const { leadingComments } of node.body) {
        if (!leadingComments) {
            continue;
        }
        for (const { value } of leadingComments) {
            if (value.match(disableRegExp)) {
                return true;
            }
        }
    }
    return false;
}

export function isC3poImport(node) {
    return node.source.value === C3POID;
}

export function hasImportSpecifier(node) {
    return node.specifiers && node.specifiers.some(({ type }) => type === 'ImportSpecifier');
}
