import { PointRepository } from '../repositories/points';
// Identity comes exclusively from authenticated middleware, never request parameters.
export class PointService {
  constructor(private repo = new PointRepository()) {}
  history(uid: string, cursor?: string) { return this.repo.history(uid, cursor); }
  account(uid: string) { return this.repo.account(uid); }
}
