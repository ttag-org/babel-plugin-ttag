import { expect } from 'chai';
import ngettext from 'src/extractors/ngettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Config from 'src/config';
const { MSGID, MSGID_PLURAL, MSGSTR } = PO_PRIMITIVES;

const enConfig = new Config();

describe('ngettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgplural ', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID_PLURAL]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgstr', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(2);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
    });

    it('should extract proper structure without expressions', () => {
        const node = template('nt(n)`banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        const expected = {
            msgid: 'banana',
            msgid_plural: 'banana',
            msgstr: ['', ''],
        };
        expect(result).to.eql(expected);
    });

    it('should throw if has invalid expressions', () => {
        const node = template('nt(n)`banana ${ n + 1}`')().expression;
        const fn = () => ngettext.extract({ node }, enConfig);
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });
});

describe('ngettext match', () => {
    it('should match ngettext', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });
    it('should not match ngettext', () => {
        const node = template('ntt(n)`${n} banana`')().expression;
        const result = ngettext.match({ node }, enConfig);
        expect(result).to.be.false;
    });
});
