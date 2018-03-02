import { expect } from 'chai';
import C3poContext from 'src/context';

const DEFAULT_PO_DATA = {
    headers:
    {
        'content-type': 'text/plain; charset=UTF-8',
        'plural-forms': 'nplurals = 2; plural = (n !== 1)',
    },
    translations: { '': {} },
};

const ukHeaders = {
    'content-type': 'text/plain; charset=UTF-8',
    'plural-forms': 'nplurals = 3; plural = (n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)' // eslint-disable-line
};

const ukPoData = {
    headers: ukHeaders,
    translations: { '': {} },
};

describe('C3poContext.getDefaultHeaders', () => {
    it('should set correct default plural headers', () => {
        const config = { defaultLang: 'uk' };
        const context = new C3poContext(config);
        expect(context.getDefaultHeaders()).to.eql(ukHeaders);
    });

    it('should set default po data if translations: "default"', () => {
        const config = {
            resolve: { translations: 'default' },
        };
        const context = new C3poContext(config);
        expect(context.poData).to.eql(DEFAULT_PO_DATA);
    });

    it('should get proper headers with translations: "default" and defaultLang', () => {
        const config = {
            defaultLang: 'uk',
            resolve: { translations: 'default' },
        };
        const context = new C3poContext(config);
        expect(context.poData).to.eql(ukPoData);
    });
});
