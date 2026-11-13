import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitLocalDateTime, joinLocalDateTime, formatTimeLabel, timeChoices, monthOf, shiftDay } from '../src/utils/datetime';

const withZone = (zone: string, work: () => void) => {
  const previous = process.env.TZ;
  process.env.TZ = zone;
  try { work(); } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
};

test('an ISO instant splits into the local parts the picker shows and rebuilds the same instant', () => {
  withZone('America/New_York', () => {
    const parts = splitLocalDateTime('2026-10-16T14:00:00.000Z');
    assert.deepEqual(parts, { date: '2026-10-16', time: '10:00' });
    assert.equal(joinLocalDateTime(parts!.date, parts!.time), '2026-10-16T14:00:00.000Z');
  });
});

test('a late-evening instant keeps the local calendar day rather than the UTC day', () => {
  withZone('America/New_York', () => {
    assert.deepEqual(splitLocalDateTime('2026-11-11T02:30:00Z'), { date: '2026-11-10', time: '21:30' });
  });
});

test('missing, empty and unparseable values produce no local parts instead of a wrong date', () => {
  for (const value of [undefined, null, '', 'not a date', '2026-02-30T10:00:00Z']) assert.equal(splitLocalDateTime(value), undefined);
});

test('impossible calendar days and malformed input are refused, never rolled forward', () => {
  for (const [date, time] of [['2026-02-30', '10:00'], ['2026-13-01', '10:00'], ['2026-10-16', '24:00'], ['2026-10-16', '10:60'], ['16/10/2026', '10:00'], ['2026-10-16', '1000']]) {
    assert.equal(joinLocalDateTime(date, time), undefined, `${date} ${time}`);
  }
});

test('the hour skipped by spring-forward is refused while fall-back times still resolve', () => {
  withZone('America/New_York', () => {
    assert.equal(joinLocalDateTime('2026-03-08', '02:30'), undefined);
    assert.equal(joinLocalDateTime('2026-03-08', '03:30'), '2026-03-08T07:30:00.000Z');
    assert.ok(joinLocalDateTime('2026-11-01', '01:30'));
  });
});

test('the time list covers the whole day on a fixed step and keeps an off-step saved value', () => {
  const choices = timeChoices();
  assert.equal(choices.length, 96);
  assert.equal(choices[0].value, '00:00');
  assert.equal(choices[choices.length - 1].value, '23:45');
  const withExisting = timeChoices('10:07');
  assert.equal(withExisting.length, 97);
  assert.ok(withExisting.some(choice => choice.value === '10:07'));
  assert.equal(timeChoices('nonsense').length, 96);
});

test('clock labels read as times rather than raw 24-hour strings', () => {
  withZone('America/New_York', () => {
    assert.match(formatTimeLabel('10:00'), /10[:.]00/);
    assert.notEqual(formatTimeLabel('22:00'), formatTimeLabel('10:00'));
    assert.equal(formatTimeLabel('nope'), 'nope');
  });
});

test('the calendar month behind a date is derived only from well-formed dates', () => {
  assert.equal(monthOf('2026-10-16'), '2026-10');
  assert.equal(monthOf('bad'), undefined);
});

test('calendar-day arithmetic crosses months, years and leap days without drifting', () => {
  assert.equal(shiftDay('2026-10-16', 1), '2026-10-17');
  assert.equal(shiftDay('2026-10-31', 1), '2026-11-01');
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftDay('2026-02-28', 1), '2026-03-01');
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftDay('2026-02-30', 1), undefined);
  assert.equal(shiftDay('nope', 1), undefined);
});


test('unchanged local fields retain original precision and ambiguous-time instant', () => {
  for (const original of ['2026-11-01T06:30:42.123Z', '2026-11-01T05:30:42.123Z']) {
    const parts = splitLocalDateTime(original)!;
    assert.equal(joinLocalDateTime(parts.date, parts.time, original), original);
    assert.notEqual(joinLocalDateTime(parts.date, parts.time === '09:00' ? '10:00' : '09:00', original), original);
  }
});
