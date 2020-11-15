import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';

const options = {
    plugins: [[c3poPlugin, { discover: ['ngettext', 'c'], resolve: { translations: 'default' } }]],
};

describe('Resolve ngettext default', () => {
    it('should resolve original strings if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural`, `no translation plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('_tag_ngettext(n, [`no translation plural`, `no translation plurals`])');
    });

    it('should resolve original formatted strings if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural ${n}`, `no translation plurals ${n}`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            '_tag_ngettext(n, [`no translation plural ${n}`, `no translation plurals ${n}`])',
        );
    });

    it('should resolve default strings with indent', () => {
        const input = 'ngettext(msgid`  test\n  test`, `  test\n  tests`, n)';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('_tag_ngettext(n, [`test\ntest`, `test\ntests`]);');
    });

    it('should resolve original strings with context', () => {
        const input = 'console.log(c("foo").ngettext(msgid`no translation plural`, `no translation plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('_tag_ngettext(n, [`no translation plural`, `no translation plurals`])');
    });
});
