import {Timestamp} from 'firebase-admin/firestore';
import type {RescheduleTaskRequest,ReschedulePreviewDto,RescheduleTaskResponse} from '@team517/contracts';
import {AssignmentRepository,type LifecycleSnapshot} from '../repositories/assignments';
import {authorizeMarketplace} from '../permissions/marketplace';
import {authorizeAssignment} from '../permissions/assignments';
import {ApiFailure} from '../shared/errors';
import {availabilityFit} from '../marketplace/availability';
import {assignmentDto} from '../marketplace/dto';
import {taskDetailDto} from '../task/dto';

export const scheduleRevision=(s:LifecycleSnapshot)=>s.task.scheduleRevision ?? 0;
function coupled(s:LifecycleSnapshot){
 const a=s.assignment,o=s.offer;
 if(!a || s.task.activeAssignmentId!==a.id || a.taskId!==s.task.id || a.careContextId!==s.task.careContextId || !o || o.id!==a.offerId || o.taskId!==s.task.id || o.careContextId!==s.task.careContextId || o.helperId!==a.helperId || o.status!=='SELECTED')throw new ApiFailure(409,'CONFLICT','The current arrangement needs to be refreshed.');
 return a;
}
function eligible(s:LifecycleSnapshot){
 if(!s.task.publishedAt || !s.task.startAt || !s.task.endAt || !['OPEN','HAS_OFFERS','AWAITING_CONFIRMATION','ARRANGED'].includes(s.task.status))throw new ApiFailure(409,'TASK_NOT_RESCHEDULABLE','Only published tasks before execution may be rescheduled.');
 if(s.task.activeAssignmentId){const a=coupled(s);if(a.status!==(s.task.status==='ARRANGED'?'CONFIRMED':'PENDING_CONFIRMATION') || !['ARRANGED','AWAITING_CONFIRMATION'].includes(s.task.status))throw new ApiFailure(409,'CONFLICT','Refresh the current arrangement.');}
 else if(['ARRANGED','AWAITING_CONFIRMATION'].includes(s.task.status))throw new ApiFailure(409,'CONFLICT','The active arrangement is missing.');
}
const fit=(s:LifecycleSnapshot,start:number,end:number)=>availabilityFit(s.offer?.availableFrom?.toMillis(),s.offer?.availableUntil?.toMillis(),start,end);
export class TaskScheduleService {
 constructor(private repo=new AssignmentRepository()){}
 private async change(uid:string,id:string,body:RescheduleTaskRequest,preview:boolean){
  return this.repo.change(uid,{taskId:id},async s=>{
   await authorizeMarketplace(s.permissions,uid,'RESCHEDULE_TASK',{task:s.task,assignment:s.assignment});eligible(s);
   if((s.task.activeAssignmentId ?? null)!==body.expectedAssignmentId)throw new ApiFailure(409,'SCHEDULE_STALE','The selected helper changed. Refresh before updating the schedule.');
   const same=s.task.startAt!.toMillis()===Date.parse(body.startAt) && s.task.endAt!.toMillis()===Date.parse(body.endAt);
   if(!same && body.expectedRevision!==scheduleRevision(s))throw new ApiFailure(409,'SCHEDULE_STALE','Schedule changed elsewhere. Refresh before updating.');
   if(preview || same)return {projectionOffer:s.offer,task:s.task,assignment:s.assignment,offers:[...s.backups,...(s.offer?[s.offer]:[])],events:[],unchanged:true};
   if(scheduleRevision(s)>=1_000_000_000)throw new ApiFailure(409,'CONFLICT','Schedule revision limit reached.');
   const now=Timestamp.now(),revision=scheduleRevision(s)+1;
   const assignment=s.assignment ? {...s.assignment,status:'PENDING_CONFIRMATION' as const,requiresHelperReconfirmation:true,
    acceptedScheduleStartAt:s.assignment.acceptedScheduleStartAt ?? s.task.startAt!,acceptedScheduleEndAt:s.assignment.acceptedScheduleEndAt ?? s.task.endAt!,
    selectedScheduleRevision:s.assignment.selectedScheduleRevision ?? scheduleRevision(s),confirmedScheduleRevision:s.assignment.confirmedScheduleRevision ?? scheduleRevision(s),
    requiresRequesterReconfirmation:false,updatedAt:now} : undefined;
   return {projectionOffer:s.offer,task:{...s.task,startAt:Timestamp.fromDate(new Date(body.startAt)),endAt:Timestamp.fromDate(new Date(body.endAt)),scheduleRevision:revision,
    status:assignment?'AWAITING_CONFIRMATION' as const:s.task.status,requiresHelperReconfirmation:Boolean(assignment)},assignment,offers:[],events:['TASK_RESCHEDULED'],
    metadata:{oldRevision:scheduleRevision(s),newRevision:revision,semanticChange:assignment?'HELPER_RECONFIRMATION_REQUIRED':'SCHEDULE_UPDATED'},
    notificationRecipients:[...s.backups.map(o=>o.helperId),...(assignment?[assignment.helperId]:[])]};
  });
 }
 async preview(uid:string,id:string,body:RescheduleTaskRequest):Promise<ReschedulePreviewDto>{
  const r=await this.change(uid,id,body,true),current={startAt:r.task.startAt!.toDate().toISOString(),endAt:r.task.endAt!.toDate().toISOString()};
  // Preview does not write. The commit repeats authorization and relationship/revision checks.
  const selected=r.offers.find(o=>o.status==='SELECTED');
  const changed=Date.parse(body.startAt)!==Date.parse(current.startAt) || Date.parse(body.endAt)!==Date.parse(current.endAt);
  return {current,proposed:{startAt:body.startAt,endAt:body.endAt},scheduleRevision:r.task.scheduleRevision ?? 0,activeAssignmentId:r.task.activeAssignmentId,
   affectedHelpers:r.offers.length,selectedHelperId:r.assignment?.helperId,requiresHelperReconfirmation:changed && Boolean(r.assignment),
   ...(selected?{selectedHelperFit:availabilityFit(selected.availableFrom?.toMillis(),selected.availableUntil?.toMillis(),Date.parse(body.startAt),Date.parse(body.endAt))}:{})};
 }
 async reschedule(uid:string,id:string,body:RescheduleTaskRequest):Promise<RescheduleTaskResponse>{
  const r=await this.change(uid,id,body,false);return {task:taskDetailDto(r.task),...(r.assignment?{assignment:assignmentDto(r.assignment,r.projectionOffer,r.task)}:{})};
 }
 async confirm(uid:string,id:string,expectedRevision:number){
  const r=await this.repo.change(uid,{assignmentId:id},async s=>{
   await authorizeAssignment(s.permissions,uid,'CONFIRM_ASSIGNMENT',s.task,s.assignment);const a=coupled(s);
   if(expectedRevision!==scheduleRevision(s))throw new ApiFailure(409,'SCHEDULE_STALE','The task changed again. Review its latest schedule.');
   if(a.status==='CONFIRMED' && s.task.status==='ARRANGED' && !a.requiresHelperReconfirmation && a.confirmedScheduleRevision===expectedRevision)return {projectionOffer:s.offer,task:s.task,assignment:a,offers:[],events:[],unchanged:true};
   if(a.status!=='PENDING_CONFIRMATION' || s.task.status!=='AWAITING_CONFIRMATION' || !a.requiresHelperReconfirmation)throw new ApiFailure(409,'SCHEDULE_NOT_RECONFIRMABLE','This arrangement is not waiting for schedule reconfirmation.');
   if(fit(s,s.task.startAt!.toMillis(),s.task.endAt!.toMillis())!=='COVERS_TASK')throw new ApiFailure(409,'AVAILABILITY_UPDATE_REQUIRED','Update your availability to cover the new task time before confirming.');
   if(a.requiresRequesterReconfirmation)throw new ApiFailure(409,'REQUESTER_RECONFIRMATION_REQUIRED','The requester must review your availability first.');
   const now=Timestamp.now();return {projectionOffer:s.offer,task:{...s.task,status:'ARRANGED' as const,requiresHelperReconfirmation:false,offerCount:1},
    assignment:{...a,status:'CONFIRMED' as const,requiresHelperReconfirmation:false,confirmedScheduleRevision:expectedRevision,selectedScheduleRevision:expectedRevision,
     acceptedScheduleStartAt:s.task.startAt!,acceptedScheduleEndAt:s.task.endAt!,confirmedAt:now,updatedAt:now},
    offers:s.backups.map(o=>({...o,status:'NOT_SELECTED' as const,updatedAt:now})),events:['SCHEDULE_RECONFIRMED'],
    metadata:{oldRevision:a.confirmedScheduleRevision ?? 0,newRevision:expectedRevision,assignmentId:a.id,helperId:a.helperId}};
  });return assignmentDto(r.assignment!,r.projectionOffer,r.task);
 }
}
