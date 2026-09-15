import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from 'chess.js';
import {parsePgn,SAMPLE,classify,moveGrade} from './chess';
test('sample parses with initial position and checkmate',()=>{const g=parsePgn(SAMPLE)[0];assert.equal(g.moves.length,33);assert.equal(g.fens.length,34);assert.ok(new Chess(g.fens.at(-1)).isCheckmate());});
test('multiple games and malformed inputs',()=>{assert.equal(parsePgn(SAMPLE+'\n\n'+SAMPLE).length,2);assert.throws(()=>parsePgn('1. e4 e5 2. Bh6'));assert.throws(()=>parsePgn(''));});
test('custom black-to-move setup retains initial FEN',()=>{const fen='4k3/8/8/8/8/8/8/R3K3 b Q - 0 42';const g=parsePgn(`[SetUp "1"]\n[FEN "${fen}"]\n\n42... Kf7 *`)[0];assert.equal(g.fens[0],fen);assert.equal(g.moves[0].color,'b');});
test('classification thresholds and mover perspective',()=>{assert.deepEqual([10,25,50,100,200,201].map(x=>classify(x)),['Best','Excellent','Good','Inaccuracy','Mistake','Blunder']);const g=parsePgn('1. e4 e5')[0];const ev=(cp:number)=>({cp,best:'',depth:10,pv:[]});assert.equal(moveGrade(ev(0),ev(300),g.moves[1])?.label,'Blunder');assert.equal(moveGrade(ev(0),ev(-300),g.moves[0])?.label,'Blunder');assert.equal(moveGrade(undefined,ev(0),g.moves[0]),null);});
