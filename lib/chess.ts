import { Chess } from 'chess.js';
export const SAMPLE=`[Event "Opera Game"]
[Site "Paris, France"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke of Brunswick & Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;
export function parsePgn(pgn:string){
 if(!pgn.trim()) throw new Error('Paste a PGN or choose a file to begin.');
 // A blank line followed by a new header block separates games, not individual tags.
 const blocks=pgn.trim().split(/\n\s*\n(?=\s*\[)/);
 return blocks.map((block,index)=>{try{const c=new Chess();c.loadPgn(block);const moves=c.history({verbose:true});return {headers:c.getHeaders(),moves,fens:[moves[0]?.before??c.fen(),...moves.map(m=>m.after)]};}catch{throw new Error(`Game ${index+1} contains an invalid PGN or illegal move. Check the move text and any FEN header.`);}});
}
export type Game=ReturnType<typeof parsePgn>[number];
export type Evaluation={cp:number;mate?:number;best:string;depth:number;pv:string[];positionFen?:string};
export const categories=['Book','Best','Excellent','Good','Inaccuracy','Mistake','Blunder'] as const;
export type Classification=typeof categories[number];
export function classify(loss:number,isBest=false):Exclude<Classification,'Book'>{if(isBest||loss<=10)return 'Best';if(loss<=25)return 'Excellent';if(loss<=50)return 'Good';if(loss<=100)return 'Inaccuracy';if(loss<=200)return 'Mistake';return 'Blunder';}
export function moveGrade(before:Evaluation|undefined,after:Evaluation|undefined,move:Game['moves'][number]){if(!before||!after)return null;const loss=Math.max(0,(before.cp-after.cp)*(move.color==='w'?1:-1));return {loss,label:classify(loss,before.best===move.from+move.to+(move.promotion??''))};}
export function score(e?:Evaluation){if(!e)return '—';if(e.mate!==undefined)return `M${e.mate}`;return `${e.cp>=0?'+':''}${(e.cp/100).toFixed(2)}`;}
export function san(fen:string,uci:string){try{return new Chess(fen).move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]})?.san??'—';}catch{return '—';}}
