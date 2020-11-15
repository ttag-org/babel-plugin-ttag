import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';

const translations = 'tests/fixtures/ua.po';

const options = {
    plugins: [[c3poPlugin, {
        resolve: { translations },
        discover: ['ngettext'],
    }]],
};

describe('Resolve ngettext default for locale', () => {
    it('should resolve original strings if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural`, `no translation plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('_tag_ngettext(n, [`no translation plural`, `no translation plurals`,'
        + ' `no translation plurals`])');
    });

    it('should resolve original strings with expressions if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural ${n}`, `no translation plurals ${n}`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            '_tag_ngettext(n, [`no translation plural ${n}`, `no translation plurals ${n}`,'
            + ' `no translation plurals ${n}`])',
        );
    });
});
