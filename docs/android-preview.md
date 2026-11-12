# Android Preview — Sprint 7B.1

Current measured-PDF UI artifact: [fidelity report](design-fidelity.md), 40,887,312 bytes, SHA256 `3179eb3576df7b0db28fba50773ab7aa3a1bffbf1ebda7e82d8d2b565a19ec3b`. Final APK installed and cold-relaunch Auth/detail/Community fixes checked on Pixel_9_Pro Android16/API36. Earlier artifact hashes below are historical; no new backend deployment.

Current whole-app UI artifact: [overhaul](design-overhaul.md), 40,853,600 bytes, SHA256 `7d282c03ad0bd76ac284cc5fc854ab3da99845ae7ce946527750ab8f88ace7a2`. Final APK installed on Pixel_9_Pro Android16/API36; nested Back, focused task-chat return and caption wrapping retested. Earlier artifact hashes below are historical.

Current Calendar UI artifact: [batch 2](design-alignment-batch2.md), 39,998,872 bytes, SHA256 `02f64f6e7a4b106f4a262c6db3520424d70e2d67b413fc2004c22a175c188b6f`. Installed/rendered on API 36; no new backend deployment. Earlier APK hashes below are historical.

Latest UI artifact: [design alignment batch 1](design-alignment-batch1.md) rebuilt the same Preview APK on November 12, SHA256 `8510aff3478725df1ad33057684b79c620ae4578082eda856410d094242efaa2`, 39,990,716 bytes. Its scoped native tests passed against the existing cloud backend; older APK hash/launch records below are historical. No new backend deployment occurred for the UI batch; physical acceptance remains pending.

## Purpose and current status

Internal Product Studio demo/team review only: **team517 Preview**, non-production Firebase project **team517-dev**. No Google Play submission, production environment or iOS build.

**APK built; backend deployed; API 36 standalone cloud/FCM checks passed; Sprint 7B.1 is NOT fully closed.** Physical-phone installation, disconnected-USB/normal-Internet acceptance and full class rehearsal remain pending. The laptop is no longer the backend/Metro host for Preview.

### Current cloud checkpoint — November 12, 2026

- Deployment identity: Firebase CLI Google user `kevin08062006@gmail.com`, confirmed by actual project visibility. Commands clear runtime ADC/token overrides only in their child session. No runtime IAM roles were changed manually; Billing is owner-confirmed Blaze and is no longer queried as a deployment gate.
- Newly enabled APIs: Firestore, Cloud Functions, Cloud Build, Cloud Run, Eventarc; Firebase CLI additionally enabled Firebase Extensions for its deployment discovery. Identity Toolkit, Artifact Registry, Pub/Sub, Firebase Rules, FCM and Storage were already enabled. No Maps or unrelated provider enabled.
- Created Standard Native `(default)` Firestore in **us-central1**, matching both existing Functions. Deployed deny-all client rules and 20 composite indexes (19 existing plus the demonstrated missing `reviews(revieweeId ASC, rating ASC)` aggregate index). All 20 are READY.
- Deployed existing **api** and **deliverNotification**, both ACTIVE, Node 22, us-central1. Runtime identity is `628775953070-compute@developer.gserviceaccount.com`, not the local Admin JSON. Initial notification-trigger deployment failed on first-use Eventarc service-agent propagation; a later narrow retry succeeded without manual IAM changes.
- Firebase CLI reported the canonical API Function URL `https://us-central1-team517-dev.cloudfunctions.net/api`; the existing centralized API base `https://us-central1-team517-dev.cloudfunctions.net/api/api/v1` matches it. No mobile endpoint rebuild was required.
- Set a 30-day cleanup policy only on `us-central1/gcf-artifacts` generated build images. No Function, business data or unrelated cloud resource was deleted.
- Kevin initialized Firebase Authentication and enabled Email/Password in Console after supported config PATCH returned CONFIGURATION_NOT_FOUND. User-authenticated preflight now passes database/Auth/API checks.
- Guarded preparation created four synthetic accounts and Mom's care, one Resource/Post and a welcome Message. Initial index-building failure was retried. The original incomplete fixture IDs violated existing API contracts; exactly four unreferenced synthetic baseline documents were transactionally migrated to valid IDs with timestamps preserved. No Task/Offer/Assignment/Conversation was deleted or reset. Context is `team517PreviewCare01`, location `team517PreviewLoc001`; regression coverage now checks these IDs.
- Extended cloud smoke passed real Auth, me, private draft read/update, anonymous/signed-in direct Firestore denial, privacy-safe Discovery, Offer/owner Offer list, Community, Messaging, Notifications and disabled-device API. It retains a distinctly labelled synthetic Offer probe, never the main clinic Task, and no real request for care. A separate labelled native Assignment probe was completed through normal APIs/native actions; its history is preserved.
- November 12 actual native acceptance: emulator-5554, Android 16/API 36, x86_64, adb device. Existing APK reinstalled, all local service ports stopped, adb reverse empty. Real manager/Alex login, Task detail/Offer review, Helper Discovery, role switch, Community, Inbox/Conversation and native Message send rendered. Device permission was already granted; registration and account transfer used existing controls. Background OS FCM Message/Task/Assignment notifications delivered with generic payloads; taps routed to the correct Conversation/Task/Assignment. No historical LOCAL evidence was substituted.
- Alex confirmed/started/requested completion natively. Creation/publish/Offer/selection and manager completion approval for the separate native probe were driven by a synthetic peer harness through existing cloud API clients, not claimed as native taps. Exact arrival details were hidden while pending, explicitly loaded after confirmation, and cleared after completion plus refresh. Force-stop verified absent PID; cold relaunch restored Auth and cloud Task data; Calendar rendered the completed probe. This does not prove instant revocation without refresh.
- Background FCM passed. An `am kill` attempt left the process alive, so process-absent/cold-notification delivery is **not** claimed. Force-stop/relaunch tested Auth persistence separately. No physical phone was attached; no USB-disconnected/adb-stopped/laptop-closed physical acceptance was performed.

The November 11 audit and early November 12 follow-up below are historical observations, superseded by this deployment checkpoint.

| Observed November 11, 2026 | Result |
| --- | --- |
| Firebase project | team517-dev ACTIVE, project number 628775953070 |
| Android registration | Existing edu.cornelltech.team517 client in team517-dev; retained |
| Cloud Billing read | 403 SERVICE_DISABLED; Blaze/billing linkage is **unknown**, not confirmed Spark or Blaze |
| Firestore / Functions reads | 403 SERVICE_DISABLED; existing database/functions could not be enumerated |
| Auth admin configuration | 404 NOT_FOUND; Email/password readiness not established |
| Service Usage inspection | 403 AUTH_PERMISSION_DENIED for the supplied backend identity; insufficient visibility/deployment prerequisites |
| Intended API health | 404; no working Preview API verified |
| Cloud mutations in this sprint | None: no billing/API enablement, deployment, database creation, Auth accounts or fixtures |
| Web App inventory | None registered; current client uses the existing Android app’s permitted public Firebase configuration |

The audit preceded repository changes and any cloud mutation. The existing project remains the intended target; no separate Firebase project was created. Cloud deployment was stopped at read-only preflight, not attempted through an automatic service-enablement workaround.

## Environment architecture

### Historical early November 12 follow-up (superseded)

The earlier runtime-ADC probe returned Billing/Service Usage 403. That did not establish cloud unavailability. The subsequent user-identity workflow above supersedes it: runtime credentials are not deployment credentials and must not be granted broad inspection/Billing/deployment roles merely to satisfy that old probe. Blaze is owner-confirmed enabled. No private key was opened or printed.

`apps/mobile/src/environment.ts` owns LOCAL/PREVIEW selection and Firebase client validation; `config.ts` supplies statically inlined Expo public variables. Auth connects to an emulator only when the resolved configuration enables emulators. Screens retain the same API/service layer and product logic.

| Mode | Auth / API | Purpose |
| --- | --- | --- |
| LOCAL (default; legacy `development` accepted) | Auth 9199; Functions 5001; demo-team517, configurable localhost / Android 10.0.2.2 | Existing development and credential-free CI; Firestore 8280, UI 4300 unchanged |
| PREVIEW | Real team517-dev Auth; allowlisted HTTPS API; backend Firestore | Internal standalone app; no emulator connection or local endpoint override |
| PRODUCTION | Reserved; build/runtime configuration refuses it | Future work, not silently aliased to Preview |

Deployed API base (canonical Function URL verified from deployment output):

`https://us-central1-team517-dev.cloudfunctions.net/api/api/v1`

Region remains us-central1. Mobile business collections remain API-only. Firestore rules remain deny-all for direct client reads/writes; no convenience access was added. The public `/health` route does not expose business data; all existing business API routes still require Firebase bearer authentication and existing authorization.

Preview has no runtime 10.0.2.2/LAN/localhost dependency. LOCAL branches and SDK development strings may remain in compiled code; these are not Preview endpoint selection. Tests enforce the resolved Preview URL and reject emulator overrides. The packaged Expo metadata was inspected as PREVIEW / team517-dev.

## APK and install

Artifact: **`artifacts/android/team517-preview.apk`** (ignored build output), 39,935,932 bytes.

SHA-256: `6302f9e90d88b8347c3048a2f113583734c72bff99a146f4c01104b637738167`

Display name **team517 Preview**, applicationId **edu.cornelltech.team517**, version 0.1.0 / code 1, Android min SDK 24 / target 36, arm64-v8a and x86_64. Same package means Preview replaces the local development app on that device; they do not coexist. Technical project name/slug remains team517. Existing Firebase Android registration is preserved.

Build command, from repository root with the documented local Node 22 / JDK 21 / Android SDK installed:

```powershell
npm run preview:android
```

This uses Expo prebuild and Gradle **`:app:assembleRelease`**, bundles Hermes JS, excludes the dev-client config plugin for Preview and disables dotenv loading to prevent local endpoint settings leaking into the build. It removes the Admin credential environment variable from the build process. The existing internal/debug signing key is used by the release variant; this is not store signing or a production-release artifact. Keep the same signing identity for updates; changing signing identities requires a deliberate uninstall/reinstall strategy.

Transfer the APK privately to Kevin’s Android phone, open it in Files/downloads and allow installation from that source if Android asks. USB/adb is optional for installation and is not part of the intended runtime. An existing same-package development installation will be replaced. Phone installation has **not** been performed in this run; no physical device was listed by adb.

Optional hosted EAS profile: `apps/mobile/eas.json`, `preview`, internal distribution, `developmentClient:false`, APK. From apps/mobile: `npx eas-cli build -p android --profile preview`. This route was **not run** and has no EAS install URL. It requires Kevin’s Expo login/project linking, consistent signing credentials and a `GOOGLE_SERVICES_JSON` file environment variable containing the allowed Android client config. No EAS account is needed to use the delivered local build path. Never provide an Admin JSON file to EAS/mobile.

To rebuild LOCAL later, unset Preview variables, use `EXPO_PUBLIC_APP_ENV=LOCAL`, `EXPO_PUBLIC_DEV_HOST=10.0.2.2`, regenerate the local Android project with Expo prebuild and run the existing dev-build workflow. Local emulator ports and tests are unchanged. Preview install acceptance must not be confused with the older Metro development APK.

## Deployment identity and repeatable checks

Blaze is confirmed by the owner; no Billing API permission is required by `preview:check`. Firebase CLI is authenticated as a Google user. Deployment commands must run without inherited `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_TOKEN`; the script refuses either override. Clear them only in that process/session, never delete the credential or change machine-wide environment settings. No runtime account was granted Owner, Editor or Billing roles. [Firebase Functions setup](https://firebase.google.com/docs/functions/get-started).

Run with Node 22, Firebase CLI user login, no runtime ADC/token override and no CI/emulator environment:

```powershell
npm run preview:check -- --project team517-dev
npm run preview:deploy -- --project team517-dev
```

Deployment refuses any other project, unready API/database/Auth prerequisites, CI/emulator configuration or runtime credential overrides. It targets only Firestore rules/indexes and existing `api` / `deliverNotification` Functions. The tool creates an ignored `functions/.env.team517-dev`: FCM enabled for team517-dev, AI disabled, no local credential path. Preflight reads only. The November 12 initial setup separately enabled the recorded required APIs under explicit authorization, created the colocated database and deployed rules/indexes before Auth was initialized; no future resources were deployed. Deployed Functions use attached runtime ADC, not the local JSON. All 20 indexes are now READY. Canonical Function URL is verified above.

## Login, demo preparation and safe restoration

**Four synthetic cloud accounts are created.** Preparation may be rerun idempotently after deployment, in a separate backend-only shell with the external credential supplied via GOOGLE_APPLICATION_CREDENTIALS:

```powershell
npm run preview:prepare -- --project team517-dev
```

This is a backend/admin/local script, allowlisted to the exact non-production project, refusing CI/emulators/conflicting projects. It uses stable synthetic UIDs, refuses takeover of an unexpected email/UID, creates missing baseline documents, preserves existing lifecycle state and does not automatically reactivate altered relationships or verification. It supplies:

- manager@team517.test: CARE_MANAGER + HELPER, synthetic VERIFIED.
- alex@team517.test and marcus@team517.test: HELPER, synthetic VERIFIED.
- circle@team517.test: UNVERIFIED trusted member of Mom’s care.
- Mom’s care, a clearly synthetic meeting location, a planning Resource/Post and a retry-safe circle welcome Message.
- **No clinic Task by default**, so native manual creation has no seeded duplicate.

Passwords are newly generated Preview-only values, not the public LOCAL demo password. They are saved only in ignored **`.tools/preview-credentials.json`**; Kevin retrieves them locally and shares only with intended testers. Before class, save the needed synthetic logins privately on the phone (for example in its password manager), so account switching does not require the laptop/receipt file during the demo. They are not printed, committed or bundled. Losing that receipt requires deliberate account recovery; preparation never silently resets an existing account password. Admin credentials are a separate file and never included in this receipt/app.

After the manager publishes one uniquely titled clinic Task and Alex offers:

```powershell
npm run preview:prepare -- --project team517-dev --task-title "Clinic companion for Mom"
```

That option requires exactly one already-published offerable Task. It uses the normal API clients to fill missing Alex/Marcus Offers, never direct Offer writes or a parallel marketplace. It does not create a Task when the title is missing/ambiguous and does not overwrite Offer progress.

Preparation preserves identities, existing Offers and the welcome Message across ordinary repeats; Community post detection is a bounded-feed, best-effort check. Actual cloud retries succeeded after index readiness and fixture-ID correction. This is not an exactly-once concurrent seeding guarantee. Inspect partial failures rather than treating preparation as a reset.

**There is intentionally no `preview:reset` / remote delete-everything tool.** Rerun preparation to add missing known baseline records. Use normal app lifecycle actions for known synthetic Tasks where allowed, or create a new uniquely titled demo Task for the next session. Existing completed/in-progress history is not rewound. Changed/archived known baseline records require deliberate admin review. Never run LOCAL `demo:reset` against cloud; it remains loopback-only. Ordinary app users have no admin preparation/reset endpoint.

## Cloud smoke and native acceptance

After deployment/preparation, separately from LOCAL tests:

```powershell
npm run preview:smoke -- --project team517-dev
```

This command passed against cloud on November 12. It uses real synthetic Preview Auth and existing API clients for health/me, a labelled private Draft read/update, published synthetic offer probe, privacy-safe Discovery, Offer/owner list, Community, Messaging, Notifications and a **disabled synthetic device-registration contract**. Deployed rules denied anonymous/authenticated direct business reads/writes. It retains labelled fixtures and never creates the main clinic Task or runs wildcard cleanup. If a probe has progressed beyond its expected states, it refuses to rewind it. Disabled registration does not prove FCM; actual native FCM evidence is recorded separately above. Do not run LOCAL integration/HTTP suites against cloud.

| Acceptance | Actual result |
| --- | --- |
| Install standalone APK on Pixel_9_Pro / emulator-5554, Android 16 / API 36 | Passed |
| Cold launch with Metro 8081/8099 and Firebase 9199/8280/5001/4300 stopped | Passed: bundled login screen rendered |
| Packaged JS/config and internal identity | Passed: index.android.bundle embedded; PREVIEW/team517-dev; same package, Preview label |
| Floating Tools/dev UI hidden | Passed on release-variant native render |
| Real Preview Auth login / Task read / Community / Messaging | November 12: passed on API 36; native Message send persisted to cloud. Full lifecycle/physical acceptance remains separate |
| Native Preview FCM token registration, background push and Task/Assignment/Conversation taps | November 12: passed on API 36 against deployed backend; generic OS alerts and correct routes observed |
| Confirmation / exact-location / Start / completion request | Passed natively on separately labelled probe; manager approval via peer API; arrival cleared on completed-state refresh |
| Auth persistence after process stop / cold relaunch | Passed with no credential re-entry; cloud Task data restored |
| Physical Android install, keyboard/scroll/safe areas, background/cold resume | **Not performed**; no physical device attached |
| USB disconnected / adb stopped / laptop closed while using cloud data | **Not tested**; cannot claim phone-only demo readiness |

A prior native sign-in attempt showed the safe generic sign-in failure. A separate host-side attempt to probe Auth with the old LOCAL demo password was rejected by automatic approval review for credential egress and cancelled; it is not an Auth-success result. The permitted password-free readiness probe returned cloud health 404. No further old-password cloud probes were performed.

Next, install on Kevin’s phone and test login, Task list/post, Discovery/Offer/selection/confirmation/arrival, start/completion/review, Calendar, Community, Messaging, Notifications, permission/token ownership and background/cold push taps. Stop local services and disconnect USB. The API 36 cloud/FCM evidence above advances acceptance but is not physical-phone acceptance or a complete phone-only class rehearsal.

## Before class / team meeting

**Cloud prerequisites are deployed; physical phone-only acceptance remains pending.** Before an accepted demo:

1. Run guarded Preview preparation if fixtures need adding; never wipe the cloud database.
2. Confirm HTTPS health 200 and a real synthetic account can load its Tasks.
3. Install/update the Preview APK only if changed.
4. Open it on normal Wi-Fi/mobile Internet and log in with the Preview receipt.
5. In Me, Allow/refresh device notifications, grant the Android prompt if shown, and check registration plus one real push with Alex remaining signed in.
6. Use [demo-script.md](demo-script.md), following the Preview account/preparation substitution below.

**Phone-only live demo:** manager creates/publishes → switch to Alex and offer → switch to Marcus and add the second Offer → switch to manager and compare/select → switch to Alex and confirm/unlock/start/request completion → switch to manager and approve/review. Tour Calendar, Community, Messaging and Notifications as manager. This path requires no admin script or laptop during class. Rehearse with the privately saved phone credentials; 5–7 minutes remains a target, not a measured physical-device result.

The title-targeted admin helper is an optional **pre-meeting** preparation path for an already-published Task. If using it, demonstrate that prepared Task honestly; do not claim a newly created live Task already has its Offers. Do not make running a laptop command mid-demo a prerequisite for the phone-only path.

Switching accounts disables the previous device’s push ownership; use persistent in-app history for the single-phone segment. Live OS push needs Alex to stay signed in while another authenticated client/harness performs the manager action. That is a separate multi-user acceptance/demo segment, not a three-device live demo or an excuse to add a fake self-push action.

## Known limitations / deferred work

AI is unavailable in cloud Preview with manual Task creation fallback; the emulator-only mock guard is unchanged. Verification is server-seeded synthetic state, not a real identity check. The reopened already-reviewed Assignment form remains a LOW API gap; duplicate submission is still prevented. Points represent intended platform value/internal currency, with potential future conversion/cash-out direction; no ledger, cash-out or payment settlement exists. Legal/compliance/accounting/exchange-rate work remains future.

No Maps/GPS, Nearby Helper, wallet, Payments/payouts, fee accounting, No-show, Early Termination, Dispute arbitration, Instant Match, real AI/identity, voice, realtime transport or attachments were added. Maps remains Sprint 7C. iOS/TestFlight is deferred: Kevin has no Mac/iPhone and Apple Developer payment is blocked; Yiru/Kingsley’s iPhones were not tested. Hosted CI was not observed and does not block the local APK build.

References: [Expo standalone local release workflow](https://docs.expo.dev/guides/local-app-production/), [APK/internal distribution](https://docs.expo.dev/build-reference/apk/), [local validation](validation.md), [product policy](product-policy.md).
