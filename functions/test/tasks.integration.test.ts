import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import request from 'supertest';
import { createApp } from '../src/api/app';
import { Store, membershipId } from '../src/repositories/store';

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Use root npm run test:integration.');
initializeApp({ projectId: 'demo-team517' });
const db = getFirestore();
const app = createApp(new Store());
interface Account { idToken: string; localId: string }
let owner: Account, member: Account, outsider: Account, manager: Account;
let contextId: string, foreignContextId: string, locationId: string, foreignLocationId: string;
const call = (user: Account, method: 'get' | 'post' | 'patch', path: string, body?: unknown) => {
  const pending = request(app)[method]('/api/v1' + path).set('Authorization', 'Bearer ' + user.idToken);
  return body === undefined ? pending : pending.send(body as object);
};
async function account(): Promise<Account> {
  const response = await fetch('http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crypto.randomUUID() + '@example.test', password: 'testing123', returnSecureToken: true }),
  });
  assert.equal(response.status, 200);
  const user = await response.json() as Account;
  assert.equal((await call(user, 'post', '/users/initialize', { primaryOnboardingRole: 'CARE_MANAGER' })).status, 200);
  return user;
}
const valid = () => ({ title: 'Pick up groceries', helpType: 'ERRANDS', instructions: 'Buy bread and milk.',
  startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', locationId,
  urgency: 'PLANNED', visibility: 'CARE_CIRCLE', compensationType: 'VOLUNTEER' });
async function draft(fields: object = {}, actor = owner) {
  const response = await call(actor, 'post', `/care-contexts/${contextId}/tasks/drafts`, fields);
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body;
}
async function events(id: string) {
  return (await db.collection('task_events').where('taskId', '==', id).get()).docs.map(doc => doc.data());
}
before(async () => {
  [owner, member, outsider, manager] = await Promise.all([account(), account(), account(), account()]);
  contextId = (await call(owner, 'post', '/care-contexts', { name: "Mom's care" })).body.id;
  foreignContextId = (await call(outsider, 'post', '/care-contexts', { name: 'Other care' })).body.id;
  for (const [user, role] of [[member, 'HELPER'], [manager, 'CARE_MANAGER']] as const) {
    const id = membershipId(contextId, user.localId);
    await db.collection('care_context_members').doc(id).set({ id, careContextId: contextId, userId: user.localId, role, status: 'ACTIVE' });
  }
  locationId = (await call(owner, 'post', `/care-contexts/${contextId}/locations`, { label: 'Home', formattedAddress: '123 Example Street' })).body.id;
  foreignLocationId = (await call(outsider, 'post', `/care-contexts/${foreignContextId}/locations`, { label: 'Other home', formattedAddress: '456 Example Street' })).body.id;
});

test('active helper member can create an incomplete draft with an atomic creation event', async () => {
  const created = await draft({}, member);
  assert.equal(created.status, 'DRAFT'); assert.equal(created.createdBy, member.localId);
  const stored = (await db.collection('tasks').doc(created.id).get()).data()!;
  assert.equal(stored.offerCount, 0); assert.equal(stored.careContextId, contextId);
  const history = await events(created.id);
  assert.equal(history.length, 1); assert.equal(history[0].type, 'TASK_CREATED'); assert.equal(history[0].actorId, member.localId);
});
test('unrelated user cannot create a task or location in another context', async () => {
  assert.equal((await call(outsider, 'post', `/care-contexts/${contextId}/tasks/drafts`, {})).status, 403);
  assert.equal((await call(outsider, 'post', `/care-contexts/${contextId}/locations`, { label: 'X', formattedAddress: 'Y' })).status, 403);
});
test('partial draft saves, null clears fields, and no-op saves do not spam history', async () => {
  const created = await draft();
  const saved = await call(owner, 'patch', '/tasks/' + created.id, { title: 'Partial draft' });
  assert.equal(saved.status, 200); assert.equal(saved.body.status, 'DRAFT');
  await call(owner, 'patch', '/tasks/' + created.id, { title: 'Partial draft' });
  assert.equal((await events(created.id)).filter(event => event.type === 'TASK_UPDATED').length, 1);
  const cleared = await call(owner, 'patch', '/tasks/' + created.id, { title: null });
  assert.equal(cleared.status, 200); assert.equal(cleared.body.title, undefined);
});
test('unrelated users and non-owner non-manager members cannot edit a draft', async () => {
  const created = await draft();
  for (const actor of [outsider, member]) assert.equal((await call(actor, 'patch', '/tasks/' + created.id, { title: 'No' })).status, 403);
});
test('context manager can edit another member draft; lastActiveRole grants no permission', async () => {
  const created = await draft({}, member);
  assert.equal((await call(manager, 'patch', '/tasks/' + created.id, { title: 'Manager edit' })).status, 200);
  await db.collection('users').doc(outsider.localId).update({ lastActiveRole: 'CARE_MANAGER' });
  assert.equal((await call(outsider, 'patch', '/tasks/' + created.id, { title: 'No' })).status, 403);
});
test('client cannot inject protected state into draft creation or updates', async () => {
  const created = await draft();
  for (const body of [{ status: 'OPEN' }, { offerCount: 99 }, { activeAssignmentId: 'fake' }, { createdBy: outsider.localId }, { publishedAt: '2026-12-01T00:00:00Z' }, { careContextId: foreignContextId }, { createdAt: 'fake' }, { updatedAt: 'fake' }]) {
    assert.equal((await call(owner, 'patch', '/tasks/' + created.id, body)).status, 400);
    assert.equal((await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, body)).status, 400);
  }
  assert.equal((await call(owner, 'get', '/tasks/' + created.id)).body.status, 'DRAFT');
  assert.equal((await events(created.id)).length, 1);
});
test('incomplete draft cannot publish and returns structured field errors with no publish event', async () => {
  const created = await draft();
  const response = await call(owner, 'post', `/tasks/${created.id}/publish`, {});
  assert.equal(response.status, 400); assert.equal(response.body.error.code, 'TASK_NOT_READY');
  assert.ok(response.body.error.fields.some((field: { field: string }) => field.field === 'title'));
  assert.equal((await events(created.id)).length, 1);
});
test('invalid time range cannot publish', async () => {
  const created = await draft({ ...valid(), endAt: '2026-12-01T13:00:00Z' });
  const response = await call(owner, 'post', `/tasks/${created.id}/publish`, {});
  assert.equal(response.status, 400); assert.ok(response.body.error.fields.some((field: { field: string }) => field.field === 'endAt'));
});
test('foreign or missing locations cannot be attached or published', async () => {
  const created = await draft(valid());
  assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { locationId: foreignLocationId })).status, 400);
  assert.equal((await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { locationId: foreignLocationId })).status, 400);
  for (const id of [foreignLocationId, 'A'.repeat(20)]) {
    // Test-only seeding proves the transition revalidates persisted references.
    await db.collection('tasks').doc(created.id).update({ locationId: id });
    assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  }
  assert.equal((await events(created.id)).length, 1);
});
test('valid volunteer task publishes with publishedAt and exactly one publish event', async () => {
  const created = await draft(valid());
  const response = await call(owner, 'post', `/tasks/${created.id}/publish`, {});
  assert.equal(response.status, 200); assert.equal(response.body.status, 'OPEN'); assert.ok(response.body.publishedAt);
  const history = await events(created.id);
  assert.equal(history.filter(event => event.type === 'TASK_PUBLISHED').length, 1);
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 409);
  assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { title: 'Cannot edit OPEN' })).status, 409);
});
test('concurrent publish attempts cannot both succeed or duplicate history', async () => {
  const created = await draft(valid());
  const responses = await Promise.all([call(owner, 'post', `/tasks/${created.id}/publish`, {}), call(owner, 'post', `/tasks/${created.id}/publish`, {})]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
  assert.equal((await events(created.id)).filter(event => event.type === 'TASK_PUBLISHED').length, 1);
});
test('list and detail only expose authorized context tasks and public fields', async () => {
  const created = await draft(valid());
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 200);
  const listed = await call(member, 'get', `/care-contexts/${contextId}/tasks`);
  assert.equal(listed.status, 200); assert.ok(listed.body.tasks.some((task: { id: string }) => task.id === created.id));
  assert.ok(listed.body.tasks.every((task: { careContextId: string }) => task.careContextId === contextId));
  assert.equal(listed.body.tasks[0].instructions, undefined);
  assert.equal((await call(member, 'get', '/tasks/' + created.id)).status, 200);
  const detail = (await call(owner, 'get', '/tasks/' + created.id)).body;
  assert.equal(detail.offerCount, undefined); assert.equal(detail.activeAssignmentId, undefined); assert.equal(detail.metadata, undefined);
  assert.equal((await call(outsider, 'get', '/tasks/' + created.id)).status, 403);
  assert.equal((await call(outsider, 'get', `/care-contexts/${contextId}/tasks`)).status, 403);
  assert.deepEqual((await call(outsider, 'get', `/care-contexts/${foreignContextId}/tasks`)).body.tasks, []);
});
test('draft list/get is private to its creator and active context managers', async () => {
  const privateDraft = await draft({ title: 'Owner private draft' });
  const ownDraft = await draft({ title: 'Helper own draft' }, member);
  // The helper's global app role is CARE_MANAGER in the fixture; only the
  // context membership role determines access to somebody else's draft.
  assert.equal((await call(member, 'get', '/tasks/' + privateDraft.id)).status, 403);
  assert.equal((await call(member, 'get', '/tasks/' + ownDraft.id)).status, 200);
  const listed = (await call(member, 'get', `/care-contexts/${contextId}/tasks`)).body.tasks;
  assert.ok(!listed.some((task: { id: string }) => task.id === privateDraft.id));
  assert.ok(listed.some((task: { id: string }) => task.id === ownDraft.id));
  for (const actor of [owner, manager]) {
    assert.equal((await call(actor, 'get', '/tasks/' + privateDraft.id)).status, 200);
    assert.equal((await call(actor, 'get', '/tasks/' + ownDraft.id)).status, 200);
    const managed = (await call(actor, 'get', `/care-contexts/${contextId}/tasks`)).body.tasks;
    assert.ok(managed.some((task: { id: string }) => task.id === privateDraft.id));
    assert.ok(managed.some((task: { id: string }) => task.id === ownDraft.id));
  }
  assert.equal((await call(outsider, 'get', '/tasks/' + privateDraft.id)).status, 403);
});
test('cancellation is terminal for DRAFT and OPEN, and produces one event', async () => {
  for (const publish of [false, true]) {
    const created = await draft(valid());
    if (publish) assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 200);
    assert.equal((await call(outsider, 'post', `/tasks/${created.id}/cancel`, {})).status, 403);
    const cancelled = await call(owner, 'post', `/tasks/${created.id}/cancel`, {});
    assert.equal(cancelled.status, 200); assert.equal(cancelled.body.status, 'CANCELLED');
    assert.equal((await call(owner, 'post', `/tasks/${created.id}/cancel`, {})).status, 409);
    assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 409);
    assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { title: 'No' })).status, 409);
    assert.equal((await events(created.id)).filter(event => event.type === 'TASK_CANCELLED').length, 1);
  }
});
test('VOLUNTEER forbids conflicting compensation metadata', async () => {
  const created = await draft({ ...valid(), pointReward: 5 });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
});
test('POINTS requires a positive integer reward and excludes money', async () => {
  const created = await draft({ ...valid(), compensationType: 'POINTS' });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { pointReward: 0 })).status, 400);
  assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { pointReward: 1.5 })).status, 400);
  await call(owner, 'patch', '/tasks/' + created.id, { pointReward: 10, cashAmount: 2 });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  await call(owner, 'patch', '/tasks/' + created.id, { cashAmount: null });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).body.status, 'OPEN');
});
test('PAID requires positive amount and currency, excluding points', async () => {
  const created = await draft({ ...valid(), compensationType: 'PAID' });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  assert.equal((await call(owner, 'patch', '/tasks/' + created.id, { cashAmount: -1 })).status, 400);
  await call(owner, 'patch', '/tasks/' + created.id, { cashAmount: 25 });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  await call(owner, 'patch', '/tasks/' + created.id, { currency: 'USD', pointReward: 5 });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).status, 400);
  await call(owner, 'patch', '/tasks/' + created.id, { pointReward: null });
  assert.equal((await call(owner, 'post', `/tasks/${created.id}/publish`, {})).body.status, 'OPEN');
});
test('location access and coordinate input are validated', async () => {
  const response = await call(member, 'get', `/care-contexts/${contextId}/locations`);
  assert.equal(response.status, 200); assert.ok(response.body.locations.some((location: { id: string }) => location.id === locationId));
  assert.equal((await call(outsider, 'get', `/care-contexts/${contextId}/locations`)).status, 403);
  assert.equal((await call(owner, 'post', `/care-contexts/${contextId}/locations`, { label: 'X', formattedAddress: 'Y', latitude: 91, longitude: 0 })).status, 400);
});
test('removed memberships deny viewing and mutation despite global manager role', async () => {
  const removed = await account();
  const id = membershipId(contextId, removed.localId);
  await db.collection('care_context_members').doc(id).set({ id, userId: removed.localId, careContextId: contextId, role: 'CARE_MANAGER', status: 'REMOVED' });
  const created = await draft();
  assert.equal((await call(removed, 'get', '/tasks/' + created.id)).status, 403);
  assert.equal((await call(removed, 'patch', '/tasks/' + created.id, { title: 'No' })).status, 403);
  assert.equal((await call(removed, 'post', `/tasks/${created.id}/publish`, {})).status, 403);
});
