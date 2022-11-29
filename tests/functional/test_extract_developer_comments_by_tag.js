import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttag from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
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
    it('should extract comments inside JSX tags', () => {
        const input = dedent(`
              import { c } from 'ttag';


              function render() {
                return (<>
                    <h1>{
                      // translator: this comment is for you AND IT WILL WORK
                      c('valid-comment-1').t\`Title de ouf\`
                    }</h1>

                    <h2>{
                      // this comment is NOT for you 
                      c('invalid-comment').t\`Title de ouf pas ok?\`
                    }</h2>
                    <h2>{
                      /* translator: OKAY this comment is for you */
                      c('valid-comment-2').t\`Title de ouf ok?\`
                    }</h2>

                  <h3>{c('no-comment').t\`hahaha\`}</h3>
                </>)

              }
          `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. OKAY this comment is for you');
        expect(result).to.contain('#. this comment is for you AND IT WILL WORK');
        expect(result).not.to.contain('#. this comment is NOT for you');

        const entries = result.split('\n\n');

        const validComment1 = entries.find((text) => text.includes('valid-comment-1'));
        const noComment = entries.find((text) => text.includes('no-comment'));
        const invalidComment = entries.find((text) => text.includes('invalid-comment'));
        expect(noComment).not.to.contain('#.');
        expect(invalidComment).not.to.contain('#.');
        expect(validComment1).to.contain('#. this comment is for you AND IT WILL WORK');
    });
});
