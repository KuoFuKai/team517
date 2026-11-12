import { auth } from '../auth/firebase';
import { config } from '../config';
import { createTransport } from '../api/transport';
import { createPushApi } from '../api/push';
import { PushRegistration } from './registration';
import { deviceToken } from './native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DeviceTokenDto } from '@team517/contracts';
const registrations = new PushRegistration();
let revision = 0;
const receiptKey = (uid: string) => 'push-registration:' + uid;
const disabledKey = (uid: string) => 'push-disabled:' + uid;
export async function refreshPush(requestPermission = false, refreshedToken?: string) {
  const ticket = revision;
  const user = auth.currentUser;
  if (!user) return 'unavailable';
  if (requestPermission) await AsyncStorage.removeItem(disabledKey(user.uid));
  const disabled = Boolean(await AsyncStorage.getItem(disabledKey(user.uid)));
  const result = await deviceToken(requestPermission, refreshedToken);
  if (result.state !== 'granted' || !result.token) {
    if (result.state === 'denied') await disableCurrentPush();
    return result.state;
  }
  const api = createPushApi(createTransport({ baseUrl: config.apiUrl, getToken: async () => user.getIdToken() }));
  await registrations.register(user.uid, () => auth.currentUser === user && ticket === revision,
    async () => {
      const oldJson = await AsyncStorage.getItem(receiptKey(user.uid));
      // An opted-out B still takes inactive ownership from A after offline logout.
      const record = await api.registerDeviceToken({ token: result.token!, platform: 'android', deliveryEnabled: !disabled });
      await AsyncStorage.setItem(receiptKey(user.uid), JSON.stringify(record));
      if (oldJson) { const old = JSON.parse(oldJson) as DeviceTokenDto; if (old.id !== record.id) try { await api.disableDeviceToken(old.id, { registrationId: old.registrationId }); } catch {} }
      return record;
    },
    record => api.disableDeviceToken(record.id, { registrationId: record.registrationId }));
  return disabled ? 'disabled' : 'granted';
}
export async function disableCurrentPush(preference = false) {
  revision++;
  const user = auth.currentUser; if (!user) return;
  if (preference) await AsyncStorage.setItem(disabledKey(user.uid), 'true');
  const api = createPushApi(createTransport({ baseUrl: config.apiUrl, getToken: async () => user.getIdToken() }));
  await registrations.disable(user.uid);
  const saved = await AsyncStorage.getItem(receiptKey(user.uid));
  if (saved) {
    const record = JSON.parse(saved) as DeviceTokenDto;
    await api.disableDeviceToken(record.id, { registrationId: record.registrationId });
    await AsyncStorage.removeItem(receiptKey(user.uid));
  }
}
export async function beforeLogout() {
  // Queue cleanup with captured identity; do not hold local logout on network failure.
  await Promise.race([disableCurrentPush().catch(() => {}), new Promise<void>(resolve => setTimeout(resolve, 1500))]);
}
