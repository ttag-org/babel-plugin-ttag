import { expect } from 'chai';
import C3poContext from 'src/context';
import { parsePoData } from 'src/po-helpers';
import { DEFAULT_HEADERS } from 'src/defaults';

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
});
