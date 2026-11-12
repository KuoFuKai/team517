import { z } from 'zod';
export const communityIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,200}$/);
const scope = { visibility: z.enum(['PUBLIC_VERIFIED', 'CARE_CIRCLE']), careContextId: z.string().regex(/^[A-Za-z0-9]{20}$/).optional() };
const post = { ...scope, body: z.string().trim().min(1).max(3000), title: z.string().trim().min(1).max(120).optional() };
function validScope(v: { visibility: string; careContextId?: string }) { return (v.visibility === 'CARE_CIRCLE') === Boolean(v.careContextId); }
export const createPostSchema = z.discriminatedUnion('type', [
  z.object({ ...post, type: z.literal('NEED'), taskId: z.string().regex(/^[A-Za-z0-9]{20}$/) }).strict(),
  z.object({ ...post, type: z.literal('RESOURCE'), resourceId: communityIdSchema }).strict(),
  z.object({ ...post, type: z.literal('SHARE'), originalPostId: communityIdSchema }).strict(),
]).refine(validScope, 'Supply a care context only for CARE_CIRCLE visibility.');
export const shareSchema = z.object(post).strict().refine(validScope, 'Supply a care context only for CARE_CIRCLE visibility.');
export const safeUrl = z.string().url().max(2000).refine(value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; } }, 'Use an HTTPS link without credentials.');
export const resourceSchema = z.object({ ...scope, title: z.string().trim().min(1).max(120), summary: z.string().trim().min(1).max(2000), category: z.string().trim().min(1).max(60), url: safeUrl.optional() }).strict().refine(validScope, 'Supply a care context only for CARE_CIRCLE visibility.');
export const commentSchema = z.object({ body: z.string().trim().min(1).max(1000) }).strict();
export const feedSchema = z.object({ type: z.enum(['NEED', 'RESOURCE', 'SHARE']).optional(), careContextId: z.string().regex(/^[A-Za-z0-9]{20}$/).optional() }).strict();
export const emptyCommunitySchema = z.object({}).strict();
