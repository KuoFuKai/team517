import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase-admin/firestore';
import { lifecycleNotifications } from '../src/support/notifications';
import { calendarQuerySchema, createReviewSchema } from '../src/api/support-routes';
import type { Task } from '../src/domain/task';
import type { Assignment } from '../src/domain/marketplace';
test('Notification identities link to one event/recipient, omit private data and suppress self notifications', () => {
  const task = { id: 'task', createdBy: 'requester', privateInstructions: 'secret' } as Task;
  const assignment = { id: 'assignment', helperId: 'helper' } as Assignment; const now = Timestamp.now();
  const one = lifecycleNotifications('event', 'ASSIGNMENT_CONFIRMED', 'helper', task, now, assignment);
  assert.deepEqual(one, lifecycleNotifications('event', 'ASSIGNMENT_CONFIRMED', 'helper', task, now, assignment));
  assert.equal(one[0].id, 'event_requester'); assert.ok(!JSON.stringify(one).includes('secret'));
  assert.deepEqual(lifecycleNotifications('event', 'OFFER_CREATED', 'requester', task, now), []);
  assert.deepEqual(lifecycleNotifications('event', 'TASK_UPDATED', 'requester', task, now), []);
});
test('support request schemas enforce finite agenda ranges and bounded integer review input', () => {
  assert.equal(calendarQuerySchema.safeParse({ start: '2026-01-01T00:00:00Z', end: '2027-01-01T00:00:00Z' }).success, false);
  for (const rating of [0, 6, 1.5]) assert.equal(createReviewSchema.safeParse({ rating }).success, false);
  assert.equal(createReviewSchema.safeParse({ rating: 5, comment: 'x'.repeat(1001) }).success, false);
  assert.equal(createReviewSchema.safeParse({ rating: 5, revieweeId: 'injected' }).success, false);
  assert.equal(createReviewSchema.safeParse({ rating: 5, comment: 'Helpful' }).success, true);
});
