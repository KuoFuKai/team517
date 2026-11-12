import { getFirestore, Timestamp, AggregateField } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import type { CreateReviewRequest } from '@team517/contracts';
import type { Task, TaskEvent } from '../domain/task';
import type { Assignment } from '../domain/marketplace';
import type { User, CareContextMember } from '../domain/models';
import type { Review, Notification } from '../domain/support';
import { MarketplaceRepository } from './marketplace';
import { membershipId } from './store';
import { ApiFailure } from '../shared/errors';
import { authorizeNotification, authorizeReview } from '../permissions/support';
export class SupportRepository {
  private get db() { return getFirestore(); }
  reader() { return new MarketplaceRepository().reader(); }
  async notification(uid: string, id: string) {
    const n = (await this.db.collection('notifications').doc(id).get()).data() as Notification | undefined;
    if (!n) throw new ApiFailure(404, 'NOT_FOUND', 'Notification not found.');
    authorizeNotification(uid, n.recipientId); return n;
  }
  async notifications(uid: string) {
    const snap = await this.db.collection('notifications').where('recipientId', '==', uid).orderBy('createdAt', 'desc').limit(51).get();
    return { items: snap.docs.slice(0, 50).map(d => d.data() as Notification), truncated: snap.size > 50 };
  }
  async readNotification(uid: string, id: string) {
    const ref = this.db.collection('notifications').doc(id);
    return this.db.runTransaction(async tx => {
      const value = (await tx.get(ref)).data() as Notification | undefined;
      if (!value) throw new ApiFailure(404, 'NOT_FOUND', 'Notification not found.');
      authorizeNotification(uid, value.recipientId);
      if (value.readAt) return value;
      const updated = { ...value, readAt: Timestamp.now() }; tx.set(ref, updated); return updated;
    });
  }
  async readAll(uid: string) {
    return this.db.runTransaction(async tx => {
      // Bounded batch; only unread records existing in this snapshot are marked.
      const docs = await tx.get(this.db.collection('notifications').where('recipientId', '==', uid).orderBy('createdAt', 'desc').limit(201));
      const now = Timestamp.now(); let marked = 0;
      for (const doc of docs.docs.slice(0, 200)) if (!doc.data().readAt) { tx.update(doc.ref, { readAt: now }); marked++; }
      return { marked, limit: 200, truncated: docs.size > 200 };
    });
  }
  async submitReview(uid: string, id: string, body: CreateReviewRequest) {
    const reviewId = createHash('sha256').update(JSON.stringify([id, uid])).digest('hex');
    return this.db.runTransaction(async tx => {
      const assignment = (await tx.get(this.db.collection('assignments').doc(id))).data() as Assignment | undefined;
      if (!assignment) throw new ApiFailure(404, 'NOT_FOUND', 'Assignment not found.');
      const task = (await tx.get(this.db.collection('tasks').doc(assignment.taskId))).data() as Task | undefined;
      if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
      const reader = { user: async (userId: string) => (await tx.get(this.db.collection('users').doc(userId))).data() as User | undefined,
        member: async (contextId: string, userId: string) => (await tx.get(this.db.collection('care_context_members').doc(membershipId(contextId, userId)))).data() as CareContextMember | undefined };
      await authorizeReview(reader, uid, task, assignment);
      if (assignment.status !== 'COMPLETED' || task.status !== 'COMPLETED' || task.activeAssignmentId !== assignment.id) throw new ApiFailure(409, 'REVIEW_NOT_ELIGIBLE', 'Only a completed Assignment can be reviewed.');
      const ref = this.db.collection('reviews').doc(reviewId);
      if ((await tx.get(ref)).exists) throw new ApiFailure(409, 'REVIEW_ALREADY_EXISTS', 'You already reviewed this Assignment.');
      const review: Review = { id: reviewId, assignmentId: id, taskId: task.id, careContextId: task.careContextId, reviewerId: uid, revieweeId: assignment.helperId, rating: body.rating,
        ...(body.comment ? { comment: body.comment } : {}), createdAt: Timestamp.now() };
      tx.create(ref, review); return review;
    });
  }
  async rating(helperId: string) {
    const data = (await this.db.collection('reviews').where('revieweeId', '==', helperId).aggregate({ count: AggregateField.count(), average: AggregateField.average('rating') }).get()).data();
    return { reviewCount: data.count, ...(data.count ? { averageRating: data.average! } : {}) };
  }
  async reviews(helperId: string) {
    const docs = await this.db.collection('reviews').where('revieweeId', '==', helperId).orderBy('createdAt', 'desc').limit(21).get();
    return { items: docs.docs.slice(0, 20).map(d => d.data() as Review), truncated: docs.size > 20 };
  }
  async timeline(taskId: string) {
    const docs = await this.db.collection('task_events').where('taskId', '==', taskId).orderBy('createdAt', 'desc').limit(101).get();
    return { items: docs.docs.slice(0, 100).map(d => d.data() as TaskEvent), truncated: docs.size > 100 };
  }
  async helperRelationships(uid: string) {
    const docs = await this.db.collection('assignments').where('helperId', '==', uid).orderBy('updatedAt', 'desc').limit(101).get();
    return { items: docs.docs.slice(0, 100).map(d => d.data() as Assignment), truncated: docs.size > 100 };
  }
  async memberships(uid: string) {
    const docs = await this.db.collection('care_context_members').where('userId', '==', uid).limit(21).get();
    return { items: docs.docs.slice(0, 20).map(d => d.data() as CareContextMember), truncated: docs.size > 20 };
  }
  async scheduled(contextId: string, start: string, end: string) {
    const docs = await this.db.collection('tasks').where('careContextId', '==', contextId).where('startAt', '>=', Timestamp.fromDate(new Date(start))).where('startAt', '<', Timestamp.fromDate(new Date(end))).orderBy('startAt').limit(51).get();
    return { items: docs.docs.slice(0, 50).map(d => d.data() as Task), truncated: docs.size > 50 };
  }
}
