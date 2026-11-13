# Sprint7B.2 — Physical Android, responsive UI and Git collaboration

November12, 2026. Existing product only; Maps/Sprint7C not started. Evidence is scoped to actual rendered states. This supersedes earlier phone-pending checkpoints for the paths below, without rewriting their historical results.

## Collaboration and contributor preservation

- Starting shared main: `3b6c90f`; initial local main was synchronized (0 ahead/0 behind). Existing untracked Chinese progress report was preserved and included, not cleaned/deleted.
- Working branch: `codex/sprint-7b2-responsive-ui`. Permanent workflow recorded in root AGENTS.md and development-plan.md. Fetch before changes, periodically, before overlapping work/validation/integration; no force-push, reset-hard, broad ours/theirs or unknown-file cleanup.
- First fetch found Kingsley/kmadikaegbu's `7a86da8` on `design/517-brand-system`. User explicitly approved integrating its brand and Post form. Nine conflicts: App, mobile manifest, AppChrome, ui, Auth, EditTask, Home, theme and lockfile. Reviewed by hunk; kept his palette/logo/Fraunces+Inter/form controls/date-time suggestions and main's focused headers/back stack/roles/clean copy/AI selective acceptance/unsaved editor state. Merged manifests and regenerated lock under Node22.
- Later fetch found `1888ec8` on `design/517-brand`, based on newer main. Inspected the duplicate branding intent and reconciled six conflicts (App, manifest, AppChrome, ui, theme, lockfile), keeping responsive behavior and new form while incorporating visible font-loading feedback, intended logo accent, unused DM Sans dependency removal and his evidence/docs. Both contributor commits remain ancestors rather than being overwritten.
- Pushed coherent batches: `26d5618` (first merge + responsive controls), `9fd83df` (CTA/chat height), `cefcb48` (physical review-label fix), `a67c212` (newer brand merge). The first four hosted source CI runs all passed, including final source `a67c212` ([CI](https://github.com/KuoFuKai/team517/actions/runs/43361135361)). Evidence commit `640ae75` was also pushed; final acknowledgment/documentation revision is the main HEAD referenced in the completion report. Later evidence/docs and final main state are recorded in Git and the completion report. No incoming main change was found in repeated fetches through this checkpoint; unrelated remote branches were not deleted or rewritten.
- Main integration uses only normal reconciled/fast-forward Git operations after the final fetch; work branch is retained for teammate visibility. No backend/contracts/services deployment changed.

## Visible changes

- Exact 517 brand palette and supplied logo plus Fraunces headings/Inter body are retained. Product/project backend names stay team517. No engineering preview banners were added.
- ResponsiveActions measures available container width and font scale: Post assistant/time/footer and approved future points controls stack deliberately on narrow/enlarged-text layouts. Controls remain at least normal mobile touch size; system font scaling is not globally disabled.
- Root navigation uses Feed/Circle/Inbox at narrow effective widths, with full accessibility labels and unchanged destinations. Header context truncates intentionally instead of colliding with bell/back. Meaningful titles, instructions, errors and messages wrap.
- Segmented controls retain single-line labels and scroll horizontally if the full set cannot fit; no half-word wrapping. Form sheets respect bottom insets.
- Chat history height follows viewport height instead of a single fixed phone height. Real send/paging/read-only/privacy behavior is unchanged.
- Unchanged date/time fields retain original seconds, milliseconds and ambiguous fall-back instant; the new picker still preserves custom times and rejects DST gaps. A regression test covers precision retention. No scheduling/domain rule was redesigned.

## Devices and responsive matrix

Physical canonical target: **vivo V2324A**, serial `10ADC12KHD001BC`, Android14/API34, 1260×2800px,560dpi (≈360dp), user's existing fontScale1.12. Android setting navigation_mode0 was observed; vendor behavior/indicator was tested as displayed, not assumed equivalent to stock three-button mode. Phone density/font scale were not modified. Gboard's original Zhuyin input was temporarily switched to English for synthetic input and restored before handoff.

Emulator: Pixel_9_Pro, emulator-5554, Android16/API36, x86_64, physical1280×2856 @480dpi. Used temporary wm sizes, then restored size reset/font1.0; density unchanged. Stock navigation_mode2.

| Width | 1.0 font | 1.3 font | Actual rendered scope |
| --- | --- | --- | --- |
| 320dp / 960×1920px | Pass within scope | Pass within scope | Tasks, status/Calendar segments, bottom nav and Post upper form |
| 360dp / 1080×2160px | Pass within scope | Pass within scope | Same; smaller0.85 font also rendered |
| 390dp / 1170×2340px | Pass after CTA fix | Pass within scope | Same; deliberate row/stack behavior |
| 412dp / 1236×2472px | Pass after CTA fix | Pass within scope | Same |

These are nine actual width/font combinations for representative core screens, **not** every screen at every width. Native phone testing below covers the rest at its actual360dp/font1.12. Selector placeholder/value ellipsis and focused-header truncation are intentional; full values remain accessible in their picker. Below-fold content needs scrolling, not horizontal overflow.

## Physical screen-by-screen results

| Area | Actually exercised on vivo | Result / limit |
| --- | --- | --- |
| Login | Empty login, docked Zhuyin/English keyboard, synthetic manager login, invalid first input, final APK cold restart | Successful login and persistence. Vivo IME interfered with injected input; clear/re-enter succeeded without security changes |
| Receiver Tasks | Status list, both navigation groups through role switch, Task opening and Back | Readable titles/status; compact one-line navigation; touch targets retained |
| Post / Edit form controls | Title, help-type sheet, date Nov20, start10:00/end10:15, place, instructions, Volunteer, save | Actual synthetic draft saved via native API-backed UI. Footer stacked on this phone. Existing-draft re-edit was not separately re-exercised |
| AI/manual text | Notes input and docked keyboard; return/navigation | Input exercised; no real AI enabled, generated cloud suggestion/apply not claimed |
| Task detail | Owner summary/cards, long scroll, Offers entry | No overlapping actions; long titles wrap |
| Offers | Two ACTIVE Offers, individual detail, nested Back | Both accessible; native selection not repeated in this Sprint |
| Assignment | Existing completed Assignment from Calendar/notification | Current status and no stale privileged arrival data rendered; full native state-transition matrix not repeated |
| Calendar | Month, marked Nov13, two-record agenda, detail and Back | Actual data retained; empty-day/month logic automated too |
| Discovery | Helper mode List/Map controls, filters and self-excluded empty list | Screen/empty state rendered. Populated Helper discovery/detail not repeated on this phone |
| Community | Feed, wrapped filter chips, post/resource, comment input/send | Actual synthetic comment persisted, input cleared; no fake attachment/provider added |
| Inbox / Conversation | Inbox rows, circle entry, history, composer, message send and Back | Actual synthetic message persisted and input cleared; normal docked keyboard; Send visible above keyboard. Very long histories/terminal read-only not repeated physically |
| Notifications | Actual persistent list, Message/Task routes, completed Assignment link | Correct authenticated destinations and nested Back |
| Profile / Circle | Both roles, member list, Message entry, settings scroll | Readable wrapped account label; no fake identity/rating/balance |
| Reviews | Aggregate/zero state, review entry, stars, comment keyboard | Distribution wrapping fixed and final candidate retested; no review submitted |

## Docked keyboard, safe areas and navigation

Actual **docked physical Gboard** was exercised for Login, Task title, Task instructions, AI/manual text, Community comment, Messaging and Review comment. Fields remained visible/readable; Messaging Send remained above the IME. Long forms expose actions via normal scroll/dismiss rather than fixing all CTAs above the keyboard. Drag-to-dismiss preserves input; successful draft/comment/message writes clear/transition only after API acknowledgment. This is not certification of every OEM/IME, orientation or extreme scale.

Native Back traversed Offer detail→Offer list→Task→Tasks, review modal→Assignment, notifications→related item and conversation→entry. Sheets dismiss and respect the phone bottom inset. Root navigation stays outside scroll content; detail pages avoid unrelated root tabs. No observed BLOCKER/HIGH defect in exercised paths. No claim of all possible loading/error/rapid-tap variants; wrong-login response and existing automated retry/concurrency guards remain covered.

## Findings and fixes

| Severity | Finding | Fix / verification |
| --- | --- | --- |
| MEDIUM | Narrow action rows risked wrapped/tall CTAs; first candidate used generic single-line text and clipped Describe by voice at390/412dp | Measured row/stack primitive plus shorter Voice notes label; removed blanket truncation; 4-width/2-font re-render and physical phone passed |
| MEDIUM | Review distribution fixed48dp label wrapped 5 stars on physical font1.12 | Reserve width scaled with system font; count stays readable; native final candidate showed all labels on one line; singular1 star corrected |
| MEDIUM | Fixed chat-history height assumes a tall phone | Viewport-relative bounded height; actual physical history/input/send exercised |
| LOW | Location picker said save changes first despite preserved editor | Natural Manage locations copy |
| LOW | Font load previously blank in brand candidate / duplicate raw button weight | Reconciled newer contributor loading feedback and concrete Inter face weight; final build/native launch passed |
| LOW / documented | Long synthetic titles/account email wrap; Community filters use another row; compact selectors/header may ellipsize | Intentional readable behavior, no data fabricated or meaningful body truncated |

Vivo rejected/expired two update-source prompts; a user-confirmed retry installed successfully. No unknown-source protection, virtualization, Windows reservation or network/security setting was disabled.

## Standalone and physical FCM

- Final APK installed successfully on vivo and force-stop/cold launch restored cloud manager Auth/Tasks. Confirmed no listeners on Metro8081/8099, Auth9199, Firestore8280, Functions5001, UI4300 after automated suites; phone adb reverse list empty. PREVIEW retains centralized allowlisted team517-dev HTTPS configuration, no local endpoint/development-client dependency.
- User USB-disconnected normal-network check: **Kevin reported “完美成功”** after being asked to unplug USB, reopen the app, open a Task, Community, a Messages conversation and return on normal Wi-Fi/mobile data. This passes the requested short flow as **user-observed evidence**, not agent-observed screenshots after disconnection. No claim of laptop-closed use or exhaustive offline/network testing.
- Actual physical background FCM **Message** and **Task update** cards appeared in the OS notification drawer. Tapping them opened the correct Conversation and synthetic Task. Cropped evidence includes only team517 generic text; no private chat body/location or other App notification was committed. Permission requested/allowed through existing controls, backend registration succeeded. No process-absent/killed delivery or new provider setup claimed.
- Synthetic peer API actions triggered these notifications: one circle Message and guarded withdraw/reactivate of Alex's ACTIVE Offer on the uniquely named existing probe. Deterministic Offer/other backups preserved; no selected Assignment or real care request changed. These peer actions are not native taps.

## Automation / artifact / boundaries

Final Node22.23.4 / Java21 established suite: typecheck,22 backend unit,**78 client**,92 emulator integration, Functions smoke, default HTTP, AI mock HTTP, Android Hermes export all exited0. Added9 Kingsley datetime cases plus responsive3 and precision1 to previous65. Community/Messaging/manual+mock-AI lifecycle and concurrency/privacy regressions remain included. Frontend Firestore/Admin/listener/collection scan zero matches. Secret preflight clean within scope. npm audit remains28:1 low/20 moderate/7 high/0 critical; no forced upgrades. Final source CI is checked separately from local results.

Delivered APK: `artifacts/android/team517-preview.apk`,44,768,660 bytes, SHA256 `2af447b575958703cf7b742e2bf23b288b1367dc4c06db695e41504a96223ae1`. Brand fonts increased package size; native target/package/signing remain existing Preview. APK/credentials/toolchains remain excluded from Git.

Evidence [index](native-evidence/2026-11-12-sprint7b2/README.md) and [visible progress](visible-progress.md). No backend/contracts/Firestore rules or push-privacy changes. No Maps SDK, points ledger/payment, real AI/voice/identity service, sockets or new major feature.

## Readiness

Suitable for an **in-person usability review** with Yiru/Kingsley on the exercised phone, with real synthetic test accounts and the documented limits; they have not yet conducted that review. Sprint7B.2 can close within this documented physical/responsive/collaboration scope after final Git synchronization. Broader exhaustive native-state and unprompted teammate/class rehearsal remain follow-up, not claims made here. Sprint7C Maps remains the next major visible feature and was not started. Visual perfection, all-device compatibility and exhaustive lifecycle re-acceptance are not claimed.

## Completion-report checklist

Starting main3b6c90f; dedicated Sprint branch; both Kingsley commits7a86da8/1888ec8 preserved through reviewed merges;9+6 conflicts resolved by intent; small batches actually pushed. Final shared main is integrated by normal fast-forward only after a fresh fetch; retained branch and final pushed SHA/CI/synchronization are recorded in the completion message. Actual phone/model/API/dp, all rendered screens, width/font matrix, wrapping fixes, Tasks/Calendar/Community/Messaging/Profile results, docked keyboard/safe-area/back, standalone/physical FCM, screenshots, visible-progress,78-client regression baseline,28 dependency advisories, limits and readiness are enumerated above. Maps was not started; Sprint7C Maps remains next major visible feature.
