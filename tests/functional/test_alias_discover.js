import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    plugins: [[c3poPlugin, {
        resolve: { translations },
        discover: ['gettext'],
    }]],
};

describe('Alias discover', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should not translate without import', () => {
        const input = `
        console.log(t\`simple string literal\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('simple string literal translated');
    });
    it('should translate with import', () => {
        const input = `
        import { t } from 'ttag';
        console.log(t\`simple string literal\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('simple string literal translated');
    });
    it('should translate with discover', () => {
        const input = 'console.log(gettext(\'simple string literal\'));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('simple string literal translated');
    });
});
