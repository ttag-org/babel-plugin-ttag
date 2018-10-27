import { expect } from 'chai';
import * as babel from '@babel/core';
import dedent from 'dedent';
import childProcess from 'child_process';

const options = {
    plugins: ['macros'],
    filename: __filename,
};

describe('Macro resolve', () => {
    it('should resolve translation', () => {
        const out = childProcess.execSync(
            'babel index.js',
            { cwd: 'tests/fixtures/macro' }
        ).toString();
        expect(out).to.contain('"simple string literal translated"');
    });

    it('should throw if meet unrecognized import', () => {
        const input = dedent(`
            import { tt } from "../../src/ttag.macro";
            console.log(tt\`simple string literal\`);
        `);
        const fn = () => babel.transform(input, options);
        expect(fn).to.throw('Invalid import: tt');
    });
});
