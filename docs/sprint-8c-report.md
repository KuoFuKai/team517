# Sprint 8C — Helper Availability + Offer Time Comparison

## Result and scope

Task-specific Offer availability is implemented and accepted for engineering/cloud/emulator scope. It is decision support only. No automatic matching, ranking, public/recurring Helper schedule, calendar-provider integration, Payments or iOS work was added. Availability does not confirm an Assignment or mutate Task timing. Points, Trust and Maps permissions remain unchanged.

Final standalone APK: `artifacts/android/team517-preview.apk`, SHA256 `9e46ae5d47e548e1bf57c419e62b2b05b95a91732611d00b1471950ffe0d1ece`. Actual target: `emulator-5554 device`, Pixel_9_Pro, Android16/API36 x86_64. Final cold launch retained Alex Auth with no Metro/local Firebase listeners and an empty adb reverse list. Original AVD1280x2856/480dpi/font1.0 was restored.

Physical vivo acceptance remains pending, separately for8A/8B/8C, in one consolidated session when Kevin connects the phone. Emulator work does not close those physical checklists.

## Requested delivery report

| # | Item | Implementation / observed result |
| --- | --- | --- |
| 1 | Starting main | `47a8c5f` |
| 2 | Work branch | `codex/sprint-8c-helper-availability` |
| 3 | Kingsley changes | No incoming main or changed relevant heads: brand-system `7a86da8`, schedule-picker `913b914`. Existing contributor intent preserved. |
| 4 | Conflicts | None; no reset/clean/force push or blanket conflict resolution. |
| 5 | Offer model | Optional Firestore Timestamp pair `availableFrom`/`availableUntil` on existing Offer. Public DTOs expose ISO instants and a derived optional fit. No collection added. |
| 6 | Validation | Both timestamps or neither; explicit UTC/offset, real supported calendar instants, until strictly after from. Unsupported UTC years reject safely before Firestore; standard400 envelope. |
| 7 | COVERS_TASK | Availability starts at/before Task start and ends at/after Task end, including exact equal boundaries. |
| 8 | PARTIAL_OVERLAP | Positive overlap without complete coverage. |
| 9 | CONFLICT | No positive overlap, including touching endpoints. Neither creation nor selection is rejected because of fit. |
| 10 | NOT_PROVIDED | No submitted pair; old documents remain compatible. Missing/invalid Task windows cannot be classified. Current Task publication requires scheduled start/end. |
| 11 | Timezone | Backend numeric absolute-millisecond comparison. Existing local Task formatting/parsing/native controls reused, device zone named in form. Tests cover offsets, midnight, DST gaps/repeated hours and untouched timestamp precision. Explicit Use task times resets to Task instants even when old/new display minutes match. |
| 12 | Offer creation | Shared native OfferForm in Discovery/Map detail, Circle and Community entry. Native Map→Task→Offer form actually exercised; Circle/Community reuse is typechecked/API-regressed, not separately claimed as native taps. |
| 13 | Defaults | First scheduled Offer prefills exact Task window, editable or explicitly unspecified. Flexible context invents no dates. Reactivation retains saved pair/message, or saved NOT_PROVIDED; no silent new coverage claim for old Offers. |
| 14 | Cards | Existing order; identity/Trust, readable fit+time, message, explicit actions. Text/icon avoids color-only meaning. |
| 15 | Scoped Profile | Authorized Task-context profile adds `taskAvailability`, safe Task timing and this Offer's pair/fit, labelled Availability for this task. |
| 16 | Unscoped privacy | No taskAvailability/timestamps in unscoped Helper profile or Discovery; competing Offers require existing VIEW_OFFERS. No public schedule endpoint or new Community projection. |
| 17 | Selection warning | Partial/conflict confirmation explains timing agreement and remains cancelable/selectable. Covers/unspecified get ordinary confirmation without extra warning. |
| 18 | Confirmation | Native conflict Select produced PENDING_CONFIRMATION with ACTIVE backup; a separate native Helper Confirm later produced CONFIRMED/ARRANGED and NOT_SELECTED backup. API verified unchanged Task start/end throughout. |
| 19 | Fixtures | New Company for a morning appointment: Alex9:30–12:30 covers10–12, Marcus10:30–13 partially overlaps, Sam unspecified. Separate Visit timing to discuss supplies Alex conflict and Marcus backup. Main still HAS_OFFERS/three ACTIVE; conflict story is now confirmed. 8B pending story remains pending/two ACTIVE backups. |
| 20 | Responsive | Actual320/360/390/412dp atfont1.3: Offer form/actions, covers card and long partial-selection confirmation. Cancel works; long content vertically scrolls and buttons remain reachable. Baseline390dp/font1.0 also rendered. Exact candidate provenance is below. |
| 21 | Pixel native | Date picker→time clock edited start to4:30PM; picker Cancel preserved draft; docked keyboard typed an actual Offer message; invalid missing-until error shown; Use task times repaired it; submit/withdraw/reactivate rendered server-backed state. Profile→Message→nested Profile→Back restored context. |
| 22 | vivo | Not attached; no repeated connection requests or physical pass claimed. |
| 23 | Sprint8A physical | Pending combined session. Native8C Offer/metadata checks do not stand in for8A physical reservation/settlement acceptance. |
| 24 | Sprint8B physical | Pending combined session. |
| 25 | Maps | Actual Google tiles, coincident marker Next task in this area, selected POINTS card→View task→Offer input; approximate-only detail. No GPS or new provider/privacy work. |
| 26 | Points | Native250-point Task Offer creation/reactivation compatible; no reserve/settlement change. Emulator all-compensation conflict-select→confirm→complete verifies POINTS settlement. Existing cloud receipt replay passed without repeat transfers; fixture before/after wallets equal. |
| 27 | Trust | Existing counts/verification/Reviews unchanged. Alex6completed/3reviews/4.7, Marcus2/2/5.0, Sam0/no Reviews/unverified Circle remained distinct. Availability never alters permanent metrics. |
| 28 | Messaging | Existing authorized Task Conversation reused; contextual Profile and Android Back exercised. No duplicate chat architecture or new schedule broadcast. |
| 29 | FCM | Final9e APK received generic Message and Task OS cards; real notification taps opened Conversation and the correct synthetic Task. No message text, location or availability in OS copy. One earlier stale-hierarchy attempt was safely refused and repeated from fresh UI; not counted as a product failure/pass. |
| 30 | Standalone | Final release-variant APK installed successfully; cold persisted Auth, real cloud endpoint, no Metro/local Firebase/reverse requirement. |
| 31 | Backend unit | **32/32 PASS** |
| 32 | Client | **102/102 PASS** |
| 33 | Integration | **108/108 PASS**, including new availability validation/privacy/reactivation/all-compensation lifecycle assertions and existing concurrency tests. |
| 34 | Other checks | Node22.23.4/Java21 typecheck, strict fixture contracts, smoke, manual/default HTTP, mock-AI HTTP, Android Hermes export all PASS. Mobile business-Firestore scan: no matches. Secret preflight: no findings. |
| 35 | Dependencies | No new dependency. Existing28advisories:1low/20moderate/7high/0critical. No unrelated upgrade attempted. |
| 36 | Commits | `a424c6a` visible fit/profile contracts; `b48b471` shared form/fixtures/integration; `b4d0f64` supported years; `5d5a0ef` precise reset provenance; `f95553f` legacy unspecified reactivation. Coherent batches fetched/validated/pushed. Final docs/evidence batch follows these source commits. |
| 37 | Hosted CI | Source batches passed actual Actions. Final source [`f95553f`](https://github.com/KuoFuKai/team517/actions/runs/43633894784) **success**; earlier [`5d5a0ef`](https://github.com/KuoFuKai/team517/actions/runs/43633116190) and [`b4d0f64`](https://github.com/KuoFuKai/team517/actions/runs/43631004018) results are linked for traceability. Final synchronization is reported after integration. |
| 38 | Deferred | Recurring windows/blackouts, public/global schedule, explicit future timezone preferences, provider sync, automatic matching/ranking, reliability/no-show, live/Nearby Helper location, Directions, Payments, real KYC/AI/voice and iOS. |
| 39 | Closure | Engineering/cloud/emulator scope accepted. Full physical8C closure still pending;8A/8B remain independently pending. |
| 40 | Next visible feature | After consolidated phone acceptance/team feedback, consider authorized active-Offer availability updates with an explicit change/reconfirmation policy. This is a recommendation only, not implemented or started here. |

## Validation evidence and native provenance

Final local accepted run passed every stage: typecheck,32unit,102client,108integration,smoke,manual/default HTTP,mock-AI HTTP,Hermes. No tests were weakened. An initial restricted-shell unit invocation hit local socket EACCES; the authorized local-HTTP rerun passed. This was test infrastructure, not an Auth/domain fix. Development API/index deployment succeeded with existing secure CLI workflow; real-Auth Preview smoke passed health,draft,direct Firestore denial,Discovery,Offers,Community,Messaging,Notifications. Availability preparation/replay and post-native assertions passed; no full destructive emulator suite ran against cloud.

[Actual screenshots and provenance](native-evidence/2026-11-14-availability/README.md). Native date/time and docked keyboard/form matrix were captured on `e2fd749c…`; cards/long confirmation matrix was repeated on `750e707d…`. Final `9e46ae5d…` contains only the subsequent legacy-missing-default behavior change relative to750; final-specific native tests prove missing availability stays missing, actual Helper confirmation, both FCM routes, installed/cold persisted Auth and restored AVD state. The matrices test the same unchanged provided-window/card/confirmation layouts; they are not relabelled as final-hash captures. No physical phone, native DST transition, native PAID completion or GPS test is claimed. DST/PAID complete-lifecycle evidence is automated.

## Issues and limits

No BLOCKER/HIGH product issue observed in the exercised native scope. MEDIUM validation defect: ISO year0000 could pass generic format checks but is outside Firestore Timestamp range; it now returns safe validation error with unit/integration coverage. MEDIUM time-provenance defect: explicit Use task times could retain a saved repeated-hour instant/seconds when display minutes matched; corrected with focused DST regression. MEDIUM compatibility defect: reactivating a legacy unspecified Offer could prefill/submit coverage; preserved missing state and verified natively/API. These corrections are confined to new availability behavior.

LOW: long forms require scrolling, especially large text; native input-field gesture capture can require dragging the form margin. Existing generic Assignment Helper alias and dense Google labels remain cosmetic limitations, not redesigned. The existing Assignment review layout remains unchanged; no new execution/start/complete flow was added. Active-Offer editing/removal of an already saved availability pair is not introduced; withdraw/reactivate can replace a pair or preserve it. Availability is the Helper's claimed window, not verified free/busy data, a promise of attendance or a reliability metric.

## Combined physical checklist

When vivo is connected, run one session:8A private wallet/history/reward entry/reservation/settlement/refresh;8B comparison/Profile/Reviews/Message/Select/Back;8C provided/unspecified Offer entry/native picker/docked keyboard/time comparison/profile scope/conflict warning/Select and separate Confirm; Maps/approximate privacy; Task and Message background FCM; cold Auth; USB-disconnected ordinary network smoke. Do not independently close8A/8B/8C physical scope using emulator observations.
