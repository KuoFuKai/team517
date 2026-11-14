import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectionCopy} from '../src/utils/trust';
import {createMarketplaceApi} from '../src/api/marketplace';
import {createTransport} from '../src/api/transport';
test('Selection warns for partial/conflict without removing confirmation or backup policy',()=>{for(const fit of ['PARTIAL_OVERLAP','CONFLICT'] as const){const c=selectionCopy('Alex',fit);assert.ok(c.message.includes('does not fully cover'));assert.ok(c.message.includes('if you have agreed on timing'));assert.ok(c.message.includes('until Alex confirms'));}for(const fit of ['COVERS_TASK','NOT_PROVIDED'] as const)assert.ok(!selectionCopy('Alex',fit).message.includes('does not fully cover'));});
test('Offer client forwards optional absolute availability through existing authenticated request',async()=>{const body={message:'I can arrive early',availableFrom:'2026-11-21T14:30:00Z',availableUntil:'2026-11-21T17:30:00Z'};const api=createMarketplaceApi(createTransport({baseUrl:'https://example.test/api/v1',getToken:async()=> 'token',fetcher:async(url,options)=>{assert.equal(String(url),'https://example.test/api/v1/tasks/task/offers');assert.equal((options?.headers as any).Authorization,'Bearer token');assert.deepEqual(JSON.parse(String(options?.body)),body);return Response.json({});}}));await api.offerHelp('task',body);});
