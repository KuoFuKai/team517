import {signInWithCredential,linkWithCredential,reauthenticateWithCredential,type AuthCredential} from 'firebase/auth';
import {Platform} from 'react-native';
import Constants from 'expo-constants';
import {auth} from './firebase';
import {providerFlow} from './provider-flow';
import {providerCredential} from './credential';
export type SocialProvider='google.com'|'apple.com';
export type AuthIntent='signin'|'link'|'reauth';
export const googleAvailable=()=>['android','ios'].includes(Platform.OS)&&Constants.executionEnvironment!=='storeClient'&&Boolean(Constants.expoConfig?.extra?.team517GoogleClientId);
let firstName:string|undefined;
let firstNameUid:string|undefined;
export const suggestedFirstName=()=>firstNameUid&&auth.currentUser?.uid===firstNameUid?firstName:undefined;
export const clearProviderMemory=()=>{firstName=undefined;firstNameUid=undefined;};
export async function nativeCredential(provider:SocialProvider):Promise<{credential:AuthCredential;authorizationCode?:string}|undefined>{
 if(provider==='google.com'){
  const clientId=Constants.expoConfig?.extra?.team517GoogleClientId;if(!googleAvailable()||!clientId)throw {code:'PROVIDER_NOT_CONFIGURED'};
  const g=await import('react-native-nitro-google-signin');g.GoogleOneTapSignIn.configure({webClientId:clientId,autoSelectOnSignIn:false});await g.GoogleOneTapSignIn.checkPlayServices();
  const response=await g.GoogleOneTapSignIn.presentExplicitSignIn();if(g.isCancelledResponse(response))return;if(!g.isSuccessResponse(response)||!response.data.idToken)throw {code:'PROVIDER_NOT_CONFIGURED'};
  return {credential:providerCredential('google.com',response.data.idToken)};
 }
 if(Platform.OS!=='ios'||Constants.executionEnvironment==='storeClient'||Constants.expoConfig?.extra?.team517AppleAuthEnabled!==true)throw {code:'PROVIDER_NOT_CONFIGURED'};
 const apple=await import('expo-apple-authentication'),crypto=await import('expo-crypto');if(!await apple.isAvailableAsync())throw {code:'PROVIDER_NOT_CONFIGURED'};
 const nonce=Array.from(await crypto.getRandomBytesAsync(32),x=>x.toString(16).padStart(2,'0')).join('');const hashed=await crypto.digestStringAsync(crypto.CryptoDigestAlgorithm.SHA256,nonce);
 const result=await apple.signInAsync({requestedScopes:[apple.AppleAuthenticationScope.FULL_NAME,apple.AppleAuthenticationScope.EMAIL],nonce:hashed});if(!result.identityToken)throw {code:'PROVIDER_NOT_CONFIGURED'};
 if(result.fullName?.givenName && /^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(result.fullName.givenName))firstName=result.fullName.givenName;
 return {credential:providerCredential('apple.com',result.identityToken,nonce),authorizationCode:result.authorizationCode??undefined};
}
export async function socialAuth(provider:SocialProvider,intent:AuthIntent='signin'){
 if(intent==='signin')clearProviderMemory();
 return providerFlow(intent,{currentUid:()=>auth.currentUser?.uid,credential:()=>nativeCredential(provider),signin:async r=>{const result=await signInWithCredential(auth,r.credential);if(provider==='apple.com')firstNameUid=result.user.uid;return result;},link:async r=>(await linkWithCredential(auth.currentUser!,r.credential)).user.uid,reauth:async r=>(await reauthenticateWithCredential(auth.currentUser!,r.credential)).user.uid});
}
export async function nativeProviderLogout(){clearProviderMemory();if(googleAvailable())try{const g=await import('react-native-nitro-google-signin');await g.GoogleOneTapSignIn.signOut();}catch{/* Firebase session still clears. */}}
