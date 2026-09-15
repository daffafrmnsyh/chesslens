import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePgn,moveGrade,type Evaluation} from './chess';
import {deriveReviews,parseUci,recommendationForPosition,reviewRecommendation,squareCenter} from './review';
const ev=(cp:number,best:string):Evaluation=>({cp,best,depth:14,pv:[]});
test('review pairs correct before/after results and reuses existing grading',()=>{
 const game=parsePgn('1. e4 e5 2. Nf3')[0];
 const results={0:ev(35,'d2d4'),1:ev(-52,'c7c5'),2:ev(248,'g1f3')};
 const {reviews,counts}=deriveReviews(game,results,()=>false);
 assert.equal(reviews[0].number,'1.');assert.equal(reviews[0].correctionBestMove,'d4');assert.equal(reviews[0].continuationBestMove,'c5');assert.equal(reviews[0].played,'e4');assert.equal(reviews[0].loss,87);assert.equal(reviews[0].classification,'Inaccuracy');
 assert.equal(reviews[0].before,results[0]);assert.equal(reviews[0].after,results[1]);
 assert.equal(reviews[0].positionBefore,game.fens[0]);assert.equal(reviews[0].positionAfter,game.fens[1]);assert.deepEqual(reviews[0].playedMove,{from:'e2',to:'e4',san:'e4'});
 assert.deepEqual(reviews[0].reviewArrows,[{from:'d2',to:'d4',kind:'correction'}]);
 assert.equal(reviews[1].number,'1...');assert.equal(reviews[1].loss,300);assert.equal(reviews[1].correctionBestMove,'c5');assert.equal(reviews[1].continuationBestMove,'Nf3');assert.equal(reviews[1].classification,moveGrade(results[1],results[2],game.moves[1])?.label);
 assert.equal(reviews[2].classification,null);assert.equal(reviews[2].loss,null);assert.equal(reviews[2].correctionBestMove,'Nf3');assert.equal(reviews[2].continuationBestMove,'—');assert.equal(counts.reduce((a,b)=>a+b,0),2);
});
test('custom book lookup can provide Book without engine data',()=>{
 const game=parsePgn('1. e4')[0];
 const review=deriveReviews(game,{},(fen,uci)=>fen===game.fens[0]&&uci==='e2e4').reviews[0];assert.equal(review.classification,'Book');assert.equal(review.loss,null);
});
test('custom black start uses FEN fullmove numbering and mate evaluations stay intact',()=>{
 const game=parsePgn('[SetUp "1"]\n[FEN "4k3/8/8/8/8/8/8/R3K3 b Q - 0 42"]\n\n42... Kf7 *')[0];
 const after={...ev(99900,''),mate:1};const review=deriveReviews(game,{0:ev(0,'e8f7'),1:after},()=>false).reviews[0];assert.equal(review.number,'42...');assert.equal(review.correctionBestMove,'Kf7');assert.equal(review.after?.mate,1);
});
test('arrow semantics use post-move continuation for strong moves and pre-move correction for errors',()=>{
 const game=parsePgn('1. Nf3 d5')[0];
 const best=deriveReviews(game,{0:ev(20,'g1f3'),1:ev(18,'d7d5')},()=>false).reviews[0];
 assert.deepEqual(reviewRecommendation(best),{kind:'continuation',move:'d5',uci:'d7d5'});
 assert.deepEqual(best.reviewArrows,[]);
 const mistake=deriveReviews(game,{0:ev(20,'e2e4'),1:ev(-180,'d7d5')},()=>false).reviews[0];
 assert.deepEqual(reviewRecommendation(mistake),{kind:'correction',move:'e4',uci:'e2e4'});
 assert.deepEqual(mistake.reviewArrows,[{from:'e2',to:'e4',kind:'correction'}]);
});
test('mainline continuation is tied to the displayed post-move FEN and its side to move',()=>{
 const game=parsePgn('1. e4 e5 2. Nf3')[0];
 const results={
  0:{...ev(20,'e2e4'),positionFen:game.fens[0]},
  1:{...ev(18,'e7e5'),positionFen:game.fens[1]},
  2:{...ev(22,'g1f3'),positionFen:game.fens[2]},
  3:{...ev(19,'b8c6'),positionFen:game.fens[3]},
 };
 const reviews=deriveReviews(game,results,()=>false).reviews;
 assert.equal(game.fens[1].split(' ')[1],'b');assert.equal(reviews[0].continuationBestMove,'e5');
 assert.equal(game.fens[2].split(' ')[1],'w');assert.equal(reviews[1].continuationBestMove,'Nf3');
 assert.equal(game.fens[3].split(' ')[1],'b');assert.equal(reviews[2].positionAfter,game.fens[3]);
 assert.deepEqual(reviewRecommendation(reviews[2]),{kind:'continuation',move:'Nc6',uci:'b8c6'});
 assert.notEqual(reviews[2].continuationBestMove,'Nf3');
});
test('stale or wrong-side continuation is rejected for the displayed position',()=>{
 const game=parsePgn('1. e4 e5 2. Nf3')[0],postNf3=game.fens[3];
 assert.equal(recommendationForPosition(postNf3,{...ev(20,'g1f3'),positionFen:game.fens[2]}),null);
 assert.equal(recommendationForPosition(postNf3,{...ev(20,'g1f3'),positionFen:postNf3}),null);
 const review=deriveReviews(game,{2:ev(20,'g1f3'),3:{...ev(18,'g1f3'),positionFen:postNf3}},()=>false).reviews[2];
 assert.deepEqual(reviewRecommendation(review),{kind:'continuation',move:'—',uci:undefined});
 assert.deepEqual(review.reviewArrows,[]);
});
test('only errors expose a board correction arrow while strong continuations remain textual',()=>{
 const game=parsePgn('1. e4')[0];
 const cases=[
  {label:'Best',loss:0,best:'e2e4',kind:'continuation'},
  {label:'Excellent',loss:20,best:'d2d4',kind:'continuation'},
  {label:'Good',loss:40,best:'d2d4',kind:'continuation'},
  {label:'Inaccuracy',loss:80,best:'d2d4',kind:'correction'},
  {label:'Mistake',loss:150,best:'d2d4',kind:'correction'},
  {label:'Blunder',loss:300,best:'d2d4',kind:'correction'},
 ] as const;
 for(const item of cases){
  const review=deriveReviews(game,{0:ev(100,item.best),1:ev(100-item.loss,'e7e5')},()=>false).reviews[0];
  assert.equal(review.classification,item.label);
  assert.equal(reviewRecommendation(review)?.kind,item.kind);
  assert.deepEqual(review.reviewArrows,item.kind==='correction'?[{from:'d2',to:'d4',kind:'correction'}]:[]);
 }
 const book=deriveReviews(game,{0:ev(100,'d2d4'),1:ev(-200,'e7e5')},()=>true).reviews[0];
 assert.equal(book.classification,'Book');
 assert.equal(reviewRecommendation(book)?.kind,'continuation');
 assert.deepEqual(book.reviewArrows,[]);
});
test('review arrows stay empty until the context-specific engine move is available',()=>{
 const game=parsePgn('1. e4')[0];
 const review=deriveReviews(game,{},()=>true).reviews[0];
 assert.equal(review.classification,'Book');
 assert.equal(review.recommendation?.kind,'continuation');
 assert.deepEqual(review.reviewArrows,[]);
});
test('UCI parsing supports promotion and castling and rejects no-move tokens',()=>{
 for(const uci of ['e2e4','e7e8q','e1g1','a2a1n'])assert.deepEqual(parseUci(uci),{from:uci.slice(0,2),to:uci.slice(2,4)});
 for(const uci of [undefined,'','0000','(none)','a1a1','i2e4','e7e8k',' e2e4'])assert.equal(parseUci(uci),null);
});
test('arrow centers match both board orientations',()=>{
 assert.deepEqual(squareCenter('e2',false),{x:4.5,y:6.5});assert.deepEqual(squareCenter('e4',false),{x:4.5,y:4.5});
 assert.deepEqual(squareCenter('e2',true),{x:3.5,y:1.5});assert.deepEqual(squareCenter('e4',true),{x:3.5,y:3.5});
});
