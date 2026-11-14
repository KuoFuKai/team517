import type { PointTransactionDto, PointTransactionType } from '@team517/contracts';
const labels: Record<PointTransactionType,string>={GRANT:'Points added',RESERVE:'Reserved for a task',RELEASE:'Task reservation released',TRANSFER_OUT:'Task reward sent',TRANSFER_IN:'Task reward earned',ADJUSTMENT:'Points adjustment'};
export function pointActivity(value: PointTransactionDto) {
  return {label:labels[value.type], amount: (value.type==='RESERVE' ? '−' : value.availableDelta>0 ? '+' : '−')+value.amount.toLocaleString()+' pts', detail:value.type==='RESERVE' ? 'Moved to reserved' : value.type==='TRANSFER_OUT' ? 'Paid from reserved points' : value.type==='RELEASE' ? 'Returned to available points' : 'Available points'};
}
