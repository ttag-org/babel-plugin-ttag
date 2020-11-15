import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import path from 'path';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('Contexts extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract context from file with filename', () => {
        const output = 'debug/translations.pot';
        const options = {
            plugins: [[c3po, { extract: { output } }]],
        };
        const inputFile = 'tests/fixtures/test_context.js';
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain(
            '#: tests/fixtures/test_context.js:3\nmsgctxt "test ctx"\nmsgid "test"\nmsgstr ""',
        );
    });
});
