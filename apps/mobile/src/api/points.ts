import type { PointAccountDto } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createPointApi(request: ApiRequest) {
  return { getPointAccount: () => request<PointAccountDto>('/me/points') };
}
