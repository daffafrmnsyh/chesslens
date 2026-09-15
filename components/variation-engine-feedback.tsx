import type {Evaluation} from '@/lib/chess';
import {score} from '@/lib/chess';
import {variationEvaluationSummary} from '@/lib/variation-feedback';

export function VariationEngineFeedback({evaluation,busy,bestMove,positionState}:{evaluation?:Evaluation;busy:boolean;bestMove:string;positionState:string}){
  if(busy||!evaluation){
    return <div className="variation-feedback" aria-live="polite">
      <p className="variation-feedback-loading">Analyzing position…</p>
    </div>;
  }
  if(bestMove==='—'){
    return <div className="variation-feedback" aria-live="polite">
      <p className="variation-feedback-loading">{positionState}</p>
      <small>Depth {evaluation.depth}</small>
    </div>;
  }
  return <div className="variation-feedback" aria-live="polite">
    <strong className="variation-feedback-recommendation"><span aria-hidden="true">★</span>{bestMove} is best</strong>
    <p>{variationEvaluationSummary(evaluation)} <span className="variation-feedback-score">({score(evaluation)})</span></p>
    <small>Depth {evaluation.depth}</small>
  </div>;
}
