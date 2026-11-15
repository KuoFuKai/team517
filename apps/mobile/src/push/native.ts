import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { acquirePushToken } from './acquire';
// Never import notifications in Expo Go: remote push is unsupported on Android.
export const pushAvailable = () => (Platform.OS === 'android' || (Platform.OS === 'ios' && Constants.expoConfig?.extra?.team517IosPushEnabled === true)) && Constants.executionEnvironment !== 'storeClient';
export async function notificationsModule() {
  if (!pushAvailable()) return null;
  return import('expo-notifications');
}
export async function deviceToken(requestPermission: boolean, refreshedToken?: string) {
  const n = await notificationsModule();
  if (!n) return { state: 'unavailable' as const };
  if(Platform.OS==='ios'){let p=await n.getPermissionsAsync();if(!p.granted&&requestPermission)p=await n.requestPermissionsAsync();if(!p.granted)return {state:'denied' as const};try{const {getMessaging,getToken,registerDeviceForRemoteMessages}=await import('@react-native-firebase/messaging');const messaging=getMessaging();await registerDeviceForRemoteMessages(messaging);const token=refreshedToken??await getToken(messaging);return {state:'granted' as const,token};}catch{return {state:'unavailable' as const};}}
  await n.setNotificationChannelAsync('updates', { name: 'Task updates and messages', importance: n.AndroidImportance.DEFAULT });
  return acquirePushToken(n, requestPermission, refreshedToken);
}
