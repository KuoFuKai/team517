import { Router, type RequestHandler } from 'express';
import { MessagingService } from '../messaging/service';
import { messagingIdSchema, conversationSchema, parseSendMessage, messageQuerySchema, emptyMessagingSchema, taskConversationSchema } from '../validation/messaging';
import { contextIdSchema } from '../validation/requests';
const route = (fn: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
export function messagingRoutes() {
  const router = Router(), service = new MessagingService();
  router.get('/me/conversations', route(async (_req, res) => { res.json(await service.inbox(res.locals.uid)); }));
  router.post('/conversations', route(async (req, res) => { res.json(await service.create(res.locals.uid, conversationSchema.parse(req.body))); }));
  router.get('/conversations/:id', route(async (req, res) => { res.json(await service.detail(res.locals.uid, messagingIdSchema.parse(req.params.id))); }));
  router.get('/conversations/:id/messages', route(async (req, res) => { res.json(await service.messages(res.locals.uid, messagingIdSchema.parse(req.params.id), messageQuerySchema.parse(req.query).before)); }));
  router.post('/conversations/:id/messages', route(async (req, res) => { res.status(201).json(await service.send(res.locals.uid, messagingIdSchema.parse(req.params.id), parseSendMessage(req.body))); }));
  router.post('/conversations/:id/read', route(async (req, res) => { emptyMessagingSchema.parse(req.body); res.json(await service.read(res.locals.uid, messagingIdSchema.parse(req.params.id))); }));
  router.post('/tasks/:id/conversations', route(async (req, res) => { res.json(await service.forTask(res.locals.uid, contextIdSchema.parse(req.params.id), taskConversationSchema.parse(req.body).otherUserId)); }));
  router.get('/care-contexts/:id/messaging-members', route(async (req, res) => { res.json(await service.members(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  return router;
}
