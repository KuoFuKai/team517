import {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification} from 'firebase/auth';
import {auth} from './firebase';
import {Cooldown} from './policy';
export const mailCooldown=new Cooldown();
export async function sendVerification(){const u=auth.currentUser;if(!u||u.emailVerified)return;if(!mailCooldown.reserve('verify:'+u.uid))return;await sendEmailVerification(u);}
export async function emailSignIn(email:string,password:string,register=false){
 const r=register?await createUserWithEmailAndPassword(auth,email.trim(),password):await signInWithEmailAndPassword(auth,email.trim(),password);
 if(register)try{await sendVerification();}catch{/* Creation succeeded; explicit verification retry remains available. */}return r;
}
export async function resetPassword(email:string){
 if(!mailCooldown.reserve('reset:'+email.trim().toLowerCase()))return;
 try{await sendPasswordResetEmail(auth,email.trim());}catch(e){if((e as {code?:string}).code!=='auth/user-not-found')throw e;}
}
