import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMessagingApi } from '../src/api/messaging';
import { createTransport } from '../src/api/transport';
import { logicalSend } from '../src/utils/messaging';
test('messaging clients use authenticated HTTP, encoded paths, cursors and immutable send IDs', async () => {
  const calls: { path: string; method: string; body?: unknown }[] = [];
  const api = createMessagingApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token', fetcher: async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token'); calls.push({ path: String(url).replace('http://example.test/api/v1', ''), method: options!.method!, body: options?.body ? JSON.parse(options.body as string) : undefined }); return Response.json({});
  } }));
  await api.listConversations(); await api.getOrCreateConversation({ scope: 'TASK', taskId: 'task', otherUserId: 'helper' }); await api.getConversation('c/d');
  await api.listMessages('c/d', 51); await api.sendMessage('c/d', { text: 'Hello', clientMessageId: 'logical-id' }); await api.markConversationRead('c/d'); await api.startTaskConversation('t/u'); await api.listMessagingMembers('ctx/id');
  assert.deepEqual(calls.map(c => [c.method, c.path]), [ ['GET', '/me/conversations'], ['POST', '/conversations'], ['GET', '/conversations/c%2Fd'], ['GET', '/conversations/c%2Fd/messages?before=51'], ['POST', '/conversations/c%2Fd/messages'], ['POST', '/conversations/c%2Fd/read'], ['POST', '/tasks/t%2Fu/conversations'], ['GET', '/care-contexts/ctx%2Fid/messaging-members'] ]);
  assert.deepEqual(calls[4].body, { text: 'Hello', clientMessageId: 'logical-id' }); assert.deepEqual(calls[5].body, {});
});
test('failed logical sends retain the same client ID for unchanged trimmed text; edits/new messages get new IDs', () => {
  const first = logicalSend(null, ' Hello '); const retry = logicalSend(first, 'Hello'); assert.equal(retry.clientMessageId, first.clientMessageId);
  assert.notEqual(logicalSend(first, 'Edited').clientMessageId, first.clientMessageId); assert.notEqual(logicalSend(null, 'Hello').clientMessageId, first.clientMessageId);
});
