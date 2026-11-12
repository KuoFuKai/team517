import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { notificationsModule } from '../push/native';
import { refreshPush } from '../push/session';
export function usePush(uid: string | undefined, foreground: () => void, tapped: (id: string) => void) {
  const current = useRef({ uid, foreground, tapped });
  current.current = { uid, foreground, tapped };
  const lastResponse = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    const cleanup: (() => void)[] = [];
    void notificationsModule().then(async n => {
      if (!n || !active) return;
      n.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }) });
      const open = (response: import('expo-notifications').NotificationResponse) => {
        const id: unknown = response.notification.request.content.data?.notificationId;
        if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) return;
        const receipt = response.notification.request.identifier + ':' + response.actionIdentifier;
        n.clearLastNotificationResponse();
        if (lastResponse.current === receipt) return;
        lastResponse.current = receipt;
        current.current.tapped(id);
      };
      const received = n.addNotificationReceivedListener(() => { if (active) current.current.foreground(); });
      const response = n.addNotificationResponseReceivedListener(r => { if (active) open(r); });
      const token = n.addPushTokenListener(value => { if (active && current.current.uid) void refreshPush(false, String(value.data)).catch(() => {}); });
      cleanup.push(() => received.remove(), () => response.remove(), () => token.remove());
      const last = await n.getLastNotificationResponseAsync();
      if (active && last) open(last);
    }).catch(() => {});
    const app = AppState.addEventListener('change', state => { if (active && current.current.uid && state === 'active') void refreshPush().catch(() => {}); });
    return () => { active = false; cleanup.forEach(fn => fn()); app.remove(); };
  }, []);
  useEffect(() => {
    if (uid) void refreshPush().catch(() => {}); // Existing grant only; never prompts on sign-in.
  }, [uid]);
}
