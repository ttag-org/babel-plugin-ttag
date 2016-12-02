import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const output = 'debug/translations.pot';
const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, { extract: { output } }]],
};

describe('Extract tag-ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract ngettext', () => {
        const expectedPath = 'tests/fixtures/expected_ngettext_simple_literal.pot';
        const input = 'console.log(nt(a)`${a} banana`);';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
    it('should throw if has invalid expressions', () => {
        const input = 'nt(n)`banana ${ n + 1}`';
        const fn = () => babel.transform(input, options).code;
        expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });
});
