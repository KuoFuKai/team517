import { test } from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/demo/preview-content-manifest.json';
import { previewContent, previewPostAuthor } from '../src/demo/preview-content-policy';
const preview = { environment: 'PREVIEW', firebaseProjectId: 'team517-dev' };
test('photo fixtures resolve exact public IDs only in the development Preview project', () => {
  assert.equal(manifest.items.length, 5);
  for (const item of manifest.items) {
    assert.equal(previewContent(preview, 'task', item.taskId)?.photo, item.photo);
    assert.equal(previewContent(preview, 'post', item.postId)?.photo, item.photo);
    assert.equal(previewContent(preview, 'resource', item.resourceId)?.photo, item.photo);
    assert.equal(previewContent(preview, 'post', item.postId, false), undefined);
    assert.equal(previewContent({ ...preview, environment: 'LOCAL' }, 'task', item.taskId), undefined);
    assert.equal(previewContent({ ...preview, firebaseProjectId: 'other' }, 'task', item.taskId), undefined);
  }
  assert.equal(previewContent(preview, 'task', 'not-a-fixture'), undefined);
});
test('fictional author presentation never overrides another author or redacted/private content', () => {
  const item = manifest.items[0], post = { id: item.postId, authorId: item.authorId, authorLabel: 'Member alias', visibility: 'PUBLIC_VERIFIED', resource: { id: item.resourceId } };
  assert.equal(previewPostAuthor(preview, post), item.authorName);
  assert.equal(previewPostAuthor(preview, { ...post, authorId: 'someone-else' }), 'Member alias');
  assert.equal(previewPostAuthor(preview, { ...post, unavailable: true }), 'Member alias');
  assert.equal(previewPostAuthor(preview, { ...post, visibility: 'CARE_CIRCLE' }), 'Member alias');
  assert.equal(previewPostAuthor(preview, { ...post, resource: undefined }), 'Member alias');
});
