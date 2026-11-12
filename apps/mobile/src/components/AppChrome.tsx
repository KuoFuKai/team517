import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from './ui';
import { theme as t } from '../theme';
import { navigationItems, type MainTab } from '../navigation/tabs';
export type { MainTab } from '../navigation/tabs';
export function BottomNavigation({ active, helper, disabled, change, messageUnread = false }: { active: MainTab; helper: boolean; disabled: boolean; change: (tab: MainTab) => void; messageUnread?: boolean }) {
  return <View style={s.nav}>{navigationItems(helper).map(item => {
    const selected = item.id === active || active === 'calendar' && item.id === 'tasks';
    const post = item.id === 'post';
    return <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => change(item.id)} style={s.tab}>
      <View style={post ? s.post : s.iconSlot}><Feather name={item.icon} size={post ? 27 : 22} color={post ? t.colors.surface : selected ? t.colors.primary : t.colors.muted} />{messageUnread && (item.id === 'messages' || item.id === 'circle') && <View style={s.dot} />}</View>
      <Text style={[s.label, (selected || post) && s.selected]}>{item.label}</Text>
    </Pressable>;
  })}</View>;
}
export function AppHeader({ title, contextLabel, changeContext, unread, notifications, disabled }: { title: string; contextLabel?: string; changeContext?: () => void; unread: boolean; notifications?: () => void; disabled?: boolean }) {
  // Product wordmark and tagline from the 517 brand style guide. Package,
  // project and backend naming stay team517.
  if (!contextLabel) return <View style={s.authHeader}>
    <Image source={require('../../assets/logo-wordmark.png')} style={s.brand} resizeMode="contain" accessibilityRole="image" accessibilityLabel="517" />
    <Text style={s.tagline}>Care, <Text style={s.taglineAccent}>shared.</Text></Text>
  </View>;
  return <View style={s.header}><View style={s.top}><Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="Change care circle or role" onPress={changeContext} style={s.context}><Text style={s.contextText}>{contextLabel}</Text><Feather name="chevron-down" size={18} color={t.colors.muted} /></Pressable>{notifications && <Pressable accessibilityRole="button" accessibilityLabel={unread ? 'Notifications, unread updates' : 'Notifications'} disabled={disabled} onPress={notifications} style={s.bell}><Feather name="bell" size={23} color={t.colors.ink} />{unread && <View style={s.dot} />}</Pressable>}</View><Text accessibilityRole="header" style={s.title}>{title}</Text></View>;
}
const s = StyleSheet.create({ header: { paddingHorizontal: t.screenPadding, paddingTop: 4, paddingBottom: 16, backgroundColor: t.colors.canvas }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, context: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minHeight: 44 }, contextText: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: t.colors.ink }, bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, title: { color: t.colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '700', marginTop: 8 }, authHeader: { padding: t.screenPadding, alignItems: 'center', gap: 2 }, brand: { width: 132, height: 81 }, tagline: { color: t.colors.ink, fontSize: 16, lineHeight: 22 }, taglineAccent: { color: t.colors.terracotta }, nav: { flexDirection: 'row', backgroundColor: t.colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border, paddingVertical: 6, paddingHorizontal: 6 }, tab: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 3 }, iconSlot: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' }, post: { width: 48, height: 48, marginTop: -16, borderRadius: 24, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center' }, label: { fontSize: 10, lineHeight: 14, color: t.colors.muted }, selected: { color: t.colors.primary, fontWeight: '600' }, dot: { position: 'absolute', top: 6, right: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.primary, borderWidth: 1, borderColor: t.colors.surface } });
