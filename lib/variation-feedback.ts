import type {Evaluation} from './chess';

export function variationEvaluationSummary(evaluation:Evaluation):string{
  if(evaluation.mate!==undefined){
    const side=evaluation.mate>0?'White':'Black';
    return `${side} has a forced mate (M${Math.abs(evaluation.mate)})`;
  }
  const advantage=Math.abs(evaluation.cp);
  if(advantage<50)return 'The position is roughly equal.';
  const side=evaluation.cp>0?'White':'Black';
  if(advantage<150)return `${side} has a slight advantage.`;
  if(advantage<400)return `${side} has the advantage.`;
  return `${side} has a winning advantage.`;
}
