import React, { useEffect, useRef, useState } from 'react';
import { useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import type { MyOffersDto, MyAssignmentsDto, AssignmentDto } from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { Text, Button, Card, EmptyState, StatusBadge, SectionHeader, LoadingState, ErrorState } from '../components/ui';
import { friendlyError, dateLabel, assignmentNextAction, workPriority } from '../utils/presentation';
import { TaskPreviewCard } from '../components/Cards';
export function MyWorkScreen({ back }: { back: () => void }) {
  const [offers, setOffers] = useState<MyOffersDto | null>(null), [assignments, setAssignments] = useState<MyAssignmentsDto | null>(null), [titles, setTitles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AssignmentDto | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [section, setSection] = useState<'assignments' | 'offers'>('assignments');
  const lock = useRef(false);
  useScreenTop(selected?.id ?? section);
  const load = async () => {
    const [o, a] = await Promise.all([api.getMyOffers(), api.getMyAssignments()]); setOffers(o); setAssignments(a);
    // Titles come from the existing safe relationship projection, never full private Task reads.
    const labels = await Promise.all(a.assignments.map(async item => { try { return [item.id, (await api.getAssignmentPublicTask(item.id)).title || 'Your task'] as const; } catch { return [item.id, 'Your task'] as const; } })); const taskLabels = await Promise.all([...new Set(o.offers.filter(offer => offer.status === 'ACTIVE').map(offer => offer.taskId))].map(async taskId => {
      try { return [taskId, (await api.getDiscoveredTask(taskId)).title] as const; } catch { return [taskId, 'Your offer'] as const; }
    }));
    setTitles(Object.fromEntries([...labels, ...taskLabels]));
  };
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { void run(load); }, []);
  useHardwareBack(() => { if (!selected) return false; if (!busy) setSelected(null); return true; });
  if (selected) return <><Button disabled={busy} title="Back to my tasks" onPress={() => setSelected(null)} /><AssignmentPanel key={selected.id} assignment={selected} refresh={load} /></>;
  return <><SectionHeader title="Care you make possible" caption="Your offers and confirmed support, all in one place." />
    <Button title={(section === 'assignments' ? '✓ ' : '') + 'My tasks'} onPress={() => setSection('assignments')} /><Button title={(section === 'offers' ? '✓ ' : '') + 'My offers'} onPress={() => setSection('offers')} />
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}
    {section === 'offers' && <>{!busy && offers?.offers.length === 0 && <EmptyState title="Ready to lend a hand?" message="Find a task and send your first offer." />}
      {offers?.offers.map(offer => <Card key={offer.id}><StatusBadge status={offer.status} /><Text accessibilityRole="header">{titles[offer.taskId] || (offer.assignmentId ? titles[offer.assignmentId] : undefined) || 'Your offer'}</Text><Text>{offer.message || 'You offered to help with this task.'}</Text><Text>Sent {dateLabel(offer.createdAt)}</Text>
        {offer.status === 'ACTIVE' && <Button title="Withdraw offer" disabled={busy} onPress={() => void run(async () => { await api.withdrawOffer(offer.taskId); await load(); })} />}
        {offer.assignmentId && <Button title="View assignment" disabled={busy} onPress={() => void run(async () => setSelected(await api.getAssignment(offer.assignmentId!)))} />}
      </Card>)}
    </>}
    {section === 'assignments' && <>{!busy && assignments?.assignments.length === 0 && <EmptyState title="No assignments yet" message="When a requester selects your offer, it will appear here for you to confirm." />}
      {assignments?.assignments.slice().sort((a, b) => workPriority(a.status) - workPriority(b.status)).map(a => <TaskPreviewCard key={a.id} status={a.status} title={titles[a.id] || 'Your task'} when={'Selected ' + dateLabel(a.selectedAt)} detail={assignmentNextAction(a.status, true)} busy={busy} open={() => setSelected(a)} />)}
    </>}
    {(offers?.truncated || assignments?.truncated) && <Text>Showing your 50 most recently updated items.</Text>}
    <Button title="Refresh my tasks" disabled={busy} onPress={() => void run(load)} />
  </>;
}
