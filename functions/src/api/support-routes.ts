import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { SupportService } from '../support/service';
import { contextIdSchema } from '../validation/requests';
export const calendarQuerySchema = z.object({ start: z.string().datetime({ offset: true }), end: z.string().datetime({ offset: true }) }).strict().refine(q => Date.parse(q.end) > Date.parse(q.start) && Date.parse(q.end) - Date.parse(q.start) <= 93 * 86400000, 'Use an increasing date range of at most 93 days.');
export const createReviewSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(1).max(1000).optional() }).strict();
const resourceIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,200}$/);
const empty = z.object({}).strict();
const route = (fn: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
export function supportRoutes() {
  const router = Router(), service = new SupportService();
  router.get('/me/calendar', route(async (req, res) => { res.json(await service.calendar(res.locals.uid, calendarQuerySchema.parse(req.query))); }));
  router.get('/me/verification', route(async (_req, res) => { res.json(await service.verification(res.locals.uid)); }));
  router.get('/me/notifications', route(async (_req, res) => { res.json(await service.notifications(res.locals.uid)); }));
  router.get('/notifications/:id', route(async (req, res) => { res.json(await service.notification(res.locals.uid, resourceIdSchema.parse(req.params.id))); }));
  router.post('/notifications/:id/read', route(async (req, res) => { empty.parse(req.body); res.json(await service.read(res.locals.uid, resourceIdSchema.parse(req.params.id))); }));
  router.post('/me/notifications/read-all', route(async (req, res) => { empty.parse(req.body); res.json(await service.readAll(res.locals.uid)); }));
  router.post('/assignments/:id/reviews', route(async (req, res) => { res.status(201).json(await service.submitReview(res.locals.uid, contextIdSchema.parse(req.params.id), createReviewSchema.parse(req.body))); }));
  router.get('/helpers/:id/reviews', route(async (req, res) => { res.json(await service.reviews(res.locals.uid, resourceIdSchema.parse(req.params.id))); }));
  router.get('/helpers/:id/rating', route(async (req, res) => { res.json(await service.rating(res.locals.uid, resourceIdSchema.parse(req.params.id))); }));
  router.get('/tasks/:id/timeline', route(async (req, res) => { res.json(await service.timeline(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  return router;
}
