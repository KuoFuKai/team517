import { Router } from 'express';
import { z } from 'zod';
import { contextIdSchema } from '../validation/requests';
import { TrustService } from '../trust/service';
export function trustRoutes(){const router=Router(),service=new TrustService();router.get('/helpers/:id/profile',(req,res,next)=>{void (async()=>{const id=z.string().regex(/^[A-Za-z0-9_-]{1,200}$/).parse(req.params.id),q=z.object({taskId:contextIdSchema.optional()}).strict().parse(req.query);res.json(await service.profile(res.locals.uid,id,q.taskId));})().catch(next);});return router;}
