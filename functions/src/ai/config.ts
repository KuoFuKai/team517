import type { AiProvider } from './provider';
import { DisabledAiProvider } from './provider';
import { MockAiProvider } from './mock-provider';

export function configuredAiProvider(env: NodeJS.ProcessEnv = process.env): AiProvider {
  // Never silently substitute mock output on a deployed/production backend.
  if (env.AI_PROVIDER === 'mock' && env.FUNCTIONS_EMULATOR === 'true' && env.NODE_ENV !== 'production') return new MockAiProvider();
  return new DisabledAiProvider();
}
