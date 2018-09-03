import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3poPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const output = 'debug/translations.pot';
const options = {
    presets: ['@babel/preset-react'],
    plugins: [[c3poPlugin, {
        extract: { output },
        numberedExpressions: true,
    }]],
};

describe('Numbered expressions extract', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract from t tag', () => {
        const input = `
        import { t } from 'ttag';
        console.log(t\`Hello \${ fn() } \${ fn2() }\`);
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('Hello ${ 0 } ${ 1 }');
    });

    it('should extract from ngettext func', () => {
        const input = `
        import { ngettext, msgid } from 'ttag';
        ngettext(msgid\`\${ fn() } banana\`, \`\${ fn2() }\ bananas\`, fn());
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('${ 0 } banana');
        expect(result).to.contain('${ 0 } bananas');
    });
    it('should extract from jt tag', () => {
        const input = `
        import { jt } from 'ttag';
        import React from 'react';
        const component = () => {
            return <div>{ jt\`react comp - \${fn()}\` }</div>
        }
        `;
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('react comp - ${ 0 }');
    });
});
