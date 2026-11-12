import { TimelinePanel } from './TimelinePanel';
import React from 'react';
import type { TaskDetailDto, LocationDto } from '@team517/contracts';
import { Text, Button, Card, StatusBadge, InfoRow, SectionHeader } from '../components/ui';
import { dateLabel, statusLabel } from '../utils/presentation';
export function TaskDetailScreen({ task, locations, busy, edit, cancel, back }: { task: TaskDetailDto; locations: LocationDto[]; busy: boolean; edit: () => void; cancel: () => void; back: () => void }) {
  const location = locations.find(l => l.id === task.locationId);
  return <><Button variant="quiet" disabled={busy} title="Back to tasks" onPress={back} /><StatusBadge status={task.status} />
    <SectionHeader title={task.title || 'Untitled draft'} caption={task.helpType || 'Add a help type in your draft'} />
    {task.status === 'DRAFT' && <Button variant="primary" disabled={busy} title="Edit draft" onPress={edit} />}
    <Card><InfoRow label="When" value={dateLabel(task.startAt) + (task.endAt ? ' – ' + dateLabel(task.endAt) : '')} /><InfoRow label="Location" value={location ? location.label + ' · ' + location.formattedAddress : undefined} /><InfoRow label="Priority" value={task.urgency ? statusLabel(task.urgency) : undefined} /><InfoRow label="Who can offer" value={task.visibility ? statusLabel(task.visibility) : undefined} /></Card>
    {task.publicInstructions && <Card><Text accessibilityRole="header">About this task</Text><Text>{task.publicInstructions}</Text></Card>}
    {task.privateInstructions && <Card><Text accessibilityRole="header">Arrival details</Text><Text>Shared only with the current confirmed helper.</Text><Text>{task.privateInstructions}</Text></Card>}
    {task.instructions && <Card><Text accessibilityRole="header">Private circle notes</Text><Text>{task.instructions}</Text></Card>}
    <Card><InfoRow label="Compensation" value={task.compensationType ? `${statusLabel(task.compensationType)} ${task.pointReward ?? task.cashAmount ?? ''} ${task.currency ?? ''}` : undefined} /><Text>Displayed task details only. No payments or points are transferred here.</Text></Card>
    <TimelinePanel taskId={task.id} />
    {['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED'].includes(task.status) && <Button disabled={busy} title="Cancel task" onPress={cancel} />}
  </>;
}
