import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from './ui';
import { theme as t } from '../theme';
export function SegmentedControl<T extends string>({ value, options, onChange, disabled = false }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const minimum = Math.max(...options.map(option => Math.max(80, option.label.length * 7 + 20))) * Math.max(1, fontScale);
  const scrollable = width > 0 && minimum * options.length > width - 8;
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)}><ScrollView horizontal scrollEnabled={scrollable} showsHorizontalScrollIndicator={false} contentContainerStyle={[s.track, !scrollable && { flexGrow: 1 }]} >{options.map(option => <Pressable key={option.value} accessibilityRole="tab" accessibilityLabel={option.label} accessibilityState={{ selected: value === option.value, disabled }} disabled={disabled} onPress={() => onChange(option.value)} style={[s.option, { minWidth: scrollable ? minimum : 0 }, value === option.value && s.selected]}><Text numberOfLines={1} style={[s.label, value === option.value && s.active]}>{option.label}</Text></Pressable>)}</ScrollView></View>;
}
const s = StyleSheet.create({ track: { flexDirection: 'row', backgroundColor: t.colors.accent, borderRadius: 12, padding: 4 }, option: { flex: 1, minHeight: 44, paddingHorizontal: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 9 }, selected: { backgroundColor: t.colors.surface }, label: { fontSize: 13.5, lineHeight: 20, fontWeight: '600', color: t.colors.muted }, active: { color: t.colors.primary } });
