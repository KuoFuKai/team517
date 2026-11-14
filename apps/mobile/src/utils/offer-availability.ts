import type { OfferHelpRequest } from '@team517/contracts';
import { taskTimeValue } from './task-time';
export function offerAvailabilityInput(from:string,until:string,enabled:boolean,original?:Pick<OfferHelpRequest,'availableFrom'|'availableUntil'>):Pick<OfferHelpRequest,'availableFrom'|'availableUntil'> {
 if(!enabled)return {};
 const availableFrom=taskTimeValue(from,original?.availableFrom),availableUntil=taskTimeValue(until,original?.availableUntil);
 if(!availableFrom || !availableUntil || Date.parse(availableUntil)<=Date.parse(availableFrom))throw new Error('Choose both availability times, with the end after the start.');
 return {availableFrom,availableUntil};
}

// A deliberate reset must use the Task's exact instant, even if its wall-clock
// minute matches an older saved Offer in a repeated DST hour.
export function availabilityBaseline(task:{startAt?:string;endAt?:string},existing?:Pick<OfferHelpRequest,'availableFrom'|'availableUntil'>|null,useTaskTimes=false):Pick<OfferHelpRequest,'availableFrom'|'availableUntil'> {
 return !useTaskTimes && existing?.availableFrom ? existing : {availableFrom:task.startAt,availableUntil:task.endAt};
}
