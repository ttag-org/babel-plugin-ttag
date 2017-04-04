import { expect } from 'chai';
import C3poContext from 'src/context';
import { parsePoData } from 'src/po-helpers';
import { DEFAULT_HEADERS } from 'src/defaults';

const DEFAULT_PO_DATA = { headers:
    { 'content-type': 'text/plain; charset=UTF-8', 'plural-forms': 'nplurals=2; plural=(n!=1);' },
    translations: { '': {} },
};

describe('C3poContext.getHeaders', () => {
    it('should resolve proper headers if defaultHeaders is set as object', () => {
        const config = {
            defaultHeaders: {
                'plural-forms': 'plural-forms',
            },
        };
        const contextInstance = new C3poContext(config);
        expect(contextInstance.getHeaders()).to.eql(config.defaultHeaders);
    });

    it('should resolve default headers if defaultHeaders is missing', () => {
        const config = {};
        const configInstance = new C3poContext(config);
        expect(configInstance.getHeaders()).to.eql(DEFAULT_HEADERS);
    });

    it('should read headers from file if defaultHeaders is a string', () => {
        const config = {
            defaultHeaders: 'tests/fixtures/ua.po',
        };
        const { headers } = parsePoData('tests/fixtures/ua.po');
        const contextInstance = new C3poContext(config);
        expect(contextInstance.getHeaders()).to.eql(headers);
    });

    it('should set default po data if translations: "default"', () => {
        const config = {
            resolve: { translations: 'default' },
        };
        const context = new C3poContext(config);
        expect(context.poData).to.eql(DEFAULT_PO_DATA);
    });

    it('should get proper headers with translations: "default"', () => {
        const config = {
            defaultHeaders: { 'plural-forms': 'test' },
            resolve: { translations: 'default' },
        };
        const context = new C3poContext(config);
        expect(context.getHeaders()).to.eql(config.defaultHeaders);
    });
});
