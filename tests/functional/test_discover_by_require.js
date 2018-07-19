import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[c3po, { extract: { output }, addComments: true }]],
};

describe('Extract developer comments', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should extract t from require', () => {
        const input = dedent(`
        const { t } = require('ttag');
        t\`test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "test"');
    });

    it('should extract jt from require', () => {
        const input = dedent(`
        const { jt } = require('ttag');
        jt\`test jt\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "test jt"');
    });

    it('should extract context from require', () => {
        const input = dedent(`
        const { c } = require('ttag');
        c('context').t\`test context\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "test context"');
    });
});
