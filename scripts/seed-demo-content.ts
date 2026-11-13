// Fictional Preview content only. Normal authenticated APIs own all business writes.
// Covers/personas are bundled presentation data for these exact public fixture IDs.
import { readFileSync, writeFileSync } from 'node:fs';
import { createTransport } from '../apps/mobile/src/api/transport';
import { createTaskApi } from '../apps/mobile/src/api/tasks';
import { createCommunityApi } from '../apps/mobile/src/api/community';
import { createMarketplaceApi } from '../apps/mobile/src/api/marketplace';
import { PREVIEW_API, PREVIEW_PROJECT, PREVIEW_CONTEXT_ID, assertPreviewTarget } from './preview-policy';
const scenarios = [
  { key: 'planning', title: 'Company for Mom’s appointment', helpType: 'Clinic companion', description: 'Meet Mom in the clinic lobby, help her find reception, and keep her company during the visit. No medical care or driving needed.', area: 'Clinic lobby · Roosevelt Island', latitude: 40.7624, longitude: -73.9512,
    post: 'A simple plan for appointment day', body: 'The most useful help is often the small stuff: knowing where to meet, who is staying, and who will send the update afterward. We keep those three things in one place so nobody has to guess.', summary: 'Before the day, agree on a meeting point, the time window, and one person to message if plans change. Bring only the information needed for the appointment.', category: 'Planning', author: 'manager', name: 'Grace Chen', comment: 'Agreeing on who sends the update makes the whole day feel calmer.' },
  { key: 'groceries', title: 'Pick up a few groceries', helpType: 'Errands & shopping', description: 'Pick up fruit, milk, bread, and a few vegetables from the neighborhood market. The list will be ready; we can coordinate the handoff by message.', area: 'Neighborhood market · Upper East Side', latitude: 40.7754, longitude: -73.9541,
    post: 'A small grocery list makes a big difference', body: '“Let me know if you need anything” is kind, but a short list is much easier to act on. This week we’re trying a shared list with just the essentials, so a quick errand can actually stay quick.', summary: 'Keep a short essentials list, confirm quantities before shopping, and agree on a handoff time. Ask before substituting anything unfamiliar.', category: 'Everyday support', author: 'alex', name: 'Alex Morgan', comment: 'A photo of the preferred item can save a lot of back-and-forth.' },
  { key: 'meal', title: 'Drop off a warm dinner', helpType: 'Meals & cooking', description: 'Bring a simple dinner for two and leave it at the agreed handoff point. Please check food preferences with the requester before preparing anything.', area: 'Community kitchen · Midtown East', latitude: 40.7531, longitude: -73.9705,
    post: 'Leave dinner, not another decision', body: 'A meal feels especially helpful when it arrives at a time that works for the family. We ask about preferences first, keep the portion simple, and use containers nobody needs to return.', summary: 'Agree on food preferences, portion size, and delivery time. Label ingredients clearly and keep the handoff short if the household needs a quiet evening.', category: 'Meals & routines', author: 'marcus', name: 'Marcus Chen', comment: 'Containers that do not need to come back are such a thoughtful detail.' },
  { key: 'park', title: 'An easy afternoon walk', helpType: 'Company & check-in', description: 'Join a relaxed walk along a familiar park path, with plenty of time to sit and chat. Meet at the public entrance and let the requester know when you are back.', area: 'Park entrance · Central Park', latitude: 40.7817, longitude: -73.9666,
    post: 'Make room for a gentle walk', body: 'Not every offer of help needs to be a big project. A little fresh air and unhurried conversation can be a lovely way to spend an afternoon together. We leave the pace and the length flexible.', summary: 'Choose a familiar route with places to rest, check the weather, and agree on a simple start and finish. Let the person you are accompanying set the pace.', category: 'Connection', author: 'manager', name: 'Grace Chen', comment: 'A route with a few benches is always a good starting point.' },
  { key: 'books', title: 'Return library books together', helpType: 'Errands & shopping', description: 'Help return a small stack of library books, then stay for a cup of tea and a chat if there is time. No lifting of heavy bags is expected.', area: 'Library lobby · Yorkville', latitude: 40.7852, longitude: -73.9489,
    post: 'Company can be the whole point', body: 'Sometimes the errand is just a reason to spend time together. Returning a few books, choosing the next read, and taking a tea break can make an ordinary afternoon feel more connected.', summary: 'Pick one small shared activity, keep the timing flexible, and make space for conversation. Help can be practical without making the day feel like a checklist.', category: 'Connection', author: 'alex', name: 'Alex Morgan', comment: 'Love this. The conversation is often the part people remember.' },
] as const;
async function main() {
  assertPreviewTarget(process.argv[2]);
  const credentials = JSON.parse(readFileSync('.tools/preview-credentials.json', 'utf8'));
  const google = JSON.parse(readFileSync('apps/mobile/google-services.json', 'utf8'));
  if (credentials.project !== PREVIEW_PROJECT || google.project_info.project_id !== PREVIEW_PROJECT) throw Error('Preview project mismatch.');
  const key = google.client.find((c: any) => c.client_info.android_client_info.package_name === 'edu.cornelltech.team517').api_key[0].current_key;
  const clients = new Map<string, ReturnType<typeof createTransport>>();
  async function client(name: string) {
    if (clients.has(name)) return clients.get(name)!;
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...credentials.accounts[name], returnSecureToken: true }) });
    if (!response.ok) throw Error('Synthetic Preview sign-in failed.');
    const { idToken } = await response.json() as { idToken: string };
    const request = createTransport({ baseUrl: PREVIEW_API, getToken: async () => idToken }); clients.set(name, request); return request;
  }
  const tasks = createTaskApi(await client('manager'));
  const existingTasks = (await tasks.listTasks(PREVIEW_CONTEXT_ID)).tasks;
  const places = (await tasks.listLocations(PREVIEW_CONTEXT_ID)).locations;
  const result: { taskId: string; postId: string; resourceId: string; photo: string; authorId: string; authorName: string }[] = [];
  for (const [index, item] of scenarios.entries()) {
    let place = places.find(p => p.label === item.area);
    if (!place) place = await tasks.createLocation(PREVIEW_CONTEXT_ID, { label: item.area, formattedAddress: 'Public meeting point; coordinate the fictional handoff in Messages.', latitude: item.latitude, longitude: item.longitude });
    let task = existingTasks.find(t => t.title === item.title);
    if (task) {
      const detail = await tasks.getTask(task.id);
      if (detail.publicInstructions !== item.description || detail.createdBy !== 'team517_preview_manager' || detail.visibility !== 'VERIFIED_HELPERS') task = undefined;
    }
    if (!task) {
      const start = new Date(); start.setUTCDate(start.getUTCDate() + index + 3); start.setUTCHours(15 + (index % 3), 0, 0, 0);
      const draft = await tasks.createTaskDraft(PREVIEW_CONTEXT_ID, { title: item.title, helpType: item.helpType, publicInstructions: item.description, privateInstructions: 'Please message the requester when you arrive.', locationId: place.id, startAt: start.toISOString(), endAt: new Date(start.getTime() + 90 * 60000).toISOString(), urgency: index === 1 ? 'URGENT' : 'PLANNED', visibility: 'VERIFIED_HELPERS', compensationType: 'VOLUNTEER' });
      task = await tasks.publishTask(draft.id);
    }
    const community = createCommunityApi(await client(item.author));
    let post = (await community.getCommunityFeed()).posts.find(p => p.title === item.post && p.body === item.body && p.visibility === 'PUBLIC_VERIFIED' && p.authorId === 'team517_preview_' + item.author && p.resource);
    if (!post) {
      const resource = await community.createResource({ visibility: 'PUBLIC_VERIFIED', title: item.post, summary: item.summary, category: item.category });
      post = await community.createCommunityPost({ type: 'RESOURCE', visibility: 'PUBLIC_VERIFIED', resourceId: resource.id, title: item.post, body: item.body });
      const peer = createCommunityApi(await client(item.author === 'manager' ? 'alex' : 'manager'));
      await peer.likePost(post.id);
      await peer.commentOnPost(post.id, { body: item.comment });
    }
    result.push({ taskId: task.id, postId: post.id, resourceId: post.resource!.id, photo: item.key, authorId: post.authorId, authorName: item.name });
    if (index < 2 && ['OPEN', 'HAS_OFFERS'].includes(task.status)) {
      const helper = createMarketplaceApi(await client(index === 0 ? 'alex' : 'marcus'));
      // Keep withdrawals/selection/history intact on repeat runs.
      if (!(await helper.getMyOffer(task.id)).offer) await helper.offerHelp(task.id, { message: index === 0 ? 'I can stay for the full appointment window and meet you in the lobby.' : 'I can pick up the list and message you before I leave the market.' });
    }
  }
  writeFileSync('apps/mobile/src/demo/preview-content-manifest.json', JSON.stringify({ project: PREVIEW_PROJECT, scenario: 'fictional-community-content-v1', items: result }, null, 2) + '\n');
  console.log('Ready: five API-backed fictional Tasks + five Feed posts, with exact-ID bundled photo associations. No credentials written to the manifest.');
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
