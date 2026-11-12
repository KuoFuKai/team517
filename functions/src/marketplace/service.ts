import { SupportRepository } from '../repositories/support';
import { Timestamp } from 'firebase-admin/firestore';
import type { OfferHelpRequest, MyOfferDto, OfferListDto, SelectOfferResponse } from '@team517/contracts';
import { MarketplaceRepository, offerId } from '../repositories/marketplace';
import { authorizeMarketplace, isOfferable } from '../permissions/marketplace';
import { ApiFailure } from '../shared/errors';
import type { Offer, Assignment } from '../domain/marketplace';
import { assignmentDto, offerDto, taskOfferStateDto } from './dto';

export class MarketplaceService {
  constructor(private repo = new MarketplaceRepository()) {}
  private async task(id: string) {
    const task = await this.repo.task(id);
    if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
    return task;
  }
  async offerHelp(uid: string, taskId: string, body: OfferHelpRequest) {
    const result = await this.repo.change(taskId, uid, async (task, reads) => {
      await authorizeMarketplace(reads.permissions, uid, 'OFFER_HELP', { task });
      if (!isOfferable(task)) throw new ApiFailure(409, 'TASK_NOT_OFFERABLE', 'This task is not accepting offers.');
      const id = offerId(taskId, uid);
      const existing = await reads.offer(id);
      if (existing?.status === 'ACTIVE') throw new ApiFailure(409, 'OFFER_ALREADY_ACTIVE', 'You already have an active offer.');
      if (existing && !['WITHDRAWN', 'NOT_SELECTED'].includes(existing.status)) throw new ApiFailure(409, 'OFFER_NOT_ACTIVE', 'This offer cannot be reactivated.');
      if (task.offerCount >= 100) throw new ApiFailure(409, 'CONFLICT', 'This task has reached its offer limit.');
      const now = Timestamp.now();
      const offer: Offer = { ...(existing ?? {}), id, taskId, careContextId: task.careContextId, helperId: uid, status: 'ACTIVE',
        createdAt: existing?.createdAt ?? now, updatedAt: now, ...(body.message !== undefined ? { message: body.message } : {}) };
      return { task: { ...task, status: 'HAS_OFFERS', offerCount: task.offerCount + 1 }, offer, event: 'OFFER_CREATED' };
    });
    return offerDto(result.offer);
  }
  async withdraw(uid: string, taskId: string) {
    const result = await this.repo.change(taskId, uid, async (task, reads) => {
      const offer = await reads.offer(offerId(taskId, uid));
      if (!offer) throw new ApiFailure(404, 'OFFER_NOT_FOUND', 'No offer was found for your account.');
      await authorizeMarketplace(reads.permissions, uid, 'WITHDRAW_OFFER', { task, offer });
      if (offer.status !== 'ACTIVE') throw new ApiFailure(409, 'OFFER_NOT_ACTIVE', 'Only an ACTIVE offer can be withdrawn. Selected offers require the Assignment lifecycle.');
      if (!Number.isInteger(task.offerCount) || task.offerCount < 1) throw new ApiFailure(409, 'CONFLICT', 'Offer count is inconsistent; contact the task manager.');
      const count = task.offerCount - 1;
      return { task: { ...task, offerCount: count, status: task.status === 'HAS_OFFERS' && count === 0 ? 'OPEN' : task.status },
        offer: { ...offer, status: 'WITHDRAWN', updatedAt: Timestamp.now() }, event: 'OFFER_WITHDRAWN' };
    });
    return offerDto(result.offer);
  }
  async mine(uid: string, taskId: string): Promise<MyOfferDto> {
    const task = await this.task(taskId);
    const offer = await this.repo.offer(offerId(taskId, uid));
    await authorizeMarketplace(this.repo.reader(), uid, offer ? 'VIEW_OWN_OFFER' : 'OFFER_HELP', { task, offer });
    if (!offer && !isOfferable(task)) throw new ApiFailure(409, 'TASK_NOT_OFFERABLE', 'This task is not accepting offers.');
    return { offer: offer ? { ...offerDto(offer), ...(offer.status === 'SELECTED' && task.activeAssignmentId ? { assignmentId: task.activeAssignmentId } : {}) } : null, taskStatus: task.status };
  }
  async listOffers(uid: string, taskId: string): Promise<OfferListDto> {
    const task = await this.task(taskId);
    await authorizeMarketplace(this.repo.reader(), uid, 'VIEW_OFFERS', { task });
    const offers = await this.repo.offers(taskId);
    return { task: taskOfferStateDto(task), offers: await Promise.all(offers.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()).map(async offer => ({
      ...offerDto(offer), ...await new SupportRepository().rating(offer.helperId), verificationStatus: (await this.repo.reader().user(offer.helperId))?.verificationStatus ?? 'UNVERIFIED',
    }))) };
  }
  async select(uid: string, taskId: string, selectedOfferId: string): Promise<SelectOfferResponse> {
    const result = await this.repo.change(taskId, uid, async (task, reads, assignmentId) => {
      await authorizeMarketplace(reads.permissions, uid, 'SELECT_HELPER', { task });
      if (task.activeAssignmentId) throw new ApiFailure(409, 'ACTIVE_ASSIGNMENT_EXISTS', 'An Assignment is already pending.');
      if (task.status !== 'HAS_OFFERS') throw new ApiFailure(409, 'TASK_NOT_SELECTABLE', 'Task must have active offers before selection.');
      const offer = await reads.offer(selectedOfferId);
      if (!offer || offer.taskId !== taskId || offer.careContextId !== task.careContextId) throw new ApiFailure(404, 'OFFER_NOT_FOUND', 'Offer not found for this task.');
      if (offer.status !== 'ACTIVE') throw new ApiFailure(409, 'OFFER_NOT_ACTIVE', 'Select an active offer.');
      await authorizeMarketplace(reads.permissions, offer.helperId, 'OFFER_HELP', { task });
      const now = Timestamp.now();
      const assignment: Assignment = { id: assignmentId, taskId, careContextId: task.careContextId, offerId: offer.id, helperId: offer.helperId, selectedBy: uid,
        status: 'PENDING_CONFIRMATION', selectedAt: now, createdAt: now, updatedAt: now };
      return { task: { ...task, status: 'AWAITING_CONFIRMATION', activeAssignmentId: assignmentId },
        offer: { ...offer, status: 'SELECTED', updatedAt: now }, assignment, event: 'HELPER_SELECTED' };
    });
    return { task: taskOfferStateDto(result.task), assignment: assignmentDto(result.assignment!) };
  }
  async getAssignment(uid: string, id: string) {
    const assignment = await this.repo.assignment(id);
    if (!assignment) throw new ApiFailure(404, 'NOT_FOUND', 'Assignment not found.');
    const task = await this.task(assignment.taskId);
    await authorizeMarketplace(this.repo.reader(), uid, 'VIEW_ASSIGNMENT', { task, assignment });
    return assignmentDto(assignment);
  }
}
