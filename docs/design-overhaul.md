# Whole-app design alignment — November 12, 2026

This change extends the Tasks/navigation and Calendar work across the existing product. It addresses screen composition, density, typography, form controls and focused navigation using the user-approved PDF baseline. It is not a claim that all 101 export pages or every Figma pixel has been reproduced. See the [reference inventory and original audit](figma-alignment-plan.md).

## Implemented

- Locally bundled DM Sans regular/medium/semibold/bold; compact shared controls, thinner cards, horizontal information rows, real avatars as initials, chips, action rows, menu rows, disclosures and status panels. Feather remains an explicitly approximate icon set. No remote font request at runtime.
- Focused back/title headers replace the unrelated global home heading on Task, Offer, assistant, conversation, notification, verification and resource/post detail screens. Root role/navigation destinations remain intact. Main tabs are shown on root screens; focused back/title pages (Task, editor, Offer, conversation and role picker) use the back path rather than duplicating the root tabs.
- Auth has a large welcome heading and a single uncluttered form. It keeps real email/password authentication rather than pretending that the prototype OTP flow exists.
- Me is a compact account/settings list. Role switching opens a dedicated two-card/multi-role page using actual roles. Only lastActiveRole changes; it grants no authorization.
- Post/Edit Task uses grouped fields, privacy guidance, a private-arrival disclosure, location/priority/visibility/compensation chips, primary publish and secondary save. Android uses native date and time dialogs via Expo-compatible @react-native-community/datetimepicker 8.6.0. Cancellation does not write a value. Manual form state survives opening/closing the assistant because it remains owned by the editor.
- Time inputs convert local wall time at the API boundary, reject invalid dates/DST gaps, and preserve seconds/milliseconds on unchanged existing timestamps. No Task DTO or backend scheduling semantics changed. This is not recurrence or a new scheduling service.
- AI input and review no longer share the long manual form. Notes/transcript controls and individual proposed-field cards retain the existing explicit acceptance/version checks. Cloud AI stays disabled; LOCAL mock stays available. No audio or real AI integration.
- Task detail has status guidance, compact authorized information, collapsible private notes/activity and the existing offer/arrangement action. Owner-only exact location remains authorized by the existing API.
- Offers show compact summaries first, then a focused individual Offer with actual verification, optional actual rating, message, selection and review/message actions. No fabricated profile information, hourly rates or payment/PIN flow.
- Assignment keeps all existing state-dependent actions, permission checks and privileged-data epoch/background clearing. Next-action guidance is prominent; history, timeline and reviews are grouped. Completion/review rules are unchanged.
- Discovery shares the same safe API/read model for List and the honest Map placeholder. Filter controls are compact, task cards are tappable, detail separates public information from approximate location and offering. Exact private addresses are not fetched for discovery.
- Helper work uses compact tappable task cards and focused arrangement detail. Inbox uses participant/preview rows; conversations use bubbles, nested history scrolling and an inline input/send composer. Existing paging, read-only behavior, retry ID and refresh semantics remain intact. Task/circle Message entries now open a focused conversation modal instead of inserting the chat inside a parent card; closing restores the same coordinator state. This path was exercised natively through a real synthetic active-Offer relationship without sending a message.
- Community uses author rows, filter chips, compact linked-resource previews and Like/Comment/Share action rows. No fabricated media attachments. Persistent Notifications use compact rows; timeline uses a connected compact list; review ratings use a horizontal choice group. Circle/location screens inherit the shared controls and compact grouping.

## Native-discovered defect

MEDIUM: Android Back from focused Offer details skipped the Offer list because parent listeners were registered after children. Replaced listener-order dependence with one centralized priority stack: conversation > AI review > assistant/Offer > workspace > app. Callbacks stay current via refs, and unmounted routes deregister. Three credential-free regression tests cover priority, yielding and cleanup. This is frontend navigation only.

## Intentional differences and remaining acceptance

| Area | Remaining difference / reason |
| --- | --- |
| Exact Figma tokens/assets | MCP quota remains exhausted; PDF approximation is explicitly user-authorized. Original SVG icons, avatar photography, some precise spacing and component variants are not verified. No pixel-perfect or percentage-match claim. |
| Data and identity | Synthetic account names, dates, task counts and pseudonymous helper labels differ from the prototype; no invented names, reviews, balances or profile data. |
| Future prototype screens | Maps/nearby helpers, point wallet/payment/PIN, real KYC, OTP/onboarding expansion and attachment media remain outside the existing product. They are not fake working screens. |
| Native scope | Android 16/API36 Pixel_9_Pro emulator only. No physical phone, iOS, tablet, large-font or TalkBack acceptance this pass. |
| Keyboard | Text entry exercised, but Android's handwriting/stylus onboarding and floating toolbar intercepted gestures. The floating Gboard keyboard was subsequently opened through its toolbar menu; draft text and Send remained visible. Docked-keyboard overlap across forms is still pending and is not marked passed. Native date/time selection and long-form scrolling did pass. |
| AI review | Entry rendered natively; proposed-field review is implemented/typechecked and LOCAL mock HTTP regression passes. A real/native cloud suggestion is not claimed because the provider is disabled. |
| Full lifecycle | Existing completed Assignment and current Offers rendered; this pass did not repeat native selection/confirmation/start/completion/review submission or mutate backup Offers. Full automated lifecycle regressions passed. |
| Rare states | New-account initialization, create-circle submit, location creation, all error/loading variants and termination-time messaging/location changes have not all been repeated natively in this visual pass. Earlier acceptance and API regressions are separate evidence. |

No backend, contract, repository, Firestore rules, deployment or Firebase ports changed. Persistent Notifications and existing FCM architecture are preserved. No Maps, finance, real AI/verification, or new business feature was added.

## Validation and distribution

Node 22.23.4 / Java21: full suite passed (22 backend unit, 58 client at the integration checkpoint, 92 emulator integration, smoke, default HTTP, explicit mock HTTP, Hermes export). Final navigation fix additionally passed typecheck and **61/61 client tests**, then a final standalone Android Hermes export and rebuilt APK. The Back fix was also retested natively: Offer detail → Offer list → Task detail → Task list. An earlier mock run failed during emulator function discovery with fetch failed; retry and the subsequent full run passed without a backend change. Final logs are ignored under .tools/design-overhaul-*.

New dependencies are DM Sans 0.4.2 and native datetimepicker 8.6.0; Expo font was already used in batch 1. Root npm audit: 28 advisories (1 low, 20 moderate, 7 high, 0 critical). No broad audit-fix upgrade was applied. Frontend business-Firestore import scan has zero matches. Secret preflight reports no findings; no credentials or APKs are committed.

APK: artifacts/android/team517-preview.apk. Install as an update to edu.cornelltech.team517; uninstalling is unnecessary. The [native evidence matrix](native-evidence/2026-11-12-design-overhaul/README.md) records what actually rendered and the final artifact hash. This remains a development Preview, not a production distribution.

Main overhaul commit c85287b hosted Node 22 CI passed: [run](https://github.com/KuoFuKai/team517/actions/runs/43266289770). Final focused-navigation/modal changes passed the same focused 61-test client suite, typecheck and Hermes export; no backend changes.
