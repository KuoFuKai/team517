import React, { useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Modal, ScrollView, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { ConversationScreen } from '../screens/MessagingScreen';
import { AppHeader } from './AppChrome';
import { ScreenHeaderProvider, useHeaderRegistry } from './ScreenHeader';
import { ScrollResetContext } from '../navigation/scroll';
import { theme as t } from '../theme';
// A task/circle entry must open a focused conversation, not insert a full chat
// inside its Offer/profile card. The underlying task coordinator stays mounted.
export function ConversationModal({ id, close }: { id: string; close: () => void }) {
  const { register, header } = useHeaderRegistry();
  const scroll = useRef<ScrollView>(null);
  const resetScroll = useCallback(() => scroll.current?.scrollTo({ y: 0, animated: false }), []);
  return <Modal visible animationType="slide" onRequestClose={() => { if (!header?.disabled) close(); }}><SafeAreaProvider initialMetrics={initialWindowMetrics}><ScreenHeaderProvider value={register}><SafeAreaView style={{ flex: 1, backgroundColor: t.colors.canvas }}>
    <AppHeader title="Conversation" detail={header ?? { title: 'Conversation', back: close }} unread={false} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding"><ScrollView ref={scroll} nestedScrollEnabled keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: t.screenPadding, paddingBottom: 24 }}><ScrollResetContext.Provider value={resetScroll}><View style={{ width: '100%', maxWidth: t.contentWidth, alignSelf: 'center', gap: 14 }}><ConversationScreen id={id} back={close} /></View></ScrollResetContext.Provider></ScrollView></KeyboardAvoidingView>
  </SafeAreaView></ScreenHeaderProvider></SafeAreaProvider></Modal>;
}
