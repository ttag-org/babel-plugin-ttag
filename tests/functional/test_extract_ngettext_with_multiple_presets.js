import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Extract ngettext with multiple presets', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract ngettext with multiple presets', () => {
        const output = 'debug/translations.pot';
        const options = {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [[c3poPlugin, { extract: { output }, discover: ['ngettext'] }]],
        };
        const input = '<div>{ngettext(msgid`test`, `test`, n)}</div>';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain(
            `msgid "test"\nmsgid_plural "test"\nmsgstr[0] ""\nmsgstr[1] ""`);
    });
});
