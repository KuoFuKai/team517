// Local date/time presentation over the existing ISO-instant task contract.
// The API still stores and receives instants; only the inputs the user touches are local.
export interface LocalDateTime { date: string; time: string }

const pad = (value: number) => String(value).padStart(2, '0');
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function splitLocalDateTime(value?: string | null): LocalDateTime | undefined {
  if (!value) return undefined;
  const moment = new Date(value);
  if (!Number.isFinite(moment.getTime())) return undefined;
  // Date() rolls an out-of-range ISO day forward (2026-02-30 becomes March 2).
  // Refuse it rather than show the user a day their draft never held.
  const stated = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (stated && new Date(Date.UTC(Number(stated[1]), Number(stated[2]) - 1, Number(stated[3]))).toISOString().slice(0, 10) !== stated[0]) return undefined;
  return {
    date: `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`,
    time: `${pad(moment.getHours())}:${pad(moment.getMinutes())}`,
  };
}

// Rejects local wall-clock values that do not exist: impossible calendar days and
// the hour skipped by a daylight-saving spring-forward change.
export function joinLocalDateTime(date: string, time: string): string | undefined {
  if (!DATE.test(date) || !TIME.test(time)) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (year < 1000 || year > 9998 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const moment = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (!Number.isFinite(moment.getTime())) return undefined;
  if (moment.getFullYear() !== year || moment.getMonth() !== month - 1 || moment.getDate() !== day) return undefined;
  if (moment.getHours() !== hour || moment.getMinutes() !== minute) return undefined;
  return moment.toISOString();
}

export function formatTimeLabel(time: string) {
  if (!TIME.test(time)) return time;
  const [hour, minute] = time.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateLabel(date: string) {
  if (!DATE.test(date)) return date;
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day, 12));
}

// A fixed grid of choices, plus any value already saved on the draft so editing
// an existing or assistant-written time never silently rounds it away.
export function timeChoices(current?: string, stepMinutes = 15) {
  const step = Number.isInteger(stepMinutes) && stepMinutes > 0 && stepMinutes <= 60 ? stepMinutes : 15;
  const values = new Set<string>();
  for (let minutes = 0; minutes < 24 * 60; minutes += step) values.add(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  if (current && TIME.test(current)) values.add(current);
  return [...values].sort().map(value => ({ value, label: formatTimeLabel(value) }));
}

export const monthOf = (date: string) => DATE.test(date) ? date.slice(0, 7) : undefined;

// Calendar-day arithmetic for the single-date form: an end time at or before the
// start time means help runs past local midnight, onto the next day.
export function shiftDay(date: string, days: number): string | undefined {
  if (!DATE.test(date)) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const moved = new Date(Date.UTC(year, month - 1, day));
  if (moved.toISOString().slice(0, 10) !== date) return undefined;
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}
