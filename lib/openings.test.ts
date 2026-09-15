import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePgn} from './chess';
import {deriveReviews} from './review';
import {inspectOpeningMove} from './openings';

const cases=[
  {pgn:'1. e4 c5 2. Nf3 Nc6 3. Bc4',eco:'B20',name:'Sicilian Defense',variation:'Bowdler Attack'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5',eco:'C50',name:'Italian Game',variation:'Giuoco Piano'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',eco:'C70',name:'Ruy Lopez',variation:'Morphy Defense'},
  {pgn:'1. d4 d5 2. c4 e6',eco:'D30',name:"Queen's Gambit Declined",variation:undefined},
  {pgn:'1. e4 e6 2. d4 d5 3. e5',eco:'C02',name:'French Defense',variation:'Advance Variation'},
];

test('local ECO book recognizes representative opening families',()=>{
 for(const item of cases){
  const game=parsePgn(item.pgn)[0],reviews=deriveReviews(game,{}).reviews,last=reviews.at(-1)!;
  assert.ok(reviews.every(review=>review.classification==='Book'),item.pgn);
  assert.equal(last.opening?.name,item.name,item.pgn);
  assert.equal(last.opening?.eco,item.eco,item.pgn);
  assert.equal(last.opening?.variation,item.variation,item.pgn);
 }
});

test('each move is checked independently after an earlier miss',()=>{
 const game=parsePgn('1. e4 e5 2. Nf3')[0],reviews=deriveReviews(game,{},(_,uci)=>uci==='e2e4'||uci==='g1f3').reviews;
 assert.deepEqual(reviews.map(review=>review.classification),['Book',null,'Book']);
});

test('transposed positions share the same known continuation',()=>{
 const main=parsePgn('1. d4 d5 2. c4 e6 3. Nc3 Nf6')[0];
 const transposed=parsePgn('1. d4 Nf6 2. c4 e6 3. Nc3 d5')[0];
 const mainFen=main.fens.at(-1)!,transposedFen=transposed.fens.at(-1)!;
 assert.equal(mainFen.split(' ').slice(0,4).join(' '),transposedFen.split(' ').slice(0,4).join(' '));
 const mainProbe=inspectOpeningMove(mainFen,'c1g5'),transposedProbe=inspectOpeningMove(transposedFen,'c1g5');
 assert.equal(mainProbe.positionFound,true);
 assert.equal(mainProbe.isBook,true);
 assert.deepEqual(transposedProbe,mainProbe);
});
