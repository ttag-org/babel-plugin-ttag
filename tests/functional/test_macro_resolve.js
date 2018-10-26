import { expect } from 'chai';
import * as babel from '@babel/core';
import dedent from 'dedent';

const options = {
    plugins: ['macros'],
    filename: __filename,
};

describe('Macro resolve', () => {
    before(() => {
        // FIXME: mock `cosmiconfig`
        // rewiremock('cosmiconfig').with({
        //     searchSync: () => ({
        //         config: {
        //             ttag: {
        //                 resolve: {
        //                     translations: 'tests/fixtures/resolve_simple_gettext.po',
        //                 },
        //             },
        //         },
        //     }),
        // });
    });
    after(() => {});

    it('should resolve translation', () => {
        const input = dedent(`
            import { t } from "../../src/ttag.macro";
            console.log(t\`simple string literal\`);
        `);
        const babelResult = babel.transform(input, options);
        expect(babelResult.code).to.contain('"simple string literal translated"');
    });

    it('should throw if meet unrecognized import', () => {
        const input = dedent(`
            import { tt } from "../../src/ttag.macro";
            console.log(tt\`simple string literal\`);
        `);
        const fn = () => babel.transform(input, options);
        expect(fn).to.throw('Invalid import: tt');
    });
});
