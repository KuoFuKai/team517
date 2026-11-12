import React from 'react';
import { View } from 'react-native';
import type { TaskSummaryDto } from '@team517/contracts';
import { Card, Text, Button, StatusBadge, Avatar } from './ui';
import { dateLabel, personLabel } from '../utils/presentation';
import { theme as t } from '../theme';
export function TaskPreviewCard({ title, status, when, detail, busy, open, action = 'View task', children }: React.PropsWithChildren<{ title: string; status: string; when?: string; detail?: string; busy: boolean; open: () => void; action?: string }>) {
  return <Card><StatusBadge status={status} /><Text accessibilityRole="header" style={{ fontSize: t.type.section, lineHeight: 24 }}>{title}</Text><Text>{when || 'Time to be arranged'}</Text>{detail ? <Text>{detail}</Text> : null}{children}<Button title={action} disabled={busy} onPress={open} /></Card>;
}
export function TaskCard({ task, busy, open }: { task: TaskSummaryDto; busy: boolean; open: () => void }) {
  return <TaskPreviewCard status={task.status} title={task.title || 'Untitled draft'} when={dateLabel(task.startAt)} busy={busy} open={open} />;
}
export function ProfileCard({ helperId, children }: React.PropsWithChildren<{ helperId: string }>) { return <Card><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Avatar label="Helper" /><View><Text accessibilityRole="header">{personLabel(helperId)}</Text><Text>Profile name not shared</Text></View></View>{children}</Card>; }
export const OfferCard = ProfileCard;
