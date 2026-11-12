import type { ApiRequest } from './transport';
import type { ConversationsDto, ConversationDetailDto, CreateConversationRequest, MessagesDto, SendMessageRequest, MessageDto, MessagingMembersDto } from '@team517/contracts';
export function createMessagingApi(request: ApiRequest) {
  const path = (id: string) => '/conversations/' + encodeURIComponent(id);
  return {
    listConversations: () => request<ConversationsDto>('/me/conversations'),
    getOrCreateConversation: (body: CreateConversationRequest) => request<ConversationDetailDto>('/conversations', body),
    getConversation: (id: string) => request<ConversationDetailDto>(path(id)),
    listMessages: (id: string, before?: number) => request<MessagesDto>(path(id) + '/messages' + (before !== undefined ? '?before=' + encodeURIComponent(before) : '')),
    sendMessage: (id: string, body: SendMessageRequest) => request<MessageDto>(path(id) + '/messages', body),
    markConversationRead: (id: string) => request<{ marked: number; unreadCount: number; limit: number; truncated: boolean }>(path(id) + '/read', {}),
    startTaskConversation: (taskId: string, otherUserId?: string) => request<ConversationDetailDto>('/tasks/' + encodeURIComponent(taskId) + '/conversations', otherUserId ? { otherUserId } : {}),
    listMessagingMembers: (careContextId: string) => request<MessagingMembersDto>('/care-contexts/' + encodeURIComponent(careContextId) + '/messaging-members'),
  };
}
