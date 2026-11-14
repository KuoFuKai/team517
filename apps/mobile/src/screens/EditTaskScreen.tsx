import * as pointApi from '../api/client';
import { Disclosure } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { ResponsiveActions } from '../components/ResponsiveActions';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../components/ui';
import { theme as t } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import { SegmentedControl } from '../components/SegmentedControl';
import { DateField, Field, FooterActions, LocationField, OptionCard, SelectField, TimeField } from '../components/FormControls';
import { formatDateLabel, joinLocalDateTime, shiftDay, splitLocalDateTime } from '../utils/datetime';

import type { TaskDetailDto, TaskDraftFields, LocationDto, TaskUrgency, TaskVisibility, TaskCompensationType } from '@team517/contracts';
import { AiAssistantPanel } from './AiAssistantPanel';

// Presentation suggestions for the free-text helpType field. The contract is unchanged:
// any value already on the draft is kept and shown, and "Something else" writes free text.
const HELP_TYPES = ['Clinic companion', 'Transport & rides', 'Errands & shopping', 'Meals & cooking', 'Home help', 'Company & check-in'];
const OTHER = 'OTHER';

interface Props {
  task: TaskDetailDto; locations: LocationDto[]; busy: boolean;
  save: (fields: TaskDraftFields, publish: boolean) => void; locationsScreen: () => void; back: () => void;
  applyAi: (fields: TaskDraftFields, sourceVersion: string) => Promise<void>;
}
// Post a task / Edit draft, composed to the Figma frame "3. post" (4:185).
// Timing is entered as a local date plus two clock times and converted to the
// ISO instants the API already expects; nothing about the contract changed.
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
  const [freeHelpType, setFreeHelpType] = useState(() => Boolean(task.helpType) && !HELP_TYPES.includes(task.helpType!));
  const [publicInstructions, setPublicInstructions] = useState(task.publicInstructions ?? '');
  const [privateInstructions, setPrivateInstructions] = useState(task.privateInstructions ?? '');
  const [instructions, setInstructions] = useState(task.instructions ?? '');
  const start = splitLocalDateTime(task.startAt), end = splitLocalDateTime(task.endAt);
  const [date, setDate] = useState(start?.date ?? '');
  const [startTime, setStartTime] = useState(start?.time ?? '');
  const [endTime, setEndTime] = useState(end?.time ?? '');
  const [endDate, setEndDate] = useState(end?.date ?? '');
  const [locationId, setLocationId] = useState(task.locationId ?? '');
  const [urgency, setUrgency] = useState<TaskUrgency>(task.urgency ?? 'PLANNED');
  const [visibility, setVisibility] = useState<TaskVisibility>(task.visibility ?? 'CARE_CIRCLE');
  const [compensationType, setCompensation] = useState<TaskCompensationType | undefined>(task.compensationType);
  const [availablePoints,setAvailablePoints] = useState<number | null>(null);
  useEffect(()=>{let active=true;void Promise.all([pointApi.getPointAccount(),pointApi.getCurrentUser()]).then(([value,user])=>{if(active && user.id===task.createdBy)setAvailablePoints(value.availablePoints);}).catch(()=>{});return()=>{active=false;};},[task.id]);
  const [points, setPoints] = useState(task.pointReward?.toString() ?? '');
  const [cash, setCash] = useState(task.cashAmount?.toString() ?? '');
  const [currency, setCurrency] = useState(task.currency ?? '');
  const [formError, setFormError] = useState('');
  // urgency and visibility start on a real value rather than undefined so the
  // preselected control matches what a save would write. CARE_CIRCLE is the
  // narrowest audience, so defaulting it cannot widen who sees a task.

  // One date drives both ends. An end at or before the start runs past local midnight.
  const resolvedEndDate = endDate && endDate !== date ? endDate : !date || !startTime || !endTime ? date : endTime > startTime ? date : shiftDay(date, 1) ?? date;

  const applyDate = (next: string) => {
    setDate(next);
    setEndDate(current => current && current !== date ? current : next);
  };
  // The assistant returns instants; split them back into the fields on screen.
  // Only the keys it actually sent are touched, so other edits survive.
  const applyLocalTimes = (fields: TaskDraftFields) => {
    const nextStart = splitLocalDateTime(fields.startAt), nextEnd = splitLocalDateTime(fields.endAt);
    if ('startAt' in fields) { setDate(nextStart?.date ?? ''); setStartTime(nextStart?.time ?? ''); }
    if ('endAt' in fields) { setEndDate(nextEnd?.date ?? ''); setEndTime(nextEnd?.time ?? ''); }
  };

  // Local wall-clock input can be impossible (a daylight-saving gap) or
  // inconsistent (end before start), and neither is worth a round trip.
  // Everything else, including whether a draft is complete enough to publish,
  // stays the server's decision.
  const submit = (publish: boolean) => {
    const startAt = date && startTime ? joinLocalDateTime(date, startTime, task.startAt) : null;
    const endAt = resolvedEndDate && endTime ? joinLocalDateTime(resolvedEndDate, endTime, task.endAt) : null;
    if ((date && startTime && !startAt) || (resolvedEndDate && endTime && !endAt)) {
      setFormError('That time does not exist on the day you picked — a daylight saving change skips it. Choose another time.'); return;
    }
    if ((date && !startTime) || (startTime && !date)) { setFormError('Pick both a date and a start time, or leave the timing to be arranged.'); return; }
    if (endAt && startAt && Date.parse(endAt) <= Date.parse(startAt)) { setFormError('The end time has to come after the start time.'); return; }
    const pointReward = compensationType === 'POINTS' && points.trim() ? Number(points) : null;
    const cashAmount = compensationType === 'PAID' && cash.trim() ? Number(cash) : null;
    if ((pointReward !== null && !Number.isFinite(pointReward)) || (cashAmount !== null && !Number.isFinite(cashAmount))) {
      setFormError('Enter a valid number for compensation.'); return;
    }
    setFormError('');
    save({ title: title.trim() || null, helpType: helpType.trim() || null, instructions: instructions.trim() || null, publicInstructions: publicInstructions.trim() || null, privateInstructions: privateInstructions.trim() || null,
      startAt, endAt,
      locationId: locationId || null, urgency, visibility,
      compensationType: compensationType ?? null, pointReward, cashAmount,
      currency: compensationType === 'PAID' && currency.trim() ? currency.trim().toUpperCase() : null }, publish);
  };

  return <View style={s.form}>

    {assistantOpen && <AiAssistantPanel close={() => setAssistantOpen(false)} initialMode={assistantMode} task={task} disabled={requestBusy} onBusy={setAiBusy} apply={async (fields, sourceVersion) => {
      await applyAi(fields, sourceVersion);
      // Only accepted fields replace local inputs. Other unsaved manual edits survive.
      if ('title' in fields) setTitle(fields.title ?? '');
      if ('helpType' in fields) { setHelpType(fields.helpType ?? ''); setFreeHelpType(Boolean(fields.helpType) && !HELP_TYPES.includes(fields.helpType!)); }
      if ('instructions' in fields) setInstructions(fields.instructions ?? '');
      applyLocalTimes(fields);
      if ('locationId' in fields) setLocationId(fields.locationId ?? '');
      if ('urgency' in fields) setUrgency(fields.urgency ?? 'PLANNED');
      if ('visibility' in fields) setVisibility(fields.visibility ?? 'CARE_CIRCLE');
      if ('compensationType' in fields) setCompensation(fields.compensationType ?? undefined);
      if ('pointReward' in fields) setPoints(fields.pointReward?.toString() ?? '');
      if ('cashAmount' in fields) setCash(fields.cashAmount?.toString() ?? '');
      if ('currency' in fields) setCurrency(fields.currency ?? '');
    }} />}
    {!assistantOpen && <>

    {/* Field order follows the frame: name, help type, when, where, urgency,
        then the public description. Arrival details and compensation have no
        counterpart in the design and are kept below it. */}
    <TextInput accessibilityLabel="Task name" value={title} onChangeText={setTitle} editable={!busy} maxLength={120} placeholder="Clinic visit with Mom" />

    <SelectField label="What do you need?" value={freeHelpType ? OTHER : helpType} placeholder="Choose the kind of help" disabled={busy}
      options={[...HELP_TYPES.map(value => ({ value, label: value })), { value: OTHER, label: 'Something else' }]}
      change={value => { if (value === OTHER) { setFreeHelpType(true); } else { setFreeHelpType(false); setHelpType(value); } }} />
    {freeHelpType && <TextInput accessibilityLabel="Describe the help you need" value={helpType} onChangeText={setHelpType} editable={!busy} maxLength={80} placeholder="For example, sorting the week's medication" />}

    <DateField label="Date" value={date} disabled={busy} change={applyDate} />
    <ResponsiveActions minimum={130}>
      <TimeField label="Start time" value={startTime} disabled={busy} change={setStartTime} />
      <TimeField label="End time" value={endTime} disabled={busy} change={setEndTime} />
    </ResponsiveActions>
    {resolvedEndDate && resolvedEndDate !== date ? <Text style={s.note}>Ends {formatDateLabel(resolvedEndDate)}.</Text> : null}

    <LocationField label="Where is help needed?" places={locations} value={locationId} disabled={busy} change={setLocationId} manage={locationsScreen} />

    <TextInput accessibilityLabel="What should the helper do?" hint="Keep addresses, access codes and medical details private."
      value={publicInstructions} onChangeText={setPublicInstructions} editable={!busy} maxLength={2000} multiline placeholder="Meet Mom in the clinic lobby, stay for her appointment, and ride home together. No medical care needed." />

    <Field label="Who can see it">
      <OptionCard title="Care circle only" selected={visibility === 'CARE_CIRCLE'} disabled={busy} choose={() => setVisibility('CARE_CIRCLE')} />
      <OptionCard title="Verified helpers" caption="People outside your circle see public information only." selected={visibility === 'VERIFIED_HELPERS'} disabled={busy} choose={() => setVisibility('VERIFIED_HELPERS')} />
    </Field>

    <Field label="How soon is help needed?">
      <SegmentedControl value={urgency ?? 'PLANNED'} disabled={busy} options={[{ value: 'PLANNED' as TaskUrgency, label: 'Planned' }, { value: 'URGENT' as TaskUrgency, label: 'Urgent' }]} onChange={setUrgency} />
    </Field>

    <TextInput accessibilityLabel="Arrival details" hint="Shared only with your confirmed helper." value={privateInstructions} onChangeText={setPrivateInstructions} editable={!busy} maxLength={2000} multiline placeholder="Door code, parking, who to ask for" />
    {(task.instructions || instructions) ? <TextInput accessibilityLabel="Existing private circle notes" value={instructions} onChangeText={setInstructions} editable={!busy} maxLength={5000} multiline /> : null}

    <Field label="How is help recognised?" hint="Points are reserved on publishing and sent after completion approval. Paid tasks show information only.">
      {([['VOLUNTEER', 'Volunteer'], ['POINTS', 'Points'], ['PAID', 'Paid']] as [TaskCompensationType, string][]).map(([value, label]) =>
        <OptionCard key={value} title={label} selected={compensationType === value} disabled={busy} choose={() => setCompensation(value)} />)}
    </Field>
    {compensationType === 'POINTS' && <><TextInput accessibilityLabel="Point reward" value={points} onChangeText={setPoints} editable={!busy} keyboardType="number-pad" maxLength={12} />{availablePoints !== null && <Text>Available balance: {availablePoints.toLocaleString()} points</Text>}<Text>Points are reserved from the task creator when this task is published.</Text></>}
    {compensationType === 'PAID' && <>
      <TextInput accessibilityLabel="Cash amount (major currency units)" value={cash} onChangeText={setCash} editable={!busy} maxLength={12} />
      <TextInput accessibilityLabel="Currency (three uppercase letters)" value={currency} onChangeText={setCurrency} editable={!busy} maxLength={3} />
    </>}

    {formError ? <Text accessibilityRole="alert">{formError}</Text> : null}
    {!assistantOpen && <Disclosure title="Writing assistant"><View style={{ backgroundColor: t.colors.primarySoft, borderRadius: 12, padding: 14, gap: 12 }}><Text accessibilityRole="header">Start with your voice or notes</Text><Text>Tell AI what you need. Review every field before posting.</Text><ResponsiveActions><Button title="Voice notes" accessibilityLabel="Add a voice transcript" disabled={busy} onPress={() => { setAssistantMode('TRANSCRIPT'); setAssistantOpen(true); }} /><Button title="Organize notes" disabled={busy} onPress={() => { setAssistantMode('TEXT'); setAssistantOpen(true); }} /></ResponsiveActions></View></Disclosure>}
    <FooterActions>
      <Button variant="secondary" disabled={busy} title="Save Draft" onPress={() => submit(false)} />
      <Button variant="primary" disabled={busy} title="Post request" onPress={() => submit(true)} />
    </FooterActions>
    <Button disabled={busy} variant="quiet" title="Back to tasks (discard unsaved edits)" onPress={back} />
    </>}
  </View>;
}
const s = StyleSheet.create({
  form: { gap: 14 },
  pair: { flexDirection: 'row', gap: 12 }, half: { flex: 1 },
  note: { marginTop: -12, fontSize: 13.5, lineHeight: 19.5, color: t.colors.muted },
});
