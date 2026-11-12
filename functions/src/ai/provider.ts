import type { AiProviderMode, TaskDraftFields } from '@team517/contracts';

// Intentionally no identity, location IDs, profiles, database or write methods.
export interface StructuredTaskInput {
  text: string;
  timezone: string;
  referenceTime: string;
  currentFields?: Omit<TaskDraftFields, 'locationId'>;
}
export interface AiProvider {
  readonly mode: AiProviderMode;
  generateStructuredTask(input: StructuredTaskInput, signal: AbortSignal): Promise<unknown>;
  summarizeTask(fields: Omit<TaskDraftFields, 'locationId'>, signal: AbortSignal): Promise<unknown>;
}
export class AiProviderUnavailable extends Error {
  constructor(public code: 'AI_NOT_CONFIGURED' | 'AI_UNAVAILABLE' = 'AI_UNAVAILABLE') { super(code); }
}

export class DisabledAiProvider implements AiProvider {
  readonly mode = 'REAL' as const;
  async generateStructuredTask(): Promise<unknown> { throw new AiProviderUnavailable('AI_NOT_CONFIGURED'); }
  async summarizeTask(): Promise<unknown> { throw new AiProviderUnavailable('AI_NOT_CONFIGURED'); }
}
