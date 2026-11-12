import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { MessagingMembersDto } from '@team517/contracts';
import * as api from '../api/client';
import { Button, Text, Avatar, ErrorState, EmptyState, LoadingState } from '../components/ui';
import { friendlyError } from '../utils/presentation';
import { MessageEntry } from './MessageEntry';
import { theme as t } from '../theme';
export function CircleMessagingPanel({ careContextId }: { careContextId: string }) {
  const [data, setData] = useState<MessagingMembersDto | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  const load = async () => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { setData(await api.listMessagingMembers(careContextId)); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { let active = true; setData(null); setBusy(true); void api.listMessagingMembers(careContextId).then(result => { if (active) setData(result); }).catch(e => { if (active) setError(friendlyError(e)); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, [careContextId]);
  return <>{busy && <LoadingState />}{data && <Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>Family & friends · {data.members.length}</Text>}<Text style={{ fontSize: 13.5, color: t.colors.muted }}>Your trusted care circle.</Text>{data?.members.length === 0 && <EmptyState title="No other active members" />}{data?.members.map(m => <View key={m.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 14, borderBottomWidth: .5, borderColor: t.colors.border }}><Avatar label={m.label} /><View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 18, fontWeight: '600' }}>{m.label}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>Care-circle member</Text></View><MessageEntry compact label={`Message ${m.label}`} careContextId={careContextId} otherUserId={m.id} /></View>)}{data?.truncated && <Text>Showing 50 members.</Text>}{error ? <ErrorState message={error} /> : null}<Button variant="quiet" title="Refresh members" disabled={busy} onPress={() => void load()} /></>;
}
