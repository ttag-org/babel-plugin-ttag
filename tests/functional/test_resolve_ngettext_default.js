import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {}]],
};

describe('Resolve ngettext default', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not resolve if no extractors match (without expressions)', () => {
        const expectedPath = 'tests/fixtures/expected_no_translator_notes.js.src';
        const input = 'console.log(nt(5)`no translator notes`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should not resolve if no extractors match (without expressions)', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_no_translation_formatted.js.src';
        const input = 'console.log(nt(a)`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
