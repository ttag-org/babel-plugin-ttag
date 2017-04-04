import { expect } from 'chai';
import * as babel from 'babel-core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const options = {
    presets: ['es2015'],
    plugins: [[c3poPlugin, { discover: ['nt'], resolve: { translations: 'default' } }]],
};

describe('Resolve tag-ngettext default', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not resolve if no extractors match (without expressions)', () => {
        const input = 'console.log(nt(5)`no translator notes`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes");');
    });

    it('should not resolve if no extractors match (without expressions)', () => {
        const input = 'console.log(nt(a)`simple string literal without translation ${a}`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal without translation " + a);');
    });

    it('should strip indent', () => {
        const input = `console.log(nt(n)\`
            no
            translator
            notes\`);`;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no\\ntranslator\\nnotes");');
    });
});
