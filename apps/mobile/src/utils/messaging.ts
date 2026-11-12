let sequence = 0;
export function newClientMessageId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  // Correlation ID, not a permission/secret. Time + two random segments + per-process counter.
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2) + '-' + (++sequence).toString(36);
}
export interface PendingSend { text: string; clientMessageId: string }
export function logicalSend(previous: PendingSend | null, text: string): PendingSend {
  const trimmed = text.trim(); return previous?.text === trimmed ? previous : { text: trimmed, clientMessageId: newClientMessageId() };
}
