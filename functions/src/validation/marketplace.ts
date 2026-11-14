import { z } from 'zod';
const instant = z.iso.datetime({offset:true}).refine(value=>{const year=new Date(value).getUTCFullYear();return year>=1 && year<=9999;},'Choose a supported calendar year.');
export const offerHelpSchema = z.object({ message: z.string().trim().max(1000).optional(), availableFrom: instant.optional(), availableUntil: instant.optional() }).strict().superRefine((value,ctx)=>{
  if ((value.availableFrom === undefined) !== (value.availableUntil === undefined)) ctx.addIssue({code:'custom',path:['availableUntil'],message:'Supply both availability times, or omit both.'});
  if (value.availableFrom && value.availableUntil && Date.parse(value.availableUntil) <= Date.parse(value.availableFrom)) ctx.addIssue({code:'custom',path:['availableUntil'],message:'Availability must end after it starts.'});
});
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
