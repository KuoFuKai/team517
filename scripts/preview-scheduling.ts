import {createSchedulingApi} from '../apps/mobile/src/api/scheduling';
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
 const mode=process.argv[process.argv.indexOf('--mode')+1];assert.ok(['prepare','smoke'].includes(mode),'Explicit --mode prepare|smoke required.');
 const schedule=createSchedulingApi(manager),alexSchedule=createSchedulingApi(alex),alexMarket=createMarketplaceApi(alex),marcusMarket=createMarketplaceApi(marcus);
 const beforeTrust=await Promise.all(['alex','marcus','circle'].map(name=>trust.getHelperTrustProfile('team517_preview_'+name)));
 const file='.tools/scheduling-'+mode+'.json',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:PREVIEW_PROJECT,tasks:{},prepared:{}};assert.equal(state.project,PREVIEW_PROJECT);const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
 const create=async(key:string,title:string,day:string,points=false)=>{
  if(state.tasks[key]){const t=await tasks.getTask(state.tasks[key]);assert.equal(t.title,title);assert.equal(t.createdBy,'team517_preview_manager');assert.equal(t.careContextId,PREVIEW_CONTEXT_ID);return t;}
  const list=(await tasks.listTasks(PREVIEW_CONTEXT_ID)).tasks;assert.ok(list.length<190);assert.ok(!list.some(t=>t.title===title),'Missing matching receipt; inspect before creating.');
  const t=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,{title,helpType:'Clinic companion',publicInstructions:'Meet in the lobby, help with check-in and stay for the visit.',privateInstructions:'Please message if the appointment runs late.',locationId:PREVIEW_LOCATION_ID,startAt:day+'T15:00:00Z',endAt:day+'T17:00:00Z',urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:points?'POINTS':'VOLUNTEER',...(points?{pointReward:20}:{})});state.tasks[key]=t.id;save();return t;
 };
 const offers=async(id:string,day:string)=>{
  for(const name of ['alex','marcus']){const api=name==='alex'?alexMarket:marcusMarket;const old=(await api.getMyOffer(id)).offer;if(!old)await api.offerHelp(id,{message:name==='alex'?'I can cover the morning visit.':'I am free in the afternoon, from 12:30 until 4.',availableFrom:day+(name==='alex'?'T14:30:00Z':'T17:30:00Z'),availableUntil:day+(name==='alex'?'T17:30:00Z':'T21:00:00Z')});}
 };
 const choose=async(id:string)=>{const list=await market.listOffers(id);if(list.task.activeAssignmentId)return market.getAssignment(list.task.activeAssignmentId);const o=list.offers.find(o=>o.helperId==='team517_preview_alex' && o.status==='ACTIVE');assert.ok(o);return (await market.selectOffer(id,o.id,o.availabilityRevision ?? 0,list.task.scheduleRevision ?? 0)).assignment;};
 const expect=async(code:string,work:()=>Promise<unknown>)=>{try{await work();assert.fail('Expected '+code);}catch(e){assert.equal((e as {code:string}).code,code);}};
 if(mode==='prepare'){
  for(const [key,title,day] of [['active','Morning clinic visit','2026-12-05'],['pending','Appointment plans','2026-12-06'],['confirmed','Company for a clinic visit','2026-12-07'],['replacement','Clinic visit backup plan','2026-12-08'],['phone','Clinic visit with family','2026-12-09']]){
   let t=await create(key,title,day);if(state.prepared[key])continue;assert.equal(t.scheduleRevision ?? 0,0,'Do not reset rescheduled histories.');if(t.status==='DRAFT')t=await tasks.publishTask(t.id);await offers(t.id,day);
   if(key!=='active'){const a=await choose(t.id);if(['confirmed','phone'].includes(key) && a.status==='PENDING_CONFIRMATION')await createAssignmentApi(alex).confirmAssignment(a.id);}
   state.prepared[key]=true;save();
  }
  assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),before);assert.deepEqual(await Promise.all(['alex','marcus','circle'].map(n=>trust.getHelperTrustProfile('team517_preview_'+n))),beforeTrust);
  console.log('PASS: independent active/pending/confirmed/replacement/phone stories prepared. Existing histories and Points/Trust preserved.');return;
 }
 if(!state.done){
  assert.ok(!state.started,'Partial smoke receipt: inspect, never rewind.');assert.ok(before[0].availablePoints>=20,'Synthetic owner needs existing Points for the guarded 20-point reservation story.');state.started=true;save();
  const day='2026-12-10',t=await create('smoke','Schedule cloud acceptance',day,true);await tasks.publishTask(t.id);await offers(t.id,day);
  const reserved=await Promise.all(wallets.map(w=>w.getPointAccount())),transactions=await createPointApi(manager).getPointTransactions();
  const window={startAt:day+'T18:00:00Z',endAt:day+'T20:00:00Z',expectedRevision:0,expectedAssignmentId:null};
  const p=await schedule.previewReschedule(t.id,window);assert.equal(p.affectedHelpers,2);assert.equal((await tasks.getTask(t.id)).scheduleRevision ?? 0,0);
  await schedule.rescheduleTask(t.id,window);const eventCount=(await reviews.getTaskTimeline(t.id)).events.length;await schedule.rescheduleTask(t.id,window);assert.equal((await reviews.getTaskTimeline(t.id)).events.length,eventCount);
  const list=await market.listOffers(t.id),o=list.offers.find(o=>o.helperId==='team517_preview_alex')!,backup=list.offers.find(o=>o.helperId==='team517_preview_marcus')!;assert.equal(o.availabilityFit,'CONFLICT');assert.equal(backup.availabilityFit,'COVERS_TASK');await expect('SCHEDULE_STALE',()=>market.selectOffer(t.id,o.id,0,0));
  const selected=await market.selectOffer(t.id,o.id,0,1);state.firstAssignment=selected.assignment.id;save();await createAssignmentApi(alex).confirmAssignment(selected.assignment.id);
  const next={startAt:'2026-12-11T18:00:00Z',endAt:'2026-12-11T20:00:00Z',expectedRevision:1,expectedAssignmentId:selected.assignment.id};await schedule.rescheduleTask(t.id,next);
  const changed=await market.getAssignment(selected.assignment.id);assert.equal(changed.status,'PENDING_CONFIRMATION');assert.equal(changed.scheduleReview?.requiresHelperReconfirmation,true);await expect('SCHEDULE_STALE',()=>alexSchedule.reconfirmSchedule(selected.assignment.id,1));await expect('AVAILABILITY_UPDATE_REQUIRED',()=>alexSchedule.reconfirmSchedule(selected.assignment.id,2));await expect('LOCATION_NOT_VISIBLE',()=>createAssignmentApi(alex).getExecutionDetails(selected.assignment.id));
  const calendar=await reviews.getCalendar({start:'2026-12-10T00:00:00Z',end:'2026-12-12T00:00:00Z'});const entry=calendar.tasks.filter(x=>x.taskId===t.id);assert.equal(entry.length,1);assert.equal(entry[0].startAt,'2026-12-11T18:00:00.000Z');
  await alexMarket.updateOfferAvailability(t.id,{expectedRevision:0,availableFrom:'2026-12-11T17:30:00Z',availableUntil:'2026-12-11T21:00:00Z'});await alexSchedule.reconfirmSchedule(selected.assignment.id,2);await alexSchedule.reconfirmSchedule(selected.assignment.id,2);assert.equal((await market.getAssignment(selected.assignment.id)).status,'CONFIRMED');
  await schedule.rescheduleTask(t.id,{...next,expectedRevision:2,startAt:'2026-12-12T18:00:00Z',endAt:'2026-12-12T20:00:00Z'});await createAssignmentApi(alex).declineAssignment(selected.assignment.id,3);
  // Previous confirmation legitimately closed backups. Re-offer explicitly; never auto-reactivate.
  const reoffer=await marcusMarket.offerHelp(t.id,{availableFrom:'2026-12-12T17:30:00Z',availableUntil:'2026-12-12T21:00:00Z'});const replacement=await market.selectOffer(t.id,reoffer.id,reoffer.availabilityRevision ?? 0,3);await createAssignmentApi(marcus).confirmAssignment(replacement.assignment.id);state.assignmentId=replacement.assignment.id;
  assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),reserved,'Task reschedules never touch reservation.');assert.deepEqual(await createPointApi(manager).getPointTransactions(),transactions);assert.deepEqual(await Promise.all(['alex','marcus','circle'].map(n=>trust.getHelperTrustProfile('team517_preview_'+n))),beforeTrust);
  const notifications=(await createSupportApi(alex).getNotifications()).notifications;assert.ok(notifications.some(n=>n.type==='TASK_RESCHEDULED' && n.resourceId===selected.assignment.id));assert.ok(!JSON.stringify(notifications).includes('17:30'));
  // Reuse the same real synthetic Auth session only in memory; direct business Firestore is denied.
  const login=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials.accounts.alex,returnSecureToken:true})});assert.equal(login.status,200);const {idToken}=await login.json() as {idToken:string};const denied=await fetch('https://firestore.googleapis.com/v1/projects/'+PREVIEW_PROJECT+'/databases/(default)/documents/tasks/'+t.id,{headers:{Authorization:'Bearer '+idToken}});assert.equal(denied.status,403);
  await tasks.cancelTask(t.id);state.done=true;save();
 }
 assert.equal((await tasks.getTask(state.tasks.smoke)).status,'CANCELLED');console.log('PASS real Auth cloud: revisions, fits, Calendar move, pending/confirmed reconfirmation, stale/availability gates, replacement, unchanged reservation/Trust, persistent notifications and direct Firestore denial. Existing Task cancellation releases the smoke reservation; no history reset.');
}
main().catch(e=>{console.error('Scheduling fixture stopped:',(e as Error).message);process.exitCode=1;});
