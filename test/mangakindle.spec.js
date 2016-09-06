import {expect, assert} from 'chai';
import * as lib from '../src/lib/mangakindle';

describe('MangaKindle Library', () => {
    describe('Searching', () => {
        it('for nothing', (done) => {
            lib.searchManga('').then((a) => {
                assert.fail('Something went wrong');
                done();
            }, (a) => {
                expect(a.statusCode).to.be.equal(302);
                done();
            });
        });
        it('for One Piece', (done) => {
            lib.searchManga('One Piece').then((a) => {
                expect(a.length).to.be.equal(2);
                expect(a[0].name).to.be.a('string');
                expect(a[0].name).to.contain('One Piece');
                expect(a[0].href).to.contain('manga/');
                done();
            });
        });
        it('for something and found nothing', (done) => {
            lib.searchManga('one pieceakjsbdkajsbds').then((a) => {
                expect(a.length).to.be.equal(0);
                done();
            });
        });
    });
});