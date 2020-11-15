import { expect } from 'chai';
import * as babel from '@babel/core';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/ua.po';

describe('Test po resolve', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [[ttagPlugin, {
                resolve: { translations },
                discover: ['ngettext'],
            }]],
        };
        const expected = 'n % 10 == 1 && n % 100 != 11 ? 0 : '
            + 'n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2';
        const input = 'const n = 1; '
            + 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });
    it('should remove imports on resolve', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        import { t } from "ttag"
        t\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('import');
        expect(result).to.contain('test [translated]');
    });
    it('should remove require on resolve', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        const { t } = require("ttag");
        t\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('require');
        expect(result).to.contain('test [translated]');
    });
    it('should add stub for addLocale for require', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        const { t, addLocale } = require("ttag");
        addLocale('en', {});
        t\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('require');
        expect(result).to.contain('test [translated]');
        expect(result).to.contain('function addLocale()');
    });
    it('should add stub for addLocale for require alias', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        const { t, addLocale: addi18nLocale } = require("ttag");
        addLocale('en', {});
        t\`test\`
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('require');
        expect(result).to.contain('test [translated]');
        expect(result).to.contain('function addi18nLocale()');
    });
    it('should add stub for addLocale fun for import', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        import { t, addLocale } from "ttag"
        t\`test\`
        addLocale('en', {});
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('import');
        expect(result).to.contain('test [translated]');
        expect(result).to.contain('function addLocale()');
    });
    it('should add stub for addLocale if import specifier', () => {
        const options = {
            plugins: [[ttagPlugin, {
                resolve: { translations },
            }]],
        };
        const input = `
        import { t, addLocale as addi18nLocale } from "ttag"
        t\`test\`
        addi18nLocale('en', {});
        `;
        const result = babel.transform(input, options).code;
        expect(result).not.to.contain('import');
        expect(result).to.contain('test [translated]');
        expect(result).to.contain('function addi18nLocale()');
    });
});
