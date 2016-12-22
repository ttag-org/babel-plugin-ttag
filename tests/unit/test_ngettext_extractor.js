import template from 'babel-template';
import ngettext from 'src/extractors/ngettext';
import Config from 'src/config';
import { expect } from 'chai';

const enConfig = new Config();

describe('ngettext match', () => {
    it('should match gettext', () => {
        const node = template('ngettext(msgid`test`, `test`, `test`)')().expression;
        const result = ngettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });
});

