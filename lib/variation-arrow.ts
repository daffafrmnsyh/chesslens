import {Chess} from 'chess.js';
import type {Evaluation} from './chess';
import {parseUci,type ReviewArrow} from './review';

export function variationBestMoveArrow(fen:string,evaluation:Evaluation|undefined,busy:boolean):ReviewArrow|null{
  if(busy||!evaluation?.best||evaluation.positionFen&&evaluation.positionFen!==fen)return null;
  const board=new Chess(fen);
  if(board.isGameOver())return null;
  const parsed=parseUci(evaluation.best);
  if(!parsed)return null;
  const promotion=evaluation.best[4];
  const legal=board.moves({verbose:true}).some(move=>move.from===parsed.from&&move.to===parsed.to&&(move.promotion??'')===(promotion??''));
  return legal?{...parsed,kind:'variation'}:null;
}
