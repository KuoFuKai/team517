import {GoogleAuthProvider,OAuthProvider} from 'firebase/auth';
export function providerCredential(provider:'google.com'|'apple.com',identityToken:string,rawNonce?:string){
 if(!identityToken)throw {code:'auth/invalid-credential'};
 if(provider==='google.com')return GoogleAuthProvider.credential(identityToken);
 if(!rawNonce)throw {code:'auth/invalid-credential'};
 return new OAuthProvider('apple.com').credential({idToken:identityToken,rawNonce});
}
