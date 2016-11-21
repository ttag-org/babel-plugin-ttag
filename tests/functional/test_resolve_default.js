import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const pofile = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { locale: 'en-us' },
        locales: {
            'en-us': pofile,
        },
    }]],
};

describe('Resolve default', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve original string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_no_translator_notes.js.src';
        const input = 'console.log(gt`no translator notes`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original formatted string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_no_translation_formatted.js.src';
        const input = 'console.log(gt`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should not resolve if no extractors match', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_if_no_extractor_match.js.src';
        const input = 'console.log(gtt`simple string literal ${a}`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
