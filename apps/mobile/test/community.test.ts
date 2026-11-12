import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCommunityApi } from '../src/api/community';
import { createTransport } from '../src/api/transport';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL as NodeURL } from 'node:url';
test('Community operations use authenticated HTTP contracts and safe encoded paths', async () => {
  const calls: { path: string; method: string; body?: unknown }[] = [];
  const api = createCommunityApi(createTransport({ baseUrl: 'http://example.test/api/v1', getToken: async () => 'token', fetcher: async (url, options) => {
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token'); calls.push({ path: String(url).replace('http://example.test/api/v1', ''), method: options!.method!, body: options?.body ? JSON.parse(options.body as string) : undefined }); return Response.json({});
  } }));
  await api.getCommunityFeed({ type: 'NEED', careContextId: 'c/d' }); await api.getCommunityPost('p/q');
  await api.createCommunityPost({ type: 'NEED', taskId: 'task', body: 'Need', visibility: 'PUBLIC_VERIFIED' });
  await api.commentOnPost('p/q', { body: 'Comment' }); await api.listComments('p/q'); await api.likePost('p/q'); await api.unlikePost('p/q'); await api.sharePost('p/q', { body: 'Share', visibility: 'PUBLIC_VERIFIED' });
  await api.createResource({ title: 'Guide', summary: 'Information', category: 'Care', visibility: 'PUBLIC_VERIFIED' }); await api.getResource('r/s'); await api.saveResource('r/s'); await api.unsaveResource('r/s'); await api.getSavedResources();
  assert.deepEqual(calls.map(c => [c.method, c.path]), [ ['GET', '/community/feed?type=NEED&careContextId=c%2Fd'], ['GET', '/community/posts/p%2Fq'], ['POST', '/community/posts'], ['POST', '/community/posts/p%2Fq/comments'], ['GET', '/community/posts/p%2Fq/comments'], ['POST', '/community/posts/p%2Fq/like'], ['POST', '/community/posts/p%2Fq/unlike'], ['POST', '/community/posts/p%2Fq/share'], ['POST', '/resources'], ['GET', '/resources/r%2Fs'], ['POST', '/resources/r%2Fs/save'], ['POST', '/resources/r%2Fs/unsave'], ['GET', '/me/saved-resources'] ]);
  assert.deepEqual(calls[2].body, { type: 'NEED', taskId: 'task', body: 'Need', visibility: 'PUBLIC_VERIFIED' }); assert.deepEqual(calls[5].body, {});
});
test('mobile sources keep all business Firestore access behind authenticated APIs', () => {
  const root = fileURLToPath(new NodeURL('../src/', import.meta.url));
  function walk(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []); }
  for (const file of [...walk(root), join(root, '..', 'App.tsx')]) assert.doesNotMatch(readFileSync(file, 'utf8'), /from\s+['"](?:firebase\/firestore|firebase-admin)(?:[/'"])/, file);
});
