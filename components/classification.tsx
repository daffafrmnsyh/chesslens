import {BookOpen,Check,Star,ThumbsUp} from 'lucide-react';
import type {Classification} from '@/lib/chess';
const symbols:Record<Exclude<Classification,'Book'>,string>={Best:'★',Excellent:'✓',Good:'✓',Inaccuracy:'?!',Mistake:'?',Blunder:'??'};
function BoardSymbol({label}:{label:Classification}){
  if(label==='Book')return <BookOpen aria-hidden="true"/>;
  if(label==='Best')return <Star aria-hidden="true" fill="currentColor"/>;
  if(label==='Excellent')return <Check aria-hidden="true"/>;
  if(label==='Good')return <ThumbsUp aria-hidden="true" fill="currentColor"/>;
  const fontSize=label==='Mistake'?72:label==='Inaccuracy'?56:58;
  return <svg viewBox="0 0 100 100" aria-hidden="true" className="board-grade-text">
    <text x="50" y={label==='Mistake'?'75':'70'} textAnchor="middle" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" fontSize={fontSize} fontWeight="800" letterSpacing={label==='Mistake'?'0':'-5'}>{symbols[label]}</text>
  </svg>;
}
export function ClassificationIcon({label,board=false}:{label:Classification;board?:boolean}){
  return <span className={`grade-dot ${label.toLowerCase()}${board?' board-grade-dot':''}`} aria-label={label} title={label}>
    {board?<BoardSymbol label={label}/>:label==='Book'?<BookOpen size={13} aria-hidden="true"/>:symbols[label]}
  </span>;
}
