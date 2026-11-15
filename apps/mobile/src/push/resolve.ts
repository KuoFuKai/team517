import type { NotificationDto, AssignmentDto, TaskDetailDto,MyOfferDto } from '@team517/contracts';
type PushReader = {
  getMyOffer?(id:string):Promise<MyOfferDto>;
  getNotification(id: string): Promise<NotificationDto>;
  getConversation(id: string): Promise<unknown>;
  getAssignment(id: string): Promise<AssignmentDto>;
  getTask(id: string): Promise<TaskDetailDto>;
};
export type PushDestination = {kind:'OFFER';id:string} | { kind: 'CONVERSATION'; id: string } | { kind: 'ASSIGNMENT'; assignment: AssignmentDto } | { kind: 'TASK'; task: TaskDetailDto };
export async function resolvePushNotification(id: string, api: PushReader): Promise<PushDestination> {
  const n = await api.getNotification(id); // Authenticated, recipient-owned source of truth.
  if (n.resourceType === 'CONVERSATION') { await api.getConversation(n.resourceId); return { kind: 'CONVERSATION', id: n.resourceId }; }
  if (n.resourceType === 'ASSIGNMENT') return { kind: 'ASSIGNMENT', assignment: await api.getAssignment(n.resourceId) };
  if(n.type==='TASK_RESCHEDULED' && api.getMyOffer){const mine=await api.getMyOffer(n.resourceId);if(!mine.offer)throw new Error('This task update is no longer available.');if(mine.offer.assignmentId)return {kind:'ASSIGNMENT',assignment:await api.getAssignment(mine.offer.assignmentId)};return {kind:'OFFER',id:n.resourceId};}
  return { kind: 'TASK', task: await api.getTask(n.resourceId) };
}
