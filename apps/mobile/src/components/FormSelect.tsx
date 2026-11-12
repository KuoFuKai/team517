import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text, Card, Button } from './ui';
import { theme as t } from '../theme';
import { TaskDateTimeField } from './TaskDateTimeField';
import { parseTaskTime } from '../utils/task-time';
import { taskWhenLabel } from '../utils/design-presentation';
export function FieldTrigger({ label, value, press, disabled, icon = 'chevron-down' }: { label: string; value: string; press: () => void; disabled?: boolean; icon?: React.ComponentProps<typeof Feather>['name'] }) {
  return <View style={{ gap: 6 }}><Text style={{ fontSize: 13.5, color: t.colors.muted, fontWeight: '600' }}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={press} style={{ minHeight: 54, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.colors.surface, borderColor: t.colors.border, borderWidth: 1, borderRadius: 10 }}><Text style={{ flex: 1, fontSize: 17, lineHeight: 22 }}>{value}</Text><Feather name={icon} size={18} color={t.colors.primary} /></Pressable></View>;
}
export function FormSelect<T extends string>({ label, value, options, change, disabled, children }: React.PropsWithChildren<{ label: string; value?: T; options: { value: T; label: string }[]; change: (value: T) => void; disabled?: boolean }>) {
  const [open, setOpen] = useState(false);
  return <><FieldTrigger label={label} value={options.find(item => item.value === value)?.label || 'Choose an option'} press={() => setOpen(!open)} disabled={disabled} />{open && <Card>{options.map(item => <Button key={item.value} variant="quiet" title={(item.value === value ? '✓ ' : '') + item.label} disabled={disabled} onPress={() => { change(item.value); setOpen(false); }} />)}{children}</Card>}</>;
}
export function ScheduleChooser({ start, end, changeStart, changeEnd, disabled }: { start: string; end: string; changeStart: (value: string) => void; changeEnd: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><FieldTrigger label="Date and time" value={taskWhenLabel(parseTaskTime(start) ?? undefined, parseTaskTime(end) ?? undefined)} press={() => setOpen(!open)} disabled={disabled} icon="calendar" />{open && <Card><TaskDateTimeField label="Start time" value={start} change={changeStart} disabled={disabled} /><TaskDateTimeField label="End time" value={end} change={changeEnd} disabled={disabled} /><Button variant="quiet" title="Done choosing times" onPress={() => setOpen(false)} disabled={disabled} /></Card>}</>;
}
