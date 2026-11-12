import { taskWhenLabel } from '../utils/design-presentation';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { CalendarTaskDto } from '@team517/contracts';
import { Text } from './ui';
import { theme as t } from '../theme';
import { dateLabel, personLabel, statusLabel } from '../utils/presentation';
export function CalendarTaskRow({ task, busy, open }: { task: CalendarTaskDto; busy: boolean; open: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open calendar task: ${task.title || 'Your task'}`} disabled={busy} accessibilityState={{ disabled: busy }} onPress={open} style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}><View style={s.content}><Text style={s.title}>{task.title || 'Your task'}</Text><Text style={s.time}>{taskWhenLabel(task.startAt, task.endAt)}</Text><Text style={[s.status, task.status === 'HAS_OFFERS' && { color: t.colors.warning }]}>{statusLabel(task.status)}{task.helperId && task.roleInTask === 'REQUESTER' ? ' · ' + personLabel(task.helperId) : ''}</Text></View><Feather name="chevron-right" size={18} color={t.colors.ink} /></Pressable>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border }, content: { flex: 1, gap: 3 }, title: { fontSize: 18, lineHeight: 24, color: t.colors.ink, fontWeight: '600' }, time: { fontSize: 14, lineHeight: 20, color: t.colors.muted }, status: { fontSize: 14, lineHeight: 20, color: t.colors.primary } });
