import {offerPresentation,assignmentListSummary} from '../utils/coordination';
import {RescheduledOfferScreen} from './RescheduledOfferScreen';
import {taskWhenLabel} from '../utils/design-presentation';
import {EditOfferAvailability} from './EditOfferAvailability';
import { Choices, TonePanel } from '../components/Details';
import { SegmentedControl } from '../components/SegmentedControl';
import { useScreenHeader } from '../components/ScreenHeader';
import React, { useEffect, useRef, useState } from 'react';
import { useScreenTop,useErrorScroll } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import type { MyOffersDto, MyAssignmentsDto, AssignmentDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { Text, Button, Card, EmptyState, StatusBadge, SectionHeader, LoadingState, ErrorState } from '../components/ui';
import { friendlyError, dateLabel, workPriority } from '../utils/presentation';
import { TaskPreviewCard } from '../components/Cards';
export function MyWorkScreen({ back }: { back: () => void }) {
  const [offers, setOffers] = useState<MyOffersDto | null>(null), [assignments, setAssignments] = useState<MyAssignmentsDto | null>(null), [titles, setTitles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AssignmentDto | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [section, setSection] = useState<'assignments' | 'offers'>('assignments');
  const [offerTaskId,setOfferTaskId]=useState<string|null>(null);
  const lock = useRef(false);
  useErrorScroll(error);
  useScreenTop(selected?.id ?? section);
  const load = async () => {
    const [o, a] = await Promise.all([api.getMyOffers(), api.getMyAssignments()]); setOffers(o); setAssignments(a);
    const current=await Promise.all(a.assignments.map(item=>item.status==='PENDING_CONFIRMATION'?api.getAssignment(item.id).catch(()=>item):Promise.resolve(item)));
    setAssignments({...a,assignments:current});
    // Titles come from the existing safe relationship projection, never full private Task reads.
    const labels = await Promise.all(current.map(async item => { try { return [item.id, (await api.getAssignmentPublicTask(item.id)).title || 'Your task'] as const; } catch { return [item.id, 'Your task'] as const; } })); const taskLabels = await Promise.all([...new Set(o.offers.filter(offer => offer.status === 'ACTIVE').map(offer => offer.taskId))].map(async taskId => {
      try { return [taskId, (await api.getDiscoveredTask(taskId)).title] as const; } catch { return [taskId, 'Your offer'] as const; }
    }));
    setTitles(Object.fromEntries([...labels, ...taskLabels]));
  };
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { void run(load); }, []);
  useHardwareBack(() => { if (!selected) return false; if (!busy) setSelected(null); return true; }, 1);
  if(offerTaskId)return <RescheduledOfferScreen taskId={offerTaskId} back={()=>setOfferTaskId(null)}/>;
  if (selected) return <SelectedWork assignment={selected} back={() => setSelected(null)} refresh={load} />;
  return <><Choices value={section} options={[{ value: 'assignments', label: 'My tasks' }, { value: 'offers', label: 'My offers' }]} change={setSection} />
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {section === 'offers' && <>{!busy && offers?.offers.length === 0 && <EmptyState title="Ready to lend a hand?" message="Find a task and send your first offer." />}
      {offers?.offers.map(offer => <Card key={offer.id}><Text accessibilityRole="header">{offerPresentation(offer.status).title}</Text><Text>{offerPresentation(offer.status).summary}</Text><Text accessibilityRole="header">{titles[offer.taskId] || (offer.assignmentId ? titles[offer.assignmentId] : undefined) || 'Your offer'}</Text><Text>{offer.message || 'You offered to help with this task.'}</Text><Text>Sent {dateLabel(offer.createdAt)}</Text><Text>{offer.availableFrom && offer.availableUntil?'Available '+taskWhenLabel(offer.availableFrom,offer.availableUntil):'Availability not provided'}</Text>
        {offer.status==='ACTIVE' && <Button title="View current task time" onPress={()=>setOfferTaskId(offer.taskId)}/>}
        {offer.status==='ACTIVE' && <EditOfferAvailability taskId={offer.taskId} saved={load}/>}
        {offer.status === 'ACTIVE' && <Button title="Withdraw offer" disabled={busy} onPress={() => void run(async () => { await api.withdrawOffer(offer.taskId); await load(); })} />}
        {offer.assignmentId && <Button title="View assignment" disabled={busy} onPress={() => void run(async () => setSelected(await api.getAssignment(offer.assignmentId!)))} />}
      </Card>)}
    </>}
    {section === 'assignments' && <><Text accessibilityRole="header">Your tasks</Text>{!busy && assignments?.assignments.length === 0 && <EmptyState title="No assignments yet" message="When a requester selects your offer, it will appear here for you to confirm." />}
      {assignments?.assignments.slice().sort((a, b) => workPriority(a.status) - workPriority(b.status)).map(a => <TaskPreviewCard key={a.id} status={a.status} title={titles[a.id] || 'Your task'} when={'Selected ' + dateLabel(a.selectedAt)} detail={assignmentListSummary({status:a.status,helper:true,scheduleChanged:a.requiresHelperReconfirmation,availabilityChanged:a.availabilityReview?.requiresRequesterReconfirmation},a.status!=='PENDING_CONFIRMATION'||Boolean(a.availabilityReview||a.scheduleReview))} busy={busy} open={() => void run(async()=>setSelected(await api.getAssignment(a.id)))} />)}
    </>}
    {(offers?.truncated || assignments?.truncated) && <Text>Showing your 50 most recently updated items.</Text>}
    <Button variant="quiet" title="Refresh my tasks" disabled={busy} onPress={() => void run(load)} />
  </>;
}

function SelectedWork({ assignment, back, refresh }: { assignment: AssignmentDto; back: () => void; refresh: () => Promise<void> }) { useScreenHeader({ title: 'Your arrangement', back, priority: 3 }); return <AssignmentPanel assignment={assignment} refresh={refresh} />; }
