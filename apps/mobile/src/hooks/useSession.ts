import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { UserDto } from '@team517/contracts';
import { auth } from '../auth/firebase';
import * as api from '../api/client';
import { friendlyError } from '../utils/presentation';
export function useSession() {
  const [user, setUser] = useState<User | null>(null), [profile, setProfile] = useState<UserDto | null>(null);
  const [ready, setReady] = useState(false), [needsInitialization, setNeedsInitialization] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, current => {
      const ticket = ++revision; setUser(current); setProfile(null); setError(''); setNeedsInitialization(false); setReady(false);
      if (!current) { setReady(true); return; }
      void api.getCurrentUser().then(value => { if (ticket === revision) setProfile(value); }).catch(e => {
        if (ticket !== revision) return;
        if (e.code === 'USER_NOT_FOUND') setNeedsInitialization(true); else setError(friendlyError(e));
      }).finally(() => { if (ticket === revision) setReady(true); });
    });
    return () => { revision++; unsubscribe(); };
  }, []);
  return { user, profile, setProfile, ready, needsInitialization, error };
}
