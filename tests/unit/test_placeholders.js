import { expect } from 'chai';
import { fillIn } from 'src/placeholders';

describe('extractPotEntries', () => {
    it('Should replace placeholder', () => {
        const template = 'test [name1] test [name2]';
        const result = fillIn({ name1: 1, name2: 2 }, template);
        expect(result).to.eql('test 1 test 2');
    });

    it('Should not throw if not existing placeholder', () => {
        const template = 'test [name1] test [name2]';
        const result = fillIn({ name1: 1, name2: 2, name3: 3 }, template);
        expect(result).to.eql('test 1 test 2');
    });
});
