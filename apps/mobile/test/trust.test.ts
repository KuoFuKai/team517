import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTrustApi} from '../src/api/trust';
import {createTransport} from '../src/api/transport';
test('Trust profile client uses authenticated HTTP with encoded optional Task context',async()=>{const calls:string[]=[];const api=createTrustApi(createTransport({baseUrl:'http://example.test/api/v1',getToken:async()=> 'token',fetcher:async(url,options)=>{assert.equal((options?.headers as Record<string,string>).Authorization,'Bearer token');assert.equal(options?.method,'GET');calls.push(String(url));return Response.json({});}}));await api.getHelperTrustProfile('a/b');await api.getHelperTrustProfile('helper','t/u');assert.deepEqual(calls,['http://example.test/api/v1/helpers/a%2Fb/profile','http://example.test/api/v1/helpers/helper/profile?taskId=t%2Fu']);});

import {selectionCopy} from '../src/utils/trust';
test('Helper selection copy explicitly requires separate helper confirmation and preserves backups',()=>{const copy=selectionCopy('Alex');assert.equal(copy.title,'Select Alex?');assert.equal(copy.confirmLabel,'Select Alex');assert.ok(copy.message.includes('not fully arranged until Alex confirms'));assert.ok(copy.message.includes('Other offers stay available'));});
