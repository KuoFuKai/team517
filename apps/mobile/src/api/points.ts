import type { PointAccountDto, PointTransactionListDto } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createPointApi(request: ApiRequest) {
  return { getPointTransactions: (cursor?: string) => request<PointTransactionListDto>('/me/points/transactions'+(cursor ? '?cursor='+encodeURIComponent(cursor) : '')), getPointAccount: () => request<PointAccountDto>('/me/points') };
}
