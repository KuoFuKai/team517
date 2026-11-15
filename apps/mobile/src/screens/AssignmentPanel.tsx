import {CoordinationCard} from '../components/CoordinationCard';
import {taskStatusPresentation} from '../utils/coordination';
import {EditOfferAvailability} from './EditOfferAvailability';
import {OfferAvailability} from '../components/OfferAvailability';
import {taskWhenLabel} from '../utils/design-presentation';
import { demoPerson } from '../demo/maker-day3';
import { SuccessScreen } from '../components/Feedback';
import { Disclosure, TonePanel } from '../components/Details';
import { MessageEntry } from './MessageEntry';
import { Card, StatusBadge, PageHeading } from '../components/ui';
import { personLabel, dateLabel, assignmentNextAction } from '../utils/presentation';
import { AppState } from 'react-native';
import { friendlyError } from '../utils/presentation';
import { Button, Text, TextInput } from '../components/ui';
import { ReviewsPanel } from './ReviewsPanel';
import { TimelinePanel } from './TimelinePanel';
import React, { useEffect, useRef, useState } from 'react';

import type { AssignmentDto, AssignmentExecutionDto, AssignmentPublicTaskDto } from '@team517/contracts';
import * as api from '../api/client';
import { auth } from '../auth/firebase';
export function AssignmentPanel({ assignment, refresh,chooseAnother }: { assignment: AssignmentDto; refresh?: () => Promise<void>; chooseAnother?:()=>Promise<void> }) {
  const [feedback,setFeedback]=useState<{title:string;message:string}|null>(null);
  const [publicTask, setPublicTask] = useState<AssignmentPublicTaskDto | null>(null);
  const [current, setCurrent] = useState(assignment);
  const [execution, setExecution] = useState<AssignmentExecutionDto | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [reason, setReason] = useState('');
  const lock = useRef(false);
  const executionEpoch = useRef(0);
  useEffect(() => { setCurrent(assignment); setExecution(null); }, [assignment]);
  useEffect(() => { let active = true; setPublicTask(null); void api.getAssignmentPublicTask(assignment.id).then(t => { if (active) setPublicTask(t); }).catch(() => {}); return () => { active = false; }; }, [assignment.id]);
  useEffect(() => { const listener = AppState.addEventListener('change', state => { if (state !== 'active') { executionEpoch.current++; setExecution(null); } }); return () => listener.remove(); }, []);
  const helper = current.helperId === auth.currentUser?.uid;
  const review=current.availabilityReview;
  const schedule=current.scheduleReview;
  const [helperName,setHelperName]=useState(personLabel(assignment.helperId));
  useEffect(()=>{setHelperName(helper?'You':'your helper');if(helper)return;let active=true;void api.getHelperTrustProfile(assignment.helperId,assignment.taskId).then(p=>{if(active)setHelperName(p.displayName);}).catch(()=>{});return()=>{active=false;};},[assignment.id,helper]);
  useEffect(()=>{let active=true;const load=()=>{if(lock.current || AppState.currentState!=='active')return;const epoch=executionEpoch.current;void api.getAssignment(assignment.id).then(value=>{if(active && epoch===executionEpoch.current && !lock.current){setCurrent(value);if(value.scheduleReview?.requiresHelperReconfirmation || !['CONFIRMED','IN_PROGRESS','COMPLETION_PENDING'].includes(value.status)){executionEpoch.current++;setExecution(null);}}}).catch(e=>{if(active && ['FORBIDDEN','UNAUTHENTICATED'].includes(e?.code)){executionEpoch.current++;setExecution(null);setCurrent(old=>({...old,availabilityReview:undefined,scheduleReview:undefined}));setPublicTask(null);setError(friendlyError(e));}});};load();const timer=setInterval(load,10000);const focus=AppState.addEventListener('change',state=>{if(state==='active')load();});return()=>{active=false;clearInterval(timer);focus.remove();};},[assignment.id]);
  const run = async (work: () => Promise<AssignmentDto>, refreshAfter = true) => {
    if (lock.current) return;
    lock.current = true; executionEpoch.current++; setBusy(true); setError(''); setExecution(null);
    try { const next = await work(); setCurrent(next); const success:Record<string,{title:string;message:string}>={CONFIRMED:{title:'Task confirmed',message:'You are scheduled to help. Arrival details are now available through the task.'},IN_PROGRESS:{title:'Task started',message:'The requester can see that help is in progress. Request completion when you finish.'},COMPLETION_PENDING:{title:'Completion requested',message:'The requester needs to approve completion. No further action is needed from you right now.'},COMPLETED:{title:'Completion confirmed',message:'The help is complete and approved. Reviews and reward activity follow the existing task rules.'}};if(current.status!==next.status && success[next.status])setFeedback(success[next.status]); if (refreshAfter) await refresh?.(); }
    catch (failure) { if(['FORBIDDEN','UNAUTHENTICATED'].includes((failure as {code?:string})?.code ?? '')){setCurrent(value=>({...value,availabilityReview:undefined,scheduleReview:undefined}));setPublicTask(null);}setError(friendlyError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  const button = (title: string, work: () => Promise<AssignmentDto>) => <Button variant={['Confirm task', 'Start task', 'Request completion', 'Confirm completion'].includes(title) ? 'primary' : 'secondary'} disabled={busy} title={busy && ['Confirm task','Start task','Request completion','Confirm completion'].includes(title)?'Updating task…':title} onPress={() => void run(work)} />;
  if(feedback)return <SuccessScreen header={feedback.title} title={feedback.title} message={feedback.message} action="View arrangement" done={()=>setFeedback(null)}/>;
  const coordination=taskStatusPresentation({status:current.status,helper,helperName,scheduleChanged:schedule?.requiresHelperReconfirmation,availabilityChanged:review?.requiresRequesterReconfirmation});
  return <>
    <PageHeading title={publicTask?.title || 'Your arrangement'} /><Text>{publicTask?.publicInstructions}</Text>{publicTask?.startAt && publicTask?.endAt && <Text>{taskWhenLabel(schedule?.current.startAt ?? publicTask.startAt,schedule?.current.endAt ?? publicTask.endAt)}</Text>}
    <CoordinationCard value={coordination}>
      {error && <><Text accessibilityRole="alert">{error}</Text><Button title="Refresh task" disabled={busy} onPress={()=>void run(()=>api.getAssignment(current.id))}/></>}
      {helper && current.status==='PENDING_CONFIRMATION' && !current.requiresHelperReconfirmation && !schedule?.requiresHelperReconfirmation && !review?.requiresRequesterReconfirmation && button('Confirm task',()=>api.confirmAssignment(current.id))}
      {helper && current.status==='CONFIRMED' && button('Start task',()=>api.startTask(current.id))}
      {helper && current.status==='IN_PROGRESS' && button('Request completion',()=>api.requestCompletion(current.id))}
      {!helper && current.status==='COMPLETION_PENDING' && button('Confirm completion',()=>api.confirmCompletion(current.id))}
    </CoordinationCard>
    {publicTask?.compensationType === 'POINTS' && <Card><Text>Reward: {publicTask.pointReward?.toLocaleString()} points</Text>{current.status === 'COMPLETED' && <Text>{helper ? 'Completion approved. Open My points to see your latest balance and reward activity.' : 'Completion approved. The reserved task reward has been resolved.'}</Text>}{current.status === 'DISPUTED' && <Text>The reward stays reserved while the issue awaits resolution.</Text>}</Card>}
    {schedule?.requiresHelperReconfirmation && <Card><Text accessibilityRole="header">Task schedule changed</Text><Text>Previous schedule</Text><Text>{taskWhenLabel(schedule.previous.startAt,schedule.previous.endAt)}</Text><Text>New schedule</Text><Text>{taskWhenLabel(schedule.current.startAt,schedule.current.endAt)}</Text><Text>Submitted availability</Text><OfferAvailability value={schedule.availability}/>{helper?<><Text>{schedule.availability.availabilityFit==='COVERS_TASK'?'Your availability covers the new time. Confirm it explicitly before starting.':'This does not cover the new time. Update your availability, or decline.'}</Text>{schedule.availability.availabilityFit==='COVERS_TASK' && <Button title="Confirm new schedule" variant="primary" disabled={busy || review?.requiresRequesterReconfirmation} onPress={()=>void run(async()=>{await api.reconfirmSchedule(current.id,schedule.scheduleRevision);return api.getAssignment(current.id);})}/>}</>:<><Text>Waiting for {helperName} to reconfirm. The previous confirmation no longer covers this schedule.</Text><Button title="Choose another helper" disabled={busy} onPress={()=>void run(async()=>{const value=await api.cancelAssignment(current.id,{expectedScheduleRevision:schedule.scheduleRevision});await chooseAnother?.();return value;})}/></>}</Card>}
    {review && !schedule?.requiresHelperReconfirmation && !review.requiresRequesterReconfirmation && <OfferAvailability value={review.current}/>}
    {review?.requiresRequesterReconfirmation && <Card><Text accessibilityRole="header">{helper?'Requester review needed':helperName+' updated availability'}</Text><Text>{helper?'The requester needs to review your updated availability.':helperName+' updated availability.'}</Text><Text>Previously selected</Text><Text>{review.selected.availableFrom && review.selected.availableUntil?taskWhenLabel(review.selected.availableFrom,review.selected.availableUntil):'Availability not provided'}</Text><Text>Current availability</Text><OfferAvailability value={review.current}/>{helper ? <Text>You can confirm after the requester reviews this change.</Text> : <><Button variant="primary" title={'Keep '+helperName+' selected'} disabled={busy} onPress={()=>void run(async()=>{await api.reconfirmAvailability(current.id,review.currentRevision);return api.getAssignment(current.id);})}/><Button title="Choose another helper" disabled={busy} onPress={()=>void run(async()=>{const value=await api.cancelAssignment(current.id,{expectedAvailabilityRevision:review.currentRevision});await chooseAnother?.();return value;})}/><MessageEntry taskId={current.taskId} otherUserId={current.helperId}/></>}</Card>}
    {helper && current.status==='PENDING_CONFIRMATION' && <EditOfferAvailability taskId={current.taskId} task={publicTask ?? undefined} saved={async()=>{executionEpoch.current++;setExecution(null);setCurrent(await api.getAssignment(current.id));await refresh?.();}}/>}
    <Card><Text style={{ fontWeight: '600' }}>{helper?'You are the selected helper':helperName}</Text><Text style={{ fontSize: 13.5 }}>{demoPerson(current.selectedBy) ? `Chosen by ${demoPerson(current.selectedBy)!.name}` : `Selected ${dateLabel(current.selectedAt)}`}</Text></Card><Disclosure title="Arrangement history">
    {current.confirmedAt && <Text>{schedule?.requiresHelperReconfirmation?'Previous confirmation: ':'Confirmed: '}{dateLabel(current.confirmedAt)}</Text>}
    {current.startedAt && <Text>Started: {dateLabel(current.startedAt)}</Text>}
    {current.completedAt && <Text>Completed: {dateLabel(current.completedAt)}</Text>}
    </Disclosure>
    {helper && current.status === 'PENDING_CONFIRMATION' && <>
      {button('Decline', () => api.declineAssignment(current.id,schedule?.requiresHelperReconfirmation?schedule.scheduleRevision:undefined))}
    </>}
    {((!helper && current.status === 'PENDING_CONFIRMATION') || current.status === 'CONFIRMED') && button('Cancel arrangement Â· keep Task needed', () => api.cancelAssignment(current.id))}
    {!helper && current.status === 'COMPLETION_PENDING' && <>
      <TextInput accessibilityLabel="Optional dispute reason" placeholder="Optional short reason" maxLength={500} value={reason} onChangeText={setReason} />
      {button('Dispute completion', () => api.disputeCompletion(current.id, reason.trim() ? { reason: reason.trim() } : {}))}
    </>}
    {helper && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(current.status) && <Button disabled={busy} title="Show arrival details" onPress={() => void run(async () => {
      const epoch = executionEpoch.current;
      const latest = await api.getAssignment(current.id); setCurrent(latest);
      const details = await api.getExecutionDetails(current.id); if (AppState.currentState === 'active' && epoch === executionEpoch.current) setExecution(details); return latest;
    }, false)} />}
    {execution && <Card><Text accessibilityRole="header">Arrival details</Text><Text>{execution.publicInstructions}</Text><Text>{execution.privateInstructions}</Text><Text>{execution.location.label}: {execution.location.formattedAddress}</Text></Card>}
    {current.status === 'DISPUTED' && <Text>An issue has been reported. Resolution is not yet available in this version.</Text>}
    {!(review?.requiresRequesterReconfirmation && !helper) && <MessageEntry taskId={current.taskId} otherUserId={helper ? undefined : current.helperId} />}
    <Disclosure title="Task activity"><TimelinePanel compact taskId={current.taskId} /></Disclosure>
    <Disclosure keepMounted title="Reviews" initialOpen={!helper && current.status === 'COMPLETED'}><ReviewsPanel key={current.id} helperId={current.helperId} assignmentId={!helper && current.status === 'COMPLETED' ? current.id : undefined} /></Disclosure>
    <Button variant="quiet" disabled={busy} title="Refresh" onPress={() => void run(() => api.getAssignment(current.id))} />
  </>;
}
