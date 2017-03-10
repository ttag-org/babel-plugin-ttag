import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Extract tag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract simple gettext literal (without formatting)', () => {
        const output = 'debug/translations.pot';
        const expectedPath = 'tests/fixtures/expected_gettext_simple_literal.pot';
        const options = {
            presets: ['es2015'],
            plugins: [[c3poPlugin, { extract: { output }, discover: ['t'] }]],
        };
        const input = 'console.log(t`simple string literal`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
