import { expect } from 'chai';
import gettext from 'src/extractors/tag-gettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Config from 'src/config';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
import { extractPoEntry } from 'src/extract';

const enConfig = new Config();

describe('tag-gettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('t`${n} banana`')().expression;
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgstr', () => {
        const node = template('t`${n} banana`')().expression;
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGSTR]).to.eql('');
    });

    it('should extract proper structure without expressions', () => {
        const node = template('t`banana`')().expression;
        const result = gettext.extract({ node }, enConfig);
        const expected = {
            msgid: 'banana',
            msgstr: '',
        };
        expect(result).to.eql(expected);
    });

    it('should not throw if numeric literal', () => {
        const node = template('t`banana ${ 1 }`')().expression;
        const mockState = { file: { opts: { filename: 'unknown' } } };
        const fn = () => extractPoEntry(gettext, { node }, enConfig, mockState);
        expect(fn).to.not.throw();
    });

    it('should throw if has invalid expressions', () => {
        const node = template('t`banana ${ n + 1}`')().expression;
        const mockState = { file: { opts: { filename: 'test' } } };
        const fn = () => extractPoEntry(gettext, { node }, enConfig, mockState);
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should dedent extracted text', () => {
        const node = template(`t\`
            first
            second
            third
            \``)().expression;
        const expected = 'first\nsecond\nthird';
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql(expected);
    });
});

describe('tag-gettext match', () => {
    it('should match gettext', () => {
        const node = template('t`${n} banana`')().expression;
        const result = gettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });
});
