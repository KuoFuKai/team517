// Fictional presentation identities for one explicitly selected LOCAL scenario.
// Never a source of authorization, verification, reviews or business state.
export const makerDay3People: Readonly<Record<string, { name: string; relationship: string }>> = {
  md3GraceChen: { name: 'Grace Chen', relationship: 'Daughter · Primary caregiver' },
  md3LindaChen: { name: 'Linda Chen', relationship: 'Mom' },
  md3MarcusChen: { name: 'Marcus Chen', relationship: 'Family' },
  md3LenaWu: { name: 'Lena Wu', relationship: 'Family friend' },
};
export function allowMakerDay3(config: { environment: string; firebaseProjectId: string; useEmulators: boolean; apiUrl: string }, requested?: string) {
  return requested === 'maker-day-3' && config.environment === 'LOCAL' && config.firebaseProjectId === 'demo-team517' && config.useEmulators
    && /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2):5001\/demo-team517\/us-central1\/api\/api\/v1$/.test(config.apiUrl);
}
export function makerDay3Person(id: string | undefined, enabled: boolean) {
  return enabled && id ? makerDay3People[id] : undefined;
}
