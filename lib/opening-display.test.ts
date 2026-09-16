import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookTheoryDescription,gameDisplayTitle,gameMetadata,openingAtPly,openingDetails} from './opening-display';
import {parsePgn} from './chess';
import {deriveReviews} from './review';

test('uses only the opening attached to the currently displayed position',()=>{
 const reviews=[
  {opening:{eco:'B00',name:"King's Pawn Game"}},
  {opening:{eco:'C20',name:"King's Pawn Game"}},
  {opening:{eco:'C50',name:'Italian Game'}},
  {},
 ];
 assert.equal(openingAtPly(reviews,1)?.name,"King's Pawn Game");
 assert.equal(openingAtPly(reviews,3)?.name,'Italian Game');
 assert.equal(openingAtPly(reviews,4),undefined);
 assert.equal(openingAtPly(reviews,0),undefined);
});

test('the local book reaches the Italian Game at Bc4',()=>{
 const game=parsePgn('1. e4 e5 2. Nf3 Nc6 3. Bc4')[0];
 const reviews=deriveReviews(game,{}).reviews;
 assert.equal(openingAtPly(reviews,1)?.name,"King's Pawn Game");
 assert.equal(openingAtPly(reviews,5)?.name,'Italian Game');
});

test('omits unknown opening and PGN metadata cleanly',()=>{
 assert.equal(gameMetadata('?','????.??.??'),'');
 assert.equal(gameMetadata('Chess.com','2026.09.16'),'Chess.com · 2026');
 assert.equal(gameDisplayTitle(undefined,'?'),'Imported game');
 assert.equal(openingDetails({eco:'?',name:'Known opening',variation:'????'}),'');
 assert.equal(openingDetails({eco:'B21',name:'Sicilian Defense',variation:'McDonnell Attack'}),'McDonnell Attack · B21');
});

test('book feedback names a known opening and keeps a safe fallback',()=>{
 assert.equal(bookTheoryDescription({eco:'C50',name:'Italian Game'}),'This follows known Italian Game theory.');
 assert.equal(bookTheoryDescription({eco:'B21',name:'Sicilian Defense',variation:'McDonnell Attack'}),'This follows known Sicilian Defense: McDonnell Attack theory.');
 assert.equal(bookTheoryDescription(undefined),'This follows known opening theory.');
});
