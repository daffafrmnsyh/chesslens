import rawBook from './opening-book.json';

export type OpeningInfo={eco:string;name:string;variation?:string};
export type OpeningProbe={positionFound:boolean;knownContinuations:string[];isBook:boolean;opening?:OpeningInfo};

type StoredBook={openings:[string,string,string?][];positions:Record<string,Record<string,number>>};
const book=rawBook as unknown as StoredBook;
const logged=new Set<string>();
const positionKey=(fen:string)=>fen.split(' ').slice(0,4).join(' ');

export function inspectOpeningMove(fen:string,uci:string):OpeningProbe{
 const key=positionKey(fen),continuations=book.positions[key];
 const openingId=continuations?.[uci];
 const isBook=openingId!==undefined;
 const stored=isBook&&openingId>=0?book.openings[openingId]:undefined;
 const opening=stored?{eco:stored[0],name:stored[1],variation:stored[2]}:undefined;
 const result={positionFound:Boolean(continuations),knownContinuations:continuations?Object.keys(continuations):[],isBook,opening};
 const logKey=`${key}|${uci}`;
 if(typeof window!=='undefined'&&!logged.has(logKey)){
  logged.add(logKey);
  console.debug('[opening-book]',{currentFen:fen,playedMove:uci,positionFound:result.positionFound,knownContinuations:result.knownContinuations,book:result.isBook});
 }
 return result;
}

export function lookupOpeningMove(fen:string,uci:string):OpeningInfo|true|false{
 const result=inspectOpeningMove(fen,uci);
 return result.isBook?result.opening??true:false;
}
