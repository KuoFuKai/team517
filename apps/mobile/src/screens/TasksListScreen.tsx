import React, { useState } from 'react';
import { View } from 'react-native';
import type { TaskSummaryDto } from '@team517/contracts';
import { Text, Button, EmptyState, SectionHeader } from '../components/ui';
import { TaskCard } from '../components/Cards';
import { scheduledTime } from '../utils/presentation';
export function TasksListScreen({ tasks, busy, open, post, refresh }: { tasks: TaskSummaryDto[]; busy: boolean; open: (id: string) => void; post: () => void; refresh: () => void }) {
  const [filter, setFilter] = useState<'current' | 'drafts' | 'history'>('current');
  const visible = tasks.filter(t => filter === 'drafts' ? t.status === 'DRAFT' : filter === 'history' ? ['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(t.status) : !['DRAFT', 'COMPLETED', 'CANCELLED', 'DISPUTED'].includes(t.status));
  return <><SectionHeader title="Everyday support" caption="A little planning. A little help. More peace of mind." /><Button variant="primary" disabled={busy} title="Post a task" onPress={post} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['current', 'drafts', 'history'] as const).map(value => <Button key={value} disabled={busy} title={(filter === value ? '✓ ' : '') + value.charAt(0).toUpperCase() + value.slice(1)} onPress={() => setFilter(value)} />)}</View>
    {!busy && visible.length === 0 && <EmptyState title={filter === 'drafts' ? 'No drafts yet' : filter === 'history' ? 'Nothing here yet' : 'A clear day ahead'} message={filter === 'current' ? 'Post a task when you need a hand.' : 'Your tasks will appear here.'} />}
    {visible.slice().sort((a, b) => {
      const priority = (status: string) => status === 'COMPLETION_PENDING' ? 0 : status === 'HAS_OFFERS' ? 1 : 2;
      return priority(a.status) - priority(b.status) || scheduledTime(a.startAt) - scheduledTime(b.startAt);
    }).map(task => <TaskCard key={task.id} task={task} busy={busy} open={() => open(task.id)} />)}
    <Button variant="quiet" disabled={busy} title="Refresh tasks" onPress={refresh} />
  </>;
}
