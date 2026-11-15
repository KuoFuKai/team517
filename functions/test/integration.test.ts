import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import request from 'supertest';
import { createApp } from '../src/api/app';
import { Store, membershipId } from '../src/repositories/store';
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Run through npm run test:integration at root; emulators required.');
initializeApp({projectId:'demo-team517'});
import {getAuth} from 'firebase-admin/auth';
import {finishAccountDeletion} from '../src/account/deletion';
import {DeviceTokenRepository} from '../src/repositories/device-tokens';
const app=createApp(new Store());
test('real Auth emulator supports email verification and password recovery without changing business UID or helper eligibility',async()=>{
 const a=await token(),email=(await getAuth().getUser(a.localId)).email!,base='http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST;
 const post=(path:string,body:unknown)=>fetch(base+'/identitytoolkit.googleapis.com/v1/accounts:'+path+'?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await post('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:a.idToken})).status,200);
 const codes=async()=>{const r=await fetch(base+'/emulator/v1/projects/demo-team517/oobCodes');return (await r.json() as {oobCodes:{email:string;requestType:string;oobCode:string}[]}).oobCodes;};
 const verify=(await codes()).find(c=>c.email===email&&c.requestType==='VERIFY_EMAIL')!;assert.ok(verify);assert.equal((await post('update',{oobCode:verify.oobCode})).status,200);assert.equal((await getAuth().getUser(a.localId)).emailVerified,true);
 assert.equal((await post('sendOobCode',{requestType:'PASSWORD_RESET',email})).status,200);const reset=(await codes()).find(c=>c.email===email&&c.requestType==='PASSWORD_RESET')!;assert.ok(reset);assert.equal((await post('resetPassword',{oobCode:reset.oobCode,newPassword:'testing456'})).status,200);
 assert.equal((await post('signInWithPassword',{email,password:'testing123',returnSecureToken:true})).status,400);const login=await post('signInWithPassword',{email,password:'testing456',returnSecureToken:true});assert.equal(login.status,200);const current=await login.json() as {localId:string;idToken:string};assert.equal(current.localId,a.localId);
 const profile=await request(app).post('/api/v1/me/onboarding').set('Authorization','Bearer '+current.idToken).send({publicFirstName:'Jordan',usage:'HELPER'});assert.equal(profile.status,200);assert.equal(profile.body.verificationStatus,'UNVERIFIED');
});
test('iOS FCM registration keeps Firebase UID ownership and private-token DTO boundary',async()=>{
 const a=await token(),h='Bearer '+a.idToken;await request(app).post('/api/v1/me/onboarding').set('Authorization',h).send({publicFirstName:'Riley',usage:'HELPER'});
 const result=await request(app).post('/api/v1/me/device-tokens').set('Authorization',h).send({token:'ios_fcm_emulator_only_'+crypto.randomUUID(),platform:'ios'});assert.equal(result.status,200);assert.equal(result.body.platform,'ios');assert.equal(result.body.token,undefined);assert.equal(result.body.userId,undefined);
 const denied=await request(app).post('/api/v1/me/device-tokens').set('Authorization',h).send({token:'ios_fcm_emulator_only_'+crypto.randomUUID(),platform:'ios',userId:'other'});assert.equal(denied.status,400);
});
test('new onboarding is UID-based, safe-role only, no verification, membership or Points grant',async()=>{
 const a=await token(),header='Bearer '+a.idToken,db=getFirestore();
 assert.equal((await request(app).post('/api/v1/me/onboarding').set('Authorization',header).send({publicFirstName:'Alex',usage:'BOTH',verificationStatus:'VERIFIED'})).status,400);
 const result=await request(app).post('/api/v1/me/onboarding').set('Authorization',header).send({publicFirstName:'Alex',usage:'BOTH'});assert.equal(result.status,200);assert.equal(result.body.id,a.localId);assert.deepEqual(result.body.roles,['CARE_MANAGER','HELPER']);assert.equal(result.body.verificationStatus,'UNVERIFIED');assert.equal(result.body.onboardingStatus,'COMPLETE');
 assert.equal((await db.collection('care_context_members').where('userId','==',a.localId).get()).size,0);assert.equal((await db.collection('point_accounts').doc(a.localId).get()).exists,false);
 const add=await request(app).post('/api/v1/me/roles').set('Authorization',header).send({role:'CARE_RECEIVER'});assert.equal(add.status,200);assert.equal(add.body.id,a.localId);assert.equal(add.body.roles.length,3);
 assert.equal((await request(app).post('/api/v1/me/roles').set('Authorization',header).send({role:'ADMIN'})).status,400);
});
test('explicit Firebase provider linking preserves app UID and ordinary backend ID-token authentication',async()=>{
 const a=await token(),header='Bearer '+a.idToken;await request(app).post('/api/v1/me/onboarding').set('Authorization',header).send({publicFirstName:'Jamie',usage:'HELPER'});
 const claims={sub:'google-'+crypto.randomUUID(),email:'linked-'+crypto.randomUUID()+'@example.test',email_verified:true,iss:'https://accounts.google.com',aud:'emulator-test'};const credential=Buffer.from(JSON.stringify({alg:'none'})).toString('base64url')+'.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.';
 assert.equal((await request(app).get('/api/v1/me').set('Authorization','Bearer '+credential)).status,401,'Provider token alone is never backend authentication');
 const linked=await fetch('http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST+'/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:a.idToken,requestUri:'http://localhost',postBody:new URLSearchParams({providerId:'google.com',id_token:credential}).toString(),returnSecureToken:true})});assert.equal(linked.status,200);const result=await linked.json() as {localId:string;idToken:string};assert.equal(result.localId,a.localId);
 const me=await request(app).get('/api/v1/me').set('Authorization','Bearer '+result.idToken);assert.equal(me.status,200);assert.equal(me.body.id,a.localId);assert.equal(me.body.publicFirstName,'Jamie');assert.equal((await getAuth().getUser(a.localId)).providerData.some(p=>p.providerId==='google.com'),true);
});
test('account deletion blocks active commitments, then removes Auth/name while retaining immutable history',async()=>{
 const a=await token(),h='Bearer '+a.idToken,db=getFirestore();await request(app).post('/api/v1/me/onboarding').set('Authorization',h).send({publicFirstName:'Taylor',usage:'BOTH'});
 const task=db.collection('tasks').doc();await task.set({id:task.id,createdBy:a.localId,status:'OPEN'});
 assert.equal((await request(app).post('/api/v1/me/delete-account').set('Authorization',h).send({confirmation:'DELETE'})).status,409);assert.equal((await getAuth().getUser(a.localId)).disabled,false);
 await task.update({status:'COMPLETED'});await db.collection('point_accounts').doc(a.localId).set({availablePoints:42,reservedPoints:0});await db.collection('point_transactions').doc('deletion-'+a.localId).set({userId:a.localId,amount:42,type:'TRANSFER_IN'});
 const deleted=await request(app).post('/api/v1/me/delete-account').set('Authorization',h).send({confirmation:'DELETE'});assert.equal(deleted.status,200);assert.equal(deleted.body.status,'DELETED');await assert.rejects(getAuth().getUser(a.localId));
 const tombstone=(await db.collection('users').doc(a.localId).get()).data()!;assert.equal(tombstone.accountStatus,'DELETED');assert.equal(tombstone.publicFirstName,undefined);assert.deepEqual(tombstone.roles,[]);assert.equal((await task.get()).data()!.status,'COMPLETED');assert.equal((await db.collection('point_accounts').doc(a.localId).get()).data()!.availablePoints,42);assert.equal((await request(app).get('/api/v1/me').set('Authorization',h)).status,401);
 await assert.rejects(new Store().initialize(a.localId,'HELPER'));await finishAccountDeletion(a.localId);
});
test('durable deletion worker retries idempotently and clears more than one token page',async()=>{
 const a=await token(),db=getFirestore();await db.collection('users').doc(a.localId).set({id:a.localId,roles:[],accountStatus:'DELETING'});await assert.rejects(new DeviceTokenRepository().register(a.localId,{platform:'android',token:'late_registration_for_deleted_account'}));const batch=db.batch();for(let i=0;i<103;i++)batch.set(db.collection('device_tokens').doc(a.localId+'_'+i),{userId:a.localId,token:'synthetic-'+i,enabled:true});await batch.commit();await finishAccountDeletion(a.localId);await finishAccountDeletion(a.localId);
 assert.equal((await db.collection('device_tokens').where('userId','==',a.localId).where('enabled','==',true).get()).size,0);assert.equal((await db.collection('users').doc(a.localId).get()).data()!.accountStatus,'DELETED');
});
async function token() {const res=await fetch('http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:crypto.randomUUID()+'@example.test',password:'testing123',returnSecureToken:true})});assert.equal(res.status,200);return await res.json() as {idToken:string;localId:string};}
test('identity and care context slice with real Auth and Firestore emulators',async()=>{
  const a=await token(), b=await token(); const header='Bearer '+a.idToken;
  assert.equal((await request(app).get('/api/v1/health')).status,200);
  assert.equal((await request(app).get('/api/v1/me')).status,401);
  const init=await request(app).post('/api/v1/users/initialize').set('Authorization',header).send({primaryOnboardingRole:'CARE_MANAGER'});
  assert.equal(init.status,200); assert.equal(init.body.id,a.localId);
  const again=await request(app).post('/api/v1/users/initialize').set('Authorization',header).send({primaryOnboardingRole:'HELPER'});
  assert.deepEqual(again.body,init.body);
  assert.equal((await request(app).get('/api/v1/me').set('Authorization',header)).status,200);
  assert.equal((await request(app).post('/api/v1/care-contexts').set('Authorization',header).send({name:''})).status,400);
  const created=await request(app).post('/api/v1/care-contexts').set('Authorization',header).send({name:"Mom's care"});
  assert.equal(created.status,201);
  const member=await getFirestore().collection('care_context_members').doc(membershipId(created.body.id,a.localId)).get();
  assert.equal(member.data()?.role,'CARE_MANAGER'); assert.equal(member.data()?.status,'ACTIVE');
  assert.equal((await request(app).get('/api/v1/care-contexts/'+created.body.id).set('Authorization',header)).status,200);
  assert.equal((await request(app).get('/api/v1/care-contexts').set('Authorization',header)).body.careContexts.length,1);
  await request(app).post('/api/v1/users/initialize').set('Authorization','Bearer '+b.idToken).send({primaryOnboardingRole:'HELPER'});
  assert.equal((await request(app).get('/api/v1/care-contexts/'+created.body.id).set('Authorization','Bearer '+b.idToken)).status,403);
  assert.equal((await request(app).get('/api/v1/care-contexts').set('Authorization','Bearer '+b.idToken)).body.careContexts.length,0);
  assert.equal((await request(app).post('/api/v1/care-contexts').set('Authorization','Bearer '+b.idToken).send({name:'Unauthorized'})).status,403);
});

test('Points reads are authenticated owner-only projections, including a valid zero account', async () => {
  const a = await token(), b = await token();
  assert.equal((await request(app).get('/api/v1/me/points')).status, 401);
  const own = await request(app).get('/api/v1/me/points').set('Authorization', 'Bearer '+a.idToken);
  assert.deepEqual(own.body, {availablePoints:0,reservedPoints:0,lifetimeEarnedPoints:0,lifetimeSpentPoints:0});
  await getFirestore().collection('point_accounts').doc(a.localId).set({...own.body,availablePoints:1500,privateAudit:'not public'});
  assert.equal((await request(app).get('/api/v1/me/points').set('Authorization','Bearer '+a.idToken)).body.availablePoints,1500);
  assert.deepEqual((await request(app).get('/api/v1/me/points?userId='+a.localId).set('Authorization','Bearer '+b.idToken)).body,own.body);
  assert.equal((await request(app).get('/api/v1/me/points').set('Authorization','Bearer '+a.idToken)).body.privateAudit,undefined);
  assert.equal((await request(app).post('/api/v1/me/points/add').set('Authorization','Bearer '+a.idToken).send({amount:500})).status,404);
});

import { PointRepository } from '../src/repositories/points';
test('Fixture grants are immutable, concurrent retry-safe and history is bounded/private',async()=>{
 const a=await token(),b=await token(),repo=new PointRepository();
 await Promise.all([repo.grant(a.localId,1500,'test-grant-v1'),repo.grant(a.localId,1500,'test-grant-v1')]);
 assert.equal((await repo.account(a.localId)).availablePoints,1500);
 await assert.rejects(()=>repo.grant(a.localId,1600,'test-grant-v1'));
 for(let i=0;i<22;i++)await repo.grant(a.localId,1,'test-extra-'+i);
 const page=await repo.history(a.localId);assert.equal(page.transactions.length,20);assert.ok(page.nextCursor);
 const next=await repo.history(a.localId,page.nextCursor);assert.equal(next.transactions.length,3);
 assert.equal(new Set([...page.transactions,...next.transactions].map(t=>t.id)).size,23);
 assert.equal((await repo.history(b.localId)).transactions.length,0);
 await assert.rejects(()=>repo.history(b.localId,page.nextCursor));
 assert.equal((page.transactions[0] as any).sourceId,undefined);assert.equal((page.transactions[0] as any).userId,undefined);
});
