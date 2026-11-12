import { Router, type RequestHandler } from 'express';
import { contextIdSchema } from '../validation/requests';
import { generateSchema, improveSchema, summaryRequestSchema, parseAiInput } from '../ai/validation';
import type { AiTaskService } from '../ai/service';

const route = (handler: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
export function aiRoutes(service: AiTaskService) {
  const router = Router();
  router.post('/ai/task-suggestions', route(async (req, res) => {
    res.json(await service.generateTaskSuggestion(res.locals.uid, parseAiInput(generateSchema, req.body)));
  }));
  router.post('/tasks/:id/ai-suggestions', route(async (req, res) => {
    res.json(await service.improveTaskSuggestion(res.locals.uid, contextIdSchema.parse(req.params.id), parseAiInput(improveSchema, req.body)));
  }));
  router.post('/tasks/:id/ai-summary', route(async (req, res) => {
    parseAiInput(summaryRequestSchema, req.body ?? {});
    res.json(await service.summarizeTask(res.locals.uid, contextIdSchema.parse(req.params.id)));
  }));
  return router;
}
