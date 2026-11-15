import {countLabel} from './presentation';
import type {AssignmentDto} from '@team517/contracts';

export function requesterCoordination(task:{status:string;requiresHelperReconfirmation?:boolean},context?:{status?:string;assignment?:AssignmentDto;name?:string;offerCount?:number}):CoordinationInput {
 return {status:context?.assignment?.status ?? context?.status ?? task.status,requesterContextKnown:task.status==='DRAFT'||context!==undefined,helperName:context?.name,offerCount:context?.offerCount,scheduleChanged:context?.assignment?.scheduleReview?.requiresHelperReconfirmation ?? task.requiresHelperReconfirmation,availabilityChanged:context?.assignment?.availabilityReview?.requiresRequesterReconfirmation};
}

// Explanation only: callers retain their existing server-checked action handlers.
export interface CoordinationInput {
  status: string; helper?: boolean; helperName?: string; offerCount?: number;
  scheduleChanged?: boolean; availabilityChanged?: boolean;
  requesterContextKnown?: boolean;
}
export interface TaskStatusPresentation {
  title: string; summary: string; nextActor: string; nextActionLabel?: string;
  supportingDetail: string; tone: 'action' | 'waiting' | 'complete' | 'neutral';
}
export function assignmentListSummary(input:CoordinationInput,contextReady=true):string {
  if(input.status==='PENDING_CONFIRMATION' && !contextReady)return 'Open the arrangement to see who needs to act.';
  const value=taskStatusPresentation(input);
  return input.status==='COMPLETED' || value.title.startsWith(value.nextActor)?value.title:`${value.nextActor} · ${value.title}`;
}
export function safeHelperName(displayName?: string): string {
  return displayName?.trim() || 'your helper';
}
export function taskStatusPresentation(input: CoordinationInput): TaskStatusPresentation {
  const {helper=false}=input, name=safeHelperName(input.helperName);
  const status=({PENDING_CONFIRMATION:'AWAITING_CONFIRMATION',CONFIRMED:'ARRANGED'} as Record<string,string>)[input.status] ?? input.status;
  const result=(title:string,summary:string,nextActor:string,nextActionLabel:string|undefined,supportingDetail:string,tone:TaskStatusPresentation['tone']='waiting')=>({title,summary,nextActor,nextActionLabel,supportingDetail,tone});
  if(!helper && input.requesterContextKnown===false){
    const titles:Record<string,string>={OPEN:'Waiting for helpers',HAS_OFFERS:'Helpers have responded',AWAITING_CONFIRMATION:'Arrangement needs a response',ARRANGED:'Help arranged',IN_PROGRESS:'Help is in progress',COMPLETION_PENDING:'Completion awaiting review',COMPLETED:'Completed',CANCELLED:'Task cancelled',DISPUTED:'Completion needs attention'};
    return result(titles[status] ?? 'Current task status','This request is part of your care context.','Current status',undefined,'Refresh the status to check the current next steps.','neutral');
  }
  // A requester review takes precedence if both independently guarded changes exist.
  if(status==='AWAITING_CONFIRMATION' && input.availabilityChanged) return result(helper?'Your availability needs review':`${name === 'your helper'?'Your helper':name} updated availability`,helper?'Your new availability does not fully cover the task.':'The updated availability does not fully cover this task.',helper?'Waiting for requester':'Your turn',helper?undefined:'Review availability',helper?'The requester must review it before you can confirm.':'Keep this helper selected or choose another. Keeping them selected still needs their confirmation.',helper?'waiting':'action');
  if(status==='AWAITING_CONFIRMATION' && input.scheduleChanged) return result(helper?'Task schedule changed':`Waiting for ${name} to confirm the new time`,helper?'The requester changed the task time.':'The earlier confirmation no longer covers this schedule.',helper?'Your turn':`Waiting for ${name}`,helper?'Review new schedule':undefined,helper?'Check your availability, then explicitly confirm the new schedule or decline.':'Help is arranged only after your helper confirms the new time.',helper?'action':'waiting');
  switch(status){
    case 'DRAFT': return result('Request not published','Only your saved draft is ready so far.','Your turn','Edit draft','Review the details, then publish so helpers can respond.','action');
    case 'OPEN': return result(helper?'Open for your offer':'Waiting for helpers',helper?'Review the request and decide whether you can help.':'Your request is published and eligible helpers can respond.',helper?'Your turn':'Waiting for helpers',helper?'Offer to help':undefined,helper?'An offer does not commit you until you are selected and confirm.':'You can review offers when someone responds.',helper?'action':'waiting');
    case 'HAS_OFFERS': return result(helper?'Open for your offer':input.offerCount===undefined?'Helpers have responded':`${countLabel(input.offerCount,'helper')} responded`,helper?'You can still offer to help with this request.':'Compare experience, availability and responses before choosing.',helper?'Your turn':'Your turn',helper?'Offer to help':'Review offers','Choosing someone invites them to confirm; it does not arrange the task yet.','action');
    case 'AWAITING_CONFIRMATION': return result(helper?"You've been selected":`Waiting for ${name}`,helper?'Review the task and confirm only if you can help.':`You selected ${name}. They still need to confirm.`,helper?'Your turn':`Waiting for ${name}`,helper?'Confirm task':undefined,helper?'Confirmation makes this your scheduled commitment. You may also decline.':'The task is arranged once your helper confirms. Backup offers stay available until then.',helper?'action':'waiting');
    case 'ARRANGED': return result(helper?"You're scheduled to help":'Help arranged',helper?'You confirmed this task.':`${name === 'your helper'?'Your helper':name} confirmed this task.`,helper?'Your turn':'No action needed',helper?'Start task':undefined,helper?'Start when you begin helping, then request completion when finished.':'Your helper will start the task when the help begins.',helper?'action':'complete');
    case 'IN_PROGRESS': return result('Help is in progress',helper?'You have started this task.':`${name === 'your helper'?'Your helper':name} has started the task.`,helper?'Your turn':'No action needed',helper?'Request completion':undefined,helper?'When the help is finished, request approval from the requester.':'The requester reviews completion after the helper marks the work finished.',helper?'action':'waiting');
    case 'COMPLETION_PENDING': return result(helper?'Waiting for completion approval':'Review completion',helper?'You marked the help finished.':`${name === 'your helper'?'Your helper':name} marked the help finished.`,helper?'Waiting for requester':'Your turn',helper?undefined:'Confirm completion',helper?'The requester will approve completion or report an issue.':'Confirm the help is complete, or report an issue if something needs checking.',helper?'waiting':'action');
    case 'COMPLETED': return result('Completed',helper?'The requester approved your help.':'The help has been completed and approved.','Task complete',undefined,'You can view the activity and any reviews available to you.','complete');
    case 'DISPUTED': return result('Completion needs attention','An issue was reported about completion.','No action available',undefined,'The task is not approved as completed. Resolution is not available here.','neutral');
    default: return result(status==='CANCELLED'?'Task cancelled':['CANCELLED_BY_HELPER','CANCELLED_BY_REQUESTER','DECLINED'].includes(status)?'This arrangement has ended':'Check the current task','No current commitment is shown here.','No action needed',undefined,'Open the current task to see whether help is still needed.','neutral');
  }
}
export function offerPresentation(status:string){
  const labels:Record<string,{title:string;summary:string}>={
    ACTIVE:{title:'Offer sent',summary:'Waiting for the requester to choose. You can update your availability or withdraw.'},
    SELECTED:{title:"You've been selected",summary:'Open the arrangement to see whether you need to confirm or review a change.'},
    WITHDRAWN:{title:'Offer withdrawn',summary:'You are no longer offering to help with this task.'},
    NOT_SELECTED:{title:'Another helper was confirmed',summary:'Your offer was not selected for the confirmed arrangement.'},
    EXPIRED:{title:'Offer expired',summary:'This offer is no longer available for selection.'},
  };return labels[status] ?? {title:'Offer updated',summary:'Refresh to check its current status.'};
}
const eventCopy:Record<string,string>={TASK_PUBLISHED:'Request published',OFFER_CREATED:'A helper offered to help',OFFER_WITHDRAWN:'An offer was withdrawn',HELPER_SELECTED:'Helper selected — confirmation needed',ASSIGNMENT_CONFIRMED:'Helper confirmed the task',TASK_STARTED:'Help started',COMPLETION_REQUESTED:'Helper requested completion approval',TASK_COMPLETED:'Completion approved',TASK_CANCELLED:'Task cancelled',OFFER_AVAILABILITY_UPDATED:'Helper updated availability',AVAILABILITY_RECONFIRMED:'Requester kept the helper selected',TASK_RESCHEDULED:'Task time changed',SCHEDULE_RECONFIRMED:'Helper confirmed the new time',REVIEW_CREATED:'Review submitted',POINTS_TRANSFERRED:'Task reward transferred'};
export function timelineLabel(type:string,label:string){return eventCopy[type] ?? (/^[A-Z][A-Z_]+$/.test(label)?'Task activity updated':label);}
export function notificationTitle(type:string,title:string){return ({TASK_RESCHEDULED:'Task time changed',SCHEDULE_RECONFIRMED:'Helper confirmed the new time',OFFER_AVAILABILITY_UPDATED:'Helper availability changed',AVAILABILITY_RECONFIRMATION_REQUIRED:'Helper availability needs review'} as Record<string,string>)[type] ?? title;}
