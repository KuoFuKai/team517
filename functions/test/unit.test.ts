import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/api/app';
import type { Store } from '../src/repositories/store';
const app=createApp({} as Store);
test('health is public',async()=>{const res=await request(app).get('/api/v1/health');assert.equal(res.status,200);assert.equal(res.body.status,'ok');});
test('protected request rejects missing token',async()=>{const res=await request(app).get('/api/v1/me');assert.equal(res.status,401);});
test('protected request rejects invalid token',async()=>{const res=await request(app).get('/api/v1/me').set('Authorization','Bearer invalid');assert.equal(res.status,401);});

test('exhausted Firestore transaction contention remains a private actionable conflict, not an unknown500',async()=>{
 const {transactionConflict}=await import('../src/shared/errors');
 for(const details of ['Transaction lock timeout.','Too much contention on transaction PRIVATE_LOCATION']){
  const result=transactionConflict({code:10,details});assert.equal(result?.status,409);assert.equal(result?.code,'CONFLICT');assert.doesNotMatch(result!.message,/PRIVATE_LOCATION|lock timeout/i);
 }
 assert.equal(transactionConflict({code:10}),undefined);assert.equal(transactionConflict({code:4,details:'deadline exceeded'}),undefined);assert.equal(transactionConflict(new Error('arbitrary')),undefined);
});
