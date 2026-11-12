import type { PermissionReader } from './authorize';
import type { CommunityScope } from '../domain/community';
import type { Task } from '../domain/task';
import { initialized, managesTask } from './support';
import { ApiFailure } from '../shared/errors';
export type CommunityAction = 'VIEW_COMMUNITY_POST' | 'CREATE_COMMUNITY_POST' | 'COMMENT_ON_POST' | 'LIKE_POST' | 'SHARE_POST' | 'SAVE_RESOURCE';
export async function authorizeCommunity(reader: PermissionReader, uid: string, _action: CommunityAction, scope: CommunityScope) {
  const user = await initialized(reader, uid);
  if (scope.visibility === 'PUBLIC_VERIFIED') {
    if (user.verificationStatus !== 'VERIFIED') throw new ApiFailure(403, 'COMMUNITY_VERIFICATION_REQUIRED', 'Verified status is required for public Community. Your trusted circle remains available.');
  } else {
    if (!scope.careContextId || (await reader.member(scope.careContextId, uid))?.status !== 'ACTIVE') throw new ApiFailure(403, 'FORBIDDEN', 'This care-circle content is not available to you.');
  }
}
export function requireContained(source: CommunityScope, destination: CommunityScope) {
  if (source.visibility === 'CARE_CIRCLE' && (destination.visibility !== 'CARE_CIRCLE' || destination.careContextId !== source.careContextId)) throw new ApiFailure(403, 'VISIBILITY_MISMATCH', 'Circle content cannot be shared outside its original circle.');
}
export async function authorizeNeed(reader: PermissionReader, uid: string, task: Task, scope: CommunityScope) {
  if (!await managesTask(reader, uid, task)) throw new ApiFailure(403, 'FORBIDDEN', 'Only an active Task owner or context manager can share this Task.');
  if (scope.visibility === 'CARE_CIRCLE' && scope.careContextId !== task.careContextId) throw new ApiFailure(403, 'VISIBILITY_MISMATCH', 'Use the Task care circle.');
  if (scope.visibility === 'PUBLIC_VERIFIED' && task.visibility !== 'VERIFIED_HELPERS') throw new ApiFailure(403, 'VISIBILITY_MISMATCH', 'This Task is limited to its care circle.');
}
