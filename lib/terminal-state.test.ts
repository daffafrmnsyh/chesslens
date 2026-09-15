import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from 'chess.js';
import {parsePgn,SAMPLE} from './chess';
import {beginVariation,navigateVariation} from './variation';
import {mainlinePosition,terminalState,variationPosition} from './terminal-state';

test('checkmate reports the winner for both colors',()=>{
  const whiteMate=parsePgn(SAMPLE)[0];
  assert.deepEqual(terminalState(mainlinePosition(whiteMate,whiteMate.moves.length)),{kind:'checkmate',title:'Checkmate',detail:'White wins',result:'1–0'});
  const blackMate=parsePgn('1. f3 e5 2. g4 Qh4#')[0];
  assert.deepEqual(terminalState(mainlinePosition(blackMate,blackMate.moves.length)),{kind:'checkmate',title:'Checkmate',detail:'Black wins',result:'0–1'});
});

test('draw reasons distinguish stalemate, insufficient material, and fifty moves',()=>{
  assert.deepEqual(terminalState(new Chess('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1')),{kind:'stalemate',title:'Draw',detail:'Stalemate',result:'½–½'});
  assert.deepEqual(terminalState(new Chess('8/8/8/8/8/8/4K3/7k w - - 0 1')),{kind:'insufficient-material',title:'Draw',detail:'Insufficient material',result:'½–½'});
  assert.deepEqual(terminalState(new Chess('7k/8/8/8/8/8/8/R3K3 w Q - 100 51')),{kind:'fifty-move-rule',title:'Draw',detail:'Fifty-move rule',result:'½–½'});
});

test('mainline history reliably detects threefold repetition',()=>{
  const game=parsePgn('1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8')[0];
  assert.deepEqual(terminalState(mainlinePosition(game,game.moves.length)),{kind:'threefold-repetition',title:'Draw',detail:'Threefold repetition',result:'½–½'});
});

test('variation terminal state clears when navigating back to its normal start position',()=>{
  const game=parsePgn('1. f3 e5 2. g4')[0],startFen=game.fens[3],position=new Chess(startFen);
  const mate=position.move({from:'d8',to:'h4'}),variation=beginVariation(3,startFen,mate);
  assert.equal(terminalState(variationPosition(game,variation))?.detail,'Black wins');
  assert.equal(terminalState(variationPosition(game,navigateVariation(variation,0))),null);
});
