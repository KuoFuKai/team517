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
 const file='.tools/trust-fixtures.json',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:PREVIEW_PROJECT,stories:{}};assert.equal(state.project,PREVIEW_PROJECT);const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
 const fields=(title:string)=>({title,helpType:'Everyday support',publicInstructions:'Meet in the lobby, help with check-in, and keep company during the visit. Fictional demonstration.',locationId:PREVIEW_LOCATION_ID,startAt:'2026-11-21T15:00:00Z',endAt:'2026-11-21T17:00:00Z',urgency:'PLANNED' as const,visibility:'VERIFIED_HELPERS' as const,compensationType:'VOLUNTEER' as const});
 const existing=(await tasks.listTasks(PREVIEW_CONTEXT_ID)).tasks;assert.ok(existing.length<200,'Review the bounded fixture context before adding more history.');
 async function getTask(slot:string,title:string){if(state.stories[slot]){const task=await tasks.getTask(state.stories[slot]);assert.equal(task.createdBy,'team517_preview_manager');assert.equal(task.title,title);assert.equal(task.compensationType,'VOLUNTEER');return task;}assert.ok(!existing.some(t=>t.title===title),'A matching Task exists without its fixture receipt; inspect rather than adopt/overwrite.');const task=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,fields(title));state.stories[slot]=task.id;save();return task;}
 const stories=[['alex','Appointment-day company · Demo',5,'Clear communication and a thoughtful check-in.'],['alex','Weekend grocery pickup · Demo',5,'Arrived on time and kept the plan simple.'],['alex','Library visit together · Demo',4,'Kind company and helpful updates along the way.'],['marcus','Warm dinner drop-off · Demo',5,'Considerate, reliable and easy to coordinate with.'],['marcus','Morning walk company · Demo',5,'Listened carefully and matched our pace.']] as const;
 for(let i=0;i<stories.length;i++){
  const [name,title,rating,comment]=stories[i];let task=await getTask('history-'+i,title);const candidate=createMarketplaceApi(actors[name]),execution=createAssignmentApi(actors[name]);
  if(task.status==='DRAFT')task=await tasks.publishTask(task.id);
  let assignmentId=(await market.listOffers(task.id)).task.activeAssignmentId;
  if(!assignmentId){assert.ok(['OPEN','HAS_OFFERS'].includes(task.status),'History is never rewound.');const previous=(await candidate.getMyOffer(task.id)).offer;assert.ok(!previous || previous.status==='ACTIVE','Do not reactivate withdrawn history.');const offer=previous ?? await candidate.offerHelp(task.id,{message:'I can help with this visit.'});assignmentId=(await market.selectOffer(task.id,offer.id)).assignment.id;}
  let a=await market.getAssignment(assignmentId);assert.equal(a.helperId,'team517_preview_'+name);
  if(a.status==='PENDING_CONFIRMATION')a=await execution.confirmAssignment(a.id);
  if(a.status==='CONFIRMED')a=await execution.startTask(a.id);
  if(a.status==='IN_PROGRESS')a=await execution.requestCompletion(a.id);
  if(a.status==='COMPLETION_PENDING')a=await ownerActions.confirmCompletion(a.id);
  assert.equal(a.status,'COMPLETED','Unexpected history state; no reset performed.');
  try{await reviews.submitReview(a.id,{rating,comment});}catch(e){if((e as any).code!=='REVIEW_ALREADY_EXISTS')throw e;}
 }
 let task=await getTask('comparison','Company for a Saturday appointment');if(task.status==='DRAFT')task=await tasks.publishTask(task.id);
 const messages:Record<string,string>={alex:'I can meet you in the lobby at 9:45 and stay for the whole appointment. I will help with check-in, keep you updated if the timing changes, and walk back together afterward.',marcus:'I am free from 10 until noon. Happy to wait during the visit and help make the return trip feel unhurried.',circle:'I know the family and can help with check-in. I can stay until 11 and coordinate with you if anything changes.'};
 if(['OPEN','HAS_OFFERS'].includes(task.status))for(const name of ['alex','marcus','circle']){const helper=createMarketplaceApi(actors[name]),offer=(await helper.getMyOffer(task.id)).offer;if(!offer)await helper.offerHelp(task.id,{message:messages[name]});}
 const offers=await market.listOffers(task.id);assert.ok(offers.offers.every(o=>o.trust && !('email' in o.trust) && !('wallet' in o.trust)));
 for(const name of ['alex','marcus']){const p=await trust.getHelperTrustProfile('team517_preview_'+name,task.id);assert.ok(p.completedTaskCount>= (name==='alex'?3:2));assert.ok(p.reviewCount>= (name==='alex'?3:2));}
 const zero=await trust.getHelperTrustProfile('team517_preview_circle',task.id);assert.equal(zero.relationship,'CARE_CIRCLE');assert.equal(zero.verificationStatus,'UNVERIFIED');
 assert.deepEqual(await Promise.all(wallets.map(w=>w.getPointAccount())),before,'Volunteer trust fixtures never change Points.');state.comparisonTaskId=task.id;save();console.log('PASS: five API-completed/reviewed synthetic stories, three comparison Offers, Circle distinction, safe trust projections and unchanged Points. Existing histories and progressed comparison state preserved.');
}
main().catch(e=>{console.error('Trust fixture stopped:',(e as Error).message);process.exitCode=1;});
