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

    it('should sort entries by msgid', () => {
        const expectedPath = 'tests/fixtures/expected_sort.pot';
        const input = `
        t\`bbbb\`;
        t\`aaaaa\`;
        t\`ccccc\`;
        t\`fffff\`;
        t\`eeeee\`;
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
