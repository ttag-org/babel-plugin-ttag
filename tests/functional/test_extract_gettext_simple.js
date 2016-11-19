import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import { MODE, POLYGLOT_MODE_ENV } from 'src/defaults';


describe('Extract gettext', () => {
    before(() => {
        process.env[POLYGLOT_MODE_ENV] = MODE.EXTRACT;
        rmDirSync('debug');
    });

    it('should extract simple gettext literal (without formatting)', () => {
        const output = 'debug/translations.pot';
        const expectedPath = 'tests/fixtures/expected_gettext_simple_literal.pot';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, { extract: { output } }]],
        };
        const input = 'console.log(gt`simple string literal`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
