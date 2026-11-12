import type { DeviceTokenDto } from '@team517/contracts';
// Serialized operations and captured API credentials prevent delayed A work from
// registering with B's credentials. Server registration generations fence disable.
export class PushRegistration {
  private tail: Promise<unknown> = Promise.resolve();
  private current?: { uid: string; record: DeviceTokenDto; disable: (r: DeviceTokenDto) => Promise<unknown> };
  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const next = this.tail.then(work, work); this.tail = next.catch(() => {}); return next;
  }
  register(uid: string, active: () => boolean, register: () => Promise<DeviceTokenDto>, disable: (r: DeviceTokenDto) => Promise<unknown>) {
    return this.enqueue(async () => {
      if (!active()) return;
      const previous = this.current;
      const record = await register();
      this.current = { uid, record, disable };
      if (previous && (previous.uid !== uid || previous.record.id !== record.id)) {
        try { await previous.disable(previous.record); } catch { /* best effort, new ownership is authoritative */ }
      }
      if (!active()) { try { await disable(record); } catch {} this.current = undefined; }
      return record;
    });
  }
  disable(uid: string) {
    return this.enqueue(async () => {
      if (this.current?.uid !== uid) return;
      const previous = this.current; this.current = undefined;
      try { await previous.disable(previous.record); } catch { /* local logout must continue */ }
    });
  }
}
