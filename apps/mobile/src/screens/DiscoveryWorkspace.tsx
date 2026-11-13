import { SuccessScreen } from '../components/Feedback';
import { DiscoveryMap } from '../components/DiscoveryMap';
import { DiscoveryTaskCard, FilterPill } from '../components/DiscoveryPresentation';
import { PageHeading } from '../components/ui';
import { taskWhenLabel, compensationLabel, discoveryAreaLabel } from '../utils/design-presentation';
import { SegmentedControl } from '../components/SegmentedControl';
import { Choices, TonePanel, Disclosure, Action } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { MessageEntry } from './MessageEntry';
import { useScreenTop } from '../navigation/scroll';
import { TaskPreviewCard } from '../components/Cards';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { Card, EmptyState, StatusBadge, SectionHeader } from '../components/ui';
import { friendlyError, statusLabel, dateLabel, scheduledTime } from '../utils/presentation';
import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { TaskDiscoveryItemDto, TaskDiscoveryListDto, MyOfferDto, AssignmentDto, TaskCompensationType, TaskUrgency } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';

export function DiscoveryWorkspace({ back }: { back: () => void }) {
  const [data, setData] = useState<TaskDiscoveryListDto | null>(null);
  const [task, setTask] = useState<TaskDiscoveryItemDto | null>(null);
  const [mine, setMine] = useState<MyOfferDto | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const [filters, setFilters] = useState(false);
  const [mode, setMode] = useState<'LIST' | 'MAP'>('LIST');
  const [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('');
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(), [compensation, setCompensation] = useState<TaskCompensationType | undefined>();
  const [applied, setApplied] = useState<{ radius?: string; urgency?: TaskUrgency; compensation?: TaskCompensationType }>({});
  const [message, setMessage] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useScreenHeader({ title: task ? 'Task details' : 'Find tasks', back: task ? () => { setTask(null); setMine(null); setAssignment(null); setError(''); } : undefined, disabled: busy, priority: 2, enabled: Boolean(task) });
  const inFlight = useRef(false);
  useScreenTop(task?.id ?? 'list');
  const run = async (work: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await work(); } catch (failure) { setError(friendlyError(failure)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const load = async () => {
    const coordinates = [latitude, longitude, radius].filter(Boolean).map(Number);
    if (coordinates.some(value => !Number.isFinite(value))) { setError('Enter numbers for coordinates and distance, or clear them to explore all areas.'); return; }
    const result = await api.discoverTasks({ ...(latitude ? { latitude: Number(latitude) } : {}), ...(longitude ? { longitude: Number(longitude) } : {}),
      ...(radius ? { radiusKm: Number(radius) } : {}), urgency, compensationType: compensation });
    setData(result); setApplied({ radius, urgency, compensation }); setFilters(false);
  };
  const refreshMine = async (id: string) => {
    const response = await api.getMyOffer(id); setMine(response);
    if (response.offer?.assignmentId) setAssignment(await api.getAssignment(response.offer.assignmentId));
    else setAssignment(null);
    if (response.taskStatus === 'OPEN' || response.taskStatus === 'HAS_OFFERS') setTask(await api.getDiscoveredTask(id));
  };
  useEffect(() => { void run(load); }, []);
  useHardwareBack(() => {
    if (assignment || task) { if (!busy) { setAssignment(null); setTask(null); setMine(null); setError(''); } return true; }
    if (filters) { if (!busy) setFilters(false); return true; }
    if (mode === 'MAP') { setMode('LIST'); return true; }
    return false;
  }, 1);
  if (offerSent) return <SuccessScreen header="Offer sent" title="Your offer has been sent" message="The requester will review your offer. You can follow its status in My offers." action="View task" done={() => setOfferSent(false)} />;
  return <>

    {busy && <ActivityIndicator accessibilityLabel="Marketplace request in progress" />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!task ? <>
      <SegmentedControl value={mode} options={[{ value: 'LIST', label: 'List' }, { value: 'MAP', label: 'Map' }]} onChange={setMode} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><FilterPill disabled={busy} title={applied.radius ? `Within ${applied.radius} km` : 'All areas'} press={() => setFilters(!filters)} /><FilterPill disabled={busy} title={applied.urgency ? statusLabel(applied.urgency) : 'Any time'} press={() => setFilters(!filters)} /><FilterPill disabled={busy} title={applied.compensation ? statusLabel(applied.compensation) : 'All types'} press={() => setFilters(!filters)} /></View>
      {filters && <Card>
      <TextInput accessibilityLabel="Discovery latitude" placeholder="Latitude (optional)" value={latitude} onChangeText={setLatitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery longitude" placeholder="Longitude (optional)" value={longitude} onChangeText={setLongitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery radius" placeholder="Radius km (optional, max 100)" value={radius} onChangeText={setRadius} editable={!busy} />
      <Text>Priority</Text><Choices value={urgency ?? 'ALL'} options={[{ value: 'ALL', label: 'All' }, { value: 'PLANNED', label: 'Planned' }, { value: 'URGENT', label: 'Urgent' }]} disabled={busy} change={value => setUrgency(value === 'ALL' ? undefined : value)} />
      <Text>Compensation</Text><Choices value={compensation ?? 'ALL'} options={[{ value: 'ALL', label: 'All' }, { value: 'VOLUNTEER', label: 'Volunteer' }, { value: 'POINTS', label: 'Points' }, { value: 'PAID', label: 'Paid' }]} disabled={busy} change={value => setCompensation(value === 'ALL' ? undefined : value)} />
      <Button title="Apply filters" variant="primary" disabled={busy} onPress={() => void run(load)} /></Card>}
      {mode === 'MAP' && <DiscoveryMap tasks={data?.tasks ?? []} busy={busy} open={item => void run(async () => { setMine(null); setAssignment(null); setMessage(''); setTask(await api.getDiscoveredTask(item.id)); await refreshMine(item.id); })} />}
      {data?.tasks.length === 0 && <EmptyState title="No tasks found" message="Try different filters or check back soon." />}
      {data?.truncated && <Text>Showing a limited set of tasks. Refine your filters to find more relevant results.</Text>}
      {mode === 'LIST' && data?.tasks.slice().sort((a, b) => scheduledTime(a.startAt) - scheduledTime(b.startAt)).map(item => <DiscoveryTaskCard key={item.id} task={item} busy={busy} open={() => void run(async () => { setMine(null); setAssignment(null); setMessage(''); setTask(await api.getDiscoveredTask(item.id)); await refreshMine(item.id); })} />)}
      <Action icon="refresh-cw" title="Refresh tasks" disabled={busy} onPress={() => void run(load)} />
    </> : <>
      {assignment ? <AssignmentPanel assignment={assignment} /> : <>
      <StatusBadge status={task.compensationType} /><PageHeading title={task.title} caption="Shared with verified caregivers" />
      <TonePanel title={compensationLabel(task)} />
      <Card><Text style={{ fontSize: 18, fontWeight: '600' }}>Quick summary</Text><Text>{task.publicInstructions || 'No additional public instructions.'}</Text><Text style={{ fontSize: 13.5, color: theme.colors.primary }}>{taskWhenLabel(task.startAt, task.endAt)}</Text></Card>
      <Card><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Approximate location</Text><Text style={{ fontWeight: '600' }}>{discoveryAreaLabel(task.approximateLocation.areaLabel)}</Text><DiscoveryMap tasks={[task]} compact /><Text style={{ fontSize: 13.5, color: theme.colors.primary }}>Exact address unlocks only for the confirmed helper.</Text></Card>
      {(!mine?.offer || ['WITHDRAWN', 'NOT_SELECTED'].includes(mine.offer.status)) && <><Disclosure title="Add an offer message"><TextInput accessibilityLabel="Offer message" placeholder="Tell the requester how you can help (optional)" value={message} onChangeText={setMessage} maxLength={1000} multiline editable={!busy} /></Disclosure>{['OPEN', 'HAS_OFFERS'].includes(mine?.taskStatus ?? task.status) && <Button variant="primary" disabled={busy} title="Offer to help" onPress={() => void run(async () => { await api.offerHelp(task.id, { message }); await refreshMine(task.id); setOfferSent(true); })} />}</>}
      {mine?.offer && <MessageEntry taskId={task.id} />}
      {mine?.offer && <Text>Your Offer: {statusLabel(mine.offer.status)}</Text>}
      {mine?.offer?.status === 'ACTIVE' && <Button disabled={busy} title="Withdraw my Offer" onPress={() => void run(async () => { await api.withdrawOffer(task.id); await refreshMine(task.id); })} />}
      <Button disabled={busy} title="Refresh my Offer / selection" onPress={() => void run(async () => { await refreshMine(task.id); })} />

      </>}
    </>}
  </>;
}
