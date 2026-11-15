import {getAuth,type Auth} from 'firebase-admin/auth';import {AccountRepository} from '../repositories/accounts';
// Idempotent worker: a server-written tombstone is the durable request. Trigger retries
// finish external Auth/token cleanup if the initiating HTTP request loses its connection.
export async function finishAccountDeletion(uid:string,identity:Pick<Auth,'updateUser'|'revokeRefreshTokens'|'deleteUser'>=getAuth()){
 const repository=new AccountRepository();if(!await repository.pending(uid))return;
 await repository.clearTokens(uid);
 try{await identity.updateUser(uid,{disabled:true,displayName:'',photoURL:null});await identity.revokeRefreshTokens(uid);await identity.deleteUser(uid);}catch(e){if((e as {code?:string}).code!=='auth/user-not-found')throw new Error('Account identity cleanup must retry.');}
 await repository.markDeleted(uid);
}
