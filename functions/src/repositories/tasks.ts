import { getFirestore, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type { CreateLocationRequest } from '@team517/contracts';
import type { Location, Task, TaskEvent, TaskEventType } from '../domain/task';
import type { User, CareContextMember } from '../domain/models';
import type { PermissionReader } from '../permissions/authorize';
import { membershipId } from './store';
import { ApiFailure } from '../shared/errors';

interface TaskChange { task: Task; event: TaskEventType; changedFields?: string[] }
interface TransactionReads {
  permissions: PermissionReader;
  location: (id: string) => Promise<Location | undefined>;
}

export class TaskRepository {
  private get db() { return getFirestore(); }
  private reads(tx: Transaction): TransactionReads {
    return {
      permissions: {
        user: async uid => (await tx.get(this.db.collection('users').doc(uid))).data() as User | undefined,
        member: async (id, uid) => (await tx.get(this.db.collection('care_context_members').doc(membershipId(id, uid)))).data() as CareContextMember | undefined,
      },
      location: async id => (await tx.get(this.db.collection('locations').doc(id))).data() as Location | undefined,
    };
  }
  private event(task: Task, actorId: string, type: TaskEventType, id: string, changedFields?: string[]): TaskEvent {
    return { id, taskId: task.id, careContextId: task.careContextId, actorId, type, createdAt: task.updatedAt,
      ...(changedFields ? { metadata: { changedFields } } : {}) };
  }
  async createLocation(uid: string, contextId: string, data: CreateLocationRequest, check: (reader: PermissionReader) => Promise<void>) {
    const ref = this.db.collection('locations').doc();
    return this.db.runTransaction(async tx => {
      await check(this.reads(tx).permissions);
      const now = Timestamp.now();
      const location: Location = { ...data, id: ref.id, careContextId: contextId, createdBy: uid, createdAt: now, updatedAt: now };
      tx.create(ref, location);
      return location;
    });
  }
  async listLocations(contextId: string) {
    return (await this.db.collection('locations').where('careContextId', '==', contextId).get()).docs.map(doc => doc.data() as Location);
  }
  async createDraft(taskFields: Partial<Task>, uid: string, contextId: string, check: (reads: TransactionReads) => Promise<void>) {
    const ref = this.db.collection('tasks').doc();
    const eventRef = this.db.collection('task_events').doc();
    return this.db.runTransaction(async tx => {
      await check(this.reads(tx));
      const now = Timestamp.now();
      const task: Task = { ...taskFields, id: ref.id, careContextId: contextId, createdBy: uid, status: 'DRAFT', offerCount: 0, createdAt: now, updatedAt: now };
      tx.create(ref, task);
      tx.create(eventRef, this.event(task, uid, 'TASK_CREATED', eventRef.id));
      return task;
    });
  }
  async task(id: string) { return (await this.db.collection('tasks').doc(id).get()).data() as Task | undefined; }
  async listTasks(contextId: string) {
    return (await this.db.collection('tasks').where('careContextId', '==', contextId).get()).docs.map(doc => doc.data() as Task);
  }
  async changeTask(id: string, uid: string, change: (task: Task, reads: TransactionReads) => Promise<TaskChange | null>) {
    const ref = this.db.collection('tasks').doc(id);
    const eventRef = this.db.collection('task_events').doc();
    return this.db.runTransaction(async tx => {
      const task = (await tx.get(ref)).data() as Task | undefined;
      if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
      const result = await change(task, this.reads(tx));
      if (!result) return task;
      const updated = { ...result.task, updatedAt: Timestamp.now() };
      tx.set(ref, updated);
      tx.create(eventRef, this.event(updated, uid, result.event, eventRef.id, result.changedFields));
      return updated;
    });
  }
}
