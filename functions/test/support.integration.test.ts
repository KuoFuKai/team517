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


async function instructed() {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { title: 'Walk together', helpType: 'COMPANIONSHIP', publicInstructions: 'PUBLIC clinic accompaniment', privateInstructions: 'PRIVATE buzz 12B', locationId, startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', urgency: 'PLANNED', visibility: 'VERIFIED_HELPERS', compensationType: 'VOLUNTEER' })).body;
  const published = await call(owner, 'post', `/tasks/${draft.id}/publish`, {}); assert.equal(published.status, 200); return draft.id as string;
}
async function choose(taskId: string) {
  const offer = await call(alex, 'post', `/tasks/${taskId}/offers`, { message: 'PRIVATE offer text' }); assert.equal(offer.status, 201);
  const select = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: offer.body.id }); assert.equal(select.status, 200); return select.body.assignment.id as string;
}
const notifications = async (actor: Account) => { const result = await call(actor, 'get', '/me/notifications'); assert.equal(result.status, 200); return result.body.notifications as any[]; };

test('explicit public instructions publish without legacy notes; private operational text is projected only for current confirmed work', async () => {
  const taskId = await instructed();
  const detail = await call(alex, 'get', `/tasks/${taskId}/discovery`); assert.equal(detail.body.publicInstructions, 'PUBLIC clinic accompaniment');
  const listing = await call(alex, 'get', '/tasks/discover'); assert.ok(listing.body.tasks.some((t: any) => t.id === taskId && t.publicInstructions === 'PUBLIC clinic accompaniment'));
  for (const response of [detail, listing]) { assert.ok(!JSON.stringify(response.body).includes('PRIVATE buzz')); assert.ok(!JSON.stringify(response.body).includes('918 PRIVATE')); }
  assert.equal((await call(circle, 'get', '/tasks/' + taskId)).body.privateInstructions, undefined);
  assert.equal((await call(owner, 'get', '/tasks/' + taskId)).body.privateInstructions, 'PRIVATE buzz 12B');
  const id = await choose(taskId);
  const pending = await call(alex, 'get', `/assignments/${id}/task`); assert.equal(pending.body.publicInstructions, 'PUBLIC clinic accompaniment'); assert.equal(pending.body.privateInstructions, undefined);
  assert.equal((await call(alex, 'get', `/assignments/${id}/execution`)).status, 403);
  await action(alex, id, 'confirm'); const operational = await call(alex, 'get', `/assignments/${id}/execution`); assert.equal(operational.body.privateInstructions, 'PRIVATE buzz 12B'); assert.equal(operational.body.publicInstructions, 'PUBLIC clinic accompaniment');
  await action(alex, id, 'cancel'); assert.equal((await call(alex, 'get', `/assignments/${id}/execution`)).status, 403);
  assert.ok(!JSON.stringify((await call(alex, 'get', `/assignments/${id}/task`)).body).includes('PRIVATE buzz'));
  const other = await instructed(), declined = await choose(other); await action(alex, declined, 'decline'); assert.equal((await call(alex, 'get', `/assignments/${declined}/execution`)).status, 403);
});

test('legacy instructions remain private and are never automatically mapped into public/operational fields', async () => {
  const taskId = await published(); const publicTask = await call(alex, 'get', `/tasks/${taskId}/discovery`); assert.equal(publicTask.body.publicInstructions, undefined);
  const id = await choose(taskId); await action(alex, id, 'confirm'); const execution = await call(alex, 'get', `/assignments/${id}/execution`);
  assert.equal(execution.body.privateInstructions, undefined); assert.ok(!JSON.stringify(execution.body).includes('SECRET ACCESS'));
});

test('agenda enforces relevant relationships, bounded dates and privacy independent of lastActiveRole', async () => {
  const s = await selected(); const query = '/me/calendar?start=2026-12-01T00:00:00Z&end=2026-12-02T00:00:00Z';
  const owned = await call(owner, 'get', query); assert.equal(owned.status, 200); assert.ok(owned.body.tasks.some((t: any) => t.taskId === s.taskId && t.roleInTask === 'REQUESTER' && t.helperId === alex.localId));
  assert.ok((await call(manager, 'get', query)).body.tasks.some((t: any) => t.taskId === s.taskId));
  const helper = await call(alex, 'get', query); assert.ok(helper.body.tasks.some((t: any) => t.taskId === s.taskId && t.assignmentId === s.id));
  for (const actor of [marcus, circle, lisa]) assert.ok(!(await call(actor, 'get', query)).body.tasks.some((t: any) => t.taskId === s.taskId));
  assert.ok(!JSON.stringify(helper.body).includes('PRIVATE')); assert.equal(helper.body.tasks[0].careContextId, undefined);
  assert.ok(!(await call(alex, 'get', '/me/calendar?start=2027-01-01T00:00:00Z&end=2027-01-02T00:00:00Z')).body.tasks.some((t: any) => t.taskId === s.taskId));
  assert.equal((await call(alex, 'get', '/me/calendar?start=2026-01-01T00:00:00Z&end=2027-01-01T00:00:00Z')).status, 400);
  assert.equal((await call(alex, 'get', '/me/calendar?start=2026-12-02T00:00:00Z&end=2026-12-01T00:00:00Z')).status, 400);
  await call(owner, 'patch', '/me/preferences', { lastActiveRole: 'HELPER' }); assert.ok((await call(owner, 'get', query)).body.tasks.some((t: any) => t.taskId === s.taskId));
  await action(alex, s.id, 'decline'); assert.ok(!(await call(alex, 'get', query)).body.tasks.some((t: any) => t.taskId === s.taskId));
});

test('lifecycle notifications commit with events and route to counterpart without self notifications or private text', async () => {
  const taskId = await published(); const a = await offer(alex, taskId);
  const received = (await notifications(owner)).filter(n => n.resourceId === taskId); assert.equal(received.length, 1); assert.equal(received[0].type, 'OFFER_RECEIVED');
  assert.ok(!(await notifications(alex)).some(n => n.resourceId === taskId));
  const selected = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: a.body.id }); const id = selected.body.assignment.id;
  assert.equal((await notifications(alex)).filter(n => n.resourceId === id && n.type === 'HELPER_SELECTED').length, 1);
  const confirms = await Promise.all([action(alex, id, 'confirm'), action(alex, id, 'confirm')]); assert.deepEqual(confirms.map(r => r.status).sort(), [200, 409]);
  assert.equal((await notifications(owner)).filter(n => n.resourceId === id && n.type === 'ASSIGNMENT_CONFIRMED').length, 1);
  await action(alex, id, 'start'); await action(alex, id, 'request-completion');
  const requester = (await notifications(owner)).filter(n => n.resourceId === id); assert.ok(requester.some(n => n.type === 'TASK_STARTED')); assert.ok(requester.some(n => n.type === 'COMPLETION_REQUESTED'));
  const completions = await Promise.all([action(owner, id, 'confirm-completion'), action(manager, id, 'confirm-completion')]); assert.deepEqual(completions.map(r => r.status).sort(), [200, 409]);
  assert.equal((await notifications(alex)).filter(n => n.resourceId === id && n.type === 'TASK_COMPLETED').length, 1);
  assert.ok(!JSON.stringify(await notifications(owner)).includes('PRIVATE')); assert.equal(requester[0].recipientId, undefined);
});

test('notification ownership enforced; read/read-all are safe and preserve first read timestamp', async () => {
  const s = await selected(); const n = (await notifications(alex)).find(n => n.resourceId === s.id)!; assert.ok(n);
  assert.equal((await call(marcus, 'post', `/notifications/${n.id}/read`, {})).status, 403);
  const read = await call(alex, 'post', `/notifications/${n.id}/read`, {}); assert.equal(read.status, 200); assert.ok(read.body.readAt);
  assert.equal((await call(alex, 'post', `/notifications/${n.id}/read`, {})).body.readAt, read.body.readAt);
  assert.ok(!(await notifications(marcus)).some(other => other.id === n.id));
  const readAll = await call(alex, 'post', '/me/notifications/read-all', {}); assert.equal(readAll.status, 200); assert.ok((await notifications(alex)).every(n => n.readAt));
});

test('review eligibility, validation and immutable duplicate-safe creation; helper summaries have no fabricated ratings', async () => {
  const s = await selected();
  const submit = (actor: Account, body: object) => call(actor, 'post', `/assignments/${s.id}/reviews`, body);
  assert.equal((await submit(owner, { rating: 5 })).body.error.code, 'REVIEW_NOT_ELIGIBLE');
  await advance(s.id); await action(owner, s.id, 'confirm-completion');
  for (const rating of [0, 6, 2.5]) assert.equal((await submit(owner, { rating })).status, 400);
  assert.equal((await submit(owner, { rating: 5, comment: 'x'.repeat(1001) })).status, 400);
  for (const actor of [alex, marcus, circle]) assert.equal((await submit(actor, { rating: 5 })).status, 403);
  const [one, two] = await Promise.all([submit(owner, { rating: 5, comment: 'Kind and reliable' }), submit(owner, { rating: 1 })]);
  assert.deepEqual([one.status, two.status].sort(), [201, 409]);
  const first = [one, two].find(r => r.status === 201)!; assert.equal(first.body.reviewerLabel, 'Requester');
  const managerReview = await submit(manager, { rating: 3 }); assert.equal(managerReview.status, 201);
  const summary = await call(lisa, 'get', `/helpers/${alex.localId}/rating`); assert.equal(summary.status, 200); assert.equal(summary.body.reviewCount, 2); assert.equal(summary.body.averageRating, (first.body.rating + 3) / 2);
  const reviews = await call(lisa, 'get', `/helpers/${alex.localId}/reviews`); assert.equal(reviews.status, 200); assert.equal(reviews.body.reviews.length, 2);
  for (const field of ['reviewerId', 'careContextId', 'assignmentId', 'taskId']) assert.equal(reviews.body.reviews[0][field], undefined);
  assert.equal((await db.collection('reviews').where('assignmentId', '==', s.id).get()).size, 2);
  assert.equal((await request(app).patch(`/api/v1/assignments/${s.id}/reviews`).set('Authorization', 'Bearer ' + owner.idToken).send({ rating: 1 })).status, 404);
  const zero = await call(owner, 'get', `/helpers/${lisa.localId}/rating`); assert.deepEqual(zero.body, { reviewCount: 0 });
  assert.equal((await call(alex, 'get', `/assignments/${s.id}/execution`)).status, 403);
});

test('timeline uses compact projection and never reveals competing Helper identities/messages', async () => {
  const taskId = await instructed(); const first = await offer(alex, taskId, 'MY OFFER'); await offer(marcus, taskId, 'COMPETITOR MESSAGE');
  assert.equal((await call(lisa, 'get', `/tasks/${taskId}/timeline`)).status, 403);
  const selected = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: first.body.id });
  await action(alex, selected.body.assignment.id, 'confirm');
  const ownerTimeline = await call(owner, 'get', `/tasks/${taskId}/timeline`); assert.equal(ownerTimeline.status, 200); assert.ok(ownerTimeline.body.events.some((e: any) => e.type === 'TASK_PUBLISHED'));
  const helper = await call(alex, 'get', `/tasks/${taskId}/timeline`); assert.equal(helper.status, 200); assert.equal(helper.body.events.filter((e: any) => e.type === 'OFFER_CREATED').length, 1);
  for (const response of [ownerTimeline, helper]) for (const secret of ['PRIVATE buzz', '918 PRIVATE', 'COMPETITOR MESSAGE', 'metadata', marcus.localId, contextId, locationId]) assert.ok(!JSON.stringify(response.body).includes(secret));
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, {})).body.id;
  assert.equal((await call(circle, 'get', `/tasks/${draft}/timeline`)).status, 403); assert.equal((await call(manager, 'get', `/tasks/${draft}/timeline`)).status, 200);
});

test('verification API is authoritative for all skeleton states; no self-verification write exists', async () => {
  for (const status of ['UNVERIFIED', 'PENDING', 'VERIFIED', 'FAILED']) {
    await db.collection('users').doc(unverified.localId).update({ verificationStatus: status });
    const result = await call(unverified, 'get', '/me/verification'); assert.equal(result.status, 200); assert.equal(result.body.status, status); assert.equal(result.body.canDiscover, status === 'VERIFIED');
    if (status !== 'VERIFIED') assert.equal((await call(unverified, 'get', '/tasks/discover')).status, 403);
  }
  assert.equal((await call(unverified, 'post', '/me/verification', { status: 'VERIFIED' })).status, 404);
});
