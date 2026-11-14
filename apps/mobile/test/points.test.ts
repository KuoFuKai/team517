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
  assert.deepEqual(calls,['http://example.test/api/v1/me/points']);
});
