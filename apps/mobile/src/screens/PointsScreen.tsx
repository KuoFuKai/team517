import { pointActivity } from '../utils/points';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { PointAccountDto, PointTransactionListDto } from '@team517/contracts';
import * as api from '../api/client';
import { Text, Button, Card } from '../components/ui';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { theme as t } from '../theme';
export function PointsScreen({ back }: { back: () => void }) {
  const [account, setAccount] = useState<PointAccountDto | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  const [history,setHistory]=useState<PointTransactionListDto | null>(null), [paging,setPaging]=useState(false);
  useScreenHeader({ title: 'My points', back, priority: 2 });
  useHardwareBack(() => { back(); return true; }, 2);
  useEffect(() => { let active = true; setLoading(true); setError('');
    void Promise.all([api.getPointAccount(),api.getPointTransactions()]).then(([value,activity]) => { if (active) {setAccount(value);setHistory(activity);} }).catch(() => { if (active) setError('Your points could not be loaded. Please try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  return <>
    {loading && <Text >Loading your points…</Text>}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {account && !loading && !error && <><View style={{backgroundColor:t.colors.primarySoft,borderRadius:12,padding:16,gap:8}}><Text style={{fontWeight:'600'}}>Available points</Text><Text accessibilityRole="header" style={{ color: t.colors.primary, fontSize: 44, lineHeight: 56 }}>{account.availablePoints.toLocaleString()}</Text><Text>points available</Text></View>
      <Card><View style={{ gap: 8 }}><Text accessibilityRole="header">{account.reservedPoints.toLocaleString()} points reserved</Text><Text>Reserved for active tasks. Points stay reserved until the task is completed or cancelled.</Text></View></Card>
      <Text>Points are for help within 517. They are separate from ratings and reviews.</Text>
      <Text accessibilityRole="header">Recent activity</Text>
      {history?.transactions.length===0 && <Card><Text>No activity yet. Points you receive or reserve for tasks will appear here.</Text></Card>}
      {history?.transactions.map(value=>{const row=pointActivity(value);return <Card key={value.id}><Text style={{fontWeight:'600'}}>{row.label}</Text><Text style={{color:t.colors.primary,fontSize:22,lineHeight:30}}>{row.amount}</Text><Text>{row.detail}</Text><Text style={{color:t.colors.muted}}>{new Date(value.createdAt).toLocaleString()}</Text></Card>;})}
      {history?.nextCursor && <Button title={paging ? 'Loading activity…' : 'More activity'} disabled={paging || loading} onPress={()=>{if(paging)return;setPaging(true);void api.getPointTransactions(history.nextCursor).then(page=>setHistory(old=>({...page,transactions:[...(old?.transactions ?? []),...page.transactions]}))).catch(()=>setError('More activity could not be loaded. Refresh and try again.')).finally(()=>setPaging(false));}} />}
      </>}
    <Button title={loading ? 'Refreshing…' : 'Refresh points'} disabled={loading || paging} onPress={() => setRevision(value => value + 1)} />
  </>;
}
