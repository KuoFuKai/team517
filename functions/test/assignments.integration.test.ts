import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createApp } from '../src/api/app';
import { Store, membershipId } from '../src/repositories/store';
import { offerId } from '../src/repositories/marketplace';

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Use npm run test:integration from root.');
initializeApp({ projectId: 'demo-team517' });
const db = getFirestore(), app = createApp(new Store());
type Account = { localId: string; idToken: string };
let owner: Account, alex: Account, marcus: Account, lisa: Account, unverified: Account, circle: Account, manager: Account;
let contextId: string, locationId: string;
const call = (actor: Account, method: 'get' | 'post' | 'patch', path: string, body?: object) => {
  const pending = request(app)[method]('/api/v1' + path).set('Authorization', 'Bearer ' + actor.idToken);
  return body === undefined ? pending : pending.send(body);
};
async function account(verified = true, helper = true): Promise<Account> {
  const response = await fetch('http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: crypto.randomUUID() + '@example.test', password: 'testing123', returnSecureToken: true }),
  });
  assert.equal(response.status, 200);
  const actor = await response.json() as Account;
  await call(actor, 'post', '/users/initialize', { primaryOnboardingRole: 'CARE_MANAGER' });
  await db.collection('users').doc(actor.localId).update({ roles: helper ? ['CARE_MANAGER', 'HELPER'] : ['CARE_MANAGER'], verificationStatus: verified ? 'VERIFIED' : 'UNVERIFIED' });
  return actor;
}
before(async () => {
  [owner, alex, marcus, lisa, unverified, circle, manager] = await Promise.all([account(), account(), account(), account(), account(false), account(false), account(true, false)]);
  contextId = (await call(owner, 'post', '/care-contexts', { name: "Mom's care" })).body.id;
  locationId = (await call(owner, 'post', `/care-contexts/${contextId}/locations`, { label: 'PRIVATE HOME LABEL', formattedAddress: '918 PRIVATE ADDRESS', latitude: 40.75283, longitude: -73.95743 })).body.id;
  for (const [actor, role] of [[circle, 'HELPER'], [manager, 'CARE_MANAGER']] as const) {
    const id = membershipId(contextId, actor.localId);
    await db.collection('care_context_members').doc(id).set({ id, userId: actor.localId, careContextId: contextId, role, status: 'ACTIVE' });
  }
});
async function published(visibility = 'VERIFIED_HELPERS', compensationType = 'VOLUNTEER') {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, {
    title: 'Public task title', helpType: 'ERRANDS', instructions: 'SECRET ACCESS INSTRUCTIONS 918 PRIVATE ADDRESS',
    locationId, startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', urgency: 'PLANNED', visibility, compensationType,
    ...(compensationType === 'PAID' ? { cashAmount: 25, currency: 'USD' } : {}),
  })).body;
  const response = await call(owner, 'post', `/tasks/${draft.id}/publish`, {}); assert.equal(response.status, 200);
  return response.body.id as string;
}
const offer = (actor: Account, taskId: string, message = 'I can help') => call(actor, 'post', `/tasks/${taskId}/offers`, { message });
const storedTask = async (id: string) => (await db.collection('tasks').doc(id).get()).data()!;


const action = (actor: Account, id: string, operation: string, body = {}) => call(actor, 'post', `/assignments/${id}/${operation}`, body);
async function selected(backups = 1) {
  const taskId = await published(); const chosen = await offer(alex, taskId);
  if (backups) await offer(marcus, taskId);
  const response = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: chosen.body.id }); assert.equal(response.status, 200);
  return { taskId, id: response.body.assignment.id as string, offerId: chosen.body.id as string };
}
const read = async (collection: string, id: string) => (await db.collection(collection).doc(id).get()).data()!;
const events = async (taskId: string) => (await db.collection('task_events').where('taskId', '==', taskId).get()).docs.map(doc => doc.data());
async function advance(id: string) { for (const op of ['confirm', 'start', 'request-completion']) assert.equal((await action(alex, id, op)).status, 200); }

test('only selected Helper confirms; confirmation closes backups/count atomically and unlocks only projected location', async () => {
  const s = await selected();
  assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).body.error.code, 'LOCATION_NOT_VISIBLE');
  for (const actor of [owner, manager, marcus, circle]) assert.equal((await action(actor, s.id, 'confirm')).status, 403);
  const result = await action(alex, s.id, 'confirm'); assert.equal(result.status, 200); assert.equal(result.body.status, 'CONFIRMED'); assert.ok(result.body.confirmedAt);
  assert.equal((await storedTask(s.taskId)).status, 'ARRANGED'); assert.equal((await storedTask(s.taskId)).offerCount, 1);
  assert.equal((await read('offers', offerId(s.taskId, marcus.localId))).status, 'NOT_SELECTED'); assert.equal((await read('offers', s.offerId)).status, 'SELECTED');
  const exact = await call(alex, 'get', `/assignments/${s.id}/execution`); assert.equal(exact.status, 200); assert.equal(exact.body.location.formattedAddress, '918 PRIVATE ADDRESS'); assert.equal(exact.body.location.latitude, 40.75283);
  for (const secret of ['SECRET ACCESS', 'careContextId', 'createdBy', 'disputeReason']) assert.ok(!JSON.stringify(exact.body).includes(secret));
  assert.ok(!JSON.stringify((await call(alex, 'get', '/assignments/' + s.id)).body).includes('PRIVATE'));
  assert.equal((await call(alex, 'get', '/tasks/' + s.taskId)).status, 403);
  for (const actor of [marcus, owner]) assert.equal((await call(actor, 'get', `/assignments/${s.id}/execution`)).status, 403);
  assert.equal((await action(alex, s.id, 'confirm')).status, 409); assert.equal((await action(alex, s.id, 'decline')).status, 409);
  assert.equal((await events(s.taskId)).filter(e => e.type === 'ASSIGNMENT_CONFIRMED').length, 1);
});

test('decline preserves backup candidates, clears relationship/count and permits backup selection', async () => {
  const s = await selected(); assert.equal((await action(marcus, s.id, 'decline')).status, 403);
  const declined = await action(alex, s.id, 'decline'); assert.equal(declined.body.status, 'DECLINED');
  const task = await storedTask(s.taskId); assert.equal(task.status, 'HAS_OFFERS'); assert.equal(task.activeAssignmentId, undefined); assert.equal(task.offerCount, 1);
  assert.equal((await read('offers', s.offerId)).status, 'WITHDRAWN');
  assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
  assert.equal((await action(alex, s.id, 'decline')).status, 409);
  const next = await call(manager, 'post', `/tasks/${s.taskId}/select-offer`, { offerId: offerId(s.taskId, marcus.localId) }); assert.equal(next.status, 200); assert.notEqual(next.body.assignment.id, s.id);
  assert.equal((await action(alex, s.id, 'confirm')).status, 409);
  assert.equal((await events(s.taskId)).filter(e => e.type === 'ASSIGNMENT_DECLINED').length, 1);
});

test('decline without backups returns OPEN', async () => {
  const s = await selected(0); await action(alex, s.id, 'decline'); const task = await storedTask(s.taskId); assert.equal(task.status, 'OPEN'); assert.equal(task.offerCount, 0);
});

test('requester cancels pending arrangement, preserves backups, does not reactivate cancelled Offer', async () => {
  const s = await selected(); assert.equal((await action(alex, s.id, 'cancel')).status, 409); assert.equal((await action(marcus, s.id, 'cancel')).status, 403);
  const cancelled = await action(manager, s.id, 'cancel'); assert.equal(cancelled.body.status, 'CANCELLED_BY_REQUESTER');
  const task = await storedTask(s.taskId); assert.equal(task.status, 'HAS_OFFERS'); assert.equal(task.offerCount, 1); assert.equal(task.activeAssignmentId, undefined);
  assert.equal((await read('offers', s.offerId)).status, 'NOT_SELECTED'); assert.equal((await read('offers', offerId(s.taskId, marcus.localId))).status, 'ACTIVE');
  assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
  const alone = await selected(0); await action(owner, alone.id, 'cancel'); assert.equal((await storedTask(alone.taskId)).status, 'OPEN');
});

test('confirmed Helper and requester cancellation reopen Task without reactivating stale backups', async () => {
  for (const actor of [alex, owner]) {
    const s = await selected(); await action(alex, s.id, 'confirm'); const result = await action(actor, s.id, 'cancel'); assert.equal(result.status, 200);
    assert.equal(result.body.status, actor === alex ? 'CANCELLED_BY_HELPER' : 'CANCELLED_BY_REQUESTER');
    const task = await storedTask(s.taskId); assert.equal(task.status, 'OPEN'); assert.equal(task.offerCount, 0); assert.equal(task.activeAssignmentId, undefined);
    assert.equal((await read('offers', offerId(s.taskId, marcus.localId))).status, 'NOT_SELECTED');
    assert.equal((await read('offers', s.offerId)).status, actor === alex ? 'WITHDRAWN' : 'NOT_SELECTED');
    assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
    assert.equal((await offer(marcus, s.taskId)).status, 201, 'Closed backup may explicitly offer again');
    assert.equal((await storedTask(s.taskId)).offerCount, 1);
  }
});

test('Helper starts and requests completion; creator or manager approves, never Helper; completed history stays private', async () => {
  for (const reviewer of [owner, manager]) {
    const s = await selected(); assert.equal((await action(alex, s.id, 'start')).status, 409);
    await action(alex, s.id, 'confirm');
    for (const actor of [owner, manager, marcus]) assert.equal((await action(actor, s.id, 'start')).status, 403);
    assert.equal((await action(alex, s.id, 'request-completion')).status, 409);
    const started = await action(alex, s.id, 'start'); assert.equal(started.body.status, 'IN_PROGRESS'); assert.ok(started.body.startedAt); assert.equal((await storedTask(s.taskId)).status, 'IN_PROGRESS');
    assert.equal((await action(alex, s.id, 'start')).status, 409); assert.equal((await action(owner, s.id, 'request-completion')).status, 403);
    const pending = await action(alex, s.id, 'request-completion'); assert.equal(pending.body.status, 'COMPLETION_PENDING'); assert.ok(pending.body.completionRequestedAt);
    assert.equal((await storedTask(s.taskId)).status, 'COMPLETION_PENDING');
    assert.equal((await action(alex, s.id, 'request-completion')).status, 409);
    assert.equal((await action(alex, s.id, 'confirm-completion')).status, 403);
    // Even a Helper promoted to a context manager may not approve their own work.
    await db.collection('care_context_members').doc(membershipId(contextId, alex.localId)).set({ id: membershipId(contextId, alex.localId), userId: alex.localId, careContextId: contextId, role: 'CARE_MANAGER', status: 'ACTIVE' });
    assert.equal((await action(alex, s.id, 'confirm-completion')).status, 403);
    await db.collection('care_context_members').doc(membershipId(contextId, alex.localId)).delete();
    const complete = await action(reviewer, s.id, 'confirm-completion'); assert.equal(complete.body.status, 'COMPLETED'); assert.ok(complete.body.completedAt);
    const task = await storedTask(s.taskId); assert.equal(task.status, 'COMPLETED'); assert.equal(task.activeAssignmentId, s.id); assert.equal(task.offerCount, 1);
    assert.equal((await action(reviewer, s.id, 'confirm-completion')).status, 409); assert.equal((await action(alex, s.id, 'cancel')).status, 409);
    assert.equal((await call(owner, 'post', `/tasks/${s.taskId}/cancel`, {})).status, 409);
    assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
    const history = await events(s.taskId); for (const type of ['TASK_STARTED', 'COMPLETION_REQUESTED', 'TASK_COMPLETED']) assert.equal(history.filter(e => e.type === type).length, 1);
  }
});

test('requester disputes completion; reason bounded/private; no resolution or execution access', async () => {
  for (const reviewer of [owner, manager]) {
    const s = await selected(); await advance(s.id);
    assert.equal((await action(alex, s.id, 'dispute', { reason: 'x' })).status, 403);
    assert.equal((await action(reviewer, s.id, 'dispute', { reason: 'x'.repeat(501) })).status, 400);
    assert.equal((await action(reviewer, s.id, 'dispute', { reason: 'PRIVATE REVIEW REASON' })).body.status, 'DISPUTED');
    assert.equal((await storedTask(s.taskId)).status, 'DISPUTED'); assert.equal((await read('assignments', s.id)).disputeReason, 'PRIVATE REVIEW REASON');
    assert.ok(!JSON.stringify(await events(s.taskId)).includes('PRIVATE REVIEW REASON'));
    assert.ok(!JSON.stringify((await call(alex, 'get', '/assignments/' + s.id)).body).includes('PRIVATE REVIEW REASON'));
    assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
    assert.equal((await action(reviewer, s.id, 'confirm-completion')).status, 409);
  }
});

test('Task cancellation atomically closes pending/confirmed arrangement and all active Offers', async () => {
  for (const confirmed of [false, true]) {
    const s = await selected(); if (confirmed) await action(alex, s.id, 'confirm');
    assert.equal((await call(owner, 'post', `/tasks/${s.taskId}/cancel`, {})).status, 200);
    const task = await storedTask(s.taskId); assert.equal(task.status, 'CANCELLED'); assert.equal(task.offerCount, 0); assert.equal(task.activeAssignmentId, undefined);
    assert.equal((await read('assignments', s.id)).status, 'CANCELLED_BY_REQUESTER');
    assert.equal((await read('offers', s.offerId)).status, 'NOT_SELECTED'); assert.equal((await read('offers', offerId(s.taskId, marcus.localId))).status, 'NOT_SELECTED');
    assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
    const history = await events(s.taskId); assert.equal(history.filter(e => e.type === 'TASK_CANCELLED').length, 1); assert.equal(history.filter(e => e.type === 'ASSIGNMENT_CANCELLED').length, 1);
  }
  const s = await selected(); await action(alex, s.id, 'confirm'); await action(alex, s.id, 'start');
  assert.equal((await call(owner, 'post', `/tasks/${s.taskId}/cancel`, {})).status, 409);
});

test('My Offers and Assignments are caller-scoped, bounded and exclude private data', async () => {
  const s = await selected();
  const own = await call(alex, 'get', '/me/offers'); assert.equal(own.status, 200); assert.ok(own.body.offers.some((o: any) => o.id === s.offerId && o.assignmentId === s.id));
  for (const actor of [alex, marcus, owner]) {
    const offers = await call(actor, 'get', '/me/offers'); assert.ok(offers.body.offers.every((o: any) => o.helperId === actor.localId));
    const assignments = await call(actor, 'get', '/me/assignments'); assert.ok(assignments.body.assignments.every((a: any) => a.helperId === actor.localId)); assert.ok(assignments.body.assignments.length <= 50);
    assert.ok(!JSON.stringify(assignments.body).includes('PRIVATE'));
  }
});

test('confirm versus decline race yields one coherent transition and one conflict', async () => {
  const s = await selected(); const result = await Promise.all([action(alex, s.id, 'confirm'), action(alex, s.id, 'decline')]); assert.deepEqual(result.map(r => r.status).sort(), [200, 409]);
  const assignment = await read('assignments', s.id), task = await storedTask(s.taskId);
  assert.ok(['CONFIRMED', 'DECLINED'].includes(assignment.status));
  assert.equal(task.status, assignment.status === 'CONFIRMED' ? 'ARRANGED' : 'HAS_OFFERS');
  assert.equal((await events(s.taskId)).filter(e => ['ASSIGNMENT_CONFIRMED', 'ASSIGNMENT_DECLINED'].includes(e.type)).length, 1);
});

test('two confirms commit exactly one timestamp/event and close backup once', async () => {
  const s = await selected(); const result = await Promise.all([action(alex, s.id, 'confirm'), action(alex, s.id, 'confirm')]); assert.deepEqual(result.map(r => r.status).sort(), [200, 409]);
  assert.equal((await storedTask(s.taskId)).offerCount, 1); assert.equal((await events(s.taskId)).filter(e => e.type === 'ASSIGNMENT_CONFIRMED').length, 1);
});

test('start versus cancellation race preserves Task/Assignment compatibility', async () => {
  const s = await selected(); await action(alex, s.id, 'confirm');
  const result = await Promise.all([action(alex, s.id, 'start'), action(owner, s.id, 'cancel')]); assert.deepEqual(result.map(r => r.status).sort(), [200, 409]);
  const assignment = await read('assignments', s.id), task = await storedTask(s.taskId);
  assert.equal(task.status, assignment.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'OPEN');
  assert.equal((await events(s.taskId)).filter(e => ['TASK_STARTED', 'ASSIGNMENT_CANCELLED'].includes(e.type)).length, 1);
});

test('two completion approvals commit exactly one completion event', async () => {
  const s = await selected(); await advance(s.id);
  const result = await Promise.all([action(owner, s.id, 'confirm-completion'), action(manager, s.id, 'confirm-completion')]); assert.deepEqual(result.map(r => r.status).sort(), [200, 409]);
  assert.equal((await storedTask(s.taskId)).status, 'COMPLETED'); assert.equal((await read('assignments', s.id)).status, 'COMPLETED');
  assert.equal((await events(s.taskId)).filter(e => e.type === 'TASK_COMPLETED').length, 1);
});
