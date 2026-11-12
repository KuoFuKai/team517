import { MenuRow, Disclosure } from '../components/Details';
import { CircleMessagingPanel } from './CircleMessagingPanel';
import React from 'react';
import type { CareContextDto } from '@team517/contracts';
import { Text, Button, Card, EmptyState, SectionHeader } from '../components/ui';
export function CareContextsScreen({ busy, contexts, open, create, refresh, canCreate = true }: { busy: boolean; contexts: CareContextDto[]; open: (id: string) => void; create: () => void; refresh: () => void; canCreate?: boolean }) {
  return <><SectionHeader title="Your care circles" caption="Keep everyday support connected." />
    {!busy && contexts.length === 0 && <EmptyState title="Your circle starts here" message="Care circles you belong to will appear here." />}
    {contexts.map(context => <Card key={context.id}><MenuRow disabled={busy} title={context.name} subtitle="Plan tasks and coordinate support" onPress={() => open(context.id)} /><Disclosure title="Circle members & messages"><CircleMessagingPanel careContextId={context.id} /></Disclosure></Card>)}
    <Button disabled={busy} title="Refresh circles" onPress={refresh} />{canCreate && <Button disabled={busy} title="Create a care circle" onPress={create} />}
  </>;
}
export function CareContextDetailScreen({ context, tasks, busy }: { context: CareContextDto; tasks: () => void; busy: boolean }) {
  return <Card><Text accessibilityRole="header">{context.name}</Text><Text>Plan tasks and coordinate the support your circle needs.</Text><Button disabled={busy} title="View tasks" onPress={tasks} /><Text>Invitations and a helper directory are not available yet.</Text></Card>;
}
