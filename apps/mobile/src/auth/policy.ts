export function authError(error: unknown) {
 const code=(error as {code?:string})?.code??'';
 if(['ERR_REQUEST_CANCELED','SIGN_IN_CANCELLED','auth/cancelled-popup-request'].includes(code))return '';
 if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-login-credentials'].includes(code))return 'Incorrect email or password. Try again, or reset your password.';
 if(['auth/email-already-in-use','auth/account-exists-with-different-credential'].includes(code))return 'This email is already connected to an account. Sign in with your existing method, then connect another method in Account.';
 if(code==='auth/credential-already-in-use')return 'This sign-in method belongs to another account. Accounts cannot be combined automatically.';
 if(code==='auth/provider-already-linked')return 'This sign-in method is already connected.';
 if(code==='auth/requires-recent-login')return 'Please verify your identity again before continuing.';
 if(code==='auth/weak-password')return 'Use a password with at least 6 characters.';
 if(code==='auth/invalid-email')return 'Enter a valid email address.';
 if(code==='auth/too-many-requests')return 'Too many attempts. Please wait a little before trying again.';
 if(code==='auth/network-request-failed')return 'Unable to connect. Check your connection and try again.';
 if(['auth/operation-not-allowed','PROVIDER_NOT_CONFIGURED'].includes(code))return 'This sign-in method is not available in this build. Continue with email.';
 return 'We could not finish that request. Please try again.';
}
export function canUnlink(providers:readonly string[],provider:string){return providers.includes(provider)&&providers.filter(p=>p!==provider).length>0;}
export const resetSuccess='If an account exists for that email, check your inbox for reset instructions.';
export function validEmail(value:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());}
export class Cooldown {
 private until=new Map<string,number>();constructor(private now=Date.now){}
 remaining(key:string){return Math.max(0,Math.ceil(((this.until.get(key)??0)-this.now())/1000));}
 reserve(key:string){if(this.remaining(key))return false;this.until.set(key,this.now()+60000);return true;}
}
