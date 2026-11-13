import { ResponsiveActions } from '../components/ResponsiveActions';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { Text, Button, Card, PageHeading, TextInput } from '../components/ui';
import { TonePanel } from '../components/Details';
import { theme as t } from '../theme';
export type DesignPreview = 'points' | 'skills' | 'certificates' | 'payments';
export function DesignPreviewScreen({ kind, back }: { kind: DesignPreview; back: () => void }) {
  const [step, setStep] = useState<'main' | 'buy' | 'transfer'>('main');
  const title = kind === 'points' ? step === 'buy' ? 'Buy points' : step === 'transfer' ? 'Transfer out' : 'My points' : kind === 'skills' ? 'Skills and availability' : kind === 'certificates' ? 'Certificates' : 'Payment methods';
  const close = () => step !== 'main' ? setStep('main') : back();
  useScreenHeader({ title, back: close, priority: 2 });
  useHardwareBack(() => { close(); return true; }, 2);
  return <>
    {kind === 'points' ? step === 'main' ? <><TonePanel title="Available balance"><Text style={{ color: t.colors.primary, fontSize: 28, lineHeight: 34, fontWeight: '700' }}>— points</Text></TonePanel><ResponsiveActions><Button title="Buy points" variant="primary" onPress={() => setStep('buy')} /><Button title="Transfer out" onPress={() => setStep('transfer')} /></ResponsiveActions><Text accessibilityRole="header">Recent activity</Text><Card><Text>No activity yet.</Text></Card></> : step === 'buy' ? <><PageHeading title="Choose a points package" />{[['500 points', '$5.00'], ['1,200 points', '$10.00'], ['2,500 points', '$20.00']].map(([label, price]) => <Card key={label}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '600' }}>{label}</Text><Text style={{ color: t.colors.primary }}>{price}</Text></View></Card>)}<Button title="Continue to payment" disabled /></> : <><PageHeading title="Transfer points out" /><TextInput accessibilityLabel="Points amount" placeholder="— points" editable={false} /><TextInput accessibilityLabel="Transfer method" placeholder="No account connected" editable={false} /><Button title="Review transfer" disabled /></> : <><PageHeading title={title} />{kind === 'skills' ? <><Card><Text accessibilityRole="header">Everyday support</Text><Text>Grocery pickup · Rides · Companionship</Text></Card><TextInput accessibilityLabel="Availability" placeholder="Add your availability" editable={false} /></> : kind === 'certificates' ? <Card><Text accessibilityRole="header">Your certificates</Text><Text>No certificates yet.</Text><Button title="Add a certificate" disabled /></Card> : <Card><Text accessibilityRole="header">Payment methods</Text><Text>No payment methods yet.</Text><Button title="Add payment method" disabled /></Card>}</>}
  </>;
}
