import {offerPresentation} from '../utils/coordination';
import {TonePanel} from '../components/Details';
import React,{useEffect,useState,useRef} from 'react';
import type {MyOfferDto} from '@team517/contracts';
import * as api from '../api/client';
import {Button,Text,Card,ErrorState,StatusBadge} from '../components/ui';
import {OfferAvailability} from '../components/OfferAvailability';
import {EditOfferAvailability} from './EditOfferAvailability';
import {MessageEntry} from './MessageEntry';
import {taskWhenLabel} from '../utils/design-presentation';
import {friendlyError} from '../utils/presentation';
import {useScreenHeader} from '../components/ScreenHeader';
import {useHardwareBack} from '../navigation/useHardwareBack';
export function RescheduledOfferScreen({taskId,back}:{taskId:string;back:()=>void}){
 const [data,setData]=useState<MyOfferDto|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);const active=useRef(true),lock=useRef(false);
 useScreenHeader({title:'Your offer',back,priority:3});useHardwareBack(()=>{back();return true;},3);
 const load=async()=>{try{const d=await api.getMyOffer(taskId);if(active.current)setData(d);}catch(e){if(active.current){setData(null);setError(friendlyError(e));}}};
 useEffect(()=>{active.current=true;void load();return()=>{active.current=false;};},[taskId]);
 return <><Text accessibilityRole="header">Current task schedule</Text>{error && <ErrorState message={error}/>} {data && <><Card><Text>{data.taskTitle || 'Your task'}</Text><Text>Current task time</Text><Text>{taskWhenLabel(data.taskTime?.startAt,data.taskTime?.endAt)}</Text></Card>{data.offer && <><TonePanel title={offerPresentation(data.offer.status).title}>{offerPresentation(data.offer.status).summary}</TonePanel><Text>Your submitted availability</Text><OfferAvailability value={data.offer}/><Text>Your submitted availability is shown against the current task time.</Text>{data.offer.status==='ACTIVE' && <><EditOfferAvailability taskId={taskId} saved={load}/><Button title="Withdraw offer" disabled={busy} onPress={()=>{if(lock.current)return;lock.current=true;setBusy(true);void api.withdrawOffer(taskId).then(load).catch(e=>setError(friendlyError(e))).finally(()=>{lock.current=false;setBusy(false);});}}/><MessageEntry taskId={taskId}/></>}</>}</>}<Button title="Refresh offer" disabled={busy} onPress={()=>void load()}/></>;
}
