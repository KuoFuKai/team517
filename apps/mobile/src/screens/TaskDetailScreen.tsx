import {auth} from '../auth/firebase';
import {useCoordinationContext} from '../utils/useCoordinationContext';
import {RescheduleTask} from './RescheduleTask';
import {CoordinationCard} from '../components/CoordinationCard';
import {taskStatusPresentation,requesterCoordination} from '../utils/coordination';
import {taskWhenLabel,compensationLabel} from '../utils/design-presentation';
import { PreviewContentCover } from '../components/PreviewContentCover';
import React,{useState} from 'react';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { TaskDetailDto, LocationDto } from '@team517/contracts';
import { useScreenHeader } from '../components/ScreenHeader';
import { Disclosure, TonePanel } from '../components/Details';
import { TimelinePanel } from './TimelinePanel';
import { Text, Button, Card, StatusBadge, PageHeading } from '../components/ui';
import { dateLabel, statusLabel, countLabel } from '../utils/presentation';
import { theme as t } from '../theme';
export function TaskDetailScreen({ task, locations, busy, edit, cancel, back, viewOffers, contextName, postedByYou, scheduleChanged }: { task: TaskDetailDto; locations: LocationDto[]; busy: boolean; edit?: () => void; cancel?: () => void; back: () => void; viewOffers?: () => void; contextName?: string; postedByYou?: boolean; scheduleChanged?:(task:TaskDetailDto)=>Promise<void> }) {
  useScreenHeader({ title: 'Task details', back, disabled: busy, priority: 2 });
  const location = locations.find(l => l.id === task.locationId);
  const [contextRevision,setContextRevision]=useState(0);
  const context=useCoordinationContext(task.id,undefined,Boolean(viewOffers) && task.status!=='DRAFT',false,task.updatedAt+'|'+contextRevision);
  const input=requesterCoordination(task,context,auth.currentUser?.uid),currentStatus=input.status;
  const coordination=taskStatusPresentation(input);
  const compensation = compensationLabel(task);
  return <>
    <PageHeading title={task.title || 'Untitled draft'} />
    <Text style={{ fontSize: 16, color: t.colors.muted }}>{postedByYou ? 'Posted by you' : 'Task request'}{contextName ? ` · ${contextName}` : ''}</Text>
    <Text>{taskWhenLabel(context?.startAt ?? task.startAt,context?.endAt ?? task.endAt)}</Text>
    <CoordinationCard value={coordination}>
    {task.status === 'DRAFT' && edit && <Button variant="primary" disabled={busy} title="Edit draft" onPress={edit} />}
    {viewOffers && context && task.status !== 'DRAFT' && <Button variant={currentStatus==='HAS_OFFERS'?'primary':'secondary'} title={currentStatus==='HAS_OFFERS'?'Review offers':['OPEN'].includes(currentStatus)?'View offers':'View arrangement'} disabled={busy} onPress={viewOffers} />}
    {!context && task.status!=='DRAFT' && <Button title="Refresh status" disabled={busy} onPress={()=>setContextRevision(value=>value+1)}/>}
    </CoordinationCard>
    <PreviewContentCover kind="task" id={task.id} />
    {task.canReschedule && scheduleChanged && <RescheduleTask task={task} saved={scheduleChanged}/>}
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Feather name="star" size={18} color={t.colors.primary} /><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>Quick task summary</Text></View><Text>{task.publicInstructions || task.helpType || 'Add the task details before publishing.'}</Text><Text style={{ fontSize: 13.5, color: t.colors.primary }}>{dateLabel(task.startAt)}{location ? ` · ${location.label}` : ''}</Text></Card>
    <Card><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>{compensation}</Text></Card>
    <Card><Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.ink }}>Task information</Text><Text>{task.helpType || 'Help type not selected'}{task.urgency ? ` · ${statusLabel(task.urgency)}` : ''}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{task.visibility ? statusLabel(task.visibility) : 'Visibility not selected'}</Text>{task.endAt && <Text style={{ fontSize: 13.5, color: t.colors.muted }}>Until {dateLabel(task.endAt)}</Text>}</Card>
    <Disclosure title="Location & private details">{location && <Card><Text style={{ fontWeight: '600' }}>{location.label}</Text><Text>{location.formattedAddress}</Text></Card>}{task.privateInstructions && <Card><Text style={{ fontWeight: '600' }}>Private arrival details</Text><Text>{task.privateInstructions}</Text></Card>}{task.instructions && <Card><Text style={{ fontWeight: '600' }}>Private circle notes</Text><Text>{task.instructions}</Text></Card>}</Disclosure>
    <Disclosure title="Task activity"><TimelinePanel compact taskId={task.id} /></Disclosure>
    {cancel && ['DRAFT', 'OPEN', 'HAS_OFFERS', 'AWAITING_CONFIRMATION', 'ARRANGED'].includes(task.status) && <Disclosure title="Task options"><Button variant="danger" disabled={busy} title="Cancel task" onPress={cancel} /></Disclosure>}
  </>;
}
