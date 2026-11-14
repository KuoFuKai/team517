import React,{useState,useEffect} from 'react';
import type { OfferDto,OfferHelpRequest } from '@team517/contracts';
import { Card,Text,TextInput,Button } from './ui';
import { TaskDateTimeField } from './TaskDateTimeField';
import { taskWhenLabel } from '../utils/design-presentation';
import { taskTimeInput } from '../utils/task-time';
import { offerAvailabilityInput,availabilityBaseline } from '../utils/offer-availability';
export function OfferForm({task,existing,disabled,submit,mode='create'}:{mode?:'create'|'edit';task:{id:string;startAt?:string;endAt?:string};existing?:OfferDto|null;disabled:boolean;submit:(body:OfferHelpRequest)=>Promise<void>}) {
 const scheduled=Boolean(task.startAt && task.endAt && Date.parse(task.endAt)>Date.parse(task.startAt));
 const [from,setFrom]=useState(''),[until,setUntil]=useState(''),[message,setMessage]=useState(''),[included,setIncluded]=useState(scheduled),[error,setError]=useState(''),[useTaskTimes,setUseTaskTimes]=useState(false);
 useEffect(()=>{setFrom(taskTimeInput(existing?.availableFrom ?? task.startAt));setUntil(taskTimeInput(existing?.availableUntil ?? task.endAt));setIncluded(existing ? Boolean(existing.availableFrom && existing.availableUntil) : scheduled);setMessage(existing?.message ?? '');setError('');setUseTaskTimes(false);},[task.id,existing?.updatedAt]);
 const original=availabilityBaseline(task,existing,useTaskTimes);
 return <Card><Text accessibilityRole="header">{mode==='edit'?'Edit availability':'Offer to help'}</Text><Text>Task time</Text><Text>{scheduled?taskWhenLabel(task.startAt,task.endAt):'Schedule flexible'}</Text><Text accessibilityRole="header">Your availability for this task</Text>
 <Text>Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}. This does not confirm an assignment.</Text>
 {included ? <><TaskDateTimeField label="Available from" value={from} change={setFrom} disabled={disabled}/><TaskDateTimeField label="Available until" value={until} change={setUntil} disabled={disabled}/>{scheduled && <Button title="Use task times" disabled={disabled} onPress={()=>{setFrom(taskTimeInput(task.startAt));setUntil(taskTimeInput(task.endAt));setUseTaskTimes(true);setError('');}}/>}{(mode==='edit' || !existing?.availableFrom) && <Button variant="quiet" title="Leave availability unspecified" disabled={disabled} onPress={()=>{setIncluded(false);setError('');}}/>}</> : <><Text>Availability not provided</Text><Button title="Add availability" disabled={disabled} onPress={()=>setIncluded(true)}/></>}
 {mode==='create' && <TextInput accessibilityLabel="Offer message" placeholder="Tell the requester how you can help (optional)" value={message} onChangeText={setMessage} maxLength={1000} multiline editable={!disabled}/>}
 {error ? <Text accessibilityRole="alert">{error}</Text> : null}
 <Button variant="primary" title={mode==='edit'?'Save availability':'Offer to help'} disabled={disabled} onPress={()=>{try{const body={message,...offerAvailabilityInput(from,until,included,original)};setError('');void submit(body);}catch(e){setError((e as Error).message);}}}/>
 </Card>;
}
