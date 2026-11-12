import { friendlyError } from '../utils/presentation';
import { Button, Text } from '../components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import type { AiTaskSummaryDto, TaskDetailDto } from '@team517/contracts';
import * as api from '../api/client';

export function AiSummaryPanel({ task, disabled }: { task: TaskDetailDto; disabled: boolean }) {
  const [summary, setSummary] = useState<AiTaskSummaryDto | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const version = useRef(task.updatedAt);
  version.current = task.updatedAt;
  useEffect(() => { setSummary(null); setError(''); }, [task.id, task.updatedAt]);
  return <>
    <Button disabled={disabled || busy} title="Generate derived AI summary" onPress={() => {
      if (inFlight.current) return;
      inFlight.current = true; setBusy(true); setError(''); setSummary(null);
      void api.summarizeTask(task.id).then(result => {
        if (result.taskUpdatedAt !== version.current) throw new Error('Task changed. Request a new summary.');
        setSummary(result);
      }).catch(failure => setError(friendlyError(failure)))
        .finally(() => { inFlight.current = false; setBusy(false); });
    }} />
    {busy && <ActivityIndicator accessibilityLabel="Generating summary" />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {summary && <>
      <Text>Derived summary · {summary.providerMode} · not authoritative</Text>
      <Text>{summary.summary}</Text>
      {summary.warnings.map((warning, index) => <Text key={index}>{warning}</Text>)}
      <Text>Generated {summary.generatedAt} for task version {summary.taskUpdatedAt}</Text>
    </>}
  </>;
}
