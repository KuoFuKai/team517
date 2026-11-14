import { TrustRepository } from '../repositories/trust';
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
      const availabilityChanged=Boolean(existing && body.availableFrom && body.availableUntil && (existing.availableFrom?.toMillis()!==Date.parse(body.availableFrom) || existing.availableUntil?.toMillis()!==Date.parse(body.availableUntil)));
      const offer: Offer = { availabilityRevision:0, ...(existing ?? {}), id, taskId, careContextId: task.careContextId, helperId: uid, status: 'ACTIVE', ...(availabilityChanged?{availabilityRevision:(existing?.availabilityRevision ?? 0)+1,availabilityChangedAt:now}:{}),
        createdAt: existing?.createdAt ?? now, updatedAt: now, ...(body.message !== undefined ? { message: body.message } : {}), ...(body.availableFrom && body.availableUntil ? {availableFrom:Timestamp.fromDate(new Date(body.availableFrom)),availableUntil:Timestamp.fromDate(new Date(body.availableUntil))} : {}) };
      return { task: { ...task, status: 'HAS_OFFERS', offerCount: task.offerCount + 1 }, offer, event: 'OFFER_CREATED' };
    });
    return offerDto(result.offer,result.task);
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
    return offerDto(result.offer,result.task);
  }
  async mine(uid: string, taskId: string): Promise<MyOfferDto> {
    const task = await this.task(taskId);
    const offer = await this.repo.offer(offerId(taskId, uid));
    await authorizeMarketplace(this.repo.reader(), uid, offer ? 'VIEW_OWN_OFFER' : 'OFFER_HELP', { task, offer });
    if (!offer && !isOfferable(task)) throw new ApiFailure(409, 'TASK_NOT_OFFERABLE', 'This task is not accepting offers.');
    return { taskTime:{startAt:task.startAt?.toDate().toISOString(),endAt:task.endAt?.toDate().toISOString()}, offer: offer ? { ...offerDto(offer,task), ...(offer.status === 'SELECTED' && task.activeAssignmentId ? { assignmentId: task.activeAssignmentId } : {}) } : null, taskStatus: task.status };
  }
  async listOffers(uid: string, taskId: string): Promise<OfferListDto> {
    const task = await this.task(taskId);
    await authorizeMarketplace(this.repo.reader(), uid, 'VIEW_OFFERS', { task });
    const offers = await this.repo.offers(taskId);
    const summaries=await new TrustRepository().summaries(offers.map(offer=>offer.helperId),task.careContextId);
    return {task:taskOfferStateDto(task),offers:offers.sort((a,b)=>a.createdAt.toMillis()-b.createdAt.toMillis()).map(offer=>{
      const {trust,relationship}=summaries.get(offer.helperId)!;
      return {...offerDto(offer,task),verificationStatus:trust.verificationStatus,reviewCount:trust.reviewCount,...(trust.averageRating!==undefined?{averageRating:trust.averageRating}:{}),trust,relationship};
    })};
  }
  async select(uid: string, taskId: string, selectedOfferId: string, expectedRevision?:number): Promise<SelectOfferResponse> {
    const result = await this.repo.change(taskId, uid, async (task, reads, assignmentId) => {
      await authorizeMarketplace(reads.permissions, uid, 'SELECT_HELPER', { task });
      if (task.activeAssignmentId) throw new ApiFailure(409, 'ACTIVE_ASSIGNMENT_EXISTS', 'An Assignment is already pending.');
      if (task.status !== 'HAS_OFFERS') throw new ApiFailure(409, 'TASK_NOT_SELECTABLE', 'Task must have active offers before selection.');
      const offer = await reads.offer(selectedOfferId);
      if (!offer || offer.taskId !== taskId || offer.careContextId !== task.careContextId) throw new ApiFailure(404, 'OFFER_NOT_FOUND', 'Offer not found for this task.');
      if (offer.status !== 'ACTIVE') throw new ApiFailure(409, 'OFFER_NOT_ACTIVE', 'Select an active offer.');
      if((expectedRevision!==undefined && expectedRevision!==(offer.availabilityRevision ?? 0)) || (expectedRevision===undefined && offer.availabilityChangedAt))throw new ApiFailure(409,'AVAILABILITY_STALE','Availability changed. Refresh and review the latest offer before selecting.');
      await authorizeMarketplace(reads.permissions, offer.helperId, 'OFFER_HELP', { task });
      const now = Timestamp.now();
      const assignment: Assignment = { id: assignmentId, taskId, careContextId: task.careContextId, offerId: offer.id, helperId: offer.helperId, selectedBy: uid,
        selectedAvailabilityRevision:offer.availabilityRevision ?? 0, ...(offer.availableFrom && offer.availableUntil ? {selectedAvailableFrom:offer.availableFrom,selectedAvailableUntil:offer.availableUntil}:{}), requiresRequesterReconfirmation:false, status: 'PENDING_CONFIRMATION', selectedAt: now, createdAt: now, updatedAt: now };
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
    return assignmentDto(assignment,await this.repo.offer(assignment.offerId),task);
  }
}
