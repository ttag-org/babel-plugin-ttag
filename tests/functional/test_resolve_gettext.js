import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Resolve gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const pofile = 'tests/fixtures/resolve_simple_gettext.po';
        const expectedPath = 'tests/fixtures/expected_resolve_simple_gettext.js.src';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {
                resolve: {
                    locales: {
                        EN_US: pofile,
                    },
                },
            }]],
        };
        const input = 'console.log(gt`simple string literal`);';
        const result = babel.transform(input, options).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
