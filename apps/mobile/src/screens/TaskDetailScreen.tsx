import { useScreenHeader } from '../components/ScreenHeader';
import { Disclosure, TonePanel } from '../components/Details';
import { TimelinePanel } from './TimelinePanel';
import React from 'react';
import type { TaskDetailDto, LocationDto } from '@team517/contracts';
import { Text, Button, Card, StatusBadge, InfoRow, SectionHeader } from '../components/ui';
import { dateLabel, statusLabel } from '../utils/presentation';
export function TaskDetailScreen({ task, locations, busy, edit, cancel, back, viewOffers }: { task: TaskDetailDto; locations: LocationDto[]; busy: boolean; edit: () => void; cancel: () => void; back: () => void; viewOffers?: () => void }) {
  useScreenHeader({ title: 'Task details', back, disabled: busy, priority: 2 });
  const location = locations.find(l => l.id === task.locationId);
  return <><StatusBadge status={task.status} />
    <SectionHeader title={task.title || 'Untitled draft'} caption={task.helpType || 'Add a help type in your draft'} />
    {task.status === 'HAS_OFFERS' && <TonePanel title="Awaiting your choice">Helpers have offered to help. Review their offers and choose one.</TonePanel>}{task.status === 'AWAITING_CONFIRMATION' && <TonePanel title="Waiting for confirmation">Your selected helper needs to confirm the arrangement.</TonePanel>}
    {task.status === 'DRAFT' && <Button variant="primary" disabled={busy} title="Edit draft" onPress={edit} />}
    <Card><InfoRow label="When" value={dateLabel(task.startAt) + (task.endAt ? ' – ' + dateLabel(task.endAt) : '')} /><InfoRow label="Location" value={location ? location.label + ' · ' + location.formattedAddress : undefined} /><InfoRow label="Priority" value={task.urgency ? statusLabel(task.urgency) : undefined} /><InfoRow label="Who can offer" value={task.visibility ? statusLabel(task.visibility) : undefined} /></Card>
    {task.publicInstructions && <Card><Text accessibilityRole="header">About this task</Text><Text>{task.publicInstructions}</Text></Card>}
    {task.privateInstructions && <Disclosure title="Private arrival details"><Card><Text>Shared only with the current confirmed helper.</Text><Text>{task.privateInstructions}</Text></Card></Disclosure>}
    {task.instructions && <Disclosure title="Private circle notes"><Card><Text>{task.instructions}</Text></Card></Disclosure>}
    <Card><InfoRow label="Compensation" value={task.compensationType ? `${statusLabel(task.compensationType)} ${task.pointReward ?? task.cashAmount ?? ''} ${task.currency ?? ''}` : undefined} /></Card>
    {viewOffers && task.status !== 'DRAFT' && <Button variant="primary" title="View offers & arrangement" disabled={busy} onPress={viewOffers} />}
    <Disclosure title="Task activity"><TimelinePanel compact taskId={task.id} /></Disclosure>
    {['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED'].includes(task.status) && <Button disabled={busy} title="Cancel task" onPress={cancel} />}
  </>;
}
