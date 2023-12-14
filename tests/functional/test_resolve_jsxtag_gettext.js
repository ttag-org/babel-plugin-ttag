import { expect } from 'chai';
import * as babel from '@babel/core';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['@babel/preset-env'],
    plugins: [[polyglotPlugin, {
        resolve: { translations },
        discover: ['jt'],
    }]],
};

describe('Resolve jsxtag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const input = 'console.log(jt`simple string literal`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(["simple string literal translated"]);');
    });

    it('should resolve gettext literal (with formatting)', () => {
        const input = 'console.log(jt`${ a } simple string ${ b } literal with formatting`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            'console.log([a, " simple string ", b, " literal with formatting [translated]"]);',
        );
    });

    it('should resolve original string if no translation is found', () => {
        const input = 'console.log(jt`simple string literal without translation`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(["simple string literal without translation"]);');
    });

    it('should resolve original string if no translator notes', () => {
        const input = 'console.log(jt`no translator notes`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(["no translator notes"]);');
    });

    it('should resolve original formatted string if no translator notes', () => {
        const input = 'console.log(jt`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(["simple string literal without translation ", a]);');
    });

    it('should resolve original formatted string if msgid is not found in po', () => {
        const input = 'console.log(jt`some random string`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(["some random string"]);');
    });
});
