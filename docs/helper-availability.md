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

Starting main `47a8c5f`, work branch `codex/sprint-8c-helper-availability`; no incoming main/Kingsley updates or conflicts at start. First source batch `a424c6a` passed hosted CI. Focused availability integration 3/3 passed, including privacy/reactivation and VOLUNTEER/POINTS/PAID conflict selection through completion; POINTS settlement unchanged. Current unit/client baselines are31/101. Full regression/cloud/native acceptance follows; no native pass is claimed by these automated results.

## Deferred boundary

Future Helper availability profiles may support recurring windows, blackout dates, explicit timezone preferences and matching suggestions as a separate layer. No weekly engine, public/recurring schedule, calendar sync, automatic matching/ranking, reliability/no-show scoring, live location, Nearby Helpers, Payments, real identity provider, AI/voice or iOS work is included. Physical Sprint8A/8B/8C checks remain one consolidated queue when vivo is available; proceed with Pixel_9_Pro API36 meanwhile.
