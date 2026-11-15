import React,{useRef,useState} from 'react';
import type {TaskDetailDto,RescheduleTaskRequest,ReschedulePreviewDto} from '@team517/contracts';
import {ScreenModal} from '../components/ScreenModal';
import {TaskDateTimeField} from '../components/TaskDateTimeField';
import {Button,Text,Card} from '../components/ui';
import {SuccessScreen} from '../components/Feedback';
import {taskTimeInput,taskTimeValue} from '../utils/task-time';
import {taskWhenLabel} from '../utils/design-presentation';
import {friendlyError} from '../utils/presentation';
import * as api from '../api/client';
export function RescheduleTask({task,saved}:{task:TaskDetailDto;saved:(value:TaskDetailDto)=>Promise<void>}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[latest,setLatest]=useState<TaskDetailDto|null>(null),[from,setFrom]=useState(''),[until,setUntil]=useState(''),[fromOriginal,setFromOriginal]=useState<string>(),[untilOriginal,setUntilOriginal]=useState<string>(),[assignmentId,setAssignmentId]=useState<string|null>(null),[preview,setPreview]=useState<ReschedulePreviewDto|null>(null),[body,setBody]=useState<RescheduleTaskRequest|null>(null),[done,setDone]=useState(false);
 const lock=useRef(false);
 const run=async(work:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await work();}catch(e){setError(friendlyError(e));}finally{lock.current=false;setBusy(false);}};
 const load=()=>run(async()=>{const value=await api.getTask(task.id),offers=await api.listOffers(task.id);setLatest(value);setAssignmentId(offers.task.activeAssignmentId ?? null);setFrom(taskTimeInput(value.startAt));setUntil(taskTimeInput(value.endAt));setFromOriginal(value.startAt);setUntilOriginal(value.endAt);setPreview(null);setBody(null);await saved(value);});
 return <><Button title="Reschedule task" onPress={()=>{setOpen(true);setDone(false);setLatest(null);void load();}}/>{open && <ScreenModal title="Reschedule task" close={()=>{if(!lock.current)setOpen(false);}}>{done?<SuccessScreen header="Schedule updated" title="Schedule updated" message={preview?.requiresHelperReconfirmation?'Your selected helper must confirm the new schedule. The task is not arranged until then.':'Helpers with active offers have been notified. Their submitted availability has not changed.'} action="Back to task" done={()=>setOpen(false)}/>:<>
 <Text>Change only the requested date and time. Helpers keep the availability they submitted.</Text>
 {latest && <><Card><Text accessibilityRole="header">Current schedule</Text><Text>{taskWhenLabel(latest.startAt,latest.endAt)}</Text></Card>
 <TaskDateTimeField label="New start" value={from} disabled={busy} change={value=>{setFrom(value);setFromOriginal(undefined);setPreview(null);setBody(null);}}/>
 <TaskDateTimeField label="New end" value={until} disabled={busy} change={value=>{setUntil(value);setUntilOriginal(undefined);setPreview(null);setBody(null);}}/>
 {preview && <Card><Text accessibilityRole="header">Review the change</Text><Text>Current</Text><Text>{taskWhenLabel(preview.current.startAt,preview.current.endAt)}</Text><Text>New</Text><Text>{taskWhenLabel(preview.proposed.startAt,preview.proposed.endAt)}</Text><Text>{preview.affectedHelpers} helpers will be notified if the schedule changes.</Text>{preview.requiresHelperReconfirmation && <><Text>Your selected helper must reconfirm, even if their availability still covers the new time.</Text><Text>{preview.selectedHelperFit==='COVERS_TASK'?'Their availability covers the new time.':'Their submitted availability does not cover the new time. They must update it before confirming.'}</Text><Text>Until then, this task is not arranged and arrival details are locked.</Text></>}</Card>}
 {error ? <Text accessibilityRole="alert">{error}</Text> : null}
 {!preview?<Button title="Preview schedule change" disabled={busy} onPress={()=>void run(async()=>{const startAt=taskTimeValue(from,fromOriginal),endAt=taskTimeValue(until,untilOriginal);if(!startAt || !endAt || Date.parse(endAt)<=Date.parse(startAt)){setError('Choose valid times. End must be later than start.');return;}const value={startAt,endAt,expectedRevision:latest.scheduleRevision ?? 0,expectedAssignmentId:assignmentId};const impact=await api.previewReschedule(task.id,value);setBody(value);setPreview(impact);})}/>:<Button variant="primary" title="Update schedule" disabled={busy} onPress={()=>void run(async()=>{if(!body)return;const value=await api.rescheduleTask(task.id,body);await saved(value.task);setDone(true);})}/>}
 </>}{!latest && error ? <Text accessibilityRole="alert">{error}</Text> : null}<Button title="Reload latest schedule" disabled={busy} onPress={()=>void load()}/><Button title="Cancel" disabled={busy} onPress={()=>setOpen(false)}/>
 </>}</ScreenModal>}</>;
}
