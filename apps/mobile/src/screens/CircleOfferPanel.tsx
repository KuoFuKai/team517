import { EditOfferAvailability } from './EditOfferAvailability';
import { OfferForm } from '../components/OfferForm';
import { OfferAvailability } from '../components/OfferAvailability';
import { MessageEntry } from './MessageEntry';
import { statusLabel } from '../utils/presentation';
import { friendlyError } from '../utils/presentation';
import { Button, Text, TextInput } from '../components/ui';
import React, { useState, useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import type { MyOfferDto, TaskDetailDto, AssignmentDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';

export function CircleOfferPanel({ task, disabled }: { task: TaskDetailDto; disabled: boolean }) {
  const [mine, setMine] = useState<MyOfferDto | null>(null), [message, setMessage] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const inFlight = useRef(false);
  const run = async (work: () => Promise<unknown>):Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      await work(); const response = await api.getMyOffer(task.id); setMine(response);
      setAssignment(response.offer?.assignmentId ? await api.getAssignment(response.offer.assignmentId) : null);
    }
    catch (failure) { setError(friendlyError(failure)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <>
    <Text>Offer support in your circle</Text>
    {['OPEN','HAS_OFFERS'].includes(mine?.taskStatus ?? task.status) && !['ACTIVE','SELECTED'].includes(mine?.offer?.status ?? '') && <OfferForm task={task} existing={mine?.offer} disabled={disabled || busy} submit={body=>run(()=>api.offerHelp(task.id,body))}/>}
    {mine?.offer && <OfferAvailability value={mine.offer}/>}
      {mine?.offer?.status==='ACTIVE' && <EditOfferAvailability taskId={task.id} task={task} saved={async()=>{await run(async()=>{});}}/>}
    <Button disabled={disabled || busy} title="Check my Offer" onPress={() => void run(async () => {})} />
    {mine?.offer && <MessageEntry taskId={task.id} />}
    {mine && <Text>Your Offer: {mine.offer ? statusLabel(mine.offer.status) : 'No offer yet'} · {statusLabel(mine.taskStatus)}</Text>}
    {mine?.offer?.status === 'ACTIVE' && <Button disabled={disabled || busy} title="Withdraw my Offer" onPress={() => void run(() => api.withdrawOffer(task.id))} />}
    {busy && <ActivityIndicator />}
    {assignment && <AssignmentPanel assignment={assignment} />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </>;
}
