import {ApiFailure} from '../shared/errors';
export const firstNamePattern=/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u;
export function requireAppleAuth(provider:string|undefined){if(provider!=='apple.com')throw new ApiFailure(401,'RECENT_AUTH_REQUIRED','Verify your identity with Apple before deleting this Apple-linked account.');}
export function requireRecentAuth(authTime:number|undefined,now=Date.now()){
 if(!authTime||authTime*1000>now+60000||now-authTime*1000>300000)throw new ApiFailure(401,'RECENT_AUTH_REQUIRED','Verify your identity again before deleting your account.');
}
