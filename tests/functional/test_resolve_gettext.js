import { expect } from 'chai';
import * as babel from 'babel-core';
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

describe('Resolve tag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const input = 'console.log(t`simple string literal`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal translated");');
    });

    it('should resolve gettext literal (with formatting)', () => {
        const input = 'console.log(t`${ a } simple string ${ b } literal with formatting`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            'console.log(a + " simple string " + b + " literal with formatting [translated]");');
    });

    it('should resolve original string if no translation is found', () => {
        const input = 'console.log(t`simple string literal without translation`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal without translation");');
    });

    it('should resolve original string if no translator notes', () => {
        const input = 'console.log(t`no translator notes`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes");');
    });

    it('should resolve original formatted string if no translator notes', () => {
        const input = 'console.log(t`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal without translation " + a);');
    });

    it('should resolve original formatted string if msgid is not found in po', () => {
        const input = 'console.log(t`some random string`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("some random string");');
    });

    it('should throw if has invalid expressions', () => {
        const input = 'console.log(t`some random string ${ n + 1 }`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should resolve with indent', () => {
        const input = `console.log(t\`
            first line
            second line
            third line\`);`;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("translation");');
    });
});
