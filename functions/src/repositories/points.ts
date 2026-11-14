import { getFirestore } from 'firebase-admin/firestore';
import type { PointAccountDto } from '@team517/contracts';

export const zeroAccount = (): PointAccountDto => ({ availablePoints: 0, reservedPoints: 0, lifetimeEarnedPoints: 0, lifetimeSpentPoints: 0 });
export class PointRepository {
  async account(uid: string): Promise<PointAccountDto> {
    const value = (await getFirestore().collection('point_accounts').doc(uid).get()).data();
    if (!value) return zeroAccount();
    return { availablePoints: value.availablePoints, reservedPoints: value.reservedPoints,
      lifetimeEarnedPoints: value.lifetimeEarnedPoints, lifetimeSpentPoints: value.lifetimeSpentPoints };
  }
}
