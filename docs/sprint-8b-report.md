# Sprint 8B — Trust Profile and Offer Comparison

## Delivery and collaboration

Started from `origin/main ea8654d` on `codex/sprint-8b-trust-profile`. Main had no incoming changes during implementation. Kingsley's `design/517-brand-system` (`7a86da8`) and `design/figma-schedule-picker` (`913b914`) were inspected; their heads had not changed. No conflict resolution, force push or teammate branch modification was needed. Existing brand, navigation and API/service/repository boundaries remain intact.

Implementation checkpoints: `f7288e2`, `393d493`, `bd2241b`, `d7d567c`. Final acceptance commit and hosted CI are recorded below after verification.

## Trust model and privacy

Authenticated `GET /api/v1/helpers/:id/profile?taskId=...` returns an explicit public allowlist: user ID, safe display name, verification status, completed-task count, optional average, review count, optional membership month and at most five recent safe Reviews. `reviewLimit`/`reviewsTruncated` describe the bounded result. No raw User/Firestore document is returned. No email, phone, legal/Auth display name, exact address, access instructions, wallet, Points balance or private verification evidence is projected.

`publicFirstName` is optional and backend-controlled; it must be a single safe first name. Otherwise a stable Helper alias is used. Names are never guessed from an email or Auth name. Synthetic Preview accounts have fictional first names; no profile-editing or real identity provider was added.

`VERIFIED` means the existing server-controlled verification state, including controlled Preview fixtures. It does **not** assert KYC, a background check, criminal-record search, professional license, safety guarantee or provider integration. `UNVERIFIED`, `PENDING` and `FAILED` remain distinct API states. Circle relationship and verification are independent: Sam can be a trusted-circle candidate while unverified externally.

An unscoped profile never reveals Circle membership. With `taskId`, the caller must pass existing Task `VIEW_OFFERS` authorization and the target must have the matching Task/context/Helper Offer. Random Helpers and ordinary Circle members cannot inspect a competing Offer through this route. Existing safe Review policy is reused; reviewer label is Requester, with existing rating/comment/date fields.

## Counts, reviews and bounded reads

Completed count is a server COUNT of the Helper's `COMPLETED` Assignments. The existing atomic terminal Task/Assignment completion invariant makes these authoritative; cancelled/disputed/incomplete relationships are excluded. Existing server COUNT/AVG aggregates produce review count and average, refreshed on every read. Zero reviews omit the average and display “No reviews yet”; no invented 0.0 rating.

Offer summaries are additive DTO fields, never persisted trust snapshots. Users/memberships are batch-read; four aggregate workers limit concurrency to at most eight aggregate operations. One Offers HTTP request supplies the cards. Profile reviews reuse the existing bounded Review query and expose at most five; the separate existing Reviews API remains available. An assignments/helperId/status composite index was added. Offer comparison reads at most 101 records and fails explicitly above 100 historical Offers instead of silently hiding candidates. Pagination/search at greater scale remains future work.

## Visible experience and selection

Offers separate name, verification, factual rating/review/completion counts, message and explicit actions. View offer opens the full response; View profile opens a dedicated safe profile. Message reuses the existing Task Conversation authorization. An authorized requester can also open the Helper profile inside that Task Conversation. Me has a self public-profile entry for actual HELPER-role users, independent of active UI mode.

Select opens a cancelable confirmation sheet naming the Helper. It explains that the Task is not fully arranged until the Helper confirms and backups remain available. Rapid taps use the existing in-flight lock and transactional backend conflict protection. The sequence remains **Offer → Select → Helper Confirm**; no direct paid acceptance was added.

Native selection of Alex produced `PENDING_CONFIRMATION`, one SELECTED Offer and two ACTIVE backups, verified through authenticated APIs. The comparison Task was deliberately left pending; fixture replay preserves this progress and does not reset it.

## Synthetic Preview stories

`npm run preview:trust -- --project team517-dev` uses guarded real Auth and existing public lifecycle APIs. Five synthetic VOLUNTEER histories go through publication, Offer, selection, confirmation, start, completion request/approval and Review. No aggregate, completed counter, rating or Points balance is directly patched. An ignored local receipt preserves IDs; unexpected state/identity stops rather than rewinds. Existing Reviews are immutable and duplicate submission is safely recognized.

Observed profiles: Alex 6 completed Tasks / 3 Reviews / 4.7; Marcus 2 / 2 / 5.0; Sam 0 / no Reviews / unverified Care Circle. Comparison: “Company for a Saturday appointment,” with three different response messages. These are fictional API-generated histories, not real community work or user research. Before/after assertions preserve all four private Points accounts. Replay after native selection passed and retained the pending Assignment/backups.

## Android acceptance — November 14, 2026

Target: `emulator-5554`, `Pixel_9_Pro`, Android 16 / API 36, x86_64, adb state `device`. Installed standalone cloud Preview APK; no Metro, local Firebase or adb reverse required. Latest APK SHA-256: `9a9ce1c5aa8f6ccb13457667cd53e61e4a51b2da55fdab7d44c476294b96c291`.

| Actually exercised | Result / boundary |
| --- | --- |
| Three Offer cards, Alex/Marcus aggregates, Sam Circle/no Reviews | PASS; real cloud projections, fictional fixtures |
| Alex profile, full Offer and recent Reviews | PASS |
| Profile → Message → nested profile → hardware Back to Conversation → original profile → Offers | PASS on latest APK; underlying list remains mounted |
| Me → self public profile → Back | PASS; Grace, no email/wallet in public projection |
| Native Message input/send | PASS in earlier candidate; docked full-width emulator keyboard, actual synthetic message sent; layout unchanged in final APK |
| 390dp font 1.0 | PASS final card/profile/actions |
| 320/360/390/412dp font 1.3 | PASS actual profile/list/confirmation renders and scrolling; buttons stack; Cancel works |
| Select Alex confirmation → pending arrangement | PASS native taps, then API verifies one SELECTED/two ACTIVE backups |
| Background generic FCM → Android shade → Conversation tap → Back | PASS final APK on emulator; no message text/location in OS payload |
| Maps List → Map → Errands marker → View task → Back → List | PASS final APK, actual Google tiles/approximate pins |
| POINTS Discovery List/detail and requester wallet | PASS final APK, 250-point metadata; owner 1,000 available/250 reserved |
| VOLUNTEER and PAID/POINTS matching semantics | Automated coverage; no new native PAID Task was rendered this session |
| Auth persistence | Existing sign-in survived APK replacement/relaunch; manager → Alex logout/login exercised |
| vivo physical checks | PENDING; phone absent, per Kevin use emulator now |

Screenshots are in [native evidence](native-evidence/2026-11-14-trust/README.md). Width overrides test responsive layout, not four separate physical phones. No GPS/current-location grant or real-world tracking was tested in this slice.

## Observed issues and fixes

No new BLOCKER/HIGH product defect was observed in the exercised Trust flow. MEDIUM: opening profile previously replaced the Offer workspace and lost list position on Back; profile now uses existing ScreenModal with independent scrolling and keeps the underlying list mounted. Latest native nested-modal return sequence passed. MEDIUM: stray action-row whitespace caused unnecessary stacking; removed and verified. LOW: Conversation used a generic Member alias while profile showed Alex; when the contextual public projection succeeds it now uses the same safe first name. Unauthorized/contextless conversations retain the existing alias.

Fixture replay originally tried to obtain an Assignment ID from TaskDetailDto, which does not expose that field. It stopped safely without resetting data. It now uses the existing manager Offers DTO; a credential-free strict fixture typecheck is part of `npm run typecheck`. This was development tooling, not a production domain change.

LOW remaining: dense Google provider labels; long Offer excerpts intentionally truncate to four lines with full response available in View offer/profile. No broad redesign was made. Empty and error UI remain retryable; error branches/privacy/permissions are primarily automated coverage, not every error deliberately induced natively.

## Automated and cloud validation

Node 22.23.4 / Java 21. Backend unit 27; client 97; emulator integration 105. Two complete integration reruns passed 105/105 after one earlier transient fresh-Auth Push setup 401; no Auth changes or weakened checks were made. Latest focused Trust run passed 4/4, including fresh Offer aggregates after new Reviews. Typecheck includes Preview Trust fixture contracts. Existing smoke, default HTTP/manual flow, mock-AI HTTP flow and Android Hermes export passed; final acceptance rerun status is recorded in validation.md.

Cloud Trust API/index deployed to team517-dev. Real-Auth Preview smoke passed health, draft update, direct Firestore denial, safe Discovery, Offers, Community, Messaging and Notifications. Points receipt replay passed without repeat transfers. Post-selection Trust replay passed with unchanged Points. Native FCM is separately observed above; disabled device-registration API smoke alone is not counted as push acceptance.

No new dependencies. Existing advisory baseline: 28 (1 low, 20 moderate, 7 high, 0 critical). Frontend Firestore boundary and secret preflight are recorded with final checks. No credential contents are committed; ADC remains backend-local only.

## Closure and next step

Engineering/cloud/emulator acceptance is ready subject to final regression/CI below. Full physical Sprint 8B acceptance and Sprint 8A physical closure remain pending separately. Run one consolidated vivo checklist when connected: final APK/cold Auth; Trust comparison/profile/Message/Select/Back; docked keyboards; all four prior photo/Points/native scope items; Maps/privacy; both Task and Message background FCM routes; ordinary-network USB-disconnected smoke. Do not count emulator results as physical passes.

Trust limits: controlled verification status, no real provider; optional first name/no profile editor; aggregate query cost; bounded recent Reviews and historical Offer cap; no claim of real trustworthiness from synthetic fixtures. Points balances are not public. No Payments, cash-out, Points purchase, fees, background-check service or iOS work was started. iOS remains deferred. Recommended next visible work is a short team usability review of comparing candidates and Circle-vs-verification comprehension before choosing the next product slice; do not automatically start another Sprint.


Final post-native Node22 acceptance rerun: **all PASS** — typecheck (including strict fixture contracts),27 backend unit,97 client,105 emulator integration,smoke,default/manual HTTP,mock-AI HTTP and Android Hermes export. Frontend business-Firestore scan: no matches. Secret preflight: no findings; rerun again after staging final evidence. Standalone cold force-stop/relaunch on the restored original1280x2856/480dpi/font1.0 AVD retained Alex Auth; adb reverse list was empty. No native PAID Task was rendered; compensation-specific automated coverage remains the evidence for that path.
