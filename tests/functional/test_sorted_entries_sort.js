import path from 'path';
import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const output = 'debug/translations.pot';
const options = {
    presets: ['@babel/preset-env'],
    plugins: [[c3poPlugin, {
        extract: { output },
        discover: ['t'],
        sortByMsgid: true,
    }]],
};

describe('Sorting entries by msgid', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should not duplicate reference filenames', () => {
        const inputFile = 'tests/fixtures/sort_by_msgid_input.js';
        const inputFile2 = 'tests/fixtures/sort_by_msgid_input2.js';
        const expectedPath = 'tests/fixtures/expected_sort_by_msgid_sorted.pot';
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        babel.transformFileSync(path.join(process.cwd(), inputFile2), options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
