import type { Store } from '../repositories/store';
import { ApiFailure } from '../shared/errors';
import type { CareContextMember } from '../domain/models';
import type { Task } from '../domain/task';
export type Action = 'CREATE_CARE_CONTEXT' | 'VIEW_CARE_CONTEXT' | 'VIEW_TASK' | 'CREATE_TASK' | 'EDIT_TASK' | 'PUBLISH_TASK' | 'CANCEL_TASK' | 'VIEW_LOCATION' | 'CREATE_LOCATION';
export type PermissionReader = Pick<Store, 'user' | 'member'>;
export function canViewTask(member: CareContextMember, userId: string, task: Pick<Task, 'careContextId' | 'createdBy' | 'status'>) {
  return member.status === 'ACTIVE' && member.userId === userId && member.careContextId === task.careContextId &&
    (task.status !== 'DRAFT' || task.createdBy === userId || member.role === 'CARE_MANAGER');
}
export async function authorize(store: PermissionReader, userId: string, action: Action, resource?: string, createdBy?: string, taskStatus?: Task['status']) {
  const user = await store.user(userId);
  if (!user) throw new ApiFailure(409,'USER_NOT_INITIALIZED','Initialize your app user first.');
  if (action === 'CREATE_CARE_CONTEXT') {
    if (!user.roles.includes('CARE_MANAGER')) throw new ApiFailure(403,'FORBIDDEN','A care manager role is required.');
  } else {
    const member = await store.member(resource!,userId);
    if (!member || member.status !== 'ACTIVE') throw new ApiFailure(403,'FORBIDDEN','Access denied.');
    if (action === 'VIEW_TASK' && taskStatus && !canViewTask(member, userId, { careContextId: resource!, createdBy: createdBy!, status: taskStatus })) {
      throw new ApiFailure(403, 'FORBIDDEN', 'Only the task creator or a context manager can view this draft.');
    }
    if (['EDIT_TASK', 'PUBLISH_TASK', 'CANCEL_TASK'].includes(action) && createdBy !== userId && member.role !== 'CARE_MANAGER') {
      throw new ApiFailure(403, 'FORBIDDEN', 'Only the task creator or a context manager can change this task.');
    }
    return member;
  }
}
