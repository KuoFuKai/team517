import { MessagingScreen } from './src/screens/MessagingScreen';
import { PushSettings } from './src/screens/PushSettings';
import { usePush } from './src/hooks/usePush';
import { beforeLogout } from './src/push/session';
import { CommunityScreen } from './src/screens/CommunityScreen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollResetContext } from './src/navigation/scroll';
import { ScrollView, StyleSheet, KeyboardAvoidingView, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import type { CareContextDto, TaskDetailDto } from '@team517/contracts';
import { auth } from './src/auth/firebase';
import * as api from './src/api/client';
import { useSession } from './src/hooks/useSession';
import { useHardwareBack } from './src/navigation/useHardwareBack';
import { theme as t } from './src/theme';
import { friendlyError } from './src/utils/presentation';
import { AppHeader, BottomNavigation, type MainTab } from './src/components/AppChrome';
import { SegmentedControl } from './src/components/SegmentedControl';
import { createPostDraftSession } from './src/navigation/post-draft';
import { Button, Text, Card, EmptyState, ErrorState, LoadingState } from './src/components/ui';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CareContextsScreen } from './src/screens/CareContextsScreen';
import { CreateCareContextScreen } from './src/screens/CreateCareContextScreen';
import { TaskWorkspace } from './src/screens/TaskWorkspace';
import { DiscoveryWorkspace } from './src/screens/DiscoveryWorkspace';
import { MyWorkScreen } from './src/screens/MyWorkScreen';
import { SupportScreen } from './src/screens/SupportScreen';

export default function App() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const scroll = useRef<ScrollView>(null);
  const resetScroll = useCallback(() => scroll.current?.scrollTo({ y: 0, animated: false }), []);
  const session = useSession();
  const { user, profile, setProfile } = session;
  const [tab, setTab] = useState<MainTab>('tasks'), [overlay, setOverlay] = useState<'inbox' | 'notifications' | 'verification' | 'create' | null>(null);
  const [circleTasks, setCircleTasks] = useState(false);
  const [postDraftId, setPostDraftId] = useState<string | null>(null);
  const postDraftSession = useRef(createPostDraftSession<TaskDetailDto>()).current;
  useEffect(() => { const frame = requestAnimationFrame(resetScroll); return () => cancelAnimationFrame(frame); }, [tab, overlay, circleTasks, resetScroll]);
  const [contexts, setContexts] = useState<CareContextDto[]>([]), [context, setContext] = useState<CareContextDto | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [unread, setUnread] = useState(false), [messageUnread, setMessageUnread] = useState(false);
  const lock = useRef(false);
  const [pushId, setPushId] = useState<string | null>(null), [pushRefresh, setPushRefresh] = useState(0);
  usePush(profile?.id, () => setPushRefresh(n => n + 1), setPushId);
  const helperMode = (profile?.lastActiveRole ?? profile?.primaryOnboardingRole) === 'HELPER';
  const run = async (work: () => Promise<void>) => {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { await work(); } catch (e) { setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); }
  };
  const loadContexts = async () => {
    const uid = auth.currentUser?.uid;
    const data = await api.listCareContexts();
    if (auth.currentUser?.uid !== uid) return;
    setContexts(data.careContexts); setContext(current => data.careContexts.find(c => c.id === current?.id) ?? data.careContexts[0] ?? null);
  };
  useEffect(() => { setContexts([]); setContext(null); setTab('tasks'); setOverlay(null); setError(''); setUnread(false); setMessageUnread(false); setCircleTasks(false); setPostDraftId(null); postDraftSession.reset(); }, [user?.uid]);
  // Auth restoration resets navigation first. Apply a queued notification only
  // after the session is ready so the initial account reset cannot erase it.
  useEffect(() => {
    if (session.ready && profile && pushId) setOverlay('notifications');
  }, [session.ready, profile?.id, pushId]);
  useEffect(() => { if (profile) void run(loadContexts); }, [profile?.id]);
  useEffect(() => {
    let active = true;
    if (profile) void api.listConversations().then(result => { if (active) setMessageUnread(result.conversations.some(c => c.unreadCount > 0)); }).catch(() => {});
    if (profile) void api.getNotifications().then(result => { if (active) setUnread(result.notifications.some(n => !n.readAt)); }).catch(() => {});
    return () => { active = false; };
  }, [profile?.id, tab, overlay, pushRefresh]);
  const navigate = (next: MainTab) => { if (next === 'post' && tab !== 'post') { setPostDraftId(null); postDraftSession.reset(); } setTab(next); setOverlay(null); setError(''); setCircleTasks(false); };
  useHardwareBack(() => { if (overlay) { setOverlay(null); return true; } if (tab !== 'tasks') { navigate('tasks'); return true; } return false; });
  const titles: Record<MainTab, string> = { community: 'Community', tasks: helperMode ? 'Your caregiving tasks' : 'Your tasks', calendar: 'Your tasks', discover: 'Find nearby tasks', circle: 'Your circle', me: 'Your profile', post: 'Post a task', messages: 'Messages' };
  const title = !user ? 'Care starts together' : !profile ? 'Welcome to team517' : overlay === 'inbox' ? 'Inbox' : overlay === 'notifications' ? 'Notifications' : overlay === 'verification' ? 'Verification' : overlay === 'create' ? 'Create your circle' : titles[tab];
  return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={t.colors.canvas} />
    <AppHeader title={title} contextLabel={profile ? helperMode ? 'Caregiver' : context?.name ?? 'Your care circle' : undefined} changeContext={() => navigate(helperMode ? 'me' : 'circle')} unread={unread} notifications={profile ? () => { setOverlay('notifications'); setError(''); } : undefined} disabled={busy} />
    <KeyboardAvoidingView style={s.flex} behavior="padding">
      <ScrollView ref={scroll} nestedScrollEnabled keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={s.scroll}>
        <ScrollResetContext.Provider value={resetScroll}><View style={s.content}>
          {!session.ready ? <LoadingState label="Getting things ready…" /> : !user ? <AuthScreen busy={busy} authenticate={(email, password, register) => void run(async () => {
            try { if (register) await createUserWithEmailAndPassword(auth, email, password); else await signInWithEmailAndPassword(auth, email, password); }
            catch { setError('We could not sign you in. Check your email, password and connection.'); }
          })} /> : !profile ? <>
            {session.needsInitialization ? <HomeScreen busy={busy} profile={null} initialize={role => void run(async () => { setProfile(await api.initializeUser({ primaryOnboardingRole: role })); })} loadUser={() => {}} switchRole={() => {}} /> : <><ErrorState message={session.error || 'We could not load your account.'} /><Button title="Try again" disabled={busy} onPress={() => void run(async () => setProfile(await api.getCurrentUser()))} /></>}
            <Button title="Sign out" disabled={busy} onPress={() => void run(async () => { await beforeLogout(); await signOut(auth); })} />
          </> : <>
            {overlay === 'create' ? <><Button title="Back to circle" onPress={() => setOverlay(null)} /><CreateCareContextScreen busy={busy} create={name => void run(async () => { const created = await api.createCareContext({ name }); setContext(created); setContexts(list => [created, ...list]); setCircleTasks(true); setOverlay(null); setTab('tasks'); await loadContexts(); })} /></> : overlay === 'inbox' ? <MessagingScreen back={() => setOverlay(null)} updates={() => setOverlay('notifications')} /> : overlay === 'notifications' || overlay === 'verification' ? <SupportScreen key={overlay} mode={overlay} pushId={pushId} consumePush={() => setPushId(null)} onNotificationsLoaded={setUnread} back={() => setOverlay(null)} /> : <>
              {(tab === 'tasks' || tab === 'post') && (tab === 'tasks' && helperMode && !circleTasks ? <><SegmentedControl value="status" options={[{ value: 'calendar', label: 'Calendar' }, { value: 'status', label: 'By status' }]} onChange={value => { if (value === 'calendar') navigate('calendar'); }} /><MyWorkScreen back={() => navigate('me')} /></> : context ? <TaskWorkspace key={context.id + (tab === 'post' ? '-post' : '-tasks')} context={context} viewerId={user.uid} helper={profile.roles.includes('HELPER')} createOnOpen={tab === 'post'} initialDraftId={postDraftId} createDraftRequest={() => postDraftSession.get(() => api.createTaskDraft(context.id, {}))} onDraftCreated={id => { if (auth.currentUser?.uid === user.uid) setPostDraftId(id); }} finishPost={() => navigate('tasks')} calendar={() => navigate('calendar')} back={() => navigate('circle')} /> : <><EmptyState title="A place for your care" message="Choose or create a care circle to begin planning tasks." /><Button title="Go to my circle" onPress={() => navigate('circle')} /></>)}
              {tab === 'community' && <CommunityScreen />}
              {tab === 'discover' && <DiscoveryWorkspace back={() => navigate('tasks')} />}
              {tab === 'calendar' && <><SegmentedControl value="calendar" options={[{ value: 'calendar', label: 'Calendar' }, { value: 'status', label: 'By status' }]} onChange={value => { if (value === 'status') navigate('tasks'); }} /><SupportScreen mode="calendar" back={() => navigate('tasks')} /></>}
              {tab === 'messages' && <MessagingScreen back={() => navigate('tasks')} updates={() => setOverlay('notifications')} />}
              {tab === 'circle' && <><Button title="Messages" onPress={() => setOverlay('inbox')} /><CareContextsScreen contexts={contexts} busy={busy} canCreate={profile.roles.includes('CARE_MANAGER')} refresh={() => void run(loadContexts)} create={() => setOverlay('create')} open={id => void run(async () => { setContext(await api.getCareContext(id)); setCircleTasks(true); setTab('tasks'); })} /></>}
              {tab === 'me' && <><Card><Text accessibilityRole="header">{user.email}</Text><Text>Your account and care preferences.</Text></Card><HomeScreen busy={busy} profile={profile} initialize={() => {}} loadUser={() => void run(async () => setProfile(await api.getCurrentUser()))} switchRole={role => void run(async () => { setProfile(await api.updateRolePreference({ lastActiveRole: role })); navigate('tasks'); })} /><Button title="Your care circle" onPress={() => navigate('circle')} /><Button title="Messages" onPress={() => setOverlay('inbox')} /><PushSettings /><Button title="Verification status" onPress={() => setOverlay('verification')} /><Button title="Notifications" onPress={() => setOverlay('notifications')} /><Button title="Sign out" disabled={busy} onPress={() => void run(async () => { await beforeLogout(); await signOut(auth); })} /></>}
            </>}
          </>}
          {busy && <LoadingState label="One moment…" />}{error ? <ErrorState message={error} /> : null}
        </View></ScrollResetContext.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
    {user && profile && <BottomNavigation active={tab} helper={helperMode} disabled={busy} messageUnread={messageUnread} change={navigate} />}
  </SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: t.colors.canvas }, flex: { flex: 1 }, scroll: { flexGrow: 1, paddingHorizontal: t.screenPadding, paddingBottom: 32 }, content: { width: '100%', maxWidth: t.contentWidth, alignSelf: 'center', gap: 14 } });
