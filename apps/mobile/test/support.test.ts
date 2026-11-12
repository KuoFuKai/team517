import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSupportApi } from '../src/api/support';
import { createTransport } from '../src/api/transport';
test('supporting clients use authenticated HTTP and encode IDs/date ranges with public request bodies', async () => {
  const calls: { path: string; method: string; body?: unknown }[] = [];
  const api = createSupportApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'fresh-token', fetcher: async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer fresh-token');
    calls.push({ path: String(url).replace('http://example.test/api/v1', ''), method: options!.method!, body: options?.body ? JSON.parse(options.body as string) : undefined }); return Response.json({});
  } }));
  await api.getCalendar({ start: '2026-12-01T00:00:00Z', end: '2026-12-02T00:00:00Z' });
  await api.getNotifications(); await api.markNotificationRead('event/user'); await api.markAllNotificationsRead();
  await api.submitReview('a/b', { rating: 4, comment: 'Helpful' }); await api.getHelperReviews('u/v'); await api.getHelperRatingSummary('u/v');
  await api.getTaskTimeline('t/u'); await api.getVerificationStatus(); await api.getAssignmentPublicTask('a/b');
  assert.deepEqual(calls.map(c => [c.method, c.path]), [
    ['GET', '/me/calendar?start=2026-12-01T00%3A00%3A00Z&end=2026-12-02T00%3A00%3A00Z'], ['GET', '/me/notifications'],
    ['POST', '/notifications/event%2Fuser/read'], ['POST', '/me/notifications/read-all'], ['POST', '/assignments/a%2Fb/reviews'],
    ['GET', '/helpers/u%2Fv/reviews'], ['GET', '/helpers/u%2Fv/rating'], ['GET', '/tasks/t%2Fu/timeline'], ['GET', '/me/verification'], ['GET', '/assignments/a%2Fb/task'],
  ]);
  assert.deepEqual(calls[4].body, { rating: 4, comment: 'Helpful' }); assert.deepEqual(calls[2].body, {}); assert.deepEqual(calls[3].body, {});
});
