import {Chess} from 'chess.js';
import type {Evaluation} from './chess';
export class Engine{
 private worker:Worker;private listener:((line:string)=>void)|null=null;private reject:((error:Error)=>void)|null=null;
 constructor(){this.worker=new Worker('/engine/stockfish-18-lite-single.js');this.worker.onmessage=e=>{for(const line of String(e.data).split('\n'))this.listener?.(line);};this.worker.onerror=()=>this.reject?.(new Error('Stockfish could not load. Reload the page and try again.'));}
 private command(s:string){this.worker.postMessage(s);}
 async init(){await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Engine startup timed out. Please retry.')),20000);this.reject=reject;this.listener=line=>{if(line==='uciok'){this.command('setoption name Hash value 32');this.command('isready');}if(line==='readyok'){clearTimeout(timer);resolve();}};this.command('uci');});}
 async evaluate(fen:string,depth:number):Promise<Evaluation>{
 const chess=new Chess(fen);if(chess.isCheckmate())return {cp:chess.turn()==='w'?-100000:100000,mate:0,best:'',depth:0,pv:[]};if(chess.isStalemate()||chess.isInsufficientMaterial())return {cp:0,best:'',depth:0,pv:[]};
 return new Promise((resolve,reject)=>{let result:Evaluation={cp:0,best:'',depth:0,pv:[]};const sign=chess.turn()==='w'?1:-1;const timer=setTimeout(()=>{reject(new Error('Analysis timed out. Retry at a lower depth.'));this.worker.terminate();},60000);this.reject=reject;this.listener=line=>{const m=line.match(/\bscore (cp|mate) (-?\d+)/);if(m&&!line.includes('bound')){const n=Number(m[2]);result={cp:m[1]==='mate'?sign*Math.sign(n)*(100000-Math.abs(n)*100):sign*n,...(m[1]==='mate'?{mate:sign*n}:{}),best:'',depth:Number(line.match(/\bdepth (\d+)/)?.[1]??0),pv:line.match(/\bpv (.+)/)?.[1].split(' ')??[]};}if(line.startsWith('bestmove')){clearTimeout(timer);result.best=line.split(' ')[1];resolve(result);}};this.command(`position fen ${fen}`);this.command(`go depth ${depth} movetime 2000`);});
 }
 dispose(){this.worker.terminate();this.reject?.(new Error('Analysis stopped.'));}
}
