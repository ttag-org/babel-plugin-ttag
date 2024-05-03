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

describe('ESM extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract by default import', () => {
        const input = dedent(`
        import defaultTtag from 'ttag';
        const {t} = defaultTtag;
        t\`import default extract test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('import default extract test');
    });

    it('should extract directly from the default import', () => {
        const input = dedent(`
        import ttag from 'ttag';
        ttag.t\`default extract test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('default extract test');
    });
});
