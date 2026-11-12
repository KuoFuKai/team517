import React, { useState } from 'react';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import type { VerificationStatusDto } from '@team517/contracts';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { PageHeading, Text, Button } from '../components/ui';
import { TonePanel } from '../components/Details';
import { theme as t } from '../theme';
export function VerificationPresentation({ value, back }: { value: VerificationStatusDto; back: () => void }) {
  const [preview, setPreview] = useState(false);
  const verified = value.status === 'VERIFIED';
  useScreenHeader({ title: 'Verify identity', back: preview ? () => setPreview(false) : back, priority: 3 });
  useHardwareBack(() => { if (!preview) return false; setPreview(false); return true; }, 3);
  if (preview) return <><PageHeading title="Confirm it’s you" /><Text accessibilityRole="header">1. Add a photo ID</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>Make sure your name and photo are clear.</Text><Button title="Add ID photo" disabled /><Text accessibilityRole="header">2. Take a quick selfie</Text><Button title="Take a selfie" disabled /><View style={{ minHeight: 40 }} /><Button variant="primary" title="Verify identity" disabled /><Button variant="quiet" title="Back to verification" onPress={() => setPreview(false)} /></>;
  return <><PageHeading title={verified ? 'Identity verified' : value.status === 'PENDING' ? 'Verification pending' : value.status === 'FAILED' ? 'Verification needs attention' : 'Verify it’s you'} caption={verified ? 'Your account has a verified badge.' : 'Let your community know it’s you.'} /><View style={{ alignItems: 'center', paddingVertical: 28 }}><View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: verified ? t.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Feather name={verified ? 'check' : 'shield'} size={60} color={verified ? t.colors.surface : t.colors.primary} /></View></View><TonePanel title={verified ? 'Ready for care and support' : 'Verify to offer outside your circle'}>{value.canDiscover ? 'Your account can find tasks shared with verified caregivers.' : 'Trusted-circle tasks may still be available.'}</TonePanel>{!verified && <Button title="Verify identity" onPress={() => setPreview(true)} />}<Button variant="primary" title={verified ? 'Continue' : 'Back to profile'} onPress={back} /></>;
}
