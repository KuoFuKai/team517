import {createSupportApi} from '../apps/mobile/src/api/support';
import {createPointApi} from '../apps/mobile/src/api/points';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {assertPreviewTarget,PREVIEW_PROJECT,PREVIEW_API,PREVIEW_CONTEXT_ID,PREVIEW_LOCATION_ID} from './preview-policy';
import {createTransport} from '../apps/mobile/src/api/transport';
import {createTaskApi} from '../apps/mobile/src/api/tasks';
import {createMarketplaceApi} from '../apps/mobile/src/api/marketplace';
import {createAssignmentApi} from '../apps/mobile/src/api/assignments';
import {createSchedulingApi} from '../apps/mobile/src/api/scheduling';
import {createMessagingApi} from '../apps/mobile/src/api/messaging';
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--project');assert.ok(i>=0);assertPreviewTarget(args[i+1]);args.splice(i,2);const [mode,slot='a']=args;
 const credentials=JSON.parse(readFileSync('.tools/preview-credentials.json','utf8')),google=JSON.parse(readFileSync('apps/mobile/google-services.json','utf8'));assert.equal(credentials.project,PREVIEW_PROJECT);assert.equal(google.project_info.project_id,PREVIEW_PROJECT);
 const key=google.client.find((c:any)=>c.client_info.android_client_info.package_name==='edu.cornelltech.team517').api_key[0].current_key;
 async function client(name:string){const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials.accounts[name],returnSecureToken:true})});assert.equal(r.status,200);const {idToken}=await r.json() as {idToken:string};return createTransport({baseUrl:PREVIEW_API,getToken:async()=>idToken});}
 const manager=await client('manager'),alex=await client('alex'),marcus=await client('marcus'),tasks=createTaskApi(manager),market=createMarketplaceApi(manager),helper=createMarketplaceApi(alex),actions=createAssignmentApi(alex);
 const file='.tools/coordination-native.json',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:PREVIEW_PROJECT,tasks:{},prepared:{}};assert.equal(state.project,PREVIEW_PROJECT);const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
 const titles:Record<string,string>={a:'Clinic companion request',b:'Afternoon errand support',c:'Family clinic visit',d:'Evening check-in',e:'Visit availability review',f:'New visit time to confirm',g:'Help with a morning visit',h:'Company for a check-in'};
 if(mode==='prepare'){
  for(const [slot,title] of Object.entries(titles)){
   if(state.prepared[slot])continue;
   assert.ok(!state.tasks[slot],'Partial story must be inspected; never rewind history.');
   const day=14+Object.keys(titles).indexOf(slot),startAt=`2026-12-${day}T15:00:00Z`,endAt=`2026-12-${day}T17:00:00Z`;
   const t=await tasks.createTaskDraft(PREVIEW_CONTEXT_ID,{title,helpType:'Companionship',publicInstructions:'Meet in the lobby and help with a non-medical visit. No transportation is provided.',privateInstructions:'Fictional arrival instructions for the authorized helper only.',locationId:PREVIEW_LOCATION_ID,startAt,endAt,urgency:'PLANNED',visibility:'VERIFIED_HELPERS',compensationType:slot==='d'?'POINTS':'VOLUNTEER',...(slot==='d'?{pointReward:20}:{})});state.tasks[slot]=t.id;save();await tasks.publishTask(t.id);
   if(!['a','g'].includes(slot)){const o=await helper.offerHelp(t.id,{message:'I can help during the requested time.',availableFrom:startAt,availableUntil:endAt});await createMarketplaceApi(marcus).offerHelp(t.id,{message:'I am also available.',availableFrom:startAt,availableUntil:endAt});if(slot!=='h'){const selected=await market.selectOffer(t.id,o.id);if(['c','d','f'].includes(slot))await actions.confirmAssignment(selected.assignment.id);if(slot==='e')await helper.updateOfferAvailability(t.id,{expectedRevision:0,availableFrom:new Date(Date.parse(startAt)+1800000).toISOString(),availableUntil:endAt});if(slot==='f')await createSchedulingApi(manager).rescheduleTask(t.id,{startAt:new Date(Date.parse(startAt)+3600000).toISOString(),endAt:new Date(Date.parse(endAt)+3600000).toISOString(),expectedRevision:0,expectedAssignmentId:selected.assignment.id});}}
   state.prepared[slot]=true;save();
  }console.log('Prepared independent synthetic clarity stories, including unresolved handoff examples through normal APIs; no old history reset.');return;
 }
 if(mode==='verify'){
  const expected:Record<string,string>={a:'ARRANGED',b:'ARRANGED',c:'ARRANGED',d:'COMPLETED',e:'AWAITING_CONFIRMATION',f:'AWAITING_CONFIRMATION',g:'OPEN',h:'HAS_OFFERS'};
  for(const [slot,status] of Object.entries(expected)){assert.ok(state.prepared[slot]);const t=await tasks.getTask(state.tasks[slot]);assert.equal(t.title,titles[slot]);assert.equal(t.createdBy,'team517_preview_manager');assert.equal(t.status,status);}
  const history=await createSupportApi(manager).getTaskTimeline(state.tasks.d);assert.equal(history.truncated,false);
  for(const type of ['TASK_STARTED','COMPLETION_REQUESTED','TASK_COMPLETED'])assert.equal(history.events.filter(e=>e.type===type).length,1);
  const c=await tasks.getTask(state.tasks.c);assert.equal(c.scheduleRevision,4);const selected=(await market.listOffers(c.id)).task.activeAssignmentId!;const a=await market.getAssignment(selected);assert.equal(a.status,'CONFIRMED');assert.equal(a.scheduleReview?.confirmedScheduleRevision,4);assert.equal(a.requiresHelperReconfirmation,false);
  const earned=await createPointApi(alex).getPointTransactions(),spent=await createPointApi(manager).getPointTransactions();assert.equal(earned.transactions[0].type,'TRANSFER_IN');assert.equal(earned.transactions[0].amount,20);assert.equal(spent.transactions[0].type,'TRANSFER_OUT');assert.equal(spent.transactions[0].amount,20);
  console.log('PASS cloud acceptance: A/B/C arranged, D completed with one start/request/approval, current schedule4 accepted, normal20-point reward, E/F/G/H unresolved handoff examples retained. No history reset.');return;
 }
 assert.ok(titles[slot] && state.prepared[slot]);const id=state.tasks[slot],task=await tasks.getTask(id);assert.equal(task.title,titles[slot]);assert.equal(task.createdBy,'team517_preview_manager');const list=await market.listOffers(id),assignment=list.task.activeAssignmentId?await market.getAssignment(list.task.activeAssignmentId):undefined;
 if(mode==='state'){console.log(JSON.stringify({slot,title:task.title,status:task.status,assignment:assignment?.status,helper:assignment?.helperId,availabilityReview:assignment?.availabilityReview?.requiresRequesterReconfirmation,scheduleReview:assignment?.scheduleReview?.requiresHelperReconfirmation}));return;}
 if(mode==='offer'){await helper.offerHelp(id,{message:'I can accompany her for the visit.',availableFrom:task.startAt!,availableUntil:task.endAt!});await createMarketplaceApi(marcus).offerHelp(id,{message:'I am available as well.',availableFrom:task.startAt!,availableUntil:task.endAt!});}
 else if(mode==='edit'){const own=(await helper.getMyOffer(id)).offer!;await helper.updateOfferAvailability(id,{expectedRevision:own.availabilityRevision ?? 0,availableFrom:new Date(Date.parse(task.startAt!)+1800000).toISOString(),availableUntil:task.endAt!});}
 else if(mode==='confirm'){assert.ok(assignment);await actions.confirmAssignment(assignment.id);}
 else if(mode==='move'){await createSchedulingApi(manager).rescheduleTask(id,{startAt:new Date(Date.parse(task.startAt!)+3600000).toISOString(),endAt:new Date(Date.parse(task.endAt!)+3600000).toISOString(),expectedRevision:task.scheduleRevision ?? 0,expectedAssignmentId:assignment?.id ?? null});}
 else if(mode==='message'){assert.ok(assignment);const api=createMessagingApi(manager),c=await api.startTaskConversation(id,assignment.helperId);await api.sendMessage(c.conversation.id,{text:'Thanks for checking the plan. Let me know if you have any questions.',clientMessageId:'clarity-native-'+crypto.randomUUID()});}
 else throw Error('Explicit prepare/state/verify/offer/edit/confirm/move/message required');
 console.log('Synthetic peer API action completed:',mode,slot);
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
