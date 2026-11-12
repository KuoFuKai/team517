import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { View, Pressable } from 'react-native';
import type { TaskSummaryDto } from '@team517/contracts';
import { Card, Text, Button, StatusBadge, Avatar } from './ui';
import { dateLabel, personLabel } from '../utils/presentation';
import { theme as t } from '../theme';
export function TaskPreviewCard({ title, status, when, detail, busy, open, action = 'View task', children }: React.PropsWithChildren<{ title: string; status: string; when?: string; detail?: string; busy: boolean; open: () => void; action?: string }>) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${action}: ${title}`} disabled={busy} onPress={open} style={({ pressed }) => ({ opacity: pressed || busy ? .6 : 1 })}><Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={{ flex: 1, fontSize: 18, lineHeight: 24, fontWeight: '600', color: t.colors.ink }}>{title}</Text><Feather name="chevron-right" size={18} color={t.colors.muted} /></View><Text style={{ fontSize: 13.5 }}>{when || 'Time to be arranged'}</Text>{detail ? <Text style={{ fontSize: 13.5, color: t.colors.muted }}>{detail}</Text> : null}<StatusBadge status={status} />{children}</Card></Pressable>;
}
export function TaskCard({ task, busy, open }: { task: TaskSummaryDto; busy: boolean; open: () => void }) {
  return <TaskPreviewCard status={task.status} title={task.title || 'Untitled draft'} when={dateLabel(task.startAt)} busy={busy} open={open} />;
}
export function ProfileCard({ helperId, children }: React.PropsWithChildren<{ helperId: string }>) { return <Card><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Avatar label="Helper" /><View><Text accessibilityRole="header">{personLabel(helperId)}</Text><Text>Profile name not shared</Text></View></View>{children}</Card>; }
export const OfferCard = ProfileCard;
