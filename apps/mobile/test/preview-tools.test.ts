import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertDeploymentUserEnvironment, assertPreviewTarget, PREVIEW_CONTEXT_ID, PREVIEW_LOCATION_ID } from '../../../scripts/preview-policy';
import { conversationSchema } from '../../../functions/src/validation/messaging';
import { draftSchema } from '../../../functions/src/validation/tasks';
import { readFileSync } from 'node:fs';
test('cloud indexes support the existing filtered rating aggregate used by Offer summaries', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../../firebase/firestore.indexes.json', import.meta.url), 'utf8'));
  assert.ok(manifest.indexes.some((index: any) => index.collectionGroup === 'reviews' && index.queryScope === 'COLLECTION' && index.fields.length === 2 && index.fields[0].fieldPath === 'revieweeId' && index.fields[0].order === 'ASCENDING' && index.fields[1].fieldPath === 'rating' && index.fields[1].order === 'ASCENDING'));
});
test('Preview fixture identifiers satisfy existing product API contracts', () => {
  assert.match(PREVIEW_CONTEXT_ID, /^[A-Za-z0-9]{20}$/);
  assert.match(PREVIEW_LOCATION_ID, /^[A-Za-z0-9]{20}$/);
  assert.doesNotThrow(() => conversationSchema.parse({ scope: 'CARE_CONTEXT', careContextId: PREVIEW_CONTEXT_ID, otherUserId: 'team517_preview_manager' }));
  assert.doesNotThrow(() => draftSchema.parse({ locationId: PREVIEW_LOCATION_ID }));
});
test('deployment refuses runtime ADC and legacy token overrides while admin preparation remains independent', () => {
  assert.throws(() => assertDeploymentUserEnvironment({ GOOGLE_APPLICATION_CREDENTIALS: 'backend-only.json' }));
  assert.throws(() => assertDeploymentUserEnvironment({ FIREBASE_TOKEN: 'sentinel' }));
  assert.doesNotThrow(() => assertDeploymentUserEnvironment({}));
  assert.doesNotThrow(() => assertPreviewTarget('team517-dev', { GOOGLE_APPLICATION_CREDENTIALS: 'backend-only.json' }));
});
test('cloud preparation refuses every non-allowlisted target, CI and emulators before SDK access', () => {
  for (const target of [undefined, 'demo-team517', 'team517-production', 'other-project']) assert.throws(() => assertPreviewTarget(target, {}));
  for (const env of [{ CI: 'true' }, { FIRESTORE_EMULATOR_HOST: 'localhost:8280' }, { FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9199' }, { GOOGLE_CLOUD_PROJECT: 'production' }, { EXPO_PUBLIC_APP_ENV: 'PRODUCTION' }, { EXPO_PUBLIC_APP_ENV: 'production' }]) assert.throws(() => assertPreviewTarget('team517-dev', env));
  assert.doesNotThrow(() => assertPreviewTarget('team517-dev', {}));
});
