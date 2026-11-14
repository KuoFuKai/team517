import { getFirestore } from 'firebase-admin/firestore';
import type { User } from '../domain/models';
import { SupportRepository } from './support';
import { trustSummary } from '../trust/projection';
import { ApiFailure } from '../shared/errors';
export class TrustRepository {
  async summary(id: string) {
    const user=(await getFirestore().collection('users').doc(id).get()).data() as User | undefined;
    if(!user?.roles.includes('HELPER'))throw new ApiFailure(404,'HELPER_NOT_FOUND','Helper profile is unavailable.');
    const [completed,rating]=await Promise.all([getFirestore().collection('assignments').where('helperId','==',id).where('status','==','COMPLETED').count().get(),new SupportRepository().rating(id)]);
    return {user,summary:trustSummary(user,completed.data().count,rating)};
  }
}
