import type { Timestamp } from 'firebase-admin/firestore';
export interface Conversation { id: string; participantIds: [string, string]; scope: 'CARE_CONTEXT' | 'TASK'; careContextId: string; taskId?: string; createdBy: string; createdAt: Timestamp; updatedAt: Timestamp; lastMessageAt: Timestamp | null; lastMessagePreview?: string; messageCount: number; unreadCounts: Record<string, number> }
export interface Message { id: string; conversationId: string; senderId: string; text: string; clientMessageId: string; sequence: number; createdAt: Timestamp; readAt: Timestamp | null }
