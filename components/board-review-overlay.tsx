import type {MoveReview} from '@/lib/review';
import {BestMoveArrow} from './best-move-arrow';
import {BoardClassificationBadge} from './board-classification-badge';

export function BoardReviewOverlay({review,flipped,hideArrows=false}:{review?:MoveReview;flipped:boolean;hideArrows?:boolean}){
  if(!review)return null;
  return <>
    {!hideArrows&&review.reviewArrows.map((arrow,index)=><BestMoveArrow key={`${arrow.kind}-${arrow.from}-${arrow.to}-${index}`} arrow={arrow} flipped={flipped}/>)}
    {review.classification&&<BoardClassificationBadge classification={review.classification} destination={review.playedMove.to} flipped={flipped} played={review.played}/>} 
  </>;
}
