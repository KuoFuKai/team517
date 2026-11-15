import test from 'node:test';
import assert from 'node:assert/strict';
import {taskStatusPresentation as present,offerPresentation,safeHelperName,timelineLabel,notificationTitle} from '../src/utils/coordination';
import {countLabel} from '../src/utils/presentation';
test('requester presentation explains current actor and existing next action across lifecycle',()=>{
 const rows=[['DRAFT','Your turn','Edit draft'],['HAS_OFFERS','Your turn','Review offers'],['AWAITING_CONFIRMATION','Waiting for Alex',undefined],['ARRANGED','No action needed',undefined],['IN_PROGRESS','No action needed',undefined],['COMPLETION_PENDING','Your turn','Confirm completion'],['COMPLETED','Task complete',undefined]];
 for(const [status,actor,action] of rows){const p=present({status:status!,helperName:'Alex'});assert.equal(p.nextActor,actor);assert.equal(p.nextActionLabel,action);assert.ok(p.summary && p.supportingDetail);}
 assert.match(present({status:'OPEN'}).title,/Waiting for helpers/);
});
test('helper presentation distinguishes selected, arranged, work and approval responsibilities',()=>{
 for(const [status,action] of [['PENDING_CONFIRMATION','Confirm task'],['CONFIRMED','Start task'],['IN_PROGRESS','Request completion']])assert.equal(present({status,helper:true}).nextActionLabel,action);
 assert.equal(present({status:'COMPLETION_PENDING',helper:true}).nextActor,'Waiting for requester');
 assert.equal(present({status:'COMPLETED',helper:true}).nextActionLabel,undefined);
});
test('availability review and schedule reconfirmation have different actors, including simultaneous guards',()=>{
 const a=present({status:'PENDING_CONFIRMATION',helperName:'Alex',availabilityChanged:true});assert.equal(a.nextActor,'Your turn');assert.equal(a.nextActionLabel,'Review availability');
 const b=present({status:'PENDING_CONFIRMATION',helperName:'Alex',scheduleChanged:true});assert.equal(b.nextActor,'Waiting for Alex');assert.match(b.title,/new time/);
 assert.equal(present({status:'PENDING_CONFIRMATION',helper:true,scheduleChanged:true}).nextActor,'Your turn');
 assert.equal(present({status:'PENDING_CONFIRMATION',helper:true,scheduleChanged:true,availabilityChanged:true}).nextActor,'Waiting for requester');
 assert.doesNotMatch(present({status:'COMPLETED',scheduleChanged:true}).title,/changed/);
});
test('pluralization is shared and never invents a missing response count',()=>{
 assert.equal(countLabel(1,'helper'),'1 helper');assert.equal(countLabel(2,'helper'),'2 helpers');assert.equal(countLabel(1,'review'),'1 review');assert.equal(countLabel(2,'point'),'2 points');
 assert.equal(present({status:'HAS_OFFERS',offerCount:1}).title,'1 helper responded');assert.equal(present({status:'HAS_OFFERS'}).title,'Helpers have responded');
});
test('own offer copy differentiates sent, selected, closed and withdrawn without claiming confirmation',()=>{
 assert.equal(offerPresentation('ACTIVE').title,'Offer sent');assert.match(offerPresentation('ACTIVE').summary,/Waiting for the requester/);assert.match(offerPresentation('SELECTED').summary,/whether/);assert.notEqual(offerPresentation('NOT_SELECTED').title,offerPresentation('WITHDRAWN').title);
});
test('safe public names are caller-provided only; no UID or email fallback is accepted as a source',()=>{
 assert.equal(safeHelperName(), 'your helper');assert.equal(safeHelperName('   '),'your helper');assert.equal(safeHelperName(' Alex '),'Alex');assert.doesNotMatch(present({status:'ARRANGED'}).summary,/UID|ALEX|RCUS/);
});
test('Timeline and Notifications use product labels without exposing metadata or enums',()=>{
 assert.equal(timelineLabel('TASK_RESCHEDULED','TASK_RESCHEDULED'),'Task time changed');assert.equal(timelineLabel('SCHEDULE_RECONFIRMED','internal'),'Helper confirmed the new time');assert.equal(timelineLabel('UNKNOWN','INTERNAL_EVENT'),'Task activity updated');assert.equal(notificationTitle('TASK_RESCHEDULED','old'),'Task time changed');
});

test('fresh authorized context supersedes stale parent Task copy without changing authority',async()=>{
 const {requesterCoordination}=await import('../src/utils/coordination');
 const current=requesterCoordination({status:'OPEN'},{status:'HAS_OFFERS',offerCount:2});
 assert.equal(present(current).title,'2 helpers responded');assert.equal(present(current).nextActionLabel,'Review offers');
 assert.equal(present(requesterCoordination({status:'OPEN'})).title,'Waiting for helpers');
});
