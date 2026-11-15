// Explicit development target, fresh fictional actor, normal client Auth/API only.
// No Admin credential, business Firestore access or plaintext-password persistence.
import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {initializeApp,deleteApp} from 'firebase/app';import {initializeAuth,inMemoryPersistence,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut} from 'firebase/auth';
import {assertPreviewTarget,PREVIEW_PROJECT,PREVIEW_API} from './preview-policy';import {createTransport,ApiClientError} from '../apps/mobile/src/api/transport';import {createAccountApi} from '../apps/mobile/src/api/account';import {createCareApi} from '../apps/mobile/src/api/service';import {createPointApi} from '../apps/mobile/src/api/points';
async function main(){
 assertPreviewTarget(process.argv[process.argv.indexOf('--project')+1]);const receipt='.tools/8h-cloud-auth-result.json';
 if(existsSync(receipt)&&!process.argv.includes('--new-actor')){console.log('Existing private auth-smoke receipt retained. Use --new-actor for another deliberate run; no previous pass is being re-executed.');return;}
 const sdk=JSON.parse(readFileSync('apps/mobile/google-services.json','utf8'));assert.equal(sdk.project_info.project_id,PREVIEW_PROJECT);const client=sdk.client.find((c:any)=>c.client_info.android_client_info.package_name==='edu.cornelltech.team517');assert.ok(client);
 const app=initializeApp({apiKey:client.api_key[0].current_key,projectId:PREVIEW_PROJECT,appId:client.client_info.mobilesdk_app_id,authDomain:PREVIEW_PROJECT+'.firebaseapp.com'},'8h-auth-smoke');const auth=initializeAuth(app,{persistence:inMemoryPersistence});
 const email='auth8h-'+randomBytes(8).toString('hex')+'@example.test',password=randomBytes(24).toString('hex');let created=false;
 const state:Record<string,unknown>={project:PREVIEW_PROJECT,kind:'SPRINT8H_AUTH_SMOKE',startedAt:new Date().toISOString()};
 const save=()=>writeFileSync(receipt,JSON.stringify(state,null,2));
 try{
  const user=(await createUserWithEmailAndPassword(auth,email,password)).user;created=true;state.uid=user.uid;save();
  const idToken=await user.getIdToken();const request=createTransport({baseUrl:PREVIEW_API,getToken:async()=>idToken}),account=createAccountApi(request),care=createCareApi(request);
  const profile=await account.completeOnboarding({publicFirstName:'Casey',usage:'BOTH'});assert.equal(profile.id,user.uid);assert.equal(profile.verificationStatus,'UNVERIFIED');assert.equal(profile.accountStatus,'ACTIVE');assert.equal(profile.onboardingStatus,'COMPLETE');assert.equal((await care.listCareContexts()).careContexts.length,0);
  assert.equal((await createPointApi(request).getPointAccount()).availablePoints,0);state.registration='PASS';state.onboarding='PASS';state.noMembershipOrSignupGrant='PASS';save();
  await sendEmailVerification(user);state.verificationRequest='ACCEPTED';await sendPasswordResetEmail(auth,email);state.resetRequest='ACCEPTED';state.realInboxDelivery='NOT_TESTED';save();
  const deleted=await account.deleteAccount({confirmation:'DELETE'});state.deletionResponse=deleted.status;save();
  for(let n=0;n<12;n++){const lookup=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(client.api_key[0].current_key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken})});const body=await lookup.json() as {error?:{message?:string}};if(body.error?.message==='USER_NOT_FOUND'){state.authIdentityRemoved='PASS';break;}await new Promise(r=>setTimeout(r,2000));}
  assert.equal(state.authIdentityRemoved,'PASS');await assert.rejects(care.getCurrentUser(),e=>e instanceof ApiClientError&&e.status===401);state.oldTokenDenied='PASS';state.completedAt=new Date().toISOString();save();console.log('PASS development cloud Email registration/onboarding, zero initial Points, verification/reset requests, self-deletion and old-token rejection. Inbox delivery and native UI are separate.');
 }catch(e){state.failureCode=(e as {code?:string}).code??'ASSERTION_OR_REQUEST_FAILED';state.createdActor=created;save();console.error('Cloud auth smoke needs investigation; private receipt retained, no credential output.');process.exitCode=1;}
 finally{await signOut(auth).catch(()=>{});await deleteApp(app);}
}
main().catch(()=>{console.error('Auth smoke refused or could not initialize.');process.exitCode=1;});
