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
async function setup(balance=0){
 const owner='points-owner-'+crypto.randomUUID(),helper='points-helper-'+crypto.randomUUID(),backup='points-backup-'+crypto.randomUUID(),manager='points-manager-'+crypto.randomUUID();
 for(const uid of [owner,helper,backup,manager]){await store.initialize(uid,'CARE_MANAGER');await db.collection('users').doc(uid).update({roles:['CARE_MANAGER','HELPER'],verificationStatus:'VERIFIED'});}
 const context=(await call(owner,'post','/care-contexts',{name:'Synthetic points care'})).body.id;
 const id=membershipId(context,manager);await db.collection('care_context_members').doc(id).set({id,userId:manager,careContextId:context,role:'CARE_MANAGER',status:'ACTIVE'});
 const location=(await call(owner,'post',`/care-contexts/${context}/locations`,{label:'Synthetic place',formattedAddress:'PRIVATE ADDRESS',latitude:40.75283,longitude:-73.95743})).body.id;
 if(balance)await repo.grant(owner,balance,'test-initial');
 async function draft(type='VOLUNTEER',reward=250){const r=await call(owner,'post',`/care-contexts/${context}/tasks/drafts`,{title:'Points help',helpType:'ERRANDS',publicInstructions:'Help with groceries',locationId:location,startAt:'2026-12-01T14:00:00Z',endAt:'2026-12-01T15:00:00Z',urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:type,...(type==='POINTS'?{pointReward:reward}:type==='PAID'?{cashAmount:25,currency:'USD'}:{})});assert.equal(r.status,201);return r.body.id as string;}
 async function publish(task:string){const r=await call(owner,'post',`/tasks/${task}/publish`);assert.equal(r.status,200,JSON.stringify(r.body));}
 async function select(task:string,actor=helper){const o=await call(actor,'post',`/tasks/${task}/offers`,{message:'I can help'});assert.equal(o.status,201);const s=await call(owner,'post',`/tasks/${task}/select-offer`,{offerId:o.body.id});assert.equal(s.status,200,JSON.stringify(s.body));return s.body.assignment.id as string;}
 async function action(id:string,operation:string,actor=helper){const r=await call(actor,'post',`/assignments/${id}/${operation}`);assert.equal(r.status,200,JSON.stringify(r.body));return r;}
 return {owner,helper,backup,manager,context,draft,publish,select,action};
}

test('Offer availability create/read is validated, scoped, and absent from public projections',async()=>{
 const s=await setup();const task=await s.draft();await s.publish(task);
 const path=`/tasks/${task}/offers`;
 for(const body of [{availableFrom:'0000-01-01T00:00:00Z',availableUntil:'0000-01-02T00:00:00Z'},{availableFrom:'bad'},{availableFrom:'2026-12-01T14:00:00Z'},{availableFrom:'2026-12-01T15:00:00Z',availableUntil:'2026-12-01T14:00:00Z'}])assert.equal((await call(s.helper,'post',path,body)).status,400);
 assert.equal((await db.collection('offers').doc(task+'_'+s.helper).get()).exists,false);
 const created=await call(s.helper,'post',path,{message:'Whole visit',availableFrom:'2026-12-01T09:00:00-05:00',availableUntil:'2026-12-01T10:00:00-05:00'});assert.equal(created.status,201);assert.equal(created.body.availableFrom,'2026-12-01T14:00:00.000Z');assert.equal(created.body.availabilityFit,'COVERS_TASK');
 const stored=(await db.collection('offers').doc(created.body.id).get()).data()!;assert.ok(stored.availableFrom.toMillis());assert.equal(stored.availabilityFit,undefined);
 assert.equal((await call(s.helper,'get',path+'/mine')).body.offer.availabilityFit,'COVERS_TASK');
 assert.equal((await call(s.owner,'get',path)).body.offers[0].availabilityFit,'COVERS_TASK');
 const profile=(await call(s.owner,'get',`/helpers/${s.helper}/profile?taskId=${task}`)).body;assert.equal(profile.taskAvailability.availabilityFit,'COVERS_TASK');assert.equal(profile.taskAvailability.taskStartAt,'2026-12-01T14:00:00.000Z');
 assert.equal((await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body.taskAvailability,undefined);
 assert.equal((await call(s.backup,'get',`/helpers/${s.helper}/profile?taskId=${task}`)).status,403);
 assert.equal((await call(s.backup,'get',path)).status,403);
 const discovery=JSON.stringify((await call(s.backup,'get','/tasks/discover')).body);assert.ok(!discovery.includes('availableFrom'));assert.ok(!discovery.includes('taskAvailability'));
 const events=await db.collection('task_events').where('taskId','==',task).get();assert.ok(!JSON.stringify(events.docs.map(d=>d.data())).includes('availableFrom'));
});
test('Withdraw/reactivate retains saved availability and timestamps; explicit pair replaces it without duplicates',async()=>{
 const s=await setup();const task=await s.draft();await s.publish(task);const path=`/tasks/${task}/offers`;
 const initial=(await call(s.helper,'post',path,{availableFrom:'2026-12-01T14:30:00Z',availableUntil:'2026-12-01T16:00:00Z'})).body;assert.equal(initial.availabilityFit,'PARTIAL_OVERLAP');
 assert.equal((await call(s.helper,'post',path,{})).status,409);
 assert.equal((await call(s.helper,'post',path+'/mine/withdraw')).body.status,'WITHDRAWN');
 const repeated=(await call(s.helper,'post',path,{})).body;assert.equal(repeated.id,initial.id);assert.equal(repeated.createdAt,initial.createdAt);assert.equal(repeated.availableFrom,initial.availableFrom);assert.equal(repeated.availabilityFit,'PARTIAL_OVERLAP');
 await call(s.helper,'post',path+'/mine/withdraw');
 const changed=(await call(s.helper,'post',path,{availableFrom:'2026-12-01T16:00:00Z',availableUntil:'2026-12-01T17:00:00Z'})).body;assert.equal(changed.id,initial.id);assert.equal(changed.availabilityFit,'CONFLICT');
 const list=(await call(s.owner,'get',path)).body;assert.equal(list.offers.length,1);assert.equal(list.task.offerCount,1);
});
test('All compensation types allow conflict selection, retain backups and require separate confirmation; Points settles normally',async()=>{
 for(const type of ['VOLUNTEER','POINTS','PAID']){
  const s=await setup(type==='POINTS'?1000:0);const task=await s.draft(type);await s.publish(task);const path=`/tasks/${task}/offers`;
  const offer=(await call(s.helper,'post',path,{availableFrom:'2026-12-01T16:00:00Z',availableUntil:'2026-12-01T17:00:00Z'})).body;
  const backup=(await call(s.backup,'post',path,{})).body;assert.equal(backup.availabilityFit,'NOT_PROVIDED');
  const selected=await call(s.owner,'post',`/tasks/${task}/select-offer`,{offerId:offer.id});assert.equal(selected.status,200,JSON.stringify(selected.body));assert.equal(selected.body.assignment.status,'PENDING_CONFIRMATION');
  assert.equal((await call(s.owner,'get',path)).body.offers.find((o:any)=>o.id===backup.id).status,'ACTIVE');
  await s.action(selected.body.assignment.id,'confirm');await s.action(selected.body.assignment.id,'start');await s.action(selected.body.assignment.id,'request-completion');await s.action(selected.body.assignment.id,'confirm-completion',s.owner);
  if(type==='POINTS'){assert.equal((await repo.account(s.owner)).availablePoints,750);assert.equal((await repo.account(s.owner)).reservedPoints,0);assert.equal((await repo.account(s.helper)).availablePoints,250);}
  const profile=(await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body;assert.equal(profile.completedTaskCount,1);assert.equal(profile.reviewCount,0);assert.equal(profile.taskAvailability,undefined);
 }
});
