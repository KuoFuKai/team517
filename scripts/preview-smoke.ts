import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertPreviewTarget, PREVIEW_PROJECT, PREVIEW_API, PREVIEW_CONTEXT_ID, PREVIEW_LOCATION_ID } from './preview-policy';
import { createTransport } from '../apps/mobile/src/api/transport';
import { createCareApi } from '../apps/mobile/src/api/service';
import { createTaskApi } from '../apps/mobile/src/api/tasks';
import { createCommunityApi } from '../apps/mobile/src/api/community';
import { createMessagingApi } from '../apps/mobile/src/api/messaging';
import { createSupportApi } from '../apps/mobile/src/api/support';
import { createPushApi } from '../apps/mobile/src/api/push';
import { createMarketplaceApi } from '../apps/mobile/src/api/marketplace';
async function main() {
  assertPreviewTarget(process.argv[process.argv.indexOf('--project') + 1]);
  const credentials = JSON.parse(readFileSync('.tools/preview-credentials.json', 'utf8'));
  const google = JSON.parse(readFileSync('apps/mobile/google-services.json', 'utf8'));
  assert.equal(credentials.project, PREVIEW_PROJECT); assert.equal(google.project_info.project_id, PREVIEW_PROJECT);
  const key = google.client.find((c: any) => c.client_info.android_client_info.package_name === 'edu.cornelltech.team517').api_key[0].current_key;
  assert.equal((await fetch(PREVIEW_API + '/health')).status, 200);
  const client = async (name: string) => {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(key), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...credentials.accounts[name], returnSecureToken: true }) });
    assert.equal(response.status, 200, 'Real Preview Auth sign-in');
    const { idToken } = await response.json() as { idToken: string };
    return { request: createTransport({ baseUrl: PREVIEW_API, getToken: async () => idToken }), idToken };
  };
  const { request: manager, idToken } = await client('manager'), care = createCareApi(manager), tasks = createTaskApi(manager);
  assert.equal((await care.getCurrentUser()).id, 'team517_preview_manager');
  const context = (await care.listCareContexts()).careContexts.find(c => c.id === PREVIEW_CONTEXT_ID);
  assert.ok(context);
  const title = 'Preview smoke — synthetic draft';
  const existing = (await tasks.listTasks(context.id)).tasks.filter(t => t.title === title);
  assert.ok(existing.length <= 1 && existing.every(t => t.status === 'DRAFT'), 'Never modify a progressed or ambiguous Task');
  const draft = existing[0] ?? await tasks.createTaskDraft(context.id, { title });
  await tasks.updateTaskDraft(draft.id, { title }); assert.equal((await tasks.getTask(draft.id)).status, 'DRAFT');
  const direct = `https://firestore.googleapis.com/v1/projects/${PREVIEW_PROJECT}/databases/(default)/documents/tasks/${draft.id}`;
  for (const token of [undefined, idToken]) {
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) };
    assert.equal((await fetch(direct, { headers })).status, 403, 'Deployed rules deny direct business read');
    assert.equal((await fetch(direct + '?updateMask.fieldPaths=title', { method: 'PATCH', headers, body: JSON.stringify({ fields: { title: { stringValue: title } } }) })).status, 403, 'Deployed rules deny direct business write');
  }
  // A distinct labelled probe, never the presenter's manually created clinic Task.
  const probeTitle = 'Preview smoke — synthetic offer probe';
  const probes = (await tasks.listTasks(context.id)).tasks.filter(t => t.title === probeTitle);
  assert.ok(probes.length <= 1, 'Refuse ambiguous probe');
  let probe = probes[0] ? await tasks.getTask(probes[0].id) : await tasks.createTaskDraft(context.id, { title: probeTitle });
  if (probe.status === 'DRAFT') {
    const start = new Date(Date.now() + 86400000);
    await tasks.updateTaskDraft(probe.id, { helpType: 'Synthetic smoke check', publicInstructions: 'Synthetic API check only; not a real request for care.', privateInstructions: 'SYNTHETIC PRIVATE PROBE', locationId: PREVIEW_LOCATION_ID, startAt: start.toISOString(), endAt: new Date(start.getTime() + 3600000).toISOString(), urgency: 'PLANNED', visibility: 'VERIFIED_HELPERS', compensationType: 'VOLUNTEER' });
    probe = await tasks.publishTask(probe.id);
  }
  assert.ok(['OPEN', 'HAS_OFFERS'].includes(probe.status), 'Never rewind a progressed probe');
  const helper = createMarketplaceApi((await client('alex')).request);
  const discovered = await helper.discoverTasks();
  assert.ok(!discovered.tasks.some(t => t.id === draft.id), 'Private draft excluded from discovery');
  assert.ok(discovered.tasks.some(t => t.id === probe.id), 'Published probe discoverable');
  const detail = await helper.getDiscoveredTask(probe.id);
  const safe = JSON.stringify(detail);
  assert.ok(!safe.includes('SYNTHETIC DEMO ADDRESS') && !safe.includes('SYNTHETIC PRIVATE PROBE'), 'Discovery excludes exact address/private instructions');
  const previous = (await helper.getMyOffer(probe.id)).offer;
  assert.ok(!previous || previous.status === 'ACTIVE', 'Do not reactivate progressed probe Offer');
  const offer = previous ?? await helper.offerHelp(probe.id, { message: 'Synthetic Preview smoke Offer; not a real commitment.' });
  assert.equal(offer.status, 'ACTIVE');
  assert.ok((await createMarketplaceApi(manager).listOffers(probe.id)).offers.some(o => o.id === offer.id), 'Owner sees the helper Offer');
  await createCommunityApi(manager).getCommunityFeed();
  const messaging = createMessagingApi((await client('circle')).request);
  const conversation = await messaging.getOrCreateConversation({ scope: 'CARE_CONTEXT', careContextId: context.id, otherUserId: 'team517_preview_manager' });
  await messaging.sendMessage(conversation.conversation.id, { text: 'Synthetic Preview cloud smoke message.', clientMessageId: 'team517-preview-smoke-message-v1' });
  await messaging.getConversation(conversation.conversation.id);
  await createSupportApi(manager).getNotifications();
  const push = createPushApi(manager);
  const registration = await push.registerDeviceToken({ token: 'team517_preview_disabled_contract_smoke_token', platform: 'android', deliveryEnabled: false });
  assert.equal((await push.getDeviceToken(registration.id)).enabled, false);
  await push.disableDeviceToken(registration.id, { registrationId: registration.registrationId });
  console.log('PASS Preview cloud: health, real Auth, me, draft read/update, direct Firestore denial, privacy-safe Discovery, Offer, owner Offer list, Community, Messaging, Notifications, disabled device-registration contract.');
  console.log('Labelled synthetic Draft/offer probe/Message remain; no main clinic Task or wildcard deletion. Disabled synthetic registration does NOT prove native FCM delivery.');
}
main().catch(error => { console.error('Preview cloud smoke stopped:', (error as { code?: string }).code ?? (error as Error).message); process.exitCode = 1; });
