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

const expect2 = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Plural-Forms: nplurals=2; plural=(n!=1);\\n"

msgid "test"
msgstr ""

msgid "test2"
msgstr ""
`;

describe('Macro extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract translations from macro', () => {
        const input = dedent(`
            import { t, jt } from 'babel-plugin-ttag/dist/ttag.macro';
            console.log(t\`test\`);
            console.log(jt\`test2\`);
        `);

        const babelResult = babel.transform(input, options);
        expect(babelResult.code).to.eql(input);

        const result = fs.readFileSync(output).toString();
        expect(result).to.eql(expect2);
    });
});
