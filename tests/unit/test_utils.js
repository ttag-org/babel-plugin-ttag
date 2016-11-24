import { expect } from 'chai';
import template from 'babel-template';
import { template2Msgid } from 'src/utils';


describe('utils template2Msgid', () => {
    it('should extract msgid with expressions', () => {
        const node = template('nt(n)`${n} banana ${ b }`')().expression;
        const expected = '${ 0 } banana ${ 1 }';
        expect(template2Msgid(node)).to.eql(expected);
    });

    it('should extract msgid with expressions', () => {
        const node = template('t`banana`')().expression;
        const expected = 'banana';
        expect(template2Msgid(node)).to.eql(expected);
    });
});
