import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { DeviceTokenService } from '../push/devices';
export const registerDeviceSchema = z.object({ token: z.string().min(20).max(4096).regex(/^[A-Za-z0-9_:.-]+$/), platform: z.literal('android'), deviceId: z.string().min(1).max(128).optional(), appVersion: z.string().min(1).max(64).optional(), deliveryEnabled: z.boolean().optional() }).strict();
const id = z.string().regex(/^[a-f0-9]{64}$/), disable = z.object({ registrationId: z.string().uuid() }).strict();
const route = (fn: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
export function pushRoutes() {
  const router = Router(), repo = new DeviceTokenService();
  router.post('/me/device-tokens', route(async (req, res) => { res.json(await repo.register(res.locals.uid, registerDeviceSchema.parse(req.body))); }));
  router.get('/me/device-tokens/:id', route(async (req, res) => { res.json(await repo.status(res.locals.uid, id.parse(req.params.id))); }));
  router.post('/me/device-tokens/:id/disable', route(async (req, res) => { res.json(await repo.disable(res.locals.uid, id.parse(req.params.id), disable.parse(req.body).registrationId)); }));
  return router;
}
