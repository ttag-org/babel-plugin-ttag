import { expect } from 'chai';
import gettext from 'src/extractors/gettext';
import template from '@babel/template';
import Context from 'src/context';

const enConfig = new Context();

describe('gettext validate', () => {
    it('should throw if has invalid argument', () => {
        const node = template('gettext(fn())')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use CallExpression \'fn()\' as an argument to gettext');
    });

    it('should throw validation if has empty string argument', () => {
        const node = template('gettext("")')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'\'');
    });

    it('should throw validation if has no meaningful information', () => {
        const node = template('gettext("        2")')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'        2\'');
    });

    it('should throw if has template argument', () => {
        const node = template('gettext(`www`)')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use template literal as an argument to gettext');
    });
});

describe('gettext match', () => {
    it('should match gettext', () => {
        const node = template('gettext("banana")')().expression;
        const result = gettext.match(node, enConfig);
        expect(result).to.be.true;
    });

    it('should match gettext with zero arguments', () => {
        const node = template('gettext()')().expression;
        const result = gettext.match(node, enConfig);
        expect(result).to.be.false;
    });
});
