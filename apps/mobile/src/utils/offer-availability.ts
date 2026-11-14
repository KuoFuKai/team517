import type { OfferHelpRequest } from '@team517/contracts';
import { taskTimeValue } from './task-time';
export function offerAvailabilityInput(from:string,until:string,enabled:boolean,original?:Pick<OfferHelpRequest,'availableFrom'|'availableUntil'>):Pick<OfferHelpRequest,'availableFrom'|'availableUntil'> {
 if(!enabled)return {};
 const availableFrom=taskTimeValue(from,original?.availableFrom),availableUntil=taskTimeValue(until,original?.availableUntil);
 if(!availableFrom || !availableUntil || Date.parse(availableUntil)<=Date.parse(availableFrom))throw new Error('Choose both availability times, with the end after the start.');
 return {availableFrom,availableUntil};
}
