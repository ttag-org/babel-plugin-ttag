import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Extract gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract gettext literal with formatting', () => {
        const output = 'debug/translations.pot';
        const expectedPath = 'tests/fixtures/expected_gettext_literal_with_formatting.pot';
        const options = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, { extract: { output } }]],
        };
        const input = 'console.log(gt`literal with formatting ${a}`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});

