import { expect } from 'chai';
import * as babel from '@babel/core';
import fs from 'fs';
import c3po from 'src/plugin';
import { rmDirSync } from 'src/utils';
import dedent from 'dedent';

const output = 'debug/translations.pot';
const options = {
    plugins: [[c3po, { extract: { output }, addComments: true }]],
};

describe('Extract developer comments', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should extract single comment', () => {
        const input = dedent(`
        import { t } from 'ttag';
        
        //test1
        t\`test\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. test1');
    });

    it('should extract multiple comments', () => {
        const input = dedent(`
        import { t } from 'ttag';
        
        //comment1
        //comment2
        t\`test2\`
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. comment1\n#. comment2');
    });

    it('should extract each level of comments', () => {
        const input = dedent(`
        import { t } from 'ttag';

        //comment3-3
        dispatch( /*comment3-2*/ someAction( /*comment3-1*/ t\`test3-1\` ));

        //comment3-6
        const formatted = /*comment3-5*/\`foo \${/*comment3-4*/ t\`test3-2\`} bar\`;

        //comment3-8
        const firstInExpression = /*comment3-7*/ t\`test3-3\` + 'bar';

        //comment3-10
        const middleOfExpression = 'foo' + /*comment3-9*/ t\`test3-4\`;

        //comment3-12
        foo(); foo2(); /*comment3-11*/ console.log(t\`test3-5\`)
        `);
        babel.transform(input, options);
        const result = fs.readFileSync(output).toString();
        expect(result).to.contain('#. comment3-3\n#. comment3-2\n#. comment3-1');
        expect(result).to.contain('#. comment3-6\n#. comment3-5\n#. comment3-4');
        expect(result).to.contain('#. comment3-8\n#. comment3-7');
        expect(result).to.contain('#. comment3-10\n#. comment3-9');
        expect(result).to.contain('#. comment3-11'); // 3-12 is too far away, ignore
    });

    it('should not fail if no comments', () => {
        const input = dedent(`
        import { t } from 'ttag';

        t\`test4\`
        `);
        babel.transform(input, options);
        const fn = () => fs.readFileSync(output).toString();
        expect(fn).to.not.throw;
    });
});
