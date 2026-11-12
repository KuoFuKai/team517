import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';
import Constants from 'expo-constants';
import { resolveFirebaseClient } from '../environment';
const bundled = config.useEmulators ? {} : Constants.expoConfig?.extra?.team517Firebase ?? {};
const app = initializeApp(resolveFirebaseClient(config.environment, {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? bundled.apiKey,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? bundled.projectId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? bundled.appId,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? bundled.authDomain,
}));
export const auth = initializeAuth(app,{persistence:getReactNativePersistence(AsyncStorage)});
if (config.useEmulators) connectAuthEmulator(auth, config.authEmulatorUrl,{disableWarnings:true});
