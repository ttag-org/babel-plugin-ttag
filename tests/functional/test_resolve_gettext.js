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

describe('Resolve gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_simple_gettext.js.src';
        const input = 'console.log(t`simple string literal`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original string if no translation is found', () => {
        const expectedPath = 'tests/fixtures/expected_no_translation.js.src';
        const input = 'console.log(t`simple string literal without translation`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_no_translator_notes.js.src';
        const input = 'console.log(t`no translator notes`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original formatted string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_no_translation_formatted.js.src';
        const input = 'console.log(t`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original formatted string if msgid is not found in po', () => {
        const expectedPath = 'tests/fixtures/expected_no_msgid_for_gettext.js.src';
        const input = 'console.log(t`some random string`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
