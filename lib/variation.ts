import type {Move} from 'chess.js';

export type VariationState={
  branchPly:number;
  startFen:string;
  currentFen:string;
  moves:Move[];
  fens:string[];
  index:number;
};

export function beginVariation(branchPly:number,startFen:string,move:Move):VariationState{
  return {branchPly,startFen,currentFen:move.after,moves:[move],fens:[startFen,move.after],index:1};
}

export function appendVariation(state:VariationState,move:Move):VariationState{
  const moves=state.moves.slice(0,state.index);
  const fens=state.fens.slice(0,state.index+1);
  return {...state,currentFen:move.after,moves:[...moves,move],fens:[...fens,move.after],index:state.index+1};
}

export function navigateVariation(state:VariationState,index:number):VariationState{
  const nextIndex=Math.max(0,Math.min(state.moves.length,index));
  return {...state,index:nextIndex,currentFen:state.fens[nextIndex]??state.startFen};
}

export function resetVariation(state:VariationState):VariationState{
  return {...state,currentFen:state.startFen,moves:[],fens:[state.startFen],index:0};
}

export function variationFen(state:VariationState){return state.currentFen;}
