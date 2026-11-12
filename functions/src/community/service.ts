import { createHash } from 'node:crypto';
import type { CommunityPostDto, ResourceDto, CommunityCommentDto, CommunityFeedQuery, CreateCommunityPostRequest, CreateResourceRequest, SharePostRequest } from '@team517/contracts';
import type { CommunityPost, CommunityComment, Resource, CommunityScope } from '../domain/community';
import type { CommunityReader } from '../repositories/community';
import { CommunityRepository } from '../repositories/community';
import { authorizeCommunity, authorizeNeed, requireContained } from '../permissions/community';
import { initialized } from '../permissions/support';
import { isOfferable } from '../permissions/marketplace';
import { taskDiscoveryDto } from '../discovery/dto';
import { ApiFailure } from '../shared/errors';
const relationId = (id: string, uid: string) => id + '_' + uid;
const fail = (code: string, message: string) => { throw new ApiFailure(409, code, message); };
const unavailable = (error: unknown) => error instanceof ApiFailure && [403, 404].includes(error.status);
export class CommunityService {
  constructor(private repo = new CommunityRepository()) {}
  private async post(reader: CommunityReader, uid: string, id: string, action: Parameters<typeof authorizeCommunity>[2] = 'VIEW_COMMUNITY_POST') {
    const post = await reader.get('community_posts', id);
    if (!post) throw new ApiFailure(404, 'NOT_FOUND', 'Post not found.');
    await authorizeCommunity(reader.permissions, uid, action, post); return post;
  }
  private async resource(reader: CommunityReader, uid: string, id: string) {
    const value = await reader.get('resources', id);
    if (!value || value.status !== 'ACTIVE') throw new ApiFailure(404, 'RESOURCE_UNAVAILABLE', 'Resource is unavailable.');
    await authorizeCommunity(reader.permissions, uid, 'SAVE_RESOURCE', value); return value;
  }
  private async resourceDto(reader: CommunityReader, uid: string, resource: Resource): Promise<ResourceDto> {
    return { id: resource.id, title: resource.title, summary: resource.summary, category: resource.category, url: resource.url, status: 'ACTIVE', saved: Boolean(await reader.get('resource_saves', relationId(resource.id, uid))), createdAt: resource.createdAt.toDate().toISOString() };
  }
  private commentDto(comment: CommunityComment): CommunityCommentDto { return { id: comment.id, authorId: comment.authorId, authorLabel: 'Member ' + comment.authorId.slice(-4).toUpperCase(), body: comment.body, createdAt: comment.createdAt.toDate().toISOString() }; }
  private async dto(reader: CommunityReader, uid: string, post: CommunityPost, embedded = false): Promise<CommunityPostDto> {
    const dto: CommunityPostDto = { id: post.id, authorId: post.authorId, authorLabel: 'Member ' + post.authorId.slice(-4).toUpperCase(), type: post.type, title: post.title, body: post.body, visibility: post.visibility, likeCount: post.likeCount, commentCount: post.commentCount, liked: Boolean(await reader.get('community_likes', relationId(post.id, uid))), createdAt: post.createdAt.toDate().toISOString(), updatedAt: post.updatedAt.toDate().toISOString() };
    if (post.type === 'NEED' && post.taskId) {
      dto.taskId = post.taskId;
      const task = await reader.get('tasks', post.taskId);
      if (!task || !isOfferable(task)) dto.unavailable = true;
      else {
        const member = await reader.permissions.member(task.careContextId, uid);
        if (task.visibility !== 'VERIFIED_HELPERS' && member?.status !== 'ACTIVE') dto.unavailable = true;
        else {
          const user = await initialized(reader.permissions, uid);
          if (member?.status !== 'ACTIVE' && user.verificationStatus !== 'VERIFIED') dto.unavailable = true;
          else dto.taskPreview = taskDiscoveryDto(task, task.locationId ? await reader.get('locations', task.locationId) : undefined);
        }
      }
    }
    if (post.type === 'RESOURCE' && post.resourceId) {
      try { dto.resource = await this.resourceDto(reader, uid, await this.resource(reader, uid, post.resourceId)); } catch (e) { if (!unavailable(e)) throw e; dto.unavailable = true; }
    }
    if (post.type === 'SHARE') {
      if (embedded || !post.originalPostId) { dto.unavailable = true; return dto; }
      try {
        const original = await this.post(reader, uid, post.originalPostId);
        if (original.type === 'SHARE') dto.unavailable = true;
        else { dto.originalPostId = original.id; dto.originalAuthorId = original.authorId; dto.original = await this.dto(reader, uid, original, true); }
      } catch (e) { if (!unavailable(e)) throw e; dto.unavailable = true; }
    }
    return dto;
  }
  async create(uid: string, body: CreateCommunityPostRequest): Promise<CommunityPostDto> {
    const newId = this.repo.id('community_posts');
    const id = await this.repo.change(async (reader, now) => {
      await authorizeCommunity(reader.permissions, uid, 'CREATE_COMMUNITY_POST', body);
      const fields: Partial<CommunityPost> = {};
      let id = newId;
      if (body.type === 'NEED') {
        const task = await reader.get('tasks', body.taskId);
        if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
        await authorizeNeed(reader.permissions, uid, task, body);
        if (!isOfferable(task)) fail('TASK_NOT_OFFERABLE', 'Only published tasks accepting offers can be posted as Needs.');
        fields.taskId = task.id;
      } else if (body.type === 'RESOURCE') {
        const resource = await this.resource(reader, uid, body.resourceId); requireContained(resource, body); fields.resourceId = resource.id;
      } else {
        let original = await this.post(reader, uid, body.originalPostId, 'SHARE_POST');
        if (original.type === 'SHARE') original = await this.post(reader, uid, original.originalPostId!, 'SHARE_POST');
        if (original.type === 'SHARE') fail('SHARE_UNAVAILABLE', 'Share the original post.');
        requireContained(original, body); fields.originalPostId = original.id; fields.originalAuthorId = original.authorId;
        // One Share per author/original/destination. Retries return the existing record, not duplicate content.
        id = createHash('sha256').update(JSON.stringify([original.id, uid, body.visibility, body.careContextId ?? null])).digest('hex');
        const existing = await reader.get('community_posts', id);
        if (existing) return { result: id, writes: [] };
      }
      const post: CommunityPost = { id, authorId: uid, type: body.type, body: body.body, visibility: body.visibility, ...fields,
        ...(body.title ? { title: body.title } : {}), ...(body.careContextId ? { careContextId: body.careContextId } : {}), likeCount: 0, commentCount: 0, createdAt: now, updatedAt: now };
      return { result: id, writes: [{ collection: 'community_posts', id, operation: 'create', value: post }] };
    });
    return (await this.detail(uid, id)).post;
  }
  async share(uid: string, id: string, body: SharePostRequest) { return this.create(uid, { ...body, type: 'SHARE', originalPostId: id }); }
  async feed(uid: string, query: CommunityFeedQuery) {
    return this.repo.read(async reader => {
      const scope: CommunityScope = query.careContextId ? { visibility: 'CARE_CIRCLE', careContextId: query.careContextId } : { visibility: 'PUBLIC_VERIFIED' };
      await authorizeCommunity(reader.permissions, uid, 'VIEW_COMMUNITY_POST', scope);
      const list = await reader.feed(scope, query.type);
      return { posts: await Promise.all(list.items.map(post => this.dto(reader, uid, post))), limit: 30, truncated: list.truncated };
    });
  }
  async detail(uid: string, id: string) {
    return this.repo.read(async reader => {
      const post = await this.post(reader, uid, id); const comments = await reader.comments(id);
      return { post: await this.dto(reader, uid, post), comments: { comments: comments.items.map(c => this.commentDto(c)), limit: 50, truncated: comments.truncated } };
    });
  }
  async comments(uid: string, id: string) { return (await this.detail(uid, id)).comments; }
  async comment(uid: string, id: string, body: string) {
    const commentId = this.repo.id('community_comments');
    return this.repo.change(async (reader, now) => {
      const post = await this.post(reader, uid, id, 'COMMENT_ON_POST');
      const comment: CommunityComment = { id: commentId, postId: id, authorId: uid, body, createdAt: now };
      return { result: this.commentDto(comment), writes: [{ collection: 'community_comments', id: commentId, operation: 'create', value: comment }, { collection: 'community_posts', id, value: { ...post, commentCount: post.commentCount + 1, updatedAt: now } }] };
    });
  }
  async like(uid: string, id: string, liked: boolean) {
    await this.repo.change(async (reader, now) => {
      const post = await this.post(reader, uid, id, 'LIKE_POST'), key = relationId(id, uid);
      const existing = await reader.get('community_likes', key);
      if (Boolean(existing) === liked) return { result: null, writes: [] };
      if (!liked && post.likeCount < 1) fail('CONFLICT', 'Like count is inconsistent.');
      return { result: null, writes: [{ collection: 'community_likes', id: key, operation: liked ? 'create' : 'delete', ...(liked ? { value: { id: key, postId: id, userId: uid, createdAt: now } } : {}) }, { collection: 'community_posts', id, value: { ...post, likeCount: post.likeCount + (liked ? 1 : -1), updatedAt: now } }] };
    });
    return (await this.detail(uid, id)).post;
  }
  async createResource(uid: string, body: CreateResourceRequest) {
    const id = this.repo.id('resources');
    return this.repo.change(async (reader, now) => {
      await authorizeCommunity(reader.permissions, uid, 'CREATE_COMMUNITY_POST', body);
      const resource: Resource = { ...body, id, authorId: uid, status: 'ACTIVE', createdAt: now, updatedAt: now };
      return { result: { id, title: body.title, summary: body.summary, category: body.category, url: body.url, status: 'ACTIVE' as const, saved: false, createdAt: now.toDate().toISOString() }, writes: [{ collection: 'resources', id, operation: 'create', value: resource }] };
    });
  }
  async getResource(uid: string, id: string) { return this.repo.read(async r => this.resourceDto(r, uid, await this.resource(r, uid, id))); }
  async save(uid: string, id: string, saved: boolean) {
    return this.repo.change(async (reader, now) => {
      await initialized(reader.permissions, uid); if (saved) await this.resource(reader, uid, id);
      const key = relationId(id, uid), existing = await reader.get('resource_saves', key);
      if (Boolean(existing) === saved) return { result: { saved }, writes: [] };
      return { result: { saved }, writes: [{ collection: 'resource_saves', id: key, operation: saved ? 'create' : 'delete', ...(saved ? { value: { id: key, resourceId: id, userId: uid, createdAt: now } } : {}) }] };
    });
  }
  async saved(uid: string) {
    return this.repo.read(async reader => {
      await initialized(reader.permissions, uid); const list = await reader.saves(uid); const resources: ResourceDto[] = [];
      for (const save of list.items) try { resources.push(await this.resourceDto(reader, uid, await this.resource(reader, uid, save.resourceId))); } catch (e) { if (!unavailable(e)) throw e; }
      return { resources, limit: 50, truncated: list.truncated };
    });
  }
}
