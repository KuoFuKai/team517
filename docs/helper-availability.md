# Sprint 8C — Task-specific Helper availability

Offer availability is decision support, not automatic matching or a trust/reliability score. The existing Offer → requester selects → Helper confirms lifecycle remains authoritative. Candidates are not reordered or rejected because of availability.

## Contract and time policy

Existing `POST /tasks/:id/offers` accepts optional `availableFrom` and `availableUntil` ISO instants, with explicit UTC/offset. Supply both or omit both; end must be strictly later than start. Invalid dates, one-sided/null ranges and non-instant local strings are validation errors in the standard API envelope. Firestore stores two optional Timestamps on the existing Offer, not a new collection or formatted local authority.

Backend derives optional `availabilityFit` in Task-context Offer DTOs, never a stored mutable flag:

| Fit | Rule / copy |
| --- | --- |
| COVERS_TASK | From ≤ Task start and until ≥ Task end; Covers task time |
| PARTIAL_OVERLAP | Positive overlap without full coverage; Partially available |
| CONFLICT | No positive overlap; Time conflict |
| NOT_PROVIDED | No availability pair; Availability not provided |

Intervals are half-open: ending exactly when the Task starts, or starting exactly when it ends, is a conflict. Exact equal Task/availability windows cover the Task. Comparison uses numeric absolute milliseconds; offsets, cross-midnight and DST transitions are not compared as display strings. Missing/invalid Task windows cannot be classified and return NOT_PROVIDED; current publication requires a valid scheduled window. Flexible/unpublished form context displays Schedule flexible instead of inventing dates.

Own Offer reads return the actor's times; manager Offer list returns times/current fit in existing order. My-offers collection DTOs can omit fit when no Task schedule is loaded; clients do not derive an alternative policy. Unscoped Helper trust profiles never include availability. Authorized task-scoped profile adds `taskAvailability` containing safe Task start/end and this Offer's times/fit after existing VIEW_OFFERS checks. No availability in Discovery, Community projections or public schedule endpoint. No private location access was broadened.

## Input and reactivation

Discovery/Map detail, trusted-circle and Community Offer entry reuse one form and the existing native TaskDateTimeField controls. Task time is prominent; scheduled Tasks prefill exactly the Task window, editable before submit. Availability may be left unspecified for new Offers. Optional message remains separate. Local presentation names the device timezone and uses existing time parsing/formatting, including DST-gap rejection and preservation of untouched absolute timestamps/seconds and repeated-hour occurrence. Native controls select date then time; no calendar-provider SDK.

Omitting both fields on reactivation preserves existing saved availability, document ID and original createdAt. An explicit valid pair replaces it under the existing Offer creation/reactivation authorization. There is no active-Offer editing endpoint or second lifecycle. The form retains saved availability on reactivation; clearing it is not introduced as a new operation. WITHDRAWN/NOT_SELECTED reuse follows existing policy; SELECTED cannot use normal withdrawal.

## Comparison and selection

Cards show safe Helper identity/trust, text status and readable availability before message/actions. Full Offer and task-scoped profile distinguish “Availability for this task” from a universal schedule. Color is not the sole signal. Partial/conflict selection adds a lightweight warning that timing should be agreed; it remains selectable. Covers/unspecified use the ordinary pending-confirmation explanation. No schedule or Assignment is auto-mutated.

## Preview and validation

`npm run preview:availability -- --project team517-dev` uses existing real Auth synthetic users, normal APIs and an ignored receipt. It creates separate comparison/conflict stories, preserving the pending Sprint8B comparison and all Points/Trust history. Alex covers, Marcus partially overlaps, Sam leaves availability unspecified; a separate Alex conflict story enables native warning acceptance. Replays preserve progressed states, refuse withdrawn/mismatched histories and assert unchanged private wallets/permanent Trust summaries. No counters or aggregates are patched.

Starting main `47a8c5f`, work branch `codex/sprint-8c-helper-availability`; no incoming main/Kingsley updates or conflicts at start. First source batch `a424c6a` passed hosted CI. Focused availability integration 3/3 passed, including privacy/reactivation and VOLUNTEER/POINTS/PAID conflict selection through completion; POINTS settlement unchanged. That initial unit/client checkpoint was31/101. Final accepted32unit/102client/108integration, full regression/cloud/native results and exact candidate provenance are in the [delivery report](sprint-8c-report.md).

## Deferred boundary

Future Helper availability profiles may support recurring windows, blackout dates, explicit timezone preferences and matching suggestions as a separate layer. No weekly engine, public/recurring schedule, calendar sync, automatic matching/ranking, reliability/no-show scoring, live location, Nearby Helpers, Payments, real identity provider, AI/voice or iOS work is included. Physical Sprint8A/8B/8C checks remain one consolidated queue when vivo is available; proceed with Pixel_9_Pro API36 meanwhile.


Final acceptance notes: supported absolute years are checked before Firestore; explicit Use task times resets absolute provenance across repeated DST minutes/seconds, while untouched values retain precision. Legacy unspecified reactivation stays unspecified until the Helper explicitly adds a pair. These are MEDIUM edge/compatibility corrections within new availability behavior. Final native Helper confirmation and both FCM routes passed; physical8A/8B/8C remain queued. [Evidence](native-evidence/2026-11-14-availability/README.md).


## Sprint8D engineering checkpoint

Active and current selected/pending Offers now have a focused revision-checked availability update, with explicit clearing to unspecified. The existing Assignment state remains PENDING_CONFIRMATION; an additive accepted revision/snapshot and requiresRequesterReconfirmation flag gates Helper confirmation. Every genuinely changed non-covering pending window requires review; covering updates (including restored coverage) advance the accepted snapshot and notify without forced review. Neither action changes Task time, Points or Trust. Legacy revision0/snapshots work without a migration.

Requester Keep accepts the exact current revision but does not confirm the Helper. Choose another releases only the expected still-pending selection through existing cancellation, then uses normal backup selection. Confirmed/in-progress/history availability is not editable. Same-window retries are read-only no-ops; stale differing edits/reviews conflict. Notifications use existing persistent Assignment routing and generic FCM; raw times stay only in authorized Offer/review DTOs, not events/public profiles. Foreground comparison/review refresh is10seconds plus resume/manual refresh, not WebSockets or automatic matching. Source unit/client/focused transaction validation precedes cloud/native acceptance; this checkpoint is not a physical pass.
