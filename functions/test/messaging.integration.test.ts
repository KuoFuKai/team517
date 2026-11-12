import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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


const createCircle = (actor: Account, other: Account) => call(actor, 'post', '/conversations', { scope: 'CARE_CONTEXT', careContextId: contextId, otherUserId: other.localId });
const createTaskChat = (actor: Account, taskId: string, other?: Account) => call(actor, 'post', `/tasks/${taskId}/conversations`, other ? { otherUserId: other.localId } : {});
const send = (actor: Account, id: string, text: string, clientMessageId = crypto.randomUUID()) => call(actor, 'post', `/conversations/${id}/messages`, { text, clientMessageId });
const readMessages = (actor: Account, id: string) => call(actor, 'get', `/conversations/${id}/messages`);

test('active circle members create one deterministic conversation concurrently; arbitrary/duplicate/group pairs rejected', async () => {
  const result = await Promise.all([createCircle(owner, circle), createCircle(circle, owner)]); assert.ok(result.every(r => r.status === 200)); assert.equal(result[0].body.conversation.id, result[1].body.conversation.id); assert.equal(result[0].body.conversation.canSend, true);
  assert.equal((await createCircle(alex, owner)).status, 403); assert.equal((await createCircle(owner, alex)).status, 403); assert.equal((await createCircle(owner, owner)).status, 403);
  assert.equal((await call(owner, 'post', '/conversations', { scope: 'CARE_CONTEXT', careContextId: contextId, otherUserId: circle.localId, participantIds: [owner.localId, circle.localId, manager.localId] })).status, 400);
  const members = await call(circle, 'get', `/care-contexts/${contextId}/messaging-members`); assert.equal(members.status, 200); assert.ok(members.body.members.some((m: any) => m.id === owner.localId)); assert.equal(members.body.members[0].email, undefined);
  assert.equal((await call(alex, 'get', `/care-contexts/${contextId}/messaging-members`)).status, 403);
});

test('removed circle member retains isolated history, but both sides lose sending in that scope', async () => {
  const chat = await createCircle(owner, manager); const id = chat.body.conversation.id;
  await send(owner, id, 'Circle greeting');
  await db.collection('care_context_members').doc(membershipId(contextId, manager.localId)).update({ status: 'REMOVED' });
  for (const actor of [owner, manager]) { assert.equal((await call(actor, 'get', '/conversations/' + id)).body.conversation.canSend, false); assert.equal((await readMessages(actor, id)).status, 200); assert.equal((await send(actor, id, 'Not allowed')).body.error.code, 'MESSAGING_RELATIONSHIP_INACTIVE'); }
  assert.equal((await readMessages(alex, id)).status, 403);
  await db.collection('care_context_members').doc(membershipId(contextId, manager.localId)).update({ status: 'ACTIVE' });
});

test('Task scope requires active Offer and requester relationship; does not authorize helper-to-helper or Community-only contact', async () => {
  const taskId = await published(); assert.equal((await createTaskChat(alex, taskId)).status, 403);
  assert.equal((await createTaskChat(owner, taskId, alex)).status, 403);
  // A Community interaction has no messaging authority.
  const post = await call(owner, 'post', '/community/posts', { type: 'NEED', taskId, visibility: 'PUBLIC_VERIFIED', body: 'Community caption' }); await call(alex, 'post', `/community/posts/${post.body.id}/comments`, { body: 'A public comment' });
  assert.equal((await createTaskChat(alex, taskId)).status, 403);
  await offer(alex, taskId); await offer(marcus, taskId);
  const chat = await createTaskChat(alex, taskId); assert.equal(chat.status, 200); assert.equal(chat.body.conversation.otherParticipant.id, owner.localId); assert.equal(chat.body.conversation.careContextId, undefined);
  assert.equal((await createTaskChat(alex, taskId, marcus)).status, 403); assert.equal((await readMessages(marcus, chat.body.conversation.id)).status, 403);
  assert.equal((await createTaskChat(manager, taskId, alex)).status, 200, 'active manager can explicitly address valid Helper');
  const before = await storedTask(taskId); assert.equal((await send(alex, chat.body.conversation.id, 'Offer question')).status, 201); const after = await storedTask(taskId); assert.equal(after.status, before.status); assert.equal(after.offerCount, before.offerCount);
  const data = JSON.stringify(chat.body); for (const secret of ['918 PRIVATE', 'SECRET ACCESS', locationId, contextId]) assert.ok(!data.includes(secret));
});

test('Task chat persists through selected/confirmed/in-progress/completion-pending, then becomes completed history only', async () => {
  const s = await selected(); const chat = await createTaskChat(alex, s.taskId); const id = chat.body.conversation.id; assert.equal(chat.status, 200);
  for (const op of ['confirm', 'start', 'request-completion']) { assert.equal((await send(alex, id, 'Update before ' + op)).status, 201); assert.equal((await action(alex, s.id, op)).status, 200); assert.equal((await call(owner, 'get', '/conversations/' + id)).body.conversation.canSend, true); }
  assert.equal((await action(owner, s.id, 'confirm-completion')).status, 200);
  assert.equal((await send(alex, id, 'Too late')).status, 403); assert.equal((await call(alex, 'get', '/conversations/' + id)).body.conversation.canSend, false); assert.equal((await readMessages(alex, id)).body.messages.length, 3);
});

test('terminal Offer/Assignment states revoke send, including cancelled and disputed, while preserving actual participant history', async () => {
  for (const ending of ['withdraw', 'decline', 'requester-cancel', 'helper-cancel', 'task-cancel', 'dispute']) {
    const taskId = await published(); await offer(alex, taskId); const id = (await createTaskChat(alex, taskId)).body.conversation.id; await send(alex, id, 'Initial');
    if (ending === 'withdraw') await call(alex, 'post', `/tasks/${taskId}/offers/mine/withdraw`, {});
    else {
      const selection = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: offerId(taskId, alex.localId) }); const assignmentId = selection.body.assignment.id;
      if (ending === 'decline') await action(alex, assignmentId, 'decline');
      if (ending === 'requester-cancel') await action(owner, assignmentId, 'cancel');
      if (ending === 'helper-cancel') { await action(alex, assignmentId, 'confirm'); await action(alex, assignmentId, 'cancel'); }
      if (ending === 'task-cancel') await call(owner, 'post', `/tasks/${taskId}/cancel`, {});
      if (ending === 'dispute') { await advance(assignmentId); await action(owner, assignmentId, 'dispute'); }
    }
    assert.equal((await call(alex, 'get', '/conversations/' + id)).body.conversation.canSend, false, ending); assert.equal((await send(owner, id, 'Blocked')).status, 403, ending); assert.equal((await readMessages(alex, id)).status, 200);
  }
});

test('withdrawn/replacement Helpers have separate histories; a new valid Offer can reactivate only its own pair', async () => {
  const taskId = await published(); await offer(alex, taskId); await offer(marcus, taskId);
  const alexChat = (await createTaskChat(alex, taskId)).body.conversation.id; await send(alex, alexChat, 'Alex private history');
  await call(alex, 'post', `/tasks/${taskId}/offers/mine/withdraw`, {});
  const marcusChat = (await createTaskChat(marcus, taskId)).body.conversation.id; assert.notEqual(alexChat, marcusChat); assert.equal((await readMessages(marcus, alexChat)).status, 403);
  assert.equal((await createTaskChat(alex, taskId)).body.conversation.canSend, false);
  await offer(alex, taskId); assert.equal((await createTaskChat(alex, taskId)).body.conversation.id, alexChat); assert.equal((await send(alex, alexChat, 'Available again')).status, 201);
  const replacement = await call(owner, 'post', `/tasks/${taskId}/select-offer`, { offerId: offerId(taskId, marcus.localId) }); assert.equal(replacement.status, 200);
  assert.equal((await readMessages(marcus, alexChat)).status, 403);
  assert.equal((await call(alex, 'get', '/conversations/' + alexChat)).body.conversation.canSend, true, 'pending selection keeps active backup Offer communication');
  await action(marcus, replacement.body.assignment.id, 'confirm');
  assert.equal((await call(alex, 'get', '/conversations/' + alexChat)).body.conversation.canSend, false, 'confirmation closes backup Offers and sending');
});

test('message validation and concurrent retry IDs create one immutable Message, one Notification and stable lastMessageAt', async () => {
  const s = await selected(); const id = (await createTaskChat(alex, s.taskId)).body.conversation.id;
  assert.equal((await send(alex, id, '   ')).body.error.code, 'MESSAGE_EMPTY'); assert.equal((await send(alex, id, 'x'.repeat(2001))).body.error.code, 'MESSAGE_TOO_LONG'); assert.equal((await send(alex, id, '<script>alert(1)</script>')).status, 400);
  const clientId = crypto.randomUUID(); const sends = await Promise.all([send(alex, id, 'A message', clientId), send(alex, id, 'A message', clientId)]); assert.ok(sends.every(r => r.status === 201)); assert.equal(sends[0].body.id, sends[1].body.id);
  const conversation = await read('conversations', id); assert.equal(conversation.messageCount, 1); assert.equal(conversation.unreadCounts[owner.localId], 1);
  assert.equal((await db.collection('messages').where('conversationId', '==', id).get()).size, 1);
  const notices = (await db.collection('notifications').where('resourceId', '==', id).get()).docs.map(d => d.data()); assert.equal(notices.length, 1); assert.equal(notices[0].type, 'NEW_MESSAGE'); assert.equal(notices[0].resourceType, 'CONVERSATION'); assert.equal(notices[0].recipientId, owner.localId); assert.ok(!JSON.stringify(notices).includes('A message'));
  await send(alex, id, 'A message', clientId); assert.equal((await read('conversations', id)).lastMessageAt.toMillis(), conversation.lastMessageAt.toMillis());
  assert.equal((await send(alex, id, 'Different text', clientId)).body.error.code, 'CLIENT_MESSAGE_ID_CONFLICT');
  await action(alex, s.id, 'decline'); assert.equal((await send(alex, id, 'A message', clientId)).status, 201, 'already committed retry is history, not new send'); assert.equal((await send(alex, id, 'New ID')).status, 403);
});

test('rapid distinct messages, unread counters, recipient-only read state and Inbox isolation/order', async () => {
  const one = await selected(), two = await selected(); const a = (await createTaskChat(alex, one.taskId)).body.conversation.id, b = (await createTaskChat(alex, two.taskId)).body.conversation.id;
  const sends = await Promise.all([send(alex, a, 'One'), send(alex, a, 'Two')]); assert.ok(sends.every(r => r.status === 201)); assert.deepEqual((await readMessages(alex, a)).body.messages.map((m: any) => m.sequence), [1, 2]);
  await send(owner, a, 'Reply'); await send(alex, b, 'Newest chat');
  const inbox = await call(owner, 'get', '/me/conversations'); assert.equal(inbox.status, 200); assert.equal(inbox.body.conversations[0].id, b); assert.equal(inbox.body.conversations.find((c: any) => c.id === a).unreadCount, 2);
  assert.ok(!(await call(lisa, 'get', '/me/conversations')).body.conversations.some((c: any) => c.id === a));
  const marked = await call(owner, 'post', `/conversations/${a}/read`, {}); assert.equal(marked.body.marked, 2); assert.equal(marked.body.unreadCount, 0);
  const messages = (await readMessages(owner, a)).body.messages; assert.ok(messages.filter((m: any) => m.senderId === alex.localId).every((m: any) => m.readAt)); assert.equal(messages.find((m: any) => m.senderId === owner.localId).readAt, undefined);
  const timestamps = messages.filter((m: any) => m.senderId === alex.localId).map((m: any) => m.readAt); assert.equal((await call(owner, 'post', `/conversations/${a}/read`, {})).body.marked, 0); assert.deepEqual((await readMessages(owner, a)).body.messages.filter((m: any) => m.senderId === alex.localId).map((m: any) => m.readAt), timestamps);
  assert.equal((await call(marcus, 'post', `/conversations/${a}/read`, {})).status, 403);
});

test('send versus relationship termination serializes against Task/Offer without unauthorized late writes', async () => {
  const taskId = await published(); await offer(alex, taskId); const id = (await createTaskChat(alex, taskId)).body.conversation.id;
  const results = await Promise.all([send(alex, id, 'Racing message'), call(alex, 'post', `/tasks/${taskId}/offers/mine/withdraw`, {})]); assert.equal(results[1].status, 200); assert.ok([201, 403].includes(results[0].status));
  assert.equal((await send(alex, id, 'After termination')).status, 403); const count = (await db.collection('messages').where('conversationId', '==', id).get()).size; assert.equal(count, results[0].status === 201 ? 1 : 0);
  assert.equal((await db.collection('notifications').where('resourceId', '==', id).get()).size, count);
});


test('bounded message cursor and read batches preserve full unread counts beyond the visible window', async () => {
  const s = await selected(); const id = (await createTaskChat(alex, s.taskId)).body.conversation.id; const now = Timestamp.now();
  const batch = db.batch();
  for (let sequence = 1; sequence <= 205; sequence++) { const key = id + '_fixture_' + sequence; batch.create(db.collection('messages').doc(key), { id: key, conversationId: id, senderId: alex.localId, text: 'Older text ' + sequence, clientMessageId: 'fixture_' + sequence, sequence, createdAt: now, readAt: null }); }
  batch.update(db.collection('conversations').doc(id), { messageCount: 205, lastMessageAt: now, unreadCounts: { [owner.localId]: 205, [alex.localId]: 0 } }); await batch.commit();
  const newest = await readMessages(owner, id); assert.equal(newest.body.messages.length, 50); assert.equal(newest.body.messages[0].sequence, 156); assert.equal(newest.body.nextBefore, 156);
  const older = await call(owner, 'get', `/conversations/${id}/messages?before=156`); assert.equal(older.body.messages[0].sequence, 106); assert.equal(older.body.messages.at(-1).sequence, 155);
  const first = await call(owner, 'post', `/conversations/${id}/read`, {}); assert.equal(first.body.marked, 200); assert.equal(first.body.unreadCount, 5); assert.equal(first.body.truncated, true);
  const second = await call(owner, 'post', `/conversations/${id}/read`, {}); assert.equal(second.body.marked, 5); assert.equal(second.body.unreadCount, 0); assert.equal(second.body.truncated, false);
});
