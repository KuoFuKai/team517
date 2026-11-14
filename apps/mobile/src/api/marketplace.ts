import type { UpdateOfferAvailabilityRequest, UpdateOfferAvailabilityResponse, TaskDiscoveryQuery, TaskDiscoveryListDto, TaskDiscoveryItemDto, OfferHelpRequest, OfferDto, MyOfferDto, OfferListDto, SelectOfferResponse, AssignmentDto, UserDto, UpdateRolePreferenceRequest } from '@team517/contracts';
import type { ApiRequest } from './transport';

export function createMarketplaceApi(request: ApiRequest) {
  const path = (id: string) => '/tasks/' + encodeURIComponent(id);
  return {
    discoverTasks: (query: TaskDiscoveryQuery = {}) => {
      const params = Object.entries(query).filter(([, value]) => value !== undefined).map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value))).join('&');
      return request<TaskDiscoveryListDto>('/tasks/discover' + (params ? '?' + params : ''));
    },
    getDiscoveredTask: (id: string) => request<TaskDiscoveryItemDto>(path(id) + '/discovery'),
    offerHelp: (id: string, body: OfferHelpRequest = {}) => request<OfferDto>(path(id) + '/offers', body),
    withdrawOffer: (id: string) => request<OfferDto>(path(id) + '/offers/mine/withdraw', {}),
    getMyOffer: (id: string) => request<MyOfferDto>(path(id) + '/offers/mine'),
    listOffers: (id: string) => request<OfferListDto>(path(id) + '/offers'),
    selectOffer: (id: string, offerId: string, availabilityRevision?:number) => request<SelectOfferResponse>(path(id) + '/select-offer', { offerId,...(availabilityRevision!==undefined?{availabilityRevision}:{}) }),
    updateOfferAvailability:(id:string,body:UpdateOfferAvailabilityRequest)=>request<UpdateOfferAvailabilityResponse>(path(id)+'/offers/mine/availability',body,'PATCH'),
    getAssignment: (id: string) => request<AssignmentDto>('/assignments/' + encodeURIComponent(id)),
    updateRolePreference: (body: UpdateRolePreferenceRequest) => request<UserDto>('/me/preferences', body, 'PATCH'),
  };
}
