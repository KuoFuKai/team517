import {Timestamp} from 'firebase-admin/firestore';
import type {UpdateOfferAvailabilityRequest,UpdateOfferAvailabilityResponse} from '@team517/contracts';
import {AssignmentRepository,type LifecycleSnapshot} from '../repositories/assignments';
import {offerId} from '../repositories/marketplace';
import {authorizeMarketplace} from '../permissions/marketplace';
import {ApiFailure} from '../shared/errors';
import {availabilityFit} from './availability';
import {offerDto,assignmentDto} from './dto';
import type {Assignment,Offer} from '../domain/marketplace';
export function availabilityRevision(offer:Offer){return offer.availabilityRevision ?? 0;}
function pending(s:LifecycleSnapshot){
 if(!s.assignment || s.assignment.status!=='PENDING_CONFIRMATION' || s.task.status!=='AWAITING_CONFIRMATION' || s.task.activeAssignmentId!==s.assignment.id || s.assignment.taskId!==s.task.id || s.assignment.careContextId!==s.task.careContextId || !s.offer || s.offer.id!==s.assignment.offerId || s.offer.status!=='SELECTED' || s.offer.taskId!==s.task.id || s.offer.helperId!==s.assignment.helperId)throw new ApiFailure(409,'ASSIGNMENT_NOT_REVIEWABLE','This pending selection is no longer current.');
 return s.assignment;
}
function accepted(a:Assignment,o:Offer,revision:number):Assignment {
 const {selectedAvailableFrom:_f,selectedAvailableUntil:_u,...rest}=a;
 return {...rest,selectedAvailabilityRevision:revision,requiresRequesterReconfirmation:false,...(o.availableFrom && o.availableUntil ? {selectedAvailableFrom:o.availableFrom,selectedAvailableUntil:o.availableUntil}:{})};
}
export class OfferAvailabilityService {
 constructor(private repo=new AssignmentRepository()){}
 async update(uid:string,taskId:string,body:UpdateOfferAvailabilityRequest):Promise<UpdateOfferAvailabilityResponse>{
  const result=await this.repo.change(uid,{taskId,offerId:offerId(taskId,uid)},async s=>{
   const o=s.targetOffer;if(!o)throw new ApiFailure(404,'OFFER_NOT_FOUND','Your offer was not found.');
   if(o.careContextId!==s.task.careContextId)throw new ApiFailure(403,'FORBIDDEN','Offer context does not match.');
   await authorizeMarketplace(s.permissions,uid,'UPDATE_OFFER_AVAILABILITY',{task:s.task,offer:o});
   await authorizeMarketplace(s.permissions,uid,'OFFER_HELP',{task:s.task});
   const selected=o.status==='SELECTED';
   if(selected){pending(s);if(s.offer!.id!==o.id)throw new ApiFailure(409,'OFFER_NOT_EDITABLE','This selected offer is no longer current.');}
   else if(o.status!=='ACTIVE' || !['OPEN','HAS_OFFERS','AWAITING_CONFIRMATION'].includes(s.task.status) || (s.task.status==='AWAITING_CONFIRMATION' && s.assignment?.status!=='PENDING_CONFIRMATION'))throw new ApiFailure(409,'OFFER_NOT_EDITABLE','Only an active or current pending offer can change availability. Confirmed arrangements are not editable here.');
   const same=o.availableFrom?.toMillis()===(body.availableFrom?Date.parse(body.availableFrom):undefined) && o.availableUntil?.toMillis()===(body.availableUntil?Date.parse(body.availableUntil):undefined);
   if(same)return {task:s.task,assignment:s.assignment,offers:[o],events:[],unchanged:true};
   const oldRevision=availabilityRevision(o);
   if(body.expectedRevision!==oldRevision)throw new ApiFailure(409,'AVAILABILITY_STALE','Availability changed. Reload the latest version before saving.');
   if(oldRevision>=1_000_000_000)throw new ApiFailure(409,'CONFLICT','Availability revision limit reached.');
   const now=Timestamp.now(),nextRevision=oldRevision+1;
   const {availableFrom:_f,availableUntil:_u,...rest}=o;
   const changed:Offer={...rest,availabilityRevision:nextRevision,availabilityChangedAt:now,updatedAt:now,...(body.availableFrom && body.availableUntil ? {availableFrom:Timestamp.fromDate(new Date(body.availableFrom)),availableUntil:Timestamp.fromDate(new Date(body.availableUntil))}:{})};
   const fit=availabilityFit(changed.availableFrom?.toMillis(),changed.availableUntil?.toMillis(),s.task.startAt?.toMillis(),s.task.endAt?.toMillis());
   let assignment=s.assignment;
   if(selected){const previous=s.assignment!.selectedAvailabilityRevision===undefined ? accepted(s.assignment!,o,oldRevision) : s.assignment!;assignment=fit==='COVERS_TASK'?accepted(previous,changed,nextRevision):{...previous,requiresRequesterReconfirmation:true};assignment.updatedAt=now;}
   return {task:s.task,assignment,offers:[changed],events:['OFFER_AVAILABILITY_UPDATED'],metadata:{offerId:o.id,helperId:o.helperId,oldRevision,newRevision:nextRevision,semanticChange:selected?(fit==='COVERS_TASK'?'COVERAGE_PRESERVED':'REQUESTER_REVIEW_REQUIRED'):'ACTIVE_OFFER_UPDATED',...(selected?{assignmentId:assignment!.id}:{})}};
  });
  return {offer:offerDto(result.offers[0],result.task),...(result.assignment && result.assignment.helperId===uid && result.assignment.offerId===result.offers[0].id?{assignment:assignmentDto(result.assignment,result.offers[0].id===result.assignment.offerId?result.offers[0]:undefined,result.task)}:{})};
 }
 async reconfirm(uid:string,id:string,expectedRevision:number){
  const result=await this.repo.change(uid,{assignmentId:id},async s=>{
   await authorizeMarketplace(s.permissions,uid,'SELECT_HELPER',{task:s.task});
   const a=pending(s),o=s.offer!,revision=availabilityRevision(o);
   if(expectedRevision!==revision)throw new ApiFailure(409,'AVAILABILITY_STALE','New availability is available. Review it before keeping this helper.');
   if(!a.requiresRequesterReconfirmation && a.selectedAvailabilityRevision===revision)return {task:s.task,assignment:a,offers:[],events:[],unchanged:true};
   return {task:s.task,assignment:{...accepted(a,o,revision),updatedAt:Timestamp.now()},offers:[],events:['AVAILABILITY_RECONFIRMED'],metadata:{offerId:o.id,helperId:o.helperId,assignmentId:a.id,oldRevision:a.selectedAvailabilityRevision ?? 0,newRevision:revision,semanticChange:'REQUESTER_RECONFIRMED'}};
  });
  // The revision-bearing current view is fetched by the caller's normal refresh.
  return assignmentDto(result.assignment!);
 }
}
