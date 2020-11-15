import { expect } from 'chai';
import {
    getNPlurals, getPluralFunc, makePluralFunc, applyReference,
    hasUsefulInfo, buildPotData, applyFormat,
} from 'src/po-helpers';
import { PO_PRIMITIVES, LOCATION } from 'src/defaults';

const { MSGID } = PO_PRIMITIVES;

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
    it('should extract plural function without semicolon', () => {
        const headers = {
            'plural-forms': 'nplurals=2; plural=(n!=1)',
        };
        expect(getPluralFunc(headers)).to.eql('(n!=1)');
    });
    it('should throw useful error message when headers are in wrong format', () => {
        const headers = {};
        const fn = () => getPluralFunc(headers);
        expect(fn).to.throw('Failed to parse plural func');
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

describe('po-helpers applyFormat', () => {
    it('should apply javascript format if has expressions', () => {
        const poEntry = { [MSGID]: 'test ${ a }' };
        const withFormat = applyFormat(poEntry);
        expect(withFormat.comments).to.have.property('flag', 'javascript-format');
    });
    it('should not apply javascript format if has no expressions', () => {
        const poEntry = { [MSGID]: 'test' };
        const withFormat = applyFormat(poEntry);
        expect(withFormat).to.not.have.property('comments');
    });
    it('should not apply javascript format to existing flags', () => {
        const poEntry = { [MSGID]: 'test ${ a }', comments: { flag: 'fuzzy' } };
        const withFormat = applyFormat(poEntry);
        expect(withFormat.comments.flag).to.eql('fuzzy\njavascript-format');
    });
});

describe('po-helpers hasUsefulInfo', () => {
    it('should return false if has no letter characters', () => {
        const input = '           ';
        expect(hasUsefulInfo(input)).to.be.false;
    });
    it('should return false if has no letter characters but has numbers', () => {
        const input = '           9';
        expect(hasUsefulInfo(input)).to.be.false;
    });
    it('should return false if has no letter characters but has punctuation', () => {
        const input = '     .  *    ';
        expect(hasUsefulInfo(input)).to.be.false;
    });
    it('should return false if has no letter characters but has expressions', () => {
        const input = '${name} ${surname}';
        expect(hasUsefulInfo(input)).to.be.false;
    });
    it('should return true if has letter characters and expressions', () => {
        const input = 'tell us your ${name} and your ${surname}';
        expect(hasUsefulInfo(input)).to.be.true;
    });
    it('should return true for expressions with non ascii characters', () => {
        const input = '${discountLabelText} с ${dateStartText} по ${dateEndText}';
        expect(hasUsefulInfo(input)).to.be.true;
    });
});

describe('po-helpers buildPotData', () => {
    it('should build po data', () => {
        const msg1 = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/1.txt:123',
            },
        };
        const expected = {
            charset: 'UTF-8',
            headers: {
                'content-type': 'text/plain; charset=UTF-8',
                'plural-forms': 'nplurals=2; plural=(n!=1);',
            },
            translations: { '': { test: msg1 } },
        };
        const result = buildPotData([msg1]);
        expect(result).to.eql(expected);
    });

    it('should build po data with multiple contexts', () => {
        const msg1 = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/1.txt:123',
            },
        };

        const msg2 = {
            msgid: 'test2',
            msgstr: 'test2',
            msgctxt: 'ctx2',
            comments: {
                reference: 'path/to/file/1.txt:123',
            },
        };

        const expected = {
            charset: 'UTF-8',
            headers: {
                'content-type': 'text/plain; charset=UTF-8',
                'plural-forms': 'nplurals=2; plural=(n!=1);',
            },
            translations: { '': { test: msg1 }, ctx2: { test2: msg2 } },
        };
        const result = buildPotData([msg1, msg2]);
        expect(result).to.eql(expected);
    });

    it('should accumulate references', () => {
        const msg1 = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/1.txt:123',
            },
        };
        const msg2 = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/2.txt:124',
            },
        };

        const resultmsg = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/1.txt:123\npath/to/file/2.txt:124',
            },
        };

        const expected = {
            charset: 'UTF-8',
            headers: {
                'content-type': 'text/plain; charset=UTF-8',
                'plural-forms': 'nplurals=2; plural=(n!=1);',
            },
            translations: { '': { test: resultmsg } },
        };
        const result = buildPotData([msg1, msg2]);
        expect(result).to.eql(expected);
    });

    it('should not accumulate reference if already has', () => {
        const msg1 = {
            msgid: 'test',
            msgstr: 'test1',
            comments: {
                reference: 'path/to/file/1.txt:123',
            },
        };
        const result = buildPotData([msg1, msg1]);
        const ref = result.translations[''].test.comments.reference;
        expect(ref).to.not.eql('path/to/file/1.txt:123\npath/to/file/1.txt:123');
    });
});
