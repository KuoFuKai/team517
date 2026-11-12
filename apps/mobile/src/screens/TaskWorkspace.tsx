import { ConfirmationSheet, SuccessScreen } from '../components/Feedback';
import { Disclosure } from '../components/Details';
import { Alert, View } from 'react-native';
import { useErrorScroll, useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { friendlyError, validationSummary } from '../utils/presentation';
import { theme } from '../theme';
import { Button, Text } from '../components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import type { CareContextDto, LocationDto, TaskDetailDto, TaskSummaryDto, TaskDraftFields } from '@team517/contracts';
import * as api from '../api/client';
import { ApiClientError } from '../api/transport';
import { TasksListScreen } from './TasksListScreen';
import { EditTaskScreen } from './EditTaskScreen';
import { TaskDetailScreen } from './TaskDetailScreen';
import { LocationsScreen } from './LocationsScreen';
import { AiSummaryPanel } from './AiSummaryPanel';
import { OffersWorkspace } from './OffersWorkspace';
import { CircleOfferPanel } from './CircleOfferPanel';

// Feature coordinator: screens receive public DTOs and actions, never storage.
export function TaskWorkspace({ context, back, viewerId, helper = false, calendar, createOnOpen = false, initialDraftId, onDraftCreated, finishPost, createDraftRequest }: { context: CareContextDto; back: () => void; viewerId?: string; helper?: boolean; calendar: () => void; createOnOpen?: boolean; initialDraftId?: string | null; onDraftCreated?: (id: string) => void; finishPost?: () => void; createDraftRequest?: () => Promise<TaskDetailDto> }) {
  const [screen, setScreen] = useState<'list' | 'edit' | 'detail' | 'locations' | 'offers' | 'feedback'>('list');
  useScreenTop(screen);
  const [feedback, setFeedback] = useState<'saved' | 'published' | 'cancelled' | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [locationsReturn, setLocationsReturn] = useState<'list' | 'edit'>('list');
  const [tasks, setTasks] = useState<TaskSummaryDto[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [task, setTask] = useState<TaskDetailDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useErrorScroll(error);
  const inFlight = useRef(false);
  const run = async (work: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await work(); }
    catch (failure) {
      const message = friendlyError(failure);
      const fields = failure instanceof ApiClientError ? validationSummary(failure.fields) : '';
      setError(message + (fields ? '\n' + fields : ''));
    } finally { inFlight.current = false; setBusy(false); }
  };
  const refresh = async () => { setTasks((await api.listTasks(context.id)).tasks); };
  const load = async () => {
    const [list, places] = await Promise.all([api.listTasks(context.id), api.listLocations(context.id)]);
    setTasks(list.tasks); setLocations(places.locations);
  };
  const applyAi = async (fields: TaskDraftFields, sourceVersion: string) => {
    if (!task || inFlight.current) throw new Error('Another task request is in progress.');
    inFlight.current = true; setBusy(true); setError('');
    try {
      const latest = await api.getTask(task.id);
      if (latest.status !== 'DRAFT' || latest.updatedAt !== sourceVersion) throw new Error('The draft changed. Reopen it and generate a fresh suggestion.');
      const saved = await api.updateTaskDraft(task.id, fields);
      setTask(saved);
      setTasks(current => current.map(item => item.id === saved.id ? {
        id: saved.id, careContextId: saved.careContextId, title: saved.title, status: saved.status, startAt: saved.startAt, urgency: saved.urgency,
      } : item));
    } finally { inFlight.current = false; setBusy(false); }
  };
  const createDraft = async () => {
    const draft = createOnOpen && createDraftRequest ? await createDraftRequest() : await api.createTaskDraft(context.id, {});
    if (createOnOpen) onDraftCreated?.(draft.id);
    setTask(draft); setScreen('edit');
    await refresh();
  };
  useEffect(() => { void run(async () => { await load(); if (createOnOpen) { if (initialDraftId) { setTask(await api.getTask(initialDraftId)); setScreen('edit'); } else await createDraft(); } }); }, []);
  const post = () => void run(createDraft);
  useHardwareBack(() => { if (screen === 'list') return false; if (!busy) { setScreen(screen === 'offers' ? 'detail' : screen === 'locations' ? locationsReturn : 'list'); setError(''); } return true; }, 1);
  const finishFeedback = () => { setFeedback(null); setScreen('list'); if (createOnOpen) finishPost?.(); };
  if (screen === 'feedback' && feedback) return <SuccessScreen header={feedback === 'cancelled' ? 'Task details' : 'Post a task'} title={feedback === 'saved' ? 'Draft saved successfully' : feedback === 'published' ? 'Task posted successfully' : 'Post cancelled'} message={feedback === 'saved' ? 'You can review the draft anytime.' : feedback === 'published' ? 'Your selected audience can now offer to help.' : 'This task is no longer accepting offers.'} action="Return to schedule" done={finishFeedback} />;
  return <>
    {cancelOpen && task && <ConfirmationSheet title="Cancel this post?" message="Your circle will no longer be able to offer help for this task. Any pending or scheduled arrangement will also be cancelled." busy={busy} error={error} dismiss={() => { setCancelOpen(false); setError(''); }} confirm={() => void run(async () => { setTask(await api.cancelTask(task.id)); await refresh(); setCancelOpen(false); setFeedback('cancelled'); setScreen('feedback'); })} />}
    {busy && <ActivityIndicator accessibilityLabel="Task request in progress" />}
    {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.error }}>{error}</Text> : null}
    {screen === 'list' && <>
      <TasksListScreen tasks={tasks} busy={busy} refresh={() => void run(load)} calendar={calendar} locations={() => { setError(''); setLocationsReturn('list'); setScreen('locations'); }}
        post={post}
        open={id => void run(async () => { setTask(await api.getTask(id)); setScreen('detail'); })} />
    </>}
    {(screen === 'edit' || screen === 'locations' && locationsReturn === 'edit') && task && <View style={{ display: screen === 'edit' ? 'flex' : 'none', gap: 16 }} importantForAccessibility={screen === 'edit' ? 'auto' : 'no-hide-descendants'}><EditTaskScreen key={task.id} task={task} locations={locations} busy={busy}
      applyAi={applyAi}
      save={(fields, publish) => void run(async () => {
        const saved = await api.updateTaskDraft(task.id, fields); setTask(saved);
        if (publish) {
          const opened = await api.publishTask(task.id); setTask(opened);
        }
        await refresh();
        setFeedback(publish ? 'published' : 'saved'); setScreen('feedback');
      })}
      locationsScreen={() => { setLocationsReturn('edit'); setScreen('locations'); }}
      back={() => { setError(''); setScreen('list'); }} /></View>}
    {screen === 'detail' && task && <><TaskDetailScreen contextName={context.name} postedByYou={task.createdBy === viewerId} task={task} locations={locations} busy={busy} viewOffers={() => setScreen('offers')}
      edit={() => { setError(''); setScreen('edit'); }}
      cancel={() => { setError(''); setCancelOpen(true); }}
      back={() => { setError(''); setScreen('list'); }} />
      {helper && task.createdBy !== viewerId && task.status !== 'DRAFT' && <CircleOfferPanel key={task.id} task={task} disabled={busy} />}
      <Disclosure title="Writing assistant"><AiSummaryPanel key={task.id} task={task} disabled={busy} /></Disclosure></>}
    {screen === 'offers' && task && <OffersWorkspace task={task} taskId={task.id} back={() => void run(async () => { setTask(await api.getTask(task.id)); await refresh(); setScreen('detail'); })} />}
    {screen === 'locations' && <LocationsScreen locations={locations} busy={busy}
      create={body => void run(async () => {
        const location = await api.createLocation(context.id, body);
        setLocations(current => [...current, location]);
        setScreen(locationsReturn);
      })}
      back={() => { setError(''); setScreen(locationsReturn); }} />}
  </>;
}
