import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Extract ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract simple gettext literal (without formatting)', () => {
        const output = 'debug/translations.pot';
        const options = {
            presets: ['es2015', 'react'],
            plugins: [[c3poPlugin, { extract: { output }, discover: ['ngettext'] }]],
        };
        const input = '<div>{ngettext(msgid`test`, `test`, n)}</div>';
        const transResult = babel.transform(input, options);
        console.log(transResult.code);
        const result = fs.readFileSync(output).toString();
        console.log(result);
    });
});
