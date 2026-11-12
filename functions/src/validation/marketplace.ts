import { z } from 'zod';
export const offerHelpSchema = z.object({ message: z.string().trim().max(1000).optional() }).strict();
export const selectOfferSchema = z.object({ offerId: z.string().min(22).max(180).regex(/^[A-Za-z0-9_-]+$/) }).strict();
export const discoverySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional(),
  urgency: z.enum(['PLANNED', 'URGENT']).optional(), compensationType: z.enum(['VOLUNTEER', 'POINTS', 'PAID']).optional(),
}).strict().superRefine((value, ctx) => {
  if ((value.latitude === undefined) !== (value.longitude === undefined)) ctx.addIssue({ code: 'custom', path: ['latitude'], message: 'Supply latitude and longitude together.' });
  if (value.radiusKm !== undefined && value.latitude === undefined) ctx.addIssue({ code: 'custom', path: ['radiusKm'], message: 'Radius requires explicit coordinates.' });
});
export const rolePreferenceSchema = z.object({ lastActiveRole: z.enum(['CARE_RECEIVER', 'CARE_MANAGER', 'HELPER']) }).strict();
