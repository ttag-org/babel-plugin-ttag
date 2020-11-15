import { expect } from 'chai';
import { configSchema, validateConfig } from 'src/config';

describe('config validateConfig', () => {
    it('should be valid', () => {
        const config = {
            extract: {
                output: 'translations.pot',
                location: 'file',
            },
            resolve: { translations: 'i18n/en.po' },
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
            resolve: { translations: 'i18n/en.po' },
        };
        const [isValid, errorsText, errors] = validateConfig(config, configSchema);
        expect(isValid).to.eql(false);
        expect(errorsText).to.not.equal('No errors');
        expect(errors[0].data).to.eql('bad-location');
    });
});
