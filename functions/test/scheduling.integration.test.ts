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
 const owner='schedule-owner-'+crypto.randomUUID(),helper='schedule-helper-'+crypto.randomUUID(),backup='schedule-backup-'+crypto.randomUUID(),manager='schedule-manager-'+crypto.randomUUID();
 for(const uid of [owner,helper,backup,manager]){await store.initialize(uid,'CARE_MANAGER');await db.collection('users').doc(uid).update({roles:['CARE_MANAGER','HELPER'],verificationStatus:'VERIFIED'});}
 const context=(await call(owner,'post','/care-contexts',{name:'Synthetic points care'})).body.id;
 const id=membershipId(context,manager);await db.collection('care_context_members').doc(id).set({id,userId:manager,careContextId:context,role:'CARE_MANAGER',status:'ACTIVE'});
 const location=(await call(owner,'post',`/care-contexts/${context}/locations`,{label:'Synthetic place',formattedAddress:'PRIVATE ADDRESS',latitude:48.85661,longitude:2.35222})).body.id;
 if(balance)await repo.grant(owner,balance,'test-initial');
 async function draft(type='VOLUNTEER',reward=250){const r=await call(owner,'post',`/care-contexts/${context}/tasks/drafts`,{title:'Points help',helpType:'ERRANDS',publicInstructions:'Help with groceries',locationId:location,startAt:'2026-12-01T15:00:00Z',endAt:'2026-12-01T17:00:00Z',urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:type,...(type==='POINTS'?{pointReward:reward}:type==='PAID'?{cashAmount:25,currency:'USD'}:{})});assert.equal(r.status,201);return r.body.id as string;}
 async function publish(task:string){const r=await call(owner,'post',`/tasks/${task}/publish`);assert.equal(r.status,200,JSON.stringify(r.body));}
 async function select(task:string,actor=helper){const o=await call(actor,'post',`/tasks/${task}/offers`,{message:'I can help'});assert.equal(o.status,201);const s=await call(owner,'post',`/tasks/${task}/select-offer`,{offerId:o.body.id});assert.equal(s.status,200,JSON.stringify(s.body));return s.body.assignment.id as string;}
 async function action(id:string,operation:string,actor=helper){const r=await call(actor,'post',`/assignments/${id}/${operation}`);assert.equal(r.status,200,JSON.stringify(r.body));return r;}
 return {owner,helper,backup,manager,context,draft,publish,select,action};
}

const oldWindow={availableFrom:'2026-12-01T14:30:00Z',availableUntil:'2026-12-01T17:30:00Z'},newWindow={availableFrom:'2026-12-01T17:30:00Z',availableUntil:'2026-12-01T21:00:00Z'};
const moved={startAt:'2026-12-01T18:00:00Z',endAt:'2026-12-01T20:00:00Z'};
async function story(type='VOLUNTEER'){
 const s=await setup(type==='POINTS'?1000:0),task=await s.draft(type);await s.publish(task);
 const offer=(await call(s.helper,'post',`/tasks/${task}/offers`,{...oldWindow,message:'Original offer'})).body;
 const backupOffer=(await call(s.backup,'post',`/tasks/${task}/offers`,newWindow)).body;
 return {...s,task,offer,backupOffer};
}
type Story=Awaited<ReturnType<typeof story>>;
async function select(s:Story){const r=await call(s.owner,'post',`/tasks/${s.task}/select-offer`,{offerId:s.offer.id,availabilityRevision:0});assert.equal(r.status,200,JSON.stringify(r.body));return r.body.assignment.id as string;}
const move=(s:Story,revision=0,id:string|null=null,window=moved,actor=s.owner,preview=false)=>call(actor,'post',`/tasks/${s.task}/reschedule${preview?'/preview':''}`,{...window,expectedRevision:revision,expectedAssignmentId:id});
const reconfirm=(s:Story,id:string,revision:number,actor=s.helper)=>call(actor,'post',`/assignments/${id}/reconfirm-schedule`,{expectedRevision:revision});
const taskData=async(s:Story)=>(await db.collection('tasks').doc(s.task).get()).data()!;
const audit=async(s:Story,type:string)=>(await db.collection('task_events').where('taskId','==',s.task).where('type','==',type).get()).docs.map(d=>d.data());
const view=(s:Story,id:string)=>call(s.helper,'get',`/assignments/${id}`);

test('Reschedule preview is read-only, authorize current owner/manager, zero-compatible revisions and idempotent normalized retries',async()=>{
 const s=await story();assert.equal((await call(s.helper,'get',`/tasks/${s.task}`)).status,403);
 assert.equal((await move(s,0,null,moved,s.backup)).status,403);
 const before=await taskData(s),p=await move(s,0,null,moved,s.manager,true);assert.equal(p.status,200);assert.equal(p.body.affectedHelpers,2);assert.equal(p.body.requiresHelperReconfirmation,false);assert.deepEqual(await taskData(s),before);assert.equal((await audit(s,'TASK_RESCHEDULED')).length,0);
 const r=await move(s,0,null,moved,s.manager);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.task.scheduleRevision,1);
 const retry=await move(s,0,null,{startAt:'2026-12-01T13:00:00-05:00',endAt:'2026-12-01T15:00:00-05:00'});assert.equal(retry.status,200);assert.equal((await audit(s,'TASK_RESCHEDULED')).length,1);
 assert.equal((await move(s,0,null,{startAt:'2026-12-02T18:00:00Z',endAt:'2026-12-02T20:00:00Z'})).body.error.code,'SCHEDULE_STALE');
 const membership=membershipId(s.context,s.manager);await db.collection('care_context_members').doc(membership).update({status:'REMOVED'});assert.equal((await move(s,1,null,moved,s.manager)).status,403);
});
test('Only active published states allow reschedule; drafts and execution/terminal states reject without writes',async()=>{
 const s=await story();for(const status of ['DRAFT','IN_PROGRESS','COMPLETION_PENDING','COMPLETED','CANCELLED','DISPUTED']){await db.collection('tasks').doc(s.task).update({status});assert.equal((await move(s)).body.error.code,'TASK_NOT_RESCHEDULABLE');}assert.equal((await audit(s,'TASK_RESCHEDULED')).length,0);
 await db.collection('tasks').doc(s.task).update({status:'OPEN',offerCount:0});assert.equal((await move(s)).status,200);
});
test('ACTIVE Offer fits recompute against new Task, Offer bytes/history stay unchanged and notifications have safe scoped routes',async()=>{
 const s=await story();const refs=[s.offer.id,s.backupOffer.id].map(id=>db.collection('offers').doc(id));const before=await Promise.all(refs.map(async r=>(await r.get()).data()));assert.equal((await move(s)).status,200);
 assert.deepEqual(await Promise.all(refs.map(async r=>(await r.get()).data())),before);
 const offers=(await call(s.owner,'get',`/tasks/${s.task}/offers`)).body;assert.equal(offers.offers.find((o:any)=>o.id===s.offer.id).availabilityFit,'CONFLICT');assert.equal(offers.offers.find((o:any)=>o.id===s.backupOffer.id).availabilityFit,'COVERS_TASK');assert.equal(offers.task.scheduleRevision,1);
 for(const uid of [s.helper,s.backup]){const n=(await call(uid,'get','/me/notifications')).body.notifications.filter((n:any)=>n.type==='TASK_RESCHEDULED');assert.equal(n.length,1);assert.equal(n[0].resourceType,'TASK');assert.ok(!JSON.stringify(n).includes('PRIVATE'));}
 assert.ok(!(await call(s.owner,'get','/me/notifications')).body.notifications.some((n:any)=>n.type==='TASK_RESCHEDULED'));
 const d=(await call(s.helper,'get',`/tasks/${s.task}/discovery`)).body;assert.equal(d.startAt,'2026-12-01T18:00:00.000Z');assert.ok(!JSON.stringify(d).includes('PRIVATE'));assert.ok(!JSON.stringify(d).includes('formattedAddress'));
 const events=await audit(s,'TASK_RESCHEDULED');assert.ok(!JSON.stringify(events).includes('18:00'));assert.ok(!JSON.stringify(events).includes('PRIVATE'));
});
test('Selected pending Helper must explicitly reconfirm even when availability still covers, and retry is read-only',async()=>{
 const s=await story(),id=await select(s);const body={startAt:'2026-12-01T15:15:00Z',endAt:'2026-12-01T16:45:00Z'};assert.equal((await move(s,0,id,body)).status,200);
 const member=membershipId(s.context,s.helper);await db.collection('care_context_members').doc(member).set({id:member,userId:s.helper,careContextId:s.context,role:'CARE_MANAGER',status:'ACTIVE'});assert.equal((await move(s,1,id,body,s.helper)).status,403);
 const a=(await view(s,id)).body;assert.equal(a.status,'PENDING_CONFIRMATION');assert.equal(a.scheduleReview.requiresHelperReconfirmation,true);assert.equal(a.scheduleReview.availability.availabilityFit,'COVERS_TASK');assert.equal((await call(s.helper,'post',`/assignments/${id}/confirm`)).body.error.code,'SCHEDULE_RECONFIRMATION_REQUIRED');
 assert.equal((await reconfirm(s,id,1,s.backup)).status,403);assert.equal((await reconfirm(s,id,1)).status,200);const before=await taskData(s);assert.equal((await reconfirm(s,id,1)).status,200);assert.deepEqual(await taskData(s),before);assert.equal((await audit(s,'SCHEDULE_RECONFIRMED')).length,1);assert.equal((await view(s,id)).body.scheduleReview.confirmedScheduleRevision,1);
});
test('Confirmed identity preserved but previous confirmation and exact location suspended; covers update required; Points and Trust invariant',async()=>{
 const s=await story('POINTS'),id=await select(s);await s.action(id,'confirm');assert.equal((await call(s.helper,'get',`/assignments/${id}/execution`)).status,200);
 const wallet=await repo.account(s.owner),ledger=(await db.collection('point_transactions').where('taskId','==',s.task).get()).docs.map(d=>d.data()),trust=(await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body;
 assert.equal((await move(s,0,id)).status,200);const a=(await view(s,id)).body;assert.equal(a.id,id);assert.equal(a.status,'PENDING_CONFIRMATION');assert.equal(a.scheduleReview.availability.availabilityFit,'CONFLICT');assert.equal((await call(s.helper,'get',`/assignments/${id}/execution`)).status,403);assert.equal((await call(s.helper,'post',`/assignments/${id}/start`)).status,409);assert.equal((await reconfirm(s,id,1)).body.error.code,'AVAILABILITY_UPDATE_REQUIRED');
 assert.equal((await call(s.helper,'patch',`/tasks/${s.task}/offers/mine/availability`,{...newWindow,expectedRevision:0})).status,200);assert.equal((await reconfirm(s,id,1)).status,200);assert.equal((await call(s.helper,'get',`/assignments/${id}/execution`)).status,200);assert.equal((await view(s,id)).body.scheduleReview.requiresHelperReconfirmation,false);
 assert.deepEqual(await repo.account(s.owner),wallet);assert.deepEqual((await db.collection('point_transactions').where('taskId','==',s.task).get()).docs.map(d=>d.data()),ledger);assert.deepEqual((await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body,trust);
});
test('Repeated proposals retain last accepted schedule, stale Helper responses/select/relationship previews cannot overwrite newer intent',async()=>{
 const s=await story(),id=await select(s);assert.equal((await move(s,0,id)).status,200);const next={startAt:'2026-12-02T18:00:00Z',endAt:'2026-12-02T20:00:00Z'};assert.equal((await move(s,1,id,next)).status,200);const a=(await view(s,id)).body;assert.equal(a.scheduleReview.scheduleRevision,2);assert.equal(a.scheduleReview.previous.startAt,'2026-12-01T15:00:00.000Z');assert.equal((await reconfirm(s,id,1)).body.error.code,'SCHEDULE_STALE');assert.equal((await move(s,2,null,next)).body.error.code,'SCHEDULE_STALE');assert.equal((await call(s.helper,'post',`/assignments/${id}/decline`,{expectedScheduleRevision:1})).body.error.code,'SCHEDULE_STALE');
});
test('Decline returns pending backups to existing selection flow, requiring current Task revision, without auto replacement',async()=>{
 const s=await story(),id=await select(s);await move(s,0,id);assert.equal((await call(s.helper,'post',`/assignments/${id}/decline`,{expectedScheduleRevision:1})).status,200);const t=await taskData(s);assert.equal(t.status,'HAS_OFFERS');assert.equal(t.activeAssignmentId,undefined);assert.equal(t.requiresHelperReconfirmation,false);assert.equal((await view(s,id)).body.requiresHelperReconfirmation,false);
 assert.equal((await call(s.owner,'post',`/tasks/${s.task}/select-offer`,{offerId:s.backupOffer.id})).body.error.code,'SCHEDULE_STALE');const chosen=await call(s.owner,'post',`/tasks/${s.task}/select-offer`,{offerId:s.backupOffer.id,availabilityRevision:0,scheduleRevision:1});assert.equal(chosen.status,200);assert.notEqual(chosen.body.assignment.id,id);await s.action(chosen.body.assignment.id,'confirm',s.backup);assert.equal((await taskData(s)).status,'ARRANGED');
});
test('Internal Calendar moves once across day/month/year/DST boundaries for requester and selected Helper',async()=>{
 const s=await story(),id=await select(s);let revision=0,oldStart='2026-12-01T15:00:00Z';
 for(const times of [moved,{startAt:'2026-12-02T18:00:00Z',endAt:'2026-12-02T20:00:00Z'},{startAt:'2027-01-01T15:00:00Z',endAt:'2027-01-01T17:00:00Z'},{startAt:'2027-03-14T01:30:00-05:00',endAt:'2027-03-14T03:30:00-04:00'}]){
  assert.equal((await move(s,revision++,id,times)).status,200);for(const uid of [s.owner,s.helper]){const start=new Date(Date.parse(times.startAt)-3600000).toISOString(),end=new Date(Date.parse(times.endAt)+3600000).toISOString(),r=await call(uid,'get','/me/calendar?start='+encodeURIComponent(start)+'&end='+encodeURIComponent(end));assert.equal(r.status,200);const matches=r.body.tasks.filter((t:any)=>t.taskId===s.task);assert.equal(matches.length,1);assert.equal(matches[0].startAt,new Date(times.startAt).toISOString());if(oldStart.slice(0,10)!==times.startAt.slice(0,10)){const from=new Date(Date.parse(oldStart)-3600000).toISOString(),to=new Date(Date.parse(oldStart)+3600000).toISOString();assert.ok(!(await call(uid,'get','/me/calendar?start='+encodeURIComponent(from)+'&end='+encodeURIComponent(to))).body.tasks.some((t:any)=>t.taskId===s.task));}}oldStart=times.startAt;
 }
});
test('Competing schedule changes serialize; same-revision retries produce one revision/event/notification set',async()=>{
 for(let i=0;i<3;i++){const s=await story();const r=await Promise.all([move(s),move(s)]);assert.deepEqual(r.map(x=>x.status),[200,200]);assert.equal((await taskData(s)).scheduleRevision,1);assert.equal((await audit(s,'TASK_RESCHEDULED')).length,1);const next={startAt:'2026-12-02T18:00:00Z',endAt:'2026-12-02T20:00:00Z'},other={startAt:'2026-12-03T18:00:00Z',endAt:'2026-12-03T20:00:00Z'};const race=await Promise.all([move(s,1,null,next),move(s,1,null,other)]);assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);assert.equal((await taskData(s)).scheduleRevision,2);}
});
test('Reschedule versus selection, confirmation, reconfirmation and start never leaves stale confirmed execution',async()=>{
 for(let i=0;i<3;i++){
  const s=await story();await Promise.all([move(s),call(s.owner,'post',`/tasks/${s.task}/select-offer`,{offerId:s.offer.id,availabilityRevision:0,scheduleRevision:0})]);const t=await taskData(s);if(t.activeAssignmentId)assert.equal(t.scheduleRevision ?? 0,0);else assert.equal(t.scheduleRevision,1);
  const p=await story(),id=await select(p);await Promise.all([move(p,0,id),call(p.helper,'post',`/assignments/${id}/confirm`)]);assert.equal((await taskData(p)).status,'AWAITING_CONFIRMATION');assert.equal((await view(p,id)).body.requiresHelperReconfirmation,true);
  await call(p.helper,'patch',`/tasks/${p.task}/offers/mine/availability`,{...newWindow,expectedRevision:0});await Promise.all([reconfirm(p,id,1),move(p,1,id,{startAt:'2026-12-02T18:00:00Z',endAt:'2026-12-02T20:00:00Z'})]);const after=await taskData(p);assert.equal(after.scheduleRevision,2);assert.equal(after.status,'AWAITING_CONFIRMATION');assert.equal((await call(p.helper,'get',`/assignments/${id}/execution`)).status,403);
  const edited=await story(),eid=await select(edited);const editRace=await Promise.all([move(edited,0,eid),call(edited.helper,'patch',`/tasks/${edited.task}/offers/mine/availability`,{...newWindow,expectedRevision:0})]);assert.deepEqual(editRace.map(r=>r.status),[200,200]);const latest=(await view(edited,eid)).body;assert.equal(latest.scheduleReview.requiresHelperReconfirmation,true);assert.equal(latest.scheduleReview.availability.availabilityFit,'COVERS_TASK');
  const c=await story(),aid=await select(c);await c.action(aid,'confirm');const results=await Promise.all([move(c,0,aid),call(c.helper,'post',`/assignments/${aid}/start`)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);const final=await taskData(c);assert.ok(final.status==='IN_PROGRESS' || final.status==='AWAITING_CONFIRMATION');if(final.status==='IN_PROGRESS')assert.equal(final.scheduleRevision ?? 0,0);else assert.equal((await call(c.helper,'get',`/assignments/${aid}/execution`)).status,403);
 }
});


