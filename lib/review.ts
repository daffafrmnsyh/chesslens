import {Chess,type Square} from 'chess.js';
import {categories,moveGrade,san,type Classification,type Evaluation,type Game} from './chess';
import {lookupOpeningMove,type OpeningInfo} from './openings';

export type MoveReview={
  number:string; played:string; correctionBestMove:string; continuationBestMove:string;
  correctionBestMoveUci?:string; continuationBestMoveUci?:string; before?:Evaluation; after?:Evaluation;
  classification:Classification|null; loss:number|null; opening?:OpeningInfo;
  positionBefore:string; positionAfter:string;
  playedMove:{from:Square;to:Square;san:string};
  recommendation:ReviewRecommendation|null;
  reviewArrows:ReviewArrow[];
};
export type ReviewRecommendation={kind:'correction'|'continuation';move:string;uci?:string};
export type ReviewArrow={from:Square;to:Square;kind:'correction'|'variation'};
const correctionClassifications:Classification[]=['Inaccuracy','Mistake','Blunder'];

export function reviewRecommendation(review:MoveReview):ReviewRecommendation|null{
  return review.recommendation;
}
export type OpeningBookLookup=(fen:string,uci:string)=>OpeningInfo|boolean|null|undefined;

// A recommendation is position-specific. Keep the result only when it belongs
// to the expected FEN and its move is legal for that position's side to move.
export function recommendationForPosition(fen:string,evaluation:Evaluation|undefined):{uci:string;move:string}|null{
  if(!evaluation?.best||evaluation.positionFen&&evaluation.positionFen!==fen)return null;
  const parsed=parseUci(evaluation.best);
  if(!parsed)return null;
  try{
    const position=new Chess(fen),piece=position.get(parsed.from);
    if(!piece||piece.color!==position.turn())return null;
    const promotion=evaluation.best[4];
    const legal=position.moves({square:parsed.from,verbose:true}).some(candidate=>
      candidate.to===parsed.to&&(candidate.promotion??'')===(promotion??'')
    );
    if(!legal)return null;
    return {uci:evaluation.best,move:san(fen,evaluation.best)};
  }catch{return null;}
}

export function deriveReviews(game:Game,results:Readonly<Partial<Record<number,Evaluation>>>,isBook:OpeningBookLookup=lookupOpeningMove){
  const reviews:MoveReview[]=game.moves.map((move,i)=>{
    const before=results[i],after=results[i+1];
    const correctionRecommendation=recommendationForPosition(move.before,before);
    const continuationRecommendation=recommendationForPosition(move.after,after);
    const grade=moveGrade(before,after,move);
    const uci=move.from+move.to+(move.promotion??'');
    const bookMatch=isBook(move.before,uci);
    const classification=bookMatch?'Book':grade?.label??null;
    const correction=classification!==null&&correctionClassifications.includes(classification);
    const recommendation:ReviewRecommendation|null=classification===null?null:correction
      ?{kind:'correction',move:correctionRecommendation?.move??'—',uci:correctionRecommendation?.uci}
      :{kind:'continuation',move:continuationRecommendation?.move??'—',uci:continuationRecommendation?.uci};
    const arrowMove=parseUci(recommendation?.uci);
    return {
      number:`${move.before.split(' ')[5]}${move.color==='w'?'.':'...'}`,
      played:move.san,
      correctionBestMove:correctionRecommendation?.move??'—',
      continuationBestMove:continuationRecommendation?.move??'—',
      correctionBestMoveUci:correctionRecommendation?.uci,continuationBestMoveUci:continuationRecommendation?.uci,before,after,
      classification,
      loss:bookMatch?null:grade?.loss??null,
      opening:bookMatch&&typeof bookMatch==='object'?bookMatch:undefined,
      positionBefore:move.before,
      positionAfter:move.after,
      playedMove:{from:move.from,to:move.to,san:move.san},
      recommendation,
      reviewArrows:arrowMove&&recommendation?.kind==='correction'?[{...arrowMove,kind:'correction'}]:[],
    };
  });
  return {reviews,counts:categories.map(label=>reviews.filter(r=>r.classification===label).length)};
}

export function parseUci(uci:string|undefined):{from:Square;to:Square}|null{
  if(!uci||!/^([a-h][1-8])([a-h][1-8])([qrbn])?$/.test(uci))return null;
  const from=uci.slice(0,2) as Square,to=uci.slice(2,4) as Square;
  return from===to?null:{from,to};
}
export function squareCenter(square:Square,flipped:boolean){
  const file=square.charCodeAt(0)-97,rank=Number(square[1])-1;
  return {x:(flipped?7-file:file)+.5,y:(flipped?rank:7-rank)+.5};
}
