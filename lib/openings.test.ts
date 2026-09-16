import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePgn} from './chess';
import {deriveReviews} from './review';
import {inspectOpeningMove} from './openings';

const cases=[
  {pgn:'1. d4 d5 2. Nf3 Nf6 3. Bf4',eco:'D02',name:'London System',variation:undefined},
  {pgn:'1. d4 Nf6 2. Nf3 g6 3. Bf4',eco:'A48',name:'London System',variation:undefined},
  {pgn:'1. e4 c5 2. d3 Nc6 3. f4',eco:'B21',name:'Sicilian Defense',variation:'McDonnell Attack'},
  {pgn:'1. e4 c5 2. f4 Nc6 3. d3',eco:'B21',name:'Sicilian Defense',variation:'McDonnell Attack'},
  {pgn:'1. e4 c5 2. c3',eco:'B22',name:'Sicilian Defense',variation:'Alapin Variation'},
  {pgn:'1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4',eco:'B32',name:'Sicilian Defense',variation:'Open'},
  {pgn:'1. e4 c5 2. d4 cxd4 3. c3',eco:'B21',name:'Sicilian Defense',variation:'Smith-Morra Gambit'},
  {pgn:'1. e4 c5 2. Nf3 Nc6 3. Bc4',eco:'B20',name:'Sicilian Defense',variation:'Bowdler Attack'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5',eco:'C50',name:'Italian Game',variation:'Giuoco Piano'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6',eco:'C55',name:'Italian Game',variation:'Two Knights Defense'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4',eco:'C51',name:'Italian Game',variation:'Evans Gambit'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6',eco:'C65',name:'Ruy Lopez',variation:'Berlin Defense'},
  {pgn:'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',eco:'C70',name:'Ruy Lopez',variation:'Morphy Defense'},
  {pgn:'1. d4 d5 2. c4 dxc4',eco:'D20',name:"Queen's Gambit",variation:'Accepted'},
  {pgn:'1. d4 d5 2. c4 e6',eco:'D30',name:"Queen's Gambit",variation:'Declined'},
  {pgn:'1. e4 e6 2. d4 d5 3. e5',eco:'C02',name:'French Defense',variation:'Advance Variation'},
  {pgn:'1. e4 e6 2. d4 d5 3. exd5',eco:'C01',name:'French Defense',variation:'Exchange Variation'},
  {pgn:'1. e4 c6',eco:'B10',name:'Caro-Kann Defense',variation:undefined},
  {pgn:'1. e4 c6 2. d4 d5 3. e5',eco:'B12',name:'Caro-Kann Defense',variation:'Advance Variation'},
  {pgn:'1. e4 c6 2. d4 d5 3. Nd2 dxe4 4. Nxe4 Bf5',eco:'B18',name:'Caro-Kann Defense',variation:'Classical Variation'},
  {pgn:'1. e4 d5',eco:'B01',name:'Scandinavian Defense',variation:undefined},
  {pgn:'1. d4 d5 2. c4',eco:'D06',name:"Queen's Gambit",variation:undefined},
  {pgn:'1. d4 Nf6 2. c4 g6',eco:'E60',name:"King's Indian Defense",variation:undefined},
  {pgn:'1. d4 Nf6 2. c4 e6 3. Nf3 b6',eco:'E12',name:"Queen's Indian Defense",variation:undefined},
  {pgn:'1. d4 Nf6 2. c4 e6 3. Nc3 Bb4',eco:'E20',name:'Nimzo-Indian Defense',variation:undefined},
  {pgn:'1. d4 d5 2. c4 c6',eco:'D10',name:'Slav Defense',variation:undefined},
  {pgn:'1. d4 f5 2. g3 Nf6',eco:'A80',name:'Dutch Defense',variation:undefined},
  {pgn:'1. c4',eco:'A10',name:'English Opening',variation:undefined},
  {pgn:'1. Nf3 d5 2. c4 e6',eco:'A09',name:'Réti Opening',variation:undefined},
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

test('London setup stages remain specifically named',()=>{
 const game=parsePgn('1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bd3 O-O 8. h3')[0];
 const reviews=deriveReviews(game,{}).reviews;
 for(const ply of [5,7,9,11,13,15]){
  assert.equal(reviews[ply-1].opening?.name,'London System',`ply ${ply}`);
  assert.equal(reviews[ply-1].classification,'Book',`ply ${ply}`);
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
