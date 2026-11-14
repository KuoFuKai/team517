import { PointRepository } from '../repositories/points';
// Identity comes exclusively from authenticated middleware, never request parameters.
export class PointService {
  constructor(private repo = new PointRepository()) {}
  account(uid: string) { return this.repo.account(uid); }
}
