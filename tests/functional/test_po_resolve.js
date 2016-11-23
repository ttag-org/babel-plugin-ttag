import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const pofile = 'tests/fixtures/ua.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { locale: 'ua' },
        locales: {
            ua: pofile,
        },
    }]],
};

describe('Resolve ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expectedPath = 'tests/fixtures/expected_po_resolve.js.src';
        const input = 'const n = 1; ' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});

