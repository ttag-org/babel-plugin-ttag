import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['@babel/preset-env'],
    plugins: [[c3poPlugin, {
        resolve: { translations },
    }]],
};

describe('Resolve default', () => {
    before(() => {
        rmDirSync('debug');
    });
    it('should not strip gettext tag if has disabling comment in scope', () => {
        const input = `
            function test() {
                /* ${DISABLE_COMMENT} */
                console.log(t\`test\`);
            }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
    });
    it('should not strip gettext tag if has disabling comment in parent scope', () => {
        const input = `
            function test() {
                /* ${DISABLE_COMMENT} */
                function test2() {
                    console.log(t\`test\`);
                }
            }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
    });
    it('should not strip gettext tag if has disabling comment after some expressions', () => {
        const input = `
           
            trans = function() {
              const a = 5;
              /* ${DISABLE_COMMENT} */
              for (index = i = 0, len = pieces.length; i < len; index = ++i) {
                 console.log(t\`test\`);
              }
              return result;
            };
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
    });
});
