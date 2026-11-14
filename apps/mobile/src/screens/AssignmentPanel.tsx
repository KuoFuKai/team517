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
  const [confirmedFeedback, setConfirmedFeedback] = useState(false);
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
  const [helperName,setHelperName]=useState(personLabel(assignment.helperId));
  useEffect(()=>{if(helper)return;let active=true;void api.getHelperTrustProfile(assignment.helperId,assignment.taskId).then(p=>{if(active)setHelperName(p.displayName);}).catch(()=>{});return()=>{active=false;};},[assignment.id,helper]);
  useEffect(()=>{let active=true;const load=()=>{if(lock.current || AppState.currentState!=='active')return;const epoch=executionEpoch.current;void api.getAssignment(assignment.id).then(value=>{if(active && epoch===executionEpoch.current && !lock.current){setCurrent(value);if(!['CONFIRMED','IN_PROGRESS','COMPLETION_PENDING'].includes(value.status)){executionEpoch.current++;setExecution(null);}}}).catch(e=>{if(active && ['FORBIDDEN','UNAUTHENTICATED'].includes(e?.code)){executionEpoch.current++;setExecution(null);setCurrent(old=>({...old,availabilityReview:undefined}));setPublicTask(null);setError(friendlyError(e));}});};load();const timer=setInterval(load,10000);const focus=AppState.addEventListener('change',state=>{if(state==='active')load();});return()=>{active=false;clearInterval(timer);focus.remove();};},[assignment.id]);
  const run = async (work: () => Promise<AssignmentDto>, refreshAfter = true) => {
    if (lock.current) return;
    lock.current = true; executionEpoch.current++; setBusy(true); setError(''); setExecution(null);
    try { const next = await work(); setCurrent(next); if (current.status === 'PENDING_CONFIRMATION' && next.status === 'CONFIRMED') setConfirmedFeedback(true); if (refreshAfter) await refresh?.(); }
    catch (failure) { if(['FORBIDDEN','UNAUTHENTICATED'].includes((failure as {code?:string})?.code ?? '')){setCurrent(value=>({...value,availabilityReview:undefined}));setPublicTask(null);}setError(friendlyError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  const button = (title: string, work: () => Promise<AssignmentDto>) => <Button variant={['Confirm', 'Start helping', 'Mark done', 'Confirm completion'].includes(title) ? 'primary' : 'secondary'} disabled={busy} title={title} onPress={() => void run(work)} />;
  if (confirmedFeedback) return <SuccessScreen header="Task confirmed" title="You confirmed the task" message="Your arrangement is confirmed. Arrival details are now available through the task." action="View arrangement" done={() => setConfirmedFeedback(false)} />;
  return <>
    <StatusBadge status={current.status} />
    <PageHeading title={publicTask?.title || 'Your arrangement'} /><Text>{publicTask?.publicInstructions}</Text>{publicTask?.startAt && publicTask?.endAt && <Text>{taskWhenLabel(publicTask.startAt,publicTask.endAt)}</Text>}
    {publicTask?.compensationType === 'POINTS' && <Card><Text>Reward: {publicTask.pointReward?.toLocaleString()} points</Text>{current.status === 'COMPLETED' && <Text>{helper ? 'Completion approved. Open My points to see your latest balance and reward activity.' : 'Completion approved. The reserved task reward has been resolved.'}</Text>}{current.status === 'DISPUTED' && <Text>The reward stays reserved while the issue awaits resolution.</Text>}</Card>}
    {review && !review.requiresRequesterReconfirmation && <OfferAvailability value={review.current}/>}
    {review?.requiresRequesterReconfirmation && <Card><Text accessibilityRole="header">Availability changed</Text><Text>{helper?'The requester needs to review your updated availability.':helperName+' updated availability.'}</Text><Text>Previously selected</Text><Text>{review.selected.availableFrom && review.selected.availableUntil?taskWhenLabel(review.selected.availableFrom,review.selected.availableUntil):'Availability not provided'}</Text><Text>Current availability</Text><OfferAvailability value={review.current}/>{error && <><Text accessibilityRole="alert">{error}</Text><Button title="Refresh availability" disabled={busy} onPress={()=>void run(()=>api.getAssignment(current.id))}/></>}{helper ? <Text>You can confirm after the requester reviews this change.</Text> : <><Button variant="primary" title={'Keep '+helperName+' selected'} disabled={busy} onPress={()=>void run(async()=>{await api.reconfirmAvailability(current.id,review.currentRevision);return api.getAssignment(current.id);})}/><Button title="Choose another helper" disabled={busy} onPress={()=>void run(async()=>{const value=await api.cancelAssignment(current.id,{expectedAvailabilityRevision:review.currentRevision});await chooseAnother?.();return value;})}/><MessageEntry taskId={current.taskId} otherUserId={current.helperId}/></>}</Card>}
    {helper && current.status==='PENDING_CONFIRMATION' && <EditOfferAvailability taskId={current.taskId} task={publicTask ?? undefined} saved={async()=>{executionEpoch.current++;setExecution(null);setCurrent(await api.getAssignment(current.id));await refresh?.();}}/>}
    <TonePanel title="What happens next">{review?.requiresRequesterReconfirmation ? helper?'Waiting for the requester to review your updated availability.':'Review the updated availability before the helper can confirm.' : assignmentNextAction(current.status, helper)}</TonePanel>
    <Card><Text style={{ fontWeight: '600' }}>{personLabel(current.helperId)}</Text><Text style={{ fontSize: 13.5 }}>{demoPerson(current.selectedBy) ? `Chosen by ${demoPerson(current.selectedBy)!.name}` : `Selected ${dateLabel(current.selectedAt)}`}</Text></Card><Disclosure title="Arrangement history">
    {current.confirmedAt && <Text>Confirmed: {dateLabel(current.confirmedAt)}</Text>}
    {current.startedAt && <Text>Started: {dateLabel(current.startedAt)}</Text>}
    {current.completedAt && <Text>Completed: {dateLabel(current.completedAt)}</Text>}
    </Disclosure>
    {helper && current.status === 'PENDING_CONFIRMATION' && <>
      {!review?.requiresRequesterReconfirmation && button('Confirm', () => api.confirmAssignment(current.id))}
      {button('Decline', () => api.declineAssignment(current.id))}
    </>}
    {((!helper && current.status === 'PENDING_CONFIRMATION') || current.status === 'CONFIRMED') && button('Cancel arrangement · keep Task needed', () => api.cancelAssignment(current.id))}
    {helper && current.status === 'CONFIRMED' && button('Start helping', () => api.startTask(current.id))}
    {helper && current.status === 'IN_PROGRESS' && button('Mark done', () => api.requestCompletion(current.id))}
    {!helper && current.status === 'COMPLETION_PENDING' && <>
      {button('Confirm completion', () => api.confirmCompletion(current.id))}
      <TextInput accessibilityLabel="Optional dispute reason" placeholder="Optional short reason" maxLength={500} value={reason} onChangeText={setReason} />
      {button('Dispute completion', () => api.disputeCompletion(current.id, reason.trim() ? { reason: reason.trim() } : {}))}
    </>}
    {helper && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(current.status) && <Button disabled={busy} title="Show arrival details" onPress={() => void run(async () => {
      const epoch = executionEpoch.current;
      const latest = await api.getAssignment(current.id); setCurrent(latest);
      const details = await api.getExecutionDetails(current.id); if (AppState.currentState === 'active' && epoch === executionEpoch.current) setExecution(details); return latest;
    }, false)} />}
    {execution && <Card><Text accessibilityRole="header">Arrival details</Text><Text>{execution.publicInstructions}</Text><Text>{execution.privateInstructions}</Text><Text>{execution.location.label}: {execution.location.formattedAddress}</Text></Card>}
    {current.status === 'COMPLETION_PENDING' && <Text>The requester will review and confirm completion.</Text>}
    {current.status === 'DISPUTED' && <Text>An issue has been reported. Resolution is not yet available in this version.</Text>}
    {!(review?.requiresRequesterReconfirmation && !helper) && <MessageEntry taskId={current.taskId} otherUserId={helper ? undefined : current.helperId} />}
    <Disclosure title="Task activity"><TimelinePanel compact taskId={current.taskId} /></Disclosure>
    <Disclosure keepMounted title="Reviews" initialOpen={!helper && current.status === 'COMPLETED'}><ReviewsPanel key={current.id} helperId={current.helperId} assignmentId={!helper && current.status === 'COMPLETED' ? current.id : undefined} /></Disclosure>
    <Button variant="quiet" disabled={busy} title="Refresh" onPress={() => void run(() => api.getAssignment(current.id))} />
    {error && !review?.requiresRequesterReconfirmation ? <Text accessibilityRole="alert">{error}</Text> : null}
  </>;
}
