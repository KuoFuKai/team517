import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { MenuRow, Disclosure, TonePanel } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { personLabel } from '../utils/presentation';
import { Card, Avatar, EmptyState } from '../components/ui';
import { View } from 'react-native';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useScreenHeader({ title: selectedId ? 'Offer details' : 'Offers', back: selectedId ? () => setSelectedId(null) : back, disabled: busy, priority: 3 });
  useScreenTop(selectedId ?? 'offers');
  useHardwareBack(() => { if (selectedId) { if (!busy) setSelectedId(null); return true; } return false; }, 3);
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

    <Button variant="quiet" disabled={busy} title="Refresh Offers" onPress={() => void run(load)} />
    {busy && <ActivityIndicator />}{error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {assignment && <AssignmentPanel assignment={assignment} refresh={load} />}
    {data && <><Text>{statusLabel(data.task.status)} · {data.task.offerCount} available or selected offers</Text>
      {data.offers.length === 0 && <Text>No Offers yet.</Text>}
      {!selectedId && data.offers.map(offer => <Card key={offer.id}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Avatar label={personLabel(offer.helperId)} /><View style={{ flex: 1 }}><MenuRow title={personLabel(offer.helperId)} subtitle={offer.averageRating !== undefined ? `${offer.averageRating.toFixed(1)} · ${countLabel(offer.reviewCount ?? 0, 'review')}` : 'No reviews yet'} onPress={() => setSelectedId(offer.id)} disabled={busy} /></View></View><StatusBadge status={offer.status} /><Text numberOfLines={2}>{offer.message || 'Offered to help with your task.'}</Text></Card>)}
      {data.offers.filter(offer => offer.id === selectedId).map(offer => <OfferCard key={offer.id} helperId={offer.helperId}>
        <StatusBadge status={offer.status} /><Text>{statusLabel(offer.verificationStatus)}</Text>
        <Text>{offer.message || 'No message.'}</Text>
        <Text>Offered: {dateLabel(offer.createdAt)} · {offer.averageRating !== undefined ? offer.averageRating.toFixed(1) : 'No rating'} · {countLabel(offer.reviewCount ?? 0, 'review')}</Text>
        {offer.status === 'ACTIVE' && data.task.status === 'HAS_OFFERS' && <Button disabled={busy} title="Select this Helper" onPress={() => void run(async () => {
          const result = await api.selectOffer(taskId, offer.id); setAssignment(result.assignment); await load();
        })} />}
        {['ACTIVE', 'SELECTED'].includes(offer.status) && <MessageEntry taskId={taskId} otherUserId={offer.helperId} />}
        <Disclosure title="Helper reviews"><ReviewsPanel helperId={offer.helperId} /></Disclosure>
      </OfferCard>)}
    </>}
    <TonePanel title="Choose one helper">Other offers stay available until your chosen helper confirms.</TonePanel>
  </>;
}
