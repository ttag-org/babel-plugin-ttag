import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import ttagPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

describe('Extract ngettext with multiple presets', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract ngettext with multiple presets', () => {
        const output = 'debug/translations.pot';
        const options = {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [[ttagPlugin, { extract: { output }, discover: ['ngettext'] }]],
        };
        const input = '<div>{ngettext(msgid`test`, `test`, n)}</div>';
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain(
            'msgid "test"\nmsgid_plural "test"\nmsgstr[0] ""\nmsgstr[1] ""',
        );
    });

    it('regression test failed msigd validation on multiple traverse', () => {
        const output = 'debug/translations.pot';
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [[ttagPlugin, { extract: { output } }]],
        };
        const input = `
        import { ngettext, msgid } from 'ttag';

        export function* foo(length) {
        yield bar(ngettext(
            msgid\`Foo \${length}\`,
            \`Foo \${length}\`,
            length,
        ));
        }
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('msgid_plural "Foo ${ length }"');
    });
    it('regression test failed msigd validation on multiple traverse without resolve and extract config', () => {
        const options = {
            presets: ['@babel/preset-env'],
            plugins: [[ttagPlugin, {}]],
        };
        const input = `
        import { ngettext, msgid } from 'ttag';

        export function* foo(length) {
        yield bar(ngettext(
            msgid\`Foo \${length}\`,
            \`Foo \${length}\`,
            length,
        ));
        }
        `;
        const fn = () => babel.transform(input, options);
        expect(fn).to.not.throw();
    });
});
