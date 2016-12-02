import { expect } from 'chai';
import * as babel from 'babel-core';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Resolve default', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should strip polyglot tags in any case (without resolve config)', () => {
        const input = 'console.log(t`simple string literal`);';
        const customOpts = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {}]],
        };
        const result = babel.transform(input, customOpts).code;
        expect(result).to.contain('console.log("simple string literal");');
    });
});
