import type { Task } from '../domain/task';
import type { Assignment } from '../domain/marketplace';
import type { PermissionReader } from './authorize';
import { canViewTask } from './authorize';
import { ApiFailure } from '../shared/errors';
export async function initialized(reader: PermissionReader, uid: string) {
  const user = await reader.user(uid);
  if (!user) throw new ApiFailure(409, 'USER_NOT_INITIALIZED', 'Initialize your app user first.');
  return user;
}
export async function managesTask(reader: PermissionReader, uid: string, task: Task) {
  const member = await reader.member(task.careContextId, uid);
  return member?.status === 'ACTIVE' && (task.createdBy === uid || member.role === 'CARE_MANAGER');
}
export async function authorizeReview(reader: PermissionReader, uid: string, task: Task, assignment: Assignment) {
  await initialized(reader, uid);
  if (assignment.helperId === uid || !await managesTask(reader, uid, task)) throw new ApiFailure(403, 'FORBIDDEN', 'Only the active requester side can review a Helper.');
}
export async function timelineScope(reader: PermissionReader, uid: string, task: Task, related: boolean) {
  await initialized(reader, uid);
  const member = await reader.member(task.careContextId, uid);
  if (member && canViewTask(member, uid, task)) return 'CIRCLE' as const;
  if (task.status !== 'DRAFT' && related) return 'RELATED_HELPER' as const;
  throw new ApiFailure(403, 'FORBIDDEN', 'Task history is not available to you.');
}
export function authorizeNotification(uid: string, recipientId: string) {
  if (uid !== recipientId) throw new ApiFailure(403, 'FORBIDDEN', 'This Notification belongs to another user.');
}
