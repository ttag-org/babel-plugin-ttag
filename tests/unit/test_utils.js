import { expect } from 'chai';
import template from 'babel-template';
import { template2Msgid, msgid2Orig, isInDisabledScope,
    hasDisablingComment, dedentStr, getMsgid, poReferenceComparator,
    getMembersPath } from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';


describe('utils template2Msgid', () => {
    it('should extract msgid with expressions', () => {
        const node = template('nt(n)`${n} banana ${ b }`')().expression;
        const expected = '${ n } banana ${ b }';
        expect(template2Msgid(node)).to.eql(expected);
    });

    it('should extract msgid without expressions', () => {
        const node = template('t`banana`')().expression;
        const expected = 'banana';
        expect(template2Msgid(node)).to.eql(expected);
    });

    it('should extract msgid with this in expressions', () => {
        const node = template('t`${this.user.name} test`')().expression;
        const expected = '${ this.user.name } test';
        expect(template2Msgid(node)).to.eql(expected);
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

describe('utils msgid2Orig', () => {
    it('should extract original template with expressions', () => {
        const input = '${ a } banana ${ b }';
        const expected = '`${ a } banana ${ b }`';
        expect(msgid2Orig(input, ['a', 'b'])).to.eql(expected);
    });

    it('should throw if not all expressions exist in translated strings', () => {
        const input = '${ count } apples (translated)';
        const func = () => msgid2Orig(input, ['appleCount']);
        expect(func).to.throw(
            'NoExpressionError: Expression \'appleCount\' is not found in the localized string ' +
            '\'${ count } apples (translated)\'.'
        );
    })

    it.skip('should ignore left space inside expressions', () => {
        const input = '${0 } banana ${  1}';
        const expected = '`${ a } banana ${ b }`';
        expect(msgid2Orig(input, ['a', 'b'])).to.eql(expected);
    });

    it.skip('should ignore white spaces inside expressions', () => {
        const input = '${0} banana ${ 1    }';
        const expected = '`${ a } banana ${ b }`';
        expect(msgid2Orig(input, ['a', 'b'])).to.eql(expected);
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
        const expected = `some\nstring`;
        expect(dedentStr(input)).to.eql(expected);
    });
    it('should not remove indentation when has no \\n symbol', () => {
        const input = '   some';
        expect(dedentStr(input)).to.eql(input);
    });
});

function getStrsExprs(strs, ...exprs) {
    return [strs, exprs];
}

describe('utils getMsgid', () => {
    it('should extract msgid', () => {
        const a = 1;
        const [strs, exprs] = getStrsExprs`test ${a}`;
        expect(getMsgid(strs, exprs)).to.be.eql('test ${ 0 }');
    });

    it('should extract msgid with 0', () => {
        const a = 0;
        const [strs, exprs] = getStrsExprs`test ${a}`;
        expect(getMsgid(strs, exprs)).to.be.eql('test ${ 0 }');
    });
});

describe('utils poReferenceComparator', () => {
    it('# path/a.js should be less than # path/b.js', () => {
        expect(poReferenceComparator(
            '# path/a.js',
            '# path/b.js'
        )).to.be.eql(-1);
    });

    it('# path/b.js should be less than # path/a.js', () => {
        expect(poReferenceComparator(
            '# path/b.js',
            '# path/a.js'
        )).to.be.eql(1);
    });

    it('# path/a.js should be equal to # path/a.js', () => {
        expect(poReferenceComparator(
            '# path/a.js',
            '# path/a.js'
        )).to.be.eql(0);
    });

    it('# path/a.js:5 should be less than # path/a.js:10', () => {
        expect(poReferenceComparator(
            '# path/a.js:5',
            '# path/a.js:10'
        )).to.be.eql(-1);
    });

    it('# path/a.js:10 should be less than # path/a.js:5', () => {
        expect(poReferenceComparator(
            '# path/a.js:10',
            '# path/a.js:5'
        )).to.be.eql(1);
    });

    it('# path/a.js:10 should be less than # path/a.js:10', () => {
        expect(poReferenceComparator(
            '# path/a.js:10',
            '# path/a.js:10'
        )).to.be.eql(0);
    });
});
