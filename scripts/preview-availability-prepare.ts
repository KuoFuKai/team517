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
 const receipt='.tools/availability-fixtures.json';
 const state=existsSync(receipt)?JSON.parse(readFileSync(receipt,'utf8')):{project:PREVIEW_PROJECT,tasks:{}};assert.equal(state.project,PREVIEW_PROJECT);
 const save=()=>writeFileSync(receipt,JSON.stringify(state,null,2));
 const identities=['team517_preview_alex','team517_preview_marcus','team517_preview_circle'];
 const beforeTrust=await Promise.all(identities.map(id=>trust.getHelperTrustProfile(id)));
 const publicSummary=(p:typeof beforeTrust[number])=>({completed:p.completedTaskCount,reviews:p.reviewCount,rating:p.averageRating,verification:p.verificationStatus});
 async function taskFor(slot:string,title:string,startAt:string,endAt:string){
  if(state.tasks[slot]){const t=await tasks.getTask(state.tasks[slot]);assert.equal(t.createdBy,'team517_preview_manager');assert.equal(t.title,title);assert.equal(t.compensationType,'VOLUNTEER');return t;}
  const existing=(await tasks.listTasks(PREVIEW_CONTEXT_ID)).tasks;assert.ok(existing.length<200);assert.ok(!existing.some(t=>t.title===title),'Receipt missing; inspect instead of overwriting/adopting.');
  const t=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,{title,helpType:'Everyday support',publicInstructions:'Company for check-in and the journey home.',locationId:PREVIEW_LOCATION_ID,startAt,endAt,urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:'VOLUNTEER'});state.tasks[slot]=t.id;save();return t;
 }
 const stories=[
  {slot:'comparison',title:'Company for a morning appointment',start:'2026-11-23T15:00:00Z',end:'2026-11-23T17:00:00Z',candidates:[
   {name:'alex',fit:'COVERS_TASK',body:{message:'I can arrive early and stay through the appointment.',availableFrom:'2026-11-23T14:30:00Z',availableUntil:'2026-11-23T17:30:00Z'}},
   {name:'marcus',fit:'PARTIAL_OVERLAP',body:{message:'I can join after 10:30 and help with the return trip.',availableFrom:'2026-11-23T15:30:00Z',availableUntil:'2026-11-23T18:00:00Z'}},
   {name:'circle',fit:'NOT_PROVIDED',body:{message:'Happy to coordinate the timing with you.'}}]},
  {slot:'conflict',title:'Afternoon visit — timing to discuss',start:'2026-11-24T15:00:00Z',end:'2026-11-24T17:00:00Z',candidates:[
   {name:'alex',fit:'CONFLICT',body:{message:'I can help in the afternoon if the appointment time is flexible.',availableFrom:'2026-11-24T18:00:00Z',availableUntil:'2026-11-24T20:00:00Z'}},
   {name:'marcus',fit:'COVERS_TASK',body:{message:'I can cover the scheduled visit.',availableFrom:'2026-11-24T15:00:00Z',availableUntil:'2026-11-24T17:00:00Z'}}]}
 ];
 for(const story of stories){let task=await taskFor(story.slot,story.title,story.start,story.end);if(task.status==='DRAFT')task=await tasks.publishTask(task.id);
  if(['OPEN','HAS_OFFERS'].includes(task.status))for(const candidate of story.candidates){const helper=createMarketplaceApi(actors[candidate.name]);const old=(await helper.getMyOffer(task.id)).offer;if(!old)await helper.offerHelp(task.id,candidate.body);else assert.ok(['ACTIVE','SELECTED','NOT_SELECTED'].includes(old.status),'No withdrawn history is reactivated by fixture tooling.');}
  const offers=await market.listOffers(task.id);for(const candidate of story.candidates){const o=offers.offers.find(o=>o.helperId==='team517_preview_'+candidate.name);assert.ok(o);assert.equal(o.availabilityFit,candidate.fit);const scoped=await trust.getHelperTrustProfile(o.helperId,task.id);assert.equal(scoped.taskAvailability?.availabilityFit,candidate.fit);assert.equal(scoped.taskAvailability?.availableFrom,o.availableFrom);}
  const publicProfile=JSON.stringify(await trust.getHelperTrustProfile('team517_preview_alex'));assert.ok(!publicProfile.includes('availableFrom'));assert.ok(!publicProfile.includes('taskAvailability'));
  const discovery=JSON.stringify(await createMarketplaceApi(alex).discoverTasks());assert.ok(!discovery.includes('availableFrom'));
 }
 assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),before,'Availability never changes Points.');
 assert.deepEqual((await Promise.all(identities.map(id=>trust.getHelperTrustProfile(id)))).map(publicSummary),beforeTrust.map(publicSummary),'Availability never changes permanent Trust.');save();
 console.log('PASS Availability Preview: COVERS/PARTIAL/CONFLICT/NOT_PROVIDED, scoped projections, unscoped/Discovery privacy, unchanged Points/Trust; progressed histories preserved.');
}
main().catch(e=>{console.error('Availability fixture stopped:',(e as Error).message);process.exitCode=1;});
