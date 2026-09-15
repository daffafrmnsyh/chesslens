import {squareCenter,type ReviewArrow} from '@/lib/review';

type Point={x:number;y:number};

const add=(a:Point,b:Point):Point=>({x:a.x+b.x,y:a.y+b.y});
const subtract=(a:Point,b:Point):Point=>({x:a.x-b.x,y:a.y-b.y});
const scale=(point:Point,factor:number):Point=>({x:point.x*factor,y:point.y*factor});
const normalize=(point:Point):Point=>scale(point,1/Math.hypot(point.x,point.y));
const perpendicular=(point:Point):Point=>({x:-point.y,y:point.x});
const points=(values:Point[])=>values.map(({x,y})=>`${x},${y}`).join(' ');

function arrowPolygon(start:Point,end:Point){
  const direction=normalize(subtract(end,start));
  const normal=perpendicular(direction);
  const tip=add(end,scale(direction,-.04));
  const headBase=add(tip,scale(direction,-.42));
  return points([
    add(start,scale(normal,.1)),add(headBase,scale(normal,.1)),add(headBase,scale(normal,.29)),tip,
    add(headBase,scale(normal,-.29)),add(headBase,scale(normal,-.1)),add(start,scale(normal,-.1)),
  ]);
}

function knightPolygon(start:Point,bend:Point,end:Point){
  const first=normalize(subtract(bend,start));
  const second=normalize(subtract(end,bend));
  const firstNormal=perpendicular(first);
  const secondNormal=perpendicular(second);
  const tip=add(end,scale(second,-.04));
  const headBase=add(tip,scale(second,-.42));
  // This traces one continuous filled outline around both legs of the L.
  return points([
    add(start,scale(firstNormal,.1)),add(bend,scale(firstNormal,.1)),add(bend,scale(secondNormal,.1)),
    add(headBase,scale(secondNormal,.1)),add(headBase,scale(secondNormal,.29)),tip,
    add(headBase,scale(secondNormal,-.29)),add(headBase,scale(secondNormal,-.1)),add(bend,scale(secondNormal,-.1)),
    add(bend,scale(firstNormal,-.1)),add(start,scale(firstNormal,-.1)),
  ]);
}

export function BestMoveArrow({arrow,flipped}:{arrow:ReviewArrow;flipped:boolean}){
  const from=squareCenter(arrow.from,flipped),to=squareCenter(arrow.to,flipped);
  const delta=subtract(to,from);
  const isKnight=Math.abs(delta.x)+Math.abs(delta.y)===3&&Math.max(Math.abs(delta.x),Math.abs(delta.y))===2;
  const bend=isKnight?(Math.abs(delta.x)===2?{x:to.x,y:from.y}:{x:from.x,y:to.y}):null;
  const firstTarget=bend??to;
  const start=add(from,scale(normalize(subtract(firstTarget,from)),.18));
  const shape=bend?knightPolygon(start,bend,to):arrowPolygon(start,to);
  const label=arrow.kind==='variation'?'Best continuation in analysis variation':'Best correction before the played move';
  return <svg className="best-move-arrow" viewBox="0 0 8 8" role="img" aria-label={`${label}: ${arrow.from} to ${arrow.to}`} data-from={arrow.from} data-to={arrow.to} data-context={arrow.kind}>
    <polygon className="best-move-arrow-shape" points={shape}/>
  </svg>;
}
