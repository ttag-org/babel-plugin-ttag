import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[c3po, { extract: { output }, addComments: true }]],
};

describe('Extract developer comments', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract single comment', () => {
        const input = dedent(`
        import { t } from 'c-3po';
        
        //test1
        t\`test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. test1');
    });

    it('should extract multiple comments', () => {
        const input = dedent(`
        import { t } from 'c-3po';
        
        //comment1
        //comment2
        t\`test2\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. comment1\n#. comment2');
    });

    it('should not fail if no comments', () => {
        const input = dedent(`
        import { t } from 'c-3po';
        
        t\`test3\`
        `);
        babel.transform(input, options);
        const fn = () => fs.readFileSync(output).toString();
        expect(fn).to.not.throw;
    });
});
