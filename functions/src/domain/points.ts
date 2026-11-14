import type { Timestamp } from 'firebase-admin/firestore';
import type { PointAccountDto, PointTransactionType } from '@team517/contracts';
export interface PointAccount extends PointAccountDto { userId: string; createdAt: Timestamp; updatedAt: Timestamp }
export interface PointTransaction {
  id: string; userId: string; type: PointTransactionType; amount: number;
  availableDelta: number; reservedDelta: number; earnedDelta: number; spentDelta: number;
  sourceId: string; taskId?: string; assignmentId?: string; createdAt: Timestamp;
}
