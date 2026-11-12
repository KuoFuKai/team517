import type { TaskDraftFields, TaskDetailDto, TaskDraftSuggestionDto, AiTaskSummaryDto, GenerateTaskSuggestionRequest, ImproveTaskSuggestionRequest } from '@team517/contracts';
import { Store } from '../repositories/store';
import { TaskRepository } from '../repositories/tasks';
import { TaskService } from '../task/service';
import { authorize } from '../permissions/authorize';
import { ApiFailure } from '../shared/errors';
import { validatePublish } from '../validation/tasks';
import { type AiProvider, AiProviderUnavailable } from './provider';
import { providerFieldsSchema, structuredSuggestionSchema, summarySchema } from './validation';

export class AiTaskService {
  private tasks: TaskService;
  constructor(private store: Store, private provider: AiProvider, private repo = new TaskRepository(), private timeoutMs = 8000) {
    this.tasks = new TaskService(store, repo);
  }
  private async invoke(operation: (signal: AbortSignal) => Promise<unknown>) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([operation(controller.signal), new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new AiProviderUnavailable()); }, this.timeoutMs);
      })]);
    } catch (error) {
      if (error instanceof AiProviderUnavailable && error.code === 'AI_NOT_CONFIGURED') {
        throw new ApiFailure(503, 'AI_NOT_CONFIGURED', 'AI is not configured. Continue editing the draft manually, or enable explicit emulator mock mode.');
      }
      // Do not log vendor errors, prompts, transcripts or responses.
      throw new ApiFailure(503, 'AI_UNAVAILABLE', 'AI is temporarily unavailable. Your draft has not changed; continue manually.');
    } finally { if (timer) clearTimeout(timer); }
  }
  private fields(task: TaskDetailDto): Omit<TaskDraftFields, 'locationId'> {
    // Explicit whitelist; never send IDs, timestamps, profiles or addresses.
    return providerFieldsSchema.parse({ title: task.title, helpType: task.helpType, instructions: task.instructions,
      startAt: task.startAt, endAt: task.endAt, urgency: task.urgency, visibility: task.visibility,
      compensationType: task.compensationType, pointReward: task.pointReward, cashAmount: task.cashAmount, currency: task.currency });
  }
  private async editable(uid: string, taskId: string, contextId?: string) {
    const task = await this.tasks.get(uid, taskId);
    if (contextId && task.careContextId !== contextId) throw new ApiFailure(403, 'FORBIDDEN', 'The draft belongs to a different care context.');
    await authorize(this.store, uid, 'EDIT_TASK', task.careContextId, task.createdBy);
    if (task.status !== 'DRAFT') throw new ApiFailure(409, 'INVALID_TASK_STATE', 'AI suggestions may only improve a DRAFT.');
    return task;
  }
  async generateTaskSuggestion(uid: string, input: GenerateTaskSuggestionRequest): Promise<TaskDraftSuggestionDto> {
    await authorize(this.store, uid, 'CREATE_TASK', input.careContextId);
    const current = input.currentTaskId ? await this.editable(uid, input.currentTaskId, input.careContextId) : undefined;
    const raw = await this.invoke(signal => this.provider.generateStructuredTask({ text: input.text, timezone: input.timezone,
      referenceTime: new Date().toISOString(), ...(current ? { currentFields: this.fields(current) } : {}) }, signal));
    const result = structuredSuggestionSchema.safeParse(raw);
    if (!result.success) throw new ApiFailure(502, 'AI_INVALID_RESPONSE', 'AI returned invalid suggestion data. Your draft has not changed.');
    await authorize(this.store, uid, 'CREATE_TASK', input.careContextId);
    if (current) {
      const latest = await this.editable(uid, current.id, input.careContextId);
      if (latest.updatedAt !== current.updatedAt) throw new ApiFailure(409, 'AI_STALE_TASK', 'The draft changed while AI was working. Review it and generate another suggestion.');
    }
    const fields: TaskDraftFields = { ...result.data.fields };
    const warnings = [...result.data.warnings];
    if (result.data.locationText) {
      const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
      const matches = (await this.repo.listLocations(input.careContextId)).filter(place => normalize(place.label) === normalize(result.data.locationText!));
      if (matches.length === 1) fields.locationId = matches[0].id;
      else {
        fields.locationId = null;
        warnings.push('Location wording is not a unique known label. Clear any old location and select or create one manually.');
      }
    }
    const candidate = { ...(current ? this.fields(current) : {}), ...(current?.publicInstructions ? { publicInstructions: current.publicInstructions } : {}), ...(current?.locationId ? { locationId: current.locationId } : {}), ...fields };
    // The same publish validator computes readiness, without publishing/writing.
    for (const key of Object.keys(candidate)) if (candidate[key as keyof TaskDraftFields] === null) delete candidate[key as keyof TaskDraftFields];
    let missingFields: string[] = [];
    try { validatePublish(candidate); }
    catch (error) {
      if (!(error instanceof ApiFailure)) throw error;
      missingFields = [...new Set(error.fields?.map(field => field.field) ?? [])];
    }
    if (fields.startAt || fields.endAt) warnings.push(`Review the explicit timestamp offsets against ${input.timezone}; ambiguous natural-language times must be entered manually.`);
    return { fields, locationText: result.data.locationText, summary: result.data.summary, missingFields, warnings,
      providerMode: this.provider.mode, generatedAt: new Date().toISOString(), ...(current ? { sourceTaskUpdatedAt: current.updatedAt } : {}) };
  }
  async improveTaskSuggestion(uid: string, id: string, input: ImproveTaskSuggestionRequest) {
    const current = await this.editable(uid, id);
    return this.generateTaskSuggestion(uid, { ...input, careContextId: current.careContextId, currentTaskId: id });
  }
  async summarizeTask(uid: string, id: string): Promise<AiTaskSummaryDto> {
    const task = await this.tasks.get(uid, id);
    const raw = await this.invoke(signal => this.provider.summarizeTask(this.fields(task), signal));
    const result = summarySchema.safeParse(raw);
    if (!result.success) throw new ApiFailure(502, 'AI_INVALID_RESPONSE', 'AI returned an invalid summary. Task fields remain authoritative.');
    const latest = await this.tasks.get(uid, id);
    if (latest.updatedAt !== task.updatedAt) throw new ApiFailure(409, 'AI_STALE_TASK', 'The task changed; request a fresh summary.');
    return { ...result.data, providerMode: this.provider.mode, generatedAt: new Date().toISOString(), taskUpdatedAt: task.updatedAt };
  }
}
