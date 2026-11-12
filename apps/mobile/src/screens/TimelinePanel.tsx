import React, { useRef, useState } from 'react';
import type { TaskTimelineDto } from '@team517/contracts';
import * as api from '../api/client';
import { Text, Button, Card, EmptyState, LoadingState, ErrorState, SectionHeader } from '../components/ui';
import { friendlyError, dateLabel } from '../utils/presentation';
export function TimelinePanel({ taskId }: { taskId: string }) {
  const [data, setData] = useState<TaskTimelineDto | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false); const lock = useRef(false);
  return <><SectionHeader title="Task activity" /><Button variant="quiet" disabled={busy} title={data ? 'Refresh activity' : 'View activity'} onPress={() => {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    void api.getTaskTimeline(taskId).then(setData).catch(e => setError(friendlyError(e))).finally(() => { lock.current = false; setBusy(false); });
  }} />{busy && <LoadingState />}
    {data?.events.length === 0 && <EmptyState title="No activity yet" />}
    {data?.events.map((event, i) => <Card key={i}><Text>{event.label}</Text><Text>{dateLabel(event.createdAt)}</Text></Card>)}
    {data?.truncated && <Text>Showing recent activity.</Text>}{error ? <ErrorState message={error} /> : null}
  </>;
}
