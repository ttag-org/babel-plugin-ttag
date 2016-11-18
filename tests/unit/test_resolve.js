import { expect } from 'chai';
import { resolveForContent } from 'src/resolve';
import { parserPoTranslations } from 'src/potfile';
import Config from 'src/config';
import { unescapeUnicode } from 'src/utils';

describe('resolveForContent gettext', () => {
    it('Should resolve simple gettext literal', () => {
        const config = new Config({config: 'tests/fixtures/.polyglot'});
        const translations = parserPoTranslations('tests/fixtures/resolve.po');
        const fileContent = 'console.log(gt`simple string literal`);';
        const expected = `console.log("простой строковый литерал");`;
        const result = resolveForContent(config, translations)(fileContent);
        expect(unescapeUnicode(result)).to.eql(expected);
    });

    it('Should resolve simple gettext literal with quotes', () => {
        const config = new Config({config: 'tests/fixtures/.polyglot'});
        const translations = parserPoTranslations('tests/fixtures/resolve.po');
        const fileContent = 'console.log(gt`simple string literal "quote"`);';
        const expected = 'console.log("simple string literal \\"quote\\"");';
        const result = resolveForContent(config, translations)(fileContent);
        expect(unescapeUnicode(result)).to.eql(expected);
    });

    it('Should resolve formatted template string', () => {
        const config = new Config({config: 'tests/fixtures/.polyglot'});
        const translations = parserPoTranslations('tests/fixtures/resolve.po');
        const fileContent = 'console.log(gt`string literal with formatting ${a}`)';
        const expected = 'console.log(`строковый литерал с форматированием ${ a }`);';
        const result = resolveForContent(config, translations)(fileContent);
        expect(unescapeUnicode(result)).to.eql(expected);
    });
});
