// Fictional classroom presentation, exclusively on loopback Firebase emulators.
// Business transitions use the same authenticated public clients as mobile.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { Store, membershipId } from '../functions/src/repositories/store';
import { createTransport } from '../apps/mobile/src/api/transport';
import { createTaskApi } from '../apps/mobile/src/api/tasks';
import { createMarketplaceApi } from '../apps/mobile/src/api/marketplace';
import { createAssignmentApi } from '../apps/mobile/src/api/assignments';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { UserRole } from '@team517/contracts';

for (const [key, host] of Object.entries({ FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9199', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8280' })) {
  if (process.env[key] && process.env[key] !== host) throw new Error('This scenario only accepts the documented loopback emulators.');
  process.env[key] = host;
}
if (process.env.EXPO_PUBLIC_APP_ENV && process.env.EXPO_PUBLIC_APP_ENV !== 'LOCAL') throw new Error('LOCAL only.');
initializeApp({ projectId: 'demo-team517' });
const db = getFirestore(), auth = getAuth(), store = new Store();
const contextId = 'md3AppointmentCare01', locationId = 'md3ClinicLocation001';
const manifestPath = '.tools/maker-day3/session.json';
const password = 'development517'; // Public, emulator-only password; never a cloud credential.
const people: { uid: string; email: string; name: string; role: UserRole }[] = [
  { uid: 'md3GraceChen', email: 'grace@makerday.team517.test', name: 'Grace Chen', role: 'CARE_MANAGER' },
  { uid: 'md3LindaChen', email: 'linda@makerday.team517.test', name: 'Linda Chen', role: 'CARE_RECEIVER' },
  { uid: 'md3MarcusChen', email: 'marcus@makerday.team517.test', name: 'Marcus Chen', role: 'HELPER' },
  { uid: 'md3LenaWu', email: 'lena@makerday.team517.test', name: 'Lena Wu', role: 'HELPER' },
];
async function client(person: number) {
  const response = await fetch('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: people[person].email, password, returnSecureToken: true }),
  });
  if (!response.ok) throw new Error('Start the local emulators and run init first.');
  const { idToken } = await response.json() as { idToken: string };
  return createTransport({ baseUrl: 'http://127.0.0.1:5001/demo-team517/us-central1/api/api/v1', getToken: async () => idToken });
}
async function main() {
  const command = process.argv[2] ?? 'info';
  if (command === 'init') {
    // Never delete another scenario. A reset uses the previous manifest's task,
    // and is intentionally unnecessary for a fresh emulator session.
    const now = Timestamp.now();
    for (const person of people) {
      try { await auth.getUser(person.uid); }
      catch (e) { if ((e as { code: string }).code !== 'auth/user-not-found') throw e; await auth.createUser({ uid: person.uid, email: person.email, password, displayName: person.name }); }
      await auth.updateUser(person.uid, { displayName: person.name, password });
      await store.initialize(person.uid, person.role);
      await db.collection('users').doc(person.uid).update({ publicFirstName: person.name.split(' ')[0], roles: [person.role], lastActiveRole: person.role, onboardingStatus: 'COMPLETE', verificationStatus: 'UNVERIFIED', updatedAt: now });
      const id = membershipId(contextId, person.uid);
      await db.collection('care_context_members').doc(id).set({ id, careContextId: contextId, userId: person.uid, role: person.role, status: 'ACTIVE', joinedAt: now });
    }
    await db.collection('care_contexts').doc(contextId).set({ id: contextId, name: 'Mom’s Care', createdBy: people[0].uid, careReceiverUserId: people[1].uid, status: 'ACTIVE', createdAt: now, updatedAt: now });
    await db.collection('locations').doc(locationId).set({ id: locationId, careContextId: contextId, label: 'Clinic · Roosevelt Island', formattedAddress: 'Clinic lobby, Roosevelt Island', createdBy: people[0].uid, createdAt: now, updatedAt: now });
    const tasks = createTaskApi(await client(0));
    const existing = (await tasks.listTasks(contextId)).tasks;
    if (existing.length) throw new Error('Scenario already exists. Use its manifest/checkpoints, or start a fresh emulator session. No existing tasks were deleted.');
    const task = await tasks.createTaskDraft(contextId, { title: 'Appointment companion', helpType: 'Clinic companion', startAt: '2026-11-18T15:00:00.000Z', endAt: '2026-11-18T17:00:00.000Z', locationId, urgency: 'PLANNED', visibility: 'CARE_CIRCLE', compensationType: 'VOLUNTEER', publicInstructions: 'Meet Mom in the lobby, help with check-in, stay during the visit, and walk back with her afterward.', privateInstructions: 'Please text Grace if the appointment runs late.' });
    await mkdir('.tools/maker-day3', { recursive: true });
    await writeFile(manifestPath, JSON.stringify({ scenario: 'maker-day-3-fictional', taskId: task.id, contextId }, null, 2));
    console.log('Fictional local draft ready. Use Grace and development517 to sign in.');
    return;
  }
  const session = JSON.parse(await readFile(manifestPath, 'utf8')) as { taskId: string; contextId: string };
  if (session.contextId !== contextId) throw new Error('Unexpected scenario manifest.');
  const request = await client(0), tasks = createTaskApi(request), market = createMarketplaceApi(request);
  if (command === 'publish') await tasks.publishTask(session.taskId);
  else if (command === 'offers') {
    for (const [index, message] of [[2, 'I can stay for the full visit, 10:00 AM–12:00 PM.'], [3, 'I can help with check-in, 10:00 AM–11:00 AM.']] as const) {
      const helper = createMarketplaceApi(await client(index));
      if (!(await helper.getMyOffer(session.taskId)).offer) await helper.offerHelp(session.taskId, { message });
    }
  } else if (command === 'select') {
    const offers = await market.listOffers(session.taskId);
    await market.selectOffer(session.taskId, offers.offers.find(o => o.helperId === people[2].uid)!.id);
  } else if (['confirm', 'start', 'request-completion', 'complete'].includes(command)) {
    const offers = await market.listOffers(session.taskId), id = offers.task.activeAssignmentId;
    if (!id) throw new Error('Select Marcus first.');
    const api = createAssignmentApi(command === 'complete' ? request : await client(2));
    if (command === 'confirm') await api.confirmAssignment(id);
    else if (command === 'start') await api.startTask(id);
    else if (command === 'request-completion') await api.requestCompletion(id);
    else await api.confirmCompletion(id);
  } else if (command !== 'info') throw new Error('Use init | publish | offers | select | confirm | start | request-completion | complete | info.');
  const task = await tasks.getTask(session.taskId);
  console.log(JSON.stringify({ title: task.title, status: task.status, date: task.startAt, context: 'Mom’s Care' }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
