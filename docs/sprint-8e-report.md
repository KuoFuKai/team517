# Sprint 8E — Task reschedule and participant reconfirmation

November 14–15, 2026 acceptance session. This report distinguishes normal API fixtures, actual API36 emulator taps, and the still-pending consolidated physical-phone session. See [policy](scheduling.md) and [native evidence](native-evidence/2026-11-15-task-reschedule/README.md).

## Final report

| # | Topic | Result |
| --- | --- | --- |
| 1 | Starting origin/main | `c14b31464c0625555ba171977e2ca5ddb769eb6e`. |
| 2 | Working branch | `codex/sprint-8e-task-reschedule`. |
| 3 | Kingsley work | Inspected retained brand-system `7a86da8` and schedule-picker `913b914`; no incoming overlapping work found during the recorded fetches. Existing branding and native picker retained. |
| 4 | Conflicts | None; no force-push, hard reset, broad conflict override or destructive clean. |
| 5 | Revision model | Task owns canonical instants and legacy-default-zero scheduleRevision. Different normalized windows increment; accepted Assignment snapshots stay separate. |
| 6 | Authorization | Current eligible creator/active Care Manager, verified resource relationships; selected Helper cannot reschedule own assignment through manager membership. UI lastActiveRole is not authorization. |
| 7 | Editable states | OPEN, HAS_OFFERS, AWAITING_CONFIRMATION, ARRANGED. DRAFT uses existing editor. |
| 8 | Execution boundary | IN_PROGRESS, COMPLETION_PENDING, DISPUTED, COMPLETED, CANCELLED reject ordinary reschedule. Start and execution data require current accepted revision. |
| 9 | ACTIVE Offers | Stored window/message/revision/timestamps unchanged; no auto withdrawal or deletion. |
| 10 | Selected pending | Same Assignment remains pending; explicit new-revision response required even when availability covers. |
| 11 | Confirmed Helper | Same Assignment becomes PENDING_CONFIRMATION, Task AWAITING_CONFIRMATION; prior confirmation cannot silently survive. |
| 12 | Reconfirmation | Strict COVERS_TASK policy: edit conflicting/partial/unspecified availability or decline. Saving covering availability is separate from Confirm new schedule. |
| 13 | Decline | Existing revision-guarded decline semantics, observed on emulator; no separate decline marketplace. |
| 14 | Replacement | Requester explicitly selects another active backup. Previously closed NOT_SELECTED backups are not silently reopened; helpers may explicitly re-offer. Native replacement acceptance is recorded in the evidence matrix. |
| 15 | Fit | Current Task time drives Offer cards, contextual Profile and safe own-Offer view. Selection confirmation keeps the actually reviewed Task/Offer revisions and fit snapshot. |
| 16 | Stale protection | Expected Task revision and Assignment pointer validated in transaction. Actual stale requester and Helper taps rejected, with refresh and preserved local form. |
| 17 | Repeated changes | Latest proposal replaces current Task window; last accepted schedule remains separate until reconfirmed. Repeated real synthetic proposals and unit/integration coverage. |
| 18 | Idempotency | Identical normalized reschedule and already-accepted confirmation are read-only; no duplicate event/notification/revision. Native rapid requester taps produced one revision. |
| 19 | Concurrency | Transaction races cover move/select/confirm/start/edit, reconfirm/cancel and decline/next proposal, plus repeated competing/duplicate changes. No two current commitments. |
| 20 | Events | TASK_RESCHEDULED and SCHEDULE_RECONFIRMED compact revision/identity metadata; no private location, instructions or long dates/messages. |
| 21 | Notifications | Existing persistent architecture; one affected-helper update per action, no requester self-notification. Historical notification routing resolves current responsibility rather than obsolete Offer state. |
| 22 | Calendar | Canonical Task dates, no copied calendar event. Native same/next-day move and quiet foreground peer refresh verified; automated same-day/next-day/month/year/DST coverage. |
| 23 | Maps | Shared canonical Task projection and location privacy unchanged; automated Discovery/location regressions pass. No new native GPS, marker or live-location acceptance claimed for this Sprint. |
| 24 | Points | Reservation and all wallet/ledger snapshots invariant during moves/reconfirmation/replacement. Cloud smoke ordinary publication reserves20 and ordinary cancellation releases20; those are not reschedule effects. |
| 25 | Trust | Reviews, rating, completed count and verification unchanged; no reliability penalty. |
| 26 | Privacy | Pending revision blocks privileged execution/location reads. Actual previously visible arrival details cleared after learned invalidation. Polling is bounded refresh, not instantaneous revocation transport. Signed-in direct business Firestore access denied. |
| 27 | Fixtures | Guarded team517-dev preparation creates five independent synthetic stories, normal Auth/APIs only. Existing 8A–8D histories not reset; phone fixture remains confirmed/revision0. Separate cloud smoke normally canceled after assertions. |
| 28 | Responsive | Actual320/360/390/412dp at font1.3: requester editor/old-new/impact/actions, Helper review/confirm/decline, Calendar and Offer comparison. Vertical scrolling required and exercised; no horizontal date squeeze. |
| 29 | Native | Pixel_9_Pro, emulator-5554 state device, Android16/API36 x86_64. Picker Cancel/date/time/invalid pair, pending and confirmed reschedule, conflict/edit/reconfirm, stale responses, decline, Calendar and navigation exercised. Native DST transition not simulated; automated only. |
| 30 | vivo | Not part of this session; Kevin requested emulator first, phone later. |
| 31 | 8A physical | Still queued, not closed by emulator results. |
| 32 | 8B physical | Still queued, not closed by emulator results. |
| 33 | 8C physical | Still queued, not closed by emulator results. |
| 34 | 8D physical | Still queued, now combined with8E in one future phone session. |
| 35 | Standalone | Cloud Preview APK, SHA256 `2d1bdc723be8473cd3ca7d4a1dfb5fc79d2c38ff2ea46c67e953228813686d54`, source `cffdf9c`. No Metro/local Firebase/reverse required. |
| 36 | FCM | Final APK OS-level Task and Conversation route results are detailed in the native evidence matrix. Generic OS copy contains no schedule, location, instructions, availability or chat body. |
| 37 | Backend units |37/37 pass, Node22.23.4. |
| 38 | Client |110/110 pass, including schedule APIs, stale forwarding, DST/precision, friendly errors, own-Offer privacy and historical notification current Assignment routing. |
| 39 | Integration |127/127 passed on the full local retry. Prior complete runs and exact source GitHub CI passed. One final local run hit an existing completion-dispute transaction lock timeout; original failure retained, not suppressed. |
| 40 | Other automation | Typecheck, smoke, default HTTP, AI-mock HTTP, Community/Messaging regressions and Android Hermes export passed. Mobile source Firestore boundary scan has no direct business access; secret preflight findings0. |
| 41 | Advisories | Existing28:1low/20moderate/7high/0critical. No dependencies added, no unrelated broad upgrade. Gradle9 reports future Gradle10 deprecations. |
| 42 | Commits | `98d3210` core; `04021ae` native feedback/Calendar refresh; `1b2d0dc` warning snapshot/terminal flag; `c83996a` Calendar reschedule entry/races; `cffdf9c` historical notification route. Coherent batches pushed during work. Documentation/integration commits appear in Git history. |
| 43 | GitHub CI | Exact executable source `cffdf9c` [SUCCESS](https://github.com/KuoFuKai/team517/actions/runs/43680214205), full Node22 workflow. Final docs/main synchronization recorded at handoff. |
| 44 | Deferred | No matching/ranking, recurring/global schedules, provider calendar sync, no-show/Early Termination, Payments/cash-out/purchase, live location/Nearby Helpers/Directions, real KYC/AI/voice or iOS. |
| 45 | Closure | Engineering/cloud/API36 scope can close; physical8A–8E remains explicitly pending. |
| 46 | Next visible work | Complete the consolidated phone checklist and teammate usability review, then prioritize coordination/status copy from actual feedback. No next feature Sprint started automatically. |

## Observed defects and fixes

No BLOCKER/HIGH product defect observed. MEDIUM fixes: invalid end/start feedback now specific; Calendar quietly refreshes after external changes; terminal historical review flags no longer produce a reconfirmation prompt; confirmed Calendar arrangement exposes the same authorized Reschedule task entry. Review-driven defensive fixes also preserve viewed fit warnings, clear terminal review flags, protect stale requests and route historical notifications to current responsibility. These are distinguished from directly reproduced native findings.

LOW retained: impact text can say “1 helpers”; availability appears twice across existing/reconfirmation cards; some existing arrangement labels use Helper ALEX/RCUS; narrow large-text headers ellipsize. Large-font content requires scrolling, and actions remain reachable. No broad visual redesign.

## Explicit policy confirmations

Task reschedule never mutates submitted Helper availability. Helper availability does not automatically change Task time. Old confirmation cannot survive a new revision without explicit acceptance. Points reservation and Trust metrics remain unchanged by rescheduling. No automatic matching, external calendar integration or Payments was added. iOS remains deferred.
