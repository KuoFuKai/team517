import { MessageEntry } from './MessageEntry';
import { OfferCard } from '../components/Cards';
import { StatusBadge } from '../components/ui';
import { statusLabel, dateLabel, countLabel } from '../utils/presentation';
import { friendlyError } from '../utils/presentation';
import { Button, Text } from '../components/ui';
import { ReviewsPanel } from './ReviewsPanel';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import type { OfferListDto, AssignmentDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';

export function OffersWorkspace({ taskId, back }: { taskId: string; back: () => void }) {
  const [data, setData] = useState<OfferListDto | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const inFlight = useRef(false);
  const run = async (work: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await work(); } catch (failure) { setError(friendlyError(failure)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const load = async () => {
    const list = await api.listOffers(taskId); setData(list);
    setAssignment(list.task.activeAssignmentId ? await api.getAssignment(list.task.activeAssignmentId) : null);
  };
  useEffect(() => { void run(load); }, []);
  return <>
    <Text accessibilityRole="header">Review Offers</Text>
    <Button disabled={busy} title="Back to task" onPress={back} />
    <Button disabled={busy} title="Refresh Offers" onPress={() => void run(load)} />
    {busy && <ActivityIndicator />}{error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {assignment && <AssignmentPanel assignment={assignment} refresh={load} />}
    {data && <><Text>{statusLabel(data.task.status)} · {data.task.offerCount} available or selected offers</Text>
      {data.offers.length === 0 && <Text>No Offers yet.</Text>}
      {data.offers.map(offer => <OfferCard key={offer.id} helperId={offer.helperId}>
        <StatusBadge status={offer.status} /><Text>{statusLabel(offer.verificationStatus)}</Text>
        <Text>{offer.message || 'No message.'}</Text>
        <Text>Offered: {dateLabel(offer.createdAt)} · {offer.averageRating !== undefined ? offer.averageRating.toFixed(1) : 'No rating'} · {countLabel(offer.reviewCount ?? 0, 'review')}</Text>
        {offer.status === 'ACTIVE' && data.task.status === 'HAS_OFFERS' && <Button disabled={busy} title="Select this Helper" onPress={() => void run(async () => {
          const result = await api.selectOffer(taskId, offer.id); setAssignment(result.assignment); await load();
        })} />}
        {['ACTIVE', 'SELECTED'].includes(offer.status) && <MessageEntry taskId={taskId} otherUserId={offer.helperId} />}
        <ReviewsPanel helperId={offer.helperId} />
      </OfferCard>)}
    </>}
    <Text>Other offers stay available until your chosen helper confirms. Selection does not transfer money or points.</Text>
  </>;
}
