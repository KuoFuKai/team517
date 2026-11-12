import { getFirestore, type Transaction, Timestamp } from 'firebase-admin/firestore';
import type { User, CareContextMember } from '../domain/models';
import type { Task, Location } from '../domain/task';
import type { CommunityPost, CommunityComment, CommunityLike, Resource, ResourceSave, CommunityScope } from '../domain/community';
import type { CommunityPostType } from '@team517/contracts';
import type { PermissionReader } from '../permissions/authorize';
import { membershipId } from './store';
export interface CommunityDocuments { users: User; tasks: Task; locations: Location; community_posts: CommunityPost; community_comments: CommunityComment; community_likes: CommunityLike; resources: Resource; resource_saves: ResourceSave }
export interface CommunityReader {
  permissions: PermissionReader;
  get: <C extends keyof CommunityDocuments>(collection: C, id: string) => Promise<CommunityDocuments[C] | undefined>;
  feed: (scope: CommunityScope, type?: CommunityPostType) => Promise<{ items: CommunityPost[]; truncated: boolean }>;
  comments: (postId: string) => Promise<{ items: CommunityComment[]; truncated: boolean }>;
  saves: (uid: string) => Promise<{ items: ResourceSave[]; truncated: boolean }>;
}
export type CommunityWrite = { collection: 'community_posts' | 'community_comments' | 'community_likes' | 'resources' | 'resource_saves'; id: string; value?: object; operation?: 'create' | 'set' | 'delete' };
export class CommunityRepository {
  private get db() { return getFirestore(); }
  id(collection: keyof CommunityDocuments) { return this.db.collection(collection).doc().id; }
  private reader(tx: Transaction): CommunityReader {
    const get = async <C extends keyof CommunityDocuments>(collection: C, id: string) => (await tx.get(this.db.collection(collection).doc(id))).data() as CommunityDocuments[C] | undefined;
    return { get, permissions: { user: uid => get('users', uid), member: async (context, uid) => (await tx.get(this.db.collection('care_context_members').doc(membershipId(context, uid)))).data() as CareContextMember | undefined },
      feed: async (scope, type) => {
        let query = this.db.collection('community_posts').where('visibility', '==', scope.visibility);
        if (scope.careContextId) query = query.where('careContextId', '==', scope.careContextId);
        if (type) query = query.where('type', '==', type);
        const docs = await tx.get(query.orderBy('createdAt', 'desc').limit(31));
        return { items: docs.docs.slice(0, 30).map(d => d.data() as CommunityPost), truncated: docs.size > 30 };
      },
      comments: async postId => { const docs = await tx.get(this.db.collection('community_comments').where('postId', '==', postId).orderBy('createdAt', 'desc').limit(51)); return { items: docs.docs.slice(0, 50).map(d => d.data() as CommunityComment).reverse(), truncated: docs.size > 50 }; },
      saves: async uid => { const docs = await tx.get(this.db.collection('resource_saves').where('userId', '==', uid).orderBy('createdAt', 'desc').limit(51)); return { items: docs.docs.slice(0, 50).map(d => d.data() as ResourceSave), truncated: docs.size > 50 }; },
    };
  }
  async read<T>(project: (reader: CommunityReader) => Promise<T>) { return this.db.runTransaction(tx => project(this.reader(tx)), { readOnly: true }); }
  async change<T>(mutate: (reader: CommunityReader, now: Timestamp) => Promise<{ result: T; writes: CommunityWrite[] }>) {
    return this.db.runTransaction(async tx => {
      const change = await mutate(this.reader(tx), Timestamp.now());
      for (const write of change.writes) {
        const ref = this.db.collection(write.collection).doc(write.id);
        if (write.operation === 'delete') tx.delete(ref);
        else if (write.operation === 'create') tx.create(ref, write.value!);
        else tx.set(ref, write.value!);
      }
      return change.result;
    });
  }
}
