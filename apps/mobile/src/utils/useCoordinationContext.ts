import {useEffect,useState} from 'react';
import type {AssignmentDto,TaskStatus} from '@team517/contracts';
import * as api from '../api/client';
// Existing authorized projections only. No Auth/email/UID-derived display names or global cache.
export function useCoordinationContext(taskId:string,assignmentId?:string,lookupOffers=false,helper=false,version?:string){
 const key=[taskId,assignmentId,lookupOffers,helper,version].join('|');
 const [value,setValue]=useState<{key:string;assignment?:AssignmentDto;name?:string;offerCount?:number;status?:TaskStatus;startAt?:string;endAt?:string}>();
 useEffect(()=>{let active=true;setValue(undefined);void(async()=>{
  const offers=lookupOffers?await api.listOffers(taskId):undefined;
  const id=assignmentId ?? offers?.task.activeAssignmentId;
  const assignment=id?await api.getAssignment(id):undefined;
  let name:string|undefined;
  if(assignment && !helper){try{name=(await api.getHelperTrustProfile(assignment.helperId,taskId)).displayName;}catch{/* Neutral fallback, never derive a public name from identity data. */}}
  if(active)setValue({key,assignment,name,offerCount:offers?.task.offerCount,status:offers?.task.status,startAt:offers?.task.startAt,endAt:offers?.task.endAt});
 })().catch(()=>{if(active)setValue(undefined);});return()=>{active=false;};},[key]);
 return value?.key===key?value:undefined;
}
