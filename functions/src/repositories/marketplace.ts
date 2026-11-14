import { lifecycleNotifications } from '../support/notifications';
import { getFirestore, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type { Task, Location, TaskEvent, TaskEventType } from '../domain/task';
import type { Offer, Assignment } from '../domain/marketplace';
import type { User, CareContextMember } from '../domain/models';
import type { PermissionReader } from '../permissions/authorize';
import { membershipId } from './store';
import { ApiFailure } from '../shared/errors';

export const offerId = (taskId: string, helperId: string) => taskId + '_' + helperId;
interface MarketReads {
  permissions: PermissionReader;
  offer: (id: string) => Promise<Offer | undefined>;
}
interface MarketChange {
  task: Task; offer: Offer; assignment?: Assignment; event: TaskEventType;
}
export class MarketplaceRepository {
  private get db() { return getFirestore(); }
  private permissions(tx?: Transaction): PermissionReader {
    const read = async (collection: string, id: string) => {
      const ref = this.db.collection(collection).doc(id);
      return (tx ? await tx.get(ref) : await ref.get()).data();
    };
    return { user: async uid => await read('users', uid) as User | undefined,
      member: async (id, uid) => await read('care_context_members', membershipId(id, uid)) as CareContextMember | undefined };
  }
  reader() { return this.permissions(); }
  async task(id: string) { return (await this.db.collection('tasks').doc(id).get()).data() as Task | undefined; }
  async offer(id: string) { return (await this.db.collection('offers').doc(id).get()).data() as Offer | undefined; }
  async assignment(id: string) { return (await this.db.collection('assignments').doc(id).get()).data() as Assignment | undefined; }
  async offers(id: string) { const snapshot=await this.db.collection('offers').where('taskId', '==', id).limit(101).get(); if(snapshot.size>100)throw new ApiFailure(409,'OFFER_LIST_LIMIT','This task has too many historical offers for one comparison.');return snapshot.docs.map(doc=>doc.data() as Offer); }
  async candidates(limit: number) {
    return (await this.db.collection('tasks').where('visibility', '==', 'VERIFIED_HELPERS').where('status', 'in', ['OPEN', 'HAS_OFFERS']).limit(limit).get()).docs.map(doc => doc.data() as Task);
  }
  async locations(ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return new Map<string, Location>();
    const docs = await this.db.getAll(...unique.map(id => this.db.collection('locations').doc(id)));
    return new Map(docs.filter(doc => doc.exists).map(doc => [doc.id, doc.data() as Location]));
  }
  async change(taskId: string, actorId: string, mutate: (task: Task, reads: MarketReads, assignmentId: string) => Promise<MarketChange>) {
    const ref = this.db.collection('tasks').doc(taskId);
    const eventRef = this.db.collection('task_events').doc();
    const assignmentRef = this.db.collection('assignments').doc();
    return this.db.runTransaction(async tx => {
      const task = (await tx.get(ref)).data() as Task | undefined;
      if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
      const result = await mutate(task, { permissions: this.permissions(tx),
        offer: async id => (await tx.get(this.db.collection('offers').doc(id))).data() as Offer | undefined }, assignmentRef.id);
      const now = Timestamp.now();
      const updated = { ...result.task, updatedAt: now };
      tx.set(ref, updated);
      tx.set(this.db.collection('offers').doc(result.offer.id), result.offer);
      if (result.assignment) tx.create(assignmentRef, result.assignment);
      const event: TaskEvent = { id: eventRef.id, taskId, careContextId: task.careContextId, actorId, type: result.event, createdAt: now,
        metadata: { offerId: result.offer.id, helperId: result.offer.helperId, ...(result.assignment ? { assignmentId: result.assignment.id } : {}) } };
      tx.create(eventRef, event);
      for (const notification of lifecycleNotifications(eventRef.id, result.event, actorId, task, now, result.assignment)) tx.create(this.db.collection('notifications').doc(notification.id), notification);
      return { ...result, task: updated };
    });
  }
}
