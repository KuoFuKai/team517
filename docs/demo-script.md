# Team demo — Grace arranges Mom’s clinic companion

## Standalone Preview substitution — Sprint 7B.1

The story below remains the LOCAL demo runbook. For a deployed/accepted standalone Preview, use [android-preview.md](android-preview.md) instead of the LOCAL emulator/Metro startup and reset commands. Preview is currently **not cloud-ready**; no successful phone-only demo is claimed.

Actors remain manager/alex/marcus/circle @team517.test, but Preview uses separately generated passwords from the private local Preview receipt, not `development517`. Prepare with `npm run preview:prepare -- --project team517-dev`; after native manual publish and Alex’s Offer, add the backup with `npm run preview:prepare -- --project team517-dev --task-title "Clinic companion for Mom"`. The default Preview preparation intentionally creates no clinic Task. Use one unique title per demo. Never run emulator reset/integration suites against cloud.

For the **phone-only live Preview** path, privately save the synthetic logins on the phone before class. The account order is **manager → Alex → Marcus → manager → Alex → manager**: create/publish; Alex offers; Marcus offers; manager compares/selects; Alex confirms/unlocks/starts/requests completion; manager approves/reviews and tours the supporting screens. No admin CLI is needed during that path. Title-targeted preparation is an optional pre-meeting route for an existing published Task, not a laptop dependency hidden in the live story. The 5–7 minute duration remains a rehearsed target, not a timed physical-device pass.

Kevin has one Android phone: logout disables the previous account’s device registration; use persistent Notifications in that segment. To show real OS push, keep Alex signed in/backgrounded and have a second authenticated client/admin acceptance harness perform selection. Do not present this as a three-phone live demo. The remaining lifecycle/tour story is unchanged; no real AI or identity provider is available.

Target: 5–7 minutes. Grace is the presenter persona for **manager@team517.test**; the app deliberately shows the real account email and privacy-safe Helper aliases rather than pretending a profile API contains Grace/Alex/Marcus display names. Alex and Marcus are synthetic verified helpers. Nothing represents a real care receiver.

The duration is a rehearsed presentation target, not a stopwatch-validated acceptance result. Use the prepared Task fallback when typing or optional AI would exceed the time available.

| Segment | Account / operator |
| --- | --- |
| Mom’s care, create/draft/publish, compare/select, approve completion, Review | Grace persona: manager@team517.test |
| Discovery, Offer, receive update, confirm, arrival unlock, start, request completion | alex@team517.test |
| Backup Offer | marcus@team517.test, supplied by title-targeted local preparation; no extra native login required |
| Calendar, Community, Messaging and Notifications tour | manager@team517.test; circle@team517.test is the seeded conversation counterpart |
| Optional live OS push | Alex stays signed in/backgrounded; manager performs selection from a second authenticated client or explicit local API acceptance harness |

## Prepare and reset

Use Windows PowerShell in the repository. Node 22 and Java 21 are required. Keep Auth 9199, Firestore 8280, Functions 5001, UI 4300. Android uses centralized `EXPO_PUBLIC_DEV_HOST=10.0.2.2`. Metro 8099 is the approved local-session workaround; default 8081 remains unchanged.

```powershell
$env:PATH=(Resolve-Path '.tools/node22/node-v22.23.4-win-x64').Path+';'+(Resolve-Path '.tools/java/jdk-21.0.13+9-jre/bin').Path+';'+$env:PATH
$env:AI_PROVIDER='mock'
npm run emulators
```

In a second terminal with Node 22 on PATH:

```powershell
npm run demo:reset
# Later, retain progress and fill missing fixtures without duplicate offers/messages:
npm run demo:prepare
```

**demo:reset deletes only the literal loopback demo-team517 Auth/Firestore emulator data**, including existing local tasks, device registrations and login sessions. It cannot target a cloud project. Use it before the presentation, not mid-demo. Reauthenticate the app afterwards. Preparation seeds existing identities/trust fixtures, then uses frontend API factories to publish the clinic Task, add two Offers, create one planning Resource/Post and send one idempotent circle welcome Message. Repeated preparation preserves lifecycle progress. A clean reset restores HAS_OFFERS with exactly two Offers. Dates are two days after preparation at 10:00–12:00 in the host timezone; the command prints equivalent ISO inputs for manual entry. Seeded verification is a fixture, not real verification.

Accounts: manager / alex / marcus / lisa / circle **@team517.test**, public local-only password **development517**. Manager has CARE_MANAGER + HELPER. Alex/Marcus/Lisa are mock VERIFIED; circle is UNVERIFIED but trusted in Mom’s care. All fixture content is synthetic. Helper aliases are derived from IDs; compare the two distinct offer messages to identify Alex versus Marcus.

Start each rehearsal with a fresh reset and create at most one manual Task with the chosen title. Run title-targeted preparation only **after that Task is published and Alex has offered**. Preparation can create a missing target Task through APIs, so running it too early is not evidence of native manual creation. Use reset, rather than repeated same-title creation, to restart the story.

Launch the existing SDK 55 development APK (not Expo Go) on the API 36 AVD. In apps/mobile:

```powershell
$env:EXPO_PUBLIC_DEV_HOST='10.0.2.2'
npx expo start --dev-client --port 8099 --offline
```

Use the existing native-build / secure backend FCM setup in [push-delivery.md](push-delivery.md) if demonstrating real OS push. The ADC file is backend-only through GOOGLE_APPLICATION_CREDENTIALS; never add it to mobile env, source or screenshots. Start the backend with explicit FCM development opt-in only for that optional real-push segment. Otherwise leave push provider disabled and demonstrate persistent in-app Notifications honestly. **For the reliable single-AVD story, use in-app Notifications after switching accounts:** logout disables the previous account’s device registration, and login does not replay already-skipped OS sends. For optional live OS push, keep Alex signed in, registered and backgrounded while Grace selects from a second authenticated client (or an explicit local API acceptance harness). Two Android targets are optional; do not promise a live OS alert while signing Alex out on the only device.

## Story and timing

1. **0:00–0:45 / Grace:** Sign in as manager, Me → Family & care manager, Tasks → Mom’s care. Explain role preference versus actual access. Show Post a task; enter “Clinic companion for Mom”, companionship, public clinic check-in request, synthetic private arrival note, printed ISO times, Demo home, Planned, Verified helpers, Volunteer. Save draft, then edit and publish. Optional: AI text/manual transcript → explicitly mock preview → select fields → apply → review the ordinary draft. If time is short, use the prepared “Clinic companion for Mom · Demo” with its two existing Offers.
2. **0:45–1:30 / Alex:** Sign out/in as alex; Find tasks → clinic detail. Show only approximate area before confirmation. Enter an offer message and Offer to help. For the prepared Task Alex already offered; show My offers instead. Marcus’s prepared backup has a distinct message.
3. **1:30–2:30 / Grace:** If you published a new manual Task titled exactly “Clinic companion for Mom”, first run `npm run demo:prepare -- "Clinic companion for Mom"` after Alex has offered. This uses normal APIs to fill the two synthetic Offers on **that same Task**, adding Marcus’s backup; it preserves Alex’s existing native Offer. The optional title argument targets that Task rather than the prepared `· Demo` fallback. Preparation can supply missing Offers through APIs, so do not describe those seeded actions as native taps. Then switch back to manager. Tasks → clinic → Review Offers. Compare verification, messages and real rating availability; never narrate a nonexistent rating. Select the intended Alex offer. Point out pending confirmation and the still-active Marcus backup.
4. **2:30–3:30 / Alex:** Sign in as alex, Inbox → Notifications / My tasks. If real push was prepared, background Alex’s app before Grace selects and tap the actual OS notification. Confirm Assignment. Show arrival details: only now does the synthetic exact address/private instruction appear. Start Task, then Request completion review. No payment action occurs.
5. **3:30–4:30 / Grace:** Sign in as manager, refresh the arrangement and Confirm completion. Submit a 5-star review with a short privacy-safe comment. Show Timeline’s real lifecycle events. Do not submit a second Review merely to simulate success.
6. **4:30–6:00 / Tour:** Calendar shows the same local timezone as Task detail. Community → planning checklist → save/like/comment. Inbox → circle conversation → send a message and refresh. Notifications persist independently of device push permission. Me → verification explains mock state; Points & earnings says coming later.
7. **6:00–7:00 / Team discussion:** Show [product-policy.md](product-policy.md) and [figma-gap.md](figma-gap.md). Maps/GPS are Sprint 7C. Points, payments, cash-out, no-show, arbitration, real ID/AI and voice are future scope.

## Recovery

After an error, retain the form and refresh the current resource before retrying a mutation. If selection already exists, follow My tasks instead of selecting another helper. If a demo has progressed, rerun **demo:reset before starting again**, then sign in; prepare alone intentionally does not rewind history. The prepared Task is a quick comparison/selection fallback, not proof that native manual creation passed. Never present old screenshots as a fresh native result. See native-acceptance.md for actually exercised checks.
