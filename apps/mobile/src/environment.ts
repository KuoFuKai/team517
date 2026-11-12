export type AppEnvironment = 'LOCAL' | 'PREVIEW' | 'PRODUCTION';
export const previewProject = 'team517-dev';
export const previewApiUrl = 'https://us-central1-team517-dev.cloudfunctions.net/api/api/v1';
export function resolveEnvironment(input: { environment?: string; developmentHost?: string; apiUrl?: string; authEmulatorUrl?: string }) {
  const raw = input.environment ?? 'LOCAL';
  const environment = (raw === 'development' ? 'LOCAL' : raw === 'production' ? 'PRODUCTION' : raw) as AppEnvironment;
  if (!['LOCAL', 'PREVIEW', 'PRODUCTION'].includes(environment)) throw new Error('Unknown app environment.');
  if (environment === 'PRODUCTION') throw new Error('PRODUCTION is reserved; no production configuration is enabled.');
  if (environment === 'PREVIEW') {
    const apiUrl = input.apiUrl ?? previewApiUrl;
    if (apiUrl !== previewApiUrl || input.authEmulatorUrl) throw new Error('PREVIEW requires the allowlisted team517-dev HTTPS API and no Auth emulator.');
    return { environment, brand: 'team517 Preview', apiUrl, useEmulators: false, authEmulatorUrl: undefined, firebaseProjectId: previewProject } as const;
  }
  const host = input.developmentHost ?? 'localhost';
  return { environment, brand: 'team517 Development', apiUrl: input.apiUrl ?? `http://${host}:5001/demo-team517/us-central1/api/api/v1`, useEmulators: true,
    authEmulatorUrl: input.authEmulatorUrl ?? `http://${host}:9199`, firebaseProjectId: 'demo-team517' } as const;
}
export interface FirebaseClientConfig { apiKey?: string; projectId?: string; appId?: string; authDomain?: string }
export function resolveFirebaseClient(environment: AppEnvironment, input: FirebaseClientConfig) {
  if (environment === 'PRODUCTION') throw new Error('PRODUCTION is reserved.');
  if (environment === 'LOCAL') return { apiKey: input.apiKey ?? 'demo-key', projectId: input.projectId ?? 'demo-team517', appId: input.appId ?? 'demo-app', authDomain: input.authDomain ?? 'demo-team517.firebaseapp.com' };
  if (!input.apiKey || input.apiKey === 'demo-key' || !input.appId || input.projectId !== previewProject || input.authDomain !== 'team517-dev.firebaseapp.com') throw new Error('PREVIEW requires explicit team517-dev Firebase client configuration.');
  return input as Required<FirebaseClientConfig>;
}
