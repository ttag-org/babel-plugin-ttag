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
        expect(result).to.not.contain('console.log(\'simple string literal translated\');');
    });
    it('should translate with import', () => {
        const input = `
        import { t } from 'c-3po';
        console.log(t\`simple string literal\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(\'simple string literal translated\');');
    });
    it('should translate with discover', () => {
        const input = 'console.log(gettext(\'simple string literal\'));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(\'simple string literal translated\');');
    });
});
