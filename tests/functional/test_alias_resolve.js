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

    it('should be able to create alias on import for tag-gettext', () => {
        const input = `
        import { t as i18n } from 'c-3po';
        console.log(i18n\`simple string literal\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(\'simple string literal translated\');');
    });

    it('should be able to create alias on import for tag-ngettext', () => {
        const input = `
        import { nt as ungettext } from 'c-3po';
        console.log(ungettext(n)\`plural form with \${ n } plural\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain("console.log(_tag_ngettext(n, ['plural form with ' + n + " +
            "' plural', 'plural form with ' + n + ' plurals']));");
    });

    it('should be able to create alias on import for fn-gettext', () => {
        const input = `
        import { gettext as i18n } from 'c-3po';
        console.log(i18n('simple string literal'));
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(\'simple string literal translated\');');
    });
});
