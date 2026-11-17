export interface ProviderPort<C>{currentUid:()=>string|undefined;credential:()=>Promise<C|undefined>;signin:(c:C)=>Promise<unknown>;link:(c:C)=>Promise<string>;reauth:(c:C)=>Promise<string>}
// Credentials live only in this call. No email lookup, business migration, persisted
// pending OAuth token or automatic collision replay. Recovery requires fresh explicit linking.
export async function providerFlow<C>(intent:'signin'|'link'|'reauth',port:ProviderPort<C>){
 const before=port.currentUid(),credential=await port.credential();if(!credential)return;
 if(intent==='signin'){if(port.currentUid()!==before)throw {code:'auth/requires-recent-login'};await port.signin(credential);return credential;}
 if(!before||port.currentUid()!==before)throw {code:'auth/requires-recent-login'};
 const uid=await(intent==='link'?port.link(credential):port.reauth(credential));if(uid!==before)throw new Error('Identity changed unexpectedly');
 if(port.currentUid()!==before)throw {code:'auth/requires-recent-login'};
 return credential;
}
