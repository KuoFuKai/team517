import { OfferAvailabilityService } from '../marketplace/availability-service';
import { z } from 'zod';
import { AssignmentService, type Transition } from '../assignment/service';
import { Router, type RequestHandler } from 'express';
import { MarketplaceService } from '../marketplace/service';
import { DiscoveryService } from '../discovery/service';
import { contextIdSchema } from '../validation/requests';
import { discoverySchema, offerHelpSchema, selectOfferSchema,updateAvailabilitySchema,reconfirmAvailabilitySchema,cancelAssignmentSchema } from '../validation/marketplace';

const route = (handler: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
export function marketplaceRoutes() {
  const router = Router(); const availability=new OfferAvailabilityService(); const market = new MarketplaceService(); const discovery = new DiscoveryService();
  router.get('/tasks/discover', route(async (req, res) => { res.json(await discovery.discover(res.locals.uid, discoverySchema.parse(req.query))); }));
  router.get('/tasks/:id/discovery', route(async (req, res) => { res.json(await discovery.get(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.post('/tasks/:id/offers', route(async (req, res) => { res.status(201).json(await market.offerHelp(res.locals.uid, contextIdSchema.parse(req.params.id), offerHelpSchema.parse(req.body))); }));
  router.post('/tasks/:id/offers/mine/withdraw', route(async (req, res) => { res.json(await market.withdraw(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.get('/tasks/:id/offers/mine', route(async (req, res) => { res.json(await market.mine(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.get('/tasks/:id/offers', route(async (req, res) => { res.json(await market.listOffers(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.post('/tasks/:id/select-offer', route(async (req, res) => { res.json(await market.select(res.locals.uid, contextIdSchema.parse(req.params.id), selectOfferSchema.parse(req.body).offerId,selectOfferSchema.parse(req.body).availabilityRevision)); }));
  router.get('/assignments/:id', route(async (req, res) => { res.json(await market.getAssignment(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.patch('/tasks/:id/offers/mine/availability',route(async(req,res)=>{res.json(await availability.update(res.locals.uid,contextIdSchema.parse(req.params.id),updateAvailabilitySchema.parse(req.body)));}));
  router.post('/assignments/:id/reconfirm-availability',route(async(req,res)=>{res.json(await availability.reconfirm(res.locals.uid,contextIdSchema.parse(req.params.id),reconfirmAvailabilitySchema.parse(req.body).expectedRevision));}));
  const assignments = new AssignmentService();
  router.get('/assignments/:id/task', route(async (req, res) => { res.json(await assignments.publicTask(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  router.get('/me/offers', route(async (_req, res) => { res.json(await assignments.myOffers(res.locals.uid)); }));
  router.get('/me/assignments', route(async (_req, res) => { res.json(await assignments.myAssignments(res.locals.uid)); }));
  router.get('/assignments/:id/execution', route(async (req, res) => { res.json(await assignments.execution(res.locals.uid, contextIdSchema.parse(req.params.id))); }));
  const empty = z.object({}).strict();
  const dispute = z.object({ reason: z.string().trim().min(1).max(500).optional() }).strict();
  for (const operation of ['confirm', 'decline', 'cancel', 'start', 'request-completion', 'confirm-completion', 'dispute'] as Transition[]) {
    router.post('/assignments/:id/' + operation, route(async (req, res) => {
      const body = operation === 'dispute' ? dispute.parse(req.body) : operation==='cancel' ? cancelAssignmentSchema.parse(req.body) : empty.parse(req.body);
      res.json(await assignments.transition(res.locals.uid, contextIdSchema.parse(req.params.id), operation, 'reason' in body ? body.reason as string : undefined,'expectedAvailabilityRevision' in body ? body.expectedAvailabilityRevision as number|undefined : undefined));
    }));
  }
  return router;
}
