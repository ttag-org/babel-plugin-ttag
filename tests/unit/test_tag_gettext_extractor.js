import { expect } from 'chai';
import gettext from 'src/extractors/tag-gettext';
import template from '@babel/template';
import Context from 'src/context';

const enConfig = new Context();

describe('tag-gettext validate', () => {
    it('should not throw if numeric literal', () => {
        const node = template('t`banana ${ 1 }`')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.not.throw();
    });

    it('should not throw if member expression literal', () => {
        const node = template('t`banana ${ this.props.number }`')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.not.throw();
    });

    it('should throw if has invalid expressions', () => {
        const node = template('t`banana ${ n + 1}`')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should throw if translation string is an empty string', () => {
        const node = template('t``')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'\'');
    });

    it('should throw if has no meaningful information', () => {
        const node = template('t`${user} ${name}`')().expression;
        const fn = () => gettext.validate(node, enConfig);
        expect(fn).to.throw('Can not translate \'${user} ${name}\'');
    });
});

describe('tag-gettext match', () => {
    it('should match gettext', () => {
        const node = template('t`${n} banana`')().expression;
        const result = gettext.match(node, enConfig);
        expect(result).to.be.true;
    });
});
