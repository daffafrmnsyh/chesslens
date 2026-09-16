import type {TerminalState} from '@/lib/terminal-state';
import type {Classification} from '@/lib/chess';
import type {MoveReview} from '@/lib/review';
import {ClassificationIcon} from './classification';

const labels:Record<Classification,string>={
  Book:'a book move',Best:'best',Excellent:'excellent',Good:'good',
  Inaccuracy:'an inaccuracy',Mistake:'a mistake',Blunder:'a blunder',
};

function terminalSummary(state:TerminalState){
  if(state.kind==='checkmate')return `Checkmate. ${state.detail}.`;
  if(state.kind==='stalemate')return 'Stalemate. The game is drawn.';
  return `Draw by ${state.detail.toLowerCase()}.`;
}

export function TerminalStateFeedback({state,review}:{state:TerminalState;review?:MoveReview}){
  const classification=review?.classification;
  return <section className="engine-feedback terminal-feedback" aria-live="polite" aria-label={`${state.title}: ${state.detail}`}>
    {review&&classification?<div className="engine-feedback-heading">
      <ClassificationIcon label={classification}/>
      <div><h3>{review.played} is {labels[classification]}</h3><p>{terminalSummary(state)}</p></div>
    </div>:<div><h3>{state.title}</h3><p>{state.detail}</p></div>}
    <strong className="terminal-result">{state.result}</strong>
  </section>;
}
