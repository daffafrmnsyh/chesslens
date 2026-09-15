import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from 'chess.js';
import {appendVariation,beginVariation,navigateVariation,resetVariation,variationFen} from './variation';

test('variation begins from the displayed position without mutating its source',()=>{
  const mainline=new Chess();mainline.move('e4');mainline.move('c5');mainline.move('Nf3');
  const startFen=mainline.fen(),branchPly=3,branch=new Chess(startFen),move=branch.move('Nc6');
  const variation=beginVariation(branchPly,startFen,move);
  assert.equal(variation.startFen,startFen);assert.equal(variation.branchPly,branchPly);
  assert.equal(variation.moves[0].san,'Nc6');assert.equal(variation.currentFen,move.after);assert.equal(variationFen(variation),move.after);
  assert.equal(mainline.fen(),startFen);
});

test('playing after navigating backward truncates the old continuation',()=>{
  const chess=new Chess();const startFen=chess.fen();
  let variation=beginVariation(0,startFen,chess.move('e4'));
  variation=appendVariation(variation,chess.move('e5'));
  variation=appendVariation(variation,chess.move('Nf3'));
  variation=navigateVariation(variation,1);
  const replacementBoard=new Chess(variationFen(variation));
  variation=appendVariation(variation,replacementBoard.move('c5'));
  assert.deepEqual(variation.moves.map(move=>move.san),['e4','c5']);
  assert.equal(variation.index,2);assert.equal(variation.fens.length,3);assert.equal(variation.currentFen,replacementBoard.fen());
});

test('each manual ply advances the canonical variation FEN for both sides',()=>{
  const board=new Chess(),startFen=board.fen();
  const first=board.move('e4');let variation=beginVariation(0,startFen,first);
  for(const notation of ['c5','Nf3','Nc6']){
    assert.equal(variation.currentFen,board.fen());
    const move=board.move(notation);variation=appendVariation(variation,move);
  }
  assert.deepEqual(variation.moves.map(move=>move.san),['e4','c5','Nf3','Nc6']);
  assert.equal(variation.currentFen,board.fen());
  assert.equal(variation.index,4);
});

test('variation navigation clamps and reset returns to its branch position',()=>{
  const chess=new Chess(),startFen=chess.fen();let variation=beginVariation(12,startFen,chess.move('d4'));
  variation=navigateVariation(variation,-2);assert.equal(variation.index,0);assert.equal(variation.currentFen,startFen);assert.equal(variationFen(variation),startFen);
  variation=navigateVariation(variation,9);assert.equal(variation.index,1);assert.equal(variation.currentFen,variation.fens[1]);
  variation=resetVariation(variation);assert.equal(variation.index,0);assert.deepEqual(variation.moves,[]);assert.equal(variation.currentFen,startFen);assert.equal(variationFen(variation),startFen);
});

test('variation navigation includes startFen in both directions',()=>{
  const board=new Chess();board.move('e4');board.move('c5');board.move('Nf3');
  const startFen=board.fen(),visited=[startFen];
  let variation=beginVariation(3,startFen,board.move('Nf6'));visited.push(board.fen());
  for(const notation of ['d4','e6']){variation=appendVariation(variation,board.move(notation));visited.push(board.fen());}
  for(let index=variation.moves.length;index>=0;index--){variation=navigateVariation(variation,index);assert.equal(variation.currentFen,visited[index]);}
  assert.equal(variation.index,0);assert.equal(variation.currentFen,startFen);
  for(let index=1;index<=variation.moves.length;index++){variation=navigateVariation(variation,index);assert.equal(variation.currentFen,visited[index]);}
});

test('a new move at startFen truncates the entire old variation future',()=>{
  const board=new Chess();board.move('e4');board.move('c5');board.move('Nf3');
  const startFen=board.fen();let variation=beginVariation(3,startFen,board.move('Nf6'));
  variation=appendVariation(variation,board.move('d4'));variation=appendVariation(variation,board.move('e6'));
  variation=navigateVariation(variation,0);
  const replacementBoard=new Chess(variation.currentFen),replacement=replacementBoard.move('Nc6');
  variation=appendVariation(variation,replacement);
  assert.deepEqual(variation.moves.map(move=>move.san),['Nc6']);
  assert.deepEqual(variation.fens,[startFen,replacement.after]);
  assert.equal(variation.index,1);assert.equal(variation.currentFen,replacement.after);
});

test('chess.js special moves remain intact in variation history',()=>{
  const cases=[
    {fen:'r3k3/8/8/8/8/8/8/R3K3 w Q - 0 1',move:{from:'a1',to:'a8'},flag:'c'},
    {fen:'4k3/8/8/8/8/8/8/4K2R w K - 0 1',move:{from:'e1',to:'g1'},flag:'k'},
    {fen:'4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2',move:{from:'e5',to:'d6'},flag:'e'},
    {fen:'4k3/P7/8/8/8/8/8/4K3 w - - 0 1',move:{from:'a7',to:'a8',promotion:'q'},flag:'p'},
  ] as const;
  for(const item of cases){const chess=new Chess(item.fen),move=chess.move(item.move);const variation=beginVariation(0,item.fen,move);assert.ok(variation.moves[0].flags.includes(item.flag));assert.equal(variationFen(variation),chess.fen());}
});

test('illegal moves do not produce variation moves and terminal positions are retained',()=>{
  const chess=new Chess();assert.throws(()=>chess.move({from:'e2',to:'e5'}));
  const mate=new Chess('7k/8/5KQ1/8/8/8/8/8 w - - 0 1'),move=mate.move({from:'g6',to:'g7'}),variation=beginVariation(0,move.before,move);
  assert.equal(move.san,'Qg7#');assert.equal(new Chess(variationFen(variation)).isCheckmate(),true);
});
