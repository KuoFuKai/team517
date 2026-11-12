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
