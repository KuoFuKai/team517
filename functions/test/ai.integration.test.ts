import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createApp } from '../src/api/app';
import { Store, membershipId } from '../src/repositories/store';
import { MockAiProvider } from '../src/ai/mock-provider';
import { DisabledAiProvider, type AiProvider, type StructuredTaskInput } from '../src/ai/provider';
import { AiTaskService } from '../src/ai/service';
import { ApiFailure } from '../src/shared/errors';

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Use root npm run test:integration.');
initializeApp({ projectId: 'demo-team517' });
const store = new Store();
const db = getFirestore();
const app = createApp(store, undefined, new MockAiProvider());
type Account = { idToken: string; localId: string };
let owner: Account, outsider: Account, helper: Account;
let contextId: string, draftId: string, locationId: string;
const call = (actor: Account, method: 'get' | 'post' | 'patch', path: string, body?: object, server = app) => {
  const pending = request(server)[method]('/api/v1' + path).set('Authorization', 'Bearer ' + actor.idToken);
  return body === undefined ? pending : pending.send(body);
};
const input = (extra: object = {}) => ({ careContextId: contextId, text: 'Pick up groceries tomorrow morning; location: Home', timezone: 'America/New_York', ...extra });
async function account(): Promise<Account> {
  const response = await fetch('http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: crypto.randomUUID() + '@example.test', password: 'testing123', returnSecureToken: true }),
  });
  assert.equal(response.status, 200);
  const actor = await response.json() as Account;
  await call(actor, 'post', '/users/initialize', { primaryOnboardingRole: 'CARE_MANAGER' });
  return actor;
}
function fake(output: unknown, fail = false): AiProvider {
  return { mode: 'MOCK', generateStructuredTask: async () => { if (fail) throw new Error('sensitive provider error'); return output; },
    summarizeTask: async () => { if (fail) throw new Error('sensitive provider error'); return output; } };
}
before(async () => {
  [owner, outsider, helper] = await Promise.all([account(), account(), account()]);
  contextId = (await call(owner, 'post', '/care-contexts', { name: "Mom's care" })).body.id;
  locationId = (await call(owner, 'post', `/care-contexts/${contextId}/locations`, { label: 'Home', formattedAddress: '123 Example Street' })).body.id;
  draftId = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { title: 'Existing draft' })).body.id;
  const id = membershipId(contextId, helper.localId);
  await db.collection('care_context_members').doc(id).set({ id, userId: helper.localId, careContextId: contextId, role: 'HELPER', status: 'ACTIVE' });
});

test('authorized authenticated user receives incomplete safe suggestion without creating a Task or event', async () => {
  const before = await db.collection('task_events').where('careContextId', '==', contextId).get();
  const taskCount = (await db.collection('tasks').where('careContextId', '==', contextId).get()).size;
  const response = await call(owner, 'post', '/ai/task-suggestions', input());
  assert.equal(response.status, 200); assert.equal(response.body.providerMode, 'MOCK');
  assert.ok(response.body.missingFields.includes('startAt')); assert.equal(response.body.fields.locationId, locationId);
  for (const key of ['id', 'careContextId', 'createdBy', 'status', 'offerCount', 'activeAssignmentId', 'publishedAt', 'createdAt', 'updatedAt']) assert.equal(response.body.fields[key], undefined);
  assert.equal((await db.collection('task_events').where('careContextId', '==', contextId).get()).size, before.size);
  assert.equal((await db.collection('tasks').where('careContextId', '==', contextId).get()).size, taskCount);
});
test('unauthenticated and unauthorized suggestion requests are rejected before provider access', async () => {
  assert.equal((await request(app).post('/api/v1/ai/task-suggestions').send(input())).status, 401);
  const server = createApp(store, undefined, fake({}, true));
  assert.equal((await call(outsider, 'post', '/ai/task-suggestions', input(), server)).status, 403);
  assert.equal((await call(helper, 'post', '/ai/task-suggestions', input({ currentTaskId: draftId }), server)).status, 403);
});
test('invalid AI input is structured and rejects arbitrary model/state/audio parameters', async () => {
  for (const patch of [{ text: '' }, { text: 'x'.repeat(5001) }, { timezone: 'invalid' }, { model: 'x' }, { status: 'OPEN' }, { audioUrl: 'https://example.test/audio' }]) {
    const response = await call(owner, 'post', '/ai/task-suggestions', input(patch));
    assert.equal(response.status, 400); assert.equal(response.body.error.code, 'INVALID_AI_INPUT');
  }
});
test('disabled and failed providers return stable codes and leave the draft unchanged', async () => {
  const original = await call(owner, 'get', '/tasks/' + draftId);
  for (const [provider, code] of [[new DisabledAiProvider(), 'AI_NOT_CONFIGURED'], [fake({}, true), 'AI_UNAVAILABLE']] as const) {
    const response = await call(owner, 'post', '/ai/task-suggestions', input({ currentTaskId: draftId }), createApp(store, undefined, provider));
    assert.equal(response.status, 503); assert.equal(response.body.error.code, code);
    assert.ok(!JSON.stringify(response.body).includes('sensitive provider error'));
    assert.deepEqual((await call(owner, 'get', '/tasks/' + draftId)).body, original.body);
  }
});
test('malformed or protected provider output never reaches the Task', async () => {
  for (const output of [null, 'not JSON', { fields: { status: 'OPEN' } }, { fields: { urgency: 'UNKNOWN' } }, { fields: { cashAmount: -1 } }, { fields: {}, reasoning: 'hidden' }]) {
    const response = await call(owner, 'post', '/ai/task-suggestions', input(), createApp(store, undefined, fake(output)));
    assert.equal(response.status, 502); assert.equal(response.body.error.code, 'AI_INVALID_RESPONSE');
  }
  assert.equal((await call(owner, 'get', '/tasks/' + draftId)).body.status, 'DRAFT');
});
test('reviewed suggestion applies through existing PATCH; publish validation stays authoritative', async () => {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, {})).body;
  const suggestion = await call(owner, 'post', `/tasks/${draft.id}/ai-suggestions`, { text: 'Urgent groceries volunteer; location: Home', timezone: 'UTC' });
  assert.equal(suggestion.status, 200); assert.equal(suggestion.body.sourceTaskUpdatedAt, draft.updatedAt);
  const patched = await call(owner, 'patch', '/tasks/' + draft.id, suggestion.body.fields);
  assert.equal(patched.status, 200); assert.equal(patched.body.status, 'DRAFT');
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/publish`, {})).body.error.code, 'TASK_NOT_READY');
  await call(owner, 'patch', '/tasks/' + draft.id, { startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', visibility: 'CARE_CIRCLE' });
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/publish`, {})).body.status, 'OPEN');
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/ai-suggestions`, { text: 'Make it clearer', timezone: 'UTC' })).status, 409);
});
test('POINTS suggestion metadata still requires normal compensation publish validation', async () => {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, {})).body;
  const suggestion = await call(owner, 'post', '/ai/task-suggestions', input({ text: 'Help for 10 points', currentTaskId: draft.id }));
  assert.equal(suggestion.body.fields.compensationType, 'POINTS');
  await call(owner, 'patch', '/tasks/' + draft.id, { ...suggestion.body.fields, startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', locationId, urgency: 'PLANNED', visibility: 'CARE_CIRCLE', cashAmount: 2 });
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/publish`, {})).status, 400);
  await call(owner, 'patch', '/tasks/' + draft.id, { cashAmount: null });
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/publish`, {})).body.status, 'OPEN');
});
test('provider cannot invent Location IDs; unresolved text stays text and known labels are context-scoped', async () => {
  const otherContext = (await call(outsider, 'post', '/care-contexts', { name: 'Other context' })).body.id;
  const foreign = (await call(outsider, 'post', `/care-contexts/${otherContext}/locations`, { label: 'Foreign clinic', formattedAddress: 'Other address' })).body;
  const bad = await call(owner, 'post', '/ai/task-suggestions', input(), createApp(store, undefined, fake({ fields: { locationId: foreign.id } })));
  assert.equal(bad.body.error.code, 'AI_INVALID_RESPONSE');
  const unmatched = await call(owner, 'post', '/ai/task-suggestions', input(), createApp(store, undefined, fake({ fields: {}, locationText: 'Foreign clinic' })));
  assert.equal(unmatched.status, 200); assert.equal(unmatched.body.fields.locationId, null);
  assert.equal(unmatched.body.locationText, 'Foreign clinic'); assert.ok(unmatched.body.warnings.length);
});
test('summary is authorized, on demand, versioned and never persisted', async () => {
  const response = await call(owner, 'post', `/tasks/${draftId}/ai-summary`, {});
  assert.equal(response.status, 200); assert.equal(response.body.providerMode, 'MOCK');
  assert.equal(response.body.taskUpdatedAt, (await call(owner, 'get', '/tasks/' + draftId)).body.updatedAt);
  assert.ok(response.body.generatedAt);
  assert.equal((await call(helper, 'post', `/tasks/${draftId}/ai-summary`, {})).status, 403);
  assert.equal((await call(outsider, 'post', `/tasks/${draftId}/ai-summary`, {})).status, 403);
  const data = (await db.collection('tasks').doc(draftId).get()).data()!;
  assert.equal(data.summary, undefined); assert.equal(data.aiSummary, undefined);
});
test('provider receives only editable fields and explicit timezone, without identifiers or profile data', async () => {
  let received: StructuredTaskInput | undefined;
  const provider: AiProvider = { mode: 'MOCK', generateStructuredTask: async value => { received = value; return { fields: {} }; }, summarizeTask: async () => ({ summary: 'Derived' }) };
  assert.equal((await call(owner, 'post', '/ai/task-suggestions', input({ currentTaskId: draftId }), createApp(store, undefined, provider))).status, 200);
  assert.equal(received?.timezone, 'America/New_York'); assert.ok(received?.referenceTime);
  assert.ok(!JSON.stringify(received).includes(owner.localId)); assert.ok(!JSON.stringify(received).includes(contextId));
  assert.deepEqual(Object.keys(received!).sort(), ['currentFields', 'referenceTime', 'text', 'timezone']);
});
test('provider timeout aborts and returns AI_UNAVAILABLE without changing a draft', async () => {
  let aborted = false;
  const provider: AiProvider = { mode: 'MOCK', generateStructuredTask: async (_value, signal) => new Promise(() => { signal.addEventListener('abort', () => { aborted = true; }); }), summarizeTask: async () => ({ summary: 'Derived' }) };
  const service = new AiTaskService(store, provider, undefined, 10);
  await assert.rejects(service.generateTaskSuggestion(owner.localId, input({ currentTaskId: draftId })), (error: unknown) => error instanceof ApiFailure && error.code === 'AI_UNAVAILABLE');
  assert.equal(aborted, true);
});
test('manual Task creation remains available with AI disabled', async () => {
  const server = createApp(store, undefined, new DisabledAiProvider());
  const draft = await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { title: 'Manual only' }, server);
  assert.equal(draft.status, 201); assert.equal(draft.body.status, 'DRAFT');
  assert.equal((await call(owner, 'patch', '/tasks/' + draft.body.id, { instructions: 'Still usable' }, server)).status, 200);
});
test('stale suggestions and summaries are rejected instead of replacing a concurrent edit', async () => {
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { title: 'Before' })).body;
  const { TaskService } = await import('../src/task/service');
  const tasks = new TaskService(store);
  const provider: AiProvider = { mode: 'MOCK',
    generateStructuredTask: async () => { await tasks.update(owner.localId, draft.id, { title: 'Concurrent edit' }); return { fields: { title: 'Provider suggestion' } }; },
    summarizeTask: async () => { await tasks.update(owner.localId, draft.id, { instructions: 'New instructions' }); return { summary: 'Old derived summary' }; },
  };
  const server = createApp(store, undefined, provider);
  assert.equal((await call(owner, 'post', '/ai/task-suggestions', input({ currentTaskId: draft.id }), server)).body.error.code, 'AI_STALE_TASK');
  assert.equal((await call(owner, 'get', '/tasks/' + draft.id)).body.title, 'Concurrent edit');
  assert.equal((await call(owner, 'post', `/tasks/${draft.id}/ai-summary`, {}, server)).body.error.code, 'AI_STALE_TASK');
});
