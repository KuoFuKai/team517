import { offerDto } from '../marketplace/dto';
import type { TaskOfferAvailabilityDto, HelperTrustProfileDto } from '@team517/contracts';
import { TrustRepository } from '../repositories/trust';
import { MarketplaceRepository } from '../repositories/marketplace';
import { SupportRepository } from '../repositories/support';
import { initialized } from '../permissions/support';
import { authorizeMarketplace } from '../permissions/marketplace';
import { reviewDto } from '../support/service';
import { ApiFailure } from '../shared/errors';
export class TrustService {
  constructor(private repo=new TrustRepository(),private market=new MarketplaceRepository(),private support=new SupportRepository()){}
  async profile(uid:string,helperId:string,taskId?:string):Promise<HelperTrustProfileDto>{
    await initialized(this.market.reader(),uid);
    let relationship: HelperTrustProfileDto['relationship']; let taskAvailability:TaskOfferAvailabilityDto|undefined;
    if(taskId){const task=await this.market.task(taskId);if(!task)throw new ApiFailure(404,'NOT_FOUND','Task not found.');await authorizeMarketplace(this.market.reader(),uid,'VIEW_OFFERS',{task});const offer=await this.market.offer(taskId+'_'+helperId);if(!offer || offer.taskId!==task.id || offer.helperId!==helperId || offer.careContextId!==task.careContextId)throw new ApiFailure(404,'OFFER_NOT_FOUND','Helper has not offered on this task.');const view=offerDto(offer,task); taskAvailability={availableFrom:view.availableFrom,availableUntil:view.availableUntil,availabilityFit:view.availabilityFit,taskStartAt:task.startAt?.toDate().toISOString(),taskEndAt:task.endAt?.toDate().toISOString()}; const member=await this.market.reader().member(task.careContextId,helperId);relationship=member?.status==='ACTIVE' && member.careContextId===task.careContextId && member.userId===helperId ? 'CARE_CIRCLE' : 'EXTERNAL';}
    const [{user,summary},list]=await Promise.all([this.repo.summary(helperId),this.support.reviews(helperId)]);
    return {...summary,...(taskAvailability?{taskAvailability}:{}),...(user.createdAt ? {memberSince:user.createdAt.toDate().toISOString().slice(0,7)} : {}),...(relationship ? {relationship} : {}),recentReviews:list.items.slice(0,5).map(reviewDto),reviewLimit:5,reviewsTruncated:list.truncated || list.items.length>5};
  }
}
