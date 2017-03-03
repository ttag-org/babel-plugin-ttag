import generate from 'babel-generator';
import { execSync } from 'child_process';
import * as t from 'babel-types';
import { DISABLE_COMMENT, C3POID } from './defaults';
import dedent from 'dedent';

const disableRegExp = new RegExp(`\\b${DISABLE_COMMENT}\\b`);

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

export const getMsgid = (str, exprs) => {
    return str.reduce((s, l, i) => s + l + (exprs[i] !== undefined && `\${ ${i} }` || ''), '');
};

const mem = {};
const memoize1 = (f) => (arg) => {
    if (mem[arg]) {
        return mem[arg];
    }
    mem[arg] = f(arg);
    return mem[arg];
};

const reg = (i) => new RegExp(`\\$\\{([\\s]+?|\\s?)${i}([\\s]+?|\\s?)}`);
const memReg = memoize1(reg);

export const msgid2Orig = (msgid, exprs) => {
    return strToQuasi(exprs.reduce((r, expr, i) => r.replace(memReg(i), `\${ ${expr} }`), msgid));
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
    return t.isIdentifier(expr) || t.isLiteral(expr) || t.isNumericLiteral(expr) || t.isMemberExpression(expr);
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

export function dedentStr(str) {
    if (str.match(/\n/) !== null) {
        return dedent(str);
    }
    return str;
}
