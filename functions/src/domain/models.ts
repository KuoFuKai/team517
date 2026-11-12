import type { Timestamp } from 'firebase-admin/firestore';
import type { UserRole, VerificationStatus } from '@team517/contracts';
export interface User { id: string; roles: UserRole[]; primaryOnboardingRole: UserRole; lastActiveRole?: UserRole; verificationStatus?: VerificationStatus; onboardingStatus: 'STARTED' | 'COMPLETE'; createdAt: Timestamp; updatedAt: Timestamp }
export interface CareContext { id: string; name: string; createdBy: string; careReceiverUserId?: string; status: 'ACTIVE' | 'ARCHIVED'; createdAt: Timestamp; updatedAt: Timestamp }
export interface CareContextMember { id: string; careContextId: string; userId: string; role: UserRole; status: 'ACTIVE' | 'REMOVED'; invitedBy?: string; joinedAt: Timestamp }
