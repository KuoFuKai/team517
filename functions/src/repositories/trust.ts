import { getFirestore } from 'firebase-admin/firestore';
import type { User,CareContextMember } from '../domain/models';
import { SupportRepository } from './support';
import { trustSummary } from '../trust/projection';
import { ApiFailure } from '../shared/errors';
import { membershipId } from './store';
import type { HelperTrustSummaryDto } from '@team517/contracts';
export class TrustRepository {
  private async aggregate(user:User){const [completed,rating]=await Promise.all([getFirestore().collection('assignments').where('helperId','==',user.id).where('status','==','COMPLETED').count().get(),new SupportRepository().rating(user.id)]);return trustSummary(user,completed.data().count,rating);}
  async summary(id:string){const user=(await getFirestore().collection('users').doc(id).get()).data() as User|undefined;if(!user?.roles.includes('HELPER'))throw new ApiFailure(404,'HELPER_NOT_FOUND','Helper profile is unavailable.');return {user,summary:await this.aggregate(user)};}
  async summaries(ids:string[],contextId:string){
    const unique=[...new Set(ids)];if(unique.length>100)throw new ApiFailure(409,'OFFER_LIST_LIMIT','Too many offers for one comparison.');
    const output=new Map<string,{trust:HelperTrustSummaryDto;relationship:'CARE_CIRCLE'|'EXTERNAL'}>();if(!unique.length)return output;
    const db=getFirestore(),[users,members]=await Promise.all([db.getAll(...unique.map(id=>db.collection('users').doc(id))),db.getAll(...unique.map(id=>db.collection('care_context_members').doc(membershipId(contextId,id))))]);
    let position=0;
    // Four workers bound aggregate concurrency; no per-card frontend HTTP requests.
    await Promise.all(Array.from({length:Math.min(4,unique.length)},async()=>{while(position<unique.length){const i=position++,id=unique[i];const user=(users[i].data() ?? {id,roles:[]}) as User;const member=members[i].data() as CareContextMember|undefined;output.set(id,{trust:await this.aggregate(user),relationship:member?.status==='ACTIVE' && member.careContextId===contextId && member.userId===id?'CARE_CIRCLE':'EXTERNAL'});}}));
    return output;
  }
}
