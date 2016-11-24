import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';


describe('Resolve default', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should strip polyglot tags in any case (without resolve config)', () => {
        const expectedPath = 'tests/fixtures/expected_strip_polyglot_tags.js.src';
        const input = 'console.log(t`simple string literal`);';
        const customOpts = {
            presets: ['es2015'],
            plugins: [[polyglotPlugin, {}]],
        };
        const result = babel.transform(input, customOpts).code;
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
