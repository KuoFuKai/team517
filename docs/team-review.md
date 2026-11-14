
## Sprint 8A — Points (November 14)

[Wallet/ledger, lifecycle policy, cloud and validation report](points.md) now records real available/reserved balance and private paginated activity, POINTS publication reservation, completed-helper reward transfer and whole-task cancellation release. Disputed/reopened tasks keep reservations under the documented policy. This supersedes older metadata-only/future-Points statements below. No money, purchase, cash-out or fee; no wallet data in Discovery/Maps and no mobile business Firestore access. Phone acceptance is queued per Kevin; emulator observations are recorded separately.

# Sprint 7B team review

Sprint7B.2: [physical Android / responsive acceptance / collaboration](sprint-7b2.md) and [visible progress](visible-progress.md). Actual vivo V2324A Android14/API34 ≈360dp/font1.12 rendered the documented core/support paths; 320/360/390/412dp emulator Tasks/Post at1.0/1.3 and360dp at0.85 also rendered. Physical docked keyboard, synthetic draft/comment/message send and background Conversation/Task FCM taps passed within scope. Final APK SHA256 `2af447b575958703cf7b742e2bf23b288b1367dc4c06db695e41504a96223ae1`; Node22 full suite22 unit/78 client/92 integration plus smoke/default+mock HTTP/Hermes passed. Kevin reported the complete USB-disconnected normal-network short flow succeeded (user-observed, separately from adb evidence). Sprint7B.2 can close within the documented scope. Kingsley branding/history preserved on the Sprint branch; final integration/CI state is recorded in the Sprint report/completion. Earlier checkpoints below are historical.

November 12 standalone Preview follow-up: team517-dev now has deployed backend/Firestore, Email/password Auth and synthetic Preview accounts. Use the private Preview login receipt, never the public LOCAL passwords. Extended cloud smoke and documented API 36 standalone cloud/FCM tests passed; [evidence](native-evidence/2026-11-12-preview-cloud/README.md) separates native actions from synthetic peer API actions. Physical-phone acceptance/full class rehearsal remains pending in [android-preview.md](android-preview.md). Historical local 7B/7A evidence below is not automatically cloud/physical acceptance. The LOW reopened Review-entry issue remains documented; backend duplicate protection remains authoritative.

For **Yiru / Kingsley**: review the experience as someone arranging help for a family member and someone offering that help. You do not need backend knowledge. Grace is the demo persona for the manager account; Helper aliases are intentional until a public profile name is available.

Read [demo-script.md](demo-script.md) first for the reproducible local story and accounts. [native-acceptance.md](native-acceptance.md) separates current observations from prior Sprint 6C/7A evidence. [validation.md](validation.md) records automated results. No production deployment is claimed.

The scoped Sprint 7B Android demo/review work can close after the recorded final green regression and native checks. No observed BLOCKER/HIGH remains. Exact Figma parity is a follow-up design review, and the own-assignment Review-status DTO gap remains LOW; neither is presented as completed functionality. Maps may be scoped separately as Sprint 7C, without starting it in this change.

## Working product

### REAL / FUNCTIONAL

Tasks can be drafted and published. Helpers discover eligible Tasks and send Offers; the requester compares and selects one, and the helper confirms. Confirmation unlocks arrival details. The helper can start and request completion, and the requester approves or reports an issue. Reviews, Calendar, Notifications, Community and one-to-one Messaging work. Real Android push was exercised on the development emulator. These are functional development flows, not a claim of production readiness.

### MOCK / DEVELOPMENT

AI suggestions come from the explicit mock provider and require review before applying. Verification status is provided by development fixtures, not a real identity check. Messaging refresh is manual; no typing/presence or live transport is implied.

### FUTURE / NOT IMPLEMENTED

Maps/GPS, Nearby Helper discovery, Points ledger, cash-out, Payments/payouts, No-show, Early Termination, Dispute arbitration, Instant Match, real AI, real identity verification and voice transcription. Compensation shown on a Task does not transfer money or Points.

## Review the polish

Warm canvas, dark ink, teal actions and compact cards follow the one retrieved latest Figma discovery frame. Existing theme/primitives remain the implementation foundation. Primary navigation has at most five destinations; circle selection remains in Tasks and Me, Inbox/Notifications are secondary. Task previews share one component, Helper work prioritizes pending/active actions, and Assignment places next-step guidance before history/reviews. Calendar and Task times share an explicit device timezone. Singular review/star counts are fixed.

Figma quota prevented other frame screenshots. System font/glyphs and functional long forms remain approximations; exact parity is not established. See [figma-gap.md](figma-gap.md).

## Decisions and gaps

Use [product-policy.md](product-policy.md) as policy source of truth. Maps/GPS belong to Sprint 7C. Nearby helper consent, Points value and legal/accounting/exchange-rate design for the potential cash-out direction, fee pricing, no-show grace/evidence, early termination, arbitration operations, retention/deletion and optional paid Instant Match require product decisions. None is implemented here.

One known LOW issue remains: reopening a completed Assignment can show the Review form even if you already reviewed it. The server still prevents a duplicate Review. The app needs a small additional piece of account-specific information to show “Your review” reliably after reopening. This is documented, not presented as fixed; see the [closure audit](sprint7b-closure.md).

## Questions for Yiru / Kingsley

- Does the visual style feel appropriate for families and helpers?
- Can you find Tasks, Calendar, Circle, Community, Inbox and Notifications without guidance?
- Are the terms Task, Offer and Assignment clear? Does Helper versus Requester / Care Manager wording make sense?
- Is Task creation understandable, including public details versus confirmed-only arrival details?
- Can you compare Offers and understand what selection versus confirmation means?
- Does the future Points/finance concept fit the product without suggesting a working wallet today?
- Is Community in the right place, and is a Community Need clearly linked to the same Task flow?
- What felt confusing, slow or surprising during the demo?

## Sprint 7C team review — 2026-11-13

Try Helper → Find → Map → marker → preview → View task → Offer, then Map/List and shared filters. Same-area tasks have Next task in this area. Location is optional; try denying it. Use only synthetic emulator locations for shared screenshots, and never publish the phone's current GPS. [Maps setup/acceptance/limitations](maps.md).

The vivo tested real cloud Preview, Map/Offer, docked Offer-message input and two background FCM routes. Four emulator widths (320/360/390/412dp, including 1.3 text) were exercised. Please review approximate-area comprehension, coincident-task discoverability and preview scrolling; dense provider labels remain a low-priority visual issue. Nearby Helpers, Points/Payments and iOS are still future, not hidden implemented features.

## Sprint 8B — candidate comparison review

Try requester Tasks → Company for a Saturday appointment → arrangement/backup Offers (the final native acceptance selected Alex, still waiting for confirmation). Compare Marcus's real synthetic history with Sam's Circle/no-Reviews state. For a fresh selection walkthrough create a normal new Task; do not reset the progressed fixture. Open Profile → Message → profile → Android Back; Me → own public profile. Ask whether VERIFIED vs Care Circle is understood, whether the response covers the desired time, and whether selection clearly requires the Helper's confirmation. No safety/KYC claims or public Points balances. [Report/evidence](sprint-8b-report.md). Physical8A/8B checks remain pending; no real user study result is implied by synthetic histories.
