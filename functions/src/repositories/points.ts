import type { Task } from '../domain/task';
import type { Assignment } from '../domain/marketplace';
import { getFirestore, Timestamp, FieldPath, type Transaction } from 'firebase-admin/firestore';
import type { PointAccountDto, PointTransactionListDto, PointTransactionType } from '@team517/contracts';
import type { PointAccount, PointTransaction } from '../domain/points';
import { ApiFailure } from '../shared/errors';
import { pointAmount, pointIdentity, projectPoints } from '../points/ledger';

export const zeroAccount = (): PointAccountDto => ({ availablePoints: 0, reservedPoints: 0, lifetimeEarnedPoints: 0, lifetimeSpentPoints: 0 });
// Reads are gathered before a write closure is returned; lifecycle repositories invoke
// that closure only after ALL authorization and resource reads have finished.
export async function preparePointEntry(tx: Transaction, uid: string, type: PointTransactionType, amount: number, sourceId: string, taskId?: string, assignmentId?: string) {
  pointAmount(amount);
  const db = getFirestore(), id = pointIdentity(type, sourceId, uid);
  const entryRef = db.collection('point_transactions').doc(id), accountRef = db.collection('point_accounts').doc(uid);
  const [entry, snapshot] = await Promise.all([tx.get(entryRef), tx.get(accountRef)]);
  if (entry.exists) {
    const existing = entry.data() as PointTransaction;
    if (existing.userId !== uid || existing.type !== type || existing.amount !== amount || existing.sourceId !== sourceId) throw new ApiFailure(409, 'POINTS_CONFLICT', 'Points source conflicts with an existing transaction.');
    return () => {}; // Exact replay never changes balances or rewrites the ledger.
  }
  const old = snapshot.exists ? snapshot.data() as PointAccount : zeroAccount();
  const next = projectPoints({availablePoints:old.availablePoints,reservedPoints:old.reservedPoints,lifetimeEarnedPoints:old.lifetimeEarnedPoints,lifetimeSpentPoints:old.lifetimeSpentPoints}, type, amount);
  const now = Timestamp.now();
  const record: PointTransaction = { id, userId: uid, type, amount, sourceId,
    availableDelta: next.availablePoints-old.availablePoints, reservedDelta: next.reservedPoints-old.reservedPoints,
    earnedDelta: next.lifetimeEarnedPoints-old.lifetimeEarnedPoints, spentDelta: next.lifetimeSpentPoints-old.lifetimeSpentPoints,
    createdAt: now, ...(taskId ? {taskId} : {}), ...(assignmentId ? {assignmentId} : {}) };
  return () => {
    tx.create(entryRef, record);
    tx.set(accountRef, {...next,userId:uid,createdAt:snapshot.exists ? (old as PointAccount).createdAt : now,updatedAt:now});
  };
}
export class PointRepository {
  async account(uid: string): Promise<PointAccountDto> {
    const value = (await getFirestore().collection('point_accounts').doc(uid).get()).data();
    if (!value) return zeroAccount();
    return { availablePoints: value.availablePoints, reservedPoints: value.reservedPoints,
      lifetimeEarnedPoints: value.lifetimeEarnedPoints, lifetimeSpentPoints: value.lifetimeSpentPoints };
  }
  // Backend-only fixture operation. No HTTP route exposes this capability.
  async grant(uid: string, amount: number, sourceId: string) {
    await getFirestore().runTransaction(async tx => { const write = await preparePointEntry(tx, uid, 'GRANT', amount, sourceId); write(); });
  }
  async history(uid: string, cursor?: string): Promise<PointTransactionListDto> {
    const db=getFirestore(), collection=db.collection('point_transactions');
    let query=collection.where('userId','==',uid).orderBy('createdAt','desc').orderBy(FieldPath.documentId(),'desc').limit(21);
    if (cursor) {
      const last=await collection.doc(cursor).get();
      if (!last.exists || last.data()!.userId !== uid) throw new ApiFailure(400,'INVALID_CURSOR','This activity page is unavailable. Refresh your points.');
      query=query.startAfter(last);
    }
    const result=await query.get(), page=result.docs.slice(0,20);
    return {transactions:page.map(doc=>{ const v=doc.data() as PointTransaction; return {id:v.id,type:v.type,amount:v.amount,availableDelta:v.availableDelta,reservedDelta:v.reservedDelta,createdAt:v.createdAt.toDate().toISOString()}; }),limit:20,...(result.size>20 ? {nextCursor:page.at(-1)!.id} : {})};
  }
}

export async function prepareTaskPoints(tx: Transaction, before: Task, after: Task, assignment?: Assignment) {
  if (before.compensationType !== 'POINTS' || before.status === after.status || !['COMPLETED','CANCELLED'].includes(after.status) || before.status === 'DRAFT') return () => {};
  const db=getFirestore(), amount=pointAmount(before.pointReward!);
  const reserveRef=db.collection('point_transactions').doc(pointIdentity('RESERVE',before.id,before.createdBy));
  const reserve=await tx.get(reserveRef);
  if (!reserve.exists || reserve.data()!.amount !== amount || reserve.data()!.userId !== before.createdBy) throw new ApiFailure(409,'POINTS_RESERVATION_MISSING','This task needs its points reservation checked before it can be resolved.');
  // Both terminal outcomes are read in this transaction; the Task is also locked.
  const terminal=await tx.get(db.collection('point_transactions').doc(pointIdentity(after.status==='COMPLETED' ? 'RELEASE' : 'TRANSFER_OUT',before.id,before.createdBy)));
  if (terminal.exists) throw new ApiFailure(409,'POINTS_CONFLICT','This task reward has already been resolved.');
  if (after.status==='CANCELLED') return preparePointEntry(tx,before.createdBy,'RELEASE',amount,before.id,before.id);
  if (!assignment || assignment.helperId===before.createdBy || assignment.status!=='COMPLETED') throw new ApiFailure(409,'POINTS_CONFLICT','A completed helper assignment is required.');
  const out=await preparePointEntry(tx,before.createdBy,'TRANSFER_OUT',amount,before.id,before.id,assignment.id);
  const incoming=await preparePointEntry(tx,assignment.helperId,'TRANSFER_IN',amount,before.id,before.id,assignment.id);
  return ()=>{out();incoming();};
}
