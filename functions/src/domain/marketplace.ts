import type { Timestamp } from 'firebase-admin/firestore';
import type { OfferStatus, AssignmentStatus } from '@team517/contracts';

export interface Offer {
  id: string; taskId: string; careContextId: string; helperId: string; message?: string; availableFrom?: Timestamp; availableUntil?: Timestamp;
  availabilityRevision?: number; availabilityChangedAt?: Timestamp;
  status: OfferStatus; createdAt: Timestamp; updatedAt: Timestamp;
}
export interface Assignment {
  id: string; taskId: string; careContextId: string; offerId: string; helperId: string; selectedBy: string;
  selectedAvailabilityRevision?: number; selectedAvailableFrom?: Timestamp; selectedAvailableUntil?: Timestamp; requiresRequesterReconfirmation?: boolean;
  status: AssignmentStatus; selectedAt: Timestamp; confirmedAt?: Timestamp; startedAt?: Timestamp; completionRequestedAt?: Timestamp; completedAt?: Timestamp; disputeReason?: string; createdAt: Timestamp; updatedAt: Timestamp;
}
