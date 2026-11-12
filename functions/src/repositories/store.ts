import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { UserRole } from '@team517/contracts';
import type { User, CareContext, CareContextMember } from '../domain/models';
export const membershipId = (contextId: string, uid: string) => contextId + '_' + uid;
export class Store {
  private db = getFirestore();
  async user(uid: string) { return (await this.db.collection('users').doc(uid).get()).data() as User | undefined; }
  async rolePreference(uid: string, role: UserRole, check: (user: User | undefined) => void) {
    const ref = this.db.collection('users').doc(uid);
    return this.db.runTransaction(async tx => {
      const user = (await tx.get(ref)).data() as User | undefined;
      check(user);
      const updated = { ...user!, lastActiveRole: role, updatedAt: Timestamp.now() };
      tx.set(ref, updated);
      return updated;
    });
  }
  async initialize(uid: string, role: UserRole) {
    const ref = this.db.collection('users').doc(uid);
    return this.db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) return existing.data() as User;
      const now = Timestamp.now();
      const user: User = {id:uid, roles:[role], primaryOnboardingRole:role, lastActiveRole:role, onboardingStatus:'STARTED', createdAt:now, updatedAt:now};
      tx.create(ref,user); return user;
    });
  }
  async member(id: string, uid: string) { return (await this.db.collection('care_context_members').doc(membershipId(id, uid)).get()).data() as CareContextMember | undefined; }
  async context(id: string) { return (await this.db.collection('care_contexts').doc(id).get()).data() as CareContext | undefined; }
  async createContext(uid: string, name: string) {
    const ref = this.db.collection('care_contexts').doc(); const now = Timestamp.now();
    const context: CareContext = {id:ref.id,name,createdBy:uid,status:'ACTIVE',createdAt:now,updatedAt:now};
    const id = membershipId(ref.id,uid);
    const member: CareContextMember = {id,careContextId:ref.id,userId:uid,role:'CARE_MANAGER',status:'ACTIVE',joinedAt:now};
    const batch = this.db.batch(); batch.create(ref,context); batch.create(this.db.collection('care_context_members').doc(id),member); await batch.commit(); return context;
  }
  async list(uid: string) {
    const members = await this.db.collection('care_context_members').where('userId','==',uid).get();
    const contexts = await Promise.all(members.docs.filter(d=>d.data().status === 'ACTIVE').map(d=>this.context(d.data().careContextId)));
    return contexts.filter((c): c is CareContext => Boolean(c));
  }
}
