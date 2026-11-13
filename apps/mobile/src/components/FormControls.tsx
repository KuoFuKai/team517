import { ResponsiveActions } from './ResponsiveActions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from './ui';
import { theme as t } from '../theme';
import { CalendarGrid } from './CalendarGrid';
import { shiftMonth } from '../utils/calendar';
import { formatDateLabel, formatTimeLabel, monthOf, timeChoices } from '../utils/datetime';

// Form primitives for the Post a task screen, built to the Figma frame
// "3. post" (4:185). Each control is a Pressable that opens a sheet rather than
// a native picker, so the look is identical on both platforms.

// Label, optional hint, then the control. The hint sits above the input so a
// privacy warning is read before anything is typed into it.
export function Field({ label, hint, children }: React.PropsWithChildren<{ label: string; hint?: string }>) {
  return <View style={s.field}><Text style={s.label}>{label}</Text>{hint ? <Text style={s.hint}>{hint}</Text> : null}{children}</View>;
}

// One shared bottom sheet so every picker dismisses the same way, including Android back.
// `offset` opens a long list near its current value instead of at midnight.
function Sheet({ title, open, close, offset = 0, children }: React.PropsWithChildren<{ title: string; open: boolean; close: () => void; offset?: number }>) {
  const list = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  return <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
    <Pressable accessibilityRole="button" accessibilityLabel="Close" style={s.backdrop} onPress={close} />
    <View style={[s.sheet, { paddingBottom: insets.bottom }]}>
      <View style={s.sheetTop}>
        <Text accessibilityRole="header" style={s.sheetTitle}>{title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={s.sheetClose}><Feather name="x" size={22} color={t.colors.ink} /></Pressable>
      </View>
      <ScrollView ref={list} style={s.sheetBody} contentContainerStyle={s.sheetContent}
        onContentSizeChange={() => { if (offset > 0) list.current?.scrollTo({ y: offset, animated: false }); }}>{children}</ScrollView>
    </View>
  </Modal>;
}
const CHOICE_HEIGHT = 48;

// The closed state of every picker: a field-shaped button showing the current
// value, or the placeholder in a lighter tone when nothing is chosen yet.
function Trigger({ label, value, placeholder, icon, leading, disabled, onPress }: { label: string; value?: string; placeholder: string; icon: 'chevron-down' | 'calendar' | 'clock'; leading?: 'users'; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || placeholder}`} accessibilityState={{ disabled: Boolean(disabled), expanded: false }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.control, pressed && s.pressed, disabled && s.disabled]}>
    {leading && <Feather name={leading} size={22} color={t.colors.muted} />}
    <Text numberOfLines={1} style={[s.value, !value && s.placeholder]}>{value || placeholder}</Text>
    <Feather name={icon} size={icon === 'chevron-down' ? 20 : 18} color={icon === 'chevron-down' ? t.colors.muted : t.colors.primary} />
  </Pressable>;
}

// Help type stays free text in the contract; this only offers suggestions.
// A value that is not one of them is still shown, and the caller can fall back
// to a plain text input.
export function SelectField({ label, value, placeholder, options, disabled, change }: { label: string; value?: string; placeholder: string; options: { value: string; label: string }[]; disabled?: boolean; change: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const chosen = options.find(option => option.value === value);
  return <Field label={label}>
    <Trigger label={label} value={chosen?.label ?? value} placeholder={placeholder} icon="chevron-down" leading="users" disabled={disabled} onPress={() => setOpen(true)} />
    <Sheet title={label} open={open} close={() => setOpen(false)}>
      {options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: option.value === value }} onPress={() => { change(option.value); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}>
        <Text style={[s.choiceText, option.value === value && s.choiceSelected]}>{option.label}</Text>
        {option.value === value && <Feather name="check" size={18} color={t.colors.primary} />}
      </Pressable>)}
    </Sheet>
  </Field>;
}

// Reuses the existing CalendarGrid rather than a second calendar. The range is
// opened a month either side of the one on screen so every visible day is
// selectable; the grid disables anything outside it.
export function DateField({ label, value, disabled, change }: { label: string; value: string; disabled?: boolean; change: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthOf(value) ?? new Date().toISOString().slice(0, 7));
  return <Field label={label}>
    <Trigger label={label} value={value ? formatDateLabel(value) : undefined} placeholder="Choose a date" icon="calendar" disabled={disabled} onPress={() => { setMonth(monthOf(value) ?? month); setOpen(true); }} />
    <Sheet title={label} open={open} close={() => setOpen(false)}>
      <CalendarGrid month={month} selected={value} range={{ start: shiftMonth(month, -1) + '-01', end: shiftMonth(month, 2) + '-01' }} taskCounts={new Map()} busy={false}
        changeMonth={setMonth} select={date => { change(date); setOpen(false); }} />
      {value ? <Pressable accessibilityRole="button" accessibilityLabel="Clear date" onPress={() => { change(''); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}><Text style={s.choiceText}>Clear date</Text></Pressable> : null}
    </Sheet>
  </Field>;
}

export function TimeField({ label, value, disabled, change }: { label: string; value: string; disabled?: boolean; change: (time: string) => void }) {
  const [open, setOpen] = useState(false);
  const choices = timeChoices(value);
  // Open on the chosen time, or on a plausible morning start, not on midnight.
  const index = choices.findIndex(choice => choice.value === (value || '09:00'));
  return <Field label={label}>
    <Trigger label={label} value={value ? formatTimeLabel(value) : undefined} placeholder="Choose" icon="clock" disabled={disabled} onPress={() => setOpen(true)} />
    <Sheet title={label} open={open} close={() => setOpen(false)} offset={Math.max(0, index - 2) * CHOICE_HEIGHT}>
      {choices.map(choice => <Pressable key={choice.value} accessibilityRole="button" accessibilityLabel={choice.label} accessibilityState={{ selected: choice.value === value }} onPress={() => { change(choice.value); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}>
        <Text style={[s.choiceText, choice.value === value && s.choiceSelected]}>{choice.label}</Text>
        {choice.value === value && <Feather name="check" size={18} color={t.colors.primary} />}
      </Pressable>)}
      {value ? <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${label.toLowerCase()}`} onPress={() => { change(''); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}><Text style={s.choiceText}>Clear {label.toLowerCase()}</Text></Pressable> : null}
    </Sheet>
  </Field>;
}

// A radio row. The whole card is the radio for tapping purposes, so `edit` sits
// outside it as a separate control rather than nested inside a radio.
export function OptionCard({ title, caption, selected, disabled, choose, edit, editLabel }: { title: string; caption?: string; selected: boolean; disabled?: boolean; choose: () => void; edit?: () => void; editLabel?: string }) {
  return <View style={[s.option, selected && s.optionSelected]}>
    <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityHint={caption} accessibilityState={{ selected, disabled: Boolean(disabled) }} disabled={disabled} onPress={choose} style={({ pressed }) => [s.optionBody, pressed && s.pressed]}>
      <View style={[s.radio, selected && s.radioSelected]}>{selected && <View style={s.radioDot} />}</View>
      <View style={s.optionText}><Text style={s.optionTitle}>{title}</Text>{caption ? <Text style={s.hint}>{caption}</Text> : null}</View>
    </Pressable>
    {edit && <Pressable accessibilityRole="button" accessibilityLabel={editLabel ?? `Edit ${title}`} disabled={disabled} onPress={edit} style={s.optionEdit}><Feather name="edit-2" size={18} color={t.colors.primary} /></Pressable>}
  </View>;
}

// The design pairs this with a map thumbnail. Maps is deferred, and the
// alignment plan forbids a placeholder near private task coordinates, so the
// card carries heading, place and the Change action only.
export function LocationCard({ heading, place, address, actionLabel, disabled, change }: { heading: string; place: string; address?: string; actionLabel: string; disabled?: boolean; change: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${heading} ${place}. ${actionLabel}`} accessibilityState={{ disabled: Boolean(disabled) }} disabled={disabled} onPress={change} style={({ pressed }) => [s.location, pressed && s.pressed]}>
    <View style={s.locationTop}><Text style={s.label}>{heading}</Text><Text style={s.action}>{actionLabel} ›</Text></View>
    <Text style={s.place}>{place}</Text>
    {address ? <Text style={s.address}>{address}</Text> : null}
  </Pressable>;
}

export function LocationField({ label, places, value, disabled, change, manage }: { label: string; places: { id: string; label: string }[]; value: string; disabled?: boolean; change: (id: string) => void; manage: () => void }) {
  const [open, setOpen] = useState(false);
  const place = places.find(entry => entry.id === value);
  return <View>
    <LocationCard heading={label} place={place?.label ?? 'No location chosen yet'} address={place ? undefined : 'Pick a saved place so your helper knows where to go.'}
      actionLabel={place ? 'Change' : 'Choose'} disabled={disabled} change={() => setOpen(true)} />
    <Sheet title={label} open={open} close={() => setOpen(false)}>
      {places.map(entry => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={entry.label} accessibilityState={{ selected: entry.id === value }} onPress={() => { change(entry.id); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}>
        <Text style={[s.choiceText, entry.id === value && s.choiceSelected]}>{entry.label}</Text>
        {entry.id === value && <Feather name="check" size={18} color={t.colors.primary} />}
      </Pressable>)}
      {!places.length && <Text style={s.hint}>You have no saved places yet.</Text>}
      {value ? <Pressable accessibilityRole="button" accessibilityLabel="Clear location" onPress={() => { change(''); setOpen(false); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}><Text style={s.choiceText}>Clear location</Text></Pressable> : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Manage locations, save changes first" onPress={() => { setOpen(false); manage(); }} style={({ pressed }) => [s.choice, pressed && s.pressed]}><Text style={s.action}>Manage locations (save changes first) ›</Text></Pressable>
    </Sheet>
  </View>;
}

// Save Draft and Post side by side above a rule, as the frame's footer draws
// them. It scrolls with the page: a fixed footer needs App's single root
// ScrollView restructured.
export function FooterActions({ children }: React.PropsWithChildren) { return <View style={s.footer}><ResponsiveActions>{children}</ResponsiveActions></View>; }

const s = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 13.5, lineHeight: 19.5, fontWeight: t.weight.semibold, color: t.colors.muted },
  hint: { fontSize: 13.5, lineHeight: 19.5, color: t.colors.muted },
  control: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.outline, borderRadius: t.radius.field, paddingVertical: 12, paddingHorizontal: 16 },
  value: { flex: 1, fontSize: 16, lineHeight: 22, color: t.colors.ink },
  placeholder: { color: t.colors.subtle },
  pressed: { opacity: 0.6 }, disabled: { opacity: 0.5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(31,61,54,0.35)' }, // Deep Pine at 35%
  sheet: { maxHeight: '70%', backgroundColor: t.colors.canvas, borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg },
  sheetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: t.screenPadding, paddingRight: 8, paddingTop: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border },
  sheetTitle: { flex: 1, minWidth: 0, fontSize: 18, lineHeight: 24, fontWeight: t.weight.semibold, color: t.colors.ink, marginTop: 0 },
  sheetClose: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sheetBody: { flexGrow: 0 }, sheetContent: { paddingHorizontal: t.screenPadding, paddingVertical: 8, paddingBottom: 28 },
  choice: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  choiceText: { fontSize: 16, lineHeight: 22, color: t.colors.ink }, choiceSelected: { color: t.colors.primary, fontWeight: t.weight.semibold },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.outline, borderRadius: t.radius.field, paddingRight: 8 },
  optionSelected: { borderWidth: 2, borderColor: t.colors.primary },
  optionBody: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingLeft: 16 },
  optionText: { flex: 1, gap: 3 }, optionTitle: { fontSize: 16, lineHeight: 22, fontWeight: t.weight.semibold, color: t.colors.ink },
  optionEdit: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: t.colors.subtle, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: t.colors.primary, backgroundColor: t.colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.surface },
  location: { gap: 8, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, padding: 14 },
  locationTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  action: { fontSize: 13.5, lineHeight: 19.5, fontWeight: t.weight.medium, color: t.colors.primary },
  place: { fontSize: 18, lineHeight: 24, fontWeight: t.weight.semibold, color: t.colors.ink },
  address: { fontSize: 16, lineHeight: 22, color: t.colors.muted },
  footer: { gap: 12, marginTop: t.space.sm, paddingTop: 20, borderTopWidth: 1, borderColor: t.colors.border },
});
