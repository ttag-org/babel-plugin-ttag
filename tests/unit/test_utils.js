import { expect } from 'chai';
import template from '@babel/template';
import {
    template2Msgid, validateAndFormatMsgid, isInDisabledScope,
    hasDisablingComment, dedentStr, getMsgid, poReferenceComparator,
    getMembersPath, getMsgidNumbered, strHasExpr,
} from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';
import C3poContext from 'src/context';

const testContext = new C3poContext({});

describe('utils template2Msgid', () => {
    it('should extract msgid with expressions', () => {
        const node = template('nt(n)`${n} banana ${ b }`')().expression;
        const expected = '${ n } banana ${ b }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid without expressions', () => {
        const node = template('t`banana`')().expression;
        const expected = 'banana';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid with this in expressions', () => {
        const node = template('t`${this.user.name} test`')().expression;
        const expected = '${ this.user.name } test';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid from a computed properties', () => {
        const node = template('t`${ arr[0].name }`')().expression;
        const expected = '${ arr[0].name }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid from a computed properties with string literals', () => {
        const node = template('t`${ arr["test"].name }`')().expression;
        const expected = '${ arr["test"].name }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid from a computed properties with member expressions', () => {
        const node = template('t`${ arr[this.user.id].name }`')().expression;
        const expected = '${ arr[this.user.id].name }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should throw if has not supported expression type in computed properties', () => {
        const node = template('t`${ arr[fn()].name }`')().expression;
        const fn = () => template2Msgid(node, testContext);
        expect(fn).to.throw('You can not use CallExpression \'${fn()}\' in localized strings');
    });

    it('should extract msgid with a numeric literal', () => {
        const node = template('t`${ 1 }`')().expression;
        const expected = '${ 1 }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid with a string literal', () => {
        const node = template('t`${ "test" }`')().expression;
        const expected = '${ "test" }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract msgid with this', () => {
        const node = template('t`${ this }`')().expression;
        const expected = '${ this }';
        expect(template2Msgid(node, testContext)).to.eql(expected);
    });

    it('should extract numbered expressions if numberedExpressions: true', () => {
        const node = template('t`Hello ${ name } ${ surname}`')().expression;
        const expected = 'Hello ${ 0 } ${ 1 }';
        const ctx = new C3poContext({ numberedExpressions: true });
        expect(template2Msgid(node, ctx)).to.eql(expected);
    });
});

describe('utils getMembersPath', () => {
    it('should get members path', () => {
        const node = template('user.name')().expression;
        const mPath = getMembersPath(node);
        expect(mPath).to.eql('user.name');
    });

    it('should get members path with "this"', () => {
        const node = template('this.user.name')().expression;
        const mPath = getMembersPath(node);
        expect(mPath).to.eql('this.user.name');
    });
});

describe('utils validateAndFormatMsgid', () => {
    it('should extract original template with expressions', () => {
        const input = '${a} banana ${b}';
        const expected = '`${a} banana ${b}`';
        expect(validateAndFormatMsgid(input, ['a', 'b'])).to.eql(expected);
    });

    it('should throw if not all expressions exist in translated strings', () => {
        const input = '${count} apples (translated)';
        const func = () => validateAndFormatMsgid(input, ['appleCount']);
        expect(func).to.throw(
            'NoExpressionError: Expression \'appleCount\' is not found in the localized string '
            + '\'${count} apples (translated)\'.',
        );
    });

    it('should ignore left space inside expressions', () => {
        const input = '${a } banana ${  b}';
        const expected = '`${a} banana ${b}`';
        expect(validateAndFormatMsgid(input, ['a', 'b'])).to.eql(expected);
    });

    it('should ignore white spaces inside expressions', () => {
        const input = '${a} banana ${ b    }';
        const expected = '`${a} banana ${b}`';
        expect(validateAndFormatMsgid(input, ['a', 'b'])).to.eql(expected);
    });

    it('should support computed properties', () => {
        const input = '${ a[value] } banana ${ b[value] }';
        const expected = '`${a[value]} banana ${b[value]}`';
        expect(validateAndFormatMsgid(input, ['a[value]', 'b[value]'])).to.eql(expected);
    });

    it('should throw if not all expressions exist in translated strings', () => {
        const input = '${ fooxbar } apples (translated)';
        const func = () => validateAndFormatMsgid(input, ['foo.bar']);
        expect(func).to.throw(
            'NoExpressionError: Expression \'foo.bar\' is not found in the localized string '
            + '\'${ fooxbar } apples (translated)\'.',
        );
    });

    it('should support [] in computed properties', () => {
        const input = "${ a[value[3]] } banana ${ b['[key]'] }";
        const expected = "`${a[value[3]]} banana ${b['[key]']}`";
        expect(validateAndFormatMsgid(input, ['a[value[3]]', "b['[key]']"])).to.eql(expected);
    });

    it('should support string in computed properties', () => {
        const input = "${ a['^[a]$'] } banana";
        const expected = "`${a['^[a]$']} banana`";
        expect(validateAndFormatMsgid(input, ["a['^[a]$']"])).to.eql(expected);
    });

    it('should support template strings in computed properties', () => {
        const input = '${ a[`foo-${ value }`] } banana';
        const expected = '`${a[`foo-${value}`]} banana`';
        expect(validateAndFormatMsgid(input, ['a[`foo-${value}`]'])).to.eql(expected);
    });
});

describe('utils isInDisabledScope', () => {
    it('should return true for disabled scope', () => {
        const disabledScopes = new Set([1, 2, 3]);
        const mockNode = { scope: { uid: 1 } };
        expect(isInDisabledScope(mockNode, disabledScopes)).to.be.true;
    });
    it('should return true if has disabled parent scope', () => {
        const disabledScopes = new Set([1, 2, 3]);
        const parentMock = { uid: 1 };
        const mockNode = { scope: { uid: 4, parent: parentMock } };
        expect(isInDisabledScope(mockNode, disabledScopes)).to.be.true;
    });
    it('should return false if has no disabled scopes in chain', () => {
        const disabledScopes = new Set([1, 2, 3]);
        const parentMock = { uid: 5 };
        const mockNode = { scope: { uid: 4, parent: parentMock } };
        expect(isInDisabledScope(mockNode, disabledScopes)).to.be.false;
    });
});

describe('utils hasDisablingComment', () => {
    it('should return true for node that has matched comment', () => {
        const nodeMock = { body: [{ leadingComments: [{ value: `   ${DISABLE_COMMENT} ` }] }] };
        expect(hasDisablingComment(nodeMock)).to.be.true;
    });
    it('should return false for node that has no matched comment', () => {
        const nodeMock = { body: [{ leadingComments: [{ value: `   ${DISABLE_COMMENT}2 ` }] }] };
        expect(hasDisablingComment(nodeMock)).to.be.false;
    });
    it('should return false if node.body has no nodes', () => {
        const nodeMock = { body: [] };
        expect(hasDisablingComment(nodeMock)).to.be.false;
    });
});

describe('utils dedentStr', () => {
    it('should remove indentation when has \\n symbol', () => {
        const input = `   some
                      string`;
        const expected = 'some\nstring';
        expect(dedentStr(input)).to.eql(expected);
    });
    it('should not remove indentation when has no \\n symbol', () => {
        const input = '   some';
        expect(dedentStr(input)).to.eql(input);
    });
});

function getStrsExprs(node) {
    const strs = node.quasis.map(({ value: { cooked } }) => cooked);
    const exprs = node.expressions;
    return [strs, exprs];
}

describe('utils getMsgid', () => {
    it('should extract msgid with expressions', () => {
        const node = template('`test ${ a }`')().expression;
        const [strs, exprs] = getStrsExprs(node);
        expect(getMsgid(strs, exprs)).to.be.eql('test ${ a }');
    });
    it('should extract msgid without expressions', () => {
        const node = template('`test`')().expression;
        const [strs, exprs] = getStrsExprs(node);
        expect(getMsgid(strs, exprs)).to.be.eql('test');
    });
});

describe('utils strHasExpr', () => {
    it('should return true if has expressions', () => {
        const str = 'test match ${ a } and ${ b[0].name }';
        expect(strHasExpr(str)).to.be.true;
    });
    it('should return false if has no expressions', () => {
        const str = 'test no match';
        expect(strHasExpr(str)).to.be.false;
    });
});

describe('utils getMsgidNumbered', () => {
    it('should extract msgid with expressions', () => {
        const node = template('`test ${ a } ${ b }`')().expression;
        const [strs, exprs] = getStrsExprs(node);
        expect(getMsgidNumbered(strs, exprs)).to.be.eql('test ${ 0 } ${ 1 }');
    });
    it('should extract msgid without expressions', () => {
        const node = template('`test`')().expression;
        const [strs, exprs] = getStrsExprs(node);
        expect(getMsgidNumbered(strs, exprs)).to.be.eql('test');
    });
});

describe('utils poReferenceComparator', () => {
    it('# path/a.js should be less than # path/b.js', () => {
        expect(poReferenceComparator(
            '# path/a.js',
            '# path/b.js',
        )).to.be.eql(-1);
    });

    it('# path/b.js should be less than # path/a.js', () => {
        expect(poReferenceComparator(
            '# path/b.js',
            '# path/a.js',
        )).to.be.eql(1);
    });

    it('# path/a.js should be equal to # path/a.js', () => {
        expect(poReferenceComparator(
            '# path/a.js',
            '# path/a.js',
        )).to.be.eql(0);
    });

    it('# path/a.js:5 should be less than # path/a.js:10', () => {
        expect(poReferenceComparator(
            '# path/a.js:5',
            '# path/a.js:10',
        )).to.be.eql(-1);
    });

    it('# path/a.js:10 should be less than # path/a.js:5', () => {
        expect(poReferenceComparator(
            '# path/a.js:10',
            '# path/a.js:5',
        )).to.be.eql(1);
    });

    it('# path/a.js:10 should be less than # path/a.js:10', () => {
        expect(poReferenceComparator(
            '# path/a.js:10',
            '# path/a.js:10',
        )).to.be.eql(0);
    });
});
