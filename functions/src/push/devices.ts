import type { RegisterDeviceTokenRequest } from '@team517/contracts';
import { DeviceTokenRepository } from '../repositories/device-tokens';
// Identity is supplied solely by authenticated middleware, never request bodies.
export class DeviceTokenService {
  constructor(private repo = new DeviceTokenRepository()) {}
  register(uid: string, body: RegisterDeviceTokenRequest) { return this.repo.register(uid, body); }
  status(uid: string, id: string) { return this.repo.status(uid, id); }
  disable(uid: string, id: string, generation: string) { return this.repo.disable(uid, id, generation); }
}
