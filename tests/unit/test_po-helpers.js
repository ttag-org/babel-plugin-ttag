import { expect } from 'chai';
import { getNPlurals, getPluralFunc } from 'src/po-helpers';


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
