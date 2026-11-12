export const PREVIEW_PROJECT = 'team517-dev';
export const PREVIEW_CONTEXT_ID = 'team517PreviewCare01';
export const PREVIEW_LOCATION_ID = 'team517PreviewLoc001';
export const PREVIEW_API = 'https://us-central1-team517-dev.cloudfunctions.net/api/api/v1';
export function assertDeploymentUserEnvironment(env: Record<string, string | undefined> = process.env) {
  if (env.GOOGLE_APPLICATION_CREDENTIALS || env.FIREBASE_TOKEN) throw new Error('Deployment requires Firebase CLI user login without runtime ADC/token overrides.');
}
export function assertPreviewTarget(project: string | undefined, env: Record<string, string | undefined> = process.env) {
  if (project !== PREVIEW_PROJECT) throw new Error('Explicit --project team517-dev is required; every other project is refused.');
  if (env.CI || env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST || env.FUNCTIONS_EMULATOR) throw new Error('Preview admin tools refuse CI and emulator environments.');
  for (const key of ['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT']) if (env[key] && env[key] !== PREVIEW_PROJECT) throw new Error('Conflicting project environment; refusing cloud access.');
  if (['PRODUCTION', 'production'].includes(env.EXPO_PUBLIC_APP_ENV ?? '')) throw new Error('Production is refused.');
}
