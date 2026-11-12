import React, { useState } from 'react';
import type { UserDto, UserRole } from '@team517/contracts';
import { Text, Button, Card, SectionHeader, StatusBadge, Avatar } from '../components/ui';
import { roleLabel } from '../utils/presentation';
export function HomeScreen({ busy, profile, initialize, loadUser, switchRole }: { busy: boolean; profile: UserDto | null; initialize: (role: UserRole) => void; loadUser: () => void; switchRole: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>('CARE_MANAGER');
  if (!profile) return <><SectionHeader title="How will you use 517?" caption="Choose how you would like to get started." />
    {(['CARE_MANAGER', 'CARE_RECEIVER', 'HELPER'] as UserRole[]).map(value => <Button key={value} disabled={busy} title={(role === value ? '✓ ' : '') + roleLabel(value)} onPress={() => setRole(value)} />)}
    <Button variant="primary" disabled={busy} title="Continue" onPress={() => initialize(role)} />
  </>;
  return <><Card><Avatar label="Me" /><Text accessibilityRole="header">Your care, your way</Text><StatusBadge status={profile.verificationStatus ?? 'UNVERIFIED'} /><Text>Choose the experience you need today.</Text></Card>
    <SectionHeader title="Your mode" caption="Switching changes your view. Access still depends on your account and care relationships." />
    {profile.roles.map(value => <Button key={value} disabled={busy} title={((profile.lastActiveRole ?? profile.primaryOnboardingRole) === value ? '✓ ' : '') + roleLabel(value)} onPress={() => switchRole(value)} />)}
    <Button disabled={busy} title="Refresh account" onPress={loadUser} />
    <Card><Text accessibilityRole="header">Points & earnings</Text><Text>Coming later. Tasks may display compensation, but balances, payments and transfers are not available.</Text></Card>
  </>;
}
