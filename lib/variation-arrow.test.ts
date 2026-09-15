import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from 'chess.js';
import type {Evaluation} from './chess';
import {variationBestMoveArrow} from './variation-arrow';

const evaluation=(best:string):Evaluation=>({cp:20,best,depth:14,pv:[best]});

test('variation arrow uses the legal UCI best move',()=>{
  const fen=new Chess().fen();
  assert.deepEqual(variationBestMoveArrow(fen,evaluation('e2e4'),false),{from:'e2',to:'e4',kind:'variation'});
});

test('variation arrow uses the analyzed variation FEN, including the reported Bxf4 position',()=>{
  const fen='r1bqkbnr/pp1p1ppp/2n5/2p5/4Pp2/3P1N2/PPP3PP/RNBQKB1R w KQkq - 0 5';
  assert.deepEqual(variationBestMoveArrow(fen,{...evaluation('c1f4'),positionFen:fen},false),{from:'c1',to:'f4',kind:'variation'});
  assert.equal(variationBestMoveArrow(fen,{...evaluation('c1f4'),positionFen:new Chess().fen()},false),null);
});

test('variation arrow supports castling and promotion UCI moves',()=>{
  assert.deepEqual(variationBestMoveArrow('4k3/8/8/8/8/8/8/4K2R w K - 0 1',evaluation('e1g1'),false),{from:'e1',to:'g1',kind:'variation'});
  assert.deepEqual(variationBestMoveArrow('4k3/P7/8/8/8/8/8/4K3 w - - 0 1',evaluation('a7a8q'),false),{from:'a7',to:'a8',kind:'variation'});
});

test('variation arrow is hidden while busy and for stale, illegal, or terminal results',()=>{
  const fen=new Chess().fen();
  assert.equal(variationBestMoveArrow(fen,evaluation('e2e4'),true),null);
  assert.equal(variationBestMoveArrow(fen,undefined,false),null);
  assert.equal(variationBestMoveArrow(fen,evaluation('e7e5'),false),null);
  assert.equal(variationBestMoveArrow('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1',evaluation('h8h7'),false),null);
});
