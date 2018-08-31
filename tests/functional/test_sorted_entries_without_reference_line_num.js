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
        extract: {
            output,
            location: 'file',
        },
        discover: ['t'],
        sortByMsgid: true,
    }]],
};

describe('Sorting entries by msgid (with file location, but without line number)', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should sort message identifiers and file location comments', () => {
        const inputFile = 'tests/fixtures/sort_by_msgid_input.js';
        const inputFile2 = 'tests/fixtures/sort_by_msgid_input2.js';
        const expectedPath = 'tests/fixtures/expected_sort_by_msgid_withou_reference_line_num.pot';
        // here we use reverse order of files, expected that references will be sorted
        babel.transformFileSync(path.join(process.cwd(), inputFile2), options);
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
