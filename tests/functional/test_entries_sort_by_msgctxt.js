import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttag from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';

describe('Sorting entries by msgctxt', () => {
    beforeEach(() => {
        rmDirSync('debug');
    });

    it('should sort entries by msgctxt', () => {
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [
                [
                    ttag,
                    {
                        extract: { output },
                        sortByMsgctxt: true,
                        sortByMsgid: false,
                    },
                ],
            ],
        };

        const expectedPath = 'tests/fixtures/expected_sort_by_msgctx.pot';
        const input = dedent(`
            import { c, t } from 'ttag';
            c('ee').t\`cc\`;
            c('bb').t\`aa\`;
            c('ee').t\`aa\`;
            c('dd').t\`aa\`;
            c('cc').t\`aa\`;
            c('aa').t\`aa\`;
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });

    it('should sort entries by msgctxt and msgid', () => {
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [
                [
                    ttag,
                    {
                        extract: { output },
                        sortByMsgctxt: true,
                        sortByMsgid: true,
                    },
                ],
            ],
        };

        const expectedPath = 'tests/fixtures/expected_sort_by_msgctxt_and_msgid.pot';
        const input = dedent(`
            import { c, t } from 'ttag';
            c('ee').t\`cc\`;
            c('bb').t\`aa\`;
            c('ee').t\`aa\`;
            c('dd').t\`aa\`;
            c('cc').t\`aa\`;
            c('aa').t\`aa\`;
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        const expected = fs.readFileSync(expectedPath).toString();
        expect(result).to.eql(expected);
    });
});
