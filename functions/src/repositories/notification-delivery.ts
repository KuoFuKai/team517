import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Notification } from '../domain/support';
export class NotificationDeliveryRepository {
  private get db() { return getFirestore(); }
  async claim(id: string, eligible: (n: Notification) => boolean) {
    const ref = this.db.collection('notifications').doc(id);
    return this.db.runTransaction(async tx => {
      const n = (await tx.get(ref)).data() as (Notification & { pushDelivery?: unknown }) | undefined;
      if (!n || n.pushDelivery || !eligible(n)) return;
      tx.update(ref, { pushDelivery: { status: 'CLAIMED', attemptedAt: Timestamp.now() } }); return n;
    });
  }
  async finish(id: string, counts: { sent: number; failed: number; invalid: number }) {
    await this.db.collection('notifications').doc(id).update({ pushDelivery: { status: counts.failed ? 'FAILED' : 'ATTEMPTED', attemptedAt: Timestamp.now(), ...counts } });
  }
}
