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
 const file='.tools/reconfirmation-fixtures.json',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:PREVIEW_PROJECT,tasks:{},prepared:{}};assert.equal(state.project,PREVIEW_PROJECT);const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
 const beforeTrust=await Promise.all(['alex','marcus','circle'].map(name=>trust.getHelperTrustProfile('team517_preview_'+name)));
 const stories=[{key:'keep',title:'Follow-up appointment',day:'2026-11-29',review:true},{key:'active',title:'Library visit planning',day:'2026-11-30',review:false},{key:'covers',title:'Morning company',day:'2026-12-01',review:false},{key:'replace',title:'Choose help for a clinic visit',day:'2026-12-02',review:true},{key:'phone',title:'Family appointment',day:'2026-12-03',review:false}];
 for(const story of stories){const startAt=story.day+'T15:00:00Z',endAt=story.day+'T17:00:00Z';let task:TaskDetailDto;
  if(state.tasks[story.key]){task=await tasks.getTask(state.tasks[story.key]);assert.equal(task.createdBy,'team517_preview_manager');assert.equal(task.title,story.title);assert.equal(task.careContextId,PREVIEW_CONTEXT_ID);assert.equal(task.compensationType,story.key==='phone'?'POINTS':'VOLUNTEER');}
  else{const existing=(await tasks.listTasks(PREVIEW_CONTEXT_ID)).tasks;assert.ok(existing.length<200);assert.ok(!existing.some(t=>t.title===story.title),'Missing receipt for matching title; inspect rather than overwrite.');task=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,{title:story.title,helpType:'Everyday support',publicInstructions:'Company for check-in and the journey home.',locationId:PREVIEW_LOCATION_ID,startAt,endAt,urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:story.key==='phone'?'POINTS':'VOLUNTEER',...(story.key==='phone'?{pointReward:70}:{})});state.tasks[story.key]=task.id;save();}
  assert.equal(task.startAt,new Date(startAt).toISOString());assert.equal(task.endAt,new Date(endAt).toISOString());
  if(story.key==='phone')continue; // Keep the physical reward-entry/publish Task as a draft.
  if(task.status==='DRAFT')task=await tasks.publishTask(task.id);
  if(['OPEN','HAS_OFFERS'].includes(task.status))for(const name of ['alex','marcus']){const helper=createMarketplaceApi(actors[name]);const old:OfferDto|null=(await helper.getMyOffer(task.id)).offer;if(!old)await helper.offerHelp(task.id,{message:name==='alex'?'I can arrive early and stay through the appointment.':'I can cover check-in and the return trip.',availableFrom:story.day+(name==='alex'?'T14:30:00Z':'T14:45:00Z'),availableUntil:story.day+(name==='alex'?'T17:30:00Z':'T17:15:00Z')});else assert.ok(['ACTIVE','SELECTED','NOT_SELECTED'].includes(old.status),'No withdrawn history is reactivated by this tool.');}
  let list=await market.listOffers(task.id);
  if(story.key!=='active' && !state.prepared[story.key]){
   if(!list.task.activeAssignmentId && list.task.status==='HAS_OFFERS'){const o=list.offers.find(o=>o.helperId==='team517_preview_alex' && o.status==='ACTIVE');assert.ok(o);await market.selectOffer(task.id,o.id,o.availabilityRevision ?? 0);list=await market.listOffers(task.id);}
   assert.ok(list.task.activeAssignmentId,'Expected synthetic selection; no history reset.');const a=await market.getAssignment(list.task.activeAssignmentId);
   if(story.review && a.status==='PENDING_CONFIRMATION'){const o=(await createMarketplaceApi(alex).getMyOffer(task.id)).offer!;if((o.availabilityRevision ?? 0)===0)await createMarketplaceApi(alex).updateOfferAvailability(task.id,{expectedRevision:0,availableFrom:story.day+'T15:30:00Z',availableUntil:story.day+'T17:30:00Z'});}
   state.prepared[story.key]=true;save();
  }
 }
 assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),before,'Volunteer stories and an unpublished POINTS draft never mutate Points.');
 assert.deepEqual(await Promise.all(['alex','marcus','circle'].map(name=>trust.getHelperTrustProfile('team517_preview_'+name))),beforeTrust,'Availability does not change unscoped Trust.');save();console.log('PASS: independent active/covers/keep/replacement stories and physical POINTS draft prepared; prior histories preserved; Points and Trust unchanged.');
}
main().catch(e=>{console.error('Reconfirmation fixture stopped:',(e as Error).message);process.exitCode=1;});
