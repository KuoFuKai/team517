import type { OfferAvailabilityFit } from '@team517/contracts';
// Half-open intervals: touching at a boundary is not useful overlap.
// Inputs are absolute milliseconds, never locale strings or persisted fit flags.
export function availabilityFit(from?: number, until?: number, start?: number, end?: number): OfferAvailabilityFit {
  if (from === undefined || until === undefined || start === undefined || end === undefined || ![from,until,start,end].every(Number.isFinite) || until <= from || end <= start) return 'NOT_PROVIDED';
  if (from <= start && until >= end) return 'COVERS_TASK';
  return from < end && until > start ? 'PARTIAL_OVERLAP' : 'CONFLICT';
}
