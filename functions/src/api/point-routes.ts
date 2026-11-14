import { Router } from 'express';
import { PointService } from '../points/service';
export function pointRoutes() {
  const router = Router(), service = new PointService();
  router.get('/me/points', (_req, res, next) => { void service.account(res.locals.uid).then(value => res.json(value)).catch(next); });
  return router;
}
