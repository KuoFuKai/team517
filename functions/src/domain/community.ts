import type { Timestamp } from 'firebase-admin/firestore';
import type { CommunityVisibility, CommunityPostType } from '@team517/contracts';
export interface CommunityScope { visibility: CommunityVisibility; careContextId?: string }
export interface CommunityPost extends CommunityScope {
  id: string; authorId: string; type: CommunityPostType; title?: string; body: string; taskId?: string; resourceId?: string;
  originalPostId?: string; originalAuthorId?: string; likeCount: number; commentCount: number; createdAt: Timestamp; updatedAt: Timestamp;
}
export interface Resource extends CommunityScope { id: string; authorId: string; title: string; summary: string; url?: string; category: string; status: 'ACTIVE' | 'ARCHIVED'; createdAt: Timestamp; updatedAt: Timestamp }
export interface CommunityComment { id: string; postId: string; authorId: string; body: string; createdAt: Timestamp }
export interface CommunityLike { id: string; postId: string; userId: string; createdAt: Timestamp }
export interface ResourceSave { id: string; resourceId: string; userId: string; createdAt: Timestamp }
