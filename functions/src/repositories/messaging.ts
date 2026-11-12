import { getFirestore, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type { Conversation, Message } from '../domain/messaging';
import type { Task } from '../domain/task';
import type { Offer, Assignment } from '../domain/marketplace';
import type { User, CareContextMember } from '../domain/models';
import type { PermissionReader } from '../permissions/authorize';
import { membershipId } from './store';
interface Documents { conversations: Conversation; messages: Message; tasks: Task; offers: Offer; assignments: Assignment }
export interface MessagingReader {
  permissions: PermissionReader;
  get: <C extends keyof Documents>(collection: C, id: string) => Promise<Documents[C] | undefined>;
  inbox: (uid: string) => Promise<{ items: Conversation[]; truncated: boolean }>;
  messages: (id: string, before?: number) => Promise<{ items: Message[]; truncated: boolean }>;
  unread: (id: string, sender: string) => Promise<Message[]>;
  members: (context: string) => Promise<{ items: CareContextMember[]; truncated: boolean }>;
}
export interface MessagingWrite { collection: 'conversations' | 'messages' | 'notifications'; id: string; value: object; create?: boolean }
export class MessagingRepository {
  private get db() { return getFirestore(); }
  private reader(tx: Transaction): MessagingReader {
    const get = async <C extends keyof Documents>(collection: C, id: string) => (await tx.get(this.db.collection(collection).doc(id))).data() as Documents[C] | undefined;
    return { get, permissions: { user: async uid => (await tx.get(this.db.collection('users').doc(uid))).data() as User | undefined, member: async (context, uid) => (await tx.get(this.db.collection('care_context_members').doc(membershipId(context, uid)))).data() as CareContextMember | undefined },
      inbox: async uid => { const docs = await tx.get(this.db.collection('conversations').where('participantIds', 'array-contains', uid).orderBy('lastMessageAt', 'desc').orderBy('createdAt', 'desc').limit(51)); return { items: docs.docs.slice(0, 50).map(d => d.data() as Conversation), truncated: docs.size > 50 }; },
      messages: async (id, before) => { let q = this.db.collection('messages').where('conversationId', '==', id); if (before !== undefined) q = q.where('sequence', '<', before); const docs = await tx.get(q.orderBy('sequence', 'desc').limit(51)); return { items: docs.docs.slice(0, 50).map(d => d.data() as Message).reverse(), truncated: docs.size > 50 }; },
      unread: async (id, sender) => (await tx.get(this.db.collection('messages').where('conversationId', '==', id).where('senderId', '==', sender).where('readAt', '==', null).orderBy('sequence', 'asc').limit(200))).docs.map(d => d.data() as Message),
      members: async context => { const docs = await tx.get(this.db.collection('care_context_members').where('careContextId', '==', context).where('status', '==', 'ACTIVE').limit(51)); return { items: docs.docs.slice(0, 50).map(d => d.data() as CareContextMember), truncated: docs.size > 50 }; },
    };
  }
  async read<T>(project: (r: MessagingReader) => Promise<T>) { return this.db.runTransaction(tx => project(this.reader(tx)), { readOnly: true }); }
  async change<T>(mutate: (r: MessagingReader, now: Timestamp) => Promise<{ result: T; writes: MessagingWrite[] }>) {
    return this.db.runTransaction(async tx => {
      const changed = await mutate(this.reader(tx), Timestamp.now());
      for (const write of changed.writes) { const ref = this.db.collection(write.collection).doc(write.id); if (write.create) tx.create(ref, write.value); else tx.set(ref, write.value); }
      return changed.result;
    });
  }
}
