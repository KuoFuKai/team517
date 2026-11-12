import type { UserDto, InitializeUserRequest, CreateCareContextRequest, CareContextDto } from '@team517/contracts';
import type { ApiRequest } from './transport';

export function createCareApi(request: ApiRequest) {
  return {
    getCurrentUser: () => request<UserDto>('/me'),
    initializeUser: (body: InitializeUserRequest) => request<UserDto>('/users/initialize', body),
    listCareContexts: () => request<{ careContexts: CareContextDto[] }>('/care-contexts'),
    createCareContext: (body: CreateCareContextRequest) => request<CareContextDto>('/care-contexts', body),
    getCareContext: (id: string) => request<CareContextDto>('/care-contexts/' + encodeURIComponent(id)),
  };
}
