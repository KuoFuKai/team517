import { Router, type RequestHandler } from 'express';
import { Store } from '../repositories/store';
import { TaskService } from '../task/service';
import { contextIdSchema } from '../validation/requests';
import { draftSchema, locationSchema } from '../validation/tasks';

const route = (handler: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
export function taskRoutes(store: Store) {
  const router = Router();
  const service = new TaskService(store);
  router.post('/care-contexts/:id/locations', route(async (req, res) => {
    res.status(201).json(await service.createLocation(res.locals.uid, contextIdSchema.parse(req.params.id), locationSchema.parse(req.body)));
  }));
  router.get('/care-contexts/:id/locations', route(async (req, res) => {
    res.json({ locations: await service.listLocations(res.locals.uid, contextIdSchema.parse(req.params.id)) });
  }));
  router.post('/care-contexts/:id/tasks/drafts', route(async (req, res) => {
    res.status(201).json(await service.createDraft(res.locals.uid, contextIdSchema.parse(req.params.id), draftSchema.parse(req.body)));
  }));
  router.get('/care-contexts/:id/tasks', route(async (req, res) => {
    res.json({ tasks: await service.list(res.locals.uid, contextIdSchema.parse(req.params.id)) });
  }));
  router.get('/tasks/:id', route(async (req, res) => {
    res.json(await service.get(res.locals.uid, contextIdSchema.parse(req.params.id)));
  }));
  router.patch('/tasks/:id', route(async (req, res) => {
    res.json(await service.update(res.locals.uid, contextIdSchema.parse(req.params.id), draftSchema.parse(req.body)));
  }));
  router.post('/tasks/:id/publish', route(async (req, res) => {
    res.json(await service.publish(res.locals.uid, contextIdSchema.parse(req.params.id)));
  }));
  router.post('/tasks/:id/cancel', route(async (req, res) => {
    res.json(await service.cancel(res.locals.uid, contextIdSchema.parse(req.params.id)));
  }));
  return router;
}
