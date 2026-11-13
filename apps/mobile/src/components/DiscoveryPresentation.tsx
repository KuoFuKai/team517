import { PreviewContentCover } from './PreviewContentCover';
import React from 'react';
import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { TaskDiscoveryItemDto } from '@team517/contracts';
import { Card, Text } from './ui';
import { theme as t } from '../theme';
import { taskWhenLabel, compensationLabel, discoveryAreaLabel } from '../utils/design-presentation';
export function FilterPill({ title, press, disabled }: { title: string; press: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={press} style={{ minHeight: 44, justifyContent: 'center' }}><View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: t.colors.primarySoft }}><Text style={{ fontSize: 13.5, lineHeight: 20, color: t.colors.primary }}>{title}</Text></View></Pressable>;
}
export function DiscoveryTaskCard({ task, open, busy }: { task: TaskDiscoveryItemDto; open: () => void; busy: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open discovery detail: ${task.title}`} disabled={busy} onPress={open}><Card><PreviewContentCover kind="task" id={task.id} height={152} /><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink, flex: 1 }}>{task.title}</Text><Feather name="chevron-right" size={18} color={t.colors.ink} /></View><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{taskWhenLabel(task.startAt, task.endAt)}{task.distanceKm !== undefined ? ` · about ${task.distanceKm} km` : ''}</Text>{task.distanceKm === undefined && <Text style={{ fontSize: 13.5, color: t.colors.muted }}>{discoveryAreaLabel(task.approximateLocation.areaLabel)}</Text>}<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={{ fontSize: 13.5, fontWeight: '600', color: t.colors.primary }}>{compensationLabel(task)}</Text><Text style={{ fontSize: 13.5, color: task.urgency === 'URGENT' ? t.colors.error : t.colors.muted }}>{task.urgency === 'URGENT' ? 'Urgent' : 'Planned'}</Text></View></Card></Pressable>;
}
