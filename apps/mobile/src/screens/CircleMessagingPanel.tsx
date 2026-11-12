import React, { useRef, useState } from 'react';
import type { MessagingMembersDto } from '@team517/contracts';
import * as api from '../api/client';
import { Button, Text, Card, ErrorState, EmptyState } from '../components/ui';
import { friendlyError } from '../utils/presentation';
import { MessageEntry } from './MessageEntry';
export function CircleMessagingPanel({ careContextId }: { careContextId: string }) {
  const [data, setData] = useState<MessagingMembersDto | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  return <><Button title="View circle members to message" disabled={busy} onPress={() => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); void api.listMessagingMembers(careContextId).then(setData).catch(e => setError(friendlyError(e))).finally(() => { lock.current = false; setBusy(false); }); }} />
    {data?.members.length === 0 && <EmptyState title="No other active members" />}{data?.members.map(m => <Card key={m.id}><Text>{m.label}</Text><MessageEntry careContextId={careContextId} otherUserId={m.id} /></Card>)}
    {data?.truncated && <Text>Showing 50 members.</Text>}{error ? <ErrorState message={error} /> : null}
  </>;
}
