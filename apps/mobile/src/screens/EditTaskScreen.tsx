import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { TaskDateTimeField } from '../components/TaskDateTimeField';
import { taskTimeInput, parseTaskTime, taskTimeValue } from '../utils/task-time';
import { deviceTimeZone } from '../utils/presentation';
import { View } from 'react-native';
import { useScreenHeader } from '../components/ScreenHeader';
import { Choices, Disclosure, TonePanel } from '../components/Details';
import { SectionHeader, Card } from '../components/ui';
import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useState } from 'react';

import type { TaskDetailDto, TaskDraftFields, LocationDto, TaskUrgency, TaskVisibility, TaskCompensationType } from '@team517/contracts';
import { AiAssistantPanel } from './AiAssistantPanel';

interface Props {
  task: TaskDetailDto; locations: LocationDto[]; busy: boolean;
  save: (fields: TaskDraftFields, publish: boolean) => void; locationsScreen: () => void; back: () => void;
  applyAi: (fields: TaskDraftFields, sourceVersion: string) => Promise<void>;
}
export function EditTaskScreen({ task, locations, busy: requestBusy, save, locationsScreen, back, applyAi }: Props) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const busy = requestBusy || aiBusy;
  useScreenHeader({ title: assistantOpen ? 'Task assistant' : task.title ? 'Edit task' : 'Post a task', back: assistantOpen ? () => setAssistantOpen(false) : back, disabled: busy, priority: 2 });
  useScreenTop(assistantOpen ? 'assistant' : 'editor');
  useHardwareBack(() => { if (!assistantOpen) return false; if (!busy) setAssistantOpen(false); return true; }, 3);
  const [title, setTitle] = useState(task.title ?? '');
  const [helpType, setHelpType] = useState(task.helpType ?? '');
  const [publicInstructions, setPublicInstructions] = useState(task.publicInstructions ?? '');
  const [privateInstructions, setPrivateInstructions] = useState(task.privateInstructions ?? '');
  const [instructions, setInstructions] = useState(task.instructions ?? '');
  const [startAt, setStartAt] = useState(taskTimeInput(task.startAt));
  const [endAt, setEndAt] = useState(taskTimeInput(task.endAt));
  const [locationId, setLocationId] = useState(task.locationId ?? '');
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(task.urgency);
  const [visibility, setVisibility] = useState<TaskVisibility | undefined>(task.visibility);
  const [compensationType, setCompensation] = useState<TaskCompensationType | undefined>(task.compensationType);
  const [points, setPoints] = useState(task.pointReward?.toString() ?? '');
  const [cash, setCash] = useState(task.cashAmount?.toString() ?? '');
  const [currency, setCurrency] = useState(task.currency ?? '');
  const [formError, setFormError] = useState('');
  const submit = (publish: boolean) => {
    if ((startAt && !parseTaskTime(startAt)) || (endAt && !parseTaskTime(endAt))) {
      setFormError('Use a valid local date and time: YYYY-MM-DD HH:mm, for example 2026-12-01 14:00.'); return;
    }
    const pointReward = compensationType === 'POINTS' && points.trim() ? Number(points) : null;
    const cashAmount = compensationType === 'PAID' && cash.trim() ? Number(cash) : null;
    if ((pointReward !== null && !Number.isFinite(pointReward)) || (cashAmount !== null && !Number.isFinite(cashAmount))) {
      setFormError('Enter a valid number for compensation.'); return;
    }
    setFormError('');
    save({ title: title.trim() || null, helpType: helpType.trim() || null, instructions: instructions.trim() || null, publicInstructions: publicInstructions.trim() || null, privateInstructions: privateInstructions.trim() || null,
      startAt: startAt ? taskTimeValue(startAt, task.startAt) : null, endAt: endAt ? taskTimeValue(endAt, task.endAt) : null,
      locationId: locationId || null, urgency: urgency ?? null, visibility: visibility ?? null,
      compensationType: compensationType ?? null, pointReward, cashAmount,
      currency: compensationType === 'PAID' && currency.trim() ? currency.trim().toUpperCase() : null }, publish);
  };
  const input = (label: string, value: string, change: (text: string) => void, maxLength: number, multiline = false) => <>
    <TextInput accessibilityLabel={label} value={value} onChangeText={change} editable={!busy} maxLength={maxLength} multiline={multiline} />
  </>;
  return <>
    {!assistantOpen && <TonePanel title="Let’s make care a little easier">Describe what you need, or use the optional writing assistant.</TonePanel>}
    <Button disabled={busy} title={assistantOpen ? 'Back to manual form' : 'Describe with AI · optional'} onPress={() => setAssistantOpen(!assistantOpen)} />
    {assistantOpen && <AiAssistantPanel task={task} disabled={requestBusy} onBusy={setAiBusy} apply={async (fields, sourceVersion) => {
      await applyAi(fields, sourceVersion);
      // Only accepted fields replace local inputs. Other unsaved manual edits survive.
      if ('title' in fields) setTitle(fields.title ?? '');
      if ('helpType' in fields) setHelpType(fields.helpType ?? '');
      if ('instructions' in fields) setInstructions(fields.instructions ?? '');
      if ('startAt' in fields) setStartAt(taskTimeInput(fields.startAt));
      if ('endAt' in fields) setEndAt(taskTimeInput(fields.endAt));
      if ('locationId' in fields) setLocationId(fields.locationId ?? '');
      if ('urgency' in fields) setUrgency(fields.urgency ?? undefined);
      if ('visibility' in fields) setVisibility(fields.visibility ?? undefined);
      if ('compensationType' in fields) setCompensation(fields.compensationType ?? undefined);
      if ('pointReward' in fields) setPoints(fields.pointReward?.toString() ?? '');
      if ('cashAmount' in fields) setCash(fields.cashAmount?.toString() ?? '');
      if ('currency' in fields) setCurrency(fields.currency ?? '');
    }} />}
    {!assistantOpen && <><SectionHeader title="What do you need?" />
    {input('Title', title, setTitle, 120)}
    {input('Help type', helpType, setHelpType, 80)}
    <Text style={{ fontSize: 12, color: theme.colors.muted }}>Public details are visible to potential helpers. Keep addresses, access codes and private health details out.</Text>
    {input('Public details', publicInstructions, setPublicInstructions, 2000, true)}
    <Disclosure title="Private arrival details">{input('Arrival details · confirmed helper only', privateInstructions, setPrivateInstructions, 2000, true)}</Disclosure>
    {(task.instructions || instructions) && input('Existing private circle notes', instructions, setInstructions, 5000, true)}
    <SectionHeader title="When & where" caption={`Times shown in ${deviceTimeZone()}`} />
    <TaskDateTimeField label="Start time" value={startAt} change={setStartAt} disabled={busy} />
    <TaskDateTimeField label="End time" value={endAt} change={setEndAt} disabled={busy} />
    <Text style={{ fontWeight: '600' }}>Location</Text>
    <Choices value={locationId} disabled={busy} options={[{ value: '', label: 'Not selected' }, ...locations.map(location => ({ value: location.id, label: location.label }))]} change={setLocationId} />
    <Button variant="quiet" disabled={busy} title="Manage locations (save changes first)" onPress={locationsScreen} />
    <SectionHeader title="Priority" />
    <Choices value={urgency} options={[{ value: 'PLANNED', label: 'Planned' }, { value: 'URGENT', label: 'Urgent' }]} disabled={busy} change={setUrgency} />
    <SectionHeader title="Who can offer?" caption="External helpers see an approximate area until you confirm an arrangement." />
    <Choices value={visibility} options={[{ value: 'CARE_CIRCLE', label: 'My care circle' }, { value: 'VERIFIED_HELPERS', label: 'Verified helpers' }]} disabled={busy} change={setVisibility} />
    <SectionHeader title="Compensation" caption="Displayed details only. No payments or points are transferred." />
    <Choices value={compensationType} options={[{ value: 'VOLUNTEER', label: 'Volunteer' }, { value: 'POINTS', label: 'Points' }, { value: 'PAID', label: 'Paid' }]} disabled={busy} change={setCompensation} />
    {compensationType === 'POINTS' && input('Point reward', points, setPoints, 12)}
    {compensationType === 'PAID' && <>{input('Cash amount (major currency units)', cash, setCash, 12)}{input('Currency (three uppercase letters)', currency, setCurrency, 3)}</>}
    {formError ? <Text accessibilityRole="alert">{formError}</Text> : null}
    <View style={{ gap: 10, marginTop: 12 }}><Button variant="primary" disabled={busy} title="Save and publish task" onPress={() => submit(true)} /><Button disabled={busy} title="Save draft" onPress={() => submit(false)} /></View>
    <Button disabled={busy} title="Back to tasks (discard unsaved edits)" onPress={back} /></>}
  </>;
}
