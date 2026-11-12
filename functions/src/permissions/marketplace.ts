import type { PermissionReader } from './authorize';
import type { Task } from '../domain/task';
import type { Offer, Assignment } from '../domain/marketplace';
import { ApiFailure } from '../shared/errors';

export type MarketplaceAction = 'DISCOVER_TASK' | 'OFFER_HELP' | 'WITHDRAW_OFFER' | 'VIEW_OWN_OFFER' | 'VIEW_OFFERS' | 'SELECT_HELPER' | 'VIEW_ASSIGNMENT';
export const isOfferable = (task: Task) => Boolean(task.publishedAt) && ['OPEN', 'HAS_OFFERS'].includes(task.status);
export async function authorizeMarketplace(reader: PermissionReader, uid: string, action: MarketplaceAction,
  resource: { task?: Task; offer?: Offer; assignment?: Assignment } = {}) {
  const user = await reader.user(uid);
  if (!user) throw new ApiFailure(409, 'USER_NOT_INITIALIZED', 'Initialize your app user first.');
  const denied = () => { throw new ApiFailure(403, 'FORBIDDEN', 'You cannot perform this operation.'); };
  if (action === 'DISCOVER_TASK') {
    if (!user.roles.includes('HELPER')) denied();
    if (user.verificationStatus !== 'VERIFIED') throw new ApiFailure(403, 'HELPER_NOT_VERIFIED', 'External discovery requires a verified Helper. Trusted-circle tasks remain available through your care contexts.');
    return;
  }
  const { task, offer, assignment } = resource;
  if (!task) denied();
  if (action === 'WITHDRAW_OFFER' || action === 'VIEW_OWN_OFFER') {
    if (!offer || offer.helperId !== uid || offer.taskId !== task!.id) denied();
    return;
  }
  if (action === 'VIEW_ASSIGNMENT' && assignment?.helperId === uid && assignment.taskId === task!.id) return;
  const member = await reader.member(task!.careContextId, uid);
  const active = member?.status === 'ACTIVE';
  if (action === 'OFFER_HELP') {
    if (!user.roles.includes('HELPER') || task!.createdBy === uid) denied();
    if (active) return; // Existing trusted-circle policy; no external verification required.
    if (task!.visibility !== 'VERIFIED_HELPERS') denied();
    if (user.verificationStatus !== 'VERIFIED') throw new ApiFailure(403, 'HELPER_NOT_VERIFIED', 'A verified Helper is required outside the care circle.');
    return;
  }
  if (!active || (task!.createdBy !== uid && member?.role !== 'CARE_MANAGER')) denied();
}
