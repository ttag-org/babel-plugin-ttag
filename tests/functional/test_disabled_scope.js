import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
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
            import { t } from 'ttag';
            function test() {
                /* ${DISABLE_COMMENT} */
                console.log(t\`test\`);
            }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
        expect(result).to.contain('console.log(t`test`);');
    });
    it('should not strip gettext tag if has disabling comment in parent scope', () => {
        const input = `
            import { t } from 'ttag';
            function test() {
                /* ${DISABLE_COMMENT} */
                function test2() {
                    console.log(t\`test\`);
                }
            }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
        expect(result).to.contain('console.log(t`test`);');
    });
    it('should not strip gettext tag if has disabling comment after some expressions', () => {
        const input = `
            import { t } from 'ttag';
            const trans = function() {
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
        expect(result).to.contain('console.log(t`test`);');
    });

    it('should strip gettext tag if has eslint disable for eslint-plugin-ttag', () => {
        const input = `
            import { t } from 'ttag';
            const trans = function() {
              const a = 5;
              /* eslint-disable ttag/no-start-and-trailing-spaces-in-translations */
              for (index = i = 0, len = pieces.length; i < len; index = ++i) {
                 console.log(t\`test\`);
              }
              return result;
            };
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("test");');
        expect(result).not.to.contain('console.log(t`test`);');
    });
});
