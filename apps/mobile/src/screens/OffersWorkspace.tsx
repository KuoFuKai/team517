import { HelperTrustScreen } from './HelperTrustScreen';
import { demoPerson } from '../demo/maker-day3';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { Disclosure } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { personLabel, statusLabel, dateLabel, friendlyError, countLabel } from '../utils/presentation';
import { compensationLabel, taskWhenLabel } from '../utils/design-presentation';
import { Card, Avatar, EmptyState, StatusBadge, Button, Text, PageHeading, LoadingState, ErrorState } from '../components/ui';
import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { MessageEntry } from './MessageEntry';
import { ReviewsPanel } from './ReviewsPanel';
import React, { useEffect, useRef, useState } from 'react';
import type { OfferListDto, AssignmentDto, TaskDetailDto, OfferSummaryDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { theme as t } from '../theme';
export function OffersWorkspace({ taskId, task: taskDetails, back }: { taskId: string; task?: TaskDetailDto; back: () => void }) {
  const [data, setData] = useState<OfferListDto | null>(null), [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileId,setProfileId]=useState<string|null>(null);
  const inFlight = useRef(false);
  useScreenHeader({ title: selectedId ? 'Offer details' : 'Offers', back: selectedId ? () => setSelectedId(null) : back, disabled: busy, priority: 3 });
  useScreenTop(selectedId ?? 'offers');
  useHardwareBack(() => { if (selectedId) { if (!busy) setSelectedId(null); return true; } return false; }, 3);
  const run = async (work: () => Promise<void>) => { if (inFlight.current) return; inFlight.current = true; setBusy(true); setError(''); try { await work(); } catch (failure) { setError(friendlyError(failure)); } finally { inFlight.current = false; setBusy(false); } };
  const load = async () => { const list = await api.listOffers(taskId); setData(list); setAssignment(list.task.activeAssignmentId ? await api.getAssignment(list.task.activeAssignmentId) : null); };
  useEffect(() => { void run(load); }, []);
  const list = (offers: OfferSummaryDto[]) => offers.map(offer => <Pressable key={offer.id} accessibilityRole="button" accessibilityLabel={`View offer from ${personLabel(offer.helperId)}`} disabled={busy} onPress={() => setSelectedId(offer.id)}><Card><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Avatar label={personLabel(offer.helperId)} /><View style={{ flex: 1, gap: 3 }}><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>{personLabel(offer.helperId)}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{demoPerson(offer.helperId)?.relationship ?? statusLabel(offer.verificationStatus)}{offer.averageRating !== undefined ? ` · ${offer.averageRating.toFixed(1)} ★` : ' · No reviews yet'}</Text></View><Feather name="chevron-right" size={18} color={t.colors.primary} /></View><Text numberOfLines={3} style={{ fontStyle: 'italic' }}>{offer.message || 'I’d like to help with this task.'}</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 13.5, color: t.colors.primary }}>View offer</Text><StatusBadge status={offer.status} /></View></Card></Pressable>);
  const offer = data?.offers.find(value => value.id === selectedId);
  if(profileId) return <HelperTrustScreen helperId={profileId} taskId={taskId} back={()=>setProfileId(null)}/>;
  return <>
    {busy && <LoadingState label="Loading offers…" />}{error ? <ErrorState message={error} /> : null}
    {offer ? <><View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}><Avatar label={personLabel(offer.helperId)} /><Text accessibilityRole="header" style={{ fontSize: 28, lineHeight: 34 }}>{personLabel(offer.helperId)}</Text><Text style={{ color: t.colors.muted }}>{demoPerson(offer.helperId)?.relationship ?? statusLabel(offer.verificationStatus)} · Caregiver</Text><Text style={{ color: t.colors.primary }}>{offer.averageRating !== undefined ? `${offer.averageRating.toFixed(1)} ★ · ${countLabel(offer.reviewCount ?? 0, 'review')}` : 'No reviews yet'}</Text></View><Card><Text style={{ fontWeight: '600' }}>Offer</Text><Text>{offer.message || 'Offered to help with your task.'}</Text><Text style={{ color: t.colors.muted, fontSize: 13.5 }}>Sent {dateLabel(offer.createdAt)}</Text><StatusBadge status={offer.status} /></Card>
      <Button title="View helper profile" onPress={()=>setProfileId(offer.helperId)}/>
      {taskDetails && <Card><Text style={{ fontWeight: '600' }}>{taskDetails.title || 'Your task'}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{taskWhenLabel(taskDetails.startAt, taskDetails.endAt)}</Text><Text style={{ color: t.colors.primary }}>{compensationLabel(taskDetails)}</Text></Card>}
      {offer.status === 'ACTIVE' && data?.task.status === 'HAS_OFFERS' && <Button variant="primary" disabled={busy} title={demoPerson(offer.helperId) ? `Choose ${demoPerson(offer.helperId)!.name.split(' ')[0]}` : 'Choose this caregiver'} onPress={() => void run(async () => { const result = await api.selectOffer(taskId, offer.id); setAssignment(result.assignment); setSelectedId(null); await load(); })} />}
      {['ACTIVE', 'SELECTED'].includes(offer.status) && <MessageEntry taskId={taskId} otherUserId={offer.helperId} />}
      <Disclosure title="Reviews"><ReviewsPanel helperId={offer.helperId} /></Disclosure>
    </> : assignment ? <><AssignmentPanel assignment={assignment} refresh={load} /><Disclosure title="Backup offers">{list(data?.offers.filter(value => value.status === 'ACTIVE') ?? [])}</Disclosure></> : <><PageHeading title="Who can help?" caption={taskDetails?.title || 'Review the offers for your task.'} />{data && <View style={{ backgroundColor: t.colors.primarySoft, padding: 14, borderRadius: 12, gap: 6 }}><Text style={{ fontWeight: '600' }}>{countLabel(data.task.offerCount, 'person', 'people')} can help</Text>{taskDetails && <Text style={{ color: t.colors.primary }}>{compensationLabel(taskDetails)}</Text>}</View>}{data?.offers.length === 0 && <EmptyState title="No offers yet" message="Offers will appear here when someone responds." />}{list(data?.offers ?? [])}<Text style={{ fontSize: 13.5, color: t.colors.muted }}>Other offers stay available until your selected helper confirms.</Text></>}
    <Button variant="quiet" disabled={busy} title="Refresh offers" onPress={() => void run(load)} />
  </>;
}
