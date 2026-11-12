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

test('first and concurrent multiple Offers maintain count/status; duplicate retries cannot increment twice', async () => {
  const id = await published();
  const first = await offer(alex, id); assert.equal(first.status, 201); assert.equal(first.body.id, offerId(id, alex.localId));
  assert.equal((await storedTask(id)).status, 'HAS_OFFERS'); assert.equal((await storedTask(id)).offerCount, 1);
  const more = await Promise.all([offer(marcus, id), offer(lisa, id)]);
  assert.ok(more.every(response => response.status === 201)); assert.equal((await storedTask(id)).offerCount, 3);
  const duplicate = await offer(alex, id); assert.equal(duplicate.status, 409); assert.equal(duplicate.body.error.code, 'OFFER_ALREADY_ACTIVE');
  assert.equal((await storedTask(id)).offerCount, 3);
  const history = await db.collection('task_events').where('taskId', '==', id).get();
  assert.equal(history.docs.filter(doc => doc.data().type === 'OFFER_CREATED').length, 3);
  assert.ok(!JSON.stringify(history.docs.map(doc => doc.data())).includes('I can help'));
});
test('simultaneous duplicate Offer retries create exactly one active record and event', async () => {
  const id = await published();
  const responses = await Promise.all([offer(alex, id), offer(alex, id)]);
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  assert.equal((await storedTask(id)).offerCount, 1);
  assert.equal((await db.collection('offers').where('taskId', '==', id).get()).size, 1);
});
test('eligibility rejects creator, unverified external Helpers, and external CARE_CIRCLE access', async () => {
  const id = await published();
  assert.equal((await offer(owner, id)).status, 403);
  assert.equal((await offer(unverified, id)).body.error.code, 'HELPER_NOT_VERIFIED');
  assert.equal((await offer(manager, id)).status, 403, 'Global HELPER role is required even for circle members');
  const privateId = await published('CARE_CIRCLE');
  assert.equal((await offer(alex, privateId)).status, 403);
  assert.equal((await offer(circle, privateId)).status, 201, 'Unverified active circle Helper follows the trusted policy');
});
test('withdrawal/reactivation reuses ID and original creation time; concurrent withdrawals are safe', async () => {
  const id = await published();
  const original = await offer(alex, id); await offer(marcus, id);
  const results = await Promise.all([call(alex, 'post', `/tasks/${id}/offers/mine/withdraw`, {}), call(marcus, 'post', `/tasks/${id}/offers/mine/withdraw`, {})]);
  assert.ok(results.every(result => result.status === 200));
  assert.equal((await storedTask(id)).status, 'OPEN'); assert.equal((await storedTask(id)).offerCount, 0);
  assert.equal((await call(alex, 'post', `/tasks/${id}/offers/mine/withdraw`, {})).status, 409);
  const reactivated = await offer(alex, id, 'Available again');
  assert.equal(reactivated.status, 201); assert.equal(reactivated.body.id, original.body.id);
  assert.equal(reactivated.body.createdAt, original.body.createdAt); assert.equal((await storedTask(id)).offerCount, 1);
});
test('only Task creator or active context manager can inspect competing Offers', async () => {
  const id = await published(); await offer(alex, id);
  assert.equal((await call(owner, 'get', `/tasks/${id}/offers`)).status, 200);
  const managed = await call(manager, 'get', `/tasks/${id}/offers`);
  assert.equal(managed.status, 200); assert.equal(managed.body.offers[0].verificationStatus, 'VERIFIED');
  assert.equal(managed.body.offers[0].rating, undefined); assert.equal(managed.body.offers[0].email, undefined);
  for (const actor of [alex, marcus, circle]) assert.equal((await call(actor, 'get', `/tasks/${id}/offers`)).status, 403);
});
test('selection creates pending Assignment, selects one Offer, preserves backups and compact event', async () => {
  const id = await published('VERIFIED_HELPERS', 'PAID');
  const a = await offer(alex, id), b = await offer(marcus, id), c = await offer(lisa, id);
  const selected = await call(owner, 'post', `/tasks/${id}/select-offer`, { offerId: a.body.id });
  assert.equal(selected.status, 200); assert.equal(selected.body.task.status, 'AWAITING_CONFIRMATION');
  assert.equal(selected.body.assignment.status, 'PENDING_CONFIRMATION');
  assert.equal(selected.body.task.activeAssignmentId, selected.body.assignment.id); assert.equal(selected.body.task.offerCount, 3);
  assert.equal((await db.collection('offers').doc(a.body.id).get()).data()?.status, 'SELECTED');
  for (const backup of [b.body.id, c.body.id]) assert.equal((await db.collection('offers').doc(backup).get()).data()?.status, 'ACTIVE');
  const events = (await db.collection('task_events').where('taskId', '==', id).get()).docs.map(doc => doc.data());
  assert.equal(events.filter(event => event.type === 'HELPER_SELECTED').length, 1);
  assert.equal((await call(alex, 'post', `/tasks/${id}/offers/mine/withdraw`, {})).body.error.code, 'OFFER_NOT_ACTIVE');
  assert.equal((await offer(unverified, id)).status, 403);
  assert.equal((await offer(marcus, id)).body.error.code, 'TASK_NOT_OFFERABLE');
  assert.equal((await call(marcus, 'post', `/tasks/${id}/offers/mine/withdraw`, {})).status, 200);
  assert.equal((await storedTask(id)).offerCount, 2); assert.equal((await storedTask(id)).status, 'AWAITING_CONFIRMATION');
  const assignmentId = selected.body.assignment.id;
  for (const actor of [owner, manager, alex]) assert.equal((await call(actor, 'get', '/assignments/' + assignmentId)).status, 200);
  for (const actor of [marcus, circle]) assert.equal((await call(actor, 'get', '/assignments/' + assignmentId)).status, 403);
  const mine = await call(alex, 'get', `/tasks/${id}/offers/mine`); assert.equal(mine.body.offer.assignmentId, assignmentId);
  assert.equal((await call(alex, 'get', '/tasks/' + id)).status, 403, 'Pending external Assignment grants no private task/address access');
  assert.equal((await call(alex, 'get', `/care-contexts/${contextId}/locations`)).status, 403);
  assert.ok(!JSON.stringify(selected.body.assignment).includes('PRIVATE'));
});
test('concurrent selection yields exactly one Assignment and selected Offer, with conflict for loser', async () => {
  const id = await published(); const a = await offer(alex, id), b = await offer(marcus, id);
  const results = await Promise.all([call(owner, 'post', `/tasks/${id}/select-offer`, { offerId: a.body.id }), call(manager, 'post', `/tasks/${id}/select-offer`, { offerId: b.body.id })]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  const assignments = await db.collection('assignments').where('taskId', '==', id).get(); assert.equal(assignments.size, 1);
  const offers = (await db.collection('offers').where('taskId', '==', id).get()).docs.map(doc => doc.data());
  assert.equal(offers.filter(item => item.status === 'SELECTED').length, 1); assert.equal(offers.filter(item => item.status === 'ACTIVE').length, 1);
  assert.equal((await storedTask(id)).activeAssignmentId, assignments.docs[0].id);
});
test('discovery eligibility and privacy exclude internal details and closed/own/circle tasks', async () => {
  const open = await published(); const responding = await published(); await offer(marcus, responding);
  const circleOnly = await published('CARE_CIRCLE');
  const cancelled = await published(); await call(owner, 'post', `/tasks/${cancelled}/cancel`, {});
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { title: 'Private draft' })).body.id;
  const pending = await published(); const offered = await offer(marcus, pending);
  await call(owner, 'post', `/tasks/${pending}/select-offer`, { offerId: offered.body.id });
  assert.equal((await call(unverified, 'get', '/tasks/discover')).body.error.code, 'HELPER_NOT_VERIFIED');
  const discovery = await call(alex, 'get', '/tasks/discover?latitude=40.75&longitude=-73.95&radiusKm=25&urgency=PLANNED&compensationType=VOLUNTEER');
  assert.equal(discovery.status, 200);
  const ids = discovery.body.tasks.map((task: { id: string }) => task.id);
  assert.ok(ids.includes(open)); assert.ok(ids.includes(responding)); for (const id of [draft, cancelled, circleOnly, pending]) assert.ok(!ids.includes(id));
  const own = await call(owner, 'get', '/tasks/discover'); assert.ok(!own.body.tasks.some((task: { id: string }) => task.id === open));
  for (const response of [discovery, await call(alex, 'get', `/tasks/${open}/discovery`)]) {
    const serialized = JSON.stringify(response.body);
    for (const secret of ['918 PRIVATE ADDRESS', 'SECRET ACCESS', 'PRIVATE HOME LABEL', '40.75283', '-73.95743', locationId, contextId, owner.localId]) assert.ok(!serialized.includes(secret));
  }
  const detail = (await call(alex, 'get', `/tasks/${open}/discovery`)).body;
  for (const field of ['instructions', 'locationId', 'formattedAddress', 'createdBy', 'careContextId']) assert.equal(detail[field], undefined);
  assert.ok(detail.approximateLocation.latitude !== 40.75283 || detail.approximateLocation.longitude !== -73.95743);
  assert.ok(discovery.body.tasks.length <= discovery.body.resultLimit); assert.equal(discovery.body.candidateLimit, 100);
});
test('unpublished/closed tasks cannot accept Offers; cancellation before selection preserves history safely', async () => {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, {})).body.id;
  assert.equal((await offer(alex, draft)).status, 403, 'A private draft is not an externally visible resource');
  const id = await published(); await offer(alex, id);
  assert.equal((await call(owner, 'post', `/tasks/${id}/cancel`, {})).status, 200);
  assert.equal((await offer(marcus, id)).body.error.code, 'TASK_NOT_OFFERABLE');
  assert.equal((await call(alex, 'post', `/tasks/${id}/offers/mine/withdraw`, {})).status, 409, 'Task cancellation closes active Offers');
  assert.equal((await storedTask(id)).status, 'CANCELLED'); assert.equal((await storedTask(id)).offerCount, 0);
});
test('role preference cannot grant roles or verification and never affects authorization', async () => {
  const preference = await call(owner, 'patch', '/me/preferences', { lastActiveRole: 'HELPER' });
  assert.equal(preference.status, 200); assert.equal(preference.body.lastActiveRole, 'HELPER');
  assert.equal((await call(manager, 'patch', '/me/preferences', { lastActiveRole: 'HELPER' })).status, 403);
  assert.equal((await call(unverified, 'patch', '/me/preferences', { lastActiveRole: 'HELPER', verificationStatus: 'VERIFIED' })).status, 400);
  assert.equal((await call(unverified, 'get', '/tasks/discover')).status, 403);
  const id = await published(); await offer(alex, id);
  assert.equal((await call(owner, 'get', `/tasks/${id}/offers`)).status, 200, 'Owner rights remain after UI role change');
});
test('selection rejects unauthorized actors, foreign or withdrawn Offers, and revoked helper eligibility', async () => {
  const id = await published(), other = await published();
  const a = await offer(alex, id), foreign = await offer(marcus, other);
  assert.equal((await call(lisa, 'post', `/tasks/${id}/select-offer`, { offerId: a.body.id })).status, 403);
  assert.equal((await call(owner, 'post', `/tasks/${id}/select-offer`, { offerId: foreign.body.id })).body.error.code, 'OFFER_NOT_FOUND');
  await call(alex, 'post', `/tasks/${id}/offers/mine/withdraw`, {}); await offer(lisa, id);
  assert.equal((await call(owner, 'post', `/tasks/${id}/select-offer`, { offerId: a.body.id })).body.error.code, 'OFFER_NOT_ACTIVE');
  const revoked = await account(); const candidate = await offer(revoked, id);
  await db.collection('users').doc(revoked.localId).update({ verificationStatus: 'FAILED' });
  assert.equal((await call(owner, 'post', `/tasks/${id}/select-offer`, { offerId: candidate.body.id })).body.error.code, 'HELPER_NOT_VERIFIED');
});
