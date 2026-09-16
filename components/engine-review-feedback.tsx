import type {Classification} from '@/lib/chess';
import type {MoveReview} from '@/lib/review';
import {bookTheoryDescription} from '@/lib/opening-display';
import {ClassificationIcon} from './classification';

const descriptions:Record<Classification,string>={
  Book:'This follows known opening theory.',
  Best:'You found the strongest move.',
  Excellent:'A strong move that keeps your position.',
  Good:'A solid move, though there may be a stronger option.',
  Inaccuracy:'This gives up some of your advantage.',
  Mistake:'This significantly worsens your position.',
  Blunder:'This causes a major swing in the position.',
};

const labels:Record<Classification,string>={
  Book:'a book move',Best:'best',Excellent:'excellent',Good:'good',
  Inaccuracy:'an inaccuracy',Mistake:'a mistake',Blunder:'a blunder',
};

const correctionLabels=new Set<Classification>(['Inaccuracy','Mistake','Blunder']);

export function EngineReviewFeedback({review}:{review?:MoveReview}){
  const classification=review?.classification;
  if(!review||!classification)return null;
  const isCorrection=correctionLabels.has(classification);
  const betterMove=review.correctionBestMove;
  const description=classification==='Book'?bookTheoryDescription(review.opening):descriptions[classification];

  return <section className="engine-feedback" aria-live="polite" aria-label="Game Review feedback">
    <div className="engine-feedback-heading">
      <ClassificationIcon label={classification}/>
      <div>
        <h3>{review.played} is {labels[classification]}</h3>
        <p>{description}</p>
      </div>
    </div>
    {isCorrection&&betterMove!=='—'&&<p className="engine-feedback-better"><strong>{betterMove}</strong> was better.</p>}
  </section>;
}
