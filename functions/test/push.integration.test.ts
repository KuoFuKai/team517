import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createApp } from '../src/api/app';
import { Store } from '../src/repositories/store';
import { DeviceTokenRepository, deviceTokenId } from '../src/repositories/device-tokens';
import { NotificationDeliveryService } from '../src/push/service';
import type { PushPayload, PushProvider } from '../src/push/provider';
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Use root emulator integration command.');
initializeApp({ projectId: 'demo-team517' });
const db = getFirestore(), app = createApp(new Store()), devices = new DeviceTokenRepository();
type Account = { localId: string; idToken: string };
let a: Account, b: Account;
const call = (u: Account, path: string, body?: object) => {
  const req = request(app)[body ? 'post' : 'get']('/api/v1' + path).set('Authorization', 'Bearer ' + u.idToken);
  return body ? req.send(body) : req;
};
async function account(): Promise<Account> {
  const result = await fetch('http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: crypto.randomUUID() + '@test.invalid', password: 'testing123', returnSecureToken: true }) });
  assert.equal(result.status, 200); const u = await result.json() as Account;
  assert.equal((await call(u, '/users/initialize', { primaryOnboardingRole: 'CARE_MANAGER' })).status, 200); return u;
}
before(async () => { [a, b] = await Promise.all([account(), account()]); });
const token = () => 'fcm_test_' + crypto.randomUUID().replaceAll('-', '_');
async function note(uid: string, type = 'NEW_MESSAGE') {
  const id = 'push_' + crypto.randomUUID();
  await db.collection('notifications').doc(id).set({ id, recipientId: uid, type, resourceType: 'CONVERSATION', resourceId: 'resource', title: 'SECRET HOME', body: 'SECRET MESSAGE', createdAt: Timestamp.now() }); return id;
}
class FakeProvider implements PushProvider {
  sent: { token: string; payload: PushPayload }[] = [];
  constructor(private outcome: 'SENT' | 'INVALID' | 'FAILED' = 'SENT') {}
  async send(token: string, payload: PushPayload) { this.sent.push({ token, payload }); return this.outcome; }
}
test('registration requires authentication, rejects arbitrary ownership, and hides tokens', async () => {
  const value = token();
  assert.equal((await request(app).post('/api/v1/me/device-tokens').send({ token: value, platform: 'android' })).status, 401);
  assert.equal((await call(a, '/me/device-tokens', { token: value, platform: 'android', userId: b.localId })).status, 400);
  const r = await call(a, '/me/device-tokens', { token: value, platform: 'android' }); assert.equal(r.status, 200);
  assert.equal(r.body.id, deviceTokenId(value)); assert.ok(!('token' in r.body)); assert.ok(!('userId' in r.body));
  assert.equal((await call(b, '/me/device-tokens/' + r.body.id)).status, 404);
  assert.ok(!JSON.stringify((await call(a, '/me')).body).includes(value));
  const id = await note(a.localId); assert.equal((await call(b, '/notifications/' + id)).status, 403);
  assert.ok(!('pushDelivery' in (await call(a, '/notifications/' + id)).body));
});
test('concurrent registration is idempotent; multiple devices coexist', async () => {
  const value = token(); const result = await Promise.all(Array.from({ length: 5 }, () => devices.register(a.localId, { token: value, platform: 'android' })));
  assert.equal(new Set(result.map(r => r.id)).size, 1); assert.equal(new Set(result.map(r => r.registrationId)).size, 1);
  const second = await devices.register(a.localId, { token: token(), platform: 'android' }); assert.notEqual(second.id, result[0].id);
});
test('account transfer and delayed logout cannot disable the new ownership, including A-B-A', async () => {
  const value = token(), first = await devices.register(a.localId, { token: value, platform: 'android' });
  const second = await devices.register(b.localId, { token: value, platform: 'android' });
  await devices.disable(a.localId, first.id, first.registrationId);
  assert.equal((await devices.status(b.localId, second.id)).enabled, true);
  const third = await devices.register(a.localId, { token: value, platform: 'android' });
  await devices.disable(a.localId, first.id, first.registrationId);
  assert.equal((await devices.status(a.localId, third.id)).enabled, true);
  await devices.disable(a.localId, third.id, third.registrationId);
  assert.equal((await devices.status(a.localId, third.id)).enabled, false);
});
test('concurrent notification delivery claims once; fans out only to recipient and enabled devices', async () => {
  const u = await account(), other = await account();
  await devices.register(u.localId, { token: token(), platform: 'android' }); await devices.register(u.localId, { token: token(), platform: 'android' });
  const off = await devices.register(u.localId, { token: token(), platform: 'android' }); await devices.disable(u.localId, off.id, off.registrationId);
  await devices.register(other.localId, { token: token(), platform: 'android' });
  const id = await note(u.localId), fake = new FakeProvider(), service = new NotificationDeliveryService(fake);
  await Promise.all([service.deliver(id), service.deliver(id), service.deliver(id)]);
  assert.equal(fake.sent.length, 2); assert.equal(new Set(fake.sent.map(s => s.token)).size, 2);
  assert.ok(!JSON.stringify(fake.sent.map(s => s.payload)).includes('SECRET'));
  assert.equal((await db.collection('notifications').doc(id).get()).data()!.pushDelivery.sent, 2);
});
test('opted-out account switch transfers token without briefly enabling delivery', async () => {
  const value = token(), first = await devices.register(a.localId, { token: value, platform: 'android' });
  const second = await devices.register(b.localId, { token: value, platform: 'android', deliveryEnabled: false });
  assert.equal(second.enabled, false); assert.notEqual(first.registrationId, second.registrationId);
  await devices.disable(a.localId, first.id, first.registrationId);
  assert.equal((await devices.status(b.localId, second.id)).enabled, false);
  assert.equal((await devices.register(b.localId, { token: value, platform: 'android', deliveryEnabled: false })).registrationId, second.registrationId);
  assert.equal((await devices.register(b.localId, { token: value, platform: 'android' })).enabled, true);
});
test('invalid tokens disable only that registration, not other devices or transferred ownership', async () => {
  const u = await account(), other = await account();
  const value = token(), old = await devices.register(u.localId, { token: value, platform: 'android' });
  const good = await devices.register(u.localId, { token: token(), platform: 'android' });
  const provider: PushProvider = { send: async current => {
    if (current === value) { await devices.register(other.localId, { token: value, platform: 'android' }); return 'INVALID'; } return 'SENT';
  } };
  await new NotificationDeliveryService(provider).deliver(await note(u.localId));
  assert.equal((await devices.status(other.localId, old.id)).enabled, true); assert.equal((await devices.status(u.localId, good.id)).enabled, true);
  const badValue = token(), bad = await devices.register(u.localId, { token: badValue, platform: 'android' });
  await new NotificationDeliveryService({ send: async t => t === value ? 'SENT' : t === (await db.collection('device_tokens').doc(bad.id).get()).data()!.token ? 'INVALID' : 'SENT' }).deliver(await note(u.localId));
  assert.equal((await devices.status(u.localId, bad.id)).enabled, false); assert.equal((await devices.status(u.localId, good.id)).enabled, true);
  await assert.rejects(devices.register(u.localId, { token: badValue, platform: 'android' }), (e: unknown) => (e as { code?: string }).code === 'PUSH_TOKEN_INVALID');
  assert.equal((await devices.register(u.localId, { token: token(), platform: 'android' })).enabled, true);
});
test('provider failure after actual Offer and Message commits preserves business state and retry identity', async () => {
  const owner = await account(), helper = await account();
  await db.collection('users').doc(helper.localId).update({ roles: ['HELPER'], verificationStatus: 'VERIFIED' });
  await devices.register(owner.localId, { token: token(), platform: 'android' });
  const ctx = (await call(owner, '/care-contexts', { name: 'Push test care' })).body.id;
  const location = (await call(owner, `/care-contexts/${ctx}/locations`, { label: 'PRIVATE', formattedAddress: 'PRIVATE ADDRESS', latitude: 40.75283, longitude: -73.95743 })).body.id;
  const draft = await call(owner, `/care-contexts/${ctx}/tasks/drafts`, { title: 'Task', helpType: 'ERRANDS', instructions: 'PRIVATE INSTRUCTIONS', locationId: location, startAt: '2026-12-01T14:00:00Z', endAt: '2026-12-01T15:00:00Z', urgency: 'PLANNED', visibility: 'VERIFIED_HELPERS', compensationType: 'VOLUNTEER' });
  assert.equal((await call(owner, `/tasks/${draft.body.id}/publish`, {})).status, 200);
  const offered = await call(helper, `/tasks/${draft.body.id}/offers`, { message: 'PRIVATE OFFER' }); assert.equal(offered.status, 201);
  const duplicate = await call(helper, `/tasks/${draft.body.id}/offers`, {}); assert.equal(duplicate.status, 409);
  const conversation = await call(helper, `/tasks/${draft.body.id}/conversations`, {}); assert.ok([200, 201].includes(conversation.status));
  const conversationId = conversation.body.id ?? conversation.body.conversation?.id;
  const body = { text: 'PRIVATE MESSAGE', clientMessageId: 'push_retry_123' };
  const sent = await call(helper, `/conversations/${conversationId}/messages`, body); assert.ok([200, 201].includes(sent.status));
  const retry = await call(helper, `/conversations/${conversationId}/messages`, body); assert.equal(retry.body.id, sent.body.id);
  const notes = await db.collection('notifications').where('recipientId', '==', owner.localId).get();
  assert.equal(notes.size, 2);
  const provider = new FakeProvider('FAILED'), service = new NotificationDeliveryService(provider);
  for (const n of notes.docs) { await service.deliver(n.id); await service.deliver(n.id); }
  assert.equal(provider.sent.length, 2); assert.ok(!JSON.stringify(provider.sent.map(s => s.payload)).includes('PRIVATE'));
  assert.equal((await db.collection('tasks').doc(draft.body.id).get()).data()!.status, 'HAS_OFFERS');
  assert.equal((await call(helper, `/conversations/${conversationId}/messages`, body)).body.id, sent.body.id);
  assert.equal((await db.collection('notifications').where('recipientId', '==', owner.localId).get()).size, 2);
  await devices.register(helper.localId, { token: token(), platform: 'android' });
  const selection = await call(owner, `/tasks/${draft.body.id}/select-offer`, { offerId: offered.body.id });
  assert.equal(selection.status, 200);
  assert.equal((await call(owner, `/tasks/${draft.body.id}/select-offer`, { offerId: offered.body.id })).status, 409);
  const helperNotes = await db.collection('notifications').where('recipientId', '==', helper.localId).get(); assert.equal(helperNotes.size, 1);
  await service.deliver(helperNotes.docs[0].id); await service.deliver(helperNotes.docs[0].id);
  assert.equal(provider.sent.length, 3);
  assert.equal((await db.collection('tasks').doc(draft.body.id).get()).data()!.status, 'AWAITING_CONFIRMATION');
  assert.equal((await db.collection('assignments').doc(selection.body.assignment.id).get()).data()!.status, 'PENDING_CONFIRMATION');
});
