// Repeatable synthetic demo fixtures, using the same public API clients as mobile.
import { createTransport } from '../apps/mobile/src/api/transport';
import { createCareApi } from '../apps/mobile/src/api/service';
import { createTaskApi } from '../apps/mobile/src/api/tasks';
import { createMarketplaceApi } from '../apps/mobile/src/api/marketplace';
import { createCommunityApi } from '../apps/mobile/src/api/community';
import { createMessagingApi } from '../apps/mobile/src/api/messaging';

async function client(name: string) {
  const response = await fetch('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${name}@team517.test`, password: 'development517', returnSecureToken: true }),
  });
  if (!response.ok) throw new Error('Run seed:marketplace against the local emulators first.');
  const user = await response.json() as { idToken: string; localId: string };
  return { uid: user.localId, request: createTransport({ baseUrl: 'http://127.0.0.1:5001/demo-team517/us-central1/api/api/v1', getToken: async () => user.idToken }) };
}
async function main() {
  const manager = await client('manager'), alex = await client('alex'), marcus = await client('marcus'), circle = await client('circle');
  const care = createCareApi(manager.request), tasks = createTaskApi(manager.request), market = createMarketplaceApi(manager.request);
  const context = (await care.listCareContexts()).careContexts.find(c => c.name === "Mom's care");
  if (!context) throw new Error('Mom’s care fixture missing. Run demo:reset.');
  const location = (await tasks.listLocations(context.id)).locations.find(l => l.label === 'Demo home');
  if (!location) throw new Error('Synthetic Demo home location missing.');
  const existing = (await tasks.listTasks(context.id)).tasks;
  const title = process.argv[2]?.trim() || 'Clinic companion for Mom · Demo';
  let task = existing.find(t => t.title === title);
  const start = new Date(); start.setDate(start.getDate() + 2); start.setHours(10, 0, 0, 0);
  if (!task) {
    const draft = await tasks.createTaskDraft(context.id, {
      title, helpType: 'COMPANIONSHIP', publicInstructions: 'Please accompany Mom to her clinic visit and help her find reception. Synthetic demo; no medical care.',
      privateInstructions: 'Synthetic arrival instruction: meet at the blue demo entrance. No real patient lives here.',
      locationId: location.id, startAt: start.toISOString(), endAt: new Date(start.getTime() + 2 * 3600000).toISOString(),
      urgency: 'PLANNED', visibility: 'VERIFIED_HELPERS', compensationType: 'VOLUNTEER',
    });
    task = await tasks.publishTask(draft.id);
  }
  if (['OPEN', 'HAS_OFFERS'].includes(task.status)) {
    for (const [helper, message] of [[alex, 'I can accompany Mom and help with check-in.'], [marcus, 'I am available as a backup for the clinic visit.']] as const) {
      const api = createMarketplaceApi(helper.request), mine = await api.getMyOffer(task.id);
      if (!mine.offer) await api.offerHelp(task.id, { message });
    }
  }
  const community = createCommunityApi(manager.request), feed = await community.getCommunityFeed();
  if (!feed.posts.some(p => p.title === 'Getting ready for a clinic visit · Demo')) {
    const resource = await community.createResource({ title: 'Clinic visit checklist · Demo', summary: 'Bring appointment details, plan transport and agree on where to meet. Synthetic demonstration resource.', category: 'Planning', visibility: 'PUBLIC_VERIFIED' });
    await community.createCommunityPost({ type: 'RESOURCE', resourceId: resource.id, title: 'Getting ready for a clinic visit · Demo', body: 'A simple planning checklist to share with your circle.', visibility: 'PUBLIC_VERIFIED' });
  }
  const messaging = createMessagingApi(circle.request);
  const conversation = await messaging.getOrCreateConversation({ scope: 'CARE_CONTEXT', careContextId: context.id, otherUserId: manager.uid });
  await messaging.sendMessage(conversation.conversation.id, { text: 'I can help coordinate Mom’s clinic visit. Let’s agree on the meeting time here.', clientMessageId: 'sprint7b-demo-welcome-v1' });
  const offers = await market.listOffers(task.id);
  console.log(`Demo ready: ${title}; status=${offers.task.status}; offers=${offers.offers.length}.`);
  console.log(`Manual Task sample: start=${start.toISOString()}, end=${new Date(start.getTime() + 2 * 3600000).toISOString()}.`);
  console.log('Repeat preparation preserves existing progress; demo:reset restores the clean two-offer baseline.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
