// Backend/admin only. No reset endpoint, wildcard deletion or cloud test-suite reuse.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { assertPreviewTarget, PREVIEW_PROJECT, PREVIEW_API, PREVIEW_CONTEXT_ID, PREVIEW_LOCATION_ID } from './preview-policy';
import { membershipId } from '../functions/src/repositories/store';
import { createTransport } from '../apps/mobile/src/api/transport';
import { createTaskApi } from '../apps/mobile/src/api/tasks';
import { createMarketplaceApi } from '../apps/mobile/src/api/marketplace';
import { createCommunityApi } from '../apps/mobile/src/api/community';
import { createMessagingApi } from '../apps/mobile/src/api/messaging';
type Credentials = { project: string; accounts: Record<string, { email: string; password: string }> };
async function main() {
  const args = process.argv.slice(2), option = (key: string) => args[args.indexOf(key) + 1];
  if (args.some((arg, i) => i % 2 === 0 && !['--project', '--task-title'].includes(arg)) || args.length % 2) throw new Error('Usage: preview:prepare -- --project team517-dev [--task-title "unique published title"]');
  const project = args.includes('--project') ? option('--project') : undefined;
  assertPreviewTarget(project);
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error('Supply the external backend credential through GOOGLE_APPLICATION_CREDENTIALS.');
  if ((await fetch(PREVIEW_API + '/health')).status !== 200) throw new Error('Deploy and verify the Preview API before preparing any cloud fixtures.');
  initializeApp({ projectId: PREVIEW_PROJECT, credential: applicationDefault() });
  const auth = getAuth(), db = getFirestore(), now = Timestamp.now();
  const file = '.tools/preview-credentials.json'; mkdirSync('.tools', { recursive: true });
  const credentials: Credentials = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { project: PREVIEW_PROJECT, accounts: {} };
  if (credentials.project !== PREVIEW_PROJECT) throw new Error('Credential receipt project mismatch.');
  const accounts = [
    { name: 'manager', roles: ['CARE_MANAGER', 'HELPER'], verified: true },
    { name: 'alex', roles: ['HELPER'], verified: true }, { name: 'marcus', roles: ['HELPER'], verified: true },
    { name: 'circle', roles: ['HELPER'], verified: false },
  ];
  const uid = (name: string) => 'team517_preview_' + name;
  // Validate existing identities before changing anything; never take over an unrelated account.
  for (const account of accounts) {
    const existing = await auth.getUserByEmail(`${account.name}@team517.test`).catch(e => { if (e.code !== 'auth/user-not-found') throw e; return undefined; });
    if (existing && existing.uid !== uid(account.name)) throw new Error('Synthetic email is already owned by an unexpected UID; no takeover performed.');
    if (existing && !credentials.accounts[account.name]) throw new Error('Existing preview login receipt missing; use a deliberate account recovery, not an automatic password reset.');
  }
  const createMissing = async (collection: string, id: string, value: Record<string, unknown>, owner?: string) => {
    const ref = db.collection(collection).doc(id);
    await db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (!existing.exists) tx.create(ref, value);
      else if (existing.data()!.id !== id || (owner && existing.data()!.createdBy !== owner)) throw new Error('Existing fixture ownership mismatch; no overwrite performed.');
      else if (value.status === 'ACTIVE' && existing.data()!.status !== 'ACTIVE') throw new Error('Existing fixture is inactive; no automatic relationship restoration performed.');
    });
  };
  for (const account of accounts) {
    const email = `${account.name}@team517.test`;
    if (!credentials.accounts[account.name]) {
      credentials.accounts[account.name] = { email, password: randomBytes(18).toString('base64url') };
      writeFileSync(file, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    }
    const existing = await auth.getUser(uid(account.name)).catch(e => { if (e.code !== 'auth/user-not-found') throw e; return undefined; });
    if (!existing) await auth.createUser({ uid: uid(account.name), email, password: credentials.accounts[account.name].password });
    else if (existing.email !== email) throw new Error('Preview UID/email mismatch.');
    await createMissing('users', uid(account.name), { id: uid(account.name), roles: account.roles, primaryOnboardingRole: account.roles[0], lastActiveRole: account.roles[0], verificationStatus: account.verified ? 'VERIFIED' : 'UNVERIFIED', onboardingStatus: 'STARTED', createdAt: now, updatedAt: now });
    const profile = (await db.collection('users').doc(uid(account.name)).get()).data()!;
    if (profile.verificationStatus !== (account.verified ? 'VERIFIED' : 'UNVERIFIED') || account.roles.some(role => !profile.roles?.includes(role))) throw new Error('Existing synthetic trust/role state differs; no client self-verification or automatic override performed.');
  }
  const owner = uid('manager'), context = PREVIEW_CONTEXT_ID;
  await createMissing('care_contexts', context, { id: context, name: "Mom's care", createdBy: owner, status: 'ACTIVE', createdAt: now, updatedAt: now }, owner);
  for (const name of ['manager', 'circle']) {
    const id = membershipId(context, uid(name));
    await createMissing('care_context_members', id, { id, careContextId: context, userId: uid(name), role: name === 'manager' ? 'CARE_MANAGER' : 'HELPER', status: 'ACTIVE', joinedAt: now });
  }
  const place = PREVIEW_LOCATION_ID;
  await createMissing('locations', place, { id: place, careContextId: context, label: 'Demo meeting place', formattedAddress: 'SYNTHETIC DEMO ADDRESS — NOT A REAL HOME', latitude: 40.75283, longitude: -73.95743, createdBy: owner, createdAt: now, updatedAt: now }, owner);
  // Same product clients/API, never a parallel marketplace or direct Offer write.
    const google = JSON.parse(readFileSync('apps/mobile/google-services.json', 'utf8'));
    if (google.project_info?.project_id !== PREVIEW_PROJECT) throw new Error('Android client project mismatch.');
    const android = google.client.find((c: any) => c.client_info?.android_client_info?.package_name === 'edu.cornelltech.team517');
    if (!android) throw new Error('Android client configuration missing.');
    const key = android.api_key[0].current_key;
    const client = async (name: string) => {
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(key), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...credentials.accounts[name], returnSecureToken: true }) });
      if (!response.ok) throw new Error('Preview account sign-in failed; no token was logged.');
      const { idToken } = await response.json() as { idToken: string };
      return createTransport({ baseUrl: PREVIEW_API, getToken: async () => idToken });
    };
  const request = await client('manager');
  const community = createCommunityApi(request);
  if (!(await community.getCommunityFeed()).posts.some(p => p.title === 'Preview clinic planning checklist')) {
    const resource = await community.createResource({ title: 'Preview clinic checklist', summary: 'Synthetic planning example: agree on the appointment time, transport and meeting place. No medical records.', category: 'Planning', visibility: 'PUBLIC_VERIFIED' });
    await community.createCommunityPost({ type: 'RESOURCE', resourceId: resource.id, title: 'Preview clinic planning checklist', body: 'Synthetic Product Studio demo resource.', visibility: 'PUBLIC_VERIFIED' });
  }
  const messaging = createMessagingApi(await client('circle'));
  const conversation = await messaging.getOrCreateConversation({ scope: 'CARE_CONTEXT', careContextId: context, otherUserId: owner });
  await messaging.sendMessage(conversation.conversation.id, { text: 'Synthetic Preview: let’s coordinate Mom’s clinic visit here.', clientMessageId: 'team517-preview-welcome-v1' });
  if (args.includes('--task-title')) {
    const list = (await createTaskApi(request).listTasks(context)).tasks.filter(t => t.title === option('--task-title'));
    if (list.length !== 1 || !['OPEN', 'HAS_OFFERS'].includes(list[0].status)) throw new Error('Require exactly one already-published, offerable Task with that title; no Task is created automatically.');
    for (const name of ['alex', 'marcus']) {
      const market = createMarketplaceApi(await client(name)), mine = await market.getMyOffer(list[0].id);
      if (!mine.offer) await market.offerHelp(list[0].id, { message: name === 'alex' ? 'I can accompany Mom and help with check-in.' : 'I am available as a backup for the clinic visit.' });
    }
  }
  console.log('Preview synthetic baseline prepared in team517-dev. No Task created, no database wipe, no existing lifecycle rewound.');
  console.log('Synthetic login passwords are saved only in ignored .tools/preview-credentials.json; do not commit/share it publicly.');
}
main().catch(error => { console.error('Preview preparation stopped:', (error as { code?: string }).code ?? (error as Error).message); process.exitCode = 1; });
