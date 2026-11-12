import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskApi } from '../src/api/tasks';
import { ApiClientError, createTransport } from '../src/api/transport';

test('task/location API uses HTTP resource paths, PATCH edits and explicit transitions', async () => {
  const calls: { url: string; method?: string; body?: string }[] = [];
  const api = createTaskApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token',
    fetcher: async (url, options) => {
      assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token');
      calls.push({ url: String(url), method: options?.method, body: options?.body as string | undefined });
      return Response.json({ id: 'task' });
    } }));
  await api.createTaskDraft('care/id', {});
  await api.updateTaskDraft('task/id', { title: 'Partial', locationId: null });
  await api.publishTask('task/id');
  await api.getTask('task/id');
  await api.listTasks('care/id');
  await api.cancelTask('task/id');
  await api.listLocations('care/id');
  await api.createLocation('care/id', { label: 'Home', formattedAddress: '123 Example Street' });
  assert.deepEqual(calls.map(call => [call.method, call.url.replace('http://example.test/api/v1', '')]), [
    ['POST', '/care-contexts/care%2Fid/tasks/drafts'], ['PATCH', '/tasks/task%2Fid'],
    ['POST', '/tasks/task%2Fid/publish'], ['GET', '/tasks/task%2Fid'], ['GET', '/care-contexts/care%2Fid/tasks'],
    ['POST', '/tasks/task%2Fid/cancel'], ['GET', '/care-contexts/care%2Fid/locations'], ['POST', '/care-contexts/care%2Fid/locations'],
  ]);
  assert.deepEqual(JSON.parse(calls[1].body!), { title: 'Partial', locationId: null });
  assert.equal(calls[2].body, '{}');
});

test('publish field errors retain the existing error envelope for screen feedback', async () => {
  const fields = [{ field: 'title', message: 'Required' }, { field: 'locationId', message: 'Select a location' }];
  const api = createTaskApi(createTransport({ baseUrl: 'http://example.test', getToken: async () => 'token',
    fetcher: async () => Response.json({ error: { code: 'TASK_NOT_READY', message: 'Task is not ready to publish.', fields } }, { status: 400 }) }));
  await assert.rejects(api.publishTask('task'), (error: unknown) => {
    assert.ok(error instanceof ApiClientError);
    assert.equal(error.code, 'TASK_NOT_READY'); assert.deepEqual(error.fields, fields);
    assert.equal(error.message, 'Task is not ready to publish.');
    return true;
  });
});
