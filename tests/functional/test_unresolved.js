import { expect } from 'chai';
import * as babel from 'babel-core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['es2015'],
    plugins: [[c3poPlugin, {
        resolve: { translations, unresolved: 'fail' },
        discover: ['t', 'nt'],
    }]],
};

describe('Unresolved', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should throw for tag-gettext', () => {
        const input = 'console.log(t`random string`);';
        const fun = () => babel.transform(input, options).code;
        expect(fun).to.throw('No "random string" in "tests/fixtures/resolve_simple_gettext.po" file');
    });
    it('should throw for tag-ngettext', () => {
        const input = 'console.log(nt(n)`random string`);';
        const fun = () => babel.transform(input, options).code;
        expect(fun).to.throw('No "random string" in "tests/fixtures/resolve_simple_gettext.po" file');
    });
});

