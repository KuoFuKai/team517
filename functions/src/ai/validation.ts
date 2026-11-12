import { z } from 'zod';
import { draftSchema, validationFields } from '../validation/tasks';
import { contextIdSchema } from '../validation/requests';
import { ApiFailure } from '../shared/errors';

const timezone = z.string().min(1).max(80).refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return true; } catch { return false; }
}, 'Use an explicit valid IANA timezone, such as America/New_York or UTC.');
export const generateSchema = z.object({
  careContextId: contextIdSchema, text: z.string().trim().min(1).max(5000), timezone,
  currentTaskId: contextIdSchema.optional(),
}).strict();
export const improveSchema = generateSchema.omit({ careContextId: true, currentTaskId: true });
export const summaryRequestSchema = z.object({}).strict();
// Provider JSON cannot choose any Location ID or backend-owned Task field.
export const providerFieldsSchema = draftSchema.omit({ locationId: true, publicInstructions: true, privateInstructions: true });
const warnings = z.array(z.string().trim().min(1).max(300)).max(10).default([]);
export const structuredSuggestionSchema = z.object({
  fields: providerFieldsSchema,
  locationText: z.string().trim().min(1).max(500).optional(),
  summary: z.string().trim().min(1).max(800).optional(),
  warnings,
}).strict();
export const summarySchema = z.object({ summary: z.string().trim().min(1).max(800), warnings }).strict();

export function parseAiInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ApiFailure(400, 'INVALID_AI_INPUT', 'Check the AI input and timezone.', validationFields(parsed.error));
  return parsed.data;
}
