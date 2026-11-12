import { assertDeploymentUserEnvironment, assertPreviewTarget, PREVIEW_PROJECT } from './preview-policy';
// Deployment uses the Firebase CLI Google user, never the runtime Admin/FCM ADC.
export async function checkPreview() {
  assertPreviewTarget(process.argv[process.argv.indexOf('--project') + 1]);
  assertDeploymentUserEnvironment();
  const auth = require('firebase-tools/lib/auth');
  const { requireAuth } = require('firebase-tools/lib/requireAuth');
  const { Client } = require('firebase-tools/lib/apiv2');
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI Google-user login required.');
  await requireAuth({ ...account, project: PREVIEW_PROJECT });
  console.log('Deployment user:', account.user.email, '| Blaze: owner-confirmed enabled (no Billing API probe)');
  const read = async (origin: string, path: string) => {
    try { return { ok: true, body: (await new Client({ urlPrefix: origin }).get(path)).body }; }
    catch (error: any) { console.log('Readiness check:', error.message); return { ok: false, body: {} }; }
  };
  let ready = true;
  const services = ['cloudfunctions.googleapis.com', 'cloudbuild.googleapis.com', 'artifactregistry.googleapis.com', 'run.googleapis.com', 'eventarc.googleapis.com', 'pubsub.googleapis.com', 'firestore.googleapis.com', 'firebaserules.googleapis.com', 'identitytoolkit.googleapis.com', 'fcm.googleapis.com', 'storage.googleapis.com'];
  for (const service of services) {
    const result = await read('https://serviceusage.googleapis.com', `/v1/projects/628775953070/services/${service}`);
    const enabled = result.ok && result.body.state === 'ENABLED'; ready &&= enabled;
    console.log(service + ': ' + (enabled ? 'ENABLED' : 'NOT READY'));
  }
  const database = await read('https://firestore.googleapis.com', `/v1/projects/${PREVIEW_PROJECT}/databases/(default)`);
  const authConfig = await read('https://identitytoolkit.googleapis.com', `/admin/v2/projects/${PREVIEW_PROJECT}/config`);
  const databaseReady = database.ok && database.body.type === 'FIRESTORE_NATIVE';
  const authReady = authConfig.ok && authConfig.body.signIn?.email?.enabled && authConfig.body.signIn?.email?.passwordRequired;
  console.log('Native Firestore default database:', Boolean(databaseReady), '| Email/password Auth:', Boolean(authReady));
  console.log('Read-only user preflight; no billing/IAM changes.');
  return ready && databaseReady && authReady;
}
if (process.argv[1]?.endsWith('preview-check.ts')) checkPreview().then(ready => { if (!ready) process.exitCode = 2; }).catch(error => { console.error('Preview preflight stopped:', (error as Error).message); process.exitCode = 1; });
