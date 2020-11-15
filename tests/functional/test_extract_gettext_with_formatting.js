import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const output = 'debug/translations.pot';
const options = {
    presets: ['@babel/preset-env'],
    plugins: [[c3poPlugin, { extract: { output }, discover: ['t'] }]],
};

describe('Extract tag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract gettext literal with formatting', () => {
        const expectedPath = 'tests/fixtures/expected_gettext_literal_with_formatting.pot';
        const input = 'console.log(t`literal with formatting ${a}`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should throw if has invalid expressions', () => {
        const input = 't`banana ${ n + 1}`';
        const fn = () => babel.transform(input, options).code;
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });
});
