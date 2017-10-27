import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[c3po, { extract: { output } }]],
};

describe('Contexts extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract "t" with context', () => {
        const input = dedent(`
            import { c, t } from 'c-3po';
            c('email').t\`test\`;
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        console.log(result);
        // expect(result).to.contain('#. test1');
    });
});
