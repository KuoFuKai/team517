import type { CreateTaskDraftRequest, UpdateTaskDraftRequest, TaskDetailDto, TaskSummaryDto, CreateLocationRequest, LocationDto } from '@team517/contracts';
import type { ApiRequest } from './transport';

export function createTaskApi(request: ApiRequest) {
  const contextPath = (id: string) => '/care-contexts/' + encodeURIComponent(id);
  const taskPath = (id: string) => '/tasks/' + encodeURIComponent(id);
  return {
    createTaskDraft: (contextId: string, body: CreateTaskDraftRequest) => request<TaskDetailDto>(contextPath(contextId) + '/tasks/drafts', body),
    updateTaskDraft: (id: string, body: UpdateTaskDraftRequest) => request<TaskDetailDto>(taskPath(id), body, 'PATCH'),
    publishTask: (id: string) => request<TaskDetailDto>(taskPath(id) + '/publish', {}),
    getTask: (id: string) => request<TaskDetailDto>(taskPath(id)),
    listTasks: (contextId: string) => request<{ tasks: TaskSummaryDto[] }>(contextPath(contextId) + '/tasks'),
    cancelTask: (id: string) => request<TaskDetailDto>(taskPath(id) + '/cancel', {}),
    listLocations: (contextId: string) => request<{ locations: LocationDto[] }>(contextPath(contextId) + '/locations'),
    createLocation: (contextId: string, body: CreateLocationRequest) => request<LocationDto>(contextPath(contextId) + '/locations', body),
  };
}
