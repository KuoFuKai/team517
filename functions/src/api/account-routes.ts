import {Router,type RequestHandler} from 'express';import {z} from 'zod';import type {Store} from '../repositories/store';
import {AccountService} from '../account/service';import {firstNamePattern} from '../account/policy';
const route=(fn:RequestHandler):RequestHandler=>(req,res,next)=>{Promise.resolve(fn(req,res,next)).catch(next);};
const onboarding=z.object({publicFirstName:z.string().trim().regex(firstNamePattern),usage:z.enum(['NEED_HELP','HELPER','BOTH'])}).strict();
const role=z.object({role:z.enum(['CARE_RECEIVER','CARE_MANAGER','HELPER'])}).strict();
const deletion=z.object({confirmation:z.literal('DELETE'),appleAuthorizationCode:z.string().min(1).max(4096).optional()}).strict();
export function accountRoutes(_store:Store){const r=Router(),service=new AccountService();
 r.post('/me/onboarding',route(async(req,res)=>res.json(await service.onboard(res.locals.uid,onboarding.parse(req.body)))));
 r.post('/me/roles',route(async(req,res)=>res.json(await service.addRole(res.locals.uid,role.parse(req.body).role))));
 r.post('/me/delete-account',route(async(req,res)=>{const body=deletion.parse(req.body);res.json(await service.delete(res.locals.uid,req.header('authorization')!.slice(7),body.appleAuthorizationCode));}));return r;
}
