import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import request from 'supertest';
import { createApp } from '../src/api/app';
import { Store,membershipId } from '../src/repositories/store';
import { PointRepository } from '../src/repositories/points';
import { ApiFailure } from '../src/shared/errors';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Emulators required');
initializeApp({projectId:'demo-team517'});
const db=getFirestore(),repo=new PointRepository(),store=new Store();
const app=createApp(store,async header=>{if(!header)throw new ApiFailure(401,'UNAUTHENTICATED','Sign in');return header;});
const call=(uid:string,method:'get'|'post'|'patch',path:string,body:object={})=>request(app)[method]('/api/v1'+path).set('Authorization',uid).send(body);
async function setup(balance=1500){
 const owner='points-owner-'+crypto.randomUUID(),helper='points-helper-'+crypto.randomUUID(),backup='points-backup-'+crypto.randomUUID(),manager='points-manager-'+crypto.randomUUID();
 for(const uid of [owner,helper,backup,manager]){await store.initialize(uid,'CARE_MANAGER');await db.collection('users').doc(uid).update({roles:['CARE_MANAGER','HELPER'],verificationStatus:'VERIFIED'});}
 const context=(await call(owner,'post','/care-contexts',{name:'Synthetic points care'})).body.id;
 const id=membershipId(context,manager);await db.collection('care_context_members').doc(id).set({id,userId:manager,careContextId:context,role:'CARE_MANAGER',status:'ACTIVE'});
 const location=(await call(owner,'post',`/care-contexts/${context}/locations`,{label:'Synthetic place',formattedAddress:'PRIVATE ADDRESS',latitude:40.75283,longitude:-73.95743})).body.id;
 if(balance)await repo.grant(owner,balance,'test-initial');
 async function draft(type='POINTS',reward=250){const r=await call(owner,'post',`/care-contexts/${context}/tasks/drafts`,{title:'Points help',helpType:'ERRANDS',publicInstructions:'Help with groceries',locationId:location,startAt:'2026-12-01T14:00:00Z',endAt:'2026-12-01T15:00:00Z',urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:type,...(type==='POINTS'?{pointReward:reward}:type==='PAID'?{cashAmount:25,currency:'USD'}:{})});assert.equal(r.status,201);return r.body.id as string;}
 async function publish(task:string){const r=await call(owner,'post',`/tasks/${task}/publish`);assert.equal(r.status,200,JSON.stringify(r.body));}
 async function select(task:string,actor=helper){const o=await call(actor,'post',`/tasks/${task}/offers`,{message:'I can help'});assert.equal(o.status,201);const s=await call(owner,'post',`/tasks/${task}/select-offer`,{offerId:o.body.id});assert.equal(s.status,200,JSON.stringify(s.body));return s.body.assignment.id as string;}
 async function action(id:string,operation:string,actor=helper){const r=await call(actor,'post',`/assignments/${id}/${operation}`);assert.equal(r.status,200,JSON.stringify(r.body));return r;}
 return {owner,helper,backup,manager,context,draft,publish,select,action};
}
async function coherent(uid:string){const a=await repo.account(uid),docs=await db.collection('point_transactions').where('userId','==',uid).get();const sum={availablePoints:0,reservedPoints:0,lifetimeEarnedPoints:0,lifetimeSpentPoints:0};for(const d of docs.docs){const v=d.data();sum.availablePoints+=v.availableDelta;sum.reservedPoints+=v.reservedDelta;sum.lifetimeEarnedPoints+=v.earnedDelta;sum.lifetimeSpentPoints+=v.spentDelta;}assert.deepEqual(a,sum);return a;}
test('POINTS draft is free; concurrent publish reserves once; edits are immutable; insufficient publish stays DRAFT',async()=>{
 const s=await setup(),task=await s.draft();assert.equal((await coherent(s.owner)).reservedPoints,0);
 const results=await Promise.all([call(s.owner,'post',`/tasks/${task}/publish`),call(s.owner,'post',`/tasks/${task}/publish`)]);assert.ok(results.every(r=>r.status===200));
 assert.deepEqual(await coherent(s.owner),{availablePoints:1250,reservedPoints:250,lifetimeEarnedPoints:0,lifetimeSpentPoints:0});
 assert.equal((await call(s.owner,'patch',`/tasks/${task}`,{pointReward:500})).status,409);
 const tooMuch=await s.draft('POINTS',2000),rejected=await call(s.owner,'post',`/tasks/${tooMuch}/publish`);assert.equal(rejected.body.error.code,'INSUFFICIENT_POINTS');assert.equal((await db.collection('tasks').doc(tooMuch).get()).data()!.status,'DRAFT');
 for(const type of ['VOLUNTEER','PAID']){const t=await s.draft(type);await s.publish(t);await call(s.owner,'post',`/tasks/${t}/cancel`);}assert.equal((await coherent(s.owner)).reservedPoints,250);
 const discovery=await call(s.helper,'get','/tasks/discover');assert.ok(!JSON.stringify(discovery.body).includes('PRIVATE ADDRESS'));assert.ok(!JSON.stringify(discovery.body).includes('availablePoints'));
});
test('Competing POINTS tasks cannot overspend one account; cancellation releases once including manager action',async()=>{
 const s=await setup(300),a=await s.draft(),b=await s.draft();const r=await Promise.all([call(s.owner,'post',`/tasks/${a}/publish`),call(s.owner,'post',`/tasks/${b}/publish`)]);assert.equal(r.filter(v=>v.status===200).length,1);assert.equal(r.filter(v=>v.body.error?.code==='INSUFFICIENT_POINTS').length,1);
 const task=r[0].status===200?a:b;await Promise.all([call(s.manager,'post',`/tasks/${task}/cancel`),call(s.owner,'post',`/tasks/${task}/cancel`)]);assert.equal((await coherent(s.owner)).availablePoints,300);assert.equal((await coherent(s.owner)).reservedPoints,0);assert.equal((await repo.account(s.manager)).availablePoints,0);
});
test('Offer/withdraw/decline, pending and confirmed relationship cancellation retain the Task reservation',async()=>{
 const s=await setup(),task=await s.draft();await s.publish(task);
 await call(s.helper,'post',`/tasks/${task}/offers`,{});await call(s.helper,'post',`/tasks/${task}/offers/mine/withdraw`,{});
 let id=await s.select(task);await s.action(id,'decline');assert.equal((await coherent(s.owner)).reservedPoints,250);
 id=await s.select(task,s.backup);await s.action(id,'cancel',s.owner);assert.equal((await coherent(s.owner)).reservedPoints,250);
 id=await s.select(task);await s.action(id,'confirm');await s.action(id,'cancel');assert.equal((await coherent(s.owner)).reservedPoints,250);
 await call(s.owner,'post',`/tasks/${task}/cancel`);assert.equal((await coherent(s.owner)).availablePoints,1500);
});
test('Completion settles paired immutable entries exactly once, requester authorization and cancel race stay coherent',async()=>{
 const s=await setup(),task=await s.draft();await s.publish(task);const id=await s.select(task);await s.action(id,'confirm');await s.action(id,'start');await s.action(id,'request-completion');
 assert.equal((await call(s.helper,'post',`/assignments/${id}/confirm-completion`)).status,403);
 const results=await Promise.all([call(s.owner,'post',`/assignments/${id}/confirm-completion`),call(s.manager,'post',`/assignments/${id}/confirm-completion`),call(s.owner,'post',`/tasks/${task}/cancel`)]);
 assert.equal(results[0].status,200);assert.equal(results[1].status,200);assert.equal(results[2].status,409);
 assert.equal((await coherent(s.owner)).reservedPoints,0);assert.equal((await coherent(s.owner)).availablePoints,1250);assert.equal((await coherent(s.helper)).availablePoints,250);assert.equal((await coherent(s.helper)).lifetimeEarnedPoints,250);
 const entries=(await db.collection('point_transactions').where('taskId','==',task).get()).docs.map(d=>d.data());assert.equal(entries.filter(e=>e.type==='TRANSFER_IN').length,1);assert.equal(entries.filter(e=>e.type==='TRANSFER_OUT').length,1);assert.equal(entries.find(e=>e.type==='TRANSFER_IN')!.sourceId,entries.find(e=>e.type==='TRANSFER_OUT')!.sourceId);
 const outsider='outsider';await store.initialize(outsider,'HELPER');assert.equal((await call(outsider,'post',`/assignments/${id}/confirm-completion`)).status,403);
});
test('DISPUTED holds points and creates no settlement or automatic release',async()=>{
 const s=await setup(),task=await s.draft();await s.publish(task);const id=await s.select(task);await s.action(id,'confirm');await s.action(id,'start');await s.action(id,'request-completion');await s.action(id,'dispute',s.owner);
 assert.equal((await coherent(s.owner)).reservedPoints,250);assert.equal((await coherent(s.helper)).availablePoints,0);assert.equal((await call(s.owner,'post',`/tasks/${task}/cancel`)).status,409);
});
test('Concurrent relationship reopen and whole-task cancellation release exactly once',async()=>{
 const s=await setup(),task=await s.draft();await s.publish(task);const id=await s.select(task);const results=await Promise.all([call(s.helper,'post',`/assignments/${id}/decline`),call(s.owner,'post',`/tasks/${task}/cancel`)]);assert.equal(results[1].status,200);assert.equal((await coherent(s.owner)).reservedPoints,0);assert.equal((await coherent(s.owner)).availablePoints,1500);
});

test('Care Manager publication cannot reveal the Task creator private wallet balance',async()=>{
 const s=await setup(120),task=await s.draft();
 const managed=await call(s.manager,'post',`/tasks/${task}/publish`);assert.equal(managed.status,409);assert.equal(managed.body.error.code,'INSUFFICIENT_POINTS');
 assert.ok(!managed.body.error.message.includes('120'),'Another manager must not learn the creator balance from an error');
 const own=await call(s.owner,'post',`/tasks/${task}/publish`);assert.ok(own.body.error.message.includes('120'));
 assert.equal((await db.collection('tasks').doc(task).get()).data()!.status,'DRAFT');assert.equal((await coherent(s.owner)).availablePoints,120);
});
