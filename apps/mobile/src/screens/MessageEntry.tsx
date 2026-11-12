import React, { useRef, useState } from 'react';
import * as api from '../api/client';
import { Button, ErrorState } from '../components/ui';
import { friendlyError } from '../utils/presentation';
import { ConversationModal } from '../components/ConversationModal';
export function MessageEntry({ taskId, careContextId, otherUserId }: { taskId?: string; careContextId?: string; otherUserId?: string }) {
  const [id, setId] = useState<string | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  if (id) return <ConversationModal key={id} id={id} close={() => setId(null)} />;
  return <><Button title="Message" disabled={busy} onPress={() => {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    const start = taskId ? api.startTaskConversation(taskId, otherUserId) : api.getOrCreateConversation({ scope: 'CARE_CONTEXT', careContextId: careContextId!, otherUserId: otherUserId! });
    void start.then(result => setId(result.conversation.id)).catch(e => setError(friendlyError(e))).finally(() => { lock.current = false; setBusy(false); });
  }} />{error ? <ErrorState message={error} /> : null}</>;
}
