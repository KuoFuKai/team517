import React, { useState } from 'react';
import { View } from 'react-native';
import type { CareContextDto } from '@team517/contracts';
import { Text, Button, Card, EmptyState } from '../components/ui';
import { Disclosure } from '../components/Details';
import { SegmentedControl } from '../components/SegmentedControl';
import { FormSelect } from '../components/FormSelect';
import { CircleMessagingPanel } from './CircleMessagingPanel';
export function CareContextsScreen({ busy, contexts, open, create, refresh, canCreate = true, selectedId, select, inbox }: { inbox?: () => void; busy: boolean; contexts: CareContextDto[]; open: (id: string) => void; create: () => void; refresh: () => void; canCreate?: boolean; selectedId?: string; select?: (id: string) => void }) {
  const [tab, setTab] = useState<'helpers' | 'family'>('family');
  const context = contexts.find(value => value.id === selectedId) ?? contexts[0];
  return <><SegmentedControl value={tab} options={[{ value: 'helpers', label: 'Helpers' }, { value: 'family', label: 'Family & friends' }]} onChange={setTab} />{!busy && !contexts.length && <EmptyState title="Your circle starts here" message="Care circles you belong to will appear here." />}{context && (tab === 'family' ? <><CircleMessagingPanel key={context.id} careContextId={context.id} /><Button variant="outline" title="Invite family or friends · preview" disabled /><Text style={{ fontSize: 13.5 }}>Invitations are not connected.</Text></> : <Card><Text accessibilityRole="header">Helpers</Text><Text>Caregiver directory · design preview</Text><Text style={{ fontSize: 13.5 }}>Helper grouping is not connected. Current active members remain available under Family & friends.</Text><Button variant="outline" title="Invite a helper · unavailable" disabled /></Card>)}<Disclosure title="Circle options">{inbox && <Button title="Messages" onPress={inbox} />}{contexts.length > 1 && <FormSelect label="Care circle" value={context?.id} options={contexts.map(value => ({ value: value.id, label: value.name }))} change={id => select?.(id)} disabled={busy} />}{context && <Button title="View circle tasks" disabled={busy} onPress={() => open(context.id)} />}<Button disabled={busy} title="Refresh circles" onPress={refresh} />{canCreate && <Button disabled={busy} title="Create a care circle" onPress={create} />}</Disclosure></>;
}
export function CareContextDetailScreen({ context, tasks, busy }: { context: CareContextDto; tasks: () => void; busy: boolean }) { return <Card><Text accessibilityRole="header">{context.name}</Text><Button disabled={busy} title="View tasks" onPress={tasks} /></Card>; }
