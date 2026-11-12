import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/api/app';
import type { Store } from '../src/repositories/store';
const app=createApp({} as Store);
test('health is public',async()=>{const res=await request(app).get('/api/v1/health');assert.equal(res.status,200);assert.equal(res.body.status,'ok');});
test('protected request rejects missing token',async()=>{const res=await request(app).get('/api/v1/me');assert.equal(res.status,401);});
test('protected request rejects invalid token',async()=>{const res=await request(app).get('/api/v1/me').set('Authorization','Bearer invalid');assert.equal(res.status,401);});
