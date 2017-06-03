import generate from 'babel-generator';
import { execSync } from 'child_process';
import * as t from 'babel-types';
import { DISABLE_COMMENT, C3POID } from './defaults';
import dedent from 'dedent';
import { ValidationError, NoExpressionError } from './errors';

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

export function getMembersPath({ object, computed, property }) {
    /* eslint-disable no-use-before-define */
    const obj = t.isMemberExpression(object) ? getMembersPath(object) : expr2str(object);

    return computed ? `${obj}[${expr2str(property)}]` : `${obj}.${property.name}`;
}

function expr2str(expr) {
    let str;
    if (t.isIdentifier(expr)) {
        str = expr.name;
    } else if (t.isMemberExpression(expr)) {
        str = getMembersPath(expr);
    } else if (t.isNumericLiteral(expr)) {
        str = expr.value;
    } else if (t.isStringLiteral(expr)) {
        str = expr.extra.raw;
    } else if (t.isThisExpression(expr)) {
        str = 'this';
    } else {
        throw new ValidationError(`You can not use ${expr.type} '\${${ast2Str(expr)}}' in localized strings`);
    }

    return str;
}

export const getMsgid = (str, exprs) => str.reduce((s, l, i) => {
    const expr = exprs[i];
    return (expr === undefined) ? s + l : `${s}${l}\${ ${expr2str(expr)} }`;
}, '');

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
    exprs.forEach((expr) => {
        if (!msgid.match(memReg(expr))) {
            throw new NoExpressionError(`Expression '${expr}' is not found in the localized string '${msgid}'.`);
        }
    });

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

export function poReferenceComparator(firstPoRef, secondPoRef) {
    if (/.*:\d+$/.test(firstPoRef)) {
        // reference has a form path/to/file.js:line_number
        const firstIdx = firstPoRef.lastIndexOf(':');
        const firstFileRef = firstPoRef.substring(0, firstIdx);
        const firstLineNum = Number(firstPoRef.substring(firstIdx + 1));
        const secondIdx = secondPoRef.lastIndexOf(':');
        const secondFileRef = secondPoRef.substring(0, secondIdx);
        const secondLineNum = Number(secondPoRef.substring(secondIdx + 1));
        if (firstFileRef !== secondFileRef) {
            if (firstFileRef < secondFileRef) {
                return -1;
            }
            return 1;
        }
        // else
        if (firstLineNum < secondLineNum) {
            return -1;
        } else if (firstLineNum > secondLineNum) {
            return 1;
        }
        return 0;
    }
    // else
    // reference has a form path/to/file.js
    if (firstPoRef < secondPoRef) {
        return -1;
    } else if (firstPoRef > secondPoRef) {
        return 1;
    }
    return 0;
}
