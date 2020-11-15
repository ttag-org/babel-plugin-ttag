import { expect } from 'chai';
import * as babel from '@babel/core';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['@babel/preset-env'],
    plugins: [[ttagPlugin, {
        resolve: { translations, unresolved: 'fail' },
        discover: ['t', 'ngettext'],
    }]],
};

const optionsResolveDefault = {
    plugins: [[ttagPlugin, {
        resolve: { translations: 'default', unresolved: 'fail' },
        discover: ['t'],
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
        const input = 'console.log(ngettext(msgid`random string`, `random string`, n));';
        const fun = () => babel.transform(input, options).code;
        expect(fun).to.throw('No "random string" in "tests/fixtures/resolve_simple_gettext.po" file');
    });
    it('should not fail if resolve: "default"', () => {
        const input = 'console.log(t`some random string`);';
        const { code } = babel.transform(input, optionsResolveDefault);
        expect(code).to.equal('console.log("some random string");');
    });
});
