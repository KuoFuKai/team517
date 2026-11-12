import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTaskTime, taskTimeInput, taskTimeValue } from '../src/utils/task-time';
test('task form converts local wall time to ISO and back without changing it', () => {
  const input = '2026-12-01 14:30';
  assert.equal(taskTimeInput(parseTaskTime(input)), input);
});
test('task form rejects invalid calendar dates and incomplete times', () => {
  for (const value of ['2026-02-30 14:30', '2026-13-01 14:30', '2026-12-01 24:00', '2026-12-01', 'tomorrow', '']) assert.equal(parseTaskTime(value), null);
  assert.equal(taskTimeInput(undefined), '');
});

test('untouched task times preserve existing second and millisecond precision', () => {
  const original = '2026-12-01T14:30:37.125Z';
  assert.equal(taskTimeValue(taskTimeInput(original), original), original);
  assert.equal(taskTimeInput(taskTimeValue('2026-12-03 15:00', original)), '2026-12-03 15:00');
});
