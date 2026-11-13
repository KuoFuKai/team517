import { PreviewContentCover } from '../components/PreviewContentCover';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { TaskSummaryDto } from '@team517/contracts';
import { Text, Button, EmptyState } from '../components/ui';
import { SegmentedControl } from '../components/SegmentedControl';
import { Choices } from '../components/Details';
import { taskWhenLabel } from '../utils/design-presentation';
import { groupTasks, taskRowNote, type TaskListFilter } from '../utils/task-groups';
import { theme as t } from '../theme';
export function TasksListScreen({ tasks, busy, open, post, refresh, calendar, locations }: { tasks: TaskSummaryDto[]; busy: boolean; open: (id: string) => void; post: () => void; refresh: () => void; calendar: () => void; locations: () => void }) {
  const [filter, setFilter] = useState<TaskListFilter>('current'), [showOptions, setShowOptions] = useState(false);
  const groups = groupTasks(tasks, filter);
  return <>
    <SegmentedControl value="status" disabled={busy} options={[{ value: 'calendar', label: 'Calendar' }, { value: 'status', label: 'By status' }]} onChange={value => { if (value === 'calendar') calendar(); }} />
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: t.colors.muted }}>{filter === 'current' ? 'Review offers and track help.' : filter === 'drafts' ? 'Your saved task drafts.' : 'Your past tasks.'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Task options" accessibilityState={{ expanded: showOptions, disabled: busy }} disabled={busy} onPress={() => setShowOptions(!showOptions)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Feather name="more-horizontal" size={22} color={t.colors.primary} /></Pressable></View>
    {showOptions && <View style={{ borderWidth: 1, borderColor: t.colors.border, borderRadius: 12, backgroundColor: t.colors.surface, padding: 12, gap: 8 }}><Choices value={filter} disabled={busy} options={[{ value: 'current', label: 'Active' }, { value: 'drafts', label: 'Drafts' }, { value: 'history', label: 'History' }]} change={value => { setFilter(value); setShowOptions(false); }} /><Button variant="quiet" disabled={busy} title="Refresh tasks" onPress={refresh} /><Button variant="quiet" disabled={busy} title="Locations" onPress={locations} /><Button variant="quiet" disabled={busy} title="Post a task" onPress={post} /></View>}
    {!busy && !groups.length && <EmptyState title={filter === 'drafts' ? 'No drafts yet' : filter === 'history' ? 'Nothing here yet' : 'A clear day ahead'} message={filter === 'current' ? 'Post a task when you need a hand.' : 'Your tasks will appear here.'} />}
    {groups.map(group => <View key={group.title} style={s.group}><Text style={s.groupTitle}>{group.title} · {group.tasks.length}</Text>{group.tasks.map(task => <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={`Open task: ${task.title || 'Untitled draft'}`} accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => open(task.id)} style={({ pressed }) => [s.row, pressed && { opacity: .65 }]}><PreviewContentCover kind="task" id={task.id} thumbnail /><View style={{ flex: 1, gap: 5 }}><Text style={s.title}>{task.title || 'Untitled draft'}</Text><Text style={s.when}>{taskWhenLabel(task.startAt)}</Text>{taskRowNote(task) && <Text style={[s.note, task.status === 'HAS_OFFERS' && { color: t.colors.warning }, task.status === 'OPEN' && task.urgency === 'URGENT' && { color: t.colors.error }]}>{taskRowNote(task)}</Text>}</View><Feather name="chevron-right" size={18} color={t.colors.ink} /></Pressable>)}</View>)}
  </>;
}
const s = StyleSheet.create({ group: { gap: 4, marginTop: 4 }, groupTitle: { color: t.colors.muted, fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 4 }, row: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 88, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.border }, title: { color: t.colors.ink, fontWeight: '600', fontSize: 18, lineHeight: 24 }, when: { color: t.colors.muted, fontSize: 16, lineHeight: 22 }, note: { color: t.colors.primary, fontSize: 16, lineHeight: 22 } });
