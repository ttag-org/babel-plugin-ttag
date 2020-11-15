import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const options = {
    plugins: [c3poPlugin],
};

describe('Empty config', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not resolve if no resolve option', () => {
        const input = `
        import { t } from 'ttag';
        fun1(t\`test\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('fun1(t`test`);');
    });
    it('validation should work for empty config', () => {
        const input = `
        import { t } from 'ttag';
        fun1(t\`test \${ a() }\`);
        `;
        const fn = () => babel.transform(input, options).code;
        expect(fn).to.throw('You can not use CallExpression \'${a()}\' in localized strings');
    });
});
