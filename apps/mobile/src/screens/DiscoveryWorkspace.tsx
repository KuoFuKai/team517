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
  const [filters, setFilters] = useState(false);
  const [mode, setMode] = useState<'LIST' | 'MAP'>('LIST');
  const [latitude, setLatitude] = useState(''), [longitude, setLongitude] = useState(''), [radius, setRadius] = useState('');
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(), [compensation, setCompensation] = useState<TaskCompensationType | undefined>();
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
  }, 1);
  return <>

    {busy && <ActivityIndicator accessibilityLabel="Marketplace request in progress" />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!task ? <>
      <SegmentedControl value={mode} options={[{ value: 'LIST', label: 'List' }, { value: 'MAP', label: 'Map' }]} onChange={setMode} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}><Action icon="sliders" title={filters ? 'Hide filters' : 'Filter tasks'} onPress={() => setFilters(!filters)} /><Action icon="refresh-cw" disabled={busy} title="Apply / refresh" onPress={() => void run(load)} /></View>
      {filters && <Card>
      <TextInput accessibilityLabel="Discovery latitude" placeholder="Latitude (optional)" value={latitude} onChangeText={setLatitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery longitude" placeholder="Longitude (optional)" value={longitude} onChangeText={setLongitude} editable={!busy} />
      <TextInput accessibilityLabel="Discovery radius" placeholder="Radius km (optional, max 100)" value={radius} onChangeText={setRadius} editable={!busy} />
      <Text>Priority</Text><Choices value={urgency ?? 'ALL'} options={[{ value: 'ALL', label: 'All' }, { value: 'PLANNED', label: 'Planned' }, { value: 'URGENT', label: 'Urgent' }]} disabled={busy} change={value => setUrgency(value === 'ALL' ? undefined : value)} />
      <Text>Compensation</Text><Choices value={compensation ?? 'ALL'} options={[{ value: 'ALL', label: 'All' }, { value: 'VOLUNTEER', label: 'Volunteer' }, { value: 'POINTS', label: 'Points' }, { value: 'PAID', label: 'Paid' }]} disabled={busy} change={value => setCompensation(value === 'ALL' ? undefined : value)} />
      </Card>}
      {mode === 'MAP' && <TonePanel title="Map view is coming later">Explore the same tasks below. Only approximate areas are available before confirmation.</TonePanel>}
      {data?.tasks.length === 0 && <Text>No tasks found. Try different filters or check back soon.</Text>}
      {data?.truncated && <Text>Showing a limited set of tasks. Refine your filters to find more relevant results.</Text>}
      {data?.tasks.slice().sort((a, b) => scheduledTime(a.startAt) - scheduledTime(b.startAt)).map(item => <TaskPreviewCard key={item.id} status={item.compensationType} title={item.title} when={dateLabel(item.startAt)} detail={`${item.approximateLocation.areaLabel}${item.distanceKm !== undefined ? ` · about ${item.distanceKm} km` : ''}`} busy={busy} action="Open discovery detail" open={() => void run(async () => {
          setMine(null); setAssignment(null); setMessage(''); setTask(await api.getDiscoveredTask(item.id)); await refreshMine(item.id);
        })}>
        {item.pointReward !== undefined && <Text>{item.pointReward} points</Text>}{item.cashAmount !== undefined && <Text>{item.cashAmount} {item.currency ?? ''}</Text>}

      </TaskPreviewCard>)}
    </> : <>
      <Text accessibilityRole="header">{task.title}</Text><StatusBadge status={mine?.taskStatus ?? task.status} />
      <Card><SectionHeader title="About this task" /><Text>{task.publicInstructions || 'No additional public instructions.'}</Text></Card>
      <Text>{task.helpType} · {statusLabel(task.urgency)}</Text><Text>{dateLabel(task.startAt)} → {dateLabel(task.endAt)}</Text>
      <Text>{statusLabel(task.compensationType)} {task.pointReward ?? task.cashAmount ?? ''} {task.currency ?? ''}</Text>
      <TonePanel title={task.approximateLocation.areaLabel}>The exact address and arrival instructions unlock only for the confirmed helper.</TonePanel>
      <Text style={{ color: theme.colors.muted }}>{task.offerCount} offers</Text>
      {(!mine?.offer || ['WITHDRAWN', 'NOT_SELECTED'].includes(mine.offer.status)) && <TextInput accessibilityLabel="Offer message" placeholder="Tell the requester how you can help (optional)" value={message} onChangeText={setMessage} maxLength={1000} multiline editable={!busy} />}
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
