import { compactNavigation, navigationLabel } from '../utils/responsive';
import type { HeaderOptions } from './ScreenHeader';
import React from 'react';
import { View, Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from './ui';
import { theme as t } from '../theme';
import { navigationItems, type MainTab } from '../navigation/tabs';
export type { MainTab } from '../navigation/tabs';
export function BottomNavigation({ active, helper, disabled, change, messageUnread = false }: { active: MainTab; helper: boolean; disabled: boolean; change: (tab: MainTab) => void; messageUnread?: boolean }) {
  const { width, fontScale } = useWindowDimensions();
  const compact = compactNavigation(width, fontScale);
  return <View style={s.nav}>{navigationItems(helper).map(item => {
    const selected = item.id === active || active === 'calendar' && item.id === 'tasks';
    const post = item.id === 'post';
    return <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => change(item.id)} style={s.tab}>
      <View style={post ? s.post : s.iconSlot}><Feather name={item.icon} size={post ? 27 : 22} color={post ? t.colors.surface : selected ? t.colors.primary : t.colors.muted} />{messageUnread && (item.id === 'messages' || item.id === 'circle') && <View style={s.dot} />}</View>
      <Text numberOfLines={1} style={[s.label, (selected || post) && s.selected]}>{navigationLabel(item.label, compact)}</Text>
    </Pressable>;
  })}</View>;
}
export function AppHeader({ title, contextLabel, changeContext, unread, notifications, disabled, detail, titleSize = 28 }: { titleSize?: number; detail?: HeaderOptions; title: string; contextLabel?: string; changeContext?: () => void; unread: boolean; notifications?: () => void; disabled?: boolean }) {
  if (detail && (detail.priority ?? 0) >= 0) return <View style={s.detailHeader}>{detail.back && <Pressable accessibilityRole="button" accessibilityLabel="Back" disabled={detail.disabled} onPress={detail.back} style={s.bell}><Feather name="chevron-left" size={25} color={t.colors.ink} /></Pressable>}<Text numberOfLines={1} style={s.detailTitle}>{detail.title}</Text><View style={{ width: 44 }} /></View>;
  if (!contextLabel) return <View style={s.authHeader}><Image source={require('../../assets/logo-wordmark.png')} style={{ width: 132, height: 81 }} resizeMode="contain" accessibilityLabel="517" /><Text style={{ color: t.colors.ink }}>Care, <Text style={{ color: t.colors.terracotta }}>shared.</Text></Text></View>;
  return <View style={s.header}><View style={s.top}><Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="Change care circle or role" onPress={changeContext} style={s.context}><Text numberOfLines={1} style={s.contextText}>{contextLabel}</Text><Feather name="chevron-down" size={18} color={t.colors.muted} /></Pressable>{notifications && <Pressable accessibilityRole="button" accessibilityLabel={unread ? 'Notifications, unread updates' : 'Notifications'} disabled={disabled} onPress={notifications} style={s.bell}><Feather name="bell" size={23} color={t.colors.ink} />{unread && <View style={s.dot} />}</Pressable>}</View>{title ? <Text accessibilityRole="header" style={[s.title, { fontSize: titleSize }]}>{title}</Text> : null}</View>;
}
const s = StyleSheet.create({ detailHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8 }, detailTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontWeight: '700', fontSize: 22, lineHeight: 28 }, header: { paddingHorizontal: t.screenPadding, paddingTop: 12, paddingBottom: 16, backgroundColor: t.colors.canvas }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, context: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minHeight: 44 }, contextText: { flexShrink: 1, minWidth: 0, fontSize: 22, lineHeight: 28, fontWeight: '700', color: t.colors.ink }, bell: { flexShrink: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, title: { color: t.colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '700', marginTop: 12 }, authHeader: { padding: t.screenPadding, alignItems: 'center' }, brand: { color: t.colors.ink, fontSize: 22, fontWeight: '700' }, nav: { flexDirection: 'row', backgroundColor: t.colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border, paddingVertical: 6, paddingHorizontal: 6 }, tab: { flex: 1, minWidth: 0, minHeight: 70, alignItems: 'center', justifyContent: 'center', gap: 3 }, iconSlot: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' }, post: { width: 48, height: 48, marginTop: -16, borderRadius: 24, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center' }, label: { fontSize: 12, lineHeight: 16, color: t.colors.muted }, selected: { color: t.colors.primary, fontWeight: '600' }, dot: { position: 'absolute', top: 6, right: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.primary, borderWidth: 1, borderColor: t.colors.surface } });
