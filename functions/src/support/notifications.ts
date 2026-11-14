import type { Timestamp } from 'firebase-admin/firestore';
import type { Task, TaskEventType } from '../domain/task';
import type { Assignment } from '../domain/marketplace';
import type { Notification } from '../domain/support';
// Pure record creation, no delivery adapter/FCM call. IDs are event + recipient.
export function lifecycleNotifications(eventId: string, event: TaskEventType, actorId: string, task: Task, now: Timestamp, assignment?: Assignment, changedOfferId?:string): Notification[] {
  if(event==='OFFER_AVAILABILITY_UPDATED' && (!assignment || assignment.status!=='PENDING_CONFIRMATION' || assignment.offerId!==changedOfferId))return [];
  const type = event === 'OFFER_CREATED' ? 'OFFER_RECEIVED' : event;
  const titles: Record<string, string> = {
    OFFER_AVAILABILITY_UPDATED:'Selected Helper updated availability', OFFER_RECEIVED: 'New Offer received', HELPER_SELECTED: 'You were selected', ASSIGNMENT_CONFIRMED: 'Helper confirmed',
    ASSIGNMENT_DECLINED: 'Helper declined', ASSIGNMENT_CANCELLED: 'Arrangement cancelled', TASK_STARTED: 'Task started',
    COMPLETION_REQUESTED: 'Completion needs review', TASK_COMPLETED: 'Completion approved', COMPLETION_DISPUTED: 'Completion disputed',
  };
  if (!titles[type]) return [];
  const helperRecipient = ['HELPER_SELECTED', 'TASK_COMPLETED', 'COMPLETION_DISPUTED'].includes(type) || (type === 'ASSIGNMENT_CANCELLED' && actorId !== assignment?.helperId);
  const recipientId = helperRecipient ? assignment?.helperId : task.createdBy;
  if (!recipientId || recipientId === actorId) return [];
  return [{ id: eventId + '_' + recipientId, recipientId, type: type as Notification['type'], resourceType: assignment ? 'ASSIGNMENT' : 'TASK', resourceId: assignment?.id ?? task.id,
    title: titles[type], body: 'Open the related item for its current status.', createdAt: now }];
}
