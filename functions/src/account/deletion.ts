import {getAuth,type Auth} from 'firebase-admin/auth';import {getFirestore,Timestamp,FieldValue} from 'firebase-admin/firestore';
// Idempotent worker: a server-written tombstone is the durable request. Trigger retries
// finish external Auth/token cleanup if the initiating HTTP request loses its connection.
export async function finishAccountDeletion(uid:string,identity:Pick<Auth,'updateUser'|'revokeRefreshTokens'|'deleteUser'>=getAuth()){
 const db=getFirestore(),ref=db.collection('users').doc(uid);const user=await ref.get();if(user.data()?.accountStatus!=='DELETING')return;
 for(;;){const devices=await db.collection('device_tokens').where('userId','==',uid).where('enabled','==',true).limit(100).get();if(devices.empty)break;
  for(const d of devices.docs)await db.runTransaction(async tx=>{const fresh=await tx.get(d.ref);if(fresh.data()?.userId===uid)tx.update(d.ref,{enabled:false,token:FieldValue.delete(),updatedAt:Timestamp.now()});});
 }
 try{await identity.updateUser(uid,{disabled:true,displayName:'',photoURL:null});await identity.revokeRefreshTokens(uid);await identity.deleteUser(uid);}catch(e){if((e as {code?:string}).code!=='auth/user-not-found')throw new Error('Account identity cleanup must retry.');}
 await ref.update({accountStatus:'DELETED',deletedAt:Timestamp.now(),updatedAt:Timestamp.now()});
}
