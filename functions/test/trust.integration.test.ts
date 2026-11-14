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
async function coherent(uid:string){const a=await repo.account(uid),docs=await db.collection('point_transactions').where('userId','==',uid).get();const sum={availablePoints:0,reservedPoints:0,lifetimeEarnedPoints:0,lifetimeSpentPoints:0};for(const d of docs.docs){const v=d.data();sum.availablePoints+=v.availableDelta;sum.reservedPoints+=v.reservedDelta;sum.lifetimeEarnedPoints+=v.earnedDelta;sum.lifetimeSpentPoints+=v.spentDelta;}assert.deepEqual(a,sum);return a;}

test('Trust profile zero state, self-view and strict private-field projection',async()=>{
 const s=await setup();await db.collection('users').doc(s.helper).update({publicFirstName:'Alex',email:'SECRET_EMAIL',phone:'SECRET_PHONE',fullLegalName:'SECRET_LEGAL_NAME',address:'SECRET_ADDRESS',wallet:{availablePoints:123456},verificationRecords:'SECRET_KYC',privateProfile:'SECRET_PROFILE'});
 const r=await call(s.owner,'get',`/helpers/${s.helper}/profile`);assert.equal(r.status,200);assert.equal(r.body.displayName,'Alex');assert.equal(r.body.verificationStatus,'VERIFIED');assert.equal(r.body.completedTaskCount,0);assert.equal(r.body.reviewCount,0);assert.equal(r.body.averageRating,undefined);assert.deepEqual(r.body.recentReviews,[]);assert.equal(r.body.relationship,undefined);
 const json=JSON.stringify(r.body);for(const text of ['SECRET','wallet','availablePoints','careContextId','verificationRecords','phone','email'])assert.ok(!json.includes(text),text);
 assert.equal((await call(s.helper,'get',`/helpers/${s.helper}/profile`)).status,200);
 assert.equal((await request(app).get(`/api/v1/helpers/${s.helper}/profile`)).status,401);
 assert.equal((await call(s.owner,'get','/helpers/no-such-helper/profile')).status,404);
 assert.equal((await call(s.owner,'get',`/helpers/${s.owner}/profile?careContextId=SECRET`)).status,400);
});
test('Completed count and Review aggregates are fresh, accurate, bounded and independent from cancellation/dispute',async()=>{
 const s=await setup(),ids:string[]=[];
 for(let i=0;i<3;i++){const task=await s.draft();await s.publish(task);const id=await s.select(task);await s.action(id,'confirm');await s.action(id,'start');await s.action(id,'request-completion');await s.action(id,'confirm-completion',s.owner);ids.push(id);}
 const review=await call(s.owner,'post',`/assignments/${ids[0]}/reviews`,{rating:5,comment:'Thoughtful and on time.'});assert.equal(review.status,201);
 assert.equal((await call(s.owner,'post',`/assignments/${ids[0]}/reviews`,{rating:1})).status,409);
 let p=(await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body;assert.equal(p.completedTaskCount,3);assert.equal(p.reviewCount,1);assert.equal(p.averageRating,5);
 assert.equal((await call(s.owner,'post',`/assignments/${ids[1]}/reviews`,{rating:4,comment:'Clear communication.'})).status,201);
 const cancelled=await s.draft();await s.publish(cancelled);const ca=await s.select(cancelled);await s.action(ca,'cancel',s.owner);await call(s.owner,'post',`/tasks/${cancelled}/cancel`);
 const disputed=await s.draft();await s.publish(disputed);const da=await s.select(disputed);await s.action(da,'confirm');await s.action(da,'start');await s.action(da,'request-completion');await s.action(da,'dispute',s.owner);assert.equal((await call(s.owner,'post',`/assignments/${da}/reviews`,{rating:5})).status,409);
 p=(await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body;assert.equal(p.completedTaskCount,3);assert.equal(p.reviewCount,2);assert.equal(p.averageRating,4.5);assert.equal(p.recentReviews.length,2);
 for(const r of p.recentReviews){assert.equal(r.reviewerLabel,'Requester');assert.equal(r.taskId,undefined);assert.equal(r.careContextId,undefined);assert.equal(r.reviewerId,undefined);assert.equal(r.assignmentId,undefined);}
 // Existing policy allows one review per completed Assignment/reviewer relationship.
 for(const id of ids)assert.equal((await call(s.manager,'post',`/assignments/${id}/reviews`,{rating:5,comment:'Reliable support.'})).status,201);
 assert.equal((await call(s.owner,'post',`/assignments/${ids[2]}/reviews`,{rating:5})).status,201);
 p=(await call(s.owner,'get',`/helpers/${s.helper}/profile`)).body;assert.equal(p.reviewCount,6);assert.equal(p.recentReviews.length,5);assert.equal(p.reviewsTruncated,true);assert.equal(p.reviewLimit,5);
});
test('Circle relationship requires Task-management scope and remains distinct from verification',async()=>{
 const s=await setup();const mid=membershipId(s.context,s.helper);await db.collection('care_context_members').doc(mid).set({id:mid,userId:s.helper,careContextId:s.context,role:'HELPER',status:'ACTIVE'});await db.collection('users').doc(s.helper).update({verificationStatus:'UNVERIFIED'});
 const task=await s.draft();await call(s.owner,'patch',`/tasks/${task}`,{visibility:'CARE_CIRCLE'});await s.publish(task);await call(s.helper,'post',`/tasks/${task}/offers`,{message:'I know your circle.'});assert.equal((await call(s.backup,'post',`/tasks/${task}/offers`,{})).status,403);
 const profile=await call(s.owner,'get',`/helpers/${s.helper}/profile?taskId=${task}`);assert.equal(profile.status,200);assert.equal(profile.body.relationship,'CARE_CIRCLE');assert.equal(profile.body.verificationStatus,'UNVERIFIED');assert.ok(!JSON.stringify(profile.body).includes(s.context));
 assert.equal((await call(s.backup,'get',`/helpers/${s.helper}/profile?taskId=${task}`)).status,403);
 assert.equal((await call(s.helper,'get',`/helpers/${s.helper}/profile?taskId=${task}`)).status,403);
 assert.equal((await call(s.owner,'get',`/helpers/${s.backup}/profile?taskId=${task}`)).status,404);
 const list=await call(s.owner,'get',`/tasks/${task}/offers`);assert.equal(list.body.offers[0].relationship,'CARE_CIRCLE');assert.equal(list.body.offers[0].trust.completedTaskCount,0);
 const doc=(await db.collection('offers').doc(list.body.offers[0].id).get()).data()!;assert.equal(doc.trust,undefined);assert.equal(doc.averageRating,undefined);
});
test('Profile actions reuse pre-selection Messaging and pending-confirmation selection without closing backups',async()=>{
 const s=await setup(),task=await s.draft();await s.publish(task);const one=await call(s.helper,'post',`/tasks/${task}/offers`,{message:'I can stay for the whole visit.'});await call(s.backup,'post',`/tasks/${task}/offers`,{message:'I can help with check-in.'});
 const profile=await call(s.owner,'get',`/helpers/${s.helper}/profile?taskId=${task}`);assert.equal(profile.body.relationship,'EXTERNAL');
 const messaging=await call(s.owner,'post',`/tasks/${task}/conversations`,{otherUserId:s.helper});assert.equal(messaging.status,200,JSON.stringify(messaging.body));
 const selected=await call(s.owner,'post',`/tasks/${task}/select-offer`,{offerId:one.body.id});assert.equal(selected.body.assignment.status,'PENDING_CONFIRMATION');
 const offers=(await call(s.owner,'get',`/tasks/${task}/offers`)).body.offers;assert.equal(offers.filter((o:any)=>o.status==='ACTIVE').length,1);assert.equal(offers.filter((o:any)=>o.status==='SELECTED').length,1);
 assert.equal((await call(s.owner,'post',`/tasks/${task}/select-offer`,{offerId:offers.find((o:any)=>o.status==='ACTIVE').id})).status,409);
});
