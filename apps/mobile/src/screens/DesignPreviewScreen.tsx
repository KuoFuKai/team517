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
  return <><Text style={{ fontSize: 13.5, color: t.colors.muted }}>Design preview · service not connected</Text>
    {kind === 'points' ? step === 'main' ? <><TonePanel title="Available balance"><Text style={{ color: t.colors.primary, fontSize: 28, lineHeight: 34, fontWeight: '700' }}>— points</Text></TonePanel><View style={{ flexDirection: 'row', gap: 12 }}><View style={{ flex: 1 }}><Button title="Buy points" variant="primary" onPress={() => setStep('buy')} /></View><View style={{ flex: 1 }}><Button title="Transfer out" onPress={() => setStep('transfer')} /></View></View><Text accessibilityRole="header">Recent activity</Text><Card><Text>No point activity is connected.</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>This preview does not purchase, reserve or transfer points.</Text></Card></> : step === 'buy' ? <><PageHeading title="Choose a points package" caption="Sample packages from the design. Purchases are disabled." />{[['500 points', '$5.00'], ['1,200 points', '$10.00'], ['2,500 points', '$20.00']].map(([label, price]) => <Card key={label}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '600' }}>{label}</Text><Text style={{ color: t.colors.primary }}>{price}</Text></View></Card>)}<Button title="Continue to payment · unavailable" disabled /></> : <><PageHeading title="Transfer points out" caption="Transfers are not connected." /><TextInput accessibilityLabel="Points amount" placeholder="— points" editable={false} /><TextInput accessibilityLabel="Transfer method" placeholder="No account connected" editable={false} /><Button title="Review transfer · unavailable" disabled /></> : <><PageHeading title={title} caption="This screen shows the intended layout. It does not collect or save information." />{kind === 'skills' ? <><Card><Text accessibilityRole="header">Everyday support</Text><Text>Grocery pickup · Rides · Companionship</Text></Card><TextInput accessibilityLabel="Availability" placeholder="Availability not connected" editable={false} /></> : kind === 'certificates' ? <Card><Text accessibilityRole="header">Your certificates</Text><Text>No certificates have been connected.</Text><Button title="Add a certificate · unavailable" disabled /></Card> : <Card><Text accessibilityRole="header">Payment methods</Text><Text>No payment method connected.</Text><Button title="Add payment method · unavailable" disabled /></Card>}</>}
  </>;
}
