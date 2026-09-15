import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Chess} from 'chess.js';

const root=resolve(import.meta.dirname,'..');
const openings=[];
const positions={};

for(const volume of ['a','b','c','d','e','supplemental']){
 const text=await readFile(resolve(root,'data/openings',`${volume}.tsv`),'utf8');
 for(const row of text.trim().split('\n').slice(1)){
  const [eco,fullName,pgn]=row.replace(/\r$/,'').split('\t');
  if(!eco||!fullName||!pgn)continue;
  const separator=fullName.indexOf(': ');
  const name=separator<0?fullName:fullName.slice(0,separator);
  const variation=separator<0?undefined:fullName.slice(separator+2);
  const openingId=openings.push(variation?[eco,name,variation]:[eco,name])-1;
  const chess=new Chess();
  chess.loadPgn(pgn);
  const moves=chess.history({verbose:true});
  for(let index=0;index<moves.length;index++){
   const move=moves[index],key=move.before.split(' ').slice(0,4).join(' '),uci=move.from+move.to+(move.promotion??'');
   const continuations=positions[key]??=(Object.create(null));
   continuations[uci]??=-1;
   if(index===moves.length-1)continuations[uci]=openingId;
  }
 }
}

await writeFile(resolve(root,'lib/opening-book.json'),JSON.stringify({openings,positions}));
console.log(`Compiled ${openings.length} named openings across ${Object.keys(positions).length} positions.`);
