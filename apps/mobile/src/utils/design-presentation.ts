export function taskWhenLabel(start?: string, end?: string): string {
  if (!start || !Number.isFinite(Date.parse(start))) return 'Time to be arranged';
  const first = new Date(start);
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  let label = `${day.format(first)} · ${time.format(first)}`;
  if (end && Number.isFinite(Date.parse(end))) {
    const last = new Date(end);
    label += first.toDateString() === last.toDateString() ? `–${time.format(last)}` : ` – ${day.format(last)} · ${time.format(last)}`;
  }
  return label;
}
export function messageTimeLabel(value: string, now = new Date()): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  if (date.toDateString() === now.toDateString()) return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
export function discoveryAreaLabel(value: string): string {
  return /^Approximate area\s*\(/.test(value) ? 'Approximate area' : value;
}
export function compensationLabel(task: { compensationType?: string; pointReward?: number; cashAmount?: number; currency?: string }): string {
  if (task.compensationType === 'VOLUNTEER') return 'Volunteer task';
  if (task.compensationType === 'POINTS') return task.pointReward !== undefined ? `${task.pointReward} points` : 'Points task';
  if (task.compensationType === 'PAID') return task.cashAmount !== undefined ? `${task.cashAmount} ${task.currency ?? ''}`.trim() : 'Paid task';
  return 'Compensation not selected';
}
