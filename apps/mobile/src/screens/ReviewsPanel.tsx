import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import type { HelperReviewsDto } from '@team517/contracts';
import * as api from '../api/client';
import { ScreenModal } from '../components/ScreenModal';
import { useScreenHeader } from '../components/ScreenHeader';
import { MenuRow } from '../components/Details';
import { Card, EmptyState, LoadingState, ErrorState, Button, Text, TextInput } from '../components/ui';
import { countLabel, dateLabel, friendlyError, personLabel } from '../utils/presentation';
import { theme as t } from '../theme';
export function ReviewsPanel(props: { helperId: string; assignmentId?: string }) {
  const [open, setOpen] = useState(false);
  return open ? <ScreenModal title="Caregiver reviews" close={() => setOpen(false)}><ReviewContents {...props} back={() => setOpen(false)} /></ScreenModal> : <MenuRow title={props.assignmentId ? 'Write a review' : 'Member reviews'} onPress={() => setOpen(true)} />;
}
function ReviewContents({ helperId, assignmentId, back }: { helperId: string; assignmentId?: string; back: () => void }) {
  const { fontScale } = useWindowDimensions();
  const [data, setData] = useState<HelperReviewsDto | null>(null), [rating, setRating] = useState(5), [comment, setComment] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [submitted, setSubmitted] = useState(false); const lock = useRef(false);
  useScreenHeader({ title: `Review of ${personLabel(helperId)}`, back, disabled: busy, priority: 5 });
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { if (assignmentId && (e as { code?: string }).code === 'REVIEW_ALREADY_EXISTS') setSubmitted(true); setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { void run(async () => setData(await api.getHelperReviews(helperId))); }, [helperId]);
  return <>
    {busy && <LoadingState />}
    {data && <><Card><View style={{ alignItems: 'center', gap: 8 }}><Text style={{ fontSize: 32, lineHeight: 40, fontWeight: '700', color: t.colors.ink }}>{data.summary.averageRating?.toFixed(1) ?? '—'}</Text><Text accessibilityLabel={data.summary.averageRating !== undefined ? `${data.summary.averageRating} out of 5` : 'Not rated'} style={{ color: '#B88635', fontSize: 24, lineHeight: 30 }}>{data.summary.averageRating !== undefined ? '★'.repeat(Math.round(data.summary.averageRating)) : '☆☆☆☆☆'}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{data.summary.reviewCount ? `Based on ${countLabel(data.summary.reviewCount, 'review')}` : 'No reviews yet'}</Text></View>
      {[5,4,3,2,1].map(n => { const count = data.reviews.filter(value => value.rating === n).length; return <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={{ fontSize: 13.5, width: 64 * Math.max(1, fontScale), flexShrink: 0 }}>{countLabel(n, 'star')}</Text><View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: t.colors.accent, overflow: 'hidden' }}><View style={{ height: 8, width: `${data.reviews.length ? count / data.reviews.length * 100 : 0}%`, backgroundColor: t.colors.primary }} /></View><Text style={{ fontSize: 13.5, minWidth: 24, flexShrink: 0, textAlign: 'right' }}>{count}</Text></View>; })}{data.truncated && <Text style={{ fontSize: 12 }}>Distribution shows the 20 loaded reviews.</Text>}
    </Card>
    {data.reviews.length > 0 && <Card><Text accessibilityRole="header">Member reviews</Text>{data.reviews.map(r => <View key={r.id} style={{ gap: 8, paddingVertical: 12, borderBottomWidth: .5, borderColor: t.colors.border }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={{ fontWeight: '600' }}>{r.reviewerLabel}</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>{dateLabel(r.createdAt)}</Text></View><Text style={{ color: '#B88635' }}>{'★'.repeat(r.rating)}</Text><Text>{r.comment ?? 'No written comment'}</Text></View>)}</Card>}</>}
    {assignmentId && !submitted && <Card><Text accessibilityRole="header">How did it go?</Text><Text style={{ fontSize: 13.5, color: t.colors.muted }}>Your review is final once submitted. Leave out addresses and private health details.</Text><View style={{ flexDirection: 'row' }}>{[1,2,3,4,5].map(n => <Pressable key={n} accessibilityRole="radio" accessibilityLabel={countLabel(n, 'star')} accessibilityState={{ checked: rating === n, disabled: busy }} disabled={busy} onPress={() => setRating(n)} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 30, lineHeight: 40, color: n <= rating ? '#B88635' : t.colors.border }}>★</Text></Pressable>)}</View><TextInput accessibilityLabel="Review comment" placeholder="Optional comment" multiline maxLength={1000} value={comment} onChangeText={setComment} editable={!busy} /><Button variant="primary" disabled={busy} title="Submit review" onPress={() => void run(async () => { await api.submitReview(assignmentId, { rating, ...(comment.trim() ? { comment: comment.trim() } : {}) }); setSubmitted(true); setData(await api.getHelperReviews(helperId)); })} /></Card>}
    {submitted && <Text>Review submitted.</Text>}{error ? <ErrorState message={error} /> : null}
    <Button variant="quiet" disabled={busy} title="Refresh reviews" onPress={() => void run(async () => setData(await api.getHelperReviews(helperId)))} />
  </>;
}
