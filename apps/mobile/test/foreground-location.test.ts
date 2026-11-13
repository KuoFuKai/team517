import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createForegroundLocator } from '../src/utils/foreground-location';
test('denied location never reads GPS and never repeatedly prompts during the session', async () => {
  let prompts = 0, reads = 0;
  const denied = { granted: false, canAskAgain: true };
  const locate = createForegroundLocator({ permission: async () => denied, requestPermission: async () => { prompts++; return denied; }, position: async () => { reads++; throw Error(); } });
  assert.deepEqual(await locate(), { status: 'DENIED' }); assert.deepEqual(await locate(), { status: 'DENIED' });
  assert.equal(prompts, 1); assert.equal(reads, 0);
});
test('already granted permission takes exactly one foreground reading without a prompt', async () => {
  let reads = 0;
  const locate = createForegroundLocator({ permission: async () => ({ granted: true, canAskAgain: true }), requestPermission: async () => { throw Error('must not prompt'); }, position: async () => { reads++; return { coords: { latitude: 40.75, longitude: -73.96 } }; } });
  assert.deepEqual(await locate(), { status: 'AVAILABLE', coordinate: { latitude: 40.75, longitude: -73.96 } }); assert.equal(reads, 1);
});
test('location error or timeout yields a non-blocking unavailable state', async () => {
  const permission = async () => ({ granted: true, canAskAgain: true });
  const error = createForegroundLocator({ permission, requestPermission: permission, position: async () => { throw Error('provider unavailable'); } });
  assert.deepEqual(await error(), { status: 'UNAVAILABLE' });
  const timeout = createForegroundLocator({ permission, requestPermission: permission, position: () => new Promise(() => {}) }, 5);
  assert.deepEqual(await timeout(), { status: 'UNAVAILABLE' });
});
