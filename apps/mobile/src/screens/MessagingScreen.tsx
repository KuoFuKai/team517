import React, { useEffect, useRef, useState } from 'react';
import { useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { ConversationDetailDto, ConversationsDto, MessageDto } from '@team517/contracts';
import * as api from '../api/client';
import { auth } from '../auth/firebase';
import { Button, Text, TextInput, Card, SectionHeader, EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/ui';
import { friendlyError, dateLabel } from '../utils/presentation';
import { logicalSend, type PendingSend } from '../utils/messaging';
import { theme } from '../theme';
export function ConversationScreen({ id, back, backLabel = 'Back to inbox' }: { id: string; back: () => void; backLabel?: string }) {
  const [data, setData] = useState<ConversationDetailDto | null>(null), [messages, setMessages] = useState<MessageDto[]>([]), [before, setBefore] = useState<number | undefined>();
  const [text, setText] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [sending, setSending] = useState(false), [moreUnread, setMoreUnread] = useState(false);
  const lock = useRef(false), pending = useRef<PendingSend | null>(null);
  const history = useRef<ScrollView>(null), historyPosition = useRef<'start' | 'end'>('end');
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); if ((e as { code?: string }).code === 'MESSAGING_RELATIONSHIP_INACTIVE') setData(current => current ? { ...current, conversation: { ...current.conversation, canSend: false } } : current); } finally { lock.current = false; setBusy(false); } };
  const load = async () => {
    // Mark the current server batch, then load a fresh snapshot for display.
    const read = await api.markConversationRead(id);
    const result = await api.getConversation(id); historyPosition.current = 'end'; setData(result); setMessages(result.messages.messages); setBefore(result.messages.nextBefore); setMoreUnread(read.truncated);

  };
  useEffect(() => { setData(null); setMessages([]); pending.current = null; setText(''); void run(load); }, [id]);
  useHardwareBack(() => { if (!busy && !sending) back(); return true; });
  return <><Button disabled={busy} title={backLabel} onPress={back} /><SectionHeader title={data?.conversation.otherParticipant.label || 'Conversation'} caption={data?.conversation.scope === 'TASK' ? 'About your task relationship' : 'Care-circle conversation'} />
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    <Button disabled={busy} title="Refresh messages" onPress={() => void run(load)} />
    {before !== undefined && <Button disabled={busy} title="Load older messages" onPress={() => void run(async () => { const page = await api.listMessages(id, before); historyPosition.current = 'start'; setMessages(current => [...page.messages, ...current]); setBefore(page.nextBefore); })} />}
    {data && !data.conversation.canSend && <Card><Text>This conversation is read-only. Your current relationship no longer permits new messages. History stays available to its two participants.</Text></Card>}
    {data && messages.length === 0 && <EmptyState title="Start with a hello" message="Text only. Please keep private medical and identity documents out of chat." />}
    {messages.length > 0 && <ScrollView ref={history} accessibilityLabel="Conversation message history" nestedScrollEnabled keyboardShouldPersistTaps="handled" style={s.history} contentContainerStyle={s.historyContent} onContentSizeChange={() => {
      if (historyPosition.current === 'end') history.current?.scrollToEnd({ animated: false });
      else history.current?.scrollTo({ y: 0, animated: false });
    }}>{messages.map(m => <View key={m.id} style={[s.bubble, m.senderId === auth.currentUser?.uid ? s.mine : s.theirs]}><Text>{m.text}</Text><Text style={s.time}>{m.senderId === auth.currentUser?.uid ? 'You' : data?.conversation.otherParticipant.label} · {dateLabel(m.createdAt)}</Text>{m.senderId === auth.currentUser?.uid && m.readAt && <Text style={s.time}>Read</Text>}</View>)}</ScrollView>}
    {moreUnread && <Button disabled={busy} title="Mark next unread batch" onPress={() => void run(async () => { const result = await api.markConversationRead(id); setMoreUnread(result.truncated); })} />}
    <TextInput accessibilityLabel="Message" placeholder={data?.conversation.canSend ? 'Write a message…' : 'Read-only history'} multiline maxLength={2000} value={text} onChangeText={setText} editable={!busy && Boolean(data?.conversation.canSend)} />
    <Button variant="primary" disabled={busy || !text.trim() || !data?.conversation.canSend} title={sending ? 'Sending…' : pending.current && pending.current.text === text.trim() ? 'Retry send' : 'Send message'} onPress={() => void run(async () => {
      setSending(true);
      try { pending.current = logicalSend(pending.current, text); await api.sendMessage(id, pending.current); pending.current = null; setText(''); await load(); } finally { setSending(false); }
    })} />
    <Text>Refresh to load current messages. Device alerts follow your notification settings. A failed send keeps its retry ID while the text is unchanged.</Text>
  </>;
}
export function MessagingScreen({ back, updates }: { back: () => void; updates?: () => void }) {
  const [data, setData] = useState<ConversationsDto | null>(null), [id, setId] = useState<string | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  useScreenTop(id ?? 'inbox');
  const load = async () => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { setData(await api.listConversations()); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { void load(); }, []);
  if (id) return <ConversationScreen key={id} id={id} back={() => { setId(null); void load(); }} />;
  return <><SectionHeader title="Inbox" caption="Your one-to-one conversations." />{updates && <Button title="Task updates & notifications" onPress={updates} />}
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {!busy && data?.conversations.length === 0 && <EmptyState title="No conversations yet" message="Message a circle member or a helper/requester with an active task relationship." />}
    {data?.conversations.map(c => <Card key={c.id}><Text accessibilityRole="header">{c.otherParticipant.label}</Text><Text>{c.scope === 'TASK' ? 'Task conversation' : 'Care-circle conversation'}{c.canSend ? '' : ' · Read-only'}</Text><Text>{c.lastMessagePreview || 'No messages yet'}</Text><Text>{dateLabel(c.lastMessageAt ?? c.createdAt)}</Text>{c.unreadCount > 0 && <Text>{c.unreadCount} unread</Text>}<Button disabled={busy} title="Open conversation" onPress={() => setId(c.id)} /></Card>)}
    {data?.truncated && <Text>Showing 50 recent conversations.</Text>}<Button disabled={busy} title="Refresh inbox" onPress={() => void load()} /><Button disabled={busy} title="Back" onPress={back} />
  </>;
}
const s = StyleSheet.create({ history: { maxHeight: 320 }, historyContent: { gap: theme.space.md, paddingVertical: 4 }, bubble: { borderRadius: theme.radius.md, padding: theme.space.lg, gap: 4, maxWidth: '90%', borderWidth: 1, borderColor: theme.colors.border }, mine: { alignSelf: 'flex-end', backgroundColor: theme.colors.primarySoft }, theirs: { alignSelf: 'flex-start', backgroundColor: theme.colors.surface }, time: { color: theme.colors.muted, fontSize: theme.type.caption } });
