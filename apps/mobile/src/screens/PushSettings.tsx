import React, { useEffect, useRef, useState } from 'react';
import { Card, Text, Button, ErrorState } from '../components/ui';
import { refreshPush, disableCurrentPush } from '../push/session';
import { pushAvailable, notificationsModule } from '../push/native';
export function PushSettings() {
  const [status, setStatus] = useState(pushAvailable() ? 'Not checked' : 'Unavailable in Expo Go; Android development build required');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false), [permission, setPermission] = useState(pushAvailable() ? 'Checking' : 'Unavailable');
  const checkPermission = async () => { const n = await notificationsModule(); if (n) setPermission((await n.getPermissionsAsync()).status); };
  useEffect(() => { let active = true; void notificationsModule().then(async n => { if (!n) return; const p = await n.getPermissionsAsync(); if (active) setPermission(p.status); }).catch(() => { if (active) setPermission('Unavailable'); }); return () => { active = false; }; }, []);
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); await checkPermission(); } catch { setError('Push setup could not finish. In-app updates remain available. Try again after checking your connection and development-build configuration.'); } finally { lock.current = false; setBusy(false); } };
  return <Card><Text accessibilityRole="header">Device notifications</Text><Text>Allow generic task and message alerts on this device. Message text and private locations are never included. Your updates remain available in the app.</Text><Text>Permission: {permission}</Text><Text>{status}</Text>
    <Button title="Allow or refresh device notifications" disabled={busy || !pushAvailable()} onPress={() => void run(async () => setStatus(await refreshPush(true)))} />
    <Button title="Disable on this device" disabled={busy || !pushAvailable()} onPress={() => void run(async () => { await disableCurrentPush(true); setStatus('Disabled on this device'); })} />
    {error ? <ErrorState message={error} /> : null}</Card>;
}
