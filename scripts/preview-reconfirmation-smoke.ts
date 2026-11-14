import {createPushApi} from '../apps/mobile/src/api/push';
import type {OfferDto,TaskDetailDto} from '@team517/contracts';
// Synthetic development-only history through the normal business APIs. No aggregate patches.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {assertPreviewTarget,PREVIEW_PROJECT,PREVIEW_API,PREVIEW_CONTEXT_ID,PREVIEW_LOCATION_ID} from './preview-policy';
import {createTransport} from '../apps/mobile/src/api/transport';
import {createTaskApi} from '../apps/mobile/src/api/tasks';
import {createMarketplaceApi} from '../apps/mobile/src/api/marketplace';
import {createAssignmentApi} from '../apps/mobile/src/api/assignments';
import {createSupportApi} from '../apps/mobile/src/api/support';
import {createTrustApi} from '../apps/mobile/src/api/trust';
import {createPointApi} from '../apps/mobile/src/api/points';
async function main(){
 assertPreviewTarget(process.argv[process.argv.indexOf('--project')+1]);
 const credentials=JSON.parse(readFileSync('.tools/preview-credentials.json','utf8')),google=JSON.parse(readFileSync('apps/mobile/google-services.json','utf8'));assert.equal(credentials.project,PREVIEW_PROJECT);assert.equal(google.project_info.project_id,PREVIEW_PROJECT);
 const key=google.client.find((c:any)=>c.client_info.android_client_info.package_name==='edu.cornelltech.team517').api_key[0].current_key;
 const client=async(name:string)=>{const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials.accounts[name],returnSecureToken:true})});assert.equal(r.status,200);const {idToken}=await r.json() as {idToken:string};return createTransport({baseUrl:PREVIEW_API,getToken:async()=>idToken});};
 const manager=await client('manager'),alex=await client('alex'),marcus=await client('marcus'),circle=await client('circle'),actors:Record<string,typeof manager>={alex,marcus,circle};
 const tasks=createTaskApi(manager),market=createMarketplaceApi(manager),ownerActions=createAssignmentApi(manager),reviews=createSupportApi(manager),trust=createTrustApi(manager);
 const wallets=[manager,alex,marcus,circle].map(createPointApi),before=await Promise.all(wallets.map(w=>w.getPointAccount()));
 const file='.tools/reconfirmation-smoke.json',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:PREVIEW_PROJECT};assert.equal(state.project,PREVIEW_PROJECT);
 const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
 const summary=async()=>Promise.all(['alex','marcus','circle'].map(name=>trust.getHelperTrustProfile('team517_preview_'+name)));
 const beforeTrust=await summary();
 const alexMarket=createMarketplaceApi(alex),marcusMarket=createMarketplaceApi(marcus),alexAssignment=createAssignmentApi(alex),marcusAssignment=createAssignmentApi(marcus);
 const full={availableFrom:'2026-12-04T14:30:00Z',availableUntil:'2026-12-04T17:30:00Z'},partial={availableFrom:'2026-12-04T15:30:00Z',availableUntil:'2026-12-04T17:30:00Z'},wider={availableFrom:'2026-12-04T14:00:00Z',availableUntil:'2026-12-04T18:00:00Z'},conflict={availableFrom:'2026-12-04T18:00:00Z',availableUntil:'2026-12-04T19:00:00Z'};
 const expect=async(code:string,work:()=>Promise<unknown>)=>{try{await work();assert.fail('Expected '+code);}catch(e){assert.equal((e as any).code,code);}};
 if(!state.done){assert.ok(!state.started,'Partial smoke receipt: inspect current state, never rewind histories.');state.started=true;save();
 const t=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,{title:'Reconfirmation cloud acceptance',helpType:'Everyday support',publicInstructions:'A synthetic API acceptance appointment.',locationId:PREVIEW_LOCATION_ID,startAt:'2026-12-04T15:00:00Z',endAt:'2026-12-04T17:00:00Z',urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:'VOLUNTEER'});state.taskId=t.id;save();await tasks.publishTask(t.id);
 const o=await alexMarket.offerHelp(t.id,{message:'I can help with the visit.',...full}),backup=await marcusMarket.offerHelp(t.id,full);
 await alexMarket.updateOfferAvailability(t.id,{expectedRevision:0,...partial});await expect('AVAILABILITY_STALE',()=>market.selectOffer(t.id,o.id,0));
 const selected=await market.selectOffer(t.id,o.id,1);state.firstAssignment=selected.assignment.id;save();
 await alexMarket.updateOfferAvailability(t.id,{expectedRevision:1,...wider});assert.equal((await market.getAssignment(selected.assignment.id)).availabilityReview?.requiresRequesterReconfirmation,false);
 await alexMarket.updateOfferAvailability(t.id,{expectedRevision:2,...partial});assert.equal((await market.getAssignment(selected.assignment.id)).availabilityReview?.requiresRequesterReconfirmation,true);
 await expect('REQUESTER_RECONFIRMATION_REQUIRED',()=>alexAssignment.confirmAssignment(selected.assignment.id));await expect('AVAILABILITY_STALE',()=>ownerActions.reconfirmAvailability(selected.assignment.id,2));
 const count=(await reviews.getTaskTimeline(t.id)).events.length;await alexMarket.updateOfferAvailability(t.id,{expectedRevision:2,...partial});assert.equal((await reviews.getTaskTimeline(t.id)).events.length,count);
 await ownerActions.reconfirmAvailability(selected.assignment.id,3);const kept=(await reviews.getTaskTimeline(t.id)).events.length;await ownerActions.reconfirmAvailability(selected.assignment.id,3);assert.equal((await reviews.getTaskTimeline(t.id)).events.length,kept);assert.equal((await market.getAssignment(selected.assignment.id)).status,'PENDING_CONFIRMATION');
 await alexMarket.updateOfferAvailability(t.id,{expectedRevision:3,...conflict});await expect('AVAILABILITY_STALE',()=>ownerActions.cancelAssignment(selected.assignment.id,{expectedAvailabilityRevision:3}));await ownerActions.cancelAssignment(selected.assignment.id,{expectedAvailabilityRevision:4});
 const next=await market.selectOffer(t.id,backup.id,backup.availabilityRevision ?? 0);state.assignmentId=next.assignment.id;save();await marcusAssignment.confirmAssignment(next.assignment.id);await expect('ASSIGNMENT_NOT_REVIEWABLE',()=>marcusMarket.updateOfferAvailability(t.id,{expectedRevision:0,...partial}));state.done=true;save();
 }
 const task=await tasks.getTask(state.taskId);assert.equal(task.status,'ARRANGED');assert.equal(task.startAt,'2026-12-04T15:00:00.000Z');assert.equal(task.endAt,'2026-12-04T17:00:00.000Z');assert.equal((await market.getAssignment(state.assignmentId)).helperId,'team517_preview_marcus');
 if(!state.notificationId){const n=(await reviews.getNotifications()).notifications.find(n=>n.type==='OFFER_AVAILABILITY_UPDATED' && n.resourceId===state.firstAssignment);assert.ok(n);state.notificationId=n.id;save();}const notification=await createPushApi(manager).getNotification(state.notificationId);assert.equal(notification.type,'OFFER_AVAILABILITY_UPDATED');assert.equal(notification.resourceId,state.firstAssignment);
 const profile=JSON.stringify(await trust.getHelperTrustProfile('team517_preview_alex'));assert.ok(!profile.includes('availabilityReview'));assert.ok(!profile.includes('taskAvailability'));assert.ok(!JSON.stringify(await alexMarket.discoverTasks()).includes('availabilityRevision'));
 assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),before,'Reconfirmation never changes Points.');assert.deepEqual(await summary(),beforeTrust,'Reconfirmation never changes unscoped Trust.');console.log('PASS real Auth cloud: active/selected edit, revision conflicts, covering policy, review/confirm gate, notification, idempotency, guarded replacement, confirmed boundary, unchanged Task time/Points/Trust/privacy. No prior story reset.');
}
main().catch(e=>{console.error('Reconfirmation smoke stopped:',(e as Error).message);process.exitCode=1;});
