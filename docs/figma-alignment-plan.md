# Figma alignment audit and implementation plan — November 12, 2026

November 12 whole-app UI overhaul: [implementation, native evidence and remaining visual differences](design-overhaul.md). Shared typography, focused headers, forms/native scheduling, Offers, Discovery, account/roles, Community and Messaging were reworked; exact Figma parity and ordinary software-keyboard acceptance are not claimed. Earlier batch/test notes below remain historical.

Batch 2: [Calendar month grid/daily agenda](design-alignment-batch2.md) now completes that missing presentation slice using existing APIs. Broader body-screen work remains planned. Batch 1 publication at `aaf7297` was verified and hosted CI passed.

Implementation follow-up: the user explicitly approved PDF-based approximate implementation. [Batch 1](design-alignment-batch1.md) now implements the role shell and receiver By status slice, with rebuilt APK and actual AVD evidence. The audit-phase deliverables/limits below remain historical; Calendar grid and the rest of the planned body screens are not complete.

The dominant gap is **screen composition and navigation**, followed by information density, typography and icon/asset fidelity. The shared warm canvas/teal palette already resembles the reference; recoloring the current generic screens will not resolve the mismatch. This audit does not claim visual parity or implement new business features.

## Evidence and limits

- User-selected design: [Patient & Family — Schedule](https://www.figma.com/design/kRer5BBbNvdSdPkanLC6HT/Patient---Family-%E2%80%94-Schedule?node-id=0-1).
- User-provided export: `E:/User/Downloads/Patient & Family — Schedule.pdf`, 19,541,620 bytes, Figma export dated November 12. Source remains unchanged and outside the repository.
- Inventoried text and dimensions for **all 101 PDF pages**: [page inventory](design-audit/2026-11-12/page-inventory.csv). These are export pages, not 101 unique app screens: page 1 is a component, some pages are sheets/states, and pages 71/101 are multi-screen Offer/payment boards. They must not be counted as completed screens.
- Rendered and visually reviewed **16 pages**: 2, 4, 5, 11, 13, 14, 16, 17, 19, 21, 22, 24, 28, 41, 71, 75. Remaining pages have text inventory only, not detailed visual acceptance.
- Compared against actual November 12 standalone Android Preview screenshots and existing frontend code. These baseline images were rendered in the preceding cloud acceptance session; this audit did not launch a redesigned build or rerun native acceptance.
- Fresh Figma session created. Root design-context request returned no selected layer; metadata/screenshot requests hit the Starter-plan MCP limit. No fresh high-fidelity node/token/asset response was available. The earlier November 10 context for `145:3991` remains the only previously retrieved detailed V2 context, not coverage of this entire export.
- PDF permits visual audit, but exact font identity, Figma variables, component variants, constraints and authoritative SVG exports are not established. Do not infer them from raster pixels or turn page screenshots into app backgrounds.

Comparison images normalize each screenshot's displayed width and retain Android system bars. Dates, account role, fixture counts and content differ; these demonstrate structure rather than controlled pixel-difference scores. Calendar specifically compares receiver design to an existing Helper agenda baseline; role-specific acceptance still needs matching fixtures.

| Comparison | Reference / current observation |
| --- | --- |
| [Tasks](design-audit/2026-11-12/compare-tasks.png) | PDF 4 grouped compact rows vs current manager home with an additional hero, full-width Post button, large cards and utility controls |
| [Discovery](design-audit/2026-11-12/compare-discovery.png) | PDF 17 one heading, List/Map segment, chips and compact cards vs repeated headings/copy and large filter/map/detail buttons |
| [Messages Inbox](design-audit/2026-11-12/compare-messages.png) | PDF 21 compact name/preview/time rows vs current Inbox with repeated title, full-width navigation/refresh buttons and taller metadata cards |
| [Calendar](design-audit/2026-11-12/compare-calendar.png) | PDF 2 Tasks Calendar mode with month grid vs current separate date-range agenda; different role/data, not pixel-matched |

## Confirmed differences and frontend change map

Priority means visual-alignment order, not a newly observed production incident severity. All work must retain actual authorization, loading/error handling, privacy projections, retry safety and working HTTP API clients.

| ID / priority | Design evidence | Current implementation / gap | Proposed bounded change |
| --- | --- | --- | --- |
| A01 / P0 | PDF 2, 4, 16, 17, 21 | `AppChrome.tsx`: technical brand + page title + role text + large Inbox button; context switch appears separately in Task workspace | Compact context/role selector and notification affordance; detail pages use a back/title header instead of repeated global headings. Keep notification history distinct from Messages |
| A02 / P0 | PDF 4 receiver; 17 helper | Current Tasks/Calendar/Find/Community/Me shell differs from both reference role shells | Receiver: Tasks, Community, Post, Circle/Msg, Me; Helper: Tasks, Community, Find, Messages, Me. Place Calendar inside Tasks. Preserve every existing destination and push/back behavior; role is UI preference only |
| A03 / P0 | PDF 4, 17 | Most `Button`s share a bordered full-width treatment; tabs/filters/refresh/row navigation all look like form actions | Separate segmented control, chip, icon button, tappable row and primary/secondary actions; preserve accessible touch areas even when visible controls are compact |
| A04 / P0 | PDF 5, 13, 17 | System font; Unicode navigation glyphs; generic `Text` headings; exact font/icon parity unverified | Retrieve authoritative family/weights and original icons from Figma before coding them; local assets, no temporary asset URLs or substituted Unicode icons |
| A05 / P0 | PDF 4, 16, 17, 21 | `Card` always has padding 16/gap 12; actions/labels dominate content. Theme alone cannot express every reference row | Add explicit list-row/compact-card/summary-card variants; explicit text roles for page title, section, item title, field label and meta. Retain contrast, text scaling and 48dp interaction targets where needed |
| A06 / P1 | PDF 2–4, 10, 16 | `TasksListScreen.tsx`: hero, Post button, Current/Drafts/History; Calendar is a separate `SupportScreen` mode | Implement Tasks Calendar/By status modes with compact rows and date selection from existing data. Keep drafts/history reachable. Display groups derive from real lifecycle, never mutate backend states to match labels |
| A07 / P1 | PDF 11 | Role switching is a group of buttons inside generic Me card | Dedicated two-role presentation with actual eligible roles; accessible active state, current context and return path. Do not invent Grace/profile identity |
| A08 / P1 | PDF 41 and older variant 59 | Existing `EditTaskScreen`/AI panel is a functional developer form | Recompose labelled field groups, AI assistance panel, location/visibility/compensation selectors and primary action hierarchy. Keep manual creation and real supported compensation values; no voice/finance implementation |
| A09 / P1 | PDF 13, 15 | AI review/edit mixes shared controls and verbose technical states | Dedicated review-summary cards with apply/edit actions; preserve source-version conflict guard and review-before-apply. Cloud AI stays unavailable; local mock remains emulator-only |
| A10 / P1 | PDF 5, 14, 74/88 (latter text inventory) | Task details use repeated global headings, generic rows and separate arrangement entry | State summary, compact information sections and prominent supported next action; owner/private and outside-helper projections remain separate. Maps and invented AI summaries are excluded |
| A11 / P1 | PDF 71 Offer list/detail/profile | Current `OffersWorkspace` puts identity, message, review controls and selection in long generic cards | Compact Offer rows and a focused selected-Offer detail. Show real verification/reviews and aliases when profile unavailable. Keep selection -> pending confirmation; do not enter payment/PIN flow |
| A12 / P1 | PDF 16–17, 19–20 | Discovery duplicates title/explanation; Map is a large placeholder button; current Helper work is generic list | One title, existing filter chips, compact discovery cards, focused detail and clear Offer state. No unimplemented availability/geolocation filter, fake distance, bonus or direct acceptance |
| A13 / P2 | PDF 21, 75; 89 text inventory | Inbox and conversation have repeated page/header/back/refresh controls; composer is a generic tall input block | Compact Inbox rows, scoped conversation header, bubbles/history and anchored composer compatible with existing scroll/back handling. Manual refresh remains honest; no WebSockets/SSE or fabricated presence |
| A14 / P2 | PDF 24–27 | Community is text/control-heavy; reference includes illustrated media, counters and compact action bars | Recompose supported Need/Resource/Share and comments. Use only actual data; illustration slots require supplied approved assets and content semantics. No fabricated attachment carousel or nearby ranking |
| A15 / P2 | PDF 22, 42 | Current Me emphasizes generic cards, role buttons and device settings | Account summary plus compact settings rows; role/verification/notification settings remain reachable. Do not invent full names, certificates, on-time metrics, earnings or payment methods |
| A16 / P2 | PDF 28 vs current Auth; 48/62 text inventory | Reference email-code sign-in differs from Firebase email/password | Match visual hierarchy, spacing and actions while retaining real email/password fields. Email OTP requires separately approved Auth work; never show a nonfunctional Send login code button |
| A17 / P2 | No standalone persistent-notification history target identified in the 16 rendered pages | Existing persistent Notifications/Timeline/Review are working but not all have a direct reference screen | Reuse approved shell/type/rows, retain all functionality and mark adaptation rather than exact Figma match. Full remaining-page/individual-node review may locate additional references |

## Design conflicts that are not styling tasks

| Reference | Product/backend difference | Current alignment decision |
| --- | --- | --- |
| PDF 19–20 | Direct paid-task acceptance, earnings/bonus | Keep Task -> Offer -> owner selection -> helper confirmation. No paid direct-accept path |
| PDF 71/101 | Per-Offer price/budget negotiation, promo, six-digit payment PIN, balance/insufficient funds/payment success | Current Offer has no negotiated price/payment transaction model. Style supported selection only; no simulated payment success or checkout detour |
| PDF 22–23, 42–45 | Wallet, purchase, transfer/cash-out and earnings | Honest deferred UI; preserve agreed long-term Points value/potential cash-out direction, no ledger/payment implementation |
| PDF 18; 46–47/58 text inventory | Native task map and nearby Helper search | Maps remains Sprint 7C; nearby Helper discovery is separate. Do not use exact private Task coordinates for map placeholders |
| PDF 19 | Exact clinic address/map shown before outside Helper assignment | Privacy projection wins: approximate location until confirmed Assignment; source screenshot is not authorization |
| PDF 28; 48/62 text inventory | Email OTP | Retain current password Auth; protocol change is separately scoped |
| PDF 29–40, 50–57, 63–70, 76–84, 91–100 text inventory | Five-step rich onboarding, avatar/address search, real ID/selfie, contacts/social lookup, invitations, certificates | Inventory only; do not promise these capabilities through cosmetic forms or collect sensitive new data |
| PDF 71 / profile variants | Named profiles, biography/skills, completed-task and on-time statistics, quoted hourly pricing | Use existing public DTOs only. Never publish private profiles or invent metrics; additional public-profile contracts require separate scope |
| Brand “Care circle” vs project team517 | User repeatedly required stable project name team517 | Keep technical project/package/backend naming. Product wordmark/branding needs a deliberate decision, not an incidental global rename |

Unselected backup Offers remain valid while pending confirmation; real backend lifecycle determines closure. All privacy guards, duplicate protection and ended-relationship read-only Messaging must survive UI work.

## Ordered implementation batches

1. **Foundation + role-aware shell (A01–A05, A07).** Capture authoritative Figma context/assets for a specific target frame. Extract verified semantic tokens; implement reusable controls and role navigation. Wire to current routes without removing destinations. Compare one receiver and one helper shell on Android before broad rollout.
2. **Receiver Tasks as the first vertical slice (A06).** Target PDF 4 / By status first, then PDF 2 / Calendar. Remove duplicate hero/utility emphasis, use grouped compact Task rows, preserve Post/drafts/history and local-time agenda behavior. Calendar grid is frontend presentation over existing bounded API, not recurrence/scheduling infrastructure.
3. **Core coordination flow (A08–A12).** Manual draft/publish, AI reviewed draft (LOCAL only), Task detail, Offers and pending/confirmed Assignment, then Helper Discovery/My work. Reuse the approved shell/rows rather than style every screen independently.
4. **Supporting screens (A13–A17).** Messaging, Community, Me, Auth, persistent Notifications, Timeline and Review. Distinguish exact reference alignment from documented adaptation where the export has no matching implemented state.

The first reviewable implementation target is **receiver Tasks / By status**, not a palette-only global reskin or all 101 export pages at once. These batches are visual work, not authorization to begin Maps, finance, real AI/verification or iOS.

## Acceptance per batch

- Record frame/node ID, version/date, role, viewport, font scale and real fixture state. Match content density where feasible; label intentional copy/data differences. Current images are baselines, not after-fix evidence.
- Request high-fidelity context plus screenshot and original static assets for the exact frame. Source-specific assets and fonts must be local and licensed/provided; do not approximate the Figma icon set with Unicode or redraw images.
- Render the changed screens on Android. Produce before/reference/after images; inspect typography hierarchy, header position, row/card density, borders, icons, spacing, CTA and navigation. No invented “95% matching” score without defined controlled measurement.
- Exercise default/loading/error/empty/disabled states, repeated taps, large/long content, keyboard open/close, scrolling, system back and bottom safe areas. Test both actual role modes, not only global role membership.
- Recheck manual/AI LOCAL regression and real Offer/Assignment behavior, push routes, stale-state clearing and read-only terminated conversations. No direct business Firestore access; no auth based on lastActiveRole.
- Run focused Node 22/client checks for each UI batch and the established full suite/Hermes export at integration checkpoints. No screenshot is a substitute for functional regression.
- Rebuild/reinstall the standalone APK before claiming the distributed Preview reflects new UI. Old APK and existing cloud backend are untouched by this audit.

## Current deliverables

Complete export-page inventory, 16-page visual sample, four labelled comparison boards, frontend change map and prioritized plan. No app code, API, deployed backend, package dependencies or APK was changed. No new native acceptance or Figma pixel-perfect claim. These audit files are local repository changes and were not automatically pushed to GitHub.
