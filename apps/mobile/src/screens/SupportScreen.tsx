import { TaskDetailScreen } from './TaskDetailScreen';
import { VerificationPresentation } from './VerificationPresentation';
import { Action, MenuRow, Disclosure } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { ConversationScreen } from './MessagingScreen';
import { CalendarGrid } from '../components/CalendarGrid';
import { CalendarTaskRow } from '../components/CalendarTaskRow';
import { calendarDateLabel, calendarQuery, groupCalendarTasks, monthRange } from '../utils/calendar';
import { theme as t } from '../theme';
import { useScreenTop } from '../navigation/scroll';
import { resolvePushNotification } from '../push/resolve';
import { useHardwareBack } from '../navigation/useHardwareBack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { LocationDto, CalendarDto, CalendarTaskDto, NotificationsDto, AssignmentDto, TaskDetailDto, VerificationStatusDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { TimelinePanel } from './TimelinePanel';
import { OffersWorkspace } from './OffersWorkspace';
import { Button, Text, TextInput, Card, StatusBadge, EmptyState, LoadingState, ErrorState, SectionHeader, InfoRow } from '../components/ui';
import { friendlyError, dateLabel, localDateKey, deviceTimeZone, countLabel } from '../utils/presentation';
export function SupportScreen({ mode, back, onNotificationsLoaded, pushId, consumePush }: { mode: 'calendar' | 'notifications' | 'verification'; back: () => void; onNotificationsLoaded?: (unread: boolean) => void; pushId?: string | null; consumePush?: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<CalendarDto | null>(null), [notifications, setNotifications] = useState<NotificationsDto | null>(null), [verification, setVerification] = useState<VerificationStatusDto | null>(null);
  const [start, setStart] = useState(localDateKey(new Date())), [end, setEnd] = useState(localDateKey(new Date(Date.now() + 30 * 86400000))), [date, setDate] = useState(''), [rangeVisible, setRangeVisible] = useState(false);
  const [month, setMonth] = useState(localDateKey(new Date()).slice(0, 7));
  const [lastDay, setLastDay] = useState(localDateKey(new Date()));
  const [range, setRange] = useState(() => monthRange(localDateKey(new Date()).slice(0, 7)));
  const [calendarLoading, setCalendarLoading] = useState(false), [calendarError, setCalendarError] = useState(''), [calendarRefresh, setCalendarRefresh] = useState(0);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null), [task, setTask] = useState<TaskDetailDto | null>(null), [offersVisible, setOffersVisible] = useState(false);
  const [taskLocations, setTaskLocations] = useState<LocationDto[]>([]);
  useEffect(() => { let active = true; setTaskLocations([]); if (task) void api.listLocations(task.careContextId).then(result => { if (active) setTaskLocations(result.locations); }).catch(() => {}); return () => { active = false; }; }, [task?.id]);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''); const lock = useRef(false);
  useScreenHeader({ title: task || assignment ? 'Task details' : mode === 'verification' ? 'Verification' : mode === 'notifications' ? 'Notifications' : 'Your tasks', back: task || assignment ? () => { setTask(null); setAssignment(null); } : mode !== 'calendar' ? back : undefined, disabled: busy, priority: mode === 'calendar' && !task && !assignment ? -1 : 2 });
  useScreenTop(conversationId ?? (offersVisible ? 'offers' : assignment?.id ?? task?.id ?? mode));
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  const load = async () => {
    if (mode === 'notifications') { const list = await api.getNotifications(); setNotifications(list); onNotificationsLoaded?.(list.notifications.some(n => !n.readAt)); }
    if (mode === 'verification') setVerification(await api.getVerificationStatus());
  };
  const open = async (item: CalendarTaskDto) => { setTask(null); setAssignment(null); if (item.roleInTask === 'REQUESTER') setTask(await api.getTask(item.taskId)); if (item.assignmentId) setAssignment(await api.getAssignment(item.assignmentId)); };
  useEffect(() => { if (mode !== 'calendar') void run(load); }, [mode]);
  useEffect(() => {
    if (mode !== 'calendar') return;
    let active = true;
    const query = calendarQuery(range);
    if (!query) return;
    setCalendar(null); setCalendarLoading(true); setCalendarError('');
    void api.getCalendar(query).then(result => { if (active) setCalendar(result); }).catch(e => { if (active) setCalendarError(friendlyError(e)); }).finally(() => { if (active) setCalendarLoading(false); });
    return () => { active = false; };
  }, [mode, range.start, range.end, calendarRefresh]);
  const changeMonth = (value: string, selected = value + '-01') => {
    try { const next = monthRange(value); setMonth(value); setRange(next); setStart(next.start); setEnd(next.end); setDate(selected); setLastDay(selected); setCalendarError(''); }
    catch { setCalendarError('That month is outside the supported calendar range.'); }
  };
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
  }, 1);
  if (conversationId) return <ConversationScreen id={conversationId} backLabel="Back to notifications" back={() => setConversationId(null)} />;
  if (offersVisible && task) return <OffersWorkspace task={task} taskId={task.id} back={() => setOffersVisible(false)} />;
  if (task || assignment) return <>
    {assignment ? <><AssignmentPanel key={assignment.id} assignment={assignment} chooseAnother={async()=>setOffersVisible(true)} />{task && <Button title="View offers" onPress={() => setOffersVisible(true)} />}</> : task && <TaskDetailScreen task={task} locations={taskLocations} busy={busy} back={() => { setTask(null); setAssignment(null); }} viewOffers={() => setOffersVisible(true)} />}
    {error ? <ErrorState message={error} /> : null}
  </>;
  const groups = groupCalendarTasks(calendar?.tasks ?? []);
  const selectedDate = date === 'all' ? lastDay : date || lastDay;
  const visibleGroups = date === 'all' ? groups : groups.filter(group => group.date === selectedDate);
  const calendarBusy = busy || calendarLoading;
  return <>
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {mode === 'calendar' && <>
      <CalendarGrid month={month} selected={date === 'all' ? '' : selectedDate} range={range} taskCounts={new Map(groups.map(group => [group.date, group.tasks.length]))} busy={calendarBusy} changeMonth={changeMonth} select={value => { setDate(value); setLastDay(value); }} />
      {calendarLoading && <LoadingState label="Loading this calendar…" />}
      {calendarError ? <ErrorState message={calendarError} /> : null}
      {!calendarLoading && calendar && <>
        {date !== 'all' && <Text style={{ color: t.colors.ink, fontSize: 18, fontWeight: '600', marginTop: 8 }}>{calendarDateLabel(selectedDate)} · {countLabel(visibleGroups.reduce((count, group) => count + group.tasks.length, 0), 'task')}{calendar.truncated ? ' shown' : ''}</Text>}
        {!visibleGroups.length && <EmptyState title={date === 'all' ? 'A clear calendar' : calendar.truncated ? 'No loaded tasks on this day' : 'No tasks on this day'} message="Choose a marked date or another month to see scheduled tasks." />}
        {visibleGroups.map(group => <View key={group.date}>{date === 'all' && <Text style={{ color: t.colors.ink, fontSize: 18, fontWeight: '600', marginTop: 8 }}>{calendarDateLabel(group.date)} · {countLabel(group.tasks.length, 'task')}</Text>}{group.tasks.map(item => <CalendarTaskRow key={item.taskId} task={item} busy={calendarBusy} open={() => void run(() => open(item))} />)}</View>)}
      </>}
      <Text style={{ fontSize: 12, color: t.colors.muted }}>Times shown in {deviceTimeZone()}. Dots mark loaded tasks by start date.</Text>
      {calendar?.truncated && <Text>Showing a limited agenda. Narrow the date range to find more tasks.</Text>}
      <Disclosure title="Calendar options">      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}><Button variant="quiet" disabled={calendarBusy} title="Today" onPress={() => { const today = localDateKey(new Date()); changeMonth(today.slice(0, 7), today); }} /><Button variant="quiet" disabled={calendarBusy} title={date === 'all' ? 'Show selected day' : 'All loaded dates'} onPress={() => setDate(date === 'all' ? selectedDate : 'all')} /><Button variant="quiet" title={rangeVisible ? 'Hide date range' : 'Date range'} onPress={() => { if (!rangeVisible) { setStart(range.start); setEnd(range.end); } setRangeVisible(!rangeVisible); }} /></View>
      {rangeVisible && <Card><TextInput accessibilityLabel="From date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" /><TextInput accessibilityLabel="Until date (not included)" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" /><Button disabled={calendarBusy} title="Apply dates" onPress={() => { if (!calendarQuery({ start, end })) { setCalendarError('Choose an end date after the start, within 93 days. Use YYYY-MM-DD.'); return; } setRange({ start, end }); setMonth(start.slice(0, 7)); setDate('all'); setLastDay(start); setCalendarError(''); }} /></Card>}
<Button variant="quiet" disabled={calendarBusy} title="Refresh calendar" onPress={() => setCalendarRefresh(value => value + 1)} /></Disclosure>
    </>}
    {mode === 'notifications' && <>


      {!busy && notifications?.notifications.length === 0 && <EmptyState title="You’re all caught up" message="New offers and task updates will appear here." />}
      {notifications?.notifications.map(n => <View key={n.id}><MenuRow contained disabled={busy} title={n.title} subtitle={`${dateLabel(n.createdAt)} · ${n.body}`} trailing={!n.readAt ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.colors.primary }} /> : undefined} onPress={() => void run(async () => { await api.markNotificationRead(n.id); await load(); setTask(null); setAssignment(null); if (n.resourceType === 'CONVERSATION') setConversationId(n.resourceId); else if (n.resourceType === 'ASSIGNMENT') setAssignment(await api.getAssignment(n.resourceId)); else setTask(await api.getTask(n.resourceId)); })} /></View>)}
      {notifications?.truncated && <Text>Showing the most recent 50 updates.</Text>}<Text>These in-app updates remain available regardless of device push permission. Manage device notifications in Me.</Text>
      <Disclosure title="Notification options">      <Button disabled={busy} title="Mark all recent updates read" onPress={() => void run(async () => { const result = await api.markAllNotificationsRead(); await load(); if (result.truncated) setError('Only the most recent 200 updates were marked. Older unread updates may remain.'); })} /><Button variant="quiet" disabled={busy} title="Refresh notifications" onPress={() => void run(load)} /></Disclosure>
    </>}
    {mode === 'verification' && verification && <VerificationPresentation value={verification} back={back} />}

  </>;
}
