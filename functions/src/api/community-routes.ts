import { Router, type RequestHandler } from 'express';
import { CommunityService } from '../community/service';
import { communityIdSchema, createPostSchema, feedSchema, resourceSchema, shareSchema, commentSchema, emptyCommunitySchema } from '../validation/community';
const route = (fn: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
export function communityRoutes() {
  const router = Router(), service = new CommunityService();
  const id = (value: unknown) => communityIdSchema.parse(value);
  router.get('/community/feed', route(async (req, res) => { res.json(await service.feed(res.locals.uid, feedSchema.parse(req.query))); }));
  router.post('/community/posts', route(async (req, res) => { res.status(201).json(await service.create(res.locals.uid, createPostSchema.parse(req.body))); }));
  router.get('/community/posts/:id', route(async (req, res) => { res.json(await service.detail(res.locals.uid, id(req.params.id))); }));
  router.get('/community/posts/:id/comments', route(async (req, res) => { res.json(await service.comments(res.locals.uid, id(req.params.id))); }));
  router.post('/community/posts/:id/comments', route(async (req, res) => { res.status(201).json(await service.comment(res.locals.uid, id(req.params.id), commentSchema.parse(req.body).body)); }));
  router.post('/community/posts/:id/like', route(async (req, res) => { emptyCommunitySchema.parse(req.body); res.json(await service.like(res.locals.uid, id(req.params.id), true)); }));
  router.post('/community/posts/:id/unlike', route(async (req, res) => { emptyCommunitySchema.parse(req.body); res.json(await service.like(res.locals.uid, id(req.params.id), false)); }));
  router.post('/community/posts/:id/share', route(async (req, res) => { res.status(201).json(await service.share(res.locals.uid, id(req.params.id), shareSchema.parse(req.body))); }));
  router.post('/resources', route(async (req, res) => { res.status(201).json(await service.createResource(res.locals.uid, resourceSchema.parse(req.body))); }));
  router.get('/resources/:id', route(async (req, res) => { res.json(await service.getResource(res.locals.uid, id(req.params.id))); }));
  router.post('/resources/:id/save', route(async (req, res) => { emptyCommunitySchema.parse(req.body); res.json(await service.save(res.locals.uid, id(req.params.id), true)); }));
  router.post('/resources/:id/unsave', route(async (req, res) => { emptyCommunitySchema.parse(req.body); res.json(await service.save(res.locals.uid, id(req.params.id), false)); }));
  router.get('/me/saved-resources', route(async (_req, res) => { res.json(await service.saved(res.locals.uid)); }));
  return router;
}
