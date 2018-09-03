import { expect } from 'chai';
import gettext from 'src/extractors/jsxtag-gettext';
import template from '@babel/template';
import Context from 'src/context';

const enConfig = new Context();

describe('jsxtag-gettext match', () => {
    it('should match gettext', () => {
        const node = template('jt`${n} banana`')().expression;
        const result = gettext.match(node, enConfig);
        expect(result).to.be.true;
    });
});
