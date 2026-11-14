import type { HelperTrustSummaryDto, VerificationStatus } from '@team517/contracts';
import type { User } from '../domain/models';
// Only the explicit public first-name field is used. Auth names/emails are never inferred.
export function trustSummary(user: User, completedTaskCount: number, rating: {reviewCount:number;averageRating?:number}): HelperTrustSummaryDto {
  const safeName = typeof user.publicFirstName==='string' && /^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(user.publicFirstName) ? user.publicFirstName : 'Helper '+user.id.slice(-4).toUpperCase();
  const statuses: VerificationStatus[]=['UNVERIFIED','PENDING','VERIFIED','FAILED'];
  return {userId:user.id,displayName:safeName,verificationStatus:statuses.includes(user.verificationStatus!) ? user.verificationStatus! : 'UNVERIFIED',completedTaskCount,reviewCount:rating.reviewCount,...(rating.reviewCount && rating.averageRating!==undefined ? {averageRating:rating.averageRating} : {})};
}
