import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttag from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[ttag, { extract: { output }, addComments: 'translator:' }]],
};

describe('Extract developer comments by tag', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should extract comment comment', () => {
        const input = dedent(`
        import { t } from 'ttag';
        
        //translator: test1
        t\`test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. test1');
    });

    it('should not extract comment', () => {
        const input = dedent(`
        import { t } from 'ttag';
        
        //comment2
        t\`test2\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.not.contain('#. comment2');
    });

    it('should match with spaces after //', () => {
        const input = dedent(`
        import { t } from 'ttag';
        
        // translator: test-comment
        t\`test3\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. test-comment');
    });
});
