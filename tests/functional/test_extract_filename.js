import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import path from 'path';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('Extract comments', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract relative filename path to source file in comments', () => {
        const output = 'debug/translations.pot';
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [[c3poPlugin, { extract: { output } }]],
        };
        const inputFile = 'tests/fixtures/test_file_with_gettext.js';
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.include('#: tests/fixtures/test_file_with_gettext.js:4');
    });
});
