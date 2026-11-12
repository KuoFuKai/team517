import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveEnvironment, resolveFirebaseClient, previewApiUrl } from '../src/environment';
test('LOCAL preserves emulator ports, legacy environment and Android guest host', () => {
  const local = resolveEnvironment({ environment: 'development', developmentHost: '10.0.2.2' });
  assert.equal(local.environment, 'LOCAL'); assert.equal(local.authEmulatorUrl, 'http://10.0.2.2:9199');
  assert.match(local.apiUrl, /10\.0\.2\.2:5001\/demo-team517/); assert.equal(local.useEmulators, true);
});
test('PREVIEW is isolated from local endpoints and fails closed on wrong project or production', () => {
  const preview = resolveEnvironment({ environment: 'PREVIEW' });
  assert.equal(preview.apiUrl, previewApiUrl); assert.equal(preview.authEmulatorUrl, undefined); assert.equal(preview.useEmulators, false);
  for (const apiUrl of ['http://localhost:5001', 'http://10.0.2.2:5001', 'https://other.example/api', previewApiUrl + '?override=1']) assert.throws(() => resolveEnvironment({ environment: 'PREVIEW', apiUrl }));
  assert.throws(() => resolveEnvironment({ environment: 'PREVIEW', authEmulatorUrl: 'http://localhost:9199' }));
  assert.throws(() => resolveEnvironment({ environment: 'PRODUCTION' }));
  assert.throws(() => resolveFirebaseClient('PREVIEW', { projectId: 'demo-team517' }));
  assert.equal(resolveFirebaseClient('PREVIEW', { projectId: 'team517-dev', apiKey: 'public-client-key', appId: 'client-app-id', authDomain: 'team517-dev.firebaseapp.com' }).projectId, 'team517-dev');
});
