import {z} from 'zod';
import {instant,revisionSchema} from './marketplace';
import {contextIdSchema} from './requests';
export const rescheduleSchema=z.object({startAt:instant,endAt:instant,expectedRevision:revisionSchema,expectedAssignmentId:contextIdSchema.nullable()}).strict().superRefine((v,ctx)=>{
 if(Date.parse(v.endAt)<=Date.parse(v.startAt))ctx.addIssue({code:'custom',path:['endAt'],message:'End time must be later than start time.'});
});
