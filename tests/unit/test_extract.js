import { expect } from 'chai';
import { extractPotEntries } from 'src/extract';
import Config from 'src/config';

describe('extractPotEntries', () => {
    it('Should extract proper structure with gettext extractor', () => {
        const locale = 'EN_US';
        const config = new Config({ config: 'tests/fixtures/.polyglot' });
        const testFilename = 'testFilename.js';
        const testFilenameContent = `
            function test2() {
	        let a = 5;
	        gt\`simple string literal \${a}\`;}
        `;
        const res = extractPotEntries(locale, testFilename, config)(testFilenameContent);
        const expectedOutput = [
            {
                msgid: 'simple string literal ${ a }',
                msgstr: '',
                comments: { reference: 'testFilename.js:4' },
            }];
        expect(res).to.deep.eql(expectedOutput);
    });

    it('Should extract proper structure with ngettext extractor', () => {
        const locale = 'EN_US';
        const config = new Config({ config: 'tests/fixtures/.polyglot' });
        const testFilename = 'testFilename.js';
        const testFilenameContent = `
            function test2() {
	        let a = 5;
	        nt(a)\`simple string literal \${a}\`;}
        `;
        const res = extractPotEntries(locale, testFilename, config)(testFilenameContent);
        const expectedOutput = [
            {
                msgid: 'simple string literal ${ a }',
                msgid_plural: 'simple string literal ${ a }',
                msgstr: ['', ''],
                comments: { reference: 'testFilename.js:4' },
            }];

        expect(res).to.deep.eql(expectedOutput);
    });
});
