import {AccountRepository} from '../repositories/accounts';
import {getAuth} from 'firebase-admin/auth';
import type {CompleteOnboardingRequest,UserRole} from '@team517/contracts';
import {ApiFailure} from '../shared/errors';
import {userDto} from '../care-context/service';
import {requireRecentAuth,requireAppleAuth} from './policy';
import {finishAccountDeletion} from './deletion';
export class AccountService {
 private repository=new AccountRepository();
 async onboard(uid:string,body:CompleteOnboardingRequest){const roles:UserRole[]=body.usage==='BOTH'?['CARE_MANAGER','HELPER']:body.usage==='HELPER'?['HELPER']:['CARE_MANAGER'];return userDto(await this.repository.onboard(uid,body.publicFirstName,roles));}
 async addRole(uid:string,role:UserRole){return userDto(await this.repository.addRole(uid,role));}
 async delete(uid:string,bearer:string,appleCode?:string){
  const token=await getAuth().verifyIdToken(bearer,true);if(token.uid!==uid)throw new ApiFailure(403,'FORBIDDEN','Account mismatch.');requireRecentAuth(token.auth_time);
  const firebaseUser=await getAuth().getUser(uid);
  // Resolve responsibility first; do not remove immutable accounting or another user's history.
  if(await this.repository.hasCommitments(uid))throw new ApiFailure(409,'ACTIVE_COMMITMENTS','Resolve active requests, offers, arrangements and reserved points before deleting your account. Your history will be preserved.');
  if(firebaseUser.providerData.some(p=>p.providerId==='apple.com')){
   requireAppleAuth(token.firebase.sign_in_provider);
   const key=process.env.FIREBASE_WEB_API_KEY,redirectUri=process.env.APPLE_AUTH_REDIRECT_URI;
   if(!appleCode||!key||!redirectUri)throw new ApiFailure(503,'APPLE_REVOCATION_REQUIRED','Fresh Apple authorization and configured token revocation are required before account deletion.');
   const r=await fetch('https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({providerId:'apple.com',tokenType:'CODE',token:appleCode,idToken:bearer,redirectUri}),signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw new ApiFailure(503,'APPLE_REVOCATION_REQUIRED','Apple authorization could not be revoked. Your account has not been deleted.');
  }
  await this.repository.beginDeletion(uid);
  try{await finishAccountDeletion(uid);return {status:'DELETED' as const};}catch{return {status:'PENDING' as const};}
 }
}
