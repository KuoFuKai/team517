import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Button, Text, ErrorState } from './ui';
import { theme as t } from '../theme';
import { useScreenHeader } from './ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
export function ConfirmationSheet({ title, message, confirm, dismiss, busy, error, confirmLabel = 'Cancel post', dismissLabel = 'Keep post' }: { title: string; message: string; confirm: () => void; dismiss: () => void; busy: boolean; error?: string; confirmLabel?: string; dismissLabel?: string }) {
  return <Modal transparent animationType="slide" onRequestClose={() => { if (!busy) dismiss(); }}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,43,61,.35)' }}><Pressable accessibilityLabel="Keep task and close confirmation" disabled={busy} onPress={dismiss} style={{ flex: 1 }} /><SafeAreaView edges={['bottom']} style={{ backgroundColor: t.colors.canvas, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}><View style={{ padding: 20, gap: 16 }}><Text accessibilityRole="header">{title}</Text><Text style={{ color: t.colors.muted }}>{message}</Text>{error && <ErrorState message={error} />}<Button variant="outline" title={dismissLabel} disabled={busy} onPress={dismiss} /><Button variant="danger" title={confirmLabel} disabled={busy} onPress={confirm} /></View></SafeAreaView></View></Modal>;
}
export function SuccessScreen({ header, title, message, done, action = 'View my tasks' }: { header: string; title: string; message: string; done: () => void; action?: string }) {
  useScreenHeader({ title: header, back: done, priority: 4 });
  useHardwareBack(() => { done(); return true; }, 4);
  return <View style={{ flexGrow: 1, justifyContent: 'center', gap: 20, paddingVertical: 48 }}><View style={{ alignItems: 'center', gap: 24 }}><View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={64} color={t.colors.surface} /></View><Text accessibilityRole="header" style={{ fontSize: 28, lineHeight: 34, textAlign: 'center' }}>{title}</Text><Text style={{ color: t.colors.muted, textAlign: 'center' }}>{message}</Text></View><Button variant="primary" title={action} onPress={done} /></View>;
}
