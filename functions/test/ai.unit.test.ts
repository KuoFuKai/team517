import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configuredAiProvider } from '../src/ai/config';
import { DisabledAiProvider } from '../src/ai/provider';
import { MockAiProvider } from '../src/ai/mock-provider';
import { structuredSuggestionSchema, parseAiInput, generateSchema } from '../src/ai/validation';

test('mock provider is explicit and unavailable outside the non-production Functions emulator', () => {
  assert.ok(configuredAiProvider({}) instanceof DisabledAiProvider);
  assert.ok(configuredAiProvider({ AI_PROVIDER: 'real' }) instanceof DisabledAiProvider);
  assert.ok(configuredAiProvider({ AI_PROVIDER: 'mock' }) instanceof DisabledAiProvider);
  assert.ok(configuredAiProvider({ AI_PROVIDER: 'mock', FUNCTIONS_EMULATOR: 'true', NODE_ENV: 'production' }) instanceof DisabledAiProvider);
  assert.ok(configuredAiProvider({ AI_PROVIDER: 'mock', FUNCTIONS_EMULATOR: 'true' }) instanceof MockAiProvider);
});
test('mock preserves uncertainty instead of inventing tomorrow in server time', async () => {
  const result = await new MockAiProvider().generateStructuredTask({ text: 'Make it urgent tomorrow afternoon', timezone: 'America/New_York',
    referenceTime: '2026-11-05T12:00:00Z', currentFields: { title: 'Existing', startAt: '2026-11-05T15:00:00Z' } });
  assert.equal(result.fields.urgency, 'URGENT'); assert.equal(result.fields.startAt, null);
  assert.ok(result.warnings.some(warning => warning.includes('ambiguous')));
});
test('structured provider fields reject backend state, IDs, invalid enums/dates/rewards and excessive text', () => {
  for (const fields of [{ status: 'OPEN' }, { createdBy: 'x' }, { id: 'x' }, { careContextId: 'x' }, { offerCount: 1 },
    { activeAssignmentId: 'x' }, { createdAt: 'x' }, { updatedAt: 'x' }, { publishedAt: 'x' }, { locationId: 'A'.repeat(20) },
    { urgency: 'NOW' }, { visibility: 'PUBLIC' }, { startAt: 'tomorrow' }, { pointReward: -1 }, { cashAmount: 0 },
    { cashAmount: Infinity }, { currency: 'usd' }, { title: 'X'.repeat(121) }, { instructions: 'X'.repeat(5001) }]) {
    assert.equal(structuredSuggestionSchema.safeParse({ fields }).success, false, JSON.stringify(fields));
  }
  assert.equal(structuredSuggestionSchema.safeParse({ fields: {}, reasoning: 'private chain of thought' }).success, false);
  assert.equal(structuredSuggestionSchema.safeParse({ fields: {} }).success, true);
});
test('AI input requires bounded text, an explicit timezone and no arbitrary provider parameters', () => {
  for (const input of [{ text: '' }, { text: 'x'.repeat(5001) }, { timezone: 'not/a-zone' }, { temperature: 1 }, { model: 'arbitrary' }]) {
    assert.throws(() => parseAiInput(generateSchema, { careContextId: 'A'.repeat(20), text: 'Help', timezone: 'UTC', ...input }));
  }
});
