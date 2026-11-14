import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import request from 'supertest';
import { createApp } from '../src/api/app';
import { Store, membershipId } from '../src/repositories/store';
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Run through npm run test:integration at root; emulators required.');
initializeApp({projectId:'demo-team517'});
const app=createApp(new Store());
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
