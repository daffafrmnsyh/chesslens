import type {TerminalState} from '@/lib/terminal-state';

export function TerminalStateFeedback({state}:{state:TerminalState}){
  return <section className="engine-feedback terminal-feedback" aria-live="polite" aria-label={`${state.title}: ${state.detail}`}>
    <div>
      <h3>{state.title}</h3>
      <p>{state.detail}</p>
    </div>
    <strong className="terminal-result">{state.result}</strong>
  </section>;
}
