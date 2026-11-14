import { pointRoutes } from './point-routes';
import { pushRoutes } from './push-routes';
import { messagingRoutes } from './messaging-routes';
import { communityRoutes } from './community-routes';
import { supportRoutes } from './support-routes';
import express, { type RequestHandler, type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import { authenticate } from '../auth/authenticate';
import { Store } from '../repositories/store';
import { CareContextService, userDto } from '../care-context/service';
import { ApiFailure } from '../shared/errors';
import { initializeSchema, createContextSchema, contextIdSchema } from '../validation/requests';
import { taskRoutes } from './task-routes';
import { validationFields } from '../validation/tasks';
import { AiTaskService } from '../ai/service';
import { configuredAiProvider } from '../ai/config';
import { aiRoutes } from './ai-routes';
import type { AiProvider } from '../ai/provider';
import { marketplaceRoutes } from './marketplace-routes';
import { updateRolePreference } from '../auth/preferences';
import { rolePreferenceSchema } from '../validation/marketplace';
const asyncRoute = (fn: RequestHandler): RequestHandler => (req,res,next) => { Promise.resolve(fn(req,res,next)).catch(next); };
export function createApp(store: Store, verify = authenticate, aiProvider: AiProvider = configuredAiProvider()) {
  const app = express(); const contexts = new CareContextService(store);
  app.disable('x-powered-by'); app.use(cors()); app.use(express.json({limit:'16kb'}));
  app.get('/api/v1/health',(_req,res)=>{res.json({status:'ok',service:'team517-api'});});
  const api = express.Router();
  api.use(asyncRoute(async (req,res,next)=>{res.locals.uid=await verify(req.header('authorization')); next();}));
  api.get('/me',asyncRoute(async (_req,res)=>{const u=await store.user(res.locals.uid); if (!u) throw new ApiFailure(404,'USER_NOT_FOUND','Initialize your app user first.'); res.json(userDto(u));}));
  api.patch('/me/preferences', asyncRoute(async (req, res) => { res.json(await updateRolePreference(store, res.locals.uid, rolePreferenceSchema.parse(req.body).lastActiveRole)); }));
  api.post('/users/initialize',asyncRoute(async (req,res)=>{const body=initializeSchema.parse(req.body); res.json(userDto(await store.initialize(res.locals.uid,body.primaryOnboardingRole)));}));
  api.post('/care-contexts',asyncRoute(async (req,res)=>{const body=createContextSchema.parse(req.body); res.status(201).json(await contexts.create(res.locals.uid,body.name));}));
  api.get('/care-contexts',asyncRoute(async (_req,res)=>{res.json({careContexts:await contexts.list(res.locals.uid)});}));
  api.get('/care-contexts/:id',asyncRoute(async (req,res)=>{res.json(await contexts.get(res.locals.uid,contextIdSchema.parse(req.params.id)));}));
  api.use(pointRoutes());
  api.use(pushRoutes());
  api.use(messagingRoutes());
  api.use(communityRoutes());
  api.use(supportRoutes());
  api.use(marketplaceRoutes());
  api.use(taskRoutes(store));
  api.use(aiRoutes(new AiTaskService(store, aiProvider)));
  app.use('/api/v1',api);
  app.use((_req,_res,next)=>next(new ApiFailure(404,'NOT_FOUND','Endpoint not found.')));
  const errors: ErrorRequestHandler = (err,_req,res,_next)=>{
    if (err instanceof ZodError) {res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Invalid request.',fields:validationFields(err)}}); return;}
    if (err instanceof ApiFailure) {res.status(err.status).json({error:{code:err.code,message:err.message,...(err.fields ? {fields:err.fields} : {})}}); return;}
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {res.status(400).json({error:{code:'INVALID_BODY',message:'Invalid JSON body.'}}); return;}
    console.error('Request failed',err); res.status(500).json({error:{code:'INTERNAL',message:'Internal server error.'}});
  }; app.use(errors); return app;
}
