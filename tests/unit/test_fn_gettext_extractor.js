import { expect } from 'chai';
import gettext from 'src/extractors/fn-gettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Config from 'src/config';
import { extractPoEntry } from 'src/extract';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

const enConfig = new Config();

describe('fn-gettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('gettext("banana")')().expression;
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('banana');
    });

    it('should extract proper msgstr', () => {
        const node = template('gettext("banana")')().expression;
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGSTR]).to.eql('');
    });

    it('should throw if has invalid argument', () => {
        const node = template('gettext(fn())')().expression;
        const mockState = { file: { opts: { filename: 'test' } } };
        const fn = () => extractPoEntry(gettext, { node }, enConfig, mockState);
        expect(fn).to.throw('You can not use CallExpression \'fn()\' as an argument to gettext');
    });
});

describe('fn-gettext match', () => {
    it('should match gettext', () => {
        const node = template('gettext("banana")')().expression;
        const result = gettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });

    it('should match gettext with zero arguments', () => {
        const node = template('gettext()')().expression;
        const result = gettext.match({ node }, enConfig);
        expect(result).to.be.false;
    });
});
