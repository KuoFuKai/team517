import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Timestamp} from 'firebase-admin/firestore';
import {rescheduleSchema} from '../src/validation/scheduling';
import {lifecycleNotifications} from '../src/support/notifications';
import {pushPayload} from '../src/push/provider';
import type {Task} from '../src/domain/task';
import type {Assignment} from '../src/domain/marketplace';
test('Reschedule requires bounded revision, explicit relationship snapshot and ordered supported instants',()=>{
 const valid={startAt:'2026-12-01T10:00:00-05:00',endAt:'2026-12-01T12:00:00-05:00',expectedRevision:0,expectedAssignmentId:null};assert.ok(rescheduleSchema.safeParse(valid).success);
 for(const patch of [{expectedRevision:-1},{expectedRevision:0.5},{expectedAssignmentId:undefined},{startAt:'0000-01-01T00:00:00Z'},{endAt:valid.startAt},{endAt:'invalid'},{helperId:'spoofed'}])assert.equal(rescheduleSchema.safeParse({...valid,...patch}).success,false);
});
test('Reschedule notifications deduplicate affected Helpers, omit actor and keep OS payload generic',()=>{
 const task={id:'task',createdBy:'owner'} as Task,a={id:'assignment',helperId:'selected'} as Assignment;
 const records=lifecycleNotifications('event','TASK_RESCHEDULED','owner',task,Timestamp.now(),a,undefined,['selected','backup','backup','owner']);assert.equal(records.length,2);assert.equal(records[0].resourceType,'ASSIGNMENT');assert.equal(records[1].resourceType,'TASK');assert.equal(records[1].resourceId,'task');
 const payload=pushPayload({...records[0],title:'PRIVATE clinic 10AM',body:'PRIVATE location'});assert.equal(payload?.notification.body,'You have a task update.');assert.ok(!JSON.stringify(payload).includes('PRIVATE'));
});
