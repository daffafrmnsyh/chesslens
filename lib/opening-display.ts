import type {OpeningInfo} from './openings';

type OpeningReview={opening?:OpeningInfo};

const isKnownValue=(value:string|undefined)=>Boolean(value&&value.trim()&&!/^\?+$/.test(value.trim()));

export function openingAtPly(reviews:readonly OpeningReview[],ply:number):OpeningInfo|undefined{
 const opening=reviews[ply-1]?.opening;
 return opening&&isKnownValue(opening.name)?opening:undefined;
}

export function openingDetails(opening:OpeningInfo|undefined):string{
 if(!opening)return '';
 return [opening.variation,opening.eco].filter(isKnownValue).join(' · ');
}

export function gameMetadata(site:string|undefined,date:string|undefined):string{
 const source=isKnownValue(site)?site!.trim():'';
 const year=date?.match(/^\d{4}/)?.[0]??'';
 return [source,year].filter(Boolean).join(' · ');
}

export function gameDisplayTitle(opening:OpeningInfo|undefined,event:string|undefined):string{
 return opening?.name??(isKnownValue(event)?event!.trim():'Imported game');
}

export function bookTheoryDescription(opening:OpeningInfo|undefined):string{
 return opening&&isKnownValue(opening.name)
  ?`This follows known ${opening.name}${isKnownValue(opening.variation)?`: ${opening.variation}`:''} theory.`
  :'This follows known opening theory.';
}
