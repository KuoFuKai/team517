import { FormSelect, ScheduleChooser } from '../components/FormSelect';
import { SegmentedControl } from '../components/SegmentedControl';
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
  const [assistantMode, setAssistantMode] = useState<'TEXT' | 'TRANSCRIPT'>('TEXT');
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
    {!assistantOpen && <View style={{ backgroundColor: theme.colors.primarySoft, borderRadius: 12, padding: 14, gap: 12 }}><Text style={{ fontWeight: '600', fontSize: 18 }}>Start with your voice or notes</Text><Text>Tell AI what you need. You can review every field before posting.</Text><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title="Describe by voice" disabled={busy} onPress={() => { setAssistantMode('TRANSCRIPT'); setAssistantOpen(true); }} /></View><View style={{ flex: 1 }}><Button title="Organize notes" disabled={busy} onPress={() => { setAssistantMode('TEXT'); setAssistantOpen(true); }} /></View></View></View>}
    {assistantOpen && <Button variant="quiet" title="Back to manual form" disabled={busy} onPress={() => setAssistantOpen(false)} />}
    {assistantOpen && <AiAssistantPanel close={() => setAssistantOpen(false)} initialMode={assistantMode} task={task} disabled={requestBusy} onBusy={setAiBusy} apply={async (fields, sourceVersion) => {
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
    {!assistantOpen && <>
    {input('Task name', title, setTitle, 120)}
    {input('Type of help', helpType, setHelpType, 80)}
    <ScheduleChooser start={startAt} end={endAt} changeStart={setStartAt} changeEnd={setEndAt} disabled={busy} />
    <FormSelect label="Location" value={locationId} options={[{ value: '', label: 'Choose a location' }, ...locations.map(value => ({ value: value.id, label: value.label }))]} change={setLocationId} disabled={busy}><Button variant="quiet" title="Manage locations" onPress={locationsScreen} disabled={busy} /></FormSelect>
    {input('What should the caregiver do?', publicInstructions, setPublicInstructions, 2000, true)}
    <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Keep addresses, access codes and private health details out of public instructions.</Text>
    <FormSelect label="How soon is help needed?" value={urgency} options={[{ value: 'PLANNED', label: 'Planned' }, { value: 'URGENT', label: 'Urgent' }]} change={setUrgency} disabled={busy} />
    <Text style={{ fontSize: 13.5, color: theme.colors.muted, fontWeight: '600' }}>Who can help?</Text>
    <SegmentedControl value={compensationType ?? 'NONE'} options={[{ value: 'VOLUNTEER', label: 'Volunteer' }, { value: 'POINTS', label: 'Points' }, { value: 'PAID', label: 'Paid caregiver' }]} disabled={busy} onChange={value => { if (value !== 'NONE') setCompensation(value); }} />
    {compensationType === 'POINTS' && input('Point reward', points, setPoints, 12)}
    {compensationType === 'PAID' && <>{input('Cash amount (major currency units)', cash, setCash, 12)}{input('Currency (three uppercase letters)', currency, setCurrency, 3)}</>}
    <FormSelect label="Who can see it" value={visibility} options={[{ value: 'CARE_CIRCLE', label: 'Care circle only' }, { value: 'VERIFIED_HELPERS', label: 'Care circle + verified caregivers' }]} change={setVisibility} disabled={busy} />
    <Disclosure title="Private arrival details">{input('Confirmed helper only', privateInstructions, setPrivateInstructions, 2000, true)}{(task.instructions || instructions) && input('Existing private circle notes', instructions, setInstructions, 5000, true)}</Disclosure>
    {formError ? <Text accessibilityRole="alert">{formError}</Text> : null}
    <View style={{ gap: 10, marginTop: 12 }}><Button variant="primary" disabled={busy} title="Post task" onPress={() => submit(true)} /><Button disabled={busy} title="Save draft" onPress={() => submit(false)} /></View>
    <Button disabled={busy} variant="quiet" title="Cancel editing" onPress={back} /></>}
  </>;
}
