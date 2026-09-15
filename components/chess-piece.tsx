import type {PieceSymbol} from 'chess.js';

type Props={type:PieceSymbol;color:'w'|'b'};

const names:Record<PieceSymbol,string>={k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};

export function ChessPiece({type,color}:Props){
 const asset=`/pieces/${color}${type}.png`;
 return <img className="chess-piece" src={asset} alt={`${color==='w'?'White':'Black'} ${names[type]}`} draggable={false}/>;
}
