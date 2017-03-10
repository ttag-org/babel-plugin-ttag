import { expect } from 'chai';
import * as babel from 'babel-core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const options = {
    presets: ['es2015'],
    plugins: [c3poPlugin],
};

describe('Empty config', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not resolve if no extractors match', () => {
        const input = `
        import { t } from 'c-3po';
        fun1(t\`test\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain("fun1('test');");
    });
    it('validation should work for empty config', () => {
        const input = `
        import { t } from 'c-3po';
        fun1(t\`test \${ a() }\`);
        `;
        const fn = () => babel.transform(input, options).code;
        expect(fn).to.throw('You can not use CallExpression \'${a()}\' in localized strings');
    });
});

