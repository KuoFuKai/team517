import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSchedulingApi} from '../src/api/scheduling';
import {createTransport} from '../src/api/transport';
import {createMarketplaceApi} from '../src/api/marketplace';
import {createAssignmentApi} from '../src/api/assignments';
import {resolvePushNotification} from '../src/push/resolve';
import {taskTimeInput,taskTimeValue,parseTaskTime} from '../src/utils/task-time';
test('Scheduling client carries exact schedule and relationship revisions through authenticated HTTP',async()=>{
 const calls:any[]=[];const req=createTransport({baseUrl:'https://example.test/api/v1',getToken:async()=> 'token',fetcher:async(url,o)=>{assert.equal((o?.headers as any).Authorization,'Bearer token');calls.push([String(url),JSON.parse(String(o?.body))]);return Response.json({});}});const api=createSchedulingApi(req),body={expectedRevision:2,expectedAssignmentId:null,startAt:'2026-12-01T15:00:00Z',endAt:'2026-12-01T17:00:00Z'};
 await api.previewReschedule('a/b',body);await api.rescheduleTask('a/b',body);await api.reconfirmSchedule('a/b',3);assert.deepEqual(calls.map(c=>c[0]),['https://example.test/api/v1/tasks/a%2Fb/reschedule/preview','https://example.test/api/v1/tasks/a%2Fb/reschedule','https://example.test/api/v1/assignments/a%2Fb/reconfirm-schedule']);assert.deepEqual(calls.map(c=>c[1]),[body,body,{expectedRevision:3}]);
});
test('Selection and decline retain the viewed schedule revision rather than silently rebinding it',async()=>{
 const calls:any[]=[];const req=createTransport({baseUrl:'https://example.test',getToken:async()=> 'token',fetcher:async(_u,o)=>{calls.push(JSON.parse(String(o?.body)));return Response.json({});}});await createMarketplaceApi(req).selectOffer('task','offer',4,7);await createAssignmentApi(req).declineAssignment('assignment',7);assert.deepEqual(calls,[{offerId:'offer',availabilityRevision:4,scheduleRevision:7},{expectedScheduleRevision:7}]);
});
test('Active external Helper schedule push resolves through own safe Offer, without private Task detail',async()=>{
 let own=0,privateRead=0;const api:any={getNotification:async()=>({type:'TASK_RESCHEDULED',resourceType:'TASK',resourceId:'task'}),getMyOffer:async()=>{own++;return {offer:{id:'own'}};},getTask:async()=>{privateRead++;throw Error('Forbidden');}};assert.deepEqual(await resolvePushNotification('n',api),{kind:'OFFER',id:'task'});assert.equal(own,1);assert.equal(privateRead,0);api.getMyOffer=async()=>({offer:null});await assert.rejects(resolvePushNotification('n',api));
});
test('Schedule editor preserves untouched precision/repeated-hour instants and rejects DST gaps',()=>{
 const old=process.env.TZ;process.env.TZ='America/New_York';try{const repeated='2027-11-07T06:30:15.123Z';assert.equal(taskTimeValue(taskTimeInput(repeated),repeated),repeated);assert.equal(parseTaskTime('2027-03-14 02:30'),null);assert.equal(parseTaskTime('2027-03-14 03:30'),'2027-03-14T07:30:00.000Z');assert.equal(parseTaskTime('2026-12-31 23:30'),'2027-01-01T04:30:00.000Z');}finally{if(old===undefined)delete process.env.TZ;else process.env.TZ=old;}
});
