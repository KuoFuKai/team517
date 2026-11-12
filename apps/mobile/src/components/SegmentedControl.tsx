import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './ui';
import { theme as t } from '../theme';
export function SegmentedControl<T extends string>({ value, options, onChange, disabled = false }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean }) {
  return <View style={s.track}>{options.map(option => <Pressable key={option.value} accessibilityRole="tab" accessibilityLabel={option.label} accessibilityState={{ selected: value === option.value, disabled }} disabled={disabled} onPress={() => onChange(option.value)} style={[s.option, value === option.value && s.selected]}><Text style={[s.label, value === option.value && s.active]}>{option.label}</Text></Pressable>)}</View>;
}
const s = StyleSheet.create({ track: { flexDirection: 'row', backgroundColor: t.colors.accent, borderRadius: 12, padding: 4 }, option: { flex: 1, minHeight: 44, paddingHorizontal: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 9 }, selected: { backgroundColor: t.colors.surface }, label: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: t.colors.muted }, active: { color: t.colors.primary } });
