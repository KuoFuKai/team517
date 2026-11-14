import { availabilityFit } from './availability';
import type { OfferDto, AssignmentDto, TaskOfferStateDto } from '@team517/contracts';
import type { Offer, Assignment } from '../domain/marketplace';
import type { Task } from '../domain/task';
export const offerDto = (offer: Offer, task?: Task): OfferDto => ({ id: offer.id, taskId: offer.taskId, helperId: offer.helperId,
  availableFrom: offer.availableFrom?.toDate().toISOString(), availableUntil: offer.availableUntil?.toDate().toISOString(), ...(task ? {availabilityFit:availabilityFit(offer.availableFrom?.toMillis(),offer.availableUntil?.toMillis(),task.startAt?.toMillis(),task.endAt?.toMillis())} : {}), message: offer.message, status: offer.status, createdAt: offer.createdAt.toDate().toISOString(), updatedAt: offer.updatedAt.toDate().toISOString() });
export const assignmentDto = (assignment: Assignment): AssignmentDto => ({ id: assignment.id, taskId: assignment.taskId, offerId: assignment.offerId,
  helperId: assignment.helperId, selectedBy: assignment.selectedBy, status: assignment.status, selectedAt: assignment.selectedAt.toDate().toISOString(),
  confirmedAt: assignment.confirmedAt?.toDate().toISOString(), startedAt: assignment.startedAt?.toDate().toISOString(),
  completionRequestedAt: assignment.completionRequestedAt?.toDate().toISOString(), completedAt: assignment.completedAt?.toDate().toISOString(),
  createdAt: assignment.createdAt.toDate().toISOString(), updatedAt: assignment.updatedAt.toDate().toISOString() });
export const taskOfferStateDto = (task: Task): TaskOfferStateDto => ({ id: task.id, status: task.status, offerCount: task.offerCount, activeAssignmentId: task.activeAssignmentId });
