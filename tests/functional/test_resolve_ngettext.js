import { expect } from 'chai';
import * as babel from 'babel-core';
import fs from 'fs';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import mkdirp from 'mkdirp';
import childProcess from 'child_process';

const pofile = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { locale: 'en-us' },
        locales: {
            'en-us': pofile,
        },
    }]],
};

describe('Resolve ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expected = '_ngettext(n, ' +
            '["plural form with " + n + " plural [translated]", "plural form with " + n + " plurals [translated]"])';
        const input = 'const n = 1; ' +
            'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should resolve proper plural form for member expression', () => {
        const expected = '_ngettext(item.n, ' +
            '["plural form with " + item.n + " plural [translated]", ' +
            '"plural form with " + item.n + " plurals [translated]"])';
        const input = 'const n = 1; ' +
            'console.log(ngettext(msgid`plural form with ${item.n} plural`, ' +
            '`plural form with ${item.n} plurals`, item.n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should not include ngettext function multiple times', () => {
        const input = 'const n = 1;\n' +
            'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));\n' +
            'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result.match(/_tag_ngettext/g).length).to.eql(3);
    });

    it('should work when n is Literal', () => {
        const expected = 'console.log("plural form with " + n + " plural [translated]")';
        const input = 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, 1));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);

        const expected2 = 'console.log("plural form with " + n + " plurals [translated]")';
        const input2 = 'console.log(ngettext(msgid`plural form with ${n} plural`, ' +
            '`plural form with ${n} plurals`, 2));';
        const result2 = babel.transform(input2, options).code;
        expect(result2).to.contain(expected2);
    });

    it('should throw if has invalid expressions', () => {
        const input = 'console.log(ngettext(msgid`no translation plural ${n + 1}`, `no translation plurals`, n));';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should throw if has invalid plural argument format', () => {
        const input = 'console.log(ngettext(msgid`no translation plural ${n}`, `no translation plurals ${n}`, n + 1));';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('BinaryExpression \'n + 1\' can not be used as plural argument');
    });

    it('should use proper plural form', () => {
        mkdirp('debug');
        const resultPath = 'debug/ngettext_result.js';
        const input = 'const a = parseInt(process.env.TEST_A, 10);\n' +
            'process.stdout.write(ngettext(msgid`plural form with ${ a } plural`, ' +
            '`plural form with ${ a } plurals`, a));';
        const result = babel.transform(input, options).code;
        fs.writeFileSync(resultPath, result, { mode: 0o777 });
        const { stdout: stdout1 } = childProcess.spawnSync(process.argv[0], [resultPath], { env: { TEST_A: 1 } });
        expect(stdout1.toString()).to.eql('plural form with 1 plural [translated]');
        const { stdout: stdout2 } = childProcess.spawnSync(process.argv[0], [resultPath], { env: { TEST_A: 2 } });
        expect(stdout2.toString()).to.eql('plural form with 2 plurals [translated]');
    });

    it('should resolve with indent', () => {
        const input = `console.log(
        ngettext(msgid\`first line plural
                        second line plural\`,
                 \`first line plural
                 second line plurals\`, n))`;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('translation plural');
        expect(result).to.contain('translation plurals');
    });
});

describe('Resolve ngettext default', () => {
    it('should resolve original strings if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural`, `no translation plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log(_tag_ngettext("no translation plural", "no translation plurals", n));');
    });

    it('should resolve original formatted strings if no translator notes', () => {
        const input = 'console.log(ngettext(msgid`no translation plural ${n}`, `no translation plurals ${n}`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(
            'console.log(_tag_ngettext("no translation plural " + n, "no translation plurals " + n, n));');
    });

    it('should resolve default strings with indent', () => {
        const input = 'ngettext(msgid`  test\n  test`, `  test\n  tests`, n)';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('_tag_ngettext("test\\ntest", "test\\ntests", n);');
    });
});
