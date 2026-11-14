import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { PointAccountDto } from '@team517/contracts';
import * as api from '../api/client';
import { Text, Button, Card } from '../components/ui';
import { TonePanel } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { theme as t } from '../theme';
export function PointsScreen({ back }: { back: () => void }) {
  const [account, setAccount] = useState<PointAccountDto | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  useScreenHeader({ title: 'My points', back, priority: 2 });
  useHardwareBack(() => { back(); return true; }, 2);
  useEffect(() => { let active = true; setLoading(true); setError('');
    void api.getPointAccount().then(value => { if (active) setAccount(value); }).catch(() => { if (active) setError('Your points could not be loaded. Please try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  return <>
    {loading && <Text >Loading your points…</Text>}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {account && !error && <><TonePanel title="Available points"><Text style={{ color: t.colors.primary, fontSize: 44, lineHeight: 56 }}>{account.availablePoints.toLocaleString()}</Text><Text>points available</Text></TonePanel>
      <Card><View style={{ gap: 8 }}><Text accessibilityRole="header">{account.reservedPoints.toLocaleString()} points reserved</Text><Text>Reserved for active tasks. Points stay reserved until the task is completed or cancelled.</Text></View></Card>
      <Text>Points are for help within 517. They are separate from ratings and reviews.</Text></>}
    <Button title={loading ? 'Refreshing…' : 'Refresh points'} disabled={loading} onPress={() => setRevision(value => value + 1)} />
  </>;
}
