'use client';
import {useEffect,useState} from 'react';
import {Crown,X} from 'lucide-react';
import type {Chess,Color,Square} from 'chess.js';
import {squareCenter} from '@/lib/review';

function kingSquare(board:Chess,color:Color){
  return board.board().flat().find(piece=>piece?.type==='k'&&piece.color===color)?.square as Square|undefined;
}

export type KingStatus='winner'|'checkmate'|'stalemate';

export function TerminalStatusMarker({status}:{status:KingStatus}){
  return <span className={`terminal-status-marker ${status}`} aria-hidden="true">
    {status==='winner'?<Crown/>:status==='checkmate'?<X/>:<span>½</span>}
  </span>;
}

export function terminalKingStatusSquares(board:Chess,kind:'checkmate'|'stalemate'){
  const terminalColor=board.turn(),otherColor:Color=terminalColor==='w'?'b':'w';
  const terminalKing=kingSquare(board,terminalColor),otherKing=kingSquare(board,otherColor);
  const statuses=new Map<Square,KingStatus>();
  if(!terminalKing||!otherKing)return statuses;
  statuses.set(terminalKing,kind);
  statuses.set(otherKing,kind==='checkmate'?'winner':'stalemate');
  return statuses;
}

function KingMarker({square,flipped,status,showLabel}:{square:Square;flipped:boolean;status:KingStatus;showLabel:boolean}){
  const center=squareCenter(square,flipped),left=center.x/8*100,top=center.y/8*100;
  const label=status==='winner'?'Winner':status==='checkmate'?'Checkmate':'Stalemate';
  const edge=center.x<1?'edge-left':center.x>7?'edge-right':'';
  return <span className={`king-status-anchor ${status} ${edge}`} data-square={square} style={{left:`${left}%`,top:`${top}%`}} role="img" aria-label={`${label} king on ${square}`}>
    {showLabel?<span className="king-status-label">{label}</span>:<TerminalStatusMarker status={status}/>} 
  </span>;
}

export function BoardTerminalOverlay({board,flipped,kind}:{board:Chess;flipped:boolean;kind:'checkmate'|'stalemate'}){
  const [showLabels,setShowLabels]=useState(true);
  const terminalColor=board.turn(),otherColor:Color=terminalColor==='w'?'b':'w';
  const terminalKing=kingSquare(board,terminalColor),otherKing=kingSquare(board,otherColor);

  useEffect(()=>{
    setShowLabels(true);
    const timer=setTimeout(()=>setShowLabels(false),1750);
    return()=>clearTimeout(timer);
  },[kind,terminalKing,otherKing]);

  if(!terminalKing||!otherKing)return null;
  return <div className="board-king-status-layer">
    <KingMarker square={terminalKing} flipped={flipped} status={kind} showLabel={showLabels}/>
    <KingMarker square={otherKing} flipped={flipped} status={kind==='checkmate'?'winner':'stalemate'} showLabel={showLabels}/>
  </div>;
}
