import { createHash, randomUUID } from 'node:crypto';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { RegisterDeviceTokenRequest, DeviceTokenDto } from '@team517/contracts';
import { ApiFailure } from '../shared/errors';
export interface DeviceToken {
  id: string; userId: string; token: string; platform: 'android'; deviceId?: string; appVersion?: string;
  enabled: boolean; registrationId: string; createdAt: Timestamp; updatedAt: Timestamp; lastSeenAt: Timestamp;
  disabledReason?: 'USER' | 'INVALID_TOKEN';
}
export const deviceTokenId = (token: string) => createHash('sha256').update(token).digest('hex');
export const deviceTokenDto = (d: DeviceToken): DeviceTokenDto => ({ id: d.id, platform: d.platform, enabled: d.enabled, registrationId: d.registrationId, lastSeenAt: d.lastSeenAt.toDate().toISOString() });
export class DeviceTokenRepository {
  private get db() { return getFirestore(); }
  async register(uid: string, input: RegisterDeviceTokenRequest) {
    const ref = this.db.collection('device_tokens').doc(deviceTokenId(input.token));
    return this.db.runTransaction(async tx => {
      const [user, snap] = await Promise.all([tx.get(this.db.collection('users').doc(uid)), tx.get(ref)]);
      if (!user.exists) throw new ApiFailure(404, 'USER_NOT_FOUND', 'Initialize your app user first.');
      const old = snap.data() as DeviceToken | undefined, now = Timestamp.now();
      const { deliveryEnabled: enabled = true, ...fields } = input;
      if (enabled && old?.disabledReason === 'INVALID_TOKEN') throw new ApiFailure(409, 'PUSH_TOKEN_INVALID', 'This device token is no longer valid. A fresh native token is required.');
      const record: DeviceToken = { ...fields, id: ref.id, userId: uid, enabled,
        ...(old?.disabledReason === 'INVALID_TOKEN' ? { disabledReason: 'INVALID_TOKEN' as const } : {}),
        registrationId: old?.userId === uid && old.enabled === enabled ? old.registrationId : randomUUID(),
        createdAt: old?.createdAt ?? now, updatedAt: now, lastSeenAt: now };
      tx.set(ref, record); return deviceTokenDto(record);
    });
  }
  async status(uid: string, id: string) {
    const d = (await this.db.collection('device_tokens').doc(id).get()).data() as DeviceToken | undefined;
    if (!d || d.userId !== uid) throw new ApiFailure(404, 'NOT_FOUND', 'Device registration not found.');
    return deviceTokenDto(d);
  }
  async disable(uid: string, id: string, registrationId: string, reason: 'USER' | 'INVALID_TOKEN' = 'USER') {
    const ref = this.db.collection('device_tokens').doc(id);
    await this.db.runTransaction(async tx => {
      const d = (await tx.get(ref)).data() as DeviceToken | undefined;
      // An old logout/invalid-token response cannot disable a transferred or renewed registration.
      if (d?.userId === uid && d.registrationId === registrationId && (d.enabled || reason === 'INVALID_TOKEN')) tx.update(ref, { enabled: false, disabledReason: reason, updatedAt: Timestamp.now() });
    });
    return { disabled: true };
  }
  async active(uid: string) {
    // Bounded read; excess devices are explicitly omitted in this MVP.
    const docs = await this.db.collection('device_tokens').where('userId', '==', uid).where('enabled', '==', true).limit(100).get();
    return docs.docs.map(d => d.data() as DeviceToken).filter(d => d.enabled);
  }
  async stillOwned(d: DeviceToken) {
    const current = (await this.db.collection('device_tokens').doc(d.id).get()).data() as DeviceToken | undefined;
    return current?.enabled && current.userId === d.userId && current.registrationId === d.registrationId;
  }
}
