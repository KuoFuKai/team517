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


const post = (actor: Account, body: object) => call(actor, 'post', '/community/posts', body);
async function need(visibility = 'PUBLIC_VERIFIED', taskVisibility = 'VERIFIED_HELPERS') {
  const taskId = await published(taskVisibility); const result = await post(owner, { type: 'NEED', taskId, body: 'A safe Community caption', visibility, ...(visibility === 'CARE_CIRCLE' ? { careContextId: contextId } : {}) }); assert.equal(result.status, 201); return result.body;
}
async function resource(actor = owner, visibility = 'PUBLIC_VERIFIED') {
  const result = await call(actor, 'post', '/resources', { title: 'Community guide', summary: 'Helpful local information', category: 'Support', url: 'https://example.org/guide', visibility, ...(visibility === 'CARE_CIRCLE' ? { careContextId: contextId } : {}) }); assert.equal(result.status, 201); return result.body;
}
const storedPost = async (id: string) => (await db.collection('community_posts').doc(id).get()).data()!;

test('NEED requires an existing authorized actionable Task and rejects irrelevant fields', async () => {
  const missing = await post(owner, { type: 'NEED', body: 'Need', visibility: 'PUBLIC_VERIFIED' }); assert.equal(missing.status, 400);
  assert.equal((await post(owner, { type: 'NEED', taskId: 'a'.repeat(20), body: 'Need', visibility: 'PUBLIC_VERIFIED' })).status, 404);
  const privateTask = await published('CARE_CIRCLE');
  assert.equal((await post(alex, { type: 'NEED', taskId: privateTask, body: 'Need', visibility: 'PUBLIC_VERIFIED' })).status, 403);
  assert.equal((await post(owner, { type: 'NEED', taskId: privateTask, body: 'Need', visibility: 'PUBLIC_VERIFIED' })).body.error.code, 'VISIBILITY_MISMATCH');
  assert.equal((await post(owner, { type: 'NEED', taskId: privateTask, resourceId: 'x', body: 'Need', visibility: 'CARE_CIRCLE', careContextId: contextId })).status, 400);
  const draft = (await call(owner, 'post', `/care-contexts/${contextId}/tasks/drafts`, { visibility: 'VERIFIED_HELPERS' })).body.id;
  assert.equal((await post(owner, { type: 'NEED', taskId: draft, body: 'Need', visibility: 'PUBLIC_VERIFIED' })).status, 409);
  const complete = await selected(0); await advance(complete.id); await action(owner, complete.id, 'confirm-completion');
  assert.equal((await post(owner, { type: 'NEED', taskId: complete.taskId, body: 'Historical', visibility: 'PUBLIC_VERIFIED' })).status, 409);
  const managerTask = await published(); assert.equal((await post(manager, { type: 'NEED', taskId: managerTask, body: 'Managed need', visibility: 'PUBLIC_VERIFIED' })).status, 201);
  const cancelled = await published(); await call(owner, 'post', `/tasks/${cancelled}/cancel`, {});
  assert.equal((await post(owner, { type: 'NEED', taskId: cancelled, body: 'Need', visibility: 'PUBLIC_VERIFIED' })).status, 409);
});

test('NEED projection reuses discovery privacy, live Task data and the existing Offer flow', async () => {
  const n = await need();
  await db.collection('tasks').doc(n.taskId).update({ title: 'Updated live Task title', privateInstructions: 'PRIVATE BUZZ 12B' });
  const result = await call(alex, 'get', `/community/posts/${n.id}`); assert.equal(result.status, 200); assert.equal(result.body.post.taskPreview.title, 'Updated live Task title');
  const serialized = JSON.stringify(result.body);
  for (const secret of ['918 PRIVATE ADDRESS', 'PRIVATE HOME LABEL', 'PRIVATE BUZZ', 'SECRET ACCESS', '40.75283', '-73.95743', locationId, contextId]) assert.ok(!serialized.includes(secret));
  const stored = await storedPost(n.id); for (const field of ['taskPreview', 'location', 'compensationType', 'status']) assert.equal(stored[field], undefined); assert.equal(stored.title, undefined);
  assert.equal((await offer(owner, n.taskId)).status, 403); assert.equal((await offer(unverified, n.taskId)).status, 403);
  assert.equal((await offer(alex, result.body.post.taskId)).status, 201); assert.equal((await storedTask(n.taskId)).status, 'HAS_OFFERS'); assert.equal((await storedTask(n.taskId)).offerCount, 1);
  assert.equal((await offer(alex, n.taskId)).status, 409);
  await db.collection('tasks').doc(n.taskId).update({ visibility: 'CARE_CIRCLE' });
  assert.equal((await call(alex, 'get', `/community/posts/${n.id}`)).body.post.taskPreview, undefined);
  await call(owner, 'post', `/tasks/${n.taskId}/cancel`, {}); const ended = await call(alex, 'get', `/community/posts/${n.id}`); assert.equal(ended.body.post.unavailable, true); assert.equal(ended.body.post.taskPreview, undefined);
});

test('public verification and circle membership gate feed/detail/comments/likes independently of UI role', async () => {
  const publicPost = await need(), circlePost = await need('CARE_CIRCLE', 'CARE_CIRCLE');
  assert.equal((await call(unverified, 'get', '/community/feed')).body.error.code, 'COMMUNITY_VERIFICATION_REQUIRED');
  assert.equal((await call(alex, 'get', `/community/posts/${circlePost.id}`)).status, 403);
  assert.equal((await call(alex, 'get', `/community/feed?careContextId=${contextId}`)).status, 403);
  const feed = await call(alex, 'get', '/community/feed'); assert.ok(feed.body.posts.some((p: any) => p.id === publicPost.id)); assert.ok(!feed.body.posts.some((p: any) => p.id === circlePost.id));
  const circleFeed = await call(circle, 'get', `/community/feed?careContextId=${contextId}`); assert.equal(circleFeed.status, 200); assert.ok(circleFeed.body.posts.some((p: any) => p.id === circlePost.id));
  assert.equal((await call(alex, 'post', `/community/posts/${circlePost.id}/comments`, { body: 'Not authorized' })).status, 403);
  assert.equal((await call(alex, 'post', `/community/posts/${circlePost.id}/like`, {})).status, 403);
  assert.equal((await call(circle, 'post', `/community/posts/${circlePost.id}/comments`, { body: 'Trusted circle comment' })).status, 201);
  await call(owner, 'patch', '/me/preferences', { lastActiveRole: 'HELPER' }); assert.equal((await call(owner, 'get', `/community/posts/${circlePost.id}`)).status, 200);
});

test('Resource projection, HTTPS validation and deterministic save/unsave remain independent of Likes', async () => {
  for (const url of ['javascript:alert(1)', 'http://example.org', 'https://user:pass@example.org']) assert.equal((await call(owner, 'post', '/resources', { title: 'Unsafe', summary: 'Text', category: 'Support', visibility: 'PUBLIC_VERIFIED', url })).status, 400);
  const r = await resource(); const p = await post(owner, { type: 'RESOURCE', resourceId: r.id, body: 'A useful guide', visibility: 'PUBLIC_VERIFIED' }); assert.equal(p.status, 201); assert.equal(p.body.resource.url, 'https://example.org/guide'); assert.equal(p.body.resource.careContextId, undefined);
  const filtered = await call(alex, 'get', '/community/feed?type=RESOURCE'); assert.ok(filtered.body.posts.every((v: any) => v.type === 'RESOURCE'));
  const saves = await Promise.all([call(alex, 'post', `/resources/${r.id}/save`, {}), call(alex, 'post', `/resources/${r.id}/save`, {})]); assert.ok(saves.every(s => s.status === 200));
  assert.equal((await db.collection('resource_saves').where('resourceId', '==', r.id).get()).size, 1); assert.equal((await db.collection('resource_saves').doc(r.id + '_' + alex.localId).get()).exists, true);
  assert.equal((await call(alex, 'get', '/me/saved-resources')).body.resources.filter((v: any) => v.id === r.id).length, 1); assert.ok(!(await call(marcus, 'get', '/me/saved-resources')).body.resources.some((v: any) => v.id === r.id));
  assert.equal((await storedPost(p.body.id)).likeCount, 0);
  await call(alex, 'post', `/resources/${r.id}/unsave`, {}); await call(alex, 'post', `/resources/${r.id}/unsave`, {}); assert.ok(!(await call(alex, 'get', '/me/saved-resources')).body.resources.some((v: any) => v.id === r.id));
});

test('archived/restricted Resources disappear from previews/saves and can be unsaved without retained access', async () => {
  const r = await resource(); const p = await post(owner, { type: 'RESOURCE', resourceId: r.id, body: 'Resource caption', visibility: 'PUBLIC_VERIFIED' });
  await call(alex, 'post', `/resources/${r.id}/save`, {}); await db.collection('resources').doc(r.id).update({ status: 'ARCHIVED' });
  assert.equal((await call(alex, 'get', `/resources/${r.id}`)).status, 404); assert.equal((await call(alex, 'post', `/resources/${r.id}/save`, {})).status, 404); assert.ok(!(await call(alex, 'get', '/me/saved-resources')).body.resources.some((v: any) => v.id === r.id));
  const preview = await call(alex, 'get', `/community/posts/${p.body.id}`); assert.equal(preview.body.post.resource, undefined); assert.equal(preview.body.post.unavailable, true);
  assert.equal((await call(alex, 'post', `/resources/${r.id}/unsave`, {})).status, 200);
});

test('concurrent duplicate Likes and Like/unlike races keep one record and an exact nonnegative count', async () => {
  const n = await need(); const base = `/community/posts/${n.id}`;
  const duplicate = await Promise.all([call(alex, 'post', base + '/like', {}), call(alex, 'post', base + '/like', {})]); assert.ok(duplicate.every(r => r.status === 200)); assert.equal((await storedPost(n.id)).likeCount, 1);
  assert.equal((await db.collection('community_likes').doc(n.id + '_' + alex.localId).get()).exists, true);
  await call(alex, 'post', base + '/unlike', {}); await call(alex, 'post', base + '/unlike', {}); assert.equal((await storedPost(n.id)).likeCount, 0);
  const race = await Promise.all([call(alex, 'post', base + '/like', {}), call(alex, 'post', base + '/unlike', {})]); assert.ok(race.every(r => r.status === 200));
  const likes = await db.collection('community_likes').where('postId', '==', n.id).get(); assert.equal((await storedPost(n.id)).likeCount, likes.size); assert.ok(likes.size <= 1);
});

test('flat concurrent comments increment exactly and reject nested/oversized content', async () => {
  const n = await need(); const base = `/community/posts/${n.id}/comments`;
  assert.equal((await call(alex, 'post', base, { body: 'Nested', parentCommentId: 'not-supported' })).status, 400);
  assert.equal((await call(alex, 'post', base, { body: 'x'.repeat(1001) })).status, 400);
  const results = await Promise.all([call(alex, 'post', base, { body: 'First comment' }), call(marcus, 'post', base, { body: 'Second comment' })]); assert.ok(results.every(r => r.status === 201)); assert.equal((await storedPost(n.id)).commentCount, 2);
  const comments = await call(alex, 'get', base); assert.equal(comments.body.comments.length, 2); assert.equal(comments.body.comments[0].postId, undefined); assert.equal(comments.body.comments[0].parentCommentId, undefined);
});

test('Shares normalize provenance, are duplicate-safe and respect destination containment', async () => {
  const n = await need(); const body = { visibility: 'PUBLIC_VERIFIED', body: 'Worth sharing' };
  const shares = await Promise.all([call(alex, 'post', `/community/posts/${n.id}/share`, body), call(alex, 'post', `/community/posts/${n.id}/share`, body)]); assert.ok(shares.every(r => r.status === 201)); assert.equal(shares[0].body.id, shares[1].body.id); assert.equal(shares[0].body.originalPostId, n.id); assert.equal(shares[0].body.originalAuthorId, owner.localId);
  const next = await call(marcus, 'post', `/community/posts/${shares[0].body.id}/share`, body); assert.equal(next.status, 201); assert.equal(next.body.originalPostId, n.id); assert.equal(next.body.original.type, 'NEED');
  assert.equal((await db.collection('community_posts').where('originalPostId', '==', n.id).get()).size, 2);
  const privatePost = await need('CARE_CIRCLE', 'CARE_CIRCLE'); assert.equal((await call(owner, 'post', `/community/posts/${privatePost.id}/share`, body)).status, 403);
});

test('Share preview loses original private content/provenance when the original is restricted or removed', async () => {
  const n = await need(); const shared = await call(alex, 'post', `/community/posts/${n.id}/share`, { visibility: 'PUBLIC_VERIFIED', body: 'Shared caption' });
  await db.collection('community_posts').doc(n.id).update({ visibility: 'CARE_CIRCLE', careContextId: contextId, body: 'PRIVATE ORIGINAL CONTENT' });
  const result = await call(alex, 'get', `/community/posts/${shared.body.id}`); assert.equal(result.status, 200); assert.equal(result.body.post.unavailable, true); assert.equal(result.body.post.original, undefined); assert.equal(result.body.post.originalAuthorId, undefined); assert.ok(!JSON.stringify(result.body).includes('PRIVATE ORIGINAL'));
  await db.collection('community_posts').doc(n.id).delete(); assert.equal((await call(alex, 'get', `/community/posts/${shared.body.id}`)).body.post.unavailable, true);
});
