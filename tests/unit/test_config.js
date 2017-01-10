import { expect } from 'chai';
import { configSchema, validateConfig, Config } from 'src/config';
import { DEFAULT_HEADERS } from 'src/defaults';
import { parsePoData } from 'src/po-helpers';


describe('config validateConfig', () => {
    it('should be valid', () => {
        const config = {
            extract: {
                output: 'translations.pot',
                location: 'file',
            },
            resolve: { locale: 'en-us' },
            locales: {
                'en-us': 'i18n/en.po',
            },
        };
        const expected = [true, 'No errors', null];
        expect(validateConfig(config, configSchema)).to.eql(expected);
    });

    it('should not be valid', () => {
        const config = {
            extract: {
                output: 'translations.pot',
                location: 'bad-location',
            },
            resolve: { locale: 'en-us' },
            locales: {
                'en-us': 'i18n/en.po',
            },
        };
        const [isValid, errorsText, errors] = validateConfig(config, configSchema);
        expect(isValid).to.eql(false);
        expect(errorsText).to.not.equal('No errors');
        expect(errors[0].data).to.eql('bad-location');
    });
});

describe('Config.getHeaders', () => {
    it('should resolve proper headers if defaultHeaders is set as object', () => {
        const config = {
            defaultHeaders: {
                'plural-forms': 'plural-forms',
            },
        };
        const configInstance = new Config(config);
        expect(configInstance.getHeaders()).to.eql(config.defaultHeaders);
    });

    it('should resolve default headers if defaultHeaders is missing', () => {
        const config = {};
        const configInstance = new Config(config);
        expect(configInstance.getHeaders()).to.eql(DEFAULT_HEADERS);
    });

    it('should read headers from file if defaultHeaders is a string', () => {
        const config = {
            defaultHeaders: 'tests/fixtures/ua.po',
        };
        const { headers } = parsePoData('tests/fixtures/ua.po');
        const configInstance = new Config(config);
        expect(configInstance.getHeaders()).to.eql(headers);
    });
});
