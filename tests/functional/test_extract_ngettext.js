import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Extract ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract ngettext', () => {
        const output = 'debug/translations.pot';
        const expectedPath = 'tests/fixtures/expected_ngettext_simple_literal.pot';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, { extract: { output } }]],
        };
        const input = 'console.log(nt(a)`${a} bananas`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
