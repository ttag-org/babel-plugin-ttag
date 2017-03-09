import { expect } from 'chai';
import gettext from 'src/extractors/jsxtag-gettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Context from 'src/context';

const { MSGID } = PO_PRIMITIVES;

const enConfig = new Context();

describe('jsxtag-gettext extract', () => {
    it('should extract proper msgid ', () => {
        const node = template('jt`${n} banana`')().expression;
        const result = gettext.extract({ node }, enConfig);
        expect(result[MSGID]).to.eql('${ 0 } banana');
    });
});

describe('jsxtag-gettext match', () => {
    it('should match gettext', () => {
        const node = template('jt`${n} banana`')().expression;
        const result = gettext.match(node, enConfig);
        expect(result).to.be.true;
    });
});
