import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPushApi } from '../src/api/push';
import { createTransport } from '../src/api/transport';
import { PushRegistration } from '../src/push/registration';
import { resolvePushNotification } from '../src/push/resolve';
import { acquirePushToken } from '../src/push/acquire';
import type { DeviceTokenDto } from '@team517/contracts';
const record = (id: string): DeviceTokenDto => ({ id, platform: 'android', enabled: true, registrationId: 'generation-' + id, lastSeenAt: '2026-11-09T00:00:00Z' });
test('push client uses authenticated API for own registration/status/disable and notification lookup', async () => {
  const calls: { url: string; body: unknown; method: string }[] = [];
  const api = createPushApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'auth-token', fetcher: async (url, options) => {
    assert.equal((options!.headers as Record<string, string>).Authorization, 'Bearer auth-token');
    calls.push({ url: String(url), body: options?.body ? JSON.parse(String(options.body)) : undefined, method: options!.method! }); return Response.json({});
  } }));
  await api.registerDeviceToken({ token: 'native-fcm-token', platform: 'android' }); await api.getDeviceToken('a/b');
  await api.disableDeviceToken('a/b', { registrationId: 'generation' }); await api.getNotification('n/b');
  assert.deepEqual(calls.map(c => [c.method, c.url.replace('http://example.test/api/v1', '')]), [['POST', '/me/device-tokens'], ['GET', '/me/device-tokens/a%2Fb'], ['POST', '/me/device-tokens/a%2Fb/disable'], ['GET', '/notifications/n%2Fb']]);
  assert.deepEqual(calls[0].body, { token: 'native-fcm-token', platform: 'android' });
  assert.deepEqual(calls[2].body, { registrationId: 'generation' });
});
test('stale registration is cleaned with captured A identity before B registration', async () => {
  const manager = new PushRegistration(), operations: string[] = [];
  let activeA = true, release!: () => void;
  const wait = new Promise<void>(r => { release = r; });
  const a = manager.register('A', () => activeA, async () => { operations.push('registerA'); await wait; return record('A'); }, async () => { operations.push('disableA'); });
  await new Promise(resolve => setImmediate(resolve)); activeA = false;
  const logout = manager.disable('A');
  const b = manager.register('B', () => true, async () => { operations.push('registerB'); return record('B'); }, async () => { operations.push('disableB'); });
  release(); await Promise.all([a, logout, b]);
  assert.deepEqual(operations, ['registerA', 'disableA', 'registerB']);
  await manager.disable('A'); assert.deepEqual(operations, ['registerA', 'disableA', 'registerB']);
});
test('cleanup failure cannot prevent logout or subsequent account registration', async () => {
  const manager = new PushRegistration();
  await manager.register('A', () => true, async () => record('A'), async () => { throw new Error('offline'); });
  await manager.disable('A');
  assert.equal((await manager.register('B', () => true, async () => record('B'), async () => {}))?.id, 'B');
  let called = false;
  await manager.register('old', () => false, async () => { called = true; return record('old'); }, async () => {});
  assert.equal(called, false);
});
test('tap resolves owned notification then currently authorized resource; failures never route', async () => {
  const calls: string[] = [];
  const reader = {
    getNotification: async (id: string) => { calls.push('notification:' + id); return { id, resourceType: 'CONVERSATION', resourceId: 'server-authorized-id' } as import('@team517/contracts').NotificationDto; },
    getConversation: async (id: string) => { calls.push('conversation:' + id); return {}; },
    getAssignment: async () => { throw new Error('wrong route'); }, getTask: async () => { throw new Error('wrong route'); },
  };
  assert.deepEqual(await resolvePushNotification('safe-notification-id', reader), { kind: 'CONVERSATION', id: 'server-authorized-id' });
  assert.deepEqual(calls, ['notification:safe-notification-id', 'conversation:server-authorized-id']);
  await assert.rejects(resolvePushNotification('another-account-id', { ...reader, getNotification: async () => { throw new Error('forbidden'); } }), /forbidden/);
  await assert.rejects(resolvePushNotification('stale', { ...reader, getConversation: async () => { throw new Error('unavailable'); } }), /unavailable/);
});
test('Task and Assignment taps fetch current resource DTOs instead of trusting push data', async () => {
  for (const resourceType of ['TASK', 'ASSIGNMENT'] as const) {
    const calls: string[] = [];
    const resource = { id: 'current-resource', status: resourceType === 'TASK' ? 'OPEN' : 'PENDING_CONFIRMATION' };
    const destination = await resolvePushNotification('n', {
      getNotification: async () => ({ id: 'n', resourceType, resourceId: 'current-resource' } as import('@team517/contracts').NotificationDto),
      getConversation: async () => { throw new Error('wrong route'); },
      getAssignment: async id => { calls.push(id); return resource as import('@team517/contracts').AssignmentDto; },
      getTask: async id => { calls.push(id); return resource as import('@team517/contracts').TaskDetailDto; },
    });
    assert.equal(destination.kind, resourceType); assert.deepEqual(calls, ['current-resource']);
  }
});
test('native token refresh consumes the supplied token without re-entering Expo getter; denial never acquires a token', async () => {
  let prompts = 0, getters = 0;
  let granted = false;
  const native = {
    getPermissionsAsync: async () => ({ granted }),
    requestPermissionsAsync: async () => { prompts++; return { granted }; },
    getDevicePushTokenAsync: async () => { getters++; return { data: 'native-original' }; },
  };
  assert.equal((await acquirePushToken(null, true)).state, 'unavailable');
  assert.equal((await acquirePushToken(native, false)).state, 'denied'); assert.equal(prompts, 0); assert.equal(getters, 0);
  assert.equal((await acquirePushToken(native, true)).state, 'denied'); assert.equal(prompts, 1); assert.equal(getters, 0);
  granted = true;
  assert.equal((await acquirePushToken(native, false, 'rotated-token')).token, 'rotated-token'); assert.equal(getters, 0);
  assert.equal((await acquirePushToken(native, false)).token, 'native-original'); assert.equal(getters, 1);
});
