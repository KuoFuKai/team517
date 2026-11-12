import { DeviceTokenRepository } from '../repositories/device-tokens';
import { NotificationDeliveryRepository } from '../repositories/notification-delivery';
import { pushPayload, type PushProvider } from './provider';

export class NotificationDeliveryService {
  constructor(private provider: PushProvider | undefined, private devices = new DeviceTokenRepository(), private notifications = new NotificationDeliveryRepository()) {}
  async deliver(id: string) {
    if (!this.provider) return; // Disabled local mode does not consume an attempt.
    const notification = await this.notifications.claim(id, n => Boolean(pushPayload(n)));
    if (!notification) return;
    let sent = 0, failed = 0, invalid = 0;
    try {
      const devices = await this.devices.active(notification.recipientId), seen = new Set<string>();
      for (const d of devices) {
        if (seen.has(d.token)) continue; seen.add(d.token);
        if (!await this.devices.stillOwned(d)) continue;
        let result: 'SENT' | 'INVALID' | 'FAILED';
        try { result = await this.provider.send(d.token, pushPayload(notification)!); } catch { result = 'FAILED'; }
        if (result === 'SENT') sent++;
        else if (result === 'INVALID') { invalid++; await this.devices.disable(d.userId, d.id, d.registrationId, 'INVALID_TOKEN'); }
        else failed++;
      }
    } catch { failed++; }
    // One claim, no automatic retry after ambiguous provider outcomes (at-most-once attempt).
    await this.notifications.finish(id, { sent, failed, invalid });
  }
}
