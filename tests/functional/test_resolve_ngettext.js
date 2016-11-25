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

describe('Resolve ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_ngettext.js.src';
        const input = 'const n = 1; ' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should not include ngettext function multiple times', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_ngettext_multiple.js.src';
        const input = 'const n = 1;\n' +
            'console.log(nt(n)`plural form with ${n} plural`);\n' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should work when n is Literal', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_ngettext_n_is_literal.js.src';
        const input = 'console.log(nt(1)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_no_translator_notes_ngettext.js.src';
        const input = 'console.log(nt(n)`no translator notes plural`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original formatted string if no translator notes', () => {
        const expectedPath = 'tests/fixtures/expected_resolve_no_translation_formatted_ngettext.js.src';
        const input = 'console.log(nt(n)`no translator notes plural formatted ${ a }`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should resolve original formatted string if msgid is not found in po', () => {
        const expectedPath = 'tests/fixtures/expected_no_msgid_for_ngettext.js.src';
        const input = 'console.log(nt(5)`some random string ${a}`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should throw if has invalid expressions', () => {
        const input = 'console.log(nt(n)`some random string ${ n + 1 }`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should throw if invalid plural argument format', () => {
        const input = 'console.log(nt(n + 1)`some random string`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('BinaryExpression \'n + 1\' can not be used as plural number argument');
    });
});
