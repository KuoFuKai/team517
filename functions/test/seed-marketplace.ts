import { PointRepository } from '../src/repositories/points';
// Explicit emulator-only fixtures. Never use real verification or production data.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { Store, membershipId } from '../src/repositories/store';
import type { UserRole } from '@team517/contracts';

async function main() {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9199';
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8280';
  for (const host of [process.env.FIREBASE_AUTH_EMULATOR_HOST, process.env.FIRESTORE_EMULATOR_HOST]) {
    if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) throw new Error('Seed accepts loopback emulators only.');
  }
  initializeApp({ projectId: 'demo-team517' });
  const db = getFirestore(), store = new Store(), now = Timestamp.now();
  const accounts: { name: string; roles: UserRole[]; verified: boolean }[] = [
    { name: 'manager', roles: ['CARE_MANAGER', 'HELPER'], verified: true },
    { name: 'alex', roles: ['HELPER'], verified: true }, { name: 'marcus', roles: ['HELPER'], verified: true },
    { name: 'lisa', roles: ['HELPER'], verified: true }, { name: 'circle', roles: ['HELPER'], verified: false },
  ];
  const ids = new Map<string, string>();
  for (const account of accounts) {
    const email = account.name + '@team517.test';
    let user;
    try { user = await getAuth().getUserByEmail(email); }
    catch (error) { if ((error as { code?: string }).code !== 'auth/user-not-found') throw error; user = await getAuth().createUser({ email, password: 'development517' }); }
    await getAuth().updateUser(user.uid, { password: 'development517' });
    ids.set(account.name, user.uid);
    if (account.name !== 'circle') await new PointRepository().grant(user.uid, account.name === 'manager' ? 1500 : 300, 'local-initial-v1');
    await store.initialize(user.uid, account.roles[0]);
    await db.runTransaction(async tx=>{const ref=db.collection('users').doc(user.uid),profile=await tx.get(ref);if(profile.data()?.publicFirstName===undefined)tx.update(ref,{publicFirstName:({manager:'Grace',alex:'Alex',marcus:'Marcus',lisa:'Lisa',circle:'Sam'} as Record<string,string>)[account.name]});});
    await db.collection('users').doc(user.uid).update({ roles: account.roles, lastActiveRole: account.roles[0], verificationStatus: account.verified ? 'VERIFIED' : 'UNVERIFIED', updatedAt: now });
  }
  const ownerId = ids.get('manager')!;
  const contexts = await db.collection('care_contexts').where('createdBy', '==', ownerId).limit(1).get();
  const contextId = contexts.empty ? (await store.createContext(ownerId, "Mom's care")).id : contexts.docs[0].id;
  const circleId = ids.get('circle')!, id = membershipId(contextId, circleId);
  await db.collection('care_context_members').doc(id).set({ id, careContextId: contextId, userId: circleId, role: 'HELPER', status: 'ACTIVE', joinedAt: now });
  const places = await db.collection('locations').where('careContextId', '==', contextId).get();
  if (!places.docs.some(doc => doc.data().label === 'Demo home')) {
    const ref = db.collection('locations').doc();
    await ref.create({ id: ref.id, careContextId: contextId, label: 'Demo home', formattedAddress: 'Private demo address (not a real care receiver)', latitude: 40.75283, longitude: -73.95743, createdBy: ownerId, createdAt: now, updatedAt: now });
  }
  console.log('Seeded demo-team517 emulator accounts: manager/alex/marcus/lisa/circle @team517.test. Public development password: development517.');
  console.log('manager has CARE_MANAGER + HELPER; external helpers are mock VERIFIED; circle is an unverified trusted-circle member. No real identity verification occurred.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
