import {Chess} from 'chess.js';
import type {Game} from './chess';
import type {VariationState} from './variation';

export type TerminalState={
  kind:'checkmate'|'stalemate'|'insufficient-material'|'threefold-repetition'|'fifty-move-rule';
  title:'Checkmate'|'Draw';
  detail:string;
  result:'1–0'|'0–1'|'½–½';
};

function play(position:Chess,moves:Game['moves']){
  for(const move of moves)position.move({from:move.from,to:move.to,promotion:move.promotion});
  return position;
}

export function mainlinePosition(game:Game,ply:number){
  return play(new Chess(game.fens[0]),game.moves.slice(0,ply));
}

export function variationPosition(game:Game,variation:VariationState){
  const mainline=mainlinePosition(game,variation.branchPly);
  const position=mainline.fen()===variation.startFen?mainline:new Chess(variation.startFen);
  return play(position,variation.moves.slice(0,variation.index));
}

export function terminalState(position:Chess):TerminalState|null{
  if(position.isCheckmate()){
    const whiteWins=position.turn()==='b';
    return {kind:'checkmate',title:'Checkmate',detail:`${whiteWins?'White':'Black'} wins`,result:whiteWins?'1–0':'0–1'};
  }
  if(position.isStalemate())return {kind:'stalemate',title:'Draw',detail:'Stalemate',result:'½–½'};
  if(position.isInsufficientMaterial())return {kind:'insufficient-material',title:'Draw',detail:'Insufficient material',result:'½–½'};
  if(position.isThreefoldRepetition())return {kind:'threefold-repetition',title:'Draw',detail:'Threefold repetition',result:'½–½'};
  if(position.isDrawByFiftyMoves())return {kind:'fifty-move-rule',title:'Draw',detail:'Fifty-move rule',result:'½–½'};
  return null;
}
