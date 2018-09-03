import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['@babel/preset-env'],
    plugins: [[c3poPlugin, {
        resolve: { translations },
        extractors: {
            gettext: {
                invalidFormat: 'skip',
            },
        },
        discover: ['gettext', 't'],
    }]],
};

describe('Test resolve when validation fails', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should not throw for fn-gettext', () => {
        const input = 'console.log(gettext(fn()));';
        const fun = () => babel.transform(input, options).code;
        expect(fun).to.not.throw();
    });

    it('should throw for tag-gettext', () => {
        const input = 'console.log(t`${fn()} random string`);';
        const fun = () => babel.transform(input, options).code;
        expect(fun).to.throw('You can not use CallExpression \'${fn()}\' in localized strings');
    });
});
