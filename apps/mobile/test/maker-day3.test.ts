import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowMakerDay3, makerDay3Person } from '../src/demo/maker-day3-policy';
const local = { environment: 'LOCAL', firebaseProjectId: 'demo-team517', useEmulators: true, apiUrl: 'http://10.0.2.2:5001/demo-team517/us-central1/api/api/v1' };
test('fictional identities require an explicit local-only emulator scenario', () => {
  assert.equal(allowMakerDay3(local, 'maker-day-3'), true);
  assert.equal(allowMakerDay3(local), false);
  for (const invalid of [{ environment: 'PREVIEW' }, { firebaseProjectId: 'team517-dev' }, { useEmulators: false }, { apiUrl: 'https://example.com/api/v1' }]) assert.equal(allowMakerDay3({ ...local, ...invalid }, 'maker-day-3'), false);
});
test('names only resolve known fictional scenario users, never arbitrary real IDs', () => {
  assert.equal(makerDay3Person('md3MarcusChen', true)?.name, 'Marcus Chen');
  assert.equal(makerDay3Person('md3LenaWu', true)?.relationship, 'Family friend');
  assert.equal(makerDay3Person('md3MarcusChen', false), undefined);
  assert.equal(makerDay3Person('some-real-user', true), undefined);
});
