import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text as NativeText, TextInput as NativeInput, View, type TextProps, type TextStyle, type TextInputProps, type ButtonProps } from 'react-native';
import { theme as t } from '../theme';
import { statusLabel, statusLabels } from '../utils/presentation';
// Android does not synthesise weights for custom faces, so the declared
// fontWeight picks a real file and is then cleared to stop double-bolding.
// The guide puts headings in Fraunces and everything else in Inter.
export function typeface(weight: TextStyle['fontWeight'], display = false) {
  const heavy = Number(weight) >= 700 || weight === 'bold';
  if (display) return heavy ? t.font.displayBold : t.font.display;
  return heavy ? t.font.bodyBold : Number(weight) >= 600 ? t.font.bodySemibold : Number(weight) >= 500 ? t.font.bodyMedium : t.font.body;
}
export function Text({ style, accessibilityRole, ...props }: TextProps) {
  const weight = StyleSheet.flatten(style)?.fontWeight ?? (accessibilityRole === 'header' ? '700' : '400');
  return <NativeText {...props} accessibilityRole={accessibilityRole} style={[s.text, accessibilityRole === 'header' && s.heading, accessibilityRole === 'alert' && s.error, style, { fontFamily: typeface(weight, accessibilityRole === 'header'), fontWeight: 'normal' }]} />;
}
export function Button({ title, disabled, onPress, accessibilityLabel, testID, variant }: ButtonProps & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'outline' }) {
  const selected = title.startsWith('✓ ');
  const raw = selected ? title.slice(2) : title;
  const label = statusLabels[raw] ? statusLabel(raw) : raw;
  const kind = variant ?? (/^(Post a task|Save and publish|Publish|Offer to help|Confirm Assignment|Confirm completion|Start Task|Request completion|Select this|Sign in|Create account|Submit Review)/i.test(raw) ? 'primary' : /^(Cancel task|Decline Assignment)/i.test(raw) ? 'danger' : 'secondary');
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled: Boolean(disabled), selected }} disabled={disabled} onPress={onPress} hitSlop={4}
    style={({ pressed }) => [s.button, kind === 'primary' ? s.primary : kind === 'danger' ? s.danger : kind === 'quiet' ? s.quiet : kind === 'outline' ? s.outline : s.secondary, selected && s.selected, disabled && (kind === 'primary' ? s.offPrimary : s.off), pressed && !disabled && s.dim]}>
    <NativeText style={[s.buttonText, kind === 'primary' && { color: t.colors.surface }, kind === 'danger' && { color: t.colors.error }, disabled && { color: t.colors.muted }]}>{selected ? '✓ ' : ''}{label}</NativeText>
  </Pressable>;
}
export const PrimaryButton = (props: ButtonProps) => <Button {...props} variant="primary" />;
export const SecondaryButton = (props: ButtonProps) => <Button {...props} variant="secondary" />;
export function TextInput({ style, multiline, accessibilityLabel, placeholder, ...props }: TextInputProps) {
  return <View style={s.field}>{accessibilityLabel && <Text style={s.fieldLabel}>{accessibilityLabel}</Text>}
    <NativeInput {...props} accessibilityLabel={accessibilityLabel ?? placeholder} placeholder={placeholder} placeholderTextColor={t.colors.subtle} multiline={multiline} style={[s.input, multiline && s.area, style]} />
  </View>;
}
export const TextField = TextInput;
export function TextArea(props: TextInputProps) { return <TextInput {...props} multiline />; }
export function Card({ children }: React.PropsWithChildren) { return <View style={s.card}>{children}</View>; }
export function PageHeading({ title, caption }: { title: string; caption?: string }) { return <View style={{ gap: 12, paddingTop: 12 }}><Text accessibilityRole="header" style={{ fontSize: 28, lineHeight: 34 }}>{title}</Text>{caption && <Text style={{ color: t.colors.muted, fontSize: 16 }}>{caption}</Text>}</View>; }
export function SectionHeader({ title, caption }: { title: string; caption?: string }) { return <View style={s.section}><Text accessibilityRole="header">{title}</Text>{caption && <Text style={s.muted}>{caption}</Text>}</View>; }
export function StatusBadge({ status }: { status: string }) {
  const issue = ['DISPUTED', 'CANCELLED', 'FAILED'].includes(status);
  const waiting = ['PENDING_CONFIRMATION', 'AWAITING_CONFIRMATION', 'COMPLETION_PENDING', 'PENDING', 'URGENT'].includes(status);
  return <View style={[s.badge, issue && { backgroundColor: t.colors.errorSoft }, waiting && { backgroundColor: t.colors.warningSoft }]}><Text style={[s.badgeText, issue && { color: t.colors.error }, waiting && { color: t.colors.warning }]}>{statusLabel(status)}</Text></View>;
}
export const Chip = StatusBadge;
export function Avatar({ label }: { label: string }) { return <View accessibilityLabel={label} style={s.avatar}><Text style={s.avatarText}>{(label.includes('@') ? label.split('@')[0].slice(0, 2) : label.trim().split(/\s+/).length > 1 ? label.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('') : label.slice(0, 2)).toUpperCase()}</Text></View>; }
export function EmptyState({ title, message }: { title: string; message?: string }) { return <View style={s.empty}><Text accessibilityRole="header">{title}</Text>{message && <Text style={s.muted}>{message}</Text>}</View>; }
export function LoadingState({ label = 'Loading your information…' }: { label?: string }) { return <View style={s.loading}><ActivityIndicator color={t.colors.primary} /><Text>{label}</Text></View>; }
export function ErrorState({ message }: { message: string }) { return <View style={s.errorBox}><Text accessibilityRole="alert">{message}</Text></View>; }
export function InfoRow({ label, value }: { label: string; value?: string }) { return <View style={s.row}><Text style={[s.muted, { width: 88, fontSize: t.type.caption, lineHeight: 18 }]}>{label}</Text><Text style={{ flex: 1 }}>{value || 'Not provided'}</Text></View>; }
const s = StyleSheet.create({
  text: { color: t.colors.text, fontSize: t.type.body, lineHeight: 22, flexShrink: 1 }, heading: { color: t.colors.ink, fontSize: t.type.section, lineHeight: 25, fontWeight: t.weight.bold, marginTop: 0 },
  error: { color: t.colors.error }, button: { minHeight: 52, borderRadius: t.radius.sm, paddingHorizontal: 16, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  primary: { backgroundColor: t.colors.button, borderColor: t.colors.button }, secondary: { backgroundColor: t.colors.surface, borderColor: t.colors.border }, quiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderColor: t.colors.primary },
  danger: { backgroundColor: 'transparent', borderColor: t.colors.error }, selected: { backgroundColor: t.colors.primarySoft, borderColor: t.colors.primary }, dim: { opacity: 0.5 },
  offPrimary: { backgroundColor: t.colors.accent, borderColor: t.colors.accent }, off: { opacity: 0.65 },
  buttonText: { fontFamily: t.font.bodySemibold, fontSize: t.type.label, color: t.colors.primary, textAlign: 'center', flexShrink: 1 },
  field: { gap: 6 }, fieldLabel: { fontSize: t.type.caption, fontWeight: t.weight.semibold, color: t.colors.muted }, input: { backgroundColor: t.colors.surface, minHeight: 54, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.sm, padding: 12, fontFamily: t.font.body, color: t.colors.ink, fontSize: 17, lineHeight: 22 }, area: { minHeight: 96, textAlignVertical: 'top' },
  card: { backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, padding: 14, gap: 10 },
  section: { gap: 8, marginTop: 0 }, muted: { color: t.colors.muted, fontSize: t.type.label }, badge: { alignSelf: 'flex-start', backgroundColor: t.colors.primarySoft, borderRadius: t.radius.pill, paddingHorizontal: 12, paddingVertical: 5 }, badgeText: { color: t.colors.primary, fontWeight: t.weight.semibold, fontSize: t.type.caption },
  avatar: { width: 40, height: 40, borderRadius: t.radius.pill, backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: t.colors.primary, fontSize: 18, fontWeight: t.weight.bold },
  empty: { padding: t.space.xl, gap: t.space.sm, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: t.colors.border },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }, errorBox: { backgroundColor: t.colors.errorSoft, borderRadius: t.radius.sm, padding: 14 }, row: { gap: 10, flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 3 },
});
