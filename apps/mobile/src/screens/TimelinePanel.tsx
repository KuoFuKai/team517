import { View } from 'react-native';
import React, { useRef, useState } from 'react';
import type { TaskTimelineDto } from '@team517/contracts';
import * as api from '../api/client';
import { Text, Button, Card, EmptyState, LoadingState, ErrorState, SectionHeader } from '../components/ui';
import { friendlyError, dateLabel } from '../utils/presentation';
export function TimelinePanel({ taskId, compact = false }: { taskId: string; compact?: boolean }) {
  const [data, setData] = useState<TaskTimelineDto | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false); const lock = useRef(false);
  return <>{!compact && <SectionHeader title="Task activity" />}<Button variant="quiet" disabled={busy} title={data ? 'Refresh activity' : 'View activity'} onPress={() => {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    void api.getTaskTimeline(taskId).then(setData).catch(e => setError(friendlyError(e))).finally(() => { lock.current = false; setBusy(false); });
  }} />{busy && <LoadingState />}
    {data?.events.length === 0 && <EmptyState title="No activity yet" />}
    {data?.events.map((event, i) => <View key={i} style={{ borderLeftWidth: 2, borderColor: '#087F79', paddingLeft: 14, paddingVertical: 8, gap: 3 }}><Text style={{ fontWeight: '600' }}>{event.label}</Text><Text style={{ fontSize: 12 }}>{dateLabel(event.createdAt)}</Text></View>)}
    {data?.truncated && <Text>Showing recent activity.</Text>}{error ? <ErrorState message={error} /> : null}
  </>;
}
