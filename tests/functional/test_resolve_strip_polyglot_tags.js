import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('Resolve strip tags by default', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should strip polyglot tags if translations: default (without resolve config)', () => {
        const input = 'console.log(t`simple string literal`);';
        const customOpts = {
            presets: ['@babel/preset-env'],
            plugins: [[c3poPlugin, { discover: ['t'], resolve: { translations: 'default' } }]],
        };
        const result = babel.transform(input, customOpts).code;
        expect(result).to.contain('console.log("simple string literal");');
    });
});
