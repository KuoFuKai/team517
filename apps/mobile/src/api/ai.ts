import type { GenerateTaskSuggestionRequest, ImproveTaskSuggestionRequest, TaskDraftSuggestionDto, AiTaskSummaryDto } from '@team517/contracts';
import type { ApiRequest } from './transport';

export function createAiApi(request: ApiRequest) {
  return {
    generateTaskSuggestion: (body: GenerateTaskSuggestionRequest) => request<TaskDraftSuggestionDto>('/ai/task-suggestions', body),
    improveTaskSuggestion: (id: string, body: ImproveTaskSuggestionRequest) => request<TaskDraftSuggestionDto>('/tasks/' + encodeURIComponent(id) + '/ai-suggestions', body),
    summarizeTask: (id: string) => request<AiTaskSummaryDto>('/tasks/' + encodeURIComponent(id) + '/ai-summary', {}),
  };
}
