import { expect } from 'chai';
import { extractPotEntries } from 'src/extract';
import gettext from 'src/extractors/gettext';

describe('extractPotEntries', () => {
    it('Should extract proper structure with gettext extractor', () => {
        const extractors = [gettext];
        const testFilename = 'testFilename.js';
        const testFilenameContent = `
            function test2() {
	        let a = 5;
	        gt\`simple string literal \${a}\`;}
        `;
        const res = extractPotEntries(testFilename, extractors)(testFilenameContent);
        const expectedOutput = [
            {
                msgid: 'simple string literal ${ a }',
                msgstr: '',
                comments: { reference: 'testFilename.js:4'}
            }];
        expect(res).to.deep.eql(expectedOutput);
    });
});
