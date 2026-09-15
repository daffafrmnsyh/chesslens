import type {Square} from 'chess.js';
import type {Classification} from '@/lib/chess';
import {squareCenter} from '@/lib/review';
import {ClassificationIcon} from './classification';

const CENTER_X_IN_SQUARE=.94;
const CENTER_Y_IN_SQUARE=.08;

export function BoardClassificationBadge({classification,destination,flipped,played}:{
  classification:Classification;
  destination:Square;
  flipped:boolean;
  played:string;
}){
  const square=squareCenter(destination,flipped);
  const left=(square.x-.5+CENTER_X_IN_SQUARE)/8*100;
  const top=(square.y-.5+CENTER_Y_IN_SQUARE)/8*100;

  return <span
    className="board-classification-anchor"
    data-square={destination}
    style={{left:`${left}%`,top:`${top}%`}}
    role="img"
    aria-label={`${classification}: ${played} on ${destination}`}
  >
    <ClassificationIcon label={classification} board/>
  </span>;
}
