import { Card } from '../components/ui';
import { friendlyError, fieldLabel, validationSummary } from '../utils/presentation';
import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { TaskDetailDto, TaskDraftFields, TaskDraftSuggestionDto } from '@team517/contracts';
import * as api from '../api/client';
import { ApiClientError } from '../api/transport';

function appTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
}
interface Props {
  task: TaskDetailDto;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
  apply: (fields: TaskDraftFields, sourceVersion: string) => Promise<void>;
}
export function AiAssistantPanel({ task, disabled, onBusy, apply }: Props) {
  const [mode, setMode] = useState<'TEXT' | 'TRANSCRIPT'>('TEXT');
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
  return <>
    <Text accessibilityRole="header">AI input assistant — optional</Text>
    <Text>Uses the last saved draft. Save manual changes first. Review every proposed value; AI never publishes.</Text>
    <Button disabled={locked} title="Describe with AI" onPress={() => { setMode('TEXT'); setSuggestion(null); }} />
    <Button disabled={locked} title="Voice input / manual transcript fallback" onPress={() => { setMode('TRANSCRIPT'); setReviewed(false); setSuggestion(null); }} />
    {mode === 'TRANSCRIPT' && <Text>Speech recording/transcription is not configured. Enter or paste a transcript, review it, then generate a suggestion. No audio is recorded or uploaded.</Text>}
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
    {busy && <ActivityIndicator accessibilityLabel="AI request in progress" />}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {suggestion && <Card>
      <Text accessibilityRole="header">Your draft suggestion · {suggestion.providerMode}</Text>
      {suggestion.providerMode === 'MOCK' && <Text>Explicit deterministic development mock, not a real AI result.</Text>}
      {suggestion.summary && <Text>Derived summary: {suggestion.summary}</Text>}
      {suggestion.locationText && <Text>Location wording: {suggestion.locationText}. Confirm the selected location.</Text>}
      <Text>Fields needing completion/review: {suggestion.missingFields.map(fieldLabel).join(', ') || 'None detected; still review before publishing.'}</Text>
      {suggestion.warnings.map((warning, index) => <Text key={index}>{warning}</Text>)}
      {Object.entries(suggestion.fields).map(([key, value]) => <View key={key}>
        <Text selectable>{fieldLabel(key)}: {value === null ? '(clear)' : String(value)}</Text>
        <Button disabled={locked} title={`${selected.includes(key) ? '✓ Accept' : 'Skip'} ${fieldLabel(key)}`}
          onPress={() => setSelected(current => current.includes(key) ? current.filter(field => field !== key) : [...current, key])} />
      </View>)}
      <Button disabled={locked || !selected.length} title="Apply selected fields" onPress={() => void run(async () => {
        if (!suggestion.sourceTaskUpdatedAt) throw new Error('Suggestion has no draft version. Generate it again.');
        const fields = Object.fromEntries(Object.entries(suggestion.fields).filter(([key]) => selected.includes(key))) as TaskDraftFields;
        await apply(fields, suggestion.sourceTaskUpdatedAt);
        setSuggestion(null); setText(''); setReviewed(false);
      })} />
      <Button disabled={locked} title="Discard suggestion" onPress={() => { setSuggestion(null); setError(''); }} />
    </Card>}
  </>;
}
const styles = StyleSheet.create({ input: { borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 6 }, error: { color: theme.colors.error } });
