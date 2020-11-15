import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('javascript-format extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should add js format', () => {
        const output = 'debug/translations1.pot';
        const options = {
            plugins: [[ttagPlugin, { extract: { output } }]],
        };
        const input = `
        import { t } from "ttag";
        t\`use js formatting test \${a}\`
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#, javascript-format\nmsgid "use js formatting test ${ a }"');
    });
    it('should not add js format', () => {
        const output = 'debug/translations2.pot';
        const options = {
            plugins: [[ttagPlugin, { extract: { output } }]],
        };
        const input = `
        import { t } from "ttag";
        t\`don't use js formatting test\`
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.not.contain('#, javascript-format\nmsgid "don\'t use js formatting test"');
    });
});
