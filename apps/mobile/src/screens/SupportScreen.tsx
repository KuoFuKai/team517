import { ConversationScreen } from './MessagingScreen';
import { TaskPreviewCard } from '../components/Cards';
import { useScreenTop } from '../navigation/scroll';
import { resolvePushNotification } from '../push/resolve';
import { useHardwareBack } from '../navigation/useHardwareBack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { CalendarDto, CalendarTaskDto, NotificationsDto, AssignmentDto, TaskDetailDto, VerificationStatusDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { TimelinePanel } from './TimelinePanel';
import { OffersWorkspace } from './OffersWorkspace';
import { Button, Text, TextInput, Card, StatusBadge, EmptyState, LoadingState, ErrorState, SectionHeader, InfoRow } from '../components/ui';
import { friendlyError, statusLabel, personLabel, dateLabel, localDateKey, localDayInstant, deviceTimeZone } from '../utils/presentation';
export function SupportScreen({ mode, back, onNotificationsLoaded, pushId, consumePush }: { mode: 'calendar' | 'notifications' | 'verification'; back: () => void; onNotificationsLoaded?: (unread: boolean) => void; pushId?: string | null; consumePush?: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<CalendarDto | null>(null), [notifications, setNotifications] = useState<NotificationsDto | null>(null), [verification, setVerification] = useState<VerificationStatusDto | null>(null);
  const [start, setStart] = useState(localDateKey(new Date())), [end, setEnd] = useState(localDateKey(new Date(Date.now() + 30 * 86400000))), [date, setDate] = useState(''), [rangeVisible, setRangeVisible] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null), [task, setTask] = useState<TaskDetailDto | null>(null), [offersVisible, setOffersVisible] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  useScreenTop(conversationId ?? (offersVisible ? 'offers' : assignment?.id ?? task?.id ?? mode));
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  const load = async () => {
    if (mode === 'calendar') {
      const from = localDayInstant(start), until = localDayInstant(end);
      if (!from || !until || Date.parse(until) <= Date.parse(from) || Date.parse(until) - Date.parse(from) > 93 * 86400000) { setError('Choose an end date after the start, within 93 days. Use YYYY-MM-DD.'); return; }
      setCalendar(await api.getCalendar({ start: from, end: until })); setDate('');
    }
    if (mode === 'notifications') { const list = await api.getNotifications(); setNotifications(list); onNotificationsLoaded?.(list.notifications.some(n => !n.readAt)); }
    if (mode === 'verification') setVerification(await api.getVerificationStatus());
  };
  const open = async (item: CalendarTaskDto) => { setTask(null); setAssignment(null); if (item.roleInTask === 'REQUESTER') setTask(await api.getTask(item.taskId)); if (item.assignmentId) setAssignment(await api.getAssignment(item.assignmentId)); };
  useEffect(() => { void run(load); }, [mode]);
  useEffect(() => {
    if (!pushId || mode !== 'notifications') return;
    let active = true;
    setTask(null); setAssignment(null); setConversationId(null); setError('');
    // Resolve recipient-owned history first, then fetch current resource authority.
    void resolvePushNotification(pushId, api).then(result => {
      if (!active) return;
      if (result.kind === 'CONVERSATION') setConversationId(result.id);
      else if (result.kind === 'ASSIGNMENT') setAssignment(result.assignment);
      else setTask(result.task);
    }).catch(e => { if (active) setError(friendlyError(e)); }).finally(() => { if (active) consumePush?.(); });
    return () => { active = false; };
  }, [pushId, mode]);
  useHardwareBack(() => {
    if (conversationId) { if (!busy) setConversationId(null); return true; }
    if (offersVisible) { if (!busy) setOffersVisible(false); return true; }
    if (task || assignment) { if (!busy) { setTask(null); setAssignment(null); } return true; }
    return false;
  });
  if (conversationId) return <ConversationScreen id={conversationId} backLabel="Back to notifications" back={() => setConversationId(null)} />;
  if (offersVisible && task) return <OffersWorkspace taskId={task.id} back={() => setOffersVisible(false)} />;
  if (task || assignment) return <><Button disabled={busy} title="Back to list" onPress={() => { setTask(null); setAssignment(null); }} />
    {assignment && <AssignmentPanel key={assignment.id} assignment={assignment} />}
    {task && <><Card><StatusBadge status={task.status} /><Text accessibilityRole="header">{task.title}</Text><InfoRow label="When" value={dateLabel(task.startAt)} /><Text>{task.publicInstructions}</Text><Button title="View offers & arrangement" onPress={() => setOffersVisible(true)} /></Card><TimelinePanel taskId={task.id} /></>}
    {error ? <ErrorState message={error} /> : null}
  </>;
  const dates = [...new Set(calendar?.tasks.map(t => localDateKey(t.startAt)) ?? [])].sort();
  return <>
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {mode === 'calendar' && <>
      <SectionHeader title="Make space for what matters" caption={`Your upcoming tasks, in one place. Times shown in ${deviceTimeZone()}.`} />
      <Button variant="quiet" title={rangeVisible ? 'Hide date range' : 'Change date range'} onPress={() => setRangeVisible(!rangeVisible)} />
      {rangeVisible && <Card><TextInput accessibilityLabel="From date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" /><TextInput accessibilityLabel="Until date (not included)" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" /><Button disabled={busy} title="Apply dates" onPress={() => void run(load)} /></Card>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button title={(date === '' ? '✓ ' : '') + 'All dates'} onPress={() => setDate('')} />{dates.map(d => <Button key={d} title={(date === d ? '✓ ' : '') + d.slice(5)} onPress={() => setDate(d)} />)}</View>
      {!busy && calendar?.tasks.length === 0 && <EmptyState title="A clear calendar" message="Scheduled tasks you manage or are assigned to will appear here." />}
      {dates.filter(d => !date || d === date).map(d => <React.Fragment key={d}><SectionHeader title={d} />{calendar?.tasks.filter(t => localDateKey(t.startAt) === d).map(t => <TaskPreviewCard key={t.taskId} status={t.status} title={t.title || 'Your task'} when={`${dateLabel(t.startAt)} – ${dateLabel(t.endAt)}`} detail={`${t.roleInTask === 'HELPER' ? 'You are the helper' : 'You manage this task'}${t.helperId && t.roleInTask !== 'HELPER' ? ' · ' + personLabel(t.helperId) : ''}`} busy={busy} open={() => void run(() => open(t))} />)}</React.Fragment>)}
      {calendar?.truncated && <Text>Showing a limited agenda. Narrow the date range to find more tasks.</Text>}
    </>}
    {mode === 'notifications' && <>
      <SectionHeader title="Your updates" caption="Updates from the people and tasks you care about." />
      <Button disabled={busy} title="Mark all recent updates read" onPress={() => void run(async () => { const result = await api.markAllNotificationsRead(); await load(); if (result.truncated) setError('Only the most recent 200 updates were marked. Older unread updates may remain.'); })} />
      {!busy && notifications?.notifications.length === 0 && <EmptyState title="You’re all caught up" message="New offers and task updates will appear here." />}
      {notifications?.notifications.map(n => <Card key={n.id}><StatusBadge status={n.readAt ? 'READ' : 'UNREAD'} /><Text accessibilityRole="header">{n.title}</Text><Text>{dateLabel(n.createdAt)}</Text><Text>{n.body}</Text>
        {!n.readAt && <Button variant="quiet" disabled={busy} title="Mark as read" onPress={() => void run(async () => { await api.markNotificationRead(n.id); await load(); })} />}
        <Button disabled={busy} title="View update" onPress={() => void run(async () => { await api.markNotificationRead(n.id); await load(); setTask(null); setAssignment(null); if (n.resourceType === 'CONVERSATION') setConversationId(n.resourceId); else if (n.resourceType === 'ASSIGNMENT') setAssignment(await api.getAssignment(n.resourceId)); else setTask(await api.getTask(n.resourceId)); })} />
      </Card>)}
      {notifications?.truncated && <Text>Showing the most recent 50 updates.</Text>}<Text>These in-app updates remain available regardless of device push permission. Manage device notifications in Me.</Text>
    </>}
    {mode === 'verification' && verification && <Card><StatusBadge status={verification.status} /><Text accessibilityRole="header">{verification.canDiscover ? 'Ready to help beyond your circle' : 'Build trust, share support'}</Text><Text>{verification.canDiscover ? 'Your account can explore tasks shared with verified helpers.' : 'External task discovery requires a verified helper account. Trusted-circle tasks may still be available.'}</Text><Text>Identity check submission is not available in this version. Development accounts use explicitly seeded verification states.</Text></Card>}
    <Button variant="quiet" disabled={busy} title="Refresh" onPress={() => void run(load)} /><Button variant="quiet" disabled={busy} title="Back" onPress={back} />
  </>;
}
