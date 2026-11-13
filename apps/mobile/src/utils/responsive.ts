// Width is the space available to the controls, in dp (after screen padding).
// Scale the preferred control width with system text rather than shrinking text.
export function stackActions(width: number, fontScale = 1, count = 2, gap = 12, minimum = 148): boolean {
  const scale = Number.isFinite(fontScale) && fontScale > 0 ? fontScale : 1;
  return !Number.isFinite(width) || width < count * minimum * Math.max(1, scale) + (count - 1) * gap;
}
export function compactNavigation(width: number, fontScale = 1): boolean {
  return width / Math.max(1, fontScale) < 360;
}
export function navigationLabel(label: string, compact: boolean): string {
  return compact ? ({ Community: 'Feed', 'Circle/Msg': 'Circle', Messages: 'Inbox' }[label] ?? label) : label;
}
