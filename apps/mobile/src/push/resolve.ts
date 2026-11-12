import type { NotificationDto, AssignmentDto, TaskDetailDto } from '@team517/contracts';
type PushReader = {
  getNotification(id: string): Promise<NotificationDto>;
  getConversation(id: string): Promise<unknown>;
  getAssignment(id: string): Promise<AssignmentDto>;
  getTask(id: string): Promise<TaskDetailDto>;
};
export type PushDestination = { kind: 'CONVERSATION'; id: string } | { kind: 'ASSIGNMENT'; assignment: AssignmentDto } | { kind: 'TASK'; task: TaskDetailDto };
export async function resolvePushNotification(id: string, api: PushReader): Promise<PushDestination> {
  const n = await api.getNotification(id); // Authenticated, recipient-owned source of truth.
  if (n.resourceType === 'CONVERSATION') { await api.getConversation(n.resourceId); return { kind: 'CONVERSATION', id: n.resourceId }; }
  if (n.resourceType === 'ASSIGNMENT') return { kind: 'ASSIGNMENT', assignment: await api.getAssignment(n.resourceId) };
  return { kind: 'TASK', task: await api.getTask(n.resourceId) };
}
