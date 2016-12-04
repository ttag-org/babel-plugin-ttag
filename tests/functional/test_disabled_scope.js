import { expect } from 'chai';
import * as babel from 'babel-core';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import { DISABLE_COMMENT } from 'src/defaults';

const pofile = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { locale: 'en-us' },
        locales: {
            'en-us': pofile,
        },
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
    it('should not strip gettext tag if has disabling comment in the root scope', () => {
        const input = `
            /* ${DISABLE_COMMENT} */
            
            function test() {
                function test2() {
                    console.log(t\`test\`);
                }
            }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.not.contain('console.log("test");');
    });
});

