import { expect } from 'chai';
import { getNPlurals, getPluralFunc, makePluralFunc, applyReference,
    hasTranslation } from 'src/po-helpers';
import { LOCATION } from 'src/defaults';


describe('po-helpers getNPlurals', () => {
    it('should extract number of plurals', () => {
        const headers = {
            'plural-forms': 'nplurals=3; plural=(n!=1);',
        };
        expect(getNPlurals(headers)).to.eql(3);
    });
});

describe('po-helpers getPluralFunc', () => {
    it('should extract en plural function', () => {
        const headers = {
            'plural-forms': 'nplurals=2; plural=(n!=1);',
        };
        expect(getPluralFunc(headers)).to.eql('(n!=1)');
    });
    it('should extract slovak plural function', () => {
        const headers = {
            'plural-forms': 'nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;',
        };
        expect(getPluralFunc(headers)).to.eql('(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2');
    });
    it('should extract ukrainian plural function', () => {
        /* eslint-disable max-len */
        const uk = 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);';
        const expected = '(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)';
        const headers = { 'plural-forms': uk };
        expect(getPluralFunc(headers)).to.eql(expected);
    });
});

describe('po-helpers makePluralFunc', () => {
    it('should return proper plural func', () => {
        const fn = makePluralFunc('n!=1');
        expect(fn(1, ['banana', 'bananas'])).to.eql('banana');
    });
});

describe('po-helpers applyReference', () => {
    const poEntry = {};
    const filepath = 'filepath';
    const node = { loc: { start: { line: 3 } } };

    it('should return file name and line number', () => {
        const expected = { comments: { reference: 'filepath:3' } };
        expect(applyReference(poEntry, node, filepath, LOCATION.FULL)).to.eql(expected);
    });

    it('should return file name', () => {
        const expected = { comments: { reference: 'filepath' } };
        expect(applyReference(poEntry, node, filepath, LOCATION.FILE)).to.eql(expected);
    });

    it('should return no lines', () => {
        const expected = { comments: { reference: null } };
        expect(applyReference(poEntry, node, filepath, LOCATION.NEVER)).to.eql(expected);
    });
});

describe('po-helpers hasTranslation', () => {
    it('should return false if has no letter characters', () => {
        const input = '           ';
        expect(hasTranslation(input)).to.be.false;
    });
    it('should return false if has no letter characters but has numbers', () => {
        const input = '           9';
        expect(hasTranslation(input)).to.be.false;
    });
    it('should return false if has no letter characters but has punctuation', () => {
        const input = '     .  *    ';
        expect(hasTranslation(input)).to.be.false;
    });
    it('should return false if has no letter characters but has expressions', () => {
        const input = '${name} ${surname}';
        expect(hasTranslation(input)).to.be.false;
    });
    it('should return true if has letter characters and expressions', () => {
        const input = 'tell us your ${name} and your ${surname}';
        expect(hasTranslation(input)).to.be.true;
    });
});
