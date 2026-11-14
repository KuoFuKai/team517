import { PointsScreen } from './PointsScreen';
import { demoPerson } from '../demo/maker-day3';
import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import type { UserDto, UserRole, HelperRatingSummaryDto } from '@team517/contracts';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { theme as t } from '../theme';
import { MenuRow, TonePanel } from '../components/Details';
import { Text, Button, Card, PageHeading, Avatar } from '../components/ui';
import { statusLabel } from '../utils/presentation';
import * as api from '../api/client';
import { DesignPreviewScreen, type DesignPreview } from './DesignPreviewScreen';
const roleName = (value: UserRole) => value === 'HELPER' ? 'Caregiver' : value === 'CARE_MANAGER' ? 'Care coordinator' : 'Care receiver';
export function HomeScreen({ busy, profile, initialize, loadUser, switchRole, children, email, name, contextName, verification, logout }: { children?: React.ReactNode; email?: string | null; name?: string | null; contextName?: string; verification?: () => void; logout?: () => void; busy: boolean; profile: UserDto | null; initialize: (role: UserRole) => void; loadUser: () => void; switchRole: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>('CARE_MANAGER'), [rolesOpen, setRolesOpen] = useState(false), [preview, setPreview] = useState<DesignPreview | null>(null);
  const [pointsBalance,setPointsBalance]=useState<number | null>(null);
  useEffect(()=>{let active=true;setPointsBalance(null);if(profile && !preview)void api.getPointAccount().then(value=>{if(active)setPointsBalance(value.availablePoints);}).catch(()=>{});return()=>{active=false;};},[profile?.id,preview]);
  const [rating, setRating] = useState<HelperRatingSummaryDto | null>(null);
  const helper = (profile?.lastActiveRole ?? profile?.primaryOnboardingRole) === 'HELPER';
  useScreenTop(preview ?? (rolesOpen ? 'role-picker' : 'profile'));
  useEffect(() => { let active = true; setRating(null); if (profile?.roles.includes('HELPER')) void api.getHelperRatingSummary(profile.id).then(value => { if (active) setRating(value); }).catch(() => {}); return () => { active = false; }; }, [profile?.id]);
  if (!profile) return <><PageHeading title="How will you use this app?" caption="Choose the best fit for now." />{(['CARE_RECEIVER', 'CARE_MANAGER', 'HELPER'] as UserRole[]).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={roleName(value)} accessibilityState={{ checked: role === value, disabled: busy }} disabled={busy} onPress={() => setRole(value)} style={{ padding: 20, gap: 8, borderWidth: 1, borderColor: role === value ? t.colors.primary : t.colors.border, borderRadius: 12, backgroundColor: role === value ? t.colors.primarySoft : t.colors.surface }}><Text style={{ fontSize: 18, fontWeight: '600' }}>{value === 'CARE_RECEIVER' ? 'For myself' : value === 'CARE_MANAGER' ? 'For a family member' : 'To help others'}</Text><Text style={{ color: t.colors.muted }}>{value === 'CARE_RECEIVER' ? 'I’m looking for everyday help.' : value === 'CARE_MANAGER' ? 'I’m helping someone manage their care.' : 'I’d like to volunteer or offer practical help.'}</Text></Pressable>)}<Button variant="primary" disabled={busy} title="Continue" onPress={() => initialize(role)} /></>;
  if (preview === 'points') return <PointsScreen back={() => setPreview(null)} />;
  if (preview) return <DesignPreviewScreen key={preview} kind={preview} back={() => setPreview(null)} />;
  if (rolesOpen) return <RolePicker profile={profile} busy={busy} switchRole={switchRole} contextName={contextName} back={() => setRolesOpen(false)} />;
  const title = name || email || 'Your account';
  return <>
    <Card>{helper ? <Text accessibilityRole="header" style={{ fontSize: 28, lineHeight: 34 }}>{title}</Text> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Avatar label={title} /><Text accessibilityRole="header" style={{ flex: 1, fontSize: 22, lineHeight: 28 }}>{title}</Text></View>}<Text style={{ color: t.colors.muted }}>{demoPerson(profile.id)?.relationship ?? `${roleName(profile.lastActiveRole ?? profile.primaryOnboardingRole)} · ${statusLabel(profile.verificationStatus ?? 'UNVERIFIED')}`}</Text>
      {helper && <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>{[[rating?.averageRating?.toFixed(1) ?? '—', 'Rating'], [rating?.reviewCount?.toString() ?? '—', 'Reviews'], [statusLabel(profile.verificationStatus ?? 'UNVERIFIED'), 'Identity']].map(([value,label]) => <View key={label} style={{ gap: 4, flex: 1 }}><Text style={{ color: t.colors.primary, fontSize: 18, fontWeight: '600' }}>{value}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{label}</Text></View>)}</View>}
    </Card>
    <Pressable accessibilityRole="button" accessibilityLabel="My points" onPress={() => setPreview('points')}><TonePanel title="My points">{pointsBalance === null ? 'View your balance and activity' : `${pointsBalance.toLocaleString()} points available`}</TonePanel></Pressable>
    {helper && <MenuRow contained title="Skills and availability" onPress={() => setPreview('skills')} />}
    {verification && <MenuRow contained title={helper ? 'Caregiver verification' : 'Identity verification'} onPress={verification} />}
    {helper && <MenuRow contained title="Certificates" onPress={() => setPreview('certificates')} />}
    {helper && <MenuRow contained title="Payment methods" onPress={() => setPreview('payments')} />}
    {children}
    <MenuRow contained title="Switch role" onPress={() => setRolesOpen(true)} disabled={busy} />
    {logout && <MenuRow contained title="Log out" disabled={busy} onPress={logout} />}
    <Button variant="quiet" title="Refresh account" onPress={loadUser} disabled={busy} />
  </>;
}
function RolePicker({ profile, busy, switchRole, back, contextName }: { profile: UserDto; busy: boolean; switchRole: (role: UserRole) => void; back: () => void; contextName?: string }) {
  useScreenHeader({ title: 'Switch role', back, disabled: busy, priority: 2 });
  useHardwareBack(() => { if (!busy) back(); return true; }, 2);
  const active = profile.lastActiveRole ?? profile.primaryOnboardingRole;
  return <><PageHeading title="How are you using 517?" />{profile.roles.map(value => <View key={value} style={{ borderWidth: active === value ? 0 : 1, borderColor: t.colors.border, backgroundColor: active === value ? t.colors.primarySoft : t.colors.surface, borderRadius: 12, padding: 16, gap: 16, marginTop: 12 }}><Text style={{ fontWeight: '600', fontSize: 18 }}>{value === 'CARE_MANAGER' && contextName ? `Managing ${contextName}` : roleName(value)}</Text><Text style={{ color: t.colors.muted }}>{value === 'HELPER' ? 'Find nearby tasks and offer practical support.' : value === 'CARE_MANAGER' ? 'Post tasks, coordinate helpers, and manage your circle’s support.' : 'Plan everyday tasks and connect with your circle.'}</Text><Button disabled={busy} variant={active === value ? 'secondary' : 'primary'} title={active === value ? `Continue as ${roleName(value).toLowerCase()}` : `Switch to ${roleName(value).toLowerCase()}`} onPress={() => switchRole(value)} /></View>)}<Text style={{ color: t.colors.muted }}>You can switch back anytime from the role menu.</Text></>;
}
