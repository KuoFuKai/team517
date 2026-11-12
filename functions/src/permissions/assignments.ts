import type { Assignment } from '../domain/marketplace';
import type { Task } from '../domain/task';
import type { PermissionReader } from './authorize';
import { ApiFailure } from '../shared/errors';
export type AssignmentAction = 'CONFIRM_ASSIGNMENT' | 'DECLINE_ASSIGNMENT' | 'CANCEL_ASSIGNMENT' | 'START_TASK' | 'REQUEST_COMPLETION' | 'CONFIRM_COMPLETION' | 'DISPUTE_COMPLETION' | 'VIEW_ASSIGNMENT' | 'VIEW_EXECUTION_DETAILS' | 'CANCEL_TASK';
export async function authorizeAssignment(reader: PermissionReader, uid: string, action: AssignmentAction, task: Task, assignment?: Assignment) {
  if (!await reader.user(uid)) throw new ApiFailure(409, 'USER_NOT_INITIALIZED', 'Initialize your app user first.');
  const helper = assignment?.helperId === uid;
  const deny = () => { throw new ApiFailure(403, 'FORBIDDEN', 'You cannot perform this operation.'); };
  if (['CONFIRM_ASSIGNMENT', 'DECLINE_ASSIGNMENT', 'START_TASK', 'REQUEST_COMPLETION', 'VIEW_EXECUTION_DETAILS'].includes(action)) {
    if (!helper || task.createdBy === uid) deny();
    return 'HELPER' as const;
  }
  if (helper && ['VIEW_ASSIGNMENT', 'CANCEL_ASSIGNMENT'].includes(action)) return 'HELPER' as const;
  // A Helper cannot approve or dispute their own work even with a manager membership.
  if (helper && ['CONFIRM_COMPLETION', 'DISPUTE_COMPLETION'].includes(action)) deny();
  const member = await reader.member(task.careContextId, uid);
  if (member?.status !== 'ACTIVE' || (task.createdBy !== uid && member.role !== 'CARE_MANAGER')) deny();
  return 'REQUESTER' as const;
}
