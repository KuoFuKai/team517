import type { CalendarQuery, CalendarTaskDto } from '@team517/contracts';
import { deviceTimeZone, localDateKey, localDayInstant } from './presentation';
export interface CalendarRange { start: string; end: string }
export function monthParts(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Invalid calendar month');
  const [year, number] = month.split('-').map(Number);
  if (year < 1000 || year > 9998) throw new Error('Unsupported calendar year');
  return { year, number };
}
export function shiftMonth(month: string, offset: number) {
  const { year, number } = monthParts(month);
  const date = new Date(year, number - 1 + offset, 1, 12);
  const result = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  monthParts(result); return result;
}
export function monthRange(month: string): CalendarRange {
  monthParts(month); return { start: month + '-01', end: shiftMonth(month, 1) + '-01' };
}
export function calendarQuery(range: CalendarRange): CalendarQuery | undefined {
  try { monthParts(range.start.slice(0, 7)); monthParts(range.end.slice(0, 7)); } catch { return; }
  const start = localDayInstant(range.start), end = localDayInstant(range.end);
  if (!start || !end || Date.parse(end) <= Date.parse(start) || Date.parse(end) - Date.parse(start) > 93 * 86400000) return;
  return { start, end };
}
export function monthCells(month: string): (string | null)[] {
  const { year, number } = monthParts(month);
  const offset = (new Date(year, number - 1, 1, 12).getDay() + 6) % 7;
  const days = new Date(year, number, 0, 12).getDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => index >= offset && index < offset + days ? `${month}-${String(index - offset + 1).padStart(2, '0')}` : null);
}
export function groupCalendarTasks(tasks: CalendarTaskDto[], timeZone = deviceTimeZone()) {
  const groups = new Map<string, CalendarTaskDto[]>();
  for (const task of tasks) {
    const key = localDateKey(task.startAt, timeZone);
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => ({ date, tasks: items.slice().sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.taskId.localeCompare(b.taskId)) }));
}
export function calendarDateLabel(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' }) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, options).format(new Date(year, month - 1, day, 12));
}
