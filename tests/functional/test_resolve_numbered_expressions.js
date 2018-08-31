import { expect } from 'chai';
import * as babel from '@babel/core';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const translations = 'tests/fixtures/resolve_numbered_expressions.po';

const options = {
    presets: ['@babel/preset-react'],
    plugins: [[c3poPlugin, {
        resolve: { translations },
        numberedExpressions: true,
    }]],
};

describe('Resolve tag-gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve t tag', () => {
        const input = `
        import { t } from 'ttag';
        console.log(t\`Hello \${ name }\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('Hello ${name} [translated]');
    });

    it('should resolve t tag default', () => {
        const input = `
        import { t } from 'ttag';
        console.log(t\`Hello not translated \${ name }\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('`Hello not translated ${name}`');
    });

    it('should resolve correct positions for expressions in t tag', () => {
        const input = `
        import { t } from 'ttag';
        console.log(t\`reverse \${ name }\ \${ surname }\`);
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('reverse ${surname} ${name} [translated]');
    });

    it('should resolve ngettext func', () => {
        const input = `
        import { ngettext, msgid } from 'ttag';
        ngettext(msgid\`\${ fn() } banana\`, \`\${ fn() }\ bananas\`, fn());
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('${fn()} banana [translated]');
        expect(result).to.contain('${fn()} bananas [translated]');
    });

    it('should resolve correct positions for ngettext func', () => {
        const input = `
        import { ngettext, msgid } from 'ttag';
        ngettext(msgid\`\${ a() } \${ b() } banana\`, 
        \`\${ a() }\ \${ b() }\ bananas\`, n());
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('${b()} ${a()} banana [translated]');
        expect(result).to.contain('${b()} ${a()} bananas [translated]');
    });

    it('should resolve jt func', () => {
        const input = `
        import { jt } from 'ttag';
        import React from 'react';
        const component = () => {
            return <div>{ jt\`react comp - \${fn()}\` }</div>
        }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('["react comp - ", fn(), " [translated]"]');
    });

    it('should resolve jt func default', () => {
        const input = `
        import { jt } from 'ttag';
        import React from 'react';
        const component = () => {
            return <div>{ jt\`react comp2 - \${fn()}\` }</div>
        }
        `;
        const result = babel.transform(input, options).code;
        expect(result).to.contain('["react comp2 - ", fn()]');
    });
});
