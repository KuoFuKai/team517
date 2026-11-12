import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Text, Button } from './ui';
import { theme as t } from '../theme';
export type MainTab = 'tasks' | 'calendar' | 'discover' | 'circle' | 'me' | 'community';
const items: { id: MainTab; label: string; icon: string }[] = [{ id: 'tasks', label: 'Tasks', icon: '☷' }, { id: 'calendar', label: 'Calendar', icon: '▦' }, { id: 'discover', label: 'Find tasks', icon: '⌕' }, { id: 'community', label: 'Community', icon: '◇' }, { id: 'me', label: 'Me', icon: '○' }];
export function BottomNavigation({ active, helper, disabled, change }: { active: MainTab; helper: boolean; disabled: boolean; change: (tab: MainTab) => void }) {
  return <View style={s.nav}>{items.filter(i => helper || i.id !== 'discover').map(i => <Pressable key={i.id} accessibilityRole="tab" accessibilityLabel={i.label} accessibilityState={{ selected: active === i.id, disabled }} disabled={disabled} onPress={() => change(i.id)} style={[s.tab, active === i.id && s.active]}>
    <Text style={[s.icon, active === i.id && s.selected]}>{i.icon}</Text><Text style={[s.label, active === i.id && s.selected]}>{i.label}</Text>
  </Pressable>)}</View>;
}
export function AppHeader({ title, subtitle, unread, notifications, disabled }: { title: string; subtitle?: string; unread: boolean; notifications?: () => void; disabled?: boolean }) {
  return <View style={s.header}><View style={s.heading}><Text style={s.brand}>team517</Text><Text accessibilityRole="header">{title}</Text>{subtitle && <Text style={s.subtitle}>{subtitle}</Text>}</View>{notifications && <Button disabled={disabled} title={unread ? 'Inbox •' : 'Inbox'} accessibilityLabel={unread ? 'Inbox, unread messages or updates' : 'Inbox'} onPress={notifications} />}</View>;
}
const s = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: t.screenPadding, gap: 12, backgroundColor: t.colors.canvas }, heading: { flex: 1 }, brand: { fontSize: 12, letterSpacing: 2, color: t.colors.primary, fontWeight: '700' }, subtitle: { color: t.colors.muted, fontSize: 12 }, nav: { flexDirection: 'row', backgroundColor: t.colors.surface, borderTopWidth: 1, borderColor: t.colors.border, paddingVertical: 8, paddingHorizontal: 8, paddingBottom: Platform.OS === 'android' ? t.space.xl : t.space.sm }, tab: { flex: 1, minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 12, paddingVertical: 6 }, active: { backgroundColor: t.colors.primarySoft }, icon: { fontSize: 22, color: t.colors.muted, lineHeight: 25 }, label: { fontSize: 11, color: t.colors.muted }, selected: { color: t.colors.primary, fontWeight: '700' } });
