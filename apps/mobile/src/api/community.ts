import type { ApiRequest } from './transport';
import type { CommunityFeedDto, CommunityFeedQuery, CommunityPostDetailDto, CommunityPostDto, CreateCommunityPostRequest, CreateCommentRequest, CommunityCommentDto, CommunityCommentsDto, SharePostRequest, ResourceDto, CreateResourceRequest, SavedResourcesDto } from '@team517/contracts';
export function createCommunityApi(request: ApiRequest) {
  const post = (id: string) => '/community/posts/' + encodeURIComponent(id);
  const resource = (id: string) => '/resources/' + encodeURIComponent(id);
  return {
    getCommunityFeed: (query: CommunityFeedQuery = {}) => { const params = Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v))).join('&'); return request<CommunityFeedDto>('/community/feed' + (params ? '?' + params : '')); },
    getCommunityPost: (id: string) => request<CommunityPostDetailDto>(post(id)),
    createCommunityPost: (body: CreateCommunityPostRequest) => request<CommunityPostDto>('/community/posts', body),
    commentOnPost: (id: string, body: CreateCommentRequest) => request<CommunityCommentDto>(post(id) + '/comments', body),
    listComments: (id: string) => request<CommunityCommentsDto>(post(id) + '/comments'),
    likePost: (id: string) => request<CommunityPostDto>(post(id) + '/like', {}),
    unlikePost: (id: string) => request<CommunityPostDto>(post(id) + '/unlike', {}),
    sharePost: (id: string, body: SharePostRequest) => request<CommunityPostDto>(post(id) + '/share', body),
    createResource: (body: CreateResourceRequest) => request<ResourceDto>('/resources', body),
    getResource: (id: string) => request<ResourceDto>(resource(id)),
    saveResource: (id: string) => request<{ saved: boolean }>(resource(id) + '/save', {}),
    unsaveResource: (id: string) => request<{ saved: boolean }>(resource(id) + '/unsave', {}),
    getSavedResources: () => request<SavedResourcesDto>('/me/saved-resources'),
  };
}
