import type { AssignmentDto, AssignmentExecutionDto, MyAssignmentsDto, MyOffersDto, DisputeCompletionRequest } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createAssignmentApi(request: ApiRequest) {
  const path = (id: string) => '/assignments/' + encodeURIComponent(id);
  return {
    getMyOffers: () => request<MyOffersDto>('/me/offers'),
    getMyAssignments: () => request<MyAssignmentsDto>('/me/assignments'),
    getExecutionDetails: (id: string) => request<AssignmentExecutionDto>(path(id) + '/execution'),
    confirmAssignment: (id: string) => request<AssignmentDto>(path(id) + '/confirm', {}),
    declineAssignment: (id: string) => request<AssignmentDto>(path(id) + '/decline', {}),
    cancelAssignment: (id: string) => request<AssignmentDto>(path(id) + '/cancel', {}),
    startTask: (id: string) => request<AssignmentDto>(path(id) + '/start', {}),
    requestCompletion: (id: string) => request<AssignmentDto>(path(id) + '/request-completion', {}),
    confirmCompletion: (id: string) => request<AssignmentDto>(path(id) + '/confirm-completion', {}),
    disputeCompletion: (id: string, body: DisputeCompletionRequest = {}) => request<AssignmentDto>(path(id) + '/dispute', body),
  };
}
