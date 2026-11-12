import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase-admin/firestore';
import { pushPayload, configuredPushProvider, FcmPushProvider } from '../src/push/provider';
import { registerDeviceSchema } from '../src/api/push-routes';
import type { Notification } from '../src/domain/support';
test('push payload is an allowlist projection, never persisted private content', () => {
  const types = ['OFFER_RECEIVED', 'HELPER_SELECTED', 'ASSIGNMENT_CONFIRMED', 'ASSIGNMENT_DECLINED', 'ASSIGNMENT_CANCELLED', 'COMPLETION_REQUESTED', 'TASK_COMPLETED', 'COMPLETION_DISPUTED', 'NEW_MESSAGE'] as const;
  for (const type of types) {
    const n: Notification = { id: 'n', recipientId: 'private-recipient', type, resourceType: type === 'NEW_MESSAGE' ? 'CONVERSATION' : 'ASSIGNMENT', resourceId: 'r', title: 'SECRET ADDRESS', body: 'SECRET MESSAGE MEDICAL INSTRUCTIONS', createdAt: Timestamp.now() };
    const payload = pushPayload(n)!;
    assert.deepEqual(Object.keys(payload.data).sort(), ['notificationId', 'resourceId', 'resourceType']);
    assert.ok(!JSON.stringify(payload).includes('SECRET')); assert.ok(!JSON.stringify(payload).includes('private-recipient'));
  }
  assert.equal(pushPayload({ type: 'TASK_STARTED' } as Notification), undefined);
});
test('token registration rejects client ownership and unsupported platform', () => {
  assert.ok(registerDeviceSchema.safeParse({ token: 'fcm_valid_token_for_test_123', platform: 'android' }).success);
  for (const extra of [{ userId: 'other' }, { enabled: true }, { registrationId: 'x' }]) assert.ok(!registerDeviceSchema.safeParse({ token: 'fcm_valid_token_for_test_123', platform: 'android', ...extra }).success);
  assert.ok(!registerDeviceSchema.safeParse({ token: 'tiny', platform: 'android' }).success);
  assert.ok(!registerDeviceSchema.safeParse({ token: 'fcm_valid_token_for_test_123', platform: 'ios' }).success);
});
test('provider defaults disabled without explicit real-mode configuration', () => { assert.equal(configuredPushProvider(), undefined); });
test('FCM adapter isolates errors and only explicit token errors disable registrations', async () => {
  const payload = { notification: { title: 'team517', body: 'Update' }, data: { notificationId: 'n', resourceType: 'TASK', resourceId: 't' } };
  assert.equal(await new FcmPushProvider(async () => {}).send('fake', payload), 'SENT');
  for (const code of ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token']) assert.equal(await new FcmPushProvider(async () => { throw { code }; }).send('fake', payload), 'INVALID');
  for (const code of ['messaging/invalid-argument', 'messaging/server-unavailable', 'messaging/authentication-error']) assert.equal(await new FcmPushProvider(async () => { throw { code }; }).send('fake', payload), 'FAILED');
});
test('CI prevents real delivery even with all explicit FCM switches present', () => {
  const keys = ['CI', 'PUSH_PROVIDER', 'FCM_PROJECT_ID', 'PUSH_ALLOW_EMULATOR_FCM'] as const;
  const old = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  try {
    process.env.CI = 'true'; process.env.PUSH_PROVIDER = 'fcm'; process.env.FCM_PROJECT_ID = 'test-project'; process.env.PUSH_ALLOW_EMULATOR_FCM = 'true';
    assert.equal(configuredPushProvider(), undefined);
  } finally { for (const key of keys) { if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key]; } }
});
