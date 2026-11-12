import type { CareContextDto, UserDto } from '@team517/contracts';
import type { CareContext, User } from '../domain/models';
import { Store } from '../repositories/store';
import { authorize } from '../permissions/authorize';
import { ApiFailure } from '../shared/errors';
export const userDto = (u: User): UserDto => ({id:u.id,roles:u.roles,primaryOnboardingRole:u.primaryOnboardingRole,lastActiveRole:u.lastActiveRole,verificationStatus:u.verificationStatus ?? 'UNVERIFIED',onboardingStatus:u.onboardingStatus,createdAt:u.createdAt.toDate().toISOString(),updatedAt:u.updatedAt.toDate().toISOString()});
export const contextDto = (c: CareContext): CareContextDto => ({id:c.id,name:c.name,createdBy:c.createdBy,careReceiverUserId:c.careReceiverUserId,status:c.status,createdAt:c.createdAt.toDate().toISOString(),updatedAt:c.updatedAt.toDate().toISOString()});
export class CareContextService {
  constructor(private store: Store) {}
  async create(uid: string, name: string) { await authorize(this.store,uid,'CREATE_CARE_CONTEXT'); return contextDto(await this.store.createContext(uid,name)); }
  async list(uid: string) { if (!await this.store.user(uid)) throw new ApiFailure(409,'USER_NOT_INITIALIZED','Initialize your app user first.'); return (await this.store.list(uid)).map(contextDto); }
  async get(uid: string,id: string) { await authorize(this.store,uid,'VIEW_CARE_CONTEXT',id); const c=await this.store.context(id); if (!c) throw new ApiFailure(404,'NOT_FOUND','Care context not found.'); return contextDto(c); }
}
