import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarketplaceApi } from '../src/api/marketplace';
import { createTransport } from '../src/api/transport';

test('discovery/Offer/selection clients use public HTTP DTO operations and safe resource paths', async () => {
  const calls: { url: string; method?: string; body?: string }[] = [];
  const api = createMarketplaceApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token', fetcher: async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token');
    calls.push({ url: String(url).replace('http://example.test/api/v1', ''), method: options?.method, body: options?.body as string | undefined });
    return Response.json({});
  } }));
  await api.discoverTasks({ latitude: 40, longitude: -74, radiusKm: 5, compensationType: 'PAID' });
  await api.getDiscoveredTask('task/id'); await api.offerHelp('task/id', { message: 'Happy to help' });
  await api.withdrawOffer('task/id'); await api.listOffers('task/id'); await api.selectOffer('task/id', 'offer_id');
  await api.getAssignment('assignment/id'); await api.getMyOffer('task/id'); await api.updateRolePreference({ lastActiveRole: 'HELPER' });
  assert.deepEqual(calls.map(call => [call.method, call.url]), [
    ['GET', '/tasks/discover?latitude=40&longitude=-74&radiusKm=5&compensationType=PAID'], ['GET', '/tasks/task%2Fid/discovery'],
    ['POST', '/tasks/task%2Fid/offers'], ['POST', '/tasks/task%2Fid/offers/mine/withdraw'], ['GET', '/tasks/task%2Fid/offers'],
    ['POST', '/tasks/task%2Fid/select-offer'], ['GET', '/assignments/assignment%2Fid'], ['GET', '/tasks/task%2Fid/offers/mine'], ['PATCH', '/me/preferences'],
  ]);
  assert.deepEqual(JSON.parse(calls[2].body!), { message: 'Happy to help' });
  assert.deepEqual(JSON.parse(calls[5].body!), { offerId: 'offer_id' });
});
