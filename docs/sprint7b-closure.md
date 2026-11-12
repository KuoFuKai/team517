# Sprint 7B closure audit — November 11, 2026

**Result: Sprint 7B can close for its original demo/team-review scope, with the explicit LOW and Figma limitations below.** It cannot be described as verified Figma parity or production acceptance. The original scope allowed an approximate design pass when Figma was quota-limited and documentation of the own-review API gap.

This closure pass inspected existing documents, mobile source, curated evidence and saved validation/demo results. It changed documentation only. It did not reset local data, repeat the native acceptance matrix, rerun the full suite, fetch Figma again or add product/backend/API behavior.

## Required deliverables

| Deliverable | Closure result |
| --- | --- |
| [Product policy](product-policy.md) | Complete; explicitly separates CURRENT BEHAVIOR from FUTURE POLICY / NOT IMPLEMENTED, covering all agreed topics |
| [Demo script](demo-script.md) | Complete; 5–7 minute presentation target, account ownership per segment, title-targeted backup preparation and honest single-AVD/live-push distinction |
| [Yiru / Kingsley review](team-review.md) | Complete; plain-language functional/mock/future distinction and product/design questions |
| [Figma gaps](figma-gap.md) | Complete; all major areas classified, last access result dated, parity unverified |

## Visual/product UI polish actually completed in Sprint 7B

The following changes are visible in the current mobile source and acceptance evidence. They are not claims that those features were first implemented in 7B.

| Screen/component | Actual 7B change | Implementation |
| --- | --- | --- |
| Shared design tokens | Warm canvas `#FAF7F2`, ink `#122B3D`, teal `#087F79`, neutral border, 12px cards, quieter shadow and shared 18px card-title size | `apps/mobile/src/theme/index.ts`, `components/Cards.tsx` |
| Shared Task previews | One compact title/status/time/detail/action card reused in requester Tasks, Discovery, Helper assignments and Calendar | `TaskPreviewCard`; existing Card/Badge primitives remain shared with Community Needs |
| Navigation / Me | At most five primary destinations; Circle moved to a Me entry while remaining reachable through the Task context selector. Inbox/Notifications stay secondary | `components/AppChrome.tsx`, `App.tsx` |
| Requester Tasks | Removed duplicate workspace title/back chrome, moved Locations to a quiet footer, prioritized completion review/Offers and upcoming times; earlier draft/edit and Offers entry | `TaskWorkspace.tsx`, `TasksListScreen.tsx`, `TaskDetailScreen.tsx` |
| Discovery | Clearer heading, compact filter/refresh action row, upcoming ordering, optional compensation amounts without invented zero values, shared cards and less technical truncation copy | `DiscoveryWorkspace.tsx` |
| Post / detail | Plain-language Public details / Arrival details explanation and labels, confirmed-only sharing copy, no medical-record invitation | `EditTaskScreen.tsx`, `TaskDetailScreen.tsx` |
| Task / AI validation | Human-readable field hints replace raw validator wording; Task backend error scrolls into view without clearing fields | `utils/presentation.ts`, `TaskWorkspace.tsx`, `AiAssistantPanel.tsx`, `navigation/scroll.ts` |
| Offers | Select action moved before secondary Message/Review controls; singular review count | `OffersWorkspace.tsx` |
| Helper work / Assignment | Pending/active work first, state-specific “What happens next” card, arrangement before comparison/history, lifecycle actions before secondary panels, Arrival details heading | `MyWorkScreen.tsx`, `AssignmentPanel.tsx`, `OffersWorkspace.tsx`, `SupportScreen.tsx` |
| Calendar | UTC-only presentation replaced with explicit device-zone dates/times; local-day grouping and local input boundaries converted to API ISO instants; shared compact cards | `SupportScreen.tsx`, `utils/presentation.ts` |
| Community | Collapsible audience choices, compact action rows, singular like/comment counts; same-audience refresh keeps content height and scroll position | `CommunityScreen.tsx` |
| Cross-screen scrolling / Messaging | Navigation-key reset prevents carrying a deep old-page offset into a new screen, including Inbox/Conversation navigation | `navigation/scroll.ts`, feature coordinators |
| Reviews | Shared review/star singular formatting; server-success and duplicate-conflict results hide the entry form in the current panel | `ReviewsPanel.tsx`, `utils/presentation.ts` |

Auth, verification, Circle membership, AI suggestion/apply, safe Helper aliases, existing status filters, Message bubbles/history/composer/read-only policy, Notifications and real push already worked before this sprint. Their shared-theme appearance and tested compatibility are not a newly implemented system. Notifications/Me did not receive a full new Figma-specific redesign. System fonts and glyph icons remain approximations. No claim is made that every screen received an exact visual comparison.

## Known LOW issues — explicit status

| Item | Status | Evidence / limitation |
| --- | --- | --- |
| “1 review” / “1 star” | **FIXED** | Shared count formatter, focused mobile tests and actual native Offer/Review text |
| Calendar UTC versus Task local time | **FIXED** | Shared local-zone formatting, explicit zone caption, local-day/range conversion, timezone boundary tests and native matching EST times; stored timestamps unchanged |
| Already-reviewed Assignment reopened with entry UI | **BLOCKED BY API/DESIGN DECISION — STILL OPEN** | Public Review response does not identify the current requester’s Review for this Assignment. A fresh reopen can still show the form. Server success/conflict hides it only in the current panel. No fake persistent local status or new endpoint was added. A future authenticated own-review projection is the small contract decision needed |

Figma font/icon/layout comparison and the earlier Android grouped-notification-summary limitation also remain documented LOW limitations, not newly fixed items.

## Demo tooling verification — not visual polish

Existing commands:

```powershell
npm run demo:reset
npm run demo:prepare
npm run demo:prepare -- "Clinic companion for Mom"
```

The first command intentionally clears only loopback **demo-team517 Auth/Firestore** and recreates synthetic fixtures. The second preserves lifecycle progress. The title option targets the newly published manual Task so its Marcus backup does not belong to the separate `· Demo` fallback. It uses APIs and may fill missing Alex/Marcus Offers; presenters must not describe seeded actions as native taps. Follow the runbook’s fresh-reset and unique-title setup before a meeting. This is local development tooling, not production fixture provisioning.

Saved November 11 verification shows reset and repeated/title-targeted preparation succeeded: **1 prepared Task, 2 ACTIVE Offers, 0 Assignments, 1 Resource, 1 Community Post, 1 welcome Message**, with no duplicate fixture records in the tested workflow. Discovery privacy checks passed. Preparation does not rewind an already-selected/completed Task; reset is the documented way to restart the presentation. The 5–7 minute duration is a presentation target, not a measured timing result.

For a single AVD, show persistent in-app updates after account switches. Logout disables that account’s device registration. For real OS push, keep Alex logged in/backgrounded and select from another authenticated client; do not promise replay of a push skipped while Alex was logged out.

## Existing validation and native evidence

The final saved Node 22 run remains green: typecheck, **22 backend unit / 36 mobile-client / 91 integration**, smoke, default and AI-mock HTTP, Android Hermes export and frontend Firestore boundary scan. This docs-only audit did not claim a new test run. See [validation](validation.md) and the scoped [native matrix](native-acceptance.md).

The repository intentionally already includes documentation screenshots. [The curated index](native-evidence/2026-11-10-polish/README.md) contains **17 unedited Android API 36 captures**, including Receiver Tasks, Post Task, Offers, completed Assignment, confirmed arrival, Calendar, Community, Messaging/read-only, Notifications and Me. All use synthetic data; credentials, raw device tokens and private emulator exports are excluded. Older synthetic Review data in the Offers capture is explicitly distinguished from a clean unrated reset. No new captures were necessary for this audit.

## Handoff

No observed BLOCKER/HIGH prevents review with Yiru/Kingsley. Ask them to review visual style, navigation, terminology/roles, Task creation, Offer comparison, Points concepts, Community placement and anything confusing in the demo. Their feedback and the missing own-review projection are follow-up decisions, not functionality claimed as complete.

**Maps remains the next feature sprint, Sprint 7C, and was not started.** GPS, Nearby Helper, Points ledger, cash-out, Payments/payouts, No-show, Early Termination, Dispute resolution, Instant Match, real AI/identity and voice transcription remain unimplemented. No backend/API or product source was changed in this closure pass.
