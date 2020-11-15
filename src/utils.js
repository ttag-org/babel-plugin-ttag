import { execSync } from 'child_process';
import * as bt from '@babel/types';
import dedent from 'dedent';
import generate from '@babel/generator';
import tpl from '@babel/template';

import {
    DISABLE_COMMENT, TTAGID, TTAG_MACRO_ID, INTERNAL_TTAG_MACRO_ID,
} from './defaults';
import { ValidationError, NoExpressionError } from './errors';

const disableRegExp = new RegExp(`\\b${DISABLE_COMMENT}\\b`);

const exprReg = /\$\{\s?[\w\W]+?\s}/g;

export function strHasExpr(str) {
    return exprReg.test(str);
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

export function rmDirSync(path) {
    execSync(`rm -rf ${path}`);
}

export function hasExpressions(node) {
    return Boolean(node.quasi.expressions.length);
}

export function getMembersPath({ object, computed, property }) {
    /* eslint-disable no-use-before-define */
    const obj = bt.isMemberExpression(object) ? getMembersPath(object) : expr2str(object);

    return computed ? `${obj}[${expr2str(property)}]` : `${obj}.${property.name}`;
}

function expr2str(expr) {
    let str;
    if (bt.isIdentifier(expr)) {
        str = expr.name;
    } else if (bt.isMemberExpression(expr)) {
        str = getMembersPath(expr);
    } else if (bt.isNumericLiteral(expr)) {
        str = expr.value;
    } else if (bt.isStringLiteral(expr)) {
        str = expr.extra.raw;
    } else if (bt.isThisExpression(expr)) {
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

export const getMsgidNumbered = (str, exprs) => str.reduce((s, l, i) => {
    const expr = exprs[i];
    return (expr === undefined) ? s + l : `${s}${l}\${ ${i} }`;
}, '');

export const validateAndFormatMsgid = (msgid, exprNames) => {
    const msgidAST = tpl.ast(strToQuasi(msgid));
    const msgidExprs = new Set(msgidAST.expression.expressions.map(ast2Str));
    exprNames.forEach((exprName) => {
        if (!msgidExprs.has(exprName)) {
            throw new NoExpressionError(`Expression '${exprName}' is not found in the localized string '${msgid}'.`);
        }
    });

    // need to regenerate template to fix spaces between in ${}
    // because translator can accidentally add extra space or remove
    return generate(msgidAST).code.replace(/;$/, '');
};

export function template2Msgid(node, context) {
    const strs = node.quasi.quasis.map(({ value: { cooked } }) => cooked);
    const exprs = node.quasi.expressions || [];

    if (exprs.length) {
        return context.isNumberedExpressions()
            ? getMsgidNumbered(strs, exprs)
            : getMsgid(strs, exprs);
    }
    return node.quasi.quasis[0].value.cooked;
}

export function isInDisabledScope(node, disabledScopes) {
    let { scope } = node;
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

export function isTtagImport(node) {
    return node.source.value === TTAGID
        || node.source.value === TTAG_MACRO_ID
        || node.source.value === INTERNAL_TTAG_MACRO_ID;
}

export function isTtagRequire(node) {
    return bt.isCallExpression(node.init)
        && node.init.callee.name === 'require'
        && bt.isObjectPattern(node.id)
        && node.init.arguments.length === 1
        && (node.init.arguments[0].value === TTAGID
            || node.init.arguments[0].value === TTAG_MACRO_ID
            || node.init.arguments[0].value === INTERNAL_TTAG_MACRO_ID);
}

export function hasImportSpecifier(node) {
    return node.specifiers && node.specifiers.some(bt.isImportSpecifier);
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
        } if (firstLineNum > secondLineNum) {
            return 1;
        }
        return 0;
    }
    // else
    // reference has a form path/to/file.js
    if (firstPoRef < secondPoRef) {
        return -1;
    } if (firstPoRef > secondPoRef) {
        return 1;
    }
    return 0;
}

export function createFnStub(name) {
    return tpl('function NAME(){}')({ NAME: name });
}
