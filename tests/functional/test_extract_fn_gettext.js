import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const output = 'debug/translations.pot';
const options = {
    plugins: [[ttagPlugin, { extract: { output }, discover: ['gettext', '_'] }]],
};

describe('Extract tag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract from gettext fn', () => {
        const input = 'console.log(gettext("gettext test"));';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "gettext test"');
    });

    it('should extract from _ fn', () => {
        const input = 'console.log(_("_ test"));';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "_ test"');
    });
});
