import { expect } from 'chai';
import * as babel from 'babel-core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const options = {
    presets: ['es2015'],
    plugins: [[c3poPlugin, {
        discover: ['t'],
        resolve: { translations: 'default' },
    }]],
};

describe('Resolve tag-gettext default', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not resolve if no extractors match (without expressions)', () => {
        const input = 'console.log(t`no translator notes`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes");');
    });

    it('should not resolve if no extractors match (without expressions)', () => {
        const input = 'console.log(t`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal without translation " + a);');
    });

    it('should strip indent', () => {
        const input = `console.log(t\`
            no
            translator
            notes\`);`;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no\\ntranslator\\nnotes");');
    });

    it('should not strip indent if has no \\n', () => {
        const input = 'console.log(t`  www`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("  www");');
    });
});
