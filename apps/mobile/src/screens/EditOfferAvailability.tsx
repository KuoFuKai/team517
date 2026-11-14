import {SuccessScreen} from '../components/Feedback';
import {ScrollResetContext} from '../navigation/scroll';
import React,{useState,useContext} from 'react';
import {OfferForm} from '../components/OfferForm';
import {ScreenModal} from '../components/ScreenModal';
import {Button,Text,ErrorState} from '../components/ui';
import * as api from '../api/client';
import type {OfferDto} from '@team517/contracts';
import {friendlyError} from '../utils/presentation';
export function EditOfferAvailability({taskId,task,saved}:{taskId:string;task?:{startAt?:string;endAt?:string};saved?:()=>Promise<void>}){
 const [offer,setOffer]=useState<OfferDto|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[window,setWindow]=useState(task ?? {}),[completed,setCompleted]=useState(false);
 const reset=useContext(ScrollResetContext);const close=()=>{if(busy)return;if(completed)reset();setOpen(false);};
 const load=async()=>{setBusy(true);setError('');try{const mine=await api.getMyOffer(taskId);if(!mine.offer || !['ACTIVE','SELECTED'].includes(mine.offer.status))throw new Error('This offer is no longer editable.');setOffer(mine.offer);setWindow(mine.taskTime ?? task ?? {});}catch(e){setError(friendlyError(e));}finally{setBusy(false);}};
 return <><Button title="Edit availability" onPress={()=>{setNotice('');setCompleted(false);setOpen(true);void load();}}/>{notice && <Text accessibilityRole="alert">{notice}</Text>}{open && <ScreenModal title="Edit availability" close={close}>{completed?<SuccessScreen header="Availability updated" title="Availability updated" message={notice} action="Back to offer" done={close}/>:<>{error && !offer && <ErrorState message={error}/>}{offer && <OfferForm key={offer.id+'-'+offer.availabilityRevision} mode="edit" submitError={error} task={{id:taskId,...window}} existing={offer} disabled={busy} submit={async body=>{if(busy)return;setBusy(true);setError('');try{const result=await api.updateOfferAvailability(taskId,{expectedRevision:offer.availabilityRevision ?? 0,...(body.availableFrom && body.availableUntil?{availableFrom:body.availableFrom,availableUntil:body.availableUntil}:{})});setNotice(result.assignment?.availabilityReview?.requiresRequesterReconfirmation?'Availability updated. The requester will review your updated availability.':'Availability updated.');await saved?.();setCompleted(true);}catch(e){setError(friendlyError(e));}finally{setBusy(false);}}}/>}<Button disabled={busy} title="Reload latest availability" onPress={()=>void load()}/></>}</ScreenModal>}</>;
}
