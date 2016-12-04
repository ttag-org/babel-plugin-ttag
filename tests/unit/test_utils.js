import { expect } from 'chai';
import template from 'babel-template';
import { template2Msgid, msgid2Orig, isInDisabledScope,
    hasDisablingComment } from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';


describe('utils template2Msgid', () => {
    it('should extract msgid with expressions', () => {
        const node = template('nt(n)`${n} banana ${ b }`')().expression;
        const expected = '${ 0 } banana ${ 1 }';
        expect(template2Msgid(node)).to.eql(expected);
    });

    it('should extract msgid with expressions', () => {
        const node = template('t`banana`')().expression;
        const expected = 'banana';
        expect(template2Msgid(node)).to.eql(expected);
    });
});

describe('utils msgid2Orig', () => {
    it('should extract original template with expressions', () => {
        const input = '${ 0 } banana ${ 1 }';
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
});
