import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiClientError, createTransport } from '../src/api/transport';
import { createCareApi } from '../src/api/service';

test('API sends a fresh Firebase bearer token and uses public resource URLs', async () => {
  const calls: { url: string; options?: RequestInit }[] = [];
  let tokens = 0;
  const api = createCareApi(createTransport({
    baseUrl: 'http://example.test/api/v1/',
    getToken: async () => 'token-' + ++tokens,
    fetcher: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({ id: 'context' });
    },
  }));
  await api.createCareContext({ name: "Mom's care" });
  await api.getCareContext('public/id');
  assert.equal(calls[0].url, 'http://example.test/api/v1/care-contexts');
  assert.equal(calls[0].options?.method, 'POST');
  assert.equal(calls[0].options?.body, JSON.stringify({ name: "Mom's care" }));
  assert.equal((calls[0].options?.headers as Record<string, string>).Authorization, 'Bearer token-1');
  assert.equal(calls[1].url, 'http://example.test/api/v1/care-contexts/public%2Fid');
  assert.equal((calls[1].options?.headers as Record<string, string>).Authorization, 'Bearer token-2');
});

test('missing authentication is rejected before HTTP', async () => {
  const request = createTransport({ baseUrl: 'http://example.test', getToken: async () => undefined,
    fetcher: async () => { throw new Error('HTTP must not be called'); } });
  await assert.rejects(request('/me'), (error: unknown) => error instanceof ApiClientError && error.code === 'AUTH_REQUIRED');
});

for (const [status, code, message] of [
  [400, 'VALIDATION_ERROR', /1–120/],
  [401, 'UNAUTHENTICATED', /sign in again/],
  [403, 'FORBIDDEN', /permission/],
  [503, 'BACKEND_UNAVAILABLE', /backend is unavailable/],
] as const) {
  test(`HTTP ${status} produces useful feedback`, async () => {
    const request = createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token',
      fetcher: async () => Response.json({ error: { code, message: 'Server message' } }, { status }) });
    await assert.rejects(request('/care-contexts'), (error: unknown) =>
      error instanceof ApiClientError && error.status === status && message.test(error.message));
  });
}

test('network failure is readable and POST is never automatically retried', async () => {
  let attempts = 0;
  const request = createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token',
    fetcher: async () => { attempts++; throw new TypeError('fetch failed'); } });
  await assert.rejects(request('/care-contexts', { name: "Mom's care" }), (error: unknown) =>
    error instanceof ApiClientError && error.code === 'NETWORK_ERROR' && /refresh the list/.test(error.message));
  assert.equal(attempts, 1);
});

test('non-JSON success identifies a misconfigured API URL', async () => {
  const request = createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token',
    fetcher: async () => new Response('<html>wrong server</html>') });
  await assert.rejects(request('/me'), (error: unknown) => error instanceof ApiClientError && error.code === 'INVALID_RESPONSE');
});

test('stalled requests time out and release the caller', async () => {
  const request = createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token', timeoutMs: 10,
    fetcher: async (_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }) });
  await assert.rejects(request('/me'), (error: unknown) => error instanceof ApiClientError && error.code === 'NETWORK_ERROR');
});
