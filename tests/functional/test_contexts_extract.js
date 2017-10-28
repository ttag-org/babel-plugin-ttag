import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[c3po, { extract: { output } }]],
};

const expect1 = `import { c, t } from 'c-3po';
c('email').t\`test\`;
console.log(t\`test\`);
c('email').t\`test2\`;
console.log(t\`test2\`);`;

const expect2 = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Plural-Forms: nplurals=2; plural=(n!=1);\\n"

msgid "test"
msgstr ""

msgid "test2"
msgstr ""

msgctxt "email"
msgid "test"
msgstr ""

msgctxt "email"
msgid "test2"
msgstr ""`;

describe('Contexts extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract "t" with context', () => {
        const input = dedent(`
            import { c, t } from 'c-3po';
            c('email').t\`test\`;
            console.log(t\`test\`);
            c('email').t\`test2\`;
            console.log(t\`test2\`);
        `);

        const babelResult = babel.transform(input, options);
        expect(babelResult.code).to.eql(expect1);

        const result = fs.readFileSync(output).toString();
        expect(result).to.eql(expect2);
    });

    it('should throw if context argument is not string', () => {
        const input = dedent(`
            import { c, t } from 'c-3po';
            c(aaa).t\`test\`;
        `);

        const fn = () => babel.transform(input, options);
        expect(fn).to.throw('Expected string as a context argument. Actual - "aaa"');
    });

    it('should throw if has more than 1 argument', () => {
        const input = dedent(`
            import { c, t } from 'c-3po';
            c('email', 'profile').t\`test\`;
        `);

        const fn = () => babel.transform(input, options);
        expect(fn).to.throw('Context function accepts only 1 argument but has 2 instead');
    });

    it('should discover context by alias', () => {
        const input = dedent(`
            import { c as msgctxt, t } from 'c-3po';
            msgctxt('phone').t\`test\`;
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgctxt "phone"');
    });
});
