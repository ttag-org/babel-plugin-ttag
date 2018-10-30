import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttag from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';

const options = {
    plugins: [[ttag, { extract: { output } }]],
};

describe('Contexts extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract by alias from import', () => {
        const input = dedent(`
        import { t as alias } from 'ttag';
        alias\`alias extract test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('alias extract test');
    });

    it('should extract by alias from require', () => {
        const input = dedent(`
        const { t: alias } = require('ttag');
        alias\`alias extract test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('alias extract test');
    });

    it('should extract with multiple aliases for the same func', () => {
        const input = dedent(`
        import { t as alias } from 'ttag';
        import { t as alias2 } from 'ttag';
        alias\`alias1 extract test\`
        alias2\`alias2 extract test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('alias1 extract test');
        expect(result).to.contain('alias2 extract test');
    });
});
