# PDF fidelity pass — November 12, 2026

Scope confirmed by the user: align every existing functional page; unimplemented capabilities may have clearly labeled visual previews. No backend/domain/API changes or service deployments were made. This pass supersedes the earlier [whole-app overhaul](design-overhaul.md) for current source/artifact status; earlier evidence remains historical.

## Reference and measured foundation

All 101 PDF export pages were rendered and reviewed as nine overview sheets. They include duplicate, legacy, multi-screen and future-feature boards, rather than 101 distinct implemented routes. The page inventory remains in `design-audit/2026-11-12/page-inventory.csv`. Typography was extracted from PDF text transformation matrices, not the raw size-1 font operands: context/detail headers 22, root headings 28 (receiver Tasks 26), card headings 18, body 16/22, metadata 13.5, form values 17, buttons 16 with 52 minimum height. DM Sans remains bundled. Canvas #FAF7F2, ink #122B3D, muted #596575, border #DDD9D3, primary #087F79 and button #0E7C72 are centralized.

Figma MCP remained quota-limited; the read-only browser fallback reached a login gate. PDF implementation was explicitly approved. Original icon vectors/avatar photographs are unavailable; Feather/initials are approximate. No pixel-perfect or numerical similarity claim is made. The app remains team517 and uses real/synthetic API data, not prototype names, ratings or balances.

## Existing-page implementation coverage

| Existing area / PDF reference | Implementation in this pass | Native evidence this pass |
| --- | --- | --- |
| Auth / 28 and onboarding boards | Large heading, email/password fields, bottom-anchored CTAs; actual Auth retained rather than prototype OTP | Login, error, logout and final APK cold-relaunch persistence exercised |
| Root navigation / 2–10, 17, 21–27 | Measured header/nav, role-specific destinations, focused detail headers; hide Calendar/status switch inside Helper/Calendar detail | Manager/Helper root tabs and nested Back exercised |
| Roles / 11 | Full description cards and role CTAs; actual roles only | Switch both directions exercised; preference does not authorize |
| Tasks / 2–10 | Calendar/status grouping, compact dated rows, options disclosure | Calendar, status list, owner detail and real draft save rendered |
| Task editor / 12, 41 | Assistant panel, field-like date/location selectors, compensation segment, visibility and private-details disclosure | Long form scrolling, input, save, AI/location return preservation exercised |
| AI / 12–13 | Separate input/review, grouped Task/When/Caregiver/Budget/Instructions; individual acceptance/version behavior retained | Input and read-only review-layout preview rendered; actual suggestion/apply covered by LOCAL mock HTTP, not cloud native |
| Owner Task / 14, 73–74, 88–89 | Title/requester/context, awaiting panel, summary/compensation/task-info cards, offers and private-details/activity folds | Owner details and existing completed Assignment rendered |
| Offers / 15–16, 71, 101 | Count/summary, tappable Offer cards, focused helper Offer, actual verification/optional review data | Two ACTIVE Offers and individual details rendered; Back returns list then Task |
| Assignment / 74, 88 | Heading, next-state guidance, authorized details, existing execution actions/history; real confirmation-success feedback | Completed state and cleared private location rendered; selection/execution transitions not repeated natively in this visual pass |
| Discovery / 17–20 | One API for List/Map, compact filters/cards, safe public detail, optional message fold, Offer-success screen | Empty/self-excluded and populated external-Helper views; actual withdraw/reactivate Offer exercised |
| Calendar / 2–3 | Measured month/date typography, agenda then advanced options | Month and empty day rendered; existing local-time/DST tests pass |
| Notifications / 24, 90 | Contained white rows, actual unread marker, utility controls in disclosure | Actual persistent notification list rendered; FCM not retested this pass |
| Circle / 72, 85 | Helpers/Family tabs, actual trusted members, compact Message action, context/tools disclosure | Actual member list and Message entry exercised; Helpers directory explicitly preview-only |
| Locations / 55, 81 | Saved locations fold, manual name/address, focused header; preserve editor while managing locations | Actual screen and Back preserved unsaved Task title; duplicate bottom Back removed |
| Inbox / 21 | White name/time/preview cards without extra avatars or giant utility panel | Actual conversations/latest sent-message preview rendered |
| Conversation / 75, 89 | Subtitle, history bubbles, outlined composer entry, expandable real input/send | Real synthetic message sent and persisted; input clears after success; terminal relationship creation correctly denied |
| Community / 25–27 | Flat posts, solid selected filters, explicitly illustrative media region, counts/actions, comments/resource screens | Feed/detail/comments rendered; real synthetic comment sent and counted |
| Reviews / 87 | Dedicated native Modal with real aggregate/zero state, stars/distribution/comments; existing review submission retained | Zero-review Modal and Back rendered; no native new-review submission claimed |
| Timeline | Existing compact connected events inside activity disclosure | Activity loaded and first events rendered; long history below fold not fully re-exercised |
| Profile / 22–23 | White settings tiles, actual account/verification/review data, points preview | Manager and Helper profiles rendered |
| Verification / 33–34, 51–53, 79–80 | Actual development state, badge/large icon/continue, read-only ID/selfie preview | VERIFIED state rendered; no provider/document collection; other status variants not native-exercised this pass |
| Feedback / 6–7, 60–61 | Bottom cancellation sheet; centered real-acknowledgment success screens | Actual draft-save and Offer-success rendered; cancellation/confirmation success variants not native-exercised this pass |

## Future-function visual previews

Map road grid/pins are explicitly illustrative placeholder positions, not a geographic map. It uses the same eligible Discovery data and never exact private coordinates. No Maps SDK, GPS or nearby-helper service. Points wallet/package/transfer, skills/availability, certificates, payment methods, circle invitations/directory and identity-check visuals are labeled preview/unconnected. Payment/purchase/transfer/upload actions are disabled. Balance is an em dash, not invented money/points. Package prices are clearly sample design copy. Community media is a labeled placeholder, not a fake attachment. Voice uses the existing transcript flow with explicit recording-not-connected copy. Generic Offer → selection → Assignment remains intact, including paid Tasks.

## Native-discovered issues and fixes

| Severity | Finding | Fix / retest |
| --- | --- | --- |
| MEDIUM | Unsaved editor values were at risk when opening Locations | Keep editor mounted but inaccessible/hidden while managing locations; native title survived round trip |
| MEDIUM | Calendar/By status switch remained above focused Helper Assignment/Calendar details | Hide root switch while a detail back-header is registered; final APK Assignment retest passed |
| MEDIUM | Comment action on the same post could clear an unsent comment | Clear only when opening another post; same-post comment state retained in source; final typecheck/client/integration pass |
| LOW | Two assistant buttons had unequal height from wrapped copy | Shorter Organize notes label; final APK re-render recorded |
| LOW | Resource detail duplicated View resource | Hide redundant feed footer on detail; final APK screenshot confirms one resource action |
| LOW | Locations duplicated its Back control | Keep focused header Back; final APK re-render recorded |

No BLOCKER/HIGH product defect was observed in this pass. That is limited to the exercised paths, not proof that all possible states are defect-free. Android Gboard handwriting/floating overlay sometimes intercepted taps and introduced a stray character during automated entry. Re-entering the field and dismissing IME allowed successful login. No credential/backend defect was found. Docked keyboard, physical phone, iOS, accessibility/large-font and disconnected-phone acceptance remain pending; do not mark them passed.

## Privacy and functional preservation

External Helper discovery/detail rendered only Approximate area; exact synthetic address was absent. Completed Helper Assignment rendered no privileged location. Existing epoch/background clearing is preserved. The final APK cold-start retained Alex Auth, and logout returned to an empty Auth form. An attempted new chat on a completed relationship was correctly forbidden; this is not evidence of terminal existing-chat-history acceptance. Manual draft save, Community comment, circle message and withdraw/reactivate Offer used real existing APIs. Full lifecycle, read-only history, concurrency, privacy and AI mock automation passed. No direct mobile business Firestore access was introduced.

## Validation and artifact

Node 22.23.4: typecheck, 22 backend unit, 65 client, 92 emulator integration, HTTP health/protected smoke, default HTTP flows, AI mock HTTP flows and Android Hermes export all passed. Four new pure presentation tests cover compensation truthfulness, generated area-label cleanup, local-day message labels and task date/time ranges. Default/mock HTTP include Community/Messaging regressions. Final boundary scan found zero mobile Firestore/Admin/listener/collection calls. Repository preflight found no secrets. Dependency audit: 28 advisories (1 low, 20 moderate, 7 high, 0 critical), unchanged; no forced upgrades.

Final Preview APK: `artifacts/android/team517-preview.apk`, 40,887,312 bytes, SHA256 `3179eb3576df7b0db28fba50773ab7aa3a1bffbf1ebda7e82d8d2b565a19ec3b`. Built with full JDK21/Gradle9 and bundled JS, installed on Pixel_9_Pro, emulator-5554 state device, Android16/API36 x86_64. No Metro or backend deployment required. Native evidence [index](native-evidence/2026-11-12-design-fidelity/README.md).

The existing functional UI now has page-specific layouts across the areas above rather than only shared reskinning. Exact original assets and all native state variants remain unverified; this is not a declaration of complete pixel parity or closure of physical-device acceptance.
