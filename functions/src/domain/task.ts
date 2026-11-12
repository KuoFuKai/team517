import type { Timestamp } from 'firebase-admin/firestore';
import type { TaskUrgency, TaskVisibility, TaskCompensationType, TaskStatus } from '@team517/contracts';

export interface Location {
  id: string;
  careContextId: string;
  label: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export interface Task {
  id: string;
  careContextId: string;
  createdBy: string;
  title?: string;
  helpType?: string;
  instructions?: string; // Legacy private field.
  publicInstructions?: string;
  privateInstructions?: string;
  startAt?: Timestamp;
  endAt?: Timestamp;
  locationId?: string;
  urgency?: TaskUrgency;
  visibility?: TaskVisibility;
  compensationType?: TaskCompensationType;
  pointReward?: number;
  cashAmount?: number;
  currency?: string;
  status: TaskStatus;
  offerCount: number;
  activeAssignmentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
export type TaskEventType = 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_PUBLISHED' | 'TASK_CANCELLED' | 'OFFER_CREATED' | 'OFFER_WITHDRAWN' | 'HELPER_SELECTED' | 'ASSIGNMENT_CONFIRMED' | 'ASSIGNMENT_DECLINED' | 'ASSIGNMENT_CANCELLED' | 'TASK_STARTED' | 'COMPLETION_REQUESTED' | 'TASK_COMPLETED' | 'COMPLETION_DISPUTED';
export interface TaskEvent {
  id: string;
  taskId: string;
  careContextId: string;
  actorId: string;
  type: TaskEventType;
  metadata?: { changedFields?: string[]; offerId?: string; helperId?: string; assignmentId?: string };
  createdAt: Timestamp;
}
