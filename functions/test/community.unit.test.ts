import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostSchema, commentSchema, resourceSchema } from '../src/validation/community';
import { requireContained } from '../src/permissions/community';
test('Community request boundaries enforce flat comments, scoped types and safe display-only URLs', () => {
  assert.equal(createPostSchema.safeParse({ type: 'NEED', taskId: 'a'.repeat(20), body: 'Need help', visibility: 'PUBLIC_VERIFIED', resourceId: 'injected' }).success, false);
  assert.equal(createPostSchema.safeParse({ type: 'RESOURCE', resourceId: 'r', body: 'Resource', visibility: 'CARE_CIRCLE' }).success, false);
  assert.equal(commentSchema.safeParse({ body: 'Comment', parentCommentId: 'nested' }).success, false);
  for (const url of ['javascript:alert(1)', 'file:///private', 'http://example.org', 'https://u:p@example.org']) assert.equal(resourceSchema.safeParse({ title: 'Guide', summary: 'Resource', category: 'Care', visibility: 'PUBLIC_VERIFIED', url }).success, false);
  assert.equal(resourceSchema.safeParse({ title: 'Guide', summary: 'Resource', category: 'Care', visibility: 'PUBLIC_VERIFIED', url: 'https://example.org' }).success, true);
});
test('circle provenance cannot widen to public or another circle', () => {
  const source = { visibility: 'CARE_CIRCLE' as const, careContextId: 'one' };
  assert.throws(() => requireContained(source, { visibility: 'PUBLIC_VERIFIED' }), { code: 'VISIBILITY_MISMATCH' });
  assert.throws(() => requireContained(source, { visibility: 'CARE_CIRCLE', careContextId: 'two' }), { code: 'VISIBILITY_MISMATCH' });
  assert.doesNotThrow(() => requireContained(source, source));
});
