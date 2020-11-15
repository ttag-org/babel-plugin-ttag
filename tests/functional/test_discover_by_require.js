import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import dedent from 'dedent';
import path from 'path';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';

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

    it('should extreact t from require from file', () => {
        const inputFile = 'tests/fixtures/test_require_discover.js';
        babel.transformFileSync(path.join(process.cwd(), inputFile), options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.include('starting count up to');
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

    it('should recognize alias from require', () => {
        const input = dedent(`
        const { t: i18n } = require('ttag');
        i18n\`test alias\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid "test alias"');
    });
});
