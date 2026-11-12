import { Timestamp } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import type { CreateConversationRequest, SendMessageRequest, ConversationSummaryDto, MessageDto, MessagesDto } from '@team517/contracts';
import type { Conversation, Message } from '../domain/messaging';
import type { Notification } from '../domain/support';
import { MessagingRepository, type MessagingReader } from '../repositories/messaging';
import { authorizeConversation, canSendConversation } from '../permissions/messaging';
import { initialized } from '../permissions/support';
import { ApiFailure } from '../shared/errors';
export const conversationKey = (scope: string, resource: string, participants: string[]) => createHash('sha256').update(JSON.stringify([scope, resource, [...participants].sort()])).digest('hex');
export const messageKey = (conversation: string, sender: string, client: string) => createHash('sha256').update(JSON.stringify([conversation, sender, client])).digest('hex');
export const messageDto = (m: Message): MessageDto => ({ id: m.id, conversationId: m.conversationId, senderId: m.senderId, text: m.text, clientMessageId: m.clientMessageId, sequence: m.sequence, createdAt: m.createdAt.toDate().toISOString(), ...(m.readAt ? { readAt: m.readAt.toDate().toISOString() } : {}) });
const label = (id: string) => 'Member ' + id.slice(-4).toUpperCase();
export class MessagingService {
  constructor(private repo = new MessagingRepository()) {}
  private async conversation(r: MessagingReader, uid: string, id: string) {
    const c = await r.get('conversations', id); if (!c) throw new ApiFailure(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found.');
    await authorizeConversation(r, uid, c); return c;
  }
  private async summary(r: MessagingReader, uid: string, c: Conversation): Promise<ConversationSummaryDto> {
    const other = c.participantIds.find(p => p !== uid)!;
    return { id: c.id, scope: c.scope, ...(c.scope === 'CARE_CONTEXT' ? { careContextId: c.careContextId } : { taskId: c.taskId }), otherParticipant: { id: other, label: label(other) }, lastMessagePreview: c.lastMessagePreview, lastMessageAt: c.lastMessageAt?.toDate().toISOString(), unreadCount: c.unreadCounts[uid] ?? 0, canSend: await canSendConversation(r, c), createdAt: c.createdAt.toDate().toISOString() };
  }
  private async messagesDto(r: MessagingReader, id: string, before?: number): Promise<MessagesDto> {
    const list = await r.messages(id, before);
    return { messages: list.items.map(messageDto), limit: 50, truncated: list.truncated, ...(list.truncated && list.items.length ? { nextBefore: list.items[0].sequence } : {}) };
  }
  async create(uid: string, body: CreateConversationRequest) {
    return this.getOrCreate(uid, body);
  }
  private async getOrCreate(uid: string, body: CreateConversationRequest | { scope: 'TASK'; taskId: string; otherUserId?: string }) {
    const result = await this.repo.change(async (r, now) => {
      await initialized(r.permissions, uid);
      let careContextId: string, other = body.otherUserId;
      if (body.scope === 'TASK') {
        const task = await r.get('tasks', body.taskId); if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
        careContextId = task.careContextId; other ??= task.createdBy;
      } else careContextId = body.careContextId;
      if (!other || other === uid) throw new ApiFailure(403, 'CONVERSATION_NOT_ALLOWED', 'Choose one other authorized participant.');
      const participants = [uid, other].sort() as [string, string];
      const id = conversationKey(body.scope, body.scope === 'TASK' ? body.taskId : careContextId, participants);
      const existing = await r.get('conversations', id);
      if (existing) { await authorizeConversation(r, uid, existing); return { result: id, writes: [] }; }
      const c: Conversation = { id, participantIds: participants, scope: body.scope, careContextId, ...(body.scope === 'TASK' ? { taskId: body.taskId } : {}), createdBy: uid, createdAt: now, updatedAt: now, lastMessageAt: null, messageCount: 0, unreadCounts: { [uid]: 0, [other]: 0 } };
      if (!await canSendConversation(r, c)) throw new ApiFailure(403, 'CONVERSATION_NOT_ALLOWED', 'A current circle or Task relationship is required.');
      return { result: id, writes: [{ collection: 'conversations', id, value: c, create: true }] };
    });
    return this.detail(uid, result);
  }
  async forTask(uid: string, taskId: string, otherUserId?: string) { return this.getOrCreate(uid, { scope: 'TASK', taskId, otherUserId }); }
  async inbox(uid: string) {
    return this.repo.read(async r => { await initialized(r.permissions, uid); const list = await r.inbox(uid); return { conversations: await Promise.all(list.items.map(c => this.summary(r, uid, c))), limit: 50, truncated: list.truncated }; });
  }
  async detail(uid: string, id: string) { return this.repo.read(async r => { const c = await this.conversation(r, uid, id); return { conversation: await this.summary(r, uid, c), messages: await this.messagesDto(r, id) }; }); }
  async messages(uid: string, id: string, before?: number) { return this.repo.read(async r => { await this.conversation(r, uid, id); return this.messagesDto(r, id, before); }); }
  async send(uid: string, id: string, body: SendMessageRequest) {
    const key = messageKey(id, uid, body.clientMessageId);
    return this.repo.change(async (r, now) => {
      const c = await this.conversation(r, uid, id);
      const existing = await r.get('messages', key);
      if (existing) {
        if (existing.text !== body.text) throw new ApiFailure(409, 'CLIENT_MESSAGE_ID_CONFLICT', 'This send ID was already used for different text.');
        return { result: messageDto(existing), writes: [] }; // History-only retries return the already committed immutable result.
      }
      if (!await canSendConversation(r, c)) throw new ApiFailure(403, 'MESSAGING_RELATIONSHIP_INACTIVE', 'This conversation is read-only because its relationship is no longer active.');
      const other = c.participantIds.find(p => p !== uid)!;
      const sentAt = Timestamp.fromMillis(Math.max(now.toMillis(), (c.lastMessageAt?.toMillis() ?? -Infinity) + 1));
      const message: Message = { id: key, conversationId: id, senderId: uid, text: body.text, clientMessageId: body.clientMessageId, sequence: c.messageCount + 1, createdAt: sentAt, readAt: null };
      const conversation: Conversation = { ...c, messageCount: message.sequence, updatedAt: sentAt, lastMessageAt: sentAt, lastMessagePreview: Array.from(body.text).slice(0, 80).join(''), unreadCounts: { ...c.unreadCounts, [other]: (c.unreadCounts[other] ?? 0) + 1 } };
      const notification: Notification = { id: key + '_' + other, recipientId: other, type: 'NEW_MESSAGE', resourceType: 'CONVERSATION', resourceId: id, title: 'New message', body: 'You have a new message. Open your conversation to read it.', createdAt: sentAt };
      return { result: messageDto(message), writes: [{ collection: 'messages', id: key, value: message, create: true }, { collection: 'conversations', id, value: conversation }, { collection: 'notifications', id: notification.id, value: notification, create: true }] };
    });
  }
  async read(uid: string, id: string) {
    return this.repo.change(async (r, now) => {
      const c = await this.conversation(r, uid, id); const incoming = await r.unread(id, c.participantIds.find(p => p !== uid)!);
      const remaining = (c.unreadCounts[uid] ?? 0) - incoming.length;
      if (remaining < 0) throw new ApiFailure(409, 'CONFLICT', 'Unread state is inconsistent.');
      return { result: { marked: incoming.length, unreadCount: remaining, limit: 200, truncated: remaining > 0 }, writes: incoming.length ? [{ collection: 'conversations', id, value: { ...c, unreadCounts: { ...c.unreadCounts, [uid]: remaining } } }, ...incoming.map(m => ({ collection: 'messages' as const, id: m.id, value: { ...m, readAt: now } }))] : [] };
    });
  }
  async members(uid: string, context: string) {
    return this.repo.read(async r => {
      await initialized(r.permissions, uid);
      if ((await r.permissions.member(context, uid))?.status !== 'ACTIVE') throw new ApiFailure(403, 'FORBIDDEN', 'Active circle membership is required.');
      const list = await r.members(context);
      return { members: list.items.filter(m => m.userId !== uid).map(m => ({ id: m.userId, label: label(m.userId) })), limit: 50, truncated: list.truncated };
    });
  }
}
