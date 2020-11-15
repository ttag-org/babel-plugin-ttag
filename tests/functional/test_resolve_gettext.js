import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['@babel/preset-env'],
    plugins: [[c3poPlugin, {
        resolve: { translations },
        discover: ['t'],
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
            'console.log("".concat(a, " simple string ").concat(b, " literal with formatting [translated]"))',
        );
    });

    it('should work with upper case characters as variables (regression)', () => {
        // https://github.com/babel/babel/issues/8723
        const input = 't`test test ${MAX_AMOUNT}`';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            '"test test ".concat(MAX_AMOUNT, " translate");',
        );
    });

    it('should resolve gettext literal (with formatting) for member expressions', () => {
        const input = (
            'console.log(t`${ item.name.value } simple string '
            + '${ item.age.value } literal with formatting`);'
        );
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            'console.log("".concat(item.name.value, " simple string ").concat(item.age.value, " '
            + 'literal with formatting [translated]"));',
        );
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
        expect(result).to.contain(
            'console.log("simple string literal without translation ".concat(a));',
        );
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

    it('should skip spaces inside expressions', () => {
        const input = 'console.log(t`${ a } spaces test`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("".concat(a, " spaces test [translated]"));');
    });

    it('should throw if expression contains typo', () => {
        const input = 'console.log(t`Typo test ${ mississipi }`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw(
            'Expression \'mississipi\' is not found in the localized string \'Typo test ${ missingpi }\'.',
        );
    });
    it('should resolve computed properties', () => {
        const input = 'console.log(t`test computed ${ a[\'computed\'] }`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("test computed ".concat(a[\'computed\'], " translated"));');
    });
});
