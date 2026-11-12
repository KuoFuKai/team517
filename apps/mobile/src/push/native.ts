import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { acquirePushToken } from './acquire';
// Never import notifications in Expo Go: remote push is unsupported on Android.
export const pushAvailable = () => Platform.OS === 'android' && Constants.executionEnvironment !== 'storeClient';
export async function notificationsModule() {
  if (!pushAvailable()) return null;
  return import('expo-notifications');
}
export async function deviceToken(requestPermission: boolean, refreshedToken?: string) {
  const n = await notificationsModule();
  if (!n) return { state: 'unavailable' as const };
  await n.setNotificationChannelAsync('updates', { name: 'Task updates and messages', importance: n.AndroidImportance.DEFAULT });
  return acquirePushToken(n, requestPermission, refreshedToken);
}
