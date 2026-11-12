import { Timestamp } from 'firebase-admin/firestore';
import type { AssignmentExecutionDto } from '@team517/contracts';
import type { Assignment, Offer } from '../domain/marketplace';
import type { Task } from '../domain/task';
import { AssignmentRepository, type LifecycleSnapshot, type LifecycleChange } from '../repositories/assignments';
import { authorizeAssignment, type AssignmentAction } from '../permissions/assignments';
import { assignmentDto, offerDto } from '../marketplace/dto';
import { taskDetailDto } from '../task/dto';
import { ApiFailure } from '../shared/errors';
export type Transition = 'confirm' | 'decline' | 'cancel' | 'start' | 'request-completion' | 'confirm-completion' | 'dispute';
const actions: Record<Transition, AssignmentAction> = { confirm: 'CONFIRM_ASSIGNMENT', decline: 'DECLINE_ASSIGNMENT', cancel: 'CANCEL_ASSIGNMENT', start: 'START_TASK', 'request-completion': 'REQUEST_COMPLETION', 'confirm-completion': 'CONFIRM_COMPLETION', dispute: 'DISPUTE_COMPLETION' };
function requirePair(s: LifecycleSnapshot, assignmentStatus: Assignment['status'], taskStatus: Task['status'], code: string) {
  if (!s.assignment || s.assignment.status !== assignmentStatus || s.task.status !== taskStatus || s.task.activeAssignmentId !== s.assignment.id || s.assignment.careContextId !== s.task.careContextId || s.offer?.status !== 'SELECTED' || s.offer.taskId !== s.task.id || s.offer.helperId !== s.assignment.helperId)
    throw new ApiFailure(409, code, 'The current Task/Assignment state does not allow this transition.');
}
function clearRelationship(task: Task): Task { const { activeAssignmentId: _id, ...rest } = task; return rest; }
export class AssignmentService {
  constructor(private repo = new AssignmentRepository()) {}
  async transition(uid: string, id: string, operation: Transition, reason?: string) {
    const result = await this.repo.change(uid, { assignmentId: id }, async s => {
      const side = await authorizeAssignment(s.permissions, uid, actions[operation], s.task, s.assignment);
      const now = Timestamp.now();
      const assignment = { ...s.assignment!, updatedAt: now };
      const selected = { ...s.offer!, updatedAt: now };
      const closeBackups = (): Offer[] => s.backups.map(offer => ({ ...offer, status: 'NOT_SELECTED', updatedAt: now }));
      const result = (status: Assignment['status'], taskStatus: Task['status'], event: LifecycleChange['events'][number], offers: Offer[] = []): LifecycleChange => ({ task: { ...s.task, status: taskStatus }, assignment: { ...assignment, status }, offers, events: [event] });
      if (operation === 'confirm') {
        requirePair(s, 'PENDING_CONFIRMATION', 'AWAITING_CONFIRMATION', 'ASSIGNMENT_NOT_CONFIRMABLE');
        const changed = result('CONFIRMED', 'ARRANGED', 'ASSIGNMENT_CONFIRMED', closeBackups());
        changed.assignment!.confirmedAt = now; changed.task.offerCount = 1; return changed;
      }
      if (operation === 'decline' || operation === 'cancel') {
        const pending = s.assignment!.status === 'PENDING_CONFIRMATION';
        if (operation === 'decline') requirePair(s, 'PENDING_CONFIRMATION', 'AWAITING_CONFIRMATION', 'ASSIGNMENT_NOT_DECLINABLE');
        else {
          if (pending && side !== 'REQUESTER') throw new ApiFailure(409, 'ASSIGNMENT_NOT_CANCELLABLE', 'Use decline for your pending Assignment.');
          requirePair(s, pending ? 'PENDING_CONFIRMATION' : 'CONFIRMED', pending ? 'AWAITING_CONFIRMATION' : 'ARRANGED', 'ASSIGNMENT_NOT_CANCELLABLE');
        }
        const status = operation === 'decline' ? 'DECLINED' : side === 'HELPER' ? 'CANCELLED_BY_HELPER' : 'CANCELLED_BY_REQUESTER';
        const remaining = pending ? s.backups.length : 0;
        const changed = result(status, remaining ? 'HAS_OFFERS' : 'OPEN', operation === 'decline' ? 'ASSIGNMENT_DECLINED' : 'ASSIGNMENT_CANCELLED', [{ ...selected, status: side === 'HELPER' ? 'WITHDRAWN' : 'NOT_SELECTED' }]);
        changed.task = { ...clearRelationship(changed.task), offerCount: remaining }; return changed;
      }
      if (operation === 'start') {
        requirePair(s, 'CONFIRMED', 'ARRANGED', 'TASK_NOT_STARTABLE');
        const changed = result('IN_PROGRESS', 'IN_PROGRESS', 'TASK_STARTED'); changed.assignment!.startedAt = now; return changed;
      }
      if (operation === 'request-completion') {
        requirePair(s, 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETION_NOT_REQUESTABLE');
        const changed = result('COMPLETION_PENDING', 'COMPLETION_PENDING', 'COMPLETION_REQUESTED'); changed.assignment!.completionRequestedAt = now; return changed;
      }
      requirePair(s, 'COMPLETION_PENDING', 'COMPLETION_PENDING', 'COMPLETION_NOT_CONFIRMABLE');
      if (operation === 'confirm-completion') {
        const changed = result('COMPLETED', 'COMPLETED', 'TASK_COMPLETED'); changed.assignment!.completedAt = now; return changed;
      }
      const changed = result('DISPUTED', 'DISPUTED', 'COMPLETION_DISPUTED');
      if (reason) changed.assignment!.disputeReason = reason; // private, bounded, excluded from events/general DTOs
      return changed;
    });
    return assignmentDto(result.assignment!);
  }
  async cancelTask(uid: string, id: string) {
    const changed = await this.repo.change(uid, { taskId: id }, async s => {
      await authorizeAssignment(s.permissions, uid, 'CANCEL_TASK', s.task, s.assignment);
      if (!['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED'].includes(s.task.status)) throw new ApiFailure(409, 'INVALID_TASK_STATE', 'Normal cancellation is allowed only before execution starts.');
      const now = Timestamp.now();
      const result: LifecycleChange = { task: { ...clearRelationship(s.task), status: 'CANCELLED', offerCount: 0 }, offers: s.backups.map(offer => ({ ...offer, status: 'NOT_SELECTED', updatedAt: now })), events: ['TASK_CANCELLED'] };
      if (s.assignment) {
        requirePair(s, s.task.status === 'AWAITING_CONFIRMATION' ? 'PENDING_CONFIRMATION' : 'CONFIRMED', s.task.status === 'AWAITING_CONFIRMATION' ? 'AWAITING_CONFIRMATION' : 'ARRANGED', 'ASSIGNMENT_NOT_CANCELLABLE');
        result.assignment = { ...s.assignment, status: 'CANCELLED_BY_REQUESTER', updatedAt: now };
        result.offers.push({ ...s.offer!, status: 'NOT_SELECTED', updatedAt: now }); result.events.push('ASSIGNMENT_CANCELLED');
      }
      return result;
    });
    return taskDetailDto(changed.task);
  }
  async publicTask(uid: string, id: string) {
    return this.repo.view(id, async (task, assignment, _location, reader) => {
      await authorizeAssignment(reader, uid, 'VIEW_ASSIGNMENT', task, assignment);
      return { taskId: task.id, title: task.title, publicInstructions: task.publicInstructions };
    });
  }
  async execution(uid: string, id: string): Promise<AssignmentExecutionDto> {
    return this.repo.view(id, async (task, assignment, location, reader) => {
      await authorizeAssignment(reader, uid, 'VIEW_EXECUTION_DETAILS', task, assignment);
      if (task.activeAssignmentId !== id || !['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(assignment.status) || task.status !== ({ CONFIRMED: 'ARRANGED', IN_PROGRESS: 'IN_PROGRESS', COMPLETION_PENDING: 'COMPLETION_PENDING' } as Partial<Record<Assignment['status'], Task['status']>>)[assignment.status]) throw new ApiFailure(403, 'LOCATION_NOT_VISIBLE', 'Exact location is available only for your current confirmed work.');
      if (!location || location.careContextId !== task.careContextId) throw new ApiFailure(404, 'NOT_FOUND', 'Operational location not found.');
      return { assignmentId: id, taskId: task.id, title: task.title, helpType: task.helpType, startAt: task.startAt?.toDate().toISOString(), endAt: task.endAt?.toDate().toISOString(),
        publicInstructions: task.publicInstructions, privateInstructions: task.privateInstructions,
        location: { label: location.label, formattedAddress: location.formattedAddress, latitude: location.latitude, longitude: location.longitude } };
      // General Task.instructions can contain medical/private notes; deliberately not unlocked.
    });
  }
  async myAssignments(uid: string) {
    const list = await this.repo.mine<Assignment>('assignments', uid);
    return { assignments: list.items.map(assignmentDto), limit: 50, truncated: list.truncated };
  }
  async myOffers(uid: string) {
    const list = await this.repo.mine<Offer>('offers', uid);
    const assignments = await this.repo.currentAssignments(list.items.filter(o => o.status === 'SELECTED').map(o => o.taskId));
    return { offers: list.items.map(offer => ({ ...offerDto(offer), ...(offer.status === 'SELECTED' ? { assignmentId: assignments.get(offer.taskId) } : {}) })), limit: 50, truncated: list.truncated };
  }
}
