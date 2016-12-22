import template from 'babel-template';
import ngettext from 'src/extractors/ngettext';
import Config from 'src/config';
import { expect } from 'chai';
import { PO_PRIMITIVES } from 'src/defaults';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

const enConfig = new Config();

describe('ngettext extract', () => {
    it('should extract proper msgid1', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('${ 0 } banana');
    });

    it('should extract proper msgidplural', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID_PLURAL]).to.eql('${ 0 } bananas');
    });

    it('should extract proper msgstr', () => {
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract({ node }, enConfig);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(2);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
    });

    it('should extract valid number of msgstrs', () => {
        const headers = {
            'content-type': 'text/plain; charset=UTF-8',
            'plural-forms': 'nplurals=3; plural=(n!=1);',
        };
        const config = new Config({ extract: { headers } });
        const node = template('ngettext(msgid`${ n } banana`, `${ n } bananas`, n)')().expression;
        const result = ngettext.extract({ node }, config);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(3);
        expect(msgStr[0]).to.eql('');
        expect(msgStr[1]).to.eql('');
        expect(msgStr[2]).to.eql('');
    });
});

describe('ngettext match', () => {
    it('should match gettext', () => {
        const node = template('ngettext(msgid`test`, `test`, `test`)')().expression;
        const result = ngettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });
});

