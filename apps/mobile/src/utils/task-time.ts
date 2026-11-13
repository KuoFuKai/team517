// Local form values are converted at the API boundary; DTO timestamps remain ISO.
export function taskTimeInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function parseTaskTime(value: string): string | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(value.trim());
  if (!parts) return null;
  const [year, month, day, hour, minute] = parts.slice(1).map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const date = new Date(year, month - 1, day, hour, minute);
  // Reject impossible dates and daylight-saving gaps rather than silently shifting.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return null;
  return date.toISOString();
}

export function taskTimeValue(value: string, original?: string): string | null {
  // Saving another field must not truncate seconds/milliseconds on an untouched timestamp.
  return original && value === taskTimeInput(original) ? original : parseTaskTime(value);
}

// Part accessors for the schedule picker. The stored form value stays
// "YYYY-MM-DD HH:mm"; these only split and recombine it.
const FORM = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/;
export const taskDatePart = (value: string) => FORM.exec(value.trim())?.[1] ?? '';
export const taskClockPart = (value: string) => FORM.exec(value.trim())?.[2] ?? '';
export function composeTaskTime(date: string, clock: string) {
  // isTaskDate rejects month 13 and the like, which a bare pattern would pass.
  return isTaskDate(date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(clock) ? `${date} ${clock}` : '';
}

// A real calendar day, checked by round-tripping rather than by pattern.
export function isTaskDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === date;
}

// Calendar-day arithmetic: an end time at or before the start runs past midnight.
export function shiftTaskDate(date: string, days: number): string {
  if (!isTaskDate(date)) return '';
  const [year, month, day] = date.split('-').map(Number);
  const moved = new Date(Date.UTC(year, month - 1, day));
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

export function taskClockLabel(clock: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)) return clock;
  const [hour, minute] = clock.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function taskDayLabel(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day, 12));
}

// A fixed grid of choices, plus any value already on the draft so editing an
// existing or assistant-written time never silently rounds it away.
export function taskClockChoices(current?: string, stepMinutes = 15) {
  const step = Number.isInteger(stepMinutes) && stepMinutes > 0 && stepMinutes <= 60 ? stepMinutes : 15;
  const pad = (n: number) => String(n).padStart(2, '0');
  const values = new Set<string>();
  for (let minutes = 0; minutes < 24 * 60; minutes += step) values.add(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  if (current && /^([01]\d|2[0-3]):[0-5]\d$/.test(current)) values.add(current);
  return [...values].sort().map(value => ({ value, label: taskClockLabel(value) }));
}
