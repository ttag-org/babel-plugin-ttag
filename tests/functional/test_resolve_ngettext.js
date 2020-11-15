import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';
import mkdirp from 'mkdirp';
import childProcess from 'child_process';

const translations = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    plugins: [[c3poPlugin, {
        resolve: { translations },
        discover: ['ngettext'],
    }]],
};

describe('Resolve ngettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve proper plural form of n', () => {
        const expected = '_tag_ngettext(n, [`plural form with ${n} plural [translated]`, `plural form with ${n} plurals [translated]`])';
        const input = 'const n = 1; '
            + 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should resolve proper plural form for member expression', () => {
        const expected = '_tag_ngettext(item.n, [`plural form with ${item.n} plural [translated]`,'
        + ' `plural form with ${item.n} plurals [translated]`])';
        const input = 'const n = 1; '
            + 'console.log(ngettext(msgid`plural form with ${item.n} plural`, '
            + '`plural form with ${item.n} plurals`, item.n));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);
    });

    it('should not include ngettext function multiple times', () => {
        const input = 'const n = 1;\n'
            + 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));\n'
            + 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, n));';
        const result = babel.transform(input, options).code;
        expect(result.match(/_tag_ngettext/g).length).to.eql(3);
    });

    it('should work when n is Literal', () => {
        const expected = 'plural [translated]';
        const input = 'console.log(ngettext(msgid`plural form with ${n} plural`, `plural form with ${n} plurals`, 1));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain(expected);

        const expected2 = 'plurals [translated]';
        const input2 = 'console.log(ngettext(msgid`plural form with ${n} plural`, '
            + '`plural form with ${n} plurals`, 2));';
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
        rmDirSync('debug');
        mkdirp.sync('debug');
        const resultPath = 'debug/ngettext_result.js';
        const input = 'const n = parseInt(process.env.TEST_N, 10);\n'
            + 'process.stdout.write(ngettext(msgid`plural form with ${ n } plural`, '
            + '`plural form with ${ n } plurals`, n));';
        const result = babel.transform(input, options).code;
        fs.writeFileSync(resultPath, result, { mode: 0o777 });

        const { stdout: stdout1 } = childProcess.spawnSync('node', [resultPath],
            { env: Object.assign(process.env, { TEST_N: 1 }) });
        expect(stdout1.toString()).to.eql('plural form with 1 plural [translated]');
        const { stdout: stdout2 } = childProcess.spawnSync('node', [resultPath],
            { env: Object.assign(process.env, { TEST_N: 2 }) });
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

    it('should throw if expression contains typo', () => {
        const input = 'console.log(ngettext(msgid`${ appleCount } apple`, `${ appleCount } apples`, appleCount));';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw(
            'Expression \'appleCount\' is not found in the localized string \'${ count }'
            + ' apples (translated)\'.',
        );
    });
});
