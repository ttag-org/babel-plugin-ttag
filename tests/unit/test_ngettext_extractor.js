import template from '@babel/template';
import ngettext from 'src/extractors/ngettext';
import Context from 'src/context';
import { expect } from 'chai';
import { PO_PRIMITIVES } from 'src/defaults';

const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

const enConfig = new Context();

describe('ngettext extract', () => {
    it('should extract proper msgid1', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql('${ n } banana');
    });

    it('should extract proper msgid1 for member expressions', () => {
        const node = template('ngettext(msgid`${ state.n } banana`, `${ state.n } bananas`, state.n)')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql('${ state.n } banana');
    });

    it('should extract proper msgid1 for member expressions with this', () => {
        const node = template('ngettext(msgid`${ this.state.n } banana`, `${ this.state.n } bananas`, this.state.n)')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql('${ this.state.n } banana');
    });

    it('should extract proper msgidplural', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID_PLURAL]).to.eql('${ n } bananas');
    });

    it('should extract proper msgstr', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract(node, enConfig);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(2);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
    });

    it('should extract valid number of msgstrs', () => {
        const config = new Context({ defaultLang: 'uk' });
        const node = template('ngettext(msgid`${ n } банан`, `${ n } банана`, `бананів`, n)')().expression;
        const result = ngettext.extract(node, config);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(3);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
        expect(msgStr[2]).to.eql('');
    });
    it('should not pass validation if has wrong number of plural forms', () => {
        const node = template('ngettext(msgid`test`, `test`, `test`, n)')().expression;
        const fn = () => ngettext.extract(node, enConfig);
        expect(fn).to.throw('Expected to have 2 plural forms but have 3 instead');
    });
    it('should strip indentation for all forms', () => {
        const node = template('ngettext(msgid`  test\n  test`, `  test\n  tests`, n)')().expression;
        const result = ngettext.extract(node, enConfig);
        expect(result[MSGID]).to.eql('test\ntest');
        expect(result[MSGID_PLURAL]).to.eql('test\ntests');
    });
});

describe('ngettext match', () => {
    it('should match gettext', () => {
        const node = template('ngettext(msgid`test`, `test`, `test`)')().expression;
        const result = ngettext.match(node, enConfig);
        expect(result).to.be.true;
    });
});

describe('ngettext validate', () => {
    it('should pass validation', () => {
        const node = template('ngettext(msgid`test`, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.not.throw();
    });
    it('should not pass validation when first arg is not tagged expression', () => {
        const node = template('ngettext(`test`, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw("First argument must be tagged template expression. You should use 'msgid' tag");
    });
    it('should not pass validation when first arg is not a msgid', () => {
        const node = template('ngettext(z`test`, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw("Expected 'msgid' for the first argument but not 'z'");
    });
    it('should not pass validation when first arg has invalid expressions', () => {
        const node = template('ngettext(msgid`test ${fn()}`, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use CallExpression \'${fn()}\' in localized strings');
    });
    it('should not pass validation when plural forms has invalid expressions', () => {
        const node = template('ngettext(msgid`test`, `test ${ fn() }`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use CallExpression \'${fn()}\' in localized strings');
    });
    it('should not pass validation if has wrong \'n\' argument', () => {
        const node = template('ngettext(msgid`test`, `test`, fn())')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('CallExpression \'fn()\' can not be used as plural argument');
    });
    it('should not pass validation if has empty msgid', () => {
        const node = template('ngettext(msgid``, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'\'');
    });
    it('should not pass validation if has no meaningful information', () => {
        const node = template('ngettext(msgid`${name} ${n}`, `test`, n)')().expression;
        const fn = () => ngettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'${name} ${n}\'');
    });
});
