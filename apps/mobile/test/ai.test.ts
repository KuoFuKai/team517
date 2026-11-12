import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAiApi } from '../src/api/ai';
import { createTransport, ApiClientError } from '../src/api/transport';

test('AI API uses only authenticated HTTP and carries no provider parameters', async () => {
  const calls: { url: string; body: unknown }[] = [];
  const api = createAiApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token', fetcher: async (url, options) => {
    assert.equal(options?.method, 'POST');
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token');
    calls.push({ url: String(url), body: JSON.parse(options?.body as string) });
    return Response.json({ fields: {}, missingFields: ['title'], warnings: [], providerMode: 'MOCK' });
  } }));
  const input = { careContextId: 'context', text: 'Pick up groceries', timezone: 'UTC' };
  await api.generateTaskSuggestion(input);
  await api.improveTaskSuggestion('task/id', { text: 'Make it urgent', timezone: 'UTC' });
  await api.summarizeTask('task/id');
  assert.deepEqual(calls.map(call => call.url), ['http://example.test/api/v1/ai/task-suggestions', 'http://example.test/api/v1/tasks/task%2Fid/ai-suggestions', 'http://example.test/api/v1/tasks/task%2Fid/ai-summary']);
  assert.deepEqual(calls[0].body, input); assert.deepEqual(calls[2].body, {});
});
for (const code of ['AI_NOT_CONFIGURED', 'AI_UNAVAILABLE', 'AI_INVALID_RESPONSE', 'TRANSCRIPTION_FAILED']) {
  test(`${code} remains distinguishable from generic backend failure`, async () => {
    const api = createAiApi(createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token',
      fetcher: async () => Response.json({ error: { code, message: 'Unavailable' } }, { status: code === 'AI_INVALID_RESPONSE' ? 502 : 503 }) }));
    await assert.rejects(api.summarizeTask('task'), (error: unknown) => error instanceof ApiClientError && error.code === code && error.message.length > 10);
  });
}
