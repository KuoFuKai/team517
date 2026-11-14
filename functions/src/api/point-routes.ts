import { z } from 'zod';
import { Router } from 'express';
import { PointService } from '../points/service';
export function pointRoutes() {
  const router = Router(), service = new PointService();
  router.get('/me/points', (_req, res, next) => { void service.account(res.locals.uid).then(value => res.json(value)).catch(next); });
  router.get('/me/points/transactions', (req, res, next) => {
    try { const {cursor} = z.object({cursor:z.string().regex(/^[A-Za-z0-9_-]{1,1400}$/).optional()}).parse(req.query); void service.history(res.locals.uid,cursor).then(value=>res.json(value)).catch(next); } catch(error) { next(error); }
  });
  return router;
}
