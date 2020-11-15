import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    plugins: [[c3poPlugin, {
        resolve: { translations },
    }]],
};

describe('Alias resolve', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should be able to create alias on import for tag-gettext', () => {
        const input = `
        import { t as i18n } from 'ttag';
        console.log(i18n\`simple string literal\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('simple string literal translated');
    });

    it('should be able to create alias on import for tag-ngettext', () => {
        const input = `
        import { ngettext as ungettext } from 'ttag';
        console.log(ungettext(msgid\`plural form with \${ n } plural\`, \`plural form with \${ n } plural\`, n));
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            '_tag_ngettext(n, [`plural form with ${n} plural [translated]`, '
            + '`plural form with ${n} plurals [translated]`])',
        );
    });

    it('should be able to create alias on import for gettext', () => {
        const input = `
        import { gettext as i18n } from 'ttag';
        console.log(i18n('simple string literal'));
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('simple string literal translated');
    });
});
