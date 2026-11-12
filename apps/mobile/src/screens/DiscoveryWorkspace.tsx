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
  const [filters, setFilters] = useState(false);
  const [mode, setMode] = useState<'LIST' | 'MAP'>('LIST');
  const [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('');
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(), [compensation, setCompensation] = useState<TaskCompensationType | undefined>();
  const [message, setMessage] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
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
    setData(await api.discoverTasks({ ...(latitude ? { latitude: Number(latitude) } : {}), ...(longitude ? { longitude: Number(longitude) } : {}),
      ...(radius ? { radiusKm: Number(radius) } : {}), urgency, compensationType: compensation }));
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
    return false;
  });
  return <>
<SectionHeader title="Find nearby tasks" caption="A little help goes a long way." />
    {busy && <ActivityIndicator accessibilityLabel="Marketplace request in progress" />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!task ? <>
      <Text>Find support requests shared with verified helpers. Circle tasks are also available in your Circle.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}><Button title={filters ? 'Hide filters' : 'Filter tasks'} onPress={() => setFilters(!filters)} /><Button disabled={busy} title="Refresh discovery / apply filters" onPress={() => void run(load)} /></View>
      {filters && <Card>
      <TextInput accessibilityLabel="Discovery latitude" placeholder="Latitude (optional)" value={latitude} onChangeText={setLatitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery longitude" placeholder="Longitude (optional)" value={longitude} onChangeText={setLongitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery radius" placeholder="Radius km (optional, max 100)" value={radius} onChangeText={setRadius} editable={!busy} />
      <Text>Urgency filter</Text><Button disabled={busy} title="All urgency" onPress={() => setUrgency(undefined)} />
      {(['PLANNED', 'URGENT'] as TaskUrgency[]).map(value => <Button key={value} disabled={busy} title={(urgency === value ? '✓ ' : '') + value} onPress={() => setUrgency(value)} />)}
      <Text>Compensation</Text><Button disabled={busy} title="All compensation" onPress={() => setCompensation(undefined)} />
      {(['VOLUNTEER', 'POINTS', 'PAID'] as TaskCompensationType[]).map(value => <Button key={value} disabled={busy} title={(compensation === value ? '✓ ' : '') + value} onPress={() => setCompensation(value)} />)}
      </Card>}
      <Button disabled={busy} title={mode === 'LIST' ? 'Map preview · coming later' : 'Switch to List'} onPress={() => setMode(mode === 'LIST' ? 'MAP' : 'LIST')} />
      {mode === 'MAP' && <Text>Map preview is not available yet. These are approximate area coordinates from the same task list, not exact addresses.</Text>}
      {data?.tasks.length === 0 && <Text>No tasks found. Try different filters or check back soon.</Text>}
      {data?.truncated && <Text>Showing a limited set of tasks. Refine your filters to find more relevant results.</Text>}
      {data?.tasks.slice().sort((a, b) => scheduledTime(a.startAt) - scheduledTime(b.startAt)).map(item => <TaskPreviewCard key={item.id} status={item.compensationType} title={item.title} when={dateLabel(item.startAt)} detail={`${item.approximateLocation.areaLabel}${item.distanceKm !== undefined ? ` · about ${item.distanceKm} km` : ''}`} busy={busy} action="Open discovery detail" open={() => void run(async () => {
          setMine(null); setAssignment(null); setMessage(''); setTask(await api.getDiscoveredTask(item.id)); await refreshMine(item.id);
        })}>
        {item.pointReward !== undefined && <Text>{item.pointReward} points</Text>}{item.cashAmount !== undefined && <Text>{item.cashAmount} {item.currency ?? ''}</Text>}
        {mode === 'MAP' && <Text>Coarse point: {item.approximateLocation.latitude ?? 'unknown'}, {item.approximateLocation.longitude ?? 'unknown'}</Text>}
      </TaskPreviewCard>)}
    </> : <>
      <Text accessibilityRole="header">{task.title}</Text><StatusBadge status={mine?.taskStatus ?? task.status} />
      <Text>{task.publicInstructions}</Text>
      <Text>{task.helpType} · {statusLabel(task.urgency)}</Text><Text>{dateLabel(task.startAt)} → {dateLabel(task.endAt)}</Text>
      <Text>{statusLabel(task.compensationType)} {task.pointReward ?? task.cashAmount ?? ''} {task.currency ?? ''}</Text>
      <Text>{task.approximateLocation.areaLabel}. Exact address and private instructions are withheld.</Text>
      <Text>Offers: {task.offerCount}</Text>
      <TextInput accessibilityLabel="Offer message" placeholder="Optional Offer message" value={message} onChangeText={setMessage} maxLength={1000} multiline editable={!busy} />
      {(!mine?.offer || ['WITHDRAWN', 'NOT_SELECTED'].includes(mine.offer.status)) && ['OPEN', 'HAS_OFFERS'].includes(mine?.taskStatus ?? task.status) &&
        <Button disabled={busy} title="Offer to help" onPress={() => void run(async () => { await api.offerHelp(task.id, { message }); await refreshMine(task.id); })} />}
      {mine?.offer && <MessageEntry taskId={task.id} />}
      {mine?.offer && <Text>Your Offer: {statusLabel(mine.offer.status)}</Text>}
      {mine?.offer?.status === 'ACTIVE' && <Button disabled={busy} title="Withdraw my Offer" onPress={() => void run(async () => { await api.withdrawOffer(task.id); await refreshMine(task.id); })} />}
      <Button disabled={busy} title="Refresh my Offer / selection" onPress={() => void run(async () => { await refreshMine(task.id); })} />
      {assignment && <AssignmentPanel assignment={assignment} />}
      <Button disabled={busy} title="Back to discovery" onPress={() => void run(async () => { setTask(null); setMine(null); setAssignment(null); await load(); })} />
    </>}
  </>;
}
