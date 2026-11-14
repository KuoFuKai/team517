import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
test('business Firestore rules deny unauthenticated and signed-in direct reads/writes', async () => {
  for (const host of [process.env.FIRESTORE_EMULATOR_HOST, process.env.FIREBASE_AUTH_EMULATOR_HOST]) assert.match(host ?? '', /^(127\.0\.0\.1|localhost):\d+$/, 'Emulator-only rule test');
  initializeApp({ projectId: 'demo-team517' });
  const id = 'rules-' + crypto.randomUUID(), ref = getFirestore().collection('tasks').doc(id);
  await ref.set({ id, privateInstructions: 'Synthetic private fixture for rule denial.' });
  try {
    const signUp = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${id}@example.test`, password: 'testing123', returnSecureToken: true }) });
    assert.equal(signUp.status, 200); const { idToken } = await signUp.json() as { idToken: string };
    for (const collection of ['tasks','point_accounts','point_transactions']) {
    const url = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-team517/databases/(default)/documents/${collection}/${id}`;
    for (const token of [undefined, idToken]) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) };
      assert.equal((await fetch(url, { headers })).status, 403);
      assert.equal((await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ fields: { title: { stringValue: 'Forbidden direct write' } } }) })).status, 403);
    }
    }
  } finally { await ref.delete(); }
});
