import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPointApi } from '../src/api/points';
import { createTransport } from '../src/api/transport';
test('Points client uses authenticated owner-only read, with no balance mutation', async () => {
  const calls: string[]=[];
  const api=createPointApi(createTransport({baseUrl:'http://example.test/api/v1', getToken:async()=> 'token',fetcher:async(url,options)=>{
    assert.equal((options?.headers as Record<string,string>).Authorization,'Bearer token');assert.equal(options?.method,'GET');calls.push(String(url));return Response.json({availablePoints:0,reservedPoints:0,lifetimeEarnedPoints:0,lifetimeSpentPoints:0});
  }}));
  assert.equal((await api.getPointAccount()).availablePoints,0);
  await api.getPointTransactions(); await api.getPointTransactions('opaque_cursor');
  assert.deepEqual(calls,['http://example.test/api/v1/me/points','http://example.test/api/v1/me/points/transactions','http://example.test/api/v1/me/points/transactions?cursor=opaque_cursor']);
});

import { pointActivity } from '../src/utils/points';
test('Points activity explains reserve and settlement without suggesting cash',()=>{assert.equal(pointActivity({id:'x',type:'TRANSFER_OUT',amount:250,availableDelta:0,reservedDelta:-250,createdAt:''}).amount,'−250 pts');assert.equal(pointActivity({id:'x',type:'RESERVE',amount:250,availableDelta:-250,reservedDelta:250,createdAt:''}).detail,'Moved to reserved');});

import { friendlyError } from '../src/utils/presentation';
test('Insufficient Points shows safe amounts and never leaks arbitrary server text',()=>{assert.equal(friendlyError({code:'INSUFFICIENT_POINTS',message:'You need 250 points to publish this task. You currently have 120 available.'}),'You need 250 points to publish this task. You currently have 120 available.');assert.ok(!friendlyError({code:'INSUFFICIENT_POINTS',message:'private SQL trace'}).includes('SQL'));});
