import { resolveEnvironment } from './environment';
// Expo statically inlines these explicit public references in the bundled JS.
export const config = resolveEnvironment({ environment: process.env.EXPO_PUBLIC_APP_ENV,
  developmentHost: process.env.EXPO_PUBLIC_DEV_HOST, apiUrl: process.env.EXPO_PUBLIC_API_URL,
  authEmulatorUrl: process.env.EXPO_PUBLIC_AUTH_EMULATOR_URL });
