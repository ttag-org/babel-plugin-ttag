import { expect } from 'chai';
import * as babel from '@babel/core';
import path from 'path';
import fs from 'fs';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('Extract tag-gettext', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should extract simple gettext literal (without formatting)', () => {
        const output = 'debug/translations.pot';
        const expectedPath = 'tests/fixtures/expected_gettext_simple_literal.pot';
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [[ttagPlugin, { extract: { output }, discover: ['t'] }]],
        };
        const input = 'console.log(t`simple string literal`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should escape backticks properly', () => {
        const output = 'debug/translations.pot';
        const inputFile = 'tests/fixtures/backtick_test.js';
        const options = {
            plugins: [[ttagPlugin, { extract: { output } }]],
        };
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "test with ` backtick"');
    });

    it('should escape backticks with expressions properly', () => {
        const output = 'debug/translations.pot';
        const inputFile = 'tests/fixtures/backtick_with_expressions.js';
        const options = {
            plugins: [[ttagPlugin, { extract: { output } }]],
        };
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('"test with ` backtick with ${ a }"');
    });
});
