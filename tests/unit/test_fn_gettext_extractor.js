import { expect } from 'chai';
import gettext from 'src/extractors/fn-gettext';
import template from 'babel-template';
import { PO_PRIMITIVES } from 'src/defaults';
import Config from 'src/config';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

const enConfig = new Config();

// describe('gettext extract', () => {
//     it('should extract proper msgid ', () => {
//         const node = template('t`${n} banana`')().expression;
//         const result = gettext.extract({ node }, enConfig);
//         expect(result[MSGID]).to.eql('${ 0 } banana');
//     });
//
//     it('should extract proper msgstr', () => {
//         const node = template('t`${n} banana`')().expression;
//         const result = gettext.extract({ node }, enConfig);
//         expect(result[MSGSTR]).to.eql('');
//     });
//
//     it('should extract proper structure without expressions', () => {
//         const node = template('t`banana`')().expression;
//         const result = gettext.extract({ node }, enConfig);
//         const expected = {
//             msgid: 'banana',
//             msgstr: '',
//         };
//         expect(result).to.eql(expected);
//     });
//
//     it('should not throw if numeric literal', () => {
//         const node = template('t`banana ${ 1 }`')().expression;
//         const fn = () => gettext.extract({ node }, enConfig);
//         expect(fn).to.not.throw();
//     });
//
//     it('should throw if has invalid expressions', () => {
//         const node = template('t`banana ${ n + 1}`')().expression;
//         const fn = () => gettext.extract({ node }, enConfig);
//         expect(fn).to.throw('You can not use BinaryExpression \'${n + 1}\' in localized strings');
//     });
// });

describe('gettext match', () => {
    it('should match gettext', () => {
        const node = template('gettext("banana")')().expression;
        const result = gettext.match({ node }, enConfig);
        expect(result).to.be.true;
    });
});
