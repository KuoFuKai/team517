import type { PointAccountDto, PointTransactionType } from '@team517/contracts';
import { ApiFailure } from '../shared/errors';
export function pointAmount(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > 1_000_000_000) throw new ApiFailure(400, 'INVALID_POINTS', 'Points must be a positive whole number up to 1,000,000,000.');
  return value;
}
export function pointIdentity(kind: string, source: string, uid: string) {
  return Buffer.from(JSON.stringify([kind, source, uid])).toString('base64url');
}
export function projectPoints(account: PointAccountDto, type: PointTransactionType, amount: number): PointAccountDto {
  pointAmount(amount);
  const next = {...account};
  if (type === 'GRANT' || type === 'ADJUSTMENT') next.availablePoints += amount;
  if (type === 'RESERVE') { next.availablePoints -= amount; next.reservedPoints += amount; }
  if (type === 'RELEASE') { next.availablePoints += amount; next.reservedPoints -= amount; }
  if (type === 'TRANSFER_OUT') { next.reservedPoints -= amount; next.lifetimeSpentPoints += amount; }
  if (type === 'TRANSFER_IN') { next.availablePoints += amount; next.lifetimeEarnedPoints += amount; }
  if (Object.values(next).some(n => !Number.isSafeInteger(n) || n < 0)) throw new ApiFailure(409, type === 'RESERVE' && next.availablePoints < 0 ? 'INSUFFICIENT_POINTS' : 'POINTS_CONFLICT', type === 'RESERVE' ? `You need ${amount} points to publish this task. You currently have ${account.availablePoints} available.` : 'Points could not be updated. Refresh and try again.');
  return next;
}
