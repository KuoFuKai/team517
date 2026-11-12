import { Choices } from '../components/Details';
import { Card, EmptyState, LoadingState } from '../components/ui';
import { countLabel, dateLabel } from '../utils/presentation';
import { friendlyError } from '../utils/presentation';
import { Button, Text, TextInput } from '../components/ui';
import React, { useRef, useState } from 'react';

import type { HelperReviewsDto } from '@team517/contracts';
import * as api from '../api/client';
export function ReviewsPanel({ helperId, assignmentId }: { helperId: string; assignmentId?: string }) {
  const [data, setData] = useState<HelperReviewsDto | null>(null), [rating, setRating] = useState(5), [comment, setComment] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [submitted, setSubmitted] = useState(false); const lock = useRef(false);
  const run = async (work: () => Promise<void>) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { if (assignmentId && (e as { code?: string }).code === 'REVIEW_ALREADY_EXISTS') setSubmitted(true); setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  return <>
    <Text accessibilityRole="header">Helper Reviews</Text>
    <Button disabled={busy} title="Load Helper reviews" onPress={() => void run(async () => setData(await api.getHelperReviews(helperId)))} />
    {busy && <LoadingState />}
    {data && <><Text>{data.summary.averageRating !== undefined ? 'Average: ' + data.summary.averageRating.toFixed(1) : 'No rating yet'} · {countLabel(data.summary.reviewCount, 'review')}</Text>
      {data.reviews.length === 0 && <EmptyState title="No reviews yet" message="Ratings appear after completed tasks are reviewed." />}
      {data.reviews.map(r => <Card key={r.id}><Text>{r.rating}/5 · {r.reviewerLabel}</Text><Text>{r.comment ?? 'No written comment'}</Text><Text>{dateLabel(r.createdAt)}</Text></Card>)}
      {data.truncated && <Text>Showing 20 recent Reviews.</Text>}</>}
    {assignmentId && !submitted && <>
      <Text>How did it go? Your review is final once submitted. Please leave out addresses and private care or health details.</Text>
      <Choices value={String(rating)} options={[1, 2, 3, 4, 5].map(n => ({ value: String(n), label: `${n} stars` }))} disabled={busy} change={value => setRating(Number(value))} />
      <TextInput accessibilityLabel="Review comment" placeholder="Optional comment" maxLength={1000} value={comment} onChangeText={setComment} editable={!busy} />
      <Button disabled={busy} title="Submit Review" onPress={() => void run(async () => { await api.submitReview(assignmentId, { rating, ...(comment.trim() ? { comment: comment.trim() } : {}) }); setSubmitted(true); setData(await api.getHelperReviews(helperId)); })} />
    </>}
    {submitted && <Text>Review submitted. Completion does not depend on a Review.</Text>}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </>;
}
