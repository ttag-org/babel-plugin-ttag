import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/contexts_translations.po';

const options = {
    plugins: [[c3poPlugin, {
        resolve: { translations },
    }]],
};

describe('Context resolve', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext with the context', () => {
        const input = `
        import { gettext, c } from 'ttag';
        c('email').gettext('test');
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('test email context');
    });

    it('should resolve t tag', () => {
        const input = `
        import { t, c } from 'ttag';
        c('email').t\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('test email context');
    });

    it('should not remove wrapper function', () => {
        const input = `
        import { t, c } from 'ttag';
        make_it_work(c('email').t\`test\`)
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('make_it_work');
        expect(result).to.contain('test email context');
    });

    it('should resolve ngettext', () => {
        const input = 'import { ngettext, msgid, c } from "ttag";\n'
        + 'const a = 2;\n'
        + 'c("email").ngettext(msgid`${ a } banana`, `${ a } bananas`, a);\n';

        const result = babel.transform(input, options).code;
        expect(result).to.contain('${a} banana email context');
        expect(result).to.contain('${a} bananas email context');
    });

    it('should resolve jt', () => {
        const input = `
        import { jt, c } from 'ttag';
        c('email').jt\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('test email context');
    });
});
