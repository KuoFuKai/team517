# Sprint 8F — Coordination and status clarity

November15, 2026. [Presentation policy](coordination-ux.md) · [Actual Android evidence](native-evidence/2026-11-15-coordination-clarity/README.md). Engineering observations are separate from the still-queued phone session and an actual unaided teammate comprehension study.

| # | Topic | Result |
| --- | --- | --- |
|1|Starting origin/main|Initially `c14b31464c0625555ba171977e2ca5ddb769eb6e`. After Kevin explicitly approved the completed8E fast-forward, main became `994415aa0d7bc9230b4f80519fc033ac4dbe4e0c`, the8F base.|
|2|Branch|`codex/sprint-8f-status-clarity`; contains8E source/history.8F has not been pushed directly to main.|
|3|Kingsley changes|Inspected existing brand-system `7a86da8` and schedule-picker `913b914`; no new overlapping incoming work during the recorded fetches. Brand/fonts/native picker preserved.|
|4|Conflicts / approvals|No contributor conflict, force push, reset or destructive clean. Automatic review initially refused the main push; explicit user approval was obtained and only the approved8E fast-forward was performed.|
|5|Architecture|Presentation-only `TaskStatusPresentation`, shared `CoordinationCard`, and bounded existing authorized context reads. No new Task/Assignment state, field, endpoint, collection or authorization capability. Pending summaries hydrate existing protected detail before assigning the next actor; unavailable context stays neutral.|
|6|State copy|OPEN waiting for helpers; HAS_OFFERS helpers responded; pending selected-helper response; ARRANGED help arranged; IN_PROGRESS help in progress; completion pending requester approval; COMPLETED task complete. Full role-aware map in policy.|
|7|Next actor|Your turn / waiting for named Helper / waiting for requester / no action needed / task complete. Reconfirmation flags precede ordinary pending copy. UI preference is not authority.|
|8|Next action|Existing Review offers, Confirm task, Start task, Request completion and Confirm completion handlers. Explanatory labels do not grant permission; server refusals still apply.|
|9|Requester detail|Title/current time lead into actor/status/consequence; important CTA above instructions and compensation. Fresh authorized projection overrides stale parent copy.|
|10|Helper detail|Equivalent explicit responsibility, visible mutation acknowledgment and current arrangement. Refreshing a peer's state does not claim the user performed the mutation.|
|11|Own Offers|Offer sent / waiting for requester; selected with current arrangement entry; withdrawn; another Helper confirmed; expired. No inference solely from Task status.|
|12|Availability review|Requester sees Alex updated availability / Your turn / Review availability. Helper waits for requester review. Keep is visibly acknowledged and does not confirm the Helper.|
|13|Task reschedule|Requester waits for Helper to confirm new time; Helper sees Task schedule changed / Your turn. Existing strict coverage and exact revision remain.|
|14|Two reviews|Requester availability review and Helper Task-time acceptance remain distinct. Where both guards exist, requester review has next-actor precedence; no disabled unexplained confirm shortcut. Native combined-review case shows one current availability and one requester decision group; cancellation forwards both existing revision guards.|
|15|Timeline|Human labels for publication, response, selection, confirmation, start, completion request/approval, availability and Task-time changes. Only existing authorized DTO events; no invented Review/Points events or current-Helper attribution to historical actors.|
|16|Calendar|Current coordination state and safe authorized contextual name when available. No copied events, provider sync or new time model.|
|17|Notifications|In-app schedule/availability vocabulary aligned; existing destination/privacy flow retained. OS Task/Message payloads remain generic.|
|18|Aliases|Removed UID-suffix Helper/Member names. Existing safe Trust-profile first name used for requester Assignment/Calendar/detail; neutral stable fallback when unavailable. No email/Auth display-name-derived person name.|
|19|Grammar|Shared tiny count formatter for helpers/offers/reviews/points; native preview actually says1 helper. No localization framework.|
|20|Availability duplication|One primary current availability block. Old/new comparison only while unresolved; accepted schedule returns to clean current presentation. Repeated headings/instructions reduced.|
|21|Headers|Controlled two-line focused/context headers, fixed Back/action hit areas; no arbitrary shrinking. Actual narrow/large-font evidence in matrix.|
|22|Success|Explicit selection, availability review, confirmation, start, completion-request and completion-approval feedback; existing Offer/availability/schedule feedback preserved.|
|23|Errors / stale|Review errors and Refresh remain beside review controls. Native stale Helper confirmation rejected without auto-retry, viewed state preserved until explicit refresh, then availability update and explicit current acceptance.|
|24|Responsive|Actual320/360/390/412dp at font1.3 for requester review/old-new and Helper schedule/comparison. Additional font1.0 Calendar/Notifications/Timeline/Offer checks and canonical390dp lifecycle. This is a scoped matrix, not every screen/font cross-product.|
|25|Native A|OPEN rendered, peer API created two Offers, requester natively compared/selected, Helper natively confirmed, arranged state rendered. Sequential emulator accounts, not simultaneous physical devices.|
|26|Native B|Peer API changed selected availability; requester natively reviewed/kept; explicit waiting consequence; Helper natively confirmed.8D policy unchanged.|
|27|Native C|Requester native date/time editor and preview/update; Helper edit/save/explicit schedule confirmation; repeated peer proposals; inline stale recovery; final current revision4 accepted. Previously visible privileged arrival instructions cleared after learned invalidation.|
|28|Native D|Native Helper Start (rapid taps), request completion; requester approved; completed/no-next-action, Review entry and Timeline rendered. One start/request/approval verified through normal cloud APIs. No new Review was submitted.|
|29|vivo|Still queued per Kevin: emulator first, phone later. No new phone pass claimed.|
|30|8A physical|Pending combined session.|
|31|8B physical|Pending combined session.|
|32|8C physical|Pending combined session.|
|33|8D physical|Pending combined session.|
|34|8E physical|Pending combined session;8F clarity added to the same checklist.|
|35|Standalone|Cloud team517-dev Preview; final product UI source `b826d7a`, APK SHA256 `4c28b567eef7486e2e207fabe0b0829e7ae9ac8a8b30a6cdf8ec5a7225faadf7`. Final cold-auth/service-independence check is recorded in evidence.|
|36|FCM|Final APK actual generic background Task and Conversation alerts tapped to current schedule review / authorized Task conversation. No schedule, private location, instructions, availability or chat content in OS body. Hardware Back tested.|
|37|Backend units|38/38 (37 preserved plus narrow transaction-conflict privacy/error regression).|
|38|Client|120/120 (110 preserved plus10 focused semantic presentation/actor/review/pluralization/name/Timeline/stale-parent cases). No whole-screen snapshots/framework.|
|39|Integration|127/127 after the demonstrated error-boundary fix, original concurrency expectations retained.|
|40|Other regression|Node22.23.4/Java21: typecheck, smoke, default/manual HTTP, AI-mock HTTP, Community/Messaging/Maps/Points/Trust/privacy/concurrency and Android Hermes export PASS. Mobile business Firestore boundary clean.|
|41|Lock timeout|Recurred locally in concurrent confirms: one200 and one500 from SDK ABORTED10 lock-timeout exhaustion. Existing transaction logic remained coherent. Minimal error mapper now returns private409 CONFLICT, not an unknown500; no transaction redesign or client replay. Original failure retained; full post-fix suite and hosted CI green. Emulator abort frequency is not claimed eliminated.|
|42|Advisories|Existing28:1low/20moderate/7high/0critical. No dependency addition, audit force-fix or major framework upgrade. Gradle10 compatibility deprecations remain.|
|43|Commits / pushes|Visible batches `81d0715`, `23360ae`; native/consistency fixes `c05dcd2`, `fcb3284`, `3ee70bd`, `7799342`; minimal API fix `580f578`; waiting/list/encoding cleanup `39f441a`, `bfb8b19`, `a9fd5a9`; current-context fixes `561b598`, `7e99f45`, `f983238`; combined-review deduplication `b826d7a`. All pushed; later fixture/docs handoff commit is in Git history.|
|44|Hosted CI|[Exact final product source b826d7a SUCCESS](https://github.com/KuoFuKai/team517/actions/runs/43702657180); also post-contention source580f578 SUCCESS. Superseded/cancelled interim runs are not counted as successful validation. One interim duplicate-import compile issue was corrected; no check was waived. Final handoff synchronization reported at completion.|
|45|Remaining ambiguity|Neutral Task-conversation/care-circle labels remain when safe contextual names are unavailable; Timeline deliberately uses generic historical actors. Leaving Notifications reconstructs Calendar at current month, while Task→Calendar Back preserves its selection. Actual unaided teammate comprehension and phone checks remain unperformed. See LOW notes/evidence; no new BLOCKER/HIGH observed.|
|46|Closure|Engineering, development-cloud and recorded API36 scope may close. Physical8A–8F and actual teammate comprehension validation remain explicitly separate/pending.|
|47|Yiru/Kingsley review|Ready for an unaided review, not claimed passed. Independent December18/19 review examples, December20 OPEN, December21 responses and December22 combined-review example remain actionable; earlier acceptance histories preserved.|
|48|Next visible direction|Run the short unaided comprehension/coordination study, consolidate physical phone checks once available, then prioritize copy/navigation findings from actual users. No next feature Sprint started.|

## Demonstrated defect boundary

No new lifecycle or accounting behavior. MEDIUM fixes include stale parent/status projection, duplicated review blocks/hierarchy, misleading pending summary actor, off-action stale recovery placement and the demonstrated contention500 error-contract gap. Known LOW fixes include1-helper grammar, UID suffix aliases, repeated waiting text, narrow focused headers and encoding artifacts in newly inserted punctuation. Capture/navigation automation failures were retried from fresh UI and are not classified as app passes or product defects.

Source/backend diff is limited to safe error classification plus unit coverage; transaction bodies, domain states, auth, wallet/ledger and Trust calculations are unchanged. The ordinary native completion intentionally produces the existing20-point reward and increments completed-help history; this is not a new Points/Trust rule or a promise that balances remain frozen during legitimate completion.

## Explicit confirmations

No Task/Assignment lifecycle redesign solely for UI. No automatic matching/ranking. Points behavior and Trust metric rules unchanged. Map/location privacy unchanged. No Payments/cash purchase/cash-out/payout/fees. No external calendar integration, recurring/global scheduling, no-show/Early Termination, real KYC/AI/voice or provider expansion. iOS remains deferred.

Final local validation retained one additional infrastructure failure: Functions Emulator discovery reported `TypeError: fetch failed`, producing an unavailable HTTP route. The unchanged default HTTP command then passed in `.tools/8f-final-http-retry.log`; AI mock and the other final-scope stages passed on their original run. Exact b826d7a hosted CI also passed the full suite. This is distinct from the earlier demonstrated transaction-conflict error mapping.
