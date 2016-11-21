import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Resolve gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const pofile = 'tests/fixtures/resolve_simple_gettext.po';
        const expectedPath = 'tests/fixtures/expected_resolve_simple_gettext.js.src';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {
                resolve: { locale: 'en-us' },
                locales: {
                    'en-us': pofile,
                },
            }]],
        };
        const input = 'console.log(gt`simple string literal`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original string if no translation is found', () => {
        const pofile = 'tests/fixtures/resolve_simple_gettext.po';
        const expectedPath = 'tests/fixtures/expected_no_translation.js.src';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {
                resolve: { locale: 'en-us' },
                locales: {
                    'en-us': pofile,
                },
            }]],
        };
        const input = 'console.log(gt`simple string literal without translation`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original string if no translator notes', () => {
        const pofile = 'tests/fixtures/resolve_simple_gettext.po';
        const expectedPath = 'tests/fixtures/expected_no_translator_notes.js.src';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {
                resolve: { locale: 'en-us' },
                locales: {
                    'en-us': pofile,
                },
            }]],
        };
        const input = 'console.log(gt`no translator notes`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
