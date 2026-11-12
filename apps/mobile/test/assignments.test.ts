import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAssignmentApi } from '../src/api/assignments';
import { createTransport } from '../src/api/transport';

test('Assignment APIs send authenticated, encoded HTTP operations with explicit transition bodies', async () => {
  const calls: { url: string; method: string; body: unknown }[] = [];
  const api = createAssignmentApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token', fetcher: async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token');
    calls.push({ url: String(url).replace('http://example.test/api/v1', ''), method: options!.method!, body: options?.body ? JSON.parse(options.body as string) : undefined });
    return Response.json({});
  } }));
  await api.getMyOffers(); await api.getMyAssignments(); await api.getExecutionDetails('a/b');
  await api.confirmAssignment('a/b'); await api.declineAssignment('a/b'); await api.cancelAssignment('a/b');
  await api.startTask('a/b'); await api.requestCompletion('a/b'); await api.confirmCompletion('a/b'); await api.disputeCompletion('a/b', { reason: 'Needs review' });
  assert.deepEqual(calls.map(c => [c.method, c.url]), [
    ['GET', '/me/offers'], ['GET', '/me/assignments'], ['GET', '/assignments/a%2Fb/execution'],
    ...['confirm', 'decline', 'cancel', 'start', 'request-completion', 'confirm-completion', 'dispute'].map(op => ['POST', '/assignments/a%2Fb/' + op]),
  ]);
  for (const call of calls.slice(3, 9)) assert.deepEqual(call.body, {});
  assert.deepEqual(calls[9].body, { reason: 'Needs review' });
});
