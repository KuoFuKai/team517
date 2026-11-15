import {getAuth} from 'firebase-admin/auth';
import {getFirestore,Timestamp,FieldValue} from 'firebase-admin/firestore';
import type {CompleteOnboardingRequest,UserRole} from '@team517/contracts';
import type {User} from '../domain/models';
import {ApiFailure} from '../shared/errors';
import {userDto} from '../care-context/service';
import {requireRecentAuth,requireAppleAuth} from './policy';
import {finishAccountDeletion} from './deletion';
export class AccountService {
 private get db(){return getFirestore();}
 async onboard(uid:string,body:CompleteOnboardingRequest){
  const ref=this.db.collection('users').doc(uid);
  return this.db.runTransaction(async tx=>{const current=(await tx.get(ref)).data() as User|undefined;
   if(current?.accountStatus==='DELETING'||current?.accountStatus==='DELETED')throw new ApiFailure(403,'ACCOUNT_INACTIVE','Account inactive.');
   const requested:UserRole[]=body.usage==='BOTH'?['CARE_MANAGER','HELPER']:body.usage==='HELPER'?['HELPER']:['CARE_MANAGER'];const now=Timestamp.now();
   const value:User={...(current??{id:uid,roles:[],primaryOnboardingRole:requested[0]!,createdAt:now}),roles:[...new Set([...(current?.roles??[]),...requested])],publicFirstName:body.publicFirstName,onboardingStatus:'COMPLETE',accountStatus:'ACTIVE',updatedAt:now};
   // Role intent never changes membership, verification, Points or Trust.
   tx.set(ref,value);return userDto(value);
  });
 }
 async addRole(uid:string,role:UserRole){const ref=this.db.collection('users').doc(uid);return this.db.runTransaction(async tx=>{const u=(await tx.get(ref)).data() as User|undefined;if(!u||u.accountStatus==='DELETED'||u.accountStatus==='DELETING')throw new ApiFailure(403,'ACCOUNT_INACTIVE','Account unavailable.');const value={...u,roles:[...new Set([...u.roles,role])],updatedAt:Timestamp.now()};tx.set(ref,value);return userDto(value);});}
 async delete(uid:string,bearer:string,appleCode?:string){
  const token=await getAuth().verifyIdToken(bearer,true);if(token.uid!==uid)throw new ApiFailure(403,'FORBIDDEN','Account mismatch.');requireRecentAuth(token.auth_time);
  const firebaseUser=await getAuth().getUser(uid);
  // Resolve responsibility first; do not remove immutable accounting or another user's history.
  const [tasks,assignments,offers,wallet]=await Promise.all([
   this.db.collection('tasks').where('createdBy','==',uid).where('status','in',['DRAFT','OPEN','HAS_OFFERS','AWAITING_CONFIRMATION','ARRANGED','IN_PROGRESS','COMPLETION_PENDING','DISPUTED']).limit(1).get(),
   this.db.collection('assignments').where('helperId','==',uid).where('status','in',['PENDING_CONFIRMATION','CONFIRMED','IN_PROGRESS','COMPLETION_PENDING','DISPUTED']).limit(1).get(),
   this.db.collection('offers').where('helperId','==',uid).where('status','==','ACTIVE').limit(1).get(),
   this.db.collection('point_accounts').doc(uid).get()]);
  if(!tasks.empty||!assignments.empty||!offers.empty||(wallet.data()?.reservedPoints??0)>0)throw new ApiFailure(409,'ACTIVE_COMMITMENTS','Resolve active requests, offers, arrangements and reserved points before deleting your account. Your history will be preserved.');
  if(firebaseUser.providerData.some(p=>p.providerId==='apple.com')){
   requireAppleAuth(token.firebase.sign_in_provider);
   const key=process.env.FIREBASE_WEB_API_KEY,redirectUri=process.env.APPLE_AUTH_REDIRECT_URI;
   if(!appleCode||!key||!redirectUri)throw new ApiFailure(503,'APPLE_REVOCATION_REQUIRED','Fresh Apple authorization and configured token revocation are required before account deletion.');
   const r=await fetch('https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({providerId:'apple.com',tokenType:'CODE',token:appleCode,idToken:bearer,redirectUri}),signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw new ApiFailure(503,'APPLE_REVOCATION_REQUIRED','Apple authorization could not be revoked. Your account has not been deleted.');
  }
  const ref=this.db.collection('users').doc(uid);
  await this.db.runTransaction(async tx=>{const u=await tx.get(ref);if(u.data()?.accountStatus==='DELETED')return;tx.set(ref,{id:uid,roles:[],publicFirstName:FieldValue.delete(),accountStatus:'DELETING',verificationStatus:'UNVERIFIED',updatedAt:Timestamp.now()},{merge:true});});
  try{await finishAccountDeletion(uid);return {status:'DELETED' as const};}catch{return {status:'PENDING' as const};}
 }
}
