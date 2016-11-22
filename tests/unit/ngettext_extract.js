import { expect } from 'chai';
import ngettext from 'src/extractors/ngettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Config from 'src/config';
const { MSGID, MSGID_PLURAL, MSGSTR } = PO_PRIMITIVES;

const enConfig = new Config();

describe('ngettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('nt(n, `${n} bananas`)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('${ n } banana');
    });

    it('should extract proper msgplural ', () => {
        const node = template('nt(n, `${n} bananas`)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        expect(result[MSGID_PLURAL]).to.eql('${ n } bananas');
    });

    it('should extract proper msgstr', () => {
        const node = template('nt(n, `${n} bananas`)`${n} banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        const msgStr = result[MSGSTR];
        expect(msgStr).to.have.property('length');
        expect(msgStr.length).to.eql(2);
        expect(msgStr[0]).to.eql('${ n } banana');
        expect(msgStr[1]).to.eql('${ n } bananas');
    });

    it('should throw if not enugh plural forms', () => {
        const node = template('nt(n)`${n} banana`')().expression;
        const func = () => ngettext.extract({ node }, enConfig);
        expect(func).to.throw(/expected 2 plural forms for "nt" func, but - received 0/);
    });

    it('should extract proper structure without expressions', () => {
        const node = template('nt(n, `bananas`)`banana`')().expression;
        const result = ngettext.extract({ node }, enConfig);
        const expected = {
            msgid: 'banana',
            msgid_plural: 'bananas',
            msgstr: ['banana', 'bananas'],
        };
        expect(result).to.eql(expected);
    });
});
