import type { UserRole } from '@team517/contracts';
import { Store } from '../repositories/store';
import { ApiFailure } from '../shared/errors';
import { userDto } from '../care-context/service';

export async function updateRolePreference(store: Store, uid: string, role: UserRole) {
  const user = await store.rolePreference(uid, role, current => {
    if (!current) throw new ApiFailure(409, 'USER_NOT_INITIALIZED', 'Initialize your app user first.');
    if (!current.roles.includes(role)) throw new ApiFailure(403, 'FORBIDDEN', 'Choose one of your existing roles. This operation cannot grant roles.');
  });
  return userDto(user);
}
