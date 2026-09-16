'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Chess,Square,type Move} from 'chess.js';
import {ArrowDownUp,ArrowLeft,ArrowRight,ChevronFirst,ChevronLast,Upload,X,Play,Square as Stop,Check,ChartNoAxesCombined,LoaderCircle,ChevronDown,Volume2,VolumeX} from 'lucide-react';
import {SAMPLE,parsePgn,Game,Evaluation,score,san,categories} from '@/lib/chess';
import {Engine} from '@/lib/engine';
import {deriveReviews} from '@/lib/review';
import {BoardReviewOverlay} from '@/components/board-review-overlay';
import {BoardTerminalOverlay} from '@/components/board-terminal-overlay';
import {BestMoveArrow} from '@/components/best-move-arrow';
import {ClassificationIcon} from '@/components/classification';
import {EngineReviewFeedback} from '@/components/engine-review-feedback';
import {VariationEngineFeedback} from '@/components/variation-engine-feedback';
import {TerminalStateFeedback} from '@/components/terminal-state-feedback';
import {VariationBranch} from '@/components/variation-branch';
import {MoveReview} from '@/components/move-review';
import {ChessPiece} from '@/components/chess-piece';
import {PieceMotion,PieceMotionLayer} from '@/components/piece-motion-layer';
import {usePositionTool} from '@/lib/webmcp';
import {ChessSoundPlayer,soundForMove} from '@/lib/chess-sounds';
import {appendVariation,beginVariation,navigateVariation,resetVariation as clearVariationMoves,variationFen,type VariationState} from '@/lib/variation';
import {variationBestMoveArrow} from '@/lib/variation-arrow';
import {mainlinePosition,terminalState,variationPosition} from '@/lib/terminal-state';
const moveListBadgeLabels=new Set(['Book','Best','Inaccuracy','Mistake','Blunder']);
export default function Home(){
 const [games,setGames]=useState<Game[]>(()=>parsePgn(SAMPLE)),[gameId,setGameId]=useState(0),[ply,setPly]=useState(0),[results,setResults]=useState<Record<number,Evaluation>>({}),[busy,setBusy]=useState(false),[status,setStatus]=useState('Ready to analyze'),[error,setError]=useState(''),[modal,setModal]=useState(false),[pgn,setPgn]=useState(''),[importError,setImportError]=useState(''),[flipped,setFlipped]=useState(false),[depth,setDepth]=useState(14),[selected,setSelected]=useState<Square|null>(null),[variation,setVariation]=useState<VariationState|null>(null),[variationEvaluation,setVariationEvaluation]=useState<Evaluation|undefined>(),[variationResults,setVariationResults]=useState<Record<string,Evaluation>>({}),[variationBusy,setVariationBusy]=useState(false),[variationStatus,setVariationStatus]=useState('Move a piece to explore'),[promotion,setPromotion]=useState<{from:Square;to:Square}|null>(null),[motion,setMotion]=useState<{pieces:PieceMotion[];hidden:Square[]}|null>(null);
 const engine=useRef<Engine|null>(null),run=useRef(0),variationRun=useRef(0),variationRef=useRef<VariationState|null>(null),file=useRef<HTMLInputElement>(null),dialog=useRef<HTMLDialogElement>(null),motionTimer=useRef<ReturnType<typeof setTimeout>|null>(null),soundTimer=useRef<ReturnType<typeof setTimeout>|null>(null),sounds=useRef<ChessSoundPlayer|null>(null);
 const [soundEnabled,setSoundEnabled]=useState(false);
 const game=games[gameId],variationCurrentFen=variation?.currentFen??null,fen=variationCurrentFen??game.fens[ply];
 const board=useMemo(()=>variation?variationPosition(game,variation):mainlinePosition(game,ply),[game,ply,variation]);
 const currentTerminal=terminalState(board),mainlineEvaluation=results[ply],current=variation?variationEvaluation:mainlineEvaluation,move=game.moves[ply-1];
 const {reviews,counts}=useMemo(()=>deriveReviews(game,results),[game,results]);
 const selectedReview=variation?undefined:reviews[ply-1];
 const panelBestMove=!currentTerminal&&current?.best?san(fen,current.best):'—';
 const engineBusy=variation?variationBusy:busy,engineStatus=variation?variationStatus:status,engineProgress=variation?(currentTerminal?100:variationEvaluation?100:variationBusy?45:0):Object.keys(results).length/game.fens.length*100;
 const variationArrow=variationCurrentFen&&!currentTerminal?variationBestMoveArrow(variationCurrentFen,variationEvaluation,variationBusy):null;
 const evaluationBarHeight=currentTerminal?currentTerminal.result==='1–0'?100:currentTerminal.result==='0–1'?0:50:current?Math.max(4,Math.min(96,50+current.cp/20)):50;
 const evaluationBarLabel=currentTerminal?.result??score(current);
 usePositionTool({fen,ply:variation?variation.index:ply,headers:game.headers,evaluation:current??null,variation:Boolean(variation)});
 function setVariationState(next:VariationState|null){variationRef.current=next;setVariation(next);}
 function stop(){run.current++;variationRun.current++;engine.current?.dispose();engine.current=null;setBusy(false);setVariationBusy(false);setStatus('Analysis paused');}
 useEffect(()=>()=>{run.current++;variationRun.current++;engine.current?.dispose();sounds.current?.dispose();if(motionTimer.current)clearTimeout(motionTimer.current);if(soundTimer.current)clearTimeout(soundTimer.current);},[]);
 useEffect(()=>{if(modal)dialog.current?.showModal();else dialog.current?.close();},[modal]);
 function animateMove(played:Move,sourceFen:string,forward=true){
  if(motionTimer.current)clearTimeout(motionTimer.current);if(soundTimer.current)clearTimeout(soundTimer.current);
  const reduce=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){setMotion(null);return false;}
  const from=forward?played.from:played.to,to=forward?played.to:played.from,source=new Chess(sourceFen);
  const makePiece=(pieceFrom:Square,pieceTo:Square,id:string):PieceMotion|undefined=>{const piece=source.get(pieceFrom);return piece?{id,from:pieceFrom,to:pieceTo,type:piece.type,color:piece.color}:undefined;};
  const pieces=[makePiece(from,to,'primary')].filter((piece):piece is PieceMotion=>Boolean(piece)),hidden:Square[]=[to];
  const castle=played.flags.includes('k')?'k':played.flags.includes('q')?'q':null;
  if(castle){const rank=played.from[1],rookFrom=(castle==='k'?`h${rank}`:`a${rank}`) as Square,rookTo=(castle==='k'?`f${rank}`:`d${rank}`) as Square,rook=makePiece(forward?rookFrom:rookTo,forward?rookTo:rookFrom,'rook');if(rook){pieces.push(rook);hidden.push(rook.to);}}
  if(!forward&&played.flags.includes('c'))hidden.push(played.flags.includes('e')?`${played.to[0]}${played.from[1]}` as Square:played.to);
  setMotion({pieces,hidden});motionTimer.current=setTimeout(()=>setMotion(null),230);return true;
 }
 async function analyzeVariationPosition(targetFen:string){
  const id=++variationRun.current;run.current++;engine.current?.dispose();engine.current=null;setBusy(false);setVariationBusy(true);setVariationEvaluation(undefined);setVariationStatus('Analyzing variation…');
  const e=new Engine();engine.current=e;
  try{await e.init();const result={...await e.evaluate(targetFen,depth),positionFen:targetFen};const active=variationRef.current;if(id!==variationRun.current||!active||variationFen(active)!==targetFen)return;setVariationResults(values=>({...values,[targetFen]:result}));setVariationEvaluation(result);setVariationStatus('Variation analysis complete');}
  catch(error){if(id===variationRun.current){setVariationStatus((error as Error).message);}}
  finally{if(id===variationRun.current){setVariationBusy(false);e.dispose();engine.current=null;}}
 }
 useEffect(()=>{
  if(!variationCurrentFen)return;
  if(currentTerminal){variationRun.current++;engine.current?.dispose();engine.current=null;setVariationBusy(false);setVariationEvaluation(undefined);setVariationStatus('Position complete');return;}
  const cached=variationResults[variationCurrentFen]??(game.fens[ply]===variationCurrentFen?results[ply]:undefined);
  setVariationEvaluation(cached);
  if(cached){setVariationStatus('Variation analysis complete');return;}
  void analyzeVariationPosition(variationCurrentFen);
 // A committed/navigated variation FEN is the trigger. Results are intentionally
 // excluded: analyzeVariationPosition updates the visible evaluation directly.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[variationCurrentFen,currentTerminal?.kind]);
 function goMainline(n:number){
  const target=Math.max(0,Math.min(game.moves.length,n));
  const forward=target>ply,move=game.moves[forward?target-1:ply-1],sourceFen=game.fens[forward?target-1:ply];
  const animate=Math.abs(target-ply)===1&&Boolean(move);if(animate&&move)animateMove(move,sourceFen,forward);else setMotion(null);
  setPly(target);setSelected(null);
  if(animate&&move)soundTimer.current=setTimeout(()=>sounds.current?.play(soundForMove(move,forward&&new Chess(game.fens[target]).isGameOver())),190);
 }
 function goVariation(n:number){
  const active=variationRef.current;if(!active)return;const target=Math.max(0,Math.min(active.moves.length,n));if(target===active.index)return;
  const forward=target>active.index,played=active.moves[forward?target-1:active.index-1],sourceFen=variationFen(active),animate=Math.abs(target-active.index)===1&&Boolean(played);
  if(animate&&played)animateMove(played,sourceFen,forward);else setMotion(null);
  const next=navigateVariation(active,target);setVariationEvaluation(undefined);setVariationStatus('Loading variation position…');setVariationState(next);setSelected(null);
  if(animate&&played)soundTimer.current=setTimeout(()=>sounds.current?.play(soundForMove(played,forward&&new Chess(variationFen(next)).isGameOver())),190);
 }
 function go(n:number){if(variationRef.current)goVariation(n);else goMainline(n);}
 function stopVariationAnalysis(){variationRun.current++;engine.current?.dispose();engine.current=null;setVariationBusy(false);setVariationStatus('Variation analysis paused');}
 function exitVariation(){const active=variationRef.current;if(!active)return;variationRun.current++;engine.current?.dispose();engine.current=null;setVariationBusy(false);setVariationState(null);setVariationEvaluation(undefined);setVariationResults({});setVariationStatus('Move a piece to explore');setPly(active.branchPly);setSelected(null);setMotion(null);}
 function resetVariation(){const active=variationRef.current;if(!active)return;variationRun.current++;engine.current?.dispose();engine.current=null;setVariationBusy(false);const next=clearVariationMoves(active);setVariationEvaluation(undefined);setVariationStatus('Loading variation position…');setVariationState(next);setSelected(null);setMotion(null);}
 function selectMainline(n:number){if(variationRef.current)exitVariation();goMainline(n);}
 function commitBoardMove(from:Square,to:Square,promotion?:string){
  const sourceFen=fen,nextBoard=new Chess(sourceFen);let played:Move;try{played=nextBoard.move({from,to,promotion});}catch{return;}
  setPromotion(null);setSelected(null);
  const active=variationRef.current,next=active?appendVariation(active,played):beginVariation(ply,sourceFen,played);
  setVariationEvaluation(undefined);setVariationStatus('Analyzing variation…');setVariationState(next);animateMove(played,sourceFen,true);
  soundTimer.current=setTimeout(()=>sounds.current?.play(soundForMove(played,nextBoard.isGameOver())),190);
 }
 useEffect(()=>{function key(e:KeyboardEvent){if(modal||promotion||['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName))return;if(e.key==='ArrowRight'){e.preventDefault();go(variationRef.current?variationRef.current.index+1:ply+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(variationRef.current?variationRef.current.index-1:ply-1);}}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
 async function analyze(){stop();const id=++run.current;setBusy(true);setError('');setStatus('Starting Stockfish…');const e=new Engine();engine.current=e;try{await e.init();for(let i=0;i<game.fens.length;i++){if(id!==run.current)return;const positionFen=game.fens[i];setStatus(`Analyzing position ${i+1} of ${game.fens.length}`);const result={...await e.evaluate(positionFen,depth),positionFen};if(id!==run.current)return;setResults(r=>({...r,[i]:result}));}setStatus('Analysis complete');}catch(err){if(id===run.current){setError((err as Error).message);setStatus('Analysis interrupted');}}finally{if(id===run.current){setBusy(false);e.dispose();engine.current=null;}}}
 function changeDepth(nextDepth:number){setDepth(nextDepth);if(variationRef.current){stopVariationAnalysis();setVariationResults({});setVariationEvaluation(undefined);setVariationStatus('Ready to analyze this position');}else{setResults({});setStatus('Ready to analyze');}}
 function runVisibleAnalysis(){if(variationRef.current){if(currentTerminal)return;if(variationBusy)stopVariationAnalysis();else void analyzeVariationPosition(fen);}else if(busy)stop();else void analyze();}
 function load(text:string){try{const parsed=parsePgn(text);stop();setMotion(null);setGames(parsed);setGameId(0);setPly(0);setResults({});setVariationState(null);setVariationEvaluation(undefined);setVariationResults({});setSelected(null);setStatus('Ready to analyze');setError('');setModal(false);setImportError('');}catch(e){setImportError((e as Error).message);}}
 function playSquare(to:Square){if(selected){const legal=board.moves({square:selected,verbose:true}).find(m=>m.to===to);if(legal){if(legal.promotion){setPromotion({from:selected,to});return;}commitBoardMove(selected,to);return;}}setSelected(board.get(to)?.color===board.turn()?to:null);}
 async function toggleSound(){
  const next=!soundEnabled;
  sounds.current??=new ChessSoundPlayer();
  await sounds.current.setEnabled(next);
  setSoundEnabled(sounds.current.isEnabled);
 }
 const legal=selected?board.moves({square:selected,verbose:true}).map(m=>m.to):[];
 const hiddenPieces=new Set(motion?.hidden??[]);
 const squares=Array.from({length:64},(_,i)=>`${'abcdefgh'[flipped?7-i%8:i%8]}${flipped?Math.floor(i/8)+1:8-Math.floor(i/8)}` as Square);
 const navIndex=variation?.index??ply,navLength=variation?.moves.length??game.moves.length;
 const variationBranchLabel=variation?.branchPly?`${reviews[variation.branchPly-1]?.number??''} ${game.moves[variation.branchPly-1]?.san??''}`.trim():'the starting position';
 const rows=game.moves.reduce<{number:string;indices:number[]}[]>((a,m,i)=>{const num=m.before.split(' ')[5];if(m.color==='w'||!a.length)a.push({number:num,indices:[i]});else a[a.length-1].indices.push(i);return a;},[]);
 return <div className="app"><header><a className="brand" href="/">♞ <span>chesslab<span className="brand-dot">.</span></span></a><span className="header-section"><ChartNoAxesCombined size={17}/> Analysis board</span><span className="local"><span/> Local workspace</span><button className="import-btn" onClick={()=>setModal(true)}><Upload size={16}/> Import PGN</button></header>
 <main><div className="heading"><div className="eyebrow">YOUR NEXT MOVE STARTS HERE</div><h1>A closer look at your game.</h1><p>Explore every move. Understand every turning point.</p></div>
 <div className="workspace"><section className="board-column"><div className="player"><div className="avatar dark">♟</div><div><strong>{flipped?game.headers.White:game.headers.Black}</strong><span>{flipped?'White pieces':'Black pieces'}</span></div><span className="player-tag">{game.headers.Result??'*'}</span></div>
 <div className="board-wrap"><div className={`eval-bar${flipped?' flipped':''}${currentTerminal?' terminal':''}`} aria-label={currentTerminal?`Game result ${currentTerminal.result}`:`White evaluation ${evaluationBarLabel}`}>{evaluationBarHeight>0&&<div style={{height:`${evaluationBarHeight}%`}}/>}<span style={{color:currentTerminal?.result==='0–1'?'#e6e9dc':undefined}}>{evaluationBarLabel}</span></div><div className="board" role="group" aria-label="Interactive chessboard">{squares.map((sq,i)=>{const piece=board.get(sq);return <button key={sq} className={`square ${(sq.charCodeAt(0)+Number(sq[1]))%2===0?'dark-square':'light-square'} ${selected===sq?'selected':''} ${!variation&&(move?.from===sq||move?.to===sq)?'last-move':''}`} onClick={()=>playSquare(sq)} aria-label={`${sq}${piece?` ${piece.color==='w'?'White':'Black'} ${ {p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'}[piece.type]}`:''}`}><span className={`piece ${hiddenPieces.has(sq)?'piece-hidden':''}`}>{piece&&<ChessPiece type={piece.type} color={piece.color}/>}</span>{legal.includes(sq)&&<i className="legal-dot"/>}{i%8===0&&<small className="rank">{sq[1]}</small>}{i>=56&&<small className="file">{sq[0]}</small>}</button>})}{motion&&<PieceMotionLayer pieces={motion.pieces} flipped={flipped}/>}<BoardReviewOverlay review={selectedReview} flipped={flipped} hideArrows={Boolean(currentTerminal)}/>{(currentTerminal?.kind==='checkmate'||currentTerminal?.kind==='stalemate')&&<BoardTerminalOverlay board={board} flipped={flipped} kind={currentTerminal.kind}/>}{variationArrow&&<BestMoveArrow arrow={variationArrow} flipped={flipped}/>}</div></div>
 <div className="player"><div className="avatar white">♟</div><div><strong>{flipped?game.headers.Black:game.headers.White}</strong><span>{flipped?'Black pieces':'White pieces'}</span></div><span className="turn">{board.turn()==='w'?'White':'Black'} to move</span></div>
 <div className="board-controls"><button title="Flip board" aria-label="Flip board" onClick={()=>setFlipped(!flipped)}><ArrowDownUp size={18}/></button><div><button aria-label="First position" onClick={()=>go(0)} disabled={navIndex===0}><ChevronFirst/></button><button aria-label="Previous move" onClick={()=>go(navIndex-1)} disabled={navIndex===0}><ArrowLeft/></button><span>{variation?'Variation ':''}{navIndex} <em>/ {navLength}</em></span><button aria-label="Next move" onClick={()=>go(navIndex+1)} disabled={navIndex===navLength}><ArrowRight/></button><button aria-label="Last position" onClick={()=>go(navLength)} disabled={navIndex===navLength}><ChevronLast/></button></div><button className="sound-toggle" type="button" aria-label={soundEnabled?'Turn sounds off':'Turn sounds on'} aria-pressed={soundEnabled} title={soundEnabled?'Sounds on':'Sounds off'} onClick={toggleSound}>{soundEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><span className="keyboard-hint">← →</span></div>
 {variation&&<div className="variation"><span>Analysis Variation</span><div className="variation-actions"><button onClick={resetVariation}>Reset variation</button><button onClick={exitVariation}>Return to game</button></div></div>}
 <div className="graph-card"><div className="card-heading"><h3>Evaluation timeline</h3><span>White’s perspective</span></div><svg viewBox="0 0 600 90" role="img" aria-label="Game evaluation graph"><line x1="0" x2="600" y1="45" y2="45" stroke="#39433d" strokeDasharray="4 5"/><polyline fill="none" stroke="#b9eb83" strokeWidth="2" points={Object.entries(results).map(([i,e])=>`${Number(i)/Math.max(1,game.moves.length)*600},${45-Math.max(-8,Math.min(8,e.cp/100))*5}`).join(' ')}/><line x1={ply/Math.max(1,game.moves.length)*600} x2={ply/Math.max(1,game.moves.length)*600} y1="0" y2="90" stroke="#8c958e"/>{game.fens.map((_,i)=><rect key={i} x={i/game.fens.length*600} width={600/game.fens.length} height="90" fill="transparent" onClick={()=>selectMainline(i)}><title>Position {i}</title></rect>)}</svg><div className="graph-foot"><span>Opening</span><span>{Object.keys(results).length?'Click the chart to explore':'Run analysis to reveal the evaluation'}</span><span>End</span></div></div>
 </section><aside><section className="panel engine-panel">
  <div className="card-heading"><h2><ChartNoAxesCombined size={18}/> Engine analysis</h2><span className="engine-badge">STOCKFISH 18</span></div>
  {variation
    ?<section className="variation-engine"><div className="variation-engine-context"><strong>Analysis Variation</strong>{!currentTerminal&&<span>{board.turn()==='w'?'White':'Black'} to move</span>}</div>{currentTerminal?<TerminalStateFeedback state={currentTerminal}/>:<VariationEngineFeedback evaluation={variationEvaluation} busy={variationBusy} bestMove={panelBestMove} positionState="No continuation available"/>}</section>
    :currentTerminal?<TerminalStateFeedback state={currentTerminal} review={selectedReview}/>:<EngineReviewFeedback review={selectedReview}/>}
  <div className="engine-options"><label>Search depth <select value={depth} disabled={engineBusy||Boolean(variation&&currentTerminal)} onChange={e=>changeDepth(Number(e.target.value))}><option value="10">10 · Quick</option><option value="14">14 · Balanced</option><option value="18">18 · Deep</option></select></label><button className="analyze" disabled={Boolean(variation&&currentTerminal)} onClick={runVisibleAnalysis}>{engineBusy?<Stop size={15}/>:<Play size={15} fill="currentColor"/>}{engineBusy?'Stop analysis':variation?currentTerminal?'Game over':variationEvaluation?'Analyze position again':'Analyze position':engineProgress===100?'Analyze again':'Analyze game'}</button></div>
  <div className="progress"><div style={{width:`${engineProgress}%`}}/></div><div className="status" aria-live="polite">{engineBusy?<LoaderCircle className="spin" size={13}/>:<Check size={13}/>} {engineStatus}<span>{Math.round(engineProgress)}%</span></div>{!variation&&error&&<p className="error" role="alert">{error}</p>}
 </section>
 <section className="panel game-panel"><div className="card-heading"><h2>Move explorer</h2><span>{game.headers.Result==='*'?'In progress':game.headers.Result??'Imported game'}</span></div><div className="game-title"><strong>{game.headers.Event??'Imported game'}</strong><span>{game.headers.Site??'Local PGN'} · {game.headers.Date?.slice(0,4)??'Unknown date'}</span>{games.length>1&&<select aria-label="Choose imported game" value={gameId} onChange={e=>{stop();setGameId(Number(e.target.value));setPly(0);setResults({});setVariationState(null);setVariationResults({});setStatus('Ready to analyze');}}>{games.map((g,i)=><option key={i} value={i}>{i+1}. {g.headers.White} – {g.headers.Black}</option>)}</select>}</div><div className="moves-header"><span>#</span><span>White</span><span>Black</span></div><div className="moves">{rows.map(row=><div className="move-row" key={row.number}><span>{row.number}.</span>{(['w','b'] as const).map(color=>{const i=row.indices.find(i=>game.moves[i].color===color);if(i===undefined)return <span key={color}/>;const g=reviews[i];return <button key={color} className={ply===i+1&&!variation?'active':''} aria-current={ply===i+1&&!variation?'step':undefined} data-ply={i+1} onClick={()=>selectMainline(i+1)} title={g.classification?`${g.classification}${g.loss!==null?` · ${Math.round(g.loss)} cp loss`:''}`:'Not analyzed'}>{game.moves[i].san}{g.classification&&moveListBadgeLabels.has(g.classification)&&<ClassificationIcon label={g.classification}/>}</button>;})}</div>)}</div>{variation&&<VariationBranch variation={variation} branchLabel={variationBranchLabel} onSelect={goVariation}/>}<MoveReview review={selectedReview} variation={Boolean(variation)}/></section>
 <section className="panel summary"><div className="card-heading"><h2>Game review</h2><span>{game.moves.length} moves</span></div><div className="summary-grid">{categories.map((label,i)=><div key={label}><span className={`legend ${label.toLowerCase()}`}/><span>{label}</span><strong>{label==='Book'||Object.keys(results).length>1?counts[i]:'—'}</strong></div>)}</div><details><summary>How are moves classified? <ChevronDown size={14}/></summary><p>Known moves in the local ECO opening book are marked Book. After the first move outside theory, centipawn loss from the mover’s perspective applies: Best ≤10 (or engine’s top move), Excellent ≤25, Good ≤50, Inaccuracy ≤100, Mistake ≤200, Blunder &gt;200. One pawn = 100 cp. Mate scores use a large signed value. These are approximate, depth-dependent labels; each position has a 2-second search limit.</p></details></section>
 </aside></div><footer><span><span className="privacy-icon">◈</span> Your games stay yours. Everything runs locally in your browser.</span><span>Powered by chess.js & Stockfish</span></footer></main>
 <dialog ref={dialog} onCancel={()=>setModal(false)} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}><div className="modal"><div className="card-heading"><h2>Import a game</h2><button aria-label="Close import" onClick={()=>setModal(false)}><X size={20}/></button></div><p>Paste PGN notation or open a .pgn file. Multiple games are supported.</p><label htmlFor="pgn">PGN notation</label><textarea id="pgn" autoFocus value={pgn} onChange={e=>setPgn(e.target.value)} placeholder={'[White "Player 1"]\n[Black "Player 2"]\n\n1. e4 e5 2. Nf3 Nc6 …'}/><input ref={file} type="file" accept=".pgn,text/plain" hidden onChange={async e=>{const f=e.target.files?.[0];if(f){if(f.size>2*1024*1024){setImportError('Choose a PGN file smaller than 2 MB.');return;}const text=await f.text();setPgn(text);load(text);}e.target.value='';}}/>{importError&&<p className="error" role="alert">{importError}</p>}<div className="modal-actions"><button onClick={()=>file.current?.click()}><Upload size={16}/> Choose file</button><button className="analyze" onClick={()=>load(pgn)}>Load game <ArrowRight size={16}/></button></div><button className="sample-link" onClick={()=>load(SAMPLE)}>Try the Morphy Opera Game</button></div></dialog>
 {promotion&&<div className="promotion-overlay" role="dialog" aria-modal="true" aria-label="Choose promotion"><div className="panel"><h2>Promote pawn</h2>{['q','r','b','n'].map(p=><button key={p} onClick={()=>commitBoardMove(promotion.from,promotion.to,p)}>{ {q:'Queen',r:'Rook',b:'Bishop',n:'Knight'}[p]}</button>)}<button onClick={()=>setPromotion(null)}>Cancel</button></div></div>}
 </div>;
}
