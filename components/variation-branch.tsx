import type {VariationState} from '@/lib/variation';

export function VariationBranch({variation,branchLabel,onSelect}:{variation:VariationState;branchLabel:string;onSelect:(index:number)=>void}){
  return <div className="variation-branch" aria-label="Analysis variation">
    <div className="variation-branch-heading"><span>↳</span><strong>Variation after {branchLabel}</strong></div>
    <div className="variation-line">
      <button className={variation.index===0?'active':''} onClick={()=>onSelect(0)}>Start</button>
      {variation.moves.map((move,index)=><button key={`${index}-${move.lan}`} className={variation.index===index+1?'active':''} aria-current={variation.index===index+1?'step':undefined} onClick={()=>onSelect(index+1)}>
        <small>{move.before.split(' ')[5]}{move.color==='w'?'.':'...'}</small>{move.san}
      </button>)}
    </div>
  </div>;
}
