import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTaskTime, taskTimeInput, taskTimeValue, taskDatePart, taskClockPart, composeTaskTime, shiftTaskDate, taskClockChoices } from '../src/utils/task-time';
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

test('schedule parts split and recombine without touching the stored form value', () => {
  assert.equal(taskDatePart('2026-11-20 10:00'), '2026-11-20');
  assert.equal(taskClockPart('2026-11-20 10:00'), '10:00');
  assert.equal(taskDatePart('nonsense'), '');
  assert.equal(composeTaskTime('2026-11-20', '10:00'), '2026-11-20 10:00');
  assert.equal(composeTaskTime('2026-11-20', '25:00'), '');
  assert.equal(composeTaskTime('2026-13-01', '10:00'), '');
});

test('day arithmetic for an overnight end crosses months, years and leap days', () => {
  assert.equal(shiftTaskDate('2026-10-31', 1), '2026-11-01');
  assert.equal(shiftTaskDate('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftTaskDate('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftTaskDate('2026-02-28', 1), '2026-03-01');
  assert.equal(shiftTaskDate('2026-02-30', 1), '');
});

test('the clock list covers the day on a fixed step and keeps an off-step saved value', () => {
  const choices = taskClockChoices();
  assert.equal(choices.length, 96);
  assert.equal(choices[0].value, '00:00');
  assert.equal(choices[choices.length - 1].value, '23:45');
  assert.equal(taskClockChoices('10:07').length, 97);
  assert.ok(taskClockChoices('10:07').some(choice => choice.value === '10:07'));
  assert.equal(taskClockChoices('nope').length, 96);
});

test('a composed overnight pair still resolves to ordered instants', () => {
  const start = parseTaskTime(composeTaskTime('2026-11-20', '22:00'));
  const end = parseTaskTime(composeTaskTime(shiftTaskDate('2026-11-20', 1), '02:00'));
  assert.ok(start && end);
  assert.ok(Date.parse(end!) > Date.parse(start!));
});
