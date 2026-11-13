import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from './ui';
import { theme as t } from '../theme';
import { CalendarGrid } from './CalendarGrid';
import { shiftMonth } from '../utils/calendar';
import { composeTaskTime, shiftTaskDate, taskClockChoices, taskClockLabel, taskDatePart, taskDayLabel, taskClockPart } from '../utils/task-time';

// The Figma frame draws one Date field with Start and End time beside it,
// not two full date-times. Start carries the date; End reuses it and rolls to
// the next day when it is at or before the start, so an overnight task still
// stores two correctly ordered instants.
const ROW = 48;

function Choice({ label, selected, press }: { label: string; selected: boolean; press: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={press}
    style={({ pressed }) => [{ minHeight: ROW, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, pressed && { opacity: 0.6 }]}>
    <Text style={[{ fontSize: 17, lineHeight: 22 }, selected && { color: t.colors.primary, fontWeight: '600' }]}>{label}</Text>
    {selected && <Feather name="check" size={18} color={t.colors.primary} />}
  </Pressable>;
}

// A scrollable window onto the day, opened at the chosen time (or a plausible
// morning start) rather than at midnight.
function ClockList({ label, value, change }: { label: string; value: string; change: (clock: string) => void }) {
  const choices = taskClockChoices(value);
  const list = useRef<ScrollView>(null);
  const offset = Math.max(0, choices.findIndex(choice => choice.value === (value || '09:00')) - 1) * ROW;
  return <View style={{ gap: 4 }}>
    <Text style={{ fontSize: 13.5, color: t.colors.muted, fontWeight: '600' }}>{label}</Text>
    <ScrollView ref={list} nestedScrollEnabled style={{ maxHeight: ROW * 5 }}
      onContentSizeChange={() => { if (offset > 0) list.current?.scrollTo({ y: offset, animated: false }); }}>
      {choices.map(choice => <Choice key={choice.value} label={choice.label} selected={choice.value === value} press={() => change(choice.value)} />)}
    </ScrollView>
  </View>;
}

export function TaskSchedulePicker({ start, end, changeStart, changeEnd, disabled }: { start: string; end: string; changeStart: (value: string) => void; changeEnd: (value: string) => void; disabled?: boolean }) {
  const date = taskDatePart(start) || taskDatePart(end);
  const startClock = taskClockPart(start), endClock = taskClockPart(end);
  const [month, setMonth] = useState(() => (date || new Date().toISOString().slice(0, 10)).slice(0, 7));

  // One date drives both ends; the end rolls over when it is not after the start.
  const apply = (nextDate: string, nextStart: string, nextEnd: string) => {
    changeStart(nextStart && nextDate ? composeTaskTime(nextDate, nextStart) : '');
    if (!nextEnd || !nextDate) { changeEnd(''); return; }
    const endDate = nextStart && nextEnd <= nextStart ? shiftTaskDate(nextDate, 1) || nextDate : nextDate;
    changeEnd(composeTaskTime(endDate, nextEnd));
  };

  return <View style={{ gap: 16 }}>
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13.5, color: t.colors.muted, fontWeight: '600' }}>Date</Text>
      <CalendarGrid month={month} selected={date} range={{ start: shiftMonth(month, -1) + '-01', end: shiftMonth(month, 2) + '-01' }}
        taskCounts={new Map()} busy={Boolean(disabled)} changeMonth={setMonth}
        select={next => apply(next, startClock || '09:00', endClock)} />
    </View>
    <ClockList label="Start time" value={startClock} change={clock => apply(date || new Date().toISOString().slice(0, 10), clock, endClock)} />
    <ClockList label="End time" value={endClock} change={clock => apply(date || new Date().toISOString().slice(0, 10), startClock || '09:00', clock)} />
    {taskDatePart(end) && taskDatePart(end) !== date ? <Text style={{ fontSize: 13.5, color: t.colors.muted }}>Ends {taskDayLabel(taskDatePart(end))}.</Text> : null}
  </View>;
}

export function scheduleSummary(start: string, end: string) {
  const date = taskDatePart(start) || taskDatePart(end);
  if (!date) return 'Choose a date and time';
  const startClock = taskClockPart(start), endClock = taskClockPart(end);
  const times = [startClock && taskClockLabel(startClock), endClock && taskClockLabel(endClock)].filter(Boolean).join(' – ');
  return times ? `${taskDayLabel(date)} · ${times}` : taskDayLabel(date);
}
