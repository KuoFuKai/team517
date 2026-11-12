import { Disclosure, TonePanel } from '../components/Details';
import { MessageEntry } from './MessageEntry';
import { Card, StatusBadge } from '../components/ui';
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
export function AssignmentPanel({ assignment, refresh }: { assignment: AssignmentDto; refresh?: () => Promise<void> }) {
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
  const run = async (work: () => Promise<AssignmentDto>, refreshAfter = true) => {
    if (lock.current) return;
    lock.current = true; executionEpoch.current++; setBusy(true); setError(''); setExecution(null);
    try { setCurrent(await work()); if (refreshAfter) await refresh?.(); }
    catch (failure) { setError(friendlyError(failure)); }
    finally { lock.current = false; setBusy(false); }
  };
  const button = (title: string, work: () => Promise<AssignmentDto>) => <Button disabled={busy} title={title} onPress={() => void run(work)} />;
  return <>
    <StatusBadge status={current.status} />
    <Text accessibilityRole="header">{publicTask?.title || 'Your arrangement'}</Text><Text>{publicTask?.publicInstructions}</Text>
    <TonePanel title="What happens next">{assignmentNextAction(current.status, helper)}</TonePanel>
    <Card><Text style={{ fontWeight: '600' }}>{personLabel(current.helperId)}</Text><Text style={{ fontSize: 12 }}>Selected {dateLabel(current.selectedAt)}</Text></Card><Disclosure title="Arrangement history">
    {current.confirmedAt && <Text>Confirmed: {dateLabel(current.confirmedAt)}</Text>}
    {current.startedAt && <Text>Started: {dateLabel(current.startedAt)}</Text>}
    {current.completedAt && <Text>Completed: {dateLabel(current.completedAt)}</Text>}
    </Disclosure>
    {button('Refresh Assignment', () => api.getAssignment(current.id))}
    {helper && current.status === 'PENDING_CONFIRMATION' && <>
      {button('Confirm Assignment', () => api.confirmAssignment(current.id))}
      {button('Decline Assignment', () => api.declineAssignment(current.id))}
    </>}
    {((!helper && current.status === 'PENDING_CONFIRMATION') || current.status === 'CONFIRMED') && button('Cancel arrangement · keep Task needed', () => api.cancelAssignment(current.id))}
    {helper && current.status === 'CONFIRMED' && button('Start Task', () => api.startTask(current.id))}
    {helper && current.status === 'IN_PROGRESS' && button('Request completion review', () => api.requestCompletion(current.id))}
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
    {current.status === 'COMPLETION_PENDING' && <Text>Waiting for requester review. Helpers cannot approve their own completion.</Text>}
    {current.status === 'DISPUTED' && <Text>An issue has been reported. Resolution is not yet available in this version.</Text>}
    <MessageEntry taskId={current.taskId} otherUserId={helper ? undefined : current.helperId} />
    <Disclosure title="Task activity"><TimelinePanel compact taskId={current.taskId} /></Disclosure>
    <Disclosure title="Reviews" initialOpen={!helper && current.status === 'COMPLETED'}><ReviewsPanel key={current.id} helperId={current.helperId} assignmentId={!helper && current.status === 'COMPLETED' ? current.id : undefined} /></Disclosure>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </>;
}
