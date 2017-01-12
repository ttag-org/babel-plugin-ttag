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
        discover: ['nt'],
    }]],
};

describe('Resolve tag-ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expected = '_ngettext(n, ' +
            '["plural form with " + n + " plural [translated]", "plural form with " + n + " plurals [translated]"])';
        const input = 'const n = 1; ' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should resolve proper plural form for member expression', () => {
        const expected = '_ngettext(item.n, ' +
            '["plural form with " + item.n + " plural [translated]", ' +
            '"plural form with " + item.n + " plurals [translated]"])';
        const input = 'const n = 1; ' +
            'console.log(nt(item.n)`plural form with ${item.n} plural`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should not include ngettext function multiple times', () => {
        const input = 'const n = 1;\n' +
            'console.log(nt(n)`plural form with ${n} plural`);\n' +
            'console.log(nt(n)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        expect(result.match(/_tag_ngettext/g).length).to.eql(3);
    });

    it('should work when n is Literal', () => {
        const expected = 'console.log("plural form with " + n + " plural [translated]")';
        const input = 'console.log(nt(1)`plural form with ${n} plural`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);

        const expected2 = 'console.log("plural form with " + n + " plurals [translated]")';
        const input2 = 'console.log(nt(2)`plural form with ${n} plural`);';
        const result2 = babel.transform(input2, options).code;
        expect(result2).to.contain(expected2);
    });

    it('should resolve original string if no translator notes', () => {
        const input = 'console.log(nt(n)`no translator notes plural`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes plural");');
    });

    it('should resolve original formatted string if no translator notes', () => {
        const input = 'console.log(nt(n)`no translator notes plural formatted ${ a }`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes plural formatted " + a);');
    });

    it('should resolve original formatted string if msgid is not found in po', () => {
        const input = 'console.log(nt(5)`some random string ${a}`);';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("some random string " + a);');
    });

    it('should throw if has invalid expressions', () => {
        const input = 'console.log(nt(n)`some random string ${ n + 1 }`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
    });

    it('should throw if invalid plural argument format', () => {
        const input = 'console.log(nt(n + 1)`some random string`);';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('BinaryExpression \'n + 1\' can not be used as plural number argument');
    });

    it('should use proper plural form', () => {
        mkdirp('debug');
        const resultPath = 'debug/ngettext_result.js';
        const input = 'const a = parseInt(process.env.TEST_A, 10);\n' +
            'process.stdout.write(nt(a)`plural form with ${ a } plural`);';
        const result = babel.transform(input, options).code;
        fs.writeFileSync(resultPath, result, { mode: 0o777 });
        const { stdout: stdout1 } = childProcess.spawnSync(process.argv[0], [resultPath], { env: { TEST_A: 1 } });
        expect(stdout1.toString()).to.eql('plural form with 1 plural [translated]');
        const { stdout: stdout2 } = childProcess.spawnSync(process.argv[0], [resultPath], { env: { TEST_A: 2 } });
        expect(stdout2.toString()).to.eql('plural form with 2 plurals [translated]');
    });

    it('should resolve with indent', () => {
        const input = `console.log(nt(n)\`
            first line plural
            second line plural
            third line plural\`);`;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('translation plural');
        expect(result).to.contain('translation plurals');
    });
});
