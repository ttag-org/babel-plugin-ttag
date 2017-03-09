import { expect } from 'chai';
import ngettext from 'src/extractors/tag-ngettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Context from 'src/context';
const { MSGID, MSGID_PLURAL, MSGSTR } = PO_PRIMITIVES;

const enConfig = new Context();

describe('tag-ngettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgplural ', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID_PLURAL]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgstr', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.extract(node, enConfig);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(2);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
    });

    it('should extract proper structure without expressions', () => {
        const node = template('nt(n)`banana`')().expression;
        const result = ngettext.extract(node, enConfig);
        const expected = {
            msgid: 'banana',
            msgid_plural: 'banana',
            msgstr: ['', ''],
        };
        expect(result).to.eql(expected);
    });

    it('should dedent extracted text', () => {
        const node = template(`nt(n)\`
            first
            second
            third
            \``)().expression;
        const expected = 'first\nsecond\nthird';
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql(expected);
    });
});

describe('tag-ngettext validate', () => {
    it('should throw if has invalid expressions', () => {
        const node = template('nt(n)`banana ${ n + 1}`')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should not throw if member expression', () => {
        const node = template('nt(this.props.number)`banana ${this.props.number}`')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.not.throw();
    });

    it('should throw if plural number is invalid', () => {
        const node = template('nt(n + 1)`banana`')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('BinaryExpression \'n + 1\' can not be used as plural number argument');
    });
    it('should throw if translation string is an empty string', () => {
        const node = template('nt(n)``')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'\'');
    });
    it('should throw if has no meaningful information', () => {
        const node = template('nt(n)`${name} ${n} `')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'${ name } ${ n } \'');
    });
});

describe('tag-ngettext match', () => {
    it('should match ngettext', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const result = ngettext.match(node, enConfig);
        expect(result).to.be.true;
    });
    it('should not match ngettext', () => {
        const node = template('ntt(n)`${n} banana`')().expression;
        const result = ngettext.match(node, enConfig);
        expect(result).to.be.false;
    });
});
