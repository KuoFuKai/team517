import { z } from 'zod';
import type { ValidationField } from '@team517/contracts';
import { ApiFailure } from '../shared/errors';
import { contextIdSchema } from './requests';

const shortText = z.string().trim().max(120);
const timestamp = z.string().datetime({ offset: true });
const urgency = z.enum(['PLANNED', 'URGENT']);
const visibility = z.enum(['CARE_CIRCLE', 'VERIFIED_HELPERS']);
const compensation = z.enum(['VOLUNTEER', 'POINTS', 'PAID']);
const pointReward = z.number().int().positive().max(1_000_000);
const cashAmount = z.number().positive().max(1_000_000);
const currency = z.string().regex(/^[A-Z]{3}$/, 'Use a three-letter uppercase currency code.');

export const draftSchema = z.object({
  title: shortText.nullable().optional(),
  helpType: z.string().trim().max(80).nullable().optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
  publicInstructions: z.string().trim().max(2000).nullable().optional(),
  privateInstructions: z.string().trim().max(2000).nullable().optional(),
  startAt: timestamp.nullable().optional(),
  endAt: timestamp.nullable().optional(),
  locationId: contextIdSchema.nullable().optional(),
  urgency: urgency.nullable().optional(),
  visibility: visibility.nullable().optional(),
  compensationType: compensation.nullable().optional(),
  pointReward: pointReward.nullable().optional(),
  cashAmount: cashAmount.nullable().optional(),
  currency: currency.nullable().optional(),
}).strict();

export const locationSchema = z.object({
  label: z.string().trim().min(1).max(80),
  formattedAddress: z.string().trim().min(1).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).strict().refine(value => (value.latitude === undefined) === (value.longitude === undefined), {
  path: ['latitude'], message: 'Supply both coordinates or neither.',
});

const publishSchema = z.object({
  title: shortText.min(1),
  helpType: z.string().trim().min(1).max(80),
  instructions: z.string().trim().max(5000).optional(),
  publicInstructions: z.string().trim().max(2000).optional(),
  privateInstructions: z.string().trim().max(2000).optional(),
  startAt: timestamp,
  endAt: timestamp,
  locationId: contextIdSchema,
  urgency, visibility, compensationType: compensation,
  pointReward: pointReward.optional(), cashAmount: cashAmount.optional(), currency: currency.optional(),
}).superRefine((task, ctx) => {
  const issue = (field: string, message: string) => ctx.addIssue({ code: 'custom', path: [field], message });
  if (!task.instructions?.trim() && !task.publicInstructions?.trim()) issue('instructions', 'Public instructions or existing legacy instructions are required.');
  if (Date.parse(task.startAt) >= Date.parse(task.endAt)) issue('endAt', 'End time must be later than start time.');
  if (task.compensationType === 'POINTS' && task.pointReward === undefined) issue('pointReward', 'A positive integer point reward is required.');
  if (task.compensationType === 'PAID') {
    if (task.cashAmount === undefined) issue('cashAmount', 'A positive cash amount is required.');
    if (!task.currency) issue('currency', 'A three-letter currency code is required.');
  }
  if (task.compensationType !== 'POINTS' && task.pointReward !== undefined) issue('pointReward', 'Only POINTS tasks may include a point reward.');
  if (task.compensationType !== 'PAID') {
    if (task.cashAmount !== undefined) issue('cashAmount', 'Only PAID tasks may include a cash amount.');
    if (task.currency !== undefined) issue('currency', 'Only PAID tasks may include a currency.');
  }
});

export function validationFields(error: z.ZodError): ValidationField[] {
  return error.issues.map(issue => ({ field: issue.path.join('.') || 'body', message: issue.message }));
}
export function validatePublish(value: unknown) {
  const result = publishSchema.safeParse(value);
  if (!result.success) throw new ApiFailure(400, 'TASK_NOT_READY', 'Task is not ready to publish.', validationFields(result.error));
  return result.data;
}
