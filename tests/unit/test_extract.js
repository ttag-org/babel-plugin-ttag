import { expect } from 'chai';
import template from 'babel-template';
import { extractPoEntry } from 'src/extract';
import Context from 'src/context';
import gettext from 'src/extractors/tag-gettext';

describe('extract extractPoEntry', () => {
    it('should not throw if validation fails and has extract skip', () => {
        const enConfig = new Context({
            extractors: {
                'tag-gettext': { invalidFormat: 'skip' },
            },
        });

        const node = template('t`banana ${ fn() }`')().expression;
        const mockState = { file: { opts: { filename: 'test' } } };
        const fn = () => extractPoEntry(gettext, { node }, enConfig, mockState);
        expect(fn).to.not.throw();
    });

    it('should throw if validation fails', () => {
        const enConfig = new Context({
            extractors: {
                'tag-gettext': { invalidFormat: 'fail' },
            },
        });

        const node = template('t`banana ${ fn() }`')().expression;
        const mockState = { file: { opts: { filename: 'test' } } };
        const fn = () => extractPoEntry(gettext, { node }, enConfig, mockState);
        expect(fn).to.throw();
    });
});
