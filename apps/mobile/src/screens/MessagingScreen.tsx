import { messageTimeLabel } from '../utils/design-presentation';
import Feather from '@expo/vector-icons/Feather';
import { useScreenHeader } from '../components/ScreenHeader';
import { MenuRow, Action, TonePanel, IconAction, Disclosure } from '../components/Details';
import { Avatar } from '../components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import type { ConversationDetailDto, ConversationsDto, MessageDto } from '@team517/contracts';
import * as api from '../api/client';
import { auth } from '../auth/firebase';
import { Button, Text, TextInput, Card, SectionHeader, EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/ui';
import { friendlyError, dateLabel } from '../utils/presentation';
import { logicalSend, type PendingSend } from '../utils/messaging';
import { theme } from '../theme';
export function ConversationScreen({ id, back, backLabel = 'Back to inbox' }: { id: string; back: () => void; backLabel?: string }) {
  const [data, setData] = useState<ConversationDetailDto | null>(null), [messages, setMessages] = useState<MessageDto[]>([]), [before, setBefore] = useState<number | undefined>();
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [sending, setSending] = useState(false), [moreUnread, setMoreUnread] = useState(false);
  useScreenHeader({ title: data?.conversation.otherParticipant.label || 'Conversation', back, disabled: busy || sending, priority: 5 });
  const lock = useRef(false), pending = useRef<PendingSend | null>(null);
  const history = useRef<ScrollView>(null), historyPosition = useRef<'start' | 'end'>('end');
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); if ((e as { code?: string }).code === 'MESSAGING_RELATIONSHIP_INACTIVE') setData(current => current ? { ...current, conversation: { ...current.conversation, canSend: false } } : current); } finally { lock.current = false; setBusy(false); } };
  const load = async () => {
    // Mark the current server batch, then load a fresh snapshot for display.
    const read = await api.markConversationRead(id);
    const result = await api.getConversation(id); historyPosition.current = 'end'; setData(result); setMessages(result.messages.messages); setBefore(result.messages.nextBefore); setMoreUnread(read.truncated);

  };
  useEffect(() => { setData(null); setMessages([]); pending.current = null; setText(''); setComposerOpen(false); void run(load); }, [id]);
  useHardwareBack(() => { if (!busy && !sending) back(); return true; }, 5);
  return <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 24 }}><Text style={{ flex: 1, fontSize: 13.5, color: theme.colors.muted }}>Your conversation with {data?.conversation.otherParticipant.label || 'your circle'}</Text><IconAction disabled={busy} icon="refresh-cw" title="Refresh messages" onPress={() => void run(load)} /></View>
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {before !== undefined && <Button disabled={busy} title="Load older messages" onPress={() => void run(async () => { const page = await api.listMessages(id, before); historyPosition.current = 'start'; setMessages(current => [...page.messages, ...current]); setBefore(page.nextBefore); })} />}
    {data && !data.conversation.canSend && <TonePanel title="Read-only conversation">Your relationship has ended. Message history is still available, but new messages cannot be sent.</TonePanel>}
    {data && messages.length === 0 && <EmptyState title="Start with a hello" message="Text only. Please keep private medical and identity documents out of chat." />}
    {messages.length > 0 && <ScrollView ref={history} accessibilityLabel="Conversation message history" nestedScrollEnabled keyboardShouldPersistTaps="handled" style={s.history} contentContainerStyle={s.historyContent} onContentSizeChange={() => {
      if (historyPosition.current === 'end') history.current?.scrollToEnd({ animated: false });
      else history.current?.scrollTo({ y: 0, animated: false });
    }}>{messages.map(m => <View key={m.id} style={[s.bubble, m.senderId === auth.currentUser?.uid ? s.mine : s.theirs]}><Text>{m.text}</Text><Text style={s.time}>{m.senderId === auth.currentUser?.uid ? 'You' : data?.conversation.otherParticipant.label} · {dateLabel(m.createdAt)}</Text>{m.senderId === auth.currentUser?.uid && m.readAt && <Text style={s.time}>Read</Text>}</View>)}</ScrollView>}
    {moreUnread && <Button disabled={busy} title="Mark next unread batch" onPress={() => void run(async () => { const result = await api.markConversationRead(id); setMoreUnread(result.truncated); })} />}
    {data?.conversation.canSend && (!composerOpen ? <Button variant="outline" title="Write a message…" disabled={busy} onPress={() => setComposerOpen(true)} /> : <>    <View style={{ backgroundColor: theme.colors.surface, borderRadius: 16, padding: 10, gap: 8, flexDirection: 'row', alignItems: 'flex-end' }}><View style={{ flex: 1, minWidth: 0 }}><TextInput style={{ minHeight: 44, maxHeight: 120 }} accessibilityLabel="Message" placeholder={data?.conversation.canSend ? 'Write a message…' : 'Read-only history'} multiline maxLength={2000} value={text} onChangeText={setText} editable={!busy && Boolean(data?.conversation.canSend)} /></View>
    <Action icon="send" disabled={busy || !text.trim() || !data?.conversation.canSend} title={sending ? 'Sending…' : pending.current && pending.current.text === text.trim() ? 'Retry send' : 'Send'} onPress={() => void run(async () => {
      setSending(true);
      try { pending.current = logicalSend(pending.current, text); await api.sendMessage(id, pending.current); pending.current = null; setText(''); await load(); } finally { setSending(false); }
    })} />
    </View><Button variant="quiet" title="Hide message input" onPress={() => setComposerOpen(false)} disabled={busy} /></>)}

  </>;
}
export function MessagingScreen({ back, updates }: { back: () => void; updates?: () => void }) {
  const [data, setData] = useState<ConversationsDto | null>(null), [id, setId] = useState<string | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  useScreenTop(id ?? 'inbox');
  const load = async () => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { setData(await api.listConversations()); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { void load(); }, []);
  if (id) return <ConversationScreen key={id} id={id} back={() => { setId(null); void load(); }} />;
  return <>
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {!busy && data?.conversations.length === 0 && <EmptyState title="No conversations yet" message="Message a circle member or a helper/requester with an active task relationship." />}
    {data?.conversations.map(c => <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Conversation with ${c.otherParticipant.label}`} disabled={busy} onPress={() => setId(c.id)}><Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.ink, flex: 1 }}>{c.otherParticipant.label}</Text><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>{messageTimeLabel(c.lastMessageAt ?? c.createdAt)}</Text>{c.unreadCount > 0 && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.primary }} />}</View><Text numberOfLines={2} style={{ fontSize: 13.5, lineHeight: 19, color: theme.colors.muted }}>{c.canSend ? '' : 'Read-only · '}{c.lastMessagePreview || 'No messages yet'}</Text></Card></Pressable>)}
    {data?.truncated && <Text>Showing 50 recent conversations.</Text>}
    <Disclosure title="Inbox options"><Action icon="refresh-cw" disabled={busy} title="Refresh inbox" onPress={() => void load()} />{updates && <Action icon="bell" title="Task updates & notifications" onPress={updates} />}<Button variant="quiet" disabled={busy} title="Back" onPress={back} /></Disclosure>

  </>;
}
const s = StyleSheet.create({ history: { minHeight: 120, maxHeight: 300 }, historyContent: { gap: theme.space.md, paddingVertical: 4 }, bubble: { borderRadius: theme.radius.md, padding: 12, gap: 4, maxWidth: '84%', borderWidth: 1, borderColor: theme.colors.border }, mine: { alignSelf: 'flex-end', backgroundColor: theme.colors.primarySoft }, theirs: { alignSelf: 'flex-start', backgroundColor: theme.colors.surface }, time: { color: theme.colors.muted, fontSize: 13.5, lineHeight: 19 } });
