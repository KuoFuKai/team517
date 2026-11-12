import { AssignmentService } from '../assignment/service';
import { Timestamp } from 'firebase-admin/firestore';
import type { CreateLocationRequest, TaskDraftFields } from '@team517/contracts';
import type { Task, Location } from '../domain/task';
import { authorize, canViewTask } from '../permissions/authorize';
import { Store } from '../repositories/store';
import { TaskRepository } from '../repositories/tasks';
import { ApiFailure } from '../shared/errors';
import { validatePublish } from '../validation/tasks';
import { locationDto, taskDetailDto, taskSummaryDto } from './dto';

// Only validated, public draft fields enter this mapper. Null removes a field.
function mergeDraft(task: Partial<Task>, fields: TaskDraftFields): Partial<Task> {
  const merged: Record<string, unknown> = { ...task };
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) delete merged[key];
    else merged[key] = (key === 'startAt' || key === 'endAt') ? Timestamp.fromDate(new Date(value as string)) : value;
  }
  return merged;
}
function checkLocation(location: Location | undefined, contextId: string) {
  if (!location || location.careContextId !== contextId) {
    throw new ApiFailure(400, 'INVALID_LOCATION', 'Select a location belonging to this care context.', [{ field: 'locationId', message: 'Location must exist in the same care context.' }]);
  }
}
function requireDraft(task: Task) {
  if (task.status !== 'DRAFT') throw new ApiFailure(409, 'INVALID_TASK_STATE', 'Only a draft can be edited or published.');
}

export class TaskService {
  constructor(private store: Store, private repo = new TaskRepository()) {}
  async createLocation(uid: string, contextId: string, data: CreateLocationRequest) {
    return locationDto(await this.repo.createLocation(uid, contextId, data, async reader => { await authorize(reader, uid, 'CREATE_LOCATION', contextId); }));
  }
  async listLocations(uid: string, contextId: string) {
    await authorize(this.store, uid, 'VIEW_LOCATION', contextId);
    return (await this.repo.listLocations(contextId)).map(locationDto);
  }
  async createDraft(uid: string, contextId: string, fields: TaskDraftFields) {
    const task = await this.repo.createDraft(mergeDraft({}, fields), uid, contextId, async reads => {
      await authorize(reads.permissions, uid, 'CREATE_TASK', contextId);
      if (fields.locationId) checkLocation(await reads.location(fields.locationId), contextId);
    });
    return taskDetailDto(task);
  }
  async get(uid: string, id: string) {
    const task = await this.repo.task(id);
    if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
    const member = await authorize(this.store, uid, 'VIEW_TASK', task.careContextId, task.createdBy, task.status);
    const dto = taskDetailDto(task);
    // Operational instructions are a separate privilege from trusted-circle Task reads.
    if (task.createdBy !== uid && member?.role !== 'CARE_MANAGER') delete dto.privateInstructions;
    return dto;
  }
  async list(uid: string, contextId: string) {
    const member = await authorize(this.store, uid, 'VIEW_TASK', contextId);
    const tasks = await this.repo.listTasks(contextId);
    // Filter on the backend before DTO mapping; never send private drafts to a client.
    return tasks.filter(task => canViewTask(member!, uid, task))
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map(taskSummaryDto);
  }
  async update(uid: string, id: string, fields: TaskDraftFields) {
    const task = await this.repo.changeTask(id, uid, async (current, reads) => {
      await authorize(reads.permissions, uid, 'EDIT_TASK', current.careContextId, current.createdBy);
      requireDraft(current);
      if (fields.locationId) checkLocation(await reads.location(fields.locationId), current.careContextId);
      const updated = mergeDraft(current, fields) as Task;
      const changedFields = Object.keys(fields).filter(key => JSON.stringify(current[key as keyof Task]) !== JSON.stringify(updated[key as keyof Task]));
      if (!changedFields.length) return null;
      return { task: updated, event: 'TASK_UPDATED', changedFields };
    });
    return taskDetailDto(task);
  }
  async publish(uid: string, id: string) {
    const task = await this.repo.changeTask(id, uid, async (current, reads) => {
      await authorize(reads.permissions, uid, 'PUBLISH_TASK', current.careContextId, current.createdBy);
      requireDraft(current);
      const valid = validatePublish(taskDetailDto(current));
      checkLocation(await reads.location(valid.locationId), current.careContextId);
      return { task: { ...current, status: 'OPEN', publishedAt: Timestamp.now() }, event: 'TASK_PUBLISHED' };
    });
    return taskDetailDto(task);
  }
  async cancel(uid: string, id: string) {
    return new AssignmentService().cancelTask(uid, id);
  }
}
