import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { theme as t } from '../theme';
import { MenuRow } from '../components/Details';
import React, { useState } from 'react';
import type { UserDto, UserRole } from '@team517/contracts';
import { Text, Button, Card, SectionHeader, StatusBadge, Avatar } from '../components/ui';
import { roleLabel } from '../utils/presentation';
export function HomeScreen({ busy, profile, initialize, loadUser, switchRole, children, email }: { children?: React.ReactNode; email?: string | null; busy: boolean; profile: UserDto | null; initialize: (role: UserRole) => void; loadUser: () => void; switchRole: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>('CARE_MANAGER');
  const [rolesOpen, setRolesOpen] = useState(false);
  useScreenTop(rolesOpen ? 'role-picker' : 'profile');
  if (!profile) return <><SectionHeader title="How will you use team517?" caption="Choose how you would like to get started." />
    {(['CARE_MANAGER', 'CARE_RECEIVER', 'HELPER'] as UserRole[]).map(value => <Button key={value} disabled={busy} title={(role === value ? '✓ ' : '') + roleLabel(value)} onPress={() => setRole(value)} />)}
    <Button variant="primary" disabled={busy} title="Continue" onPress={() => initialize(role)} />
  </>;
  if (rolesOpen) return <RolePicker profile={profile} busy={busy} switchRole={switchRole} back={() => setRolesOpen(false)} />;
  return <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 }}><Avatar label="Me" /><View style={{ gap: 5 }}><Text style={{ fontSize: 22, fontWeight: '700' }}>My account</Text><Text style={{ fontSize: 12 }}>{email}</Text><StatusBadge status={profile.verificationStatus ?? 'UNVERIFIED'} /></View></View>
    <MenuRow title="Switch role" subtitle={roleLabel(profile.lastActiveRole ?? profile.primaryOnboardingRole)} onPress={() => setRolesOpen(true)} disabled={busy} />
    <MenuRow title="Refresh account" onPress={loadUser} disabled={busy} icon="refresh-cw" />{children}
  </>;
}
function RolePicker({ profile, busy, switchRole, back }: { profile: UserDto; busy: boolean; switchRole: (role: UserRole) => void; back: () => void }) {
  useScreenHeader({ title: 'Switch role', back, disabled: busy, priority: 2 });
  useHardwareBack(() => { if (!busy) back(); return true; }, 2);
  const active = profile.lastActiveRole ?? profile.primaryOnboardingRole;
  return <><SectionHeader title="How would you like to use team517?" caption="Choose the experience you need today." />
    {profile.roles.map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={roleLabel(value)} accessibilityState={{ selected: active === value, disabled: busy }} disabled={busy} onPress={() => switchRole(value)} style={{ borderWidth: 1, borderColor: active === value ? t.colors.primary : t.colors.border, backgroundColor: active === value ? t.colors.primarySoft : t.colors.surface, borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}><Feather name={value === 'HELPER' ? 'heart' : 'users'} size={25} color={t.colors.primary} /><View style={{ flex: 1, gap: 5 }}><Text style={{ fontWeight: '600', fontSize: 16 }}>{roleLabel(value)}</Text><Text style={{ fontSize: 12 }}>{value === 'HELPER' ? 'Find tasks and offer your support' : value === 'CARE_MANAGER' ? 'Coordinate care for someone you love' : 'Plan and receive everyday support'}</Text></View><Feather name={active === value ? 'check-circle' : 'chevron-right'} size={20} color={t.colors.primary} /></Pressable>)}
  </>;
}
