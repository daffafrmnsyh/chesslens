import {score} from '@/lib/chess';
import type {MoveReview as Review} from '@/lib/review';
import {ClassificationIcon} from './classification';
export function MoveReview({review,variation}:{review?:Review;variation:boolean}){
  const recommendation=review?.recommendation??null;
  const isCorrection=recommendation?.kind==='correction';
  return <section className="selected-review" aria-label="Selected move review" aria-live="polite">
    {!review||variation?<p>{variation?'Return to the game to review the selected move.':'Select a move to see its review and the recommended alternative.'}</p>:<>
      <div className="review-heading"><h3>{review.number} {review.played}</h3><span className="classification-label">{review.classification?<><ClassificationIcon label={review.classification}/>{review.classification}</>:'Not analyzed'}</span></div>
      {review.classification==='Book'?<>
        <div className="opening-review"><strong>{review.opening?.name??'Known opening move'}</strong>{review.opening&&<span>{review.opening.eco}{review.opening.variation?` · ${review.opening.variation}`:''}</span>}</div>
        <dl className="review-moves"><div><dt>Played</dt><dd>{review.played}</dd></div><div><dt>{recommendation?.uci?'Best continuation':'Theory'}</dt><dd>{recommendation?.uci?recommendation.move:'Book move'}</dd></div></dl>
      </>:<dl className="review-moves"><div><dt>Played</dt><dd>{review.played}</dd></div><div><dt>{isCorrection?'Best instead':'Best continuation'}</dt><dd>{recommendation?.move??'—'}</dd></div></dl>}
      <div className="review-evaluation"><span>Evaluation · White’s perspective</span>{isCorrection?<><div><span aria-label="Evaluation before">{score(review.before)}</span><span aria-hidden="true"> → </span><span aria-label="Evaluation after">{score(review.after)}</span></div><small>Before → after the played move</small></>:<><div><span aria-label="Evaluation after">{score(review.after)}</span></div><small>After the played move</small></>}</div>
      {isCorrection&&<p className="review-loss">{review.loss!==null?`${Math.round(review.loss)} cp loss`:'Centipawn loss awaits analysis of both positions.'}</p>}
      <p className="review-note">{review.classification==='Book'?'Known opening move. The engine panel can show the best continuation from the resulting position.':isCorrection?'The badge marks the played move. The arrow shows the stronger move from the position before it.':'The badge marks the played move. The engine panel shows Stockfish’s best continuation from the resulting position.'}</p>
    </>}
  </section>;
}
