import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { TaskStatus, TaskSummaryDto } from '@team517/contracts';
import { groupTasks, taskRowNote } from '../src/utils/task-groups';
import { navigationItems } from '../src/navigation/tabs';
import { createPostDraftSession } from '../src/navigation/post-draft';
test('rapid Post taps and notification remounts reuse the pending draft instead of creating duplicates', async () => {
  const session = createPostDraftSession<{ id: string }>();
  let calls = 0, resolve!: (value: { id: string }) => void;
  const pending = new Promise<{ id: string }>(done => { resolve = done; });
  const create = () => { calls++; return pending; };
  const first = session.get(create), remounted = session.get(create);
  resolve({ id: 'one-draft' });
  assert.equal((await first).id, (await remounted).id);
  assert.equal((await session.get(create)).id, 'one-draft');
  assert.equal(calls, 1);
  session.reset();
  assert.equal((await session.get(async () => ({ id: 'next-intent' }))).id, 'next-intent');
});
test('a failed draft creation can be retried rather than caching a rejected Post intent', async () => {
  const session = createPostDraftSession<string>();
  await assert.rejects(session.get(async () => { throw new Error('offline'); }));
  assert.equal(await session.get(async () => 'recovered'), 'recovered');
});
const statuses: TaskStatus[] = ['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
const tasks: TaskSummaryDto[] = statuses.map((status, id) => ({ id: String(id), careContextId: 'context', title: status, status }));
test('status groups preserve every real lifecycle record exactly once across active/draft/history', () => {
  const all = (['current', 'drafts', 'history'] as const).flatMap(filter => groupTasks(tasks, filter).flatMap(group => group.tasks));
  assert.equal(all.length, tasks.length);
  assert.equal(new Set(all.map(task => task.id)).size, tasks.length);
  assert.deepEqual(groupTasks(tasks, 'drafts').flatMap(g => g.tasks.map(t => t.status)), ['DRAFT']);
  assert.deepEqual(new Set(groupTasks(tasks, 'history').flatMap(g => g.tasks.map(t => t.status))), new Set(['COMPLETED', 'DISPUTED', 'CANCELLED']));
  assert.equal(groupTasks(tasks, 'current')[0].title, 'Needs completion review');
});
test('group sorting is stable, does not mutate API data and does not invent offer counts', () => {
  const rows: TaskSummaryDto[] = [{ ...tasks[2], id: 'late', startAt: '2026-11-14T12:00:00Z' }, { ...tasks[2], id: 'early', startAt: '2026-11-13T12:00:00Z' }];
  assert.deepEqual(groupTasks(rows, 'current')[0].tasks.map(t => t.id), ['early', 'late']);
  assert.equal(rows[0].id, 'late');
  assert.equal(taskRowNote(rows[0]), 'Offers received · Choose a helper');
  assert.equal(taskRowNote({ ...tasks[1], urgency: 'URGENT' }), 'Urgent · No helper yet');
});
test('receiver UI mode retains Post and Circle/Messages without marketplace navigation', () => {
  const items = navigationItems(false);
  assert.equal(items.length, 5);
  assert.ok(items.some(i => i.id === 'post'));
  assert.ok(items.some(i => i.id === 'circle'));
  assert.ok(!items.some(i => i.id === 'discover'));
});
test('helper UI mode has Find and Messages while Calendar stays within Tasks', () => {
  const items = navigationItems(true);
  assert.equal(items.length, 5);
  assert.ok(items.some(i => i.id === 'discover'));
  assert.ok(items.some(i => i.id === 'messages'));
  assert.ok(!items.some(i => i.id === 'post' || i.id === 'calendar'));
});
