import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CalendarTaskDto } from '@team517/contracts';
import { monthCells, monthRange, shiftMonth, calendarQuery, groupCalendarTasks } from '../src/utils/calendar';
test('Monday-first month grid places Sunday correctly and covers every day once', () => {
  const cells = monthCells('2026-11');
  assert.deepEqual(cells.slice(0, 6), Array(6).fill(null));
  assert.equal(cells[6], '2026-11-01');
  assert.equal(cells.length % 7, 0);
  assert.equal(cells.filter(Boolean).length, 30);
  assert.equal(new Set(cells.filter(Boolean)).size, 30);
});
test('month grids handle leap years and century exceptions without rolling invalid days', () => {
  assert.ok(monthCells('2024-02').includes('2024-02-29'));
  assert.ok(!monthCells('2026-02').includes('2026-02-29'));
  assert.ok(!monthCells('1900-02').includes('1900-02-29'));
  assert.ok(monthCells('2000-02').includes('2000-02-29'));
  assert.throws(() => monthCells('2026-13'));
});
test('month navigation and exclusive query end cross the year correctly', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.deepEqual(monthRange('2026-12'), { start: '2026-12-01', end: '2027-01-01' });
});
test('calendar query validation preserves the existing bounded API contract', () => {
  for (const range of [{ start: '2026-02-30', end: '2026-03-01' }, { start: 'invalid', end: '2026-03-01' }, { start: '2026-03-01', end: '2026-03-01' }, { start: '2026-04-01', end: '2026-03-01' }, { start: '2026-01-01', end: '2026-05-01' }]) assert.equal(calendarQuery(range), undefined);
  assert.ok(calendarQuery(monthRange('2026-11')));
});
test('local month boundaries respect spring/fall DST instead of assuming 24-hour days', () => {
  const previous = process.env.TZ; process.env.TZ = 'America/New_York';
  try {
    const march = calendarQuery(monthRange('2026-03'))!, november = calendarQuery(monthRange('2026-11'))!;
    assert.equal(march.start, '2026-03-01T05:00:00.000Z');
    assert.equal(march.end, '2026-04-01T04:00:00.000Z');
    assert.equal((Date.parse(march.end) - Date.parse(march.start)) / 3600000, 743);
    assert.equal((Date.parse(november.end) - Date.parse(november.start)) / 3600000, 721);
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
const task = (taskId: string, startAt: string): CalendarTaskDto => ({ taskId, startAt, endAt: startAt, status: 'ARRANGED', roleInTask: 'REQUESTER' });
test('calendar grouping uses the explicit local day, preserves real records and does not mutate API order', () => {
  const rows = [task('late', '2026-11-01T06:30:00Z'), task('prior-day', '2026-11-01T03:30:00Z'), task('early', '2026-11-01T05:30:00Z')];
  const groups = groupCalendarTasks(rows, 'America/New_York');
  assert.deepEqual(groups.map(group => group.date), ['2026-10-31', '2026-11-01']);
  assert.deepEqual(groups[1].tasks.map(item => item.taskId), ['early', 'late']);
  assert.equal(rows[0].taskId, 'late');
  assert.deepEqual(groupCalendarTasks([], 'America/New_York'), []);
});
