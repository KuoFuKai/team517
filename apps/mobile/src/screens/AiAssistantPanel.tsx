import Feather from '@expo/vector-icons/Feather';
import { PageHeading } from '../components/ui';
import { taskWhenLabel, compensationLabel } from '../utils/design-presentation';
import { dateLabel, statusLabel } from '../utils/presentation';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { TonePanel, Disclosure } from '../components/Details';
import { Card } from '../components/ui';
import { friendlyError, fieldLabel, validationSummary } from '../utils/presentation';
import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Pressable } from 'react-native';
import type { TaskDetailDto, TaskDraftFields, TaskDraftSuggestionDto } from '@team517/contracts';
import * as api from '../api/client';
import { ApiClientError } from '../api/transport';

function appTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
}
interface Props {
  close?: () => void;
  initialMode?: 'TEXT' | 'TRANSCRIPT';
  task: TaskDetailDto;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
  apply: (fields: TaskDraftFields, sourceVersion: string) => Promise<void>;
}
export function AiAssistantPanel({ task, disabled, onBusy, apply, initialMode = 'TEXT', close }: Props) {
  const [previewReview, setPreviewReview] = useState(false);
  const [mode, setMode] = useState<'TEXT' | 'TRANSCRIPT'>(initialMode);
  const [text, setText] = useState('');
  const [timezone, setTimezone] = useState(appTimezone);
  const [reviewed, setReviewed] = useState(false);
  const [suggestion, setSuggestion] = useState<TaskDraftSuggestionDto | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const run = async (work: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); onBusy(true); setError('');
    try { await work(); }
    catch (failure) {
      const message = friendlyError(failure);
      const fields = failure instanceof ApiClientError ? validationSummary(failure.fields) : '';
      setError(message + (fields ? '\n' + fields : ''));
    }
    finally { inFlight.current = false; setBusy(false); onBusy(false); }
  };
  const locked = busy || disabled;
  useScreenHeader({ title: suggestion || previewReview ? 'Review AI draft' : 'Describe your task', back: () => { if (previewReview) setPreviewReview(false); else if (suggestion) setSuggestion(null); else close?.(); }, disabled: locked, priority: 4 });
  useScreenTop(suggestion || previewReview ? 'suggestion-review' : 'assistant-input');
  useHardwareBack(() => { if (!suggestion && !previewReview) return false; if (!locked) { setSuggestion(null); setPreviewReview(false); } return true; }, 4);
  if (previewReview) return <DraftReviewPreview task={task} close={() => setPreviewReview(false)} />;
  return <>
    {!suggestion && <><PageHeading title={mode === 'TRANSCRIPT' ? 'Voice input preview' : 'Organize your notes'} />
    <Text>Uses the last saved draft. Save manual changes first. Review every proposed value; AI never publishes.</Text>
    <SegmentedControl value={mode} options={[{ value: 'TEXT', label: 'Notes' }, { value: 'TRANSCRIPT', label: 'Transcript' }]} disabled={locked} onChange={value => { setMode(value); setReviewed(false); setSuggestion(null); }} />
    {mode === 'TRANSCRIPT' && <><View style={{ alignItems: 'center', paddingVertical: 20 }}><View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Feather name="mic" size={44} color={theme.colors.surface} /></View></View><Text>Type or paste your transcript below.</Text></>}
    <TextInput multiline accessibilityLabel={mode === 'TEXT' ? 'AI description or editing instruction' : 'Manual transcript'}
      placeholder={mode === 'TEXT' ? 'Describe a task, or say Make it urgent / Make this clearer' : 'Paste a transcript here'}
      maxLength={5000} value={text} editable={!locked} onChangeText={value => { setText(value); setReviewed(false); setSuggestion(null); }} />
    <Text>Explicit timezone for review</Text>
    <TextInput accessibilityLabel="AI timezone" maxLength={80} value={timezone} editable={!locked}
      onChangeText={value => { setTimezone(value); setSuggestion(null); }} />
    {mode === 'TRANSCRIPT' && <Button disabled={locked || !text.trim()} title={reviewed ? 'Transcript reviewed' : 'Use reviewed transcript'} onPress={() => setReviewed(true)} />}
    <Button disabled={locked || !text.trim() || (mode === 'TRANSCRIPT' && !reviewed)} title="Generate suggestion for review" onPress={() => void run(async () => {
      setSuggestion(null);
      const proposed = await api.improveTaskSuggestion(task.id, { text, timezone });
      setSuggestion(proposed); setSelected(Object.keys(proposed.fields));
    })} />
    <Button variant="quiet" disabled={locked} title="Review saved draft" onPress={() => setPreviewReview(true)} /></>}{busy && <ActivityIndicator accessibilityLabel="AI request in progress" />}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {suggestion && <>
      <PageHeading title="Your task is organized" caption="Check the details before applying them." />
      {suggestion.providerMode === 'MOCK' && <Text>Explicit deterministic development mock, not a real AI result.</Text>}
      {suggestion.summary && <Text>Derived summary: {suggestion.summary}</Text>}
      {suggestion.locationText && <Text>Location wording: {suggestion.locationText}. Confirm the selected location.</Text>}
      <Text>Fields needing completion/review: {suggestion.missingFields.map(fieldLabel).join(', ') || 'None detected; still review before publishing.'}</Text>
      {suggestion.warnings.map((warning, index) => <Text key={index}>{warning}</Text>)}
      {suggestionGroups(suggestion.fields).map(group => <Card key={group.title}><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>{group.title}</Text>{group.keys.map(key => <Pressable key={key} accessibilityRole="checkbox" accessibilityLabel={`Accept ${fieldLabel(key)}`} accessibilityState={{ checked: selected.includes(key), disabled: locked }} disabled={locked} onPress={() => setSelected(current => current.includes(key) ? current.filter(field => field !== key) : [...current, key])} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}><View style={{ flex: 1, gap: 3 }}>{group.keys.length > 1 && <Text style={{ fontSize: 12, color: theme.colors.muted }}>{fieldLabel(key)}</Text>}<Text style={{ fontWeight: '600' }}>{suggestedValue(key, suggestion.fields[key as keyof TaskDraftFields], suggestion.locationText)}</Text></View><Feather name={selected.includes(key) ? 'check-square' : 'square'} size={20} color={theme.colors.primary} /></Pressable>)}</Card>)}
      <Button disabled={locked || !selected.length} variant="primary" title="Apply selected fields" onPress={() => void run(async () => {
        if (!suggestion.sourceTaskUpdatedAt) throw new Error('Suggestion has no draft version. Generate it again.');
        const fields = Object.fromEntries(Object.entries(suggestion.fields).filter(([key]) => selected.includes(key))) as TaskDraftFields;
        await apply(fields, suggestion.sourceTaskUpdatedAt);
        setSuggestion(null); setText(''); setReviewed(false);
      })} />
      <Button disabled={locked} title="Discard suggestion" onPress={() => { setSuggestion(null); setError(''); }} />
    </>}
  </>;
}
const styles = StyleSheet.create({ input: { borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 6 }, error: { color: theme.colors.error } });

function suggestionGroups(fields: TaskDraftFields) {
  const definitions = [{ title: 'Task', keys: ['title', 'helpType'] }, { title: 'When', keys: ['startAt', 'endAt'] }, { title: 'Caregiver', keys: ['compensationType'] }, { title: 'Budget', keys: ['pointReward', 'cashAmount', 'currency'] }, { title: 'Instructions', keys: ['publicInstructions', 'privateInstructions', 'instructions'] }, { title: 'Location', keys: ['locationId'] }, { title: 'Other details', keys: ['urgency', 'visibility'] }];
  return definitions.map(group => ({ ...group, keys: group.keys.filter(key => key in fields) })).filter(group => group.keys.length);
}
function suggestedValue(key: string, value: unknown, location?: string) {
  if (value === null) return 'Clear this value';
  if (key === 'startAt' || key === 'endAt') return dateLabel(String(value));
  if (key === 'locationId') return location || 'Selected care-circle location';
  if (['compensationType', 'urgency', 'visibility'].includes(key)) return statusLabel(String(value));
  return String(value);
}
function DraftReviewPreview({ task, close }: { task: TaskDetailDto; close: () => void }) {
  return <><PageHeading title="Review your saved draft" />{[{ title: 'Task', value: task.title || 'Untitled draft' }, { title: 'When', value: taskWhenLabel(task.startAt, task.endAt) }, { title: 'Caregiver', value: task.compensationType ? statusLabel(task.compensationType) : 'Not selected' }, { title: 'Budget', value: compensationLabel(task) }, { title: 'Instructions', value: task.publicInstructions || 'No public instructions yet' }].map(field => <Card key={field.title}><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>{field.title}</Text><Text style={{ fontSize: 18, fontWeight: '600' }}>{field.value}</Text></Card>)}<Button variant="primary" title="Apply to task" disabled /><Button variant="quiet" title="Keep editing notes" onPress={close} /></>;
}
