import type {PieceSymbol,Square} from 'chess.js';
import type {CSSProperties} from 'react';
import {squareCenter} from '@/lib/review';
import {ChessPiece} from './chess-piece';

export type PieceMotion={id:string;from:Square;to:Square;type:PieceSymbol;color:'w'|'b'};

export function PieceMotionLayer({pieces,flipped}:{pieces:PieceMotion[];flipped:boolean}){
  return <div className="piece-motion-layer" aria-hidden="true">
    {pieces.map(piece=>{
      const from=squareCenter(piece.from,flipped),to=squareCenter(piece.to,flipped);
      const left=(from.x-.5)/8*100,top=(from.y-.5)/8*100;
      return <span key={piece.id} className="piece-motion" style={{left:`${left}%`,top:`${top}%`,'--motion-x':`${(to.x-from.x)*100}%`,'--motion-y':`${(to.y-from.y)*100}%`} as CSSProperties}>
        <ChessPiece type={piece.type} color={piece.color}/>
      </span>;
    })}
  </div>;
}
