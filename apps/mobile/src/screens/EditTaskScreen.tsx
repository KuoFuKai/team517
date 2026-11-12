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
  const [title, setTitle] = useState(task.title ?? '');
  const [helpType, setHelpType] = useState(task.helpType ?? '');
  const [publicInstructions, setPublicInstructions] = useState(task.publicInstructions ?? '');
  const [privateInstructions, setPrivateInstructions] = useState(task.privateInstructions ?? '');
  const [instructions, setInstructions] = useState(task.instructions ?? '');
  const [startAt, setStartAt] = useState(task.startAt ?? '');
  const [endAt, setEndAt] = useState(task.endAt ?? '');
  const [locationId, setLocationId] = useState(task.locationId ?? '');
  const [urgency, setUrgency] = useState<TaskUrgency | undefined>(task.urgency);
  const [visibility, setVisibility] = useState<TaskVisibility | undefined>(task.visibility);
  const [compensationType, setCompensation] = useState<TaskCompensationType | undefined>(task.compensationType);
  const [points, setPoints] = useState(task.pointReward?.toString() ?? '');
  const [cash, setCash] = useState(task.cashAmount?.toString() ?? '');
  const [currency, setCurrency] = useState(task.currency ?? '');
  const [formError, setFormError] = useState('');
  const submit = (publish: boolean) => {
    if ((startAt && !Number.isFinite(Date.parse(startAt))) || (endAt && !Number.isFinite(Date.parse(endAt)))) {
      setFormError('Use a valid ISO date/time, for example 2026-12-01T14:00:00Z.'); return;
    }
    const pointReward = compensationType === 'POINTS' && points.trim() ? Number(points) : null;
    const cashAmount = compensationType === 'PAID' && cash.trim() ? Number(cash) : null;
    if ((pointReward !== null && !Number.isFinite(pointReward)) || (cashAmount !== null && !Number.isFinite(cashAmount))) {
      setFormError('Enter a valid number for compensation.'); return;
    }
    setFormError('');
    save({ title: title.trim() || null, helpType: helpType.trim() || null, instructions: instructions.trim() || null, publicInstructions: publicInstructions.trim() || null, privateInstructions: privateInstructions.trim() || null,
      startAt: startAt ? new Date(startAt).toISOString() : null, endAt: endAt ? new Date(endAt).toISOString() : null,
      locationId: locationId || null, urgency: urgency ?? null, visibility: visibility ?? null,
      compensationType: compensationType ?? null, pointReward, cashAmount,
      currency: compensationType === 'PAID' && currency.trim() ? currency.trim().toUpperCase() : null }, publish);
  };
  const input = (label: string, value: string, change: (text: string) => void, maxLength: number, multiline = false) => <>
    <TextInput accessibilityLabel={label} value={value} onChangeText={change} editable={!busy} maxLength={maxLength} multiline={multiline} />
  </>;
  return <>
    <Text accessibilityRole="header">Edit draft</Text>
    <Text>Save your progress at any time. Publish when you are ready to ask for help.</Text>
    <Button disabled={busy} title={assistantOpen ? 'Hide writing assistant' : 'Describe with AI · optional'} onPress={() => setAssistantOpen(!assistantOpen)} />
    {assistantOpen && <Card><AiAssistantPanel task={task} disabled={requestBusy} onBusy={setAiBusy} apply={async (fields, sourceVersion) => {
      await applyAi(fields, sourceVersion);
      // Only accepted fields replace local inputs. Other unsaved manual edits survive.
      if ('title' in fields) setTitle(fields.title ?? '');
      if ('helpType' in fields) setHelpType(fields.helpType ?? '');
      if ('instructions' in fields) setInstructions(fields.instructions ?? '');
      if ('startAt' in fields) setStartAt(fields.startAt ?? '');
      if ('endAt' in fields) setEndAt(fields.endAt ?? '');
      if ('locationId' in fields) setLocationId(fields.locationId ?? '');
      if ('urgency' in fields) setUrgency(fields.urgency ?? undefined);
      if ('visibility' in fields) setVisibility(fields.visibility ?? undefined);
      if ('compensationType' in fields) setCompensation(fields.compensationType ?? undefined);
      if ('pointReward' in fields) setPoints(fields.pointReward?.toString() ?? '');
      if ('cashAmount' in fields) setCash(fields.cashAmount?.toString() ?? '');
      if ('currency' in fields) setCurrency(fields.currency ?? '');
    }} /></Card>}
    <SectionHeader title="What do you need?" />
    {input('Title', title, setTitle, 120)}
    {input('Help type', helpType, setHelpType, 80)}
    <Text>Public details help people decide whether to offer. Arrival details are shared only with your confirmed helper. Keep addresses and access codes out of public details, and leave out medical records, diagnoses and medication lists.</Text>
    {input('Public details', publicInstructions, setPublicInstructions, 2000, true)}
    {input('Arrival details', privateInstructions, setPrivateInstructions, 2000, true)}
    {(task.instructions || instructions) && input('Existing private circle notes', instructions, setInstructions, 5000, true)}
    <SectionHeader title="When & where" caption="Enter a full date and time with timezone, e.g. 2026-12-01T14:00:00Z." />
    {input('Start time', startAt, setStartAt, 40)}
    {input('End time', endAt, setEndAt, 40)}
    <Text>Location</Text>
    {locations.map(location => <Button key={location.id} disabled={busy} title={(locationId === location.id ? '✓ ' : '') + location.label} onPress={() => setLocationId(location.id)} />)}
    <Button disabled={busy} title="Clear location" onPress={() => setLocationId('')} />
    <Button disabled={busy} title="Manage locations (save changes first)" onPress={locationsScreen} />
    <Text>Urgency</Text>
    {(['PLANNED', 'URGENT'] as TaskUrgency[]).map(value => <Button key={value} disabled={busy} title={(urgency === value ? '✓ ' : '') + value} onPress={() => setUrgency(value)} />)}
    <Text>Who can offer? Verified helpers outside your circle see public information only. Keep addresses and access details private.</Text>
    {(['CARE_CIRCLE', 'VERIFIED_HELPERS'] as TaskVisibility[]).map(value => <Button key={value} disabled={busy} title={(visibility === value ? '✓ ' : '') + value} onPress={() => setVisibility(value)} />)}
    <SectionHeader title="Compensation" caption="Task information only. No transfers are made here." />
    {(['VOLUNTEER', 'POINTS', 'PAID'] as TaskCompensationType[]).map(value => <Button key={value} disabled={busy} title={(compensationType === value ? '✓ ' : '') + value} onPress={() => setCompensation(value)} />)}
    {compensationType === 'POINTS' && input('Point reward', points, setPoints, 12)}
    {compensationType === 'PAID' && <>{input('Cash amount (major currency units)', cash, setCash, 12)}{input('Currency (three uppercase letters)', currency, setCurrency, 3)}</>}
    {formError ? <Text accessibilityRole="alert">{formError}</Text> : null}
    <Button disabled={busy} title="Save draft" onPress={() => submit(false)} />
    <Button disabled={busy} title="Save and publish task" onPress={() => submit(true)} />
    <Button disabled={busy} title="Back to tasks (discard unsaved edits)" onPress={back} />
  </>;
}
