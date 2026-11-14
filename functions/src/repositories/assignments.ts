import { prepareTaskPoints } from './points';
import { lifecycleNotifications } from '../support/notifications';
import { getFirestore, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type { Task, Location, TaskEventType, TaskEvent } from '../domain/task';
import type { Assignment, Offer } from '../domain/marketplace';
import type { User, CareContextMember } from '../domain/models';
import type { PermissionReader } from '../permissions/authorize';
import { membershipId } from './store';
import { ApiFailure } from '../shared/errors';

export interface LifecycleSnapshot {
  task: Task; assignment?: Assignment; offer?: Offer; backups: Offer[]; permissions: PermissionReader; targetOffer?: Offer;
}
export interface LifecycleChange { task: Task; assignment?: Assignment; offers: Offer[]; events: TaskEventType[]; metadata?: TaskEvent['metadata']; unchanged?: boolean }
// Every lifecycle writer locks the Task, including discovery Offer/selection writers.
// Queries and permission reads finish before writes; transaction retries revalidate all states.
export class AssignmentRepository {
  private get db() { return getFirestore(); }
  private reader(tx: Transaction): PermissionReader {
    return {
      user: async uid => (await tx.get(this.db.collection('users').doc(uid))).data() as User | undefined,
      member: async (id, uid) => (await tx.get(this.db.collection('care_context_members').doc(membershipId(id, uid)))).data() as CareContextMember | undefined,
    };
  }
  async change(uid: string, target: { assignmentId: string } | { taskId: string; offerId?: string }, mutate: (snapshot: LifecycleSnapshot) => Promise<LifecycleChange>) {
    const eventRefs = [this.db.collection('task_events').doc(), this.db.collection('task_events').doc()];
    return this.db.runTransaction(async tx => {
      let assignment: Assignment | undefined;
      if ('assignmentId' in target) {
        assignment = (await tx.get(this.db.collection('assignments').doc(target.assignmentId))).data() as Assignment | undefined;
        if (!assignment) throw new ApiFailure(404, 'NOT_FOUND', 'Assignment not found.');
      }
      const taskId = 'taskId' in target ? target.taskId : assignment!.taskId;
      const taskRef = this.db.collection('tasks').doc(taskId);
      const task = (await tx.get(taskRef)).data() as Task | undefined;
      if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
      if ('taskId' in target && task.activeAssignmentId) {
        assignment = (await tx.get(this.db.collection('assignments').doc(task.activeAssignmentId))).data() as Assignment | undefined;
        if (!assignment) throw new ApiFailure(409, 'CONFLICT', 'Active Assignment is missing.');
      }
      const offer = assignment ? (await tx.get(this.db.collection('offers').doc(assignment.offerId))).data() as Offer | undefined : undefined;
      const active = await tx.get(this.db.collection('offers').where('taskId', '==', taskId).where('status', '==', 'ACTIVE').limit(401));
      if (active.size > 400) throw new ApiFailure(409, 'CONFLICT', 'Too many Offers for an atomic transition.');
      const targetOffer='offerId' in target && target.offerId ? (await tx.get(this.db.collection('offers').doc(target.offerId))).data() as Offer|undefined : undefined;
      const result = await mutate({ task, assignment, offer, targetOffer, backups: active.docs.map(doc => doc.data() as Offer), permissions: this.reader(tx) });
      if(result.unchanged)return result;
      const writePoints = await prepareTaskPoints(tx, task, result.task, result.assignment);
      const now = Timestamp.now();
      writePoints();
      tx.set(taskRef, { ...result.task, updatedAt: now });
      if (result.assignment) tx.set(this.db.collection('assignments').doc(result.assignment.id), result.assignment);
      for (const changed of result.offers) tx.set(this.db.collection('offers').doc(changed.id), changed);
      result.events.forEach((type, index) => tx.create(eventRefs[index], { id: eventRefs[index].id, taskId, careContextId: task.careContextId,
        actorId: uid, type, createdAt: now, ...(result.metadata ? {metadata:result.metadata} : result.assignment ? { metadata: { assignmentId: result.assignment.id, offerId: result.assignment.offerId } } : {}) }));
      result.events.forEach((type, index) => {
        for (const notification of lifecycleNotifications(eventRefs[index].id, type, uid, task, now, result.assignment, result.metadata?.offerId)) tx.create(this.db.collection('notifications').doc(notification.id), notification);
      });
      return result;
    });
  }
  async view<T>(id: string, project: (task: Task, assignment: Assignment, location: Location | undefined, reader: PermissionReader) => Promise<T>): Promise<T> {
    // Permission and exact-location projection share a consistent transactional snapshot.
    return this.db.runTransaction(async tx => {
      const assignment = (await tx.get(this.db.collection('assignments').doc(id))).data() as Assignment | undefined;
      if (!assignment) throw new ApiFailure(404, 'NOT_FOUND', 'Assignment not found.');
      const task = (await tx.get(this.db.collection('tasks').doc(assignment.taskId))).data() as Task | undefined;
      if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
      const location = task.locationId ? (await tx.get(this.db.collection('locations').doc(task.locationId))).data() as Location | undefined : undefined;
      return project(task, assignment, location, this.reader(tx));
    });
  }
  async currentAssignments(taskIds: string[]) {
    const ids = [...new Set(taskIds)];
    if (!ids.length) return new Map<string, string>();
    const tasks = await this.db.getAll(...ids.map(id => this.db.collection('tasks').doc(id)));
    return new Map(tasks.filter(doc => doc.exists && doc.data()?.activeAssignmentId).map(doc => [doc.id, doc.data()!.activeAssignmentId as string]));
  }
  async mine<T>(collection: 'offers' | 'assignments', uid: string): Promise<{ items: T[]; truncated: boolean }> {
    const docs = await this.db.collection(collection).where('helperId', '==', uid).orderBy('updatedAt', 'desc').limit(51).get();
    return { items: docs.docs.slice(0, 50).map(doc => doc.data() as T), truncated: docs.size > 50 };
  }
}
