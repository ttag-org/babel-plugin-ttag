import { expect } from 'chai';
import * as babel from 'babel-core';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/ua.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { translations },
        discover: ['nt'],
    }]],
};

describe('Test po resolve', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expected = 'n % 10 == 1 && n % 100 != 11 ? 0 : ' +
            'n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2';
        const input = 'const n = 1; ' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });
});

