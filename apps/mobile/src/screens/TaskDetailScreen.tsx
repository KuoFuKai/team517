import { PreviewContentCover } from '../components/PreviewContentCover';
import React from 'react';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { TaskDetailDto, LocationDto } from '@team517/contracts';
import { useScreenHeader } from '../components/ScreenHeader';
import { Disclosure, TonePanel } from '../components/Details';
import { TimelinePanel } from './TimelinePanel';
import { Text, Button, Card, StatusBadge, PageHeading } from '../components/ui';
import { dateLabel, statusLabel } from '../utils/presentation';
import { theme as t } from '../theme';
export function TaskDetailScreen({ task, locations, busy, edit, cancel, back, viewOffers, contextName, postedByYou }: { task: TaskDetailDto; locations: LocationDto[]; busy: boolean; edit?: () => void; cancel?: () => void; back: () => void; viewOffers?: () => void; contextName?: string; postedByYou?: boolean }) {
  useScreenHeader({ title: 'Task details', back, disabled: busy, priority: 2 });
  const location = locations.find(l => l.id === task.locationId);
  const compensation = task.compensationType === 'PAID' ? `Paid task${task.cashAmount !== undefined ? ` · ${task.cashAmount} ${task.currency ?? ''}` : ''}` : task.compensationType === 'POINTS' ? `${task.pointReward ?? '—'} points` : task.compensationType === 'VOLUNTEER' ? 'Volunteer task' : 'Compensation not selected';
  return <>
    <PreviewContentCover kind="task" id={task.id} />
    <PageHeading title={task.title || 'Untitled draft'} />
    <Text style={{ fontSize: 16, color: t.colors.muted }}>{postedByYou ? 'Posted by you' : 'Care-circle task'}{contextName ? ` · ${contextName}` : ''}</Text>
    {task.status === 'HAS_OFFERS' ? <TonePanel title="Awaiting your choice">{task.visibility === 'CARE_CIRCLE' ? 'People in your circle have offered to help.' : 'Helpers have offered to help.'}</TonePanel> : task.status === 'AWAITING_CONFIRMATION' ? <TonePanel title="Waiting for confirmation">Your selected helper needs to confirm.</TonePanel> : <StatusBadge status={task.status} />}
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Feather name="star" size={18} color={t.colors.primary} /><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>Quick task summary</Text></View><Text>{task.publicInstructions || task.helpType || 'Add the task details before publishing.'}</Text><Text style={{ fontSize: 13.5, color: t.colors.primary }}>{dateLabel(task.startAt)}{location ? ` · ${location.label}` : ''}</Text></Card>
    <Card><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>{compensation}</Text></Card>
    <Card><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>Task information</Text><Text>{task.helpType || 'Help type not selected'}{task.urgency ? ` · ${statusLabel(task.urgency)}` : ''}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{task.visibility ? statusLabel(task.visibility) : 'Visibility not selected'}</Text>{task.endAt && <Text style={{ fontSize: 13.5, color: t.colors.muted }}>Until {dateLabel(task.endAt)}</Text>}</Card>
    {task.status === 'DRAFT' && edit && <Button variant="secondary" disabled={busy} title="Edit draft" onPress={edit} />}
    {viewOffers && task.status !== 'DRAFT' && <Button variant="primary" title={['OPEN', 'HAS_OFFERS'].includes(task.status) ? 'View responses' : 'View arrangement'} disabled={busy} onPress={viewOffers} />}
    <Disclosure title="Location & private details">{location && <Card><Text style={{ fontWeight: '600' }}>{location.label}</Text><Text>{location.formattedAddress}</Text></Card>}{task.privateInstructions && <Card><Text style={{ fontWeight: '600' }}>Private arrival details</Text><Text>{task.privateInstructions}</Text></Card>}{task.instructions && <Card><Text style={{ fontWeight: '600' }}>Private circle notes</Text><Text>{task.instructions}</Text></Card>}</Disclosure>
    <Disclosure title="Task activity"><TimelinePanel compact taskId={task.id} /></Disclosure>
    {cancel && ['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED'].includes(task.status) && <Disclosure title="Task options"><Button variant="danger" disabled={busy} title="Cancel task" onPress={cancel} /></Disclosure>}
  </>;
}
