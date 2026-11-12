import type { Timestamp } from 'firebase-admin/firestore';
import type { NotificationType } from '@team517/contracts';
export interface Notification {
  id: string; recipientId: string; type: NotificationType; resourceType: 'TASK' | 'ASSIGNMENT' | 'CONVERSATION'; resourceId: string;
  title: string; body: string; readAt?: Timestamp; createdAt: Timestamp;
}
export interface Review {
  id: string; assignmentId: string; taskId: string; careContextId: string; reviewerId: string; revieweeId: string;
  rating: number; comment?: string; createdAt: Timestamp;
}
