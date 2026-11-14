# Sprint 8D — Availability changes and reconfirmation

November 14, 2026. Engineering, real development-cloud and API36 emulator acceptance completed within the evidence below. Physical acceptance remains pending: Kevin explicitly requested emulator first, phone later. Emulator observations do not close the combined 8A/8B/8C/8D phone checklist.

## Product policy

Availability belongs to one Offer, not a public Helper schedule. Initial/legacy revision is zero. Each different normalized window increments the revision; identical retries are read-only. The update endpoint requires the expected revision. Omitting both dates on this PATCH explicitly clears the window; creation/reactivation omission retains the existing documented preservation semantics. Message, original creation time, Task timing and offerCount are preserved.

ACTIVE Offers may be edited while responses are open, including backup Offers during pending confirmation. SELECTED Offers may be edited only for the current PENDING_CONFIRMATION Assignment. Confirmed, executing and historical relationships cannot use this editor. Existing eligibility and resource authorization remain authoritative.

A selected edit that no longer COVERS the Task requires requester review, including partial, conflicting and unspecified windows. Previously accepted and current windows remain separate. A new non-covering revision requires a new review even if an earlier partial window was accepted. A covering revision updates the accepted snapshot and clears the review requirement. Every selected change still creates a persistent update notification; no edit confirms an Assignment.

Keep accepts exactly the reviewed revision and leaves PENDING_CONFIRMATION. A stale revision returns AVAILABILITY_STALE; inline feedback and Refresh availability let the requester recover. Helper confirmation is transactionally blocked while review is required. Choose another uses the existing pending cancellation with an expected availability revision, then ordinary backup selection. It cannot silently cancel a concurrently confirmed relationship. No new replacement status or execution flow was added.

## Report

| # | Item | Result |
| --- | --- | --- |
| 1 | Starting origin/main | `1153ee6` |
| 2 | Work branch | `codex/sprint-8d-availability-reconfirmation` |
| 3 | Kingsley changes | Repeated fetch found no incoming main changes; previously reviewed brand-system `7a86da8` and schedule-picker `913b914` retained. |
| 4 | Conflicts | None; no force push/reset/clean. |
| 5 | Revision model | Zero-compatible additive revision, exact expected-revision writes, idempotent normalized retries. |
| 6 | Editable states | Own eligible ACTIVE Offer or own current SELECTED/pending Offer only. |
| 7 | Selected behavior | Captured accepted revision/window; new non-covering window requires review. |
| 8 | Confirmed boundary | Edit forbidden; ordinary existing execution lifecycle unchanged. |
| 9 | Material change | Different normalized pair whose new fit is not COVERS; unspecified counts. |
| 10 | COVERS → COVERS | Accepted snapshot updates, notification retained, no forced review/confirmation. Exercised natively. |
| 11 | COVERS → PARTIAL | Review required; native picker edit and requester review exercised. |
| 12 | COVERS → CONFLICT | Review required; previous/current shown, Helper Confirm hidden. Exercised natively. |
| 13 | Unspecified | Explicit removal supported, revision increments, selected pending review required. Exercised natively. |
| 14 | Reconfirmation | Native Refresh → Keep succeeded; cloud state remained pending, accepted revision8, flag false. |
| 15 | Stale review | Actual competing cloud edit made native Keep stale; rejected without accepting it. Inline error/recovery verified on final APK. |
| 16 | Replacement | Native Choose another → Marcus selection sheet → select succeeded; Marcus pending, Alex NOT_SELECTED under existing pending cancellation policy. |
| 17 | Audit | Compact OFFER_AVAILABILITY_UPDATED / AVAILABILITY_RECONFIRMED, revision/identity metadata only; retry creates no duplicate. |
| 18 | Notifications | Selected changes create persistent OFFER_AVAILABILITY_UPDATED; generic OS payload, current Assignment route. |
| 19 | Privacy | Scoped DTOs only; backup editor never receives competing Assignment; no private schedule in push/event metadata or unscoped profile. Stale privileged UI is cleared on known authorization/lifecycle invalidation. |
| 20 | Points | Wallet/ledger and lifecycle regressions pass; fixture/smoke assertions show edits/reviews do not mutate Points. Physical 8A settlement remains queued. |
| 21 | Trust | No edit/review modifies completion/Review aggregates; automated and cloud before/after assertions pass. |
| 22 | Maps | Shared discovery/approximate-location contracts and automated regressions preserved; no new native GPS/Map claim in this Sprint. |
| 23 | Messaging | Contextual Message → Alex Conversation → Android Back exercised; existing Conversation OS push route exercised. No new chat transport. |
| 24 | Fixtures | Guarded team517-dev normal-API preparation and real-Auth smoke; five stories, including unpublished POINTS70 phone draft. No ADC/direct aggregate patch. Replays preserve prior progress. |
| 25 | Responsive | Actual 320/360/390/412dp at font1.3: review old/new/fit and reachable stacked Message/Keep/Choose actions. Final APK matrix repeated. |
| 26 | API36 | Pixel_9_Pro, Android16/API36 x86_64, emulator-5554 state device. Native editor/pickers, success, requester review, stale recovery, Keep, replacement and OS routes exercised. |
| 27 | vivo | Initially detected V2324A Android14/API34, then disconnected; user deferred phone. No new physical pass claimed. |
| 28 | 8A physical | Pending consolidated phone session. |
| 29 | 8B physical | Pending consolidated phone session. |
| 30 | 8C physical | Pending consolidated phone session. |
| 31 | Standalone Preview | Final APK SHA256 `a84aedfd91667cf102b0ab7e0b0277318a026a320f6b6235d2050a12830e055f`; real HTTPS development backend, no Metro dependency. |
| 32 | FCM | Actual background OS “You have a task update.” → Morning company/current review; “You have a new message.” → existing Conversation. No availability/message content in OS body. |
| 33 | Backend unit | 34/34 pass. |
| 34 | Client | 104/104 pass. |
| 35 | Integration | 117/117 pass, including edit/select/confirm/reconfirm/replacement races and retries. |
| 36 | Other validation | Node22 typecheck, smoke, default/manual HTTP, mock-AI HTTP, Hermes export all pass; mobile Firestore boundary scan clean. |
| 37 | Advisories | Existing npm audit baseline: 28 total, 1 low/20 moderate/7 high/0 critical. No dependency added or broad upgrade attempted. |
| 38 | Commits | `d6da610`, `4b3a5be`, `571317f`, `985db62`, `b595273`, `90dcd4c`, `f88fd63` pushed in coherent batches; final documentation/integration tracked in Git. |
| 39 | CI | Final product source `f88fd63` passed [hosted CI](https://github.com/KuoFuKai/team517/actions/runs/43646472592); final documentation/main CI recorded in completion. |
| 40 | Deferred | Recurring/public schedules, ranking/matching, Task reschedule, no-show/Early Termination, Payments, real providers and iOS. |
| 41 | Closure | Engineering/cloud/emulator scope accepted; full Sprint8D physical closure pending. |
| 42 | Next visible work | Complete one combined phone/team usability review, then choose the next visible improvement from that feedback; no new feature Sprint started. |

## Native defects and limits

No BLOCKER/HIGH observed in exercised scope. Two MEDIUM issues fixed and retested: save feedback disappeared outside the viewport after the Offer list reordered; save now shows an explicit success screen before returning. Stale review errors appeared at the page bottom; they now appear beside Keep/Choose with explicit Refresh availability. Remote edit errors also sit beside Save. Stale foreground responses are ignored and known-invalid privileged execution/profile data is cleared.

LOW retained: generic legacy Assignment aliases can read “Helper RCUS” instead of the contextual display name; long large-font content requires vertical scrolling. No broad visual redesign. Native date/time dialogs were exercised; a new docked keyboard typing test is not claimed for this date-picker-only change. Earlier 8C keyboard evidence remains separately dated.

The foreground/resume refresh is bounded polling (10 seconds), plus explicit refresh; no instant transport guarantee or WebSockets/SSE. Old selection dialogs retain the revision actually viewed. Transactions resolve stale writes safely even before UI refresh arrives. Initial focused-test failures were a test fixture UID variable collision, corrected without weakening production checks; final nine focused groups and full suite pass. The documentation-only hosted run43647882646 exposed a pre-existing support integration assumption: an unfiltered bounded Discovery list would always include its own newly created Task despite parallel fixtures. The test now uses a distinct synthetic area and the real radius filter, retaining public-field inclusion and private-field exclusion assertions. No product query limit or backend behavior was changed; final corrected hosted run is recorded in completion.

## Physical checklist — one later session

8A private wallet/history/reward entry/publication reservation/settlement; 8B comparison/Profile/Reviews/Message/Select/Back; 8C provided/unspecified availability and native picker/docked keyboard; 8D ACTIVE/selected edits, covering/partial/conflicting/clear, old/current comparison, stale Keep/recovery, separate Helper confirmation and replacement. Include Maps/approximate privacy, privileged-location clearing, read-only Messaging after relationship termination, both background FCM routes, cold Auth and Kevin's USB-disconnected normal-network report. Do not close any physical item from emulator results.

Offer availability changes do not change Task timing. Availability does not equal Helper confirmation. No automatic matching or recurring/public Helper schedule exists. Availability edits cause no Points mutation; Trust metrics remain unchanged. No Payments work started; iOS remains deferred.
