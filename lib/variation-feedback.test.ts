import {test} from 'node:test';
import assert from 'node:assert/strict';
import {variationEvaluationSummary} from './variation-feedback';

const evaluation=(cp:number,mate?:number)=>({cp,mate,best:'e2e4',depth:14,pv:[]});

test('variation feedback uses white-perspective presentation thresholds',()=>{
  assert.equal(variationEvaluationSummary(evaluation(32)),'The position is roughly equal.');
  assert.equal(variationEvaluationSummary(evaluation(132)),'White has a slight advantage.');
  assert.equal(variationEvaluationSummary(evaluation(-240)),'Black has the advantage.');
  assert.equal(variationEvaluationSummary(evaluation(520)),'White has a winning advantage.');
});

test('variation feedback presents forced mates without centipawn copy',()=>{
  assert.equal(variationEvaluationSummary(evaluation(99500,3)),'White has a forced mate (M3)');
  assert.equal(variationEvaluationSummary(evaluation(-99600,-2)),'Black has a forced mate (M2)');
});
