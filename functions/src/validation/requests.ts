import { z } from 'zod';
export const initializeSchema = z.object({primaryOnboardingRole:z.enum(['CARE_RECEIVER','CARE_MANAGER','HELPER'])}).strict();
export const createContextSchema = z.object({name:z.string().trim().min(1).max(120)}).strict();
export const contextIdSchema = z.string().regex(/^[A-Za-z0-9]{20}$/);
