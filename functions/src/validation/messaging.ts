import { ApiFailure } from '../shared/errors';
import { z } from 'zod';
export const messagingIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,200}$/);
const context = z.string().regex(/^[A-Za-z0-9]{20}$/);
export const conversationSchema = z.discriminatedUnion('scope', [z.object({ scope: z.literal('CARE_CONTEXT'), careContextId: context, otherUserId: messagingIdSchema }).strict(), z.object({ scope: z.literal('TASK'), taskId: context, otherUserId: messagingIdSchema }).strict()]);
export const textSchema = z.string().trim().min(1).max(2000).refine(text => !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text), 'Use plain text without HTML tags/control characters.');
export const messageSchema = z.object({ text: textSchema, clientMessageId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/) }).strict();
export const messageQuerySchema = z.object({ before: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional() }).strict();
export const taskConversationSchema = z.object({ otherUserId: messagingIdSchema.optional() }).strict();
export const emptyMessagingSchema = z.object({}).strict();

export function parseSendMessage(value: unknown) {
  const text = (value as { text?: unknown } | null)?.text;
  if (typeof text === 'string' && !text.trim()) throw new ApiFailure(400, 'MESSAGE_EMPTY', 'Enter a non-empty message.');
  if (typeof text === 'string' && text.trim().length > 2000) throw new ApiFailure(400, 'MESSAGE_TOO_LONG', 'Messages are limited to 2000 characters.');
  return messageSchema.parse(value);
}
