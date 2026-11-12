import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { countLabel } from '../utils/presentation';
import { Text } from './ui';
import { theme as t } from '../theme';
import { calendarDateLabel, monthCells, shiftMonth, type CalendarRange } from '../utils/calendar';
export function CalendarGrid({ month, selected, range, taskCounts, busy, changeMonth, select }: { month: string; selected: string; range: CalendarRange; taskCounts: Map<string, number>; busy: boolean; changeMonth: (month: string) => void; select: (date: string) => void }) {
  return <View style={s.calendar}>
    <View style={s.heading}><Text style={s.month}>{calendarDateLabel(month + '-01', { month: 'long', year: 'numeric' })}</Text><View style={s.arrows}><Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={busy} accessibilityState={{ disabled: busy }} onPress={() => changeMonth(shiftMonth(month, -1))} style={s.arrow}><Feather name="chevron-left" size={18} color={busy ? t.colors.border : t.colors.ink} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next month" disabled={busy} accessibilityState={{ disabled: busy }} onPress={() => changeMonth(shiftMonth(month, 1))} style={s.arrow}><Feather name="chevron-right" size={18} color={busy ? t.colors.border : t.colors.ink} /></Pressable></View></View>
    <View style={s.week}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <Text key={i} style={s.weekday}>{day}</Text>)}</View>
    <View style={s.grid}>{monthCells(month).map((date, index) => {
      if (!date) return <View key={'blank-' + index} style={s.cell} />;
      const outside = date < range.start || date >= range.end;
      const disabled = busy || outside;
      return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${calendarDateLabel(date)}${outside ? ', outside loaded range' : taskCounts.has(date) ? ', ' + countLabel(taskCounts.get(date)!, 'task') : ', no loaded tasks'}`} accessibilityState={{ selected: date === selected, disabled }} disabled={disabled} onPress={() => select(date)} style={s.cell}><View style={[s.day, date === selected && s.selected]}><Text style={[s.number, outside && { color: t.colors.border }, date === selected && s.selectedText]}>{Number(date.slice(-2))}</Text>{taskCounts.has(date) && <View style={[s.marker, date === selected && s.selectedMarker]} />}</View></Pressable>;
    })}</View>
  </View>;
}
const s = StyleSheet.create({ calendar: { gap: 8 }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, month: { fontSize: 18, fontWeight: '600', lineHeight: 24, color: t.colors.ink }, arrows: { flexDirection: 'row', gap: 4 }, arrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }, week: { flexDirection: 'row' }, weekday: { width: '14.2857%', textAlign: 'center', color: t.colors.muted, fontSize: 14, lineHeight: 22 }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, cell: { width: '14.2857%', height: 46, alignItems: 'center', justifyContent: 'center' }, day: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, selected: { backgroundColor: t.colors.primary, borderRadius: 18 }, number: { color: t.colors.ink, fontSize: 14, lineHeight: 20 }, selectedText: { color: t.colors.surface }, marker: { position: 'absolute', width: 3, height: 3, borderRadius: 2, bottom: 3, backgroundColor: t.colors.primary }, selectedMarker: { backgroundColor: t.colors.surface } });
