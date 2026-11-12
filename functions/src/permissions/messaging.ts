import type { Conversation } from '../domain/messaging';
import type { MessagingReader } from '../repositories/messaging';
import { initialized, managesTask } from './support';
import { authorizeMarketplace } from './marketplace';
import { offerId } from '../repositories/marketplace';
import { ApiFailure } from '../shared/errors';
export async function authorizeConversation(r: MessagingReader, uid: string, conversation: Conversation) {
  await initialized(r.permissions, uid);
  if (conversation.participantIds.length !== 2 || new Set(conversation.participantIds).size !== 2 || !conversation.participantIds.includes(uid)) throw new ApiFailure(403, 'FORBIDDEN', 'Only conversation participants can read this history.');
}
export async function canSendConversation(r: MessagingReader, c: Conversation): Promise<boolean> {
  const [one, two] = c.participantIds;
  if (one === two || c.participantIds.length !== 2) return false;
  const users = await Promise.all([r.permissions.user(one), r.permissions.user(two)]); if (users.some(u => !u)) return false;
  if (c.scope === 'CARE_CONTEXT') {
    const members = await Promise.all([r.permissions.member(c.careContextId, one), r.permissions.member(c.careContextId, two)]);
    return members.every(m => m?.status === 'ACTIVE');
  }
  if (!c.taskId) return false;
  const task = await r.get('tasks', c.taskId);
  if (!task || task.careContextId !== c.careContextId || !task.publishedAt || ['DRAFT', 'CANCELLED', 'COMPLETED', 'DISPUTED'].includes(task.status)) return false;
  for (const [requester, helper] of [[one, two], [two, one]]) {
    if (helper === task.createdBy || !await managesTask(r.permissions, requester, task)) continue;
    const offer = await r.get('offers', offerId(task.id, helper));
    if (offer?.status === 'ACTIVE' && ['OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION'].includes(task.status)) {
      try { await authorizeMarketplace(r.permissions, helper, 'OFFER_HELP', { task }); return true; } catch (error) { if (!(error instanceof ApiFailure)) throw error; }
    }
    if (task.activeAssignmentId && offer?.status === 'SELECTED') {
      const a = await r.get('assignments', task.activeAssignmentId);
      const pairs: Record<string, string> = { PENDING_CONFIRMATION: 'AWAITING_CONFIRMATION', CONFIRMED: 'ARRANGED', IN_PROGRESS: 'IN_PROGRESS', COMPLETION_PENDING: 'COMPLETION_PENDING' };
      if (a && a.helperId === helper && a.taskId === task.id && a.careContextId === task.careContextId && a.offerId === offer.id && pairs[a.status] === task.status) return true;
    }
  }
  return false;
}
