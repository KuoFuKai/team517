
## Sprint 8A — Points (November 14)

[Wallet/ledger, lifecycle policy, cloud and validation report](points.md) now records real available/reserved balance and private paginated activity, POINTS publication reservation, completed-helper reward transfer and whole-task cancellation release. Disputed/reopened tasks keep reservations under the documented policy. This supersedes older metadata-only/future-Points statements below. No money, purchase, cash-out or fee; no wallet data in Discovery/Maps and no mobile business Firestore access. Phone acceptance is queued per Kevin; emulator observations are recorded separately.

# Sprint 7B.1 Preview cloud/native follow-up — November 12, 2026

Sprint7B.2: [physical Android / responsive acceptance / collaboration](sprint-7b2.md) and [visible progress](visible-progress.md). Actual vivo V2324A Android14/API34 ≈360dp/font1.12 rendered the documented core/support paths; 320/360/390/412dp emulator Tasks/Post at1.0/1.3 and360dp at0.85 also rendered. Physical docked keyboard, synthetic draft/comment/message send and background Conversation/Task FCM taps passed within scope. Final APK SHA256 `2af447b575958703cf7b742e2bf23b288b1367dc4c06db695e41504a96223ae1`; Node22 full suite22 unit/78 client/92 integration plus smoke/default+mock HTTP/Hermes passed. Kevin reported the complete USB-disconnected normal-network short flow succeeded (user-observed, separately from adb evidence). Sprint7B.2 can close within the documented scope. Kingsley branding/history preserved on the Sprint branch; final integration/CI state is recorded in the Sprint report/completion. Earlier checkpoints below are historical.

User-requested clean presentation follow-up: removed visible Design preview / service-not-connected labels and technical placeholder captions; use natural empty states and ordinary button labels. Unimplemented writes remain disabled, balances stay unknown, saved-draft review does not claim generated AI output, and no backend/provider behavior changed. New APK SHA256 `ee14824b172578c1714735d4bdc9b7a7fae5bc1ed7776508b73471afe65468a1`. Typecheck /65 client tests and Android release/Hermes build passed; profile/points rendered on API36. [Evidence](native-evidence/2026-11-12-clean-presentation/README.md). Previous labeled-preview screenshots and artifact hashes below are historical.

Latest PDF fidelity pass: [report](design-fidelity.md). Final source passed Node22 typecheck, 22 backend unit, 65 client, 92 emulator integration, smoke, default HTTP, AI-mock HTTP including Community/Messaging, and Hermes export. Zero-match frontend business Firestore boundary scan; secret preflight clean. npm audit remains 28 (1 low /20 moderate /7 high /0 critical). Final APK installed on API36; native evidence and limits are separate from automation.

November 12 whole-app UI overhaul: [implementation, native evidence and remaining visual differences](design-overhaul.md). Shared typography, focused headers, forms/native scheduling, Offers, Discovery, account/roles, Community and Messaging were reworked; exact Figma parity and docked software-keyboard acceptance are not claimed. Earlier batch/test notes below remain historical.

Calendar UI batch 2: full Node 22 suite passed with **22 backend unit / 55 client / 92 integration**, typecheck, first-run smoke, default/AI-mock HTTP and Hermes. Final clipping refinement passed focused checks/export/native recheck. Month/day navigation, Task opening/return, empty month and date-mode restoration are scoped in the [report](design-alignment-batch2.md); native invalid-date submission and physical-phone acceptance are not claimed. No backend changes. Batch 1 hosted CI was successful; batch 2 CI is separate.

Latest UI batch: [design alignment batch 1](design-alignment-batch1.md) passed final typecheck, **49 client / 22 backend unit / 92 integration**, default/AI-mock HTTP, isolated smoke retry, final Hermes export and zero-match frontend boundary scan. Actual rebuilt API 36 evidence covers role navigation, compact status list, draft save/Post restoration, locations/Calendar/Inbox entry and real FCM Conversation tap. The initial smoke discovery 404 remains in its aggregate log; retry passed health 200/protected 401. APK hash is updated in the batch report. Root advisories remain 28; no new backend/domain feature or physical acceptance.

Firebase CLI user `kevin08062006@gmail.com` authenticated through explicit user OAuth and project visibility. Deployment subprocesses exclude runtime ADC/FIREBASE_TOKEN. Blaze is owner-confirmed, not gated on Billing API reads. Native Firestore `(default)` us-central1, deny-all client rules, 20 READY composite indexes and existing Node 22 Functions `api` / `deliverNotification` deployed. User initialized Email/password Auth. No manual runtime IAM or backend/API/domain behavior change; Firebase deployment provisioned required service identities. First-use Eventarc propagation failed once and then succeeded on narrow retry. Generated build images have a 30-day cleanup policy.

Cloud deployment exposed a missing reviews aggregate index (`revieweeId ASC`, `rating ASC`), added to checked-in configuration with regression coverage. Preview-only fixture IDs were corrected to the existing 20-character API contract; exactly four incomplete, unreferenced synthetic baseline documents migrated transactionally with timestamps preserved. No business lifecycle record was wiped or rewound. Four Preview-only synthetic Auth users plus context/location/Resource/Post/welcome Message were prepared. No main clinic Task created.

| November 12 Node 22.23.4 / Java 21 LOCAL check | Result |
| --- | --- |
| Typecheck/build | Passed |
| Backend unit | 22 passed |
| Mobile/client | 43 passed, including deployment identity guards, fixture ID compatibility and aggregate-index regression |
| Auth/Firestore integration | 92 passed |
| Functions smoke | Passed |
| Default HTTP / AI mock HTTP | Both passed, including Community/Messaging/Notification/Push regressions |
| Android Hermes export | Passed |
| Preview admin-tool TypeScript check | Passed |
| Frontend business Firestore boundary scan | Zero matches |
| Fresh dependency audit | 28: 7 high, 20 moderate, 1 low, 0 critical; no dependency changes |

Credential-free LOCAL suite logs: `.tools/sprint7b1-{typecheck,unit,client,integration,smoke}.log`, final client `.tools/sprint7b1-client-nov12.log`, continuation `.tools/sprint7b1-{http,http-mock,export}-retry.log`. PowerShell stopped the initial HTTP wrapper on a native stderr metadata warning; explicit retries used actual exit codes and all passed. No cloud credentials were inputs to LOCAL tests. Hosted CI not observed.

**Separate cloud smoke passed:** HTTPS health, real synthetic Auth, me/context, Draft create/read/update, anonymous/signed-in direct Firestore GET/PATCH denied, Discovery excludes Draft/private location, published labelled probe/Offer/owner Offer list, Community, Messaging send/read, Notifications and disabled-device registration. Index-building and a smoke assertion using the wrong DTO field were corrected/retried; final smoke and script typecheck passed. Labelled draft/offer probe/message remain deliberately; no main clinic Task or destructive emulator suite ran against cloud.

**Actual standalone native:** emulator-5554 adb device, Android 16/API 36 x86_64, existing APK installed successfully; canonical endpoint matches packaged Preview base. Metro/local Firebase ports stopped and adb reverse empty. Real manager/Alex login, role preference switch, Task/Offer review, Helper Discovery, Community, Inbox/Conversation, native Message send, device registration, generic background OS FCM and Task/Assignment/Conversation taps passed. Alex confirmed, unlocked synthetic arrival details, started and requested completion natively. A peer API harness created/selected the separately labelled Assignment probe and approved completion; these peer operations are not native taps. Refresh after completion cleared loaded private arrival information. Force-stop produced absent PID; cold relaunch restored Auth and cloud Task data; Calendar rendered. See [evidence](native-evidence/2026-11-12-preview-cloud/README.md).

No new observed product BLOCKER/HIGH. Fixed tooling/configuration issues: invalid fixture IDs and missing rating index. Known LOW reopened Review-entry issue remains. Native message input/scroll-dismiss/send worked; this is not exhaustive keyboard/error-state coverage for every screen. Process-absent FCM is unverified because `am kill` left the process alive. No physical phone, disconnected USB, adb-stopped/laptop-closed use, full all-native class rehearsal or iOS acceptance. Sprint 7B.1 remains open for these limits. Maps not started.

# Historical Sprint 7B.1 standalone Preview validation — November 11, 2026

November 12 follow-up: Kevin confirmed Blaze is enabled. Node 22.23.4 read-only `preview:check -- --project team517-dev` was rerun with external backend ADC; Billing remained HTTP 403 and all required Service Usage reads returned `403 AUTH_PERMISSION_DENIED`. Firestore/Auth readiness remains unverified. No cloud mutation/deployment/seed occurred, and no new cloud or native acceptance pass is claimed. This supersedes the earlier unknown billing statement as a user-confirmed status, while API-level billing verification remains unavailable.

## LOCAL automated regression (credential-free)

Node 22.23.4 / Java 21, explicit LOCAL configuration, CI enabled, ADC/FCM environment removed from test children. Existing emulator ports remain unchanged.

| Check | Final result |
| --- | --- |
| Shared/backend/mobile typecheck | Passed (`.tools/sprint7b1-typecheck-final.log`) |
| Backend unit | 22 passed |
| Mobile/client | 40 passed, including environment isolation, build public-config/privacy checks and fail-closed cloud-tool guards |
| Auth/Firestore integration | 92 passed, including new direct business Firestore read/write denial for anonymous and signed-in clients |
| Functions smoke | Passed health 200 / protected 401 after retrying a transient Functions discovery `fetch failed` startup |
| Default / explicit AI mock HTTP | Both passed; existing manual/AI Task, lifecycle/privacy, Community, Messaging, Notification and device API regressions retained |
| Android Hermes LOCAL export | Passed; cloud resources/credentials not used |
| Backend/admin Preview scripts | Separate TypeScript check passed; actual CI cloud-seed invocation refused before cloud access |
| Dependency audit | Unchanged: 28 advisories, 1 low / 20 moderate / 7 high / 0 critical; no major upgrades or forced fixes |

Logs use `.tools/sprint7b1-*`; initial aggregate logs include intermediate failures (test environment typing corrected, transient smoke startup retried). The `*-final.log` results above supersede those attempts. Hosted CI was not observed.

## PREVIEW artifact / cloud / native results

Expo prebuild + Gradle `assembleRelease` produced `artifacts/android/team517-preview.apk`, SHA256 `6302f9e90d88b8347c3048a2f113583734c72bff99a146f4c01104b637738167`, 39,935,932 bytes, arm64-v8a/x86_64. The first Gradle build succeeded but its PowerShell checksum-print step failed; that step was made portable and the complete build command then passed. APK package metadata is team517 Preview / edu.cornelltech.team517 / SDK target 36; embedded config is PREVIEW / team517-dev and a bundled JS asset is present.

Installed on emulator-5554 / Pixel_9_Pro / Android 16 API 36. With Metro and all local Firebase ports stopped, cold launch rendered the bundled login screen and no floating Tools control. This proves standalone launch, **not** working cloud authentication/data or phone-only demo readiness. Physical device installation was not performed. Real Preview token registration, push delivery and notification routing remain pending and are not inferred from Sprint 7A local FCM results.

Read-only team517-dev audit: project ACTIVE; Cloud Billing/Firestore/Functions reads reported SERVICE_DISABLED, Service Usage checks lacked permission, Auth configuration returned 404, intended cloud API health returned 404. Billing linkage remains unknown. No cloud resources/accounts/fixtures were mutated or deployed. A separate host probe with the old LOCAL demo password was rejected by automatic review and cancelled; password-free health probing was used instead. No cloud smoke pass is claimed.

See [android-preview.md](android-preview.md) for owner prerequisites, separate guarded cloud smoke and complete acceptance limits. Historical validation remains below.

# Sprint 7B validation — November 10, 2026

Closure audit — November 11: required documents, current mobile source, saved green results and existing demo/evidence artifacts were checked without repeating acceptance work. Documentation was clarified for Yiru/Kingsley; no product/backend/API change was made. All local links in the checked handoff documents resolved, and all 17 curated PNG files had valid PNG signatures. Existing reset/repeat/title-targeted verification was reused; no new reset, full test run, native pass or Figma access result is claimed. See [sprint7b-closure.md](sprint7b-closure.md) for exact visual changes and explicit LOW statuses.

Final run used **Node 22.23.4 / Java 21.0.13**, fresh demo emulators, no ADC/FCM variables in automated-test children, CI enabled and real push disabled. Local ignored logs are `.tools/sprint7b-{typecheck,unit,client,integration,smoke,http,http-mock,export}.log`, with exit codes in `.tools/sprint7b-results.json`.

| Check | Final result |
| --- | --- |
| Shared/backend/mobile typecheck | Passed |
| Backend unit | 22 / 22 passed |
| Mobile/client | 36 / 36 passed, including new local-zone/day-boundary and count/next-action checks |
| Auth/Firestore integration | 91 / 91 passed, including concurrent selection / Offer retries and existing support/Community/Messaging/push regressions |
| Functions smoke | Passed; health 200 / unauthenticated protected 401 |
| Default HTTP | Passed manual Task regression, disabled-AI fallback, lifecycle/privacy, Community, Messaging, Notifications/device APIs |
| AI mock HTTP | Passed reviewed mock suggestions → ordinary draft/publish/lifecycle and existing regressions |
| Android Hermes export | Passed, 713 modules / 2.3 MB `.hbc`; centralized Android host 10.0.2.2 |
| Frontend boundary | Zero matches for Firestore/Admin/listener/collection access in mobile source, App and plugins |
| Dependency audit | 28 advisories: 1 low / 20 moderate / 7 high / 0 critical; no dependency versions changed |

An initial sandbox backend-unit attempt denied three localhost socket connections (EACCES); the final authorized-localhost run passed. Intermediate typecheck errors for optional DTO fields were corrected before the final full run. No product backend/API change was needed. Hosted CI, physical Android, iOS and release builds were not observed.

Local demo tooling was also exercised: `demo:reset` passed, then repeated `demo:prepare` passed. Read-only checks found exactly one prepared clinic Task, two ACTIVE Offers, zero Assignments, one Resource, one Community Post and one welcome Message. Repeated preparation introduced no duplicate fixture records. An authenticated external-helper discovery response excluded the synthetic private address/instructions and returned coordinates distinct from the stored exact point. Reset deliberately invalidates prior local login sessions; native reauthentication succeeded.

November 11 handoff: clean reset and the optional title-targeted preparation were exercised again with the same counts/privacy checks passing. This option lets a presenter seed the backup Offer onto the newly created manual Task instead of accidentally comparing Offers from the separate fallback Task. The complete product regression above remains the final tested UI/API source; this follow-up changed only local demo targeting/documentation.

Native test results and screenshots are recorded separately in [native-acceptance.md](native-acceptance.md). This sprint actually rendered the core flow, mock AI selective Apply, Community comment/send interactions, Messaging and real generic Android Assignment/Conversation notification routes. It does not relabel older cold-delivery evidence as a new 7B test. The external credential remained backend-only during optional native FCM acceptance; none was copied into test/mobile/source artifacts. The private emulator checkpoint is ignored, not team evidence.

Historical validation below is preserved.

# Sprint 7A real FCM validation — November 10, 2026

Real Android push was observed on the local SDK 55 development APK, Pixel_9_Pro / Android 16 / API 36. Provider project team517-dev was isolated from demo-team517 business emulators. The external ADC credential was used through the backend environment only. Native tests passed permission denial/grant, registration, foreground suppression/unread refresh, background and process-absent delivery, warm/cold authorized routes, terminated-relationship read-only history, disable/enable, logout and token ownership transfer. See the [actual matrix and screenshots](native-acceptance.md).

| Final Node 22.23.4 check | Result |
| --- | --- |
| Shared/backend/mobile typecheck | Passed |
| Backend unit | 22 passed |
| Mobile/client | 34 passed, including transient native directory exclusions and idempotent native intent generation |
| Auth/Firestore integration | 91 passed |
| Functions smoke | Passed health 200 / protected 401 and notification-trigger startup |
| Default full HTTP | Passed manual Tasks, disabled-AI fallback, lifecycle/privacy, Community, Messaging, Notifications and device-token APIs |
| AI mock full HTTP | Passed reviewed mock suggestions through ordinary Task/lifecycle APIs plus existing regressions |
| Android Hermes export | Passed 712 modules / 2.3 MB, centralized Android host 10.0.2.2 |

The final complete suite passed after native fixes. Sprint 7A closes for the documented Android API 36 development-build scope. Native OS testing remains separate from credential-free CI. Hosted CI was not observed. Final frontend source/plugin scan found no business Firestore/Admin/listener access. Final npm audit remains 28 advisories (1 low, 20 moderate, 7 high, 0 critical); no forced upgrades were performed. Temporary diagnostic logging was absent from final TypeScript and generated MainActivity.

Final local debug APK is 61,322,942 bytes, SHA-256 D30E959F5C61A4E71C2F5B7BD003CCABE25FFBC95D0737A326915F3297625487. It remains in ignored apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk and was installed on the tested AVD. Private synthetic emulator fixtures were preserved under ignored .tools/native7a-fixtures for local continuation. Neither fixture exports nor runtime credentials are CI inputs.

Final regression removes ADC/PUSH/FCM variables and sets CI=true, preserving credential-free tests and prohibiting real delivery. Native provider audit recorded 24 persistent Notifications, 19 accepted one-device sends and zero provider failures; inactive-recipient cases generated history with zero sends. Actual OS observations are separately listed in the native matrix. Source Task/Offer/Assignment/Messaging services, repositories and domain behavior were unchanged in this native follow-up.

Build verification used full JDK 21.0.13, Gradle 9.0.0, scoped Foojay resolver 1.0.0, NDK 27.1.12297006, platform/build-tools 36 and CMake 3.22.1. APK assembly passed after preserving/reinstalling the NDK interrupted by reboot. Generated Kotlin captures both cold onCreate and restored onNewIntent notification paths. Temporary boolean/key-name diagnostic logs were removed before final APK and bundle verification. Android client configuration was loaded from the ignored local google-services.json; service-account contents never entered client config. Dependency advisories and explicit remaining delivery limitations are retained below.

# Historical Sprint 7A validation — November 9, 2026

Push delivery is implemented as a separate post-commit Firestore-create function over existing Notifications. The current default/CI provider is disabled; unit/integration tests inject deterministic fake providers and never contact FCM. No real Firebase credentials were supplied, no development APK was built and no OS push was observed. **Sprint 7A native push acceptance remains pending.** The prior Sprint 6C acceptance below is unchanged and does not establish push compatibility.

| Node 22.23.4 / Java 21.0.13 check | Result |
| --- | --- |
| Contracts / backend / mobile typecheck | Passed |
| Backend unit tests | 22 passed |
| Frontend/client tests | 31 passed, including boundary audit |
| Auth/Firestore integration | 91 passed, 0 failed |
| Functions smoke | Passed; API and deliverNotification trigger loaded |
| Default full HTTP | Passed (manual Task, AI unavailable, lifecycle, Community, Messaging, Notification and token endpoints) |
| Explicit AI-mock full HTTP | Passed (reviewed mock suggestions plus ordinary Task and existing regression flows) |
| Android Hermes export | Passed; 712 modules / 2.3 MB, Android host 10.0.2.2; not a native APK or push acceptance |
| Expo prebuild config | Plugins resolve for SDK 55; no credential file/native build supplied |
| Frontend boundary scan | No Firestore/Admin/onSnapshot/business collection access in mobile sources/App |
| npm audit | 28: 1 low, 20 moderate, 7 high, 0 critical; no forced upgrade |

Full commands remain npm run typecheck, npm test, npm run test:mobile, npm run test:integration, npm run test:smoke, npm run test:e2e, explicit AI_PROVIDER=mock/EXPECT_AI_MODE=MOCK test:e2e, and npm run mobile:export. Final runs set CI=true to independently prohibit real FCM. Ignored .tools/sprint7a-*.log captures command results. An initial unprivileged unit attempt hit local socket EACCES; it was rerun with local loopback access and passed. Hosted GitHub CI was not observed.

New coverage includes real authenticated own-token API requests, unauthenticated/arbitrary-owner rejection, private token/status DTOs, concurrent same-token registration, multiple devices, A→B→A transfer with stale logout fencing, one transactional claim under concurrent delivery, disabled/other-owner filtering, invalid-token cleanup racing transfer, FCM error mapping, and CI fail-closed configuration. Actual Offer/selection and Message commits survive a failed provider; duplicate Offer/selection/Message retries do not create additional logical pushes. Payload tests prove private persisted title/body, Message/location/instructions/profile content are not copied. Tap resolver tests require owned Notification followed by current Task/Assignment/Conversation authorization; denial stops routing.

Additional edge coverage proves opted-out account transfer is atomic and stays disabled, old logout cannot affect it, and a permanently invalid token cannot reactivate via refresh. A different fresh token remains registerable. Local build preparation also verified full javac 21.0.13 from an official checksum-verified archive under ignored .tools/jdk21; this does not constitute a native Gradle/APK build. Existing emulator validations kept their original JRE 21 PATH.

Code inspection against the installed Expo SDK found a HIGH-risk refresh-loop path before native FCM testing: calling getDevicePushTokenAsync from a token listener can emit that listener again. Fixed by consuming the event-supplied token. A fake native-port test covers refresh without getter re-entry, permission denial without acquisition and no automatic permission prompt. This is code/automated verification, not an observed OS-push pass.

Actual API 36 Expo Go rendering checked Me notification explanation, unavailable permission state, disabled unsupported actions, scrolling/safe areas/bottom navigation, persistent history → Conversation → hardware Back, sign-out and authenticated restore after reopening the Expo experience. No new product BLOCKER/HIGH was observed in this limited rendered scope. The Expo host occasionally surfaced Google Lens on the first cold URL launch; reissuing the explicit Expo URL restored team517. This environment/host anomaly is MEDIUM and not a validated native push launch path. See [native push matrix and screenshots](native-acceptance.md) and [FCM build prerequisites/failure limits](push-delivery.md).

# Sprint 6C rendered native validation — November 9, 2026

The app was rendered and exercised in Expo Go 55.0.7 on **Pixel_9_Pro / emulator-5554**, Android 16 / API 36, x86_64, adb state device and completed boot. This supersedes the infrastructure-only pending reports below. See the [screen-by-screen native matrix, issue severity, scoped passes and screenshots](native-acceptance.md).

Sprint 6C can close for this Android development target: no observed BLOCKER/HIGH product defect remains, reasonable MEDIUM fixes were natively retested, and final automated regressions passed. Subsequent native new-circle creation, incomplete AI preview and Discard/manual-title preservation also passed; these supplemental fixture actions changed no code and did not require repeating the already green suite. Push/Maps remain a separate future sprint, not work implemented here.

Native main flow passed across manager and Alex accounts: Auth → role switch/relaunch → existing Circle/location → manual draft/save/reopen/edit/publish → selective mock AI urgency → verified discovery → Offer → multiple-Offer review → select → confirm → exact arrival unlock → Start → completion request → requester approval → Review. Calendar, Notifications/read/routes, Timeline, all four fixture verification states, Community creation/comments/Like/save/Share/NEED Offer, Task/Circle Messaging, older history/manual refresh and terminal read-only history were actually exercised. Alternative fixtures were prepared via normal authenticated APIs, then decline, confirmed cancellation, pending requester cancellation, whole-Task cancellation and dispute were performed natively. Fixture creation itself is not a native pass.

Native privacy checks passed: no exact address/private code during discovery or pending selection; confirmed-only arrival unlock; displayed data cleared on Start/cancel, background/reopen, completed history and native Refresh after requester revocation. No realtime remote-revocation claim. Unverified external discovery was denied, while trusted Circle messaging remained usable. Verification Admin writes were confined to explicitly seeded demo users and restored; no client verification mutation was added.

Fixed frontend issues: HIGH keyboard obstruction and missing nested hardware Back; MEDIUM gesture-area clipping, off-screen comment error and unbounded conversation history. Changes are limited to App.tsx, MyWorkScreen, MessagingScreen, DiscoveryWorkspace, SupportScreen, CommunityScreen, mobile package/lockfile and documentation/evidence. Added only Expo-bundled react-native-safe-area-context ~5.6.2. No backend/API/domain/authorization/repository/rule changes or new product features.

| Final Node 22 check | Actual result |
| --- | --- |
| Typecheck | Passed shared contracts, Functions and mobile |
| Backend unit tests | 17 passed |
| Mobile/client tests | 25 passed |
| Emulator integration | 84 passed / 0 failed, including lifecycle races, privacy, Community and Messaging |
| Functions smoke | Passed health 200 / protected 401 |
| Default HTTP flow | Passed manual Tasks, AI unavailable, lifecycle/privacy/support/Community/Messaging |
| Explicit AI-mock HTTP flow | Passed reviewed suggestion/ordinary Task flow plus full existing regressions |
| Android Hermes export | Passed 641 modules / 2.2 MB, configured Android host 10.0.2.2 |
| Frontend Firestore boundary scan | No business Firestore/Admin/listener matches in mobile source/App |
| Native rapid Send companion read | Exactly one matching server Message after rapid native Send taps |
| Advisory audit | 28 unchanged: 1 low, 20 moderate, 7 high, 0 critical; no forced upgrades |

Auth 9199 / Firestore 8280 / Functions 5001 / UI 4300 remain unchanged. Windows currently excludes 7998–8097 including Metro 8081; user approved **8099 for this acceptance session**. No OS exclusions/services/security settings changed. Native guest Auth/API connectivity through 10.0.2.2 was demonstrated by actual sign-in and mutations; it is no longer merely URL derivation. Node 22.23.4 / Java 21.0.13 were used.

Final logs: ignored `.tools/native36-final-{typecheck,unit,client,integration,smoke,http,http-mock,export}.log` and `native36-final-audit.json`. Automated Firebase suites ran serially with fresh ephemeral data and exited 0. Native data was separately exported to ignored `.tools/native36-fixtures`; it was not imported into automated regression suites. No hosted CI run was observed. Figma parity remains unverified. No physical-phone, iOS, standalone APK, production map/GPS or push acceptance is claimed. Native software-keyboard fixture settings were restored after testing.

LOW follow-ups: singular review/star grammar, explicit UTC Calendar versus local detail labels, and review form reappearing after reopening an already reviewed Assignment (server duplicate protection preserved). These do not change the successful core native flow. Scope limits and unexercised variants are listed explicitly in the native matrix.

# Historical Sprint 6C local Auth port migration — November 9, 2026

Local infrastructure only: Auth Emulator moves from historical 9099 to **9199**. Firestore 8280, Functions 5001, UI 4300 and Metro 8081 are preserved. No Windows exclusions, network/security settings or virtualization services were modified. No product/domain/API behavior or backend service/repository logic changed.

Active files changed: `firebase.json`, `apps/mobile/src/config.ts`, `apps/mobile/.env.example`, `functions/test/seed-marketplace.ts`, `package.json`, `README.md`, `docs/native-acceptance.md`, and this document. The root emulators command explicitly starts only Auth/Firestore/Functions and configured UI, avoiding unused Storage's default 9199 collision. Integration harnesses already use Firebase's injected FIREBASE_AUTH_EMULATOR_HOST; HTTP harnesses import centralized mobile config, so no duplicate harness port constants were added.

Actual startup: Auth listened at 0.0.0.0:9199, Firestore at 0.0.0.0:8280, Functions at 0.0.0.0:5001 and UI at 4300. Auth/Firestore/UI HTTP probes returned 200. An initial Functions discovery fetch failure caused a 404; after restarting in the ordinary smoke wrapper, Functions loaded and health 200/protected-route 401 passed. This transient startup failure required no code workaround.

Centralized config runtime assertions passed with EXPO_PUBLIC_DEV_HOST=10.0.2.2: Auth `http://10.0.2.2:9199`, API `http://10.0.2.2:5001/demo-team517/us-central1/api/api/v1`. Explicit URL overrides still take precedence; clear stale local overrides when changing host. This verifies URL derivation, not guest networking or native compatibility.

Historical 9099 references below and in the dated native-acceptance findings intentionally retain prior results and Windows reservation evidence. README's migration note names the old port for context; no active checked-in code/environment/config remains on 9099.

Fresh Node 22.23.4 / Java 21.0.13 validation:

| Check | Actual result |
| --- | --- |
| Typecheck | Passed contracts/backend/mobile |
| Backend unit tests | 17 passed |
| Mobile/client tests | 25 passed |
| Emulator integration | 84 passed, 0 failed; Auth 9199, including concurrency, Community and Messaging |
| Functions smoke | Passed health 200 and protected route 401 |
| Default HTTP | Passed manual Tasks, AI unavailable, discovery/Offers/lifecycle/privacy, support, Community and Messaging |
| Explicit AI-mock HTTP | Passed suggestion/normal draft application and full domain/Community/Messaging flow |
| Emulator UI | HTTP 200 on 4300; full HTTP harness asserts reachable in both modes |
| Android Hermes export | Passed 632 modules / 2.2 MB |
| Frontend Firestore boundary | No business Firestore/Admin/listener matches in mobile src/App |
| Android URL derivation | Runtime assertions passed for 10.0.2.2 Auth 9199/API 5001 and all preserved Firebase ports |

Ignored evidence: `.tools/auth9199-{startup,typecheck,unit,mobile,integration,smoke,http,http-mock,export}.log`. Firebase suites ran serially and shut down. No dependencies changed and no fresh dependency advisory audit was required/performed. The most recent audit remains the November 6 report below.

**Native acceptance remains pending.** No API 37 AVD is retried and no screen is marked passed. The user will manually create and boot an Android 16/API 36 x86_64 Google APIs Pixel-class target; require `adb devices -l` state `device` before native work resumes. No Push/Maps or other feature work added. Hosted CI and Figma/native parity are not claimed.

# Sprint 6C resumed validation — November 7, 2026

**Native acceptance remains blocked.** SDK/adb/emulator are installed and two AVDs exist, superseding the prior missing-tooling finding. Neither AVD booted successfully or appeared in `adb devices -l`; no product screen rendered. See [current environment, launch attempts, severity and acceptance matrix](native-acceptance.md).

Windows reserves TCP 9003–9102, including configured Auth 9099. No process is listening on 9099; an explicit Node 22 socket bind returns EACCES. Ports 8280, 5001, 4300 and 8081 bind successfully. All Firebase ports remain unchanged. No Windows network settings, system software, AVD data or product/backend/API code were changed.

| Check | November 7 actual result |
| --- | --- |
| Node 22 typecheck | Passed contracts/backend/mobile |
| Backend unit tests | 17 passed |
| Mobile/client tests | 25 passed |
| Emulator integration | Attempted; blocked before assertions by Auth 9099 bind failure, exit 1 |
| Functions smoke | Attempted; blocked before assertions by Auth 9099 bind failure, exit 1 |
| Default HTTP flow | Attempted; blocked before assertions by Auth 9099 bind failure, exit 1 |
| Explicit AI-mock HTTP flow | Attempted with AI_PROVIDER=mock / EXPECT_AI_MODE=MOCK; same bind blocker, exit 1 |
| Community/Messaging integration regressions | Included in blocked integration/HTTP suites; no fresh pass claimed |
| Android Hermes export | Passed, 632 modules / 2.2 MB; no native runtime/render acceptance |
| Mobile boundary scan | No firebase/firestore, firebase-admin, onSnapshot, getFirestore or collection() matches in src/App; Firebase Auth remains allowed |
| Native UI/privacy/keyboard/navigation | Not run; no device. Prior HTTP privacy evidence is historical only |
| Hosted CI / Figma comparison | Not observed / not performed; no visual parity claim |

Evidence logs are ignored `.tools/sprint6c-{typecheck,unit,mobile,integration,smoke,http,http-mock,export}.log`; emulator recovery logs `.tools/android-coldboot.log` and `.tools/android-medium-coldboot.log`. No dependency changes were made; most recent completed advisory audit is November 6: 28 total (1 low, 20 moderate, 7 high, 0 critical). No fresh advisory audit was performed in this attempt.

Sprint 6C stays open. Require a booted adb target and available fixed Auth port, then rerun the full suites and all native matrix rows before proceeding to Push/Maps. No speculative UI changes or backend regression changes were justified.

# Native acceptance attempt - November 6, 2026

**Native acceptance blocked**, not completed. No Android Studio/SDK/adb/emulator/AVD was found after environment, registry and common/alternate installation checks. No Android target, keyboard, safe area, persistence, GPS, map or rendered screen was tested. See [native acceptance matrix and exact setup](native-acceptance.md). No product/backend/API or dependency versions changed; no new features or system tooling installed.

Fresh Node 22.23.4/npm 10.9.9/Java 21.0.13 results:

| Check | Actual result |
| --- | --- |
| Typecheck | Passed contracts/backend/mobile |
| Backend unit | 17 passed; first restricted run had 3 loopback EACCES failures, rerun with permitted local networking passed |
| Mobile/client | 25 passed |
| Emulator integration | 84 passed, including Community/Messaging and lifecycle/privacy races |
| Functions smoke | Passed health 200/protected 401 |
| Default HTTP flow | Passed manual Task/core/Community/Messaging and AI unavailable path |
| Explicit mock HTTP flow | Passed AI suggestions through normal Task flow plus Community/Messaging |
| Android Hermes export | Passed 632 modules, 2.2 MB; no native render |
| Frontend boundary scan | No firebase/firestore, firebase-admin, onSnapshot, collection() or getFirestore business access found in mobile source/App |
| Dependency audit | 28: 1 low, 20 moderate, 7 high, 0 critical; unchanged |
| Hosted CI / Figma parity | Neither verified; no hosted run observed or native visual comparison performed |

Ignored evidence logs: `.tools/native-typecheck.log`, `native-unit.log`, `native-client.log`, `native-integration.log`, `native-smoke.log`, `native-http.log`, `native-http-mock.log`, `native-export.log`, and `native-audit.json`. Emulator suites completed serially and shut down. HTTP privacy assertions passed; on-device display/cache-clearing verification remains pending. No inferred native product defects or speculative UI fixes. Push/Maps progression should wait for rendered core acceptance and resolution of BLOCKER/HIGH findings.

# Sprint 6B validation - November 6, 2026

Windows, Node 22.23.4/npm 10.9.9/Java 21.0.13. No new dependency, provider, production resource or native tooling. Only conversations/messages collections are added; existing notifications is extended for NEW_MESSAGE/CONVERSATION. Task/Offer/Assignment transitions and Community are unchanged.

| Check | Actual result |
| --- | --- |
| Node 22 `npm ci` | Passed with existing lockfile versions |
| Typecheck | Passed shared contracts, backend and mobile |
| Unit tests | 17 passed: prior 15 plus Messaging key isolation and strict/plain-text validation |
| Frontend/client/boundary | 25 passed: prior 23 plus Messaging authenticated paths/cursor/body and logical-send ID reuse |
| Emulator integration | 84 passed: all prior 74 plus 10 Messaging authorization/history/idempotency/read/race cases |
| Functions smoke | Passed real v2 health/auth rejection |
| Default HTTP flow | Passed full manual/core/Community/support flow and Task Messaging with retries, Inbox/read state and terminal read-only history |
| Explicit AI-mock HTTP flow | Passed AI suggestion/PATCH/publication and same normal domain/Community/Messaging flow |
| Android Hermes export | Passed 632 modules / 2.2 MB bytecode; not native APK/rendered acceptance |
| Config/boundary | CI YAML/Firebase config/indexes parse; no frontend business Firestore/Admin imports or listeners |
| Advisory report | Unchanged 28 entries: 1 low, 20 moderate, 7 high, 0 critical |

Demo emulators: Auth 9099, Firestore 8280, Functions 5001, UI 4300. Suites ran serially after a clean install and shut down. Both HTTP modes exited 0. CI scripts automatically include new tests and existing default/mock HTTP flows, with no credentials/provider required. No hosted CI run was dispatched or observed. Logs are ignored .tools/*-sprint6b-final.log.

## Messaging evidence

- Concurrent CARE_CONTEXT get-or-create with reversed participant order returns exactly one deterministic ID. Both active memberships are required; unrelated users/self/group/permission-field requests are denied. Protected member roster exposes only IDs/alias labels, not email/profile data.
- Removed members retain their actual history/read marking but both participants lose sending in that circle scope. Current user mode does not authorize contact. Scope is not implicitly upgraded because a separate Task relationship may exist.
- External Helper without Offer/Assignment cannot start Task chat; Community comment interaction alone grants no contact rights. ACTIVE eligible Offer permits one requester/Helper pair. Competing Helper cannot create helper-to-helper chat or read another pair. Active Care Manager may explicitly start their own pair. Default Helper counterpart is the active Task creator.
- Selected pending, confirmed, in-progress and completion-pending Task chat sends succeed. Withdrawn/declined/requester-cancelled/helper-cancelled/Task-cancelled/completed/disputed relationships block new sends while history stays participant-only. New Offer can reactivate the same legitimate pair. Backup communication remains available during pending selection and stops when confirmation closes the backup Offer. Later replacement Helper cannot read the prior Helper's history.
- Empty/overlong/HTML/attachment/unknown inputs are rejected. Two concurrent identical client IDs create one immutable Message, one generic recipient-only NEW_MESSAGE Notification, one sequence increment and one unread increment. Repeated retries preserve lastMessageAt. Different text for an existing logical ID conflicts. Already committed identical retries after termination return history only, with no new write; new IDs are denied.
- Two rapid distinct Messages get chronological sequences. Inbox ordering is last-message-first, scoped to caller only; counts include only incoming unread messages. Recipient mark-read changes only incoming unread records, preserves first readAt on repeat and never modifies sender's own Messages. Nonparticipant read/mark attempts are forbidden.
- A 205-message fixture verifies newest 50 chronological messages, before-sequence older page without overlap, first read batch 200/remaining 5 and second batch 5/remaining 0. Unread totals are not falsely limited to visible history.
- Send vs Offer withdrawal race commits either a valid earlier send or no Message if termination wins. After termination no new send succeeds. Message and Notification counts stay equal. All authority dependencies are transaction reads and core lifecycle documents are never Messaging writes.
- Task chat DTOs omit careContext/private location/instructions/profile documents. NEW_MESSAGE uses generic text with no full Message/Task text. No message content is routinely logged. User-authored sensitive text cannot be guaranteed absent and is explicitly outside medical-record use.

All previous lifecycle/selection/privacy/AI/Calendar/Notification/Review/timeline/verification/Community tests are preserved. Existing Notification tests remain intact while the new type is added. Real HTTP harness uses Firebase JS Auth and the actual mobile factories through Functions/Firestore; Messaging is not a mocked local store and does not change Task lifecycle.

## Implementation and native limits

New domain/repository/service/authorization/validation/router, public contracts, indexes and HTTP client; Inbox/conversation UI, reusable MessageEntry and protected circle-member panel; Notification routing and safe presentation errors. Two minimal contact support APIs were necessary because discovery intentionally has no Task creator ID and there was no member roster. They are protected projections, not a broad user-directory/privacy relaxation. No existing Task DTO was widened with private information.

Client uses initial load and manual refresh only. There is no periodic polling, Firestore listener, WebSocket/SSE, presence/typing or push. Failed in-screen logical sends reuse the same ID while text is unchanged; success uses a server response, not an optimistic bubble/receipt. There is no persistent offline outbox/reload retry claim. Older history pages are explicit; read batches can be continued. Header/Inbox use bounded recent summaries, not an invented global count. Notifications and Message read markers remain independent.

No configured adb/emulator/standard Android SDK executable or phone was available. No native chat keyboard, message scrolling, safe-area, Inbox/deep navigation or receipt/refresh behavior was rendered/tested. Hermes/HTTP do not prove these behaviors. Existing approximate theme is reused; no current Figma visual parity is claimed. Profile names/photos are unavailable, so Member-ID aliases are explicit and no private profile is fabricated.

Trust/safety deferred: blocking/reporting, moderation/admin review/content scanning, account deletion/history retention, abuse/rate limits, E2E encryption infrastructure and production transport. Group chat/channels/Community chat, attachments/photos/files/voice, reactions, edit/delete, presence/typing and native push are absent. Community/Review comments remain separate. Points/Payments, providers/maps, no-show/dispute/post-start cancellation and deployment remain deferred. No core implementation blocker is known before native acceptance once a target is configured; native acceptance, Figma comparison, hosted CI observation, advisories and future transport/privacy policy remain outstanding.

---

The following archived Sprint 6A and earlier records describe previous scopes. Messaging is now implemented above as a separate slice; older deferral statements do not describe Sprint 6B.

# Sprint 6A validation - November 6, 2026

Windows, Node 22.23.4/npm 10.9.9/Java 21.0.13. No new dependencies, real providers or credentials. Existing Task/Offer/Assignment lifecycle and architecture are retained.

| Check | Actual result |
| --- | --- |
| Node 22 `npm ci` | Passed; lockfile versions retained |
| Typecheck | Passed contracts/backend/mobile; new Node boundary test explicitly uses node:url URL to avoid RN/browser URL type overlap |
| Unit tests | 15 passed (13 prior + 2 Community schema/containment cases) |
| Mobile client/presentation/boundary | 23 passed (21 prior + Community HTTP paths/bodies/auth and no-Firestore source guard) |
| Emulator integration | 74 passed (65 prior + 9 Community cases) |
| Functions smoke | Passed health 200 / bearer rejection 401 |
| Default HTTP flow | Passed existing manual/core/support flow plus Community Need -> existing Offer/lifecycle, Resource, saves, Likes, flat comment and normalized Share |
| Explicit AI-mock HTTP flow | Passed suggestion/PATCH/publication through the same Community/core/support flow |
| Android Hermes export | Passed; 627 modules/2.2 MB bytecode bundle, not a rendered-native acceptance run |
| Config/boundary | CI YAML/Firebase JSON/indexes parse; mobile has no direct business Firestore/Admin imports; boundary test includes App.tsx and src |
| Dependency audit | Unchanged 28 entries: 1 low, 20 moderate, 7 high, 0 critical |

Auth 9099 / Firestore 8280 / Functions 5001 / Emulator UI 4300, demo-team517. Suites ran serially and shut down. The first full HTTP attempt stopped before tests because Windows reserved 3951-4050 including old UI port 4000. UI config/test URL/docs moved to 4300, then both default and mock HTTP modes exited 0. No OS reservations or unrelated processes were modified. Smoke requires no UI. Existing hosted Node 22 CI automatically includes new tests through workspace scripts/globs and both HTTP modes; no hosted run was dispatched/observed.

## Community test evidence

- NEED requires a valid Task and rejects irrelevant resource fields. Private/unowned Tasks cannot be shared; Draft/Cancelled/Completed tasks are rejected. Active Care Manager sharing succeeds. The initial Draft fixture was corrected to set public Task visibility, so its assertion tests state conflict rather than the earlier valid visibility denial; authorization was not relaxed.
- Live Task title updates appear without a Task snapshot in Community. Preview JSON excludes exact address/coordinates, location/context IDs and private/legacy operational instructions. New private Task visibility and closed Task status hide preview. Existing safe discovery projection is reused.
- Need-originated Offer calls the existing Task Offer endpoint. Verified Helper succeeds; self-offer, duplicate active Offer and unverified external helper remain denied; count/HAS_OFFERS behavior remains correct. No Community matching collections/operations exist.
- Public feed requires actual server VERIFIED status; circle feed/detail/interactions require active membership and allow trusted unverified circle members. Unauthorized circle feed/detail/comment/Like denied; public feed excludes circle posts. lastActiveRole does not affect rights.
- RESOURCE post embeds safe active Resource. Invalid javascript/file/plain-HTTP/credential URLs fail validation. Backend never fetches link content. Duplicate concurrent saves leave one deterministic record; unsave/repeat-unsave works, caller-scoped list never exposes another user's saves. Like count remains independent. Archived Resource disappears from detail/preview/saves and own save can still be cleaned up.
- Two simultaneous Likes from one caller leave exactly one record/count 1. Duplicate unlike is a no-op at zero. Like/unlike race finishes with a nonnegative count equal to actual records. Concurrent comments create two records/count 2; nested replies and excess length are rejected.
- Concurrent duplicate Shares return the same ID, first caption and one record. Share-of-Share normalizes to root/real original author, not a recursive chain. Circle content cannot widen to public. A later restricted/deleted original removes private embedded content and original-author provenance from readable outer Share.

All previous 65 integration cases remain, including manual/AI drafts, Task discovery/privacy, Offer count/retry/selection races, Assignment lifecycle/cancellation/completion/privacy, Calendar, Notifications, Reviews, safe timeline and verification. No existing test was removed or weakened. Expanded real HTTP harness uses the actual mobile API factories with Firebase JS Auth and Functions persistence, not a local mock feed.

## Scope and implementation

Added private Community domain/repository/service/centralized permissions/strict schemas/routes, public DTOs/clients, indexes, CommunityScreen and navigation entry, tests and all requested docs. Community write operations are typed to only its five new collections. Existing discovery whitelist was extracted unchanged for reuse; no Task/Offer/Assignment behavior was redesigned. Need stores taskId plus author-caption metadata, not Task title/location/compensation/status snapshots. Only community_posts/community_comments/community_likes/resources/resource_saves collections are added.

Posts/Resources have no edit/delete/moderation endpoint; Resource ARCHIVED is safely handled without adding an archive workflow. Comment count counts created flat comments, with no delete. Share uniqueness is per root/author/destination; retries keep the original caption. Feed/comments/saved lists return bounded recent windows with explicit truncation and no cursor. Saved resources have server persistence and active visibility projection. Client Like/save/Offer success uses server responses; no optimistic business counters or local-only content exists.

Community Notifications are explicitly deferred; Task lifecycle Notifications from Need Offers continue normally. No native push, Messaging, Points/Payments/Payouts, real Maps/identity/AI/voice provider, no-show/dispute/post-start cancellation or deployment work was added.

## Native/Figma and remaining product decisions

No adb/emulator commands, standard SDK executables or configured phone were available. No Community scrolling, comment keyboard, deep navigation, native layout or device acceptance was performed. Existing theme is reused as an approximation; current Figma visual evidence remains unavailable from prior MCP quota, so no exact parity is claimed.

Deferred trust/safety: reporting, blocking, moderation queues, private-content detection, content retention/deletion policy, URL reputation, rate limiting and pagination. Author-safe member aliases are used because profile names/photos are not in existing DTOs; no private profile data/ratings are fabricated. Public text must not contain private care/address/medical details. Comment idempotency after an ambiguous new POST is not a general platform; refresh before retrying.

No known Task/core dependency blocks Sprint 6B, but Messaging needs its own conversation participant authorization, privacy/retention, transport and notification policy. Community comments must not be reused as private messages. Native acceptance, Figma comparison, hosted CI observation and upstream advisory remediation remain outstanding.

---

The following archived Sprint 5B and earlier records describe previous scopes. Community is now implemented above; Messaging remains deferred. Older Emulator UI port 4000 references describe those earlier runs.

# Sprint 5B validation - November 6, 2026

Product frontend pass on Windows with Node 22.23.4, npm 10.9.9 and Java 21.0.13. Backend/domain/API behavior remains authoritative. No new package or provider was added.

| Check | Actual result |
| --- | --- |
| Lockfile clean install (`npm ci`) | Passed under Node 22; dependency versions retained |
| Typecheck | Passed contracts, Functions and mobile, including final UI edits |
| Backend unit | 13 passed |
| Mobile API/presentation | 21 passed: existing 19 retained plus 2 focused label/error-boundary cases |
| Emulator integration | 65 passed, all existing tests preserved |
| Functions smoke | Passed, real Functions health/auth rejection |
| Default HTTP flow | Passed manual publishing, discovery, Offers, Assignment lifecycle and support endpoints |
| Explicit AI-mock HTTP flow | Passed suggestion/review/PATCH/publication and same normal lifecycle/support endpoints |
| Android Hermes export | Passed; compiled Android JavaScript, not a native install/render |
| Boundary/config | No mobile business Firestore/Admin/collection imports; CI YAML/indexes parse; backend/contracts/rules/indexes hashes unchanged |
| Advisories | Unchanged 28 entries: 1 low, 20 moderate, 7 high, 0 critical |

The CI command sequence was run locally after a clean install, serializing all Auth/Firestore/Functions emulator suites. Final frontend-only display fixes were typechecked/exported again. Test logs are ignored local .tools/*-sprint5b-final.log. Default and mock HTTP modes each exited 0; no hosted GitHub run was dispatched or observed.

## Figma access and visual limits

Figma session created for supplied file kRer5BBbNvdSdPkanLC6HT. get_design_context with screenshot and separate get_screenshot both failed with the Starter-plan MCP tool-call limit. Direct web read of the supplied URL was also inaccessible. No local reference screenshot/design assets were found. No exact frame structure, tokens, images, Code Connect mapping or screenshot could be obtained. Therefore the centralized green/neutral palette, system typography, glyphs, rounded cards and navigation are an explicitly consistent approximation of the requested product concepts, not a verified Figma implementation or visual parity claim. No Figma asset was fabricated/downloaded/substituted.

The detailed pre-edit audit/screen-to-API mapping, delivered scope and acceptance checklist are in frontend-audit.md. There is no screenshot-based comparison of the implementation in this environment.

## Native acceptance status

No adb/emulator command was found, no ANDROID environment configuration was reported, and standard local Android SDK adb/emulator paths do not exist. No configured phone was available. No large system Android tooling was installed. **No native UI was rendered/tested.** Calendar/review/inbox navigation, keyboard overlap, safe areas, large text, scrolling, rapid native taps, back gestures and AsyncStorage reload acceptance remain outstanding. Hermes/HTTP tests do not prove them. No native UI issue was observed on a device; the following fixes are source/code-path improvements only.

Source-level improvements: automatic account loading instead of manual debug initialization; retained Helper-only trusted-circle navigation independent of role preference; shared safe error messages and lifecycle labels; real empty/loading/read states; no self-offer controls for task creator; UI cancellation confirmation; in-memory execution detail clearing on actions/navigation/unmount/background and visibility-epoch handling for in-flight reads; read-only arrival detail requests no longer trigger a parent refresh that immediately hides their result. No private response is persisted in local storage/cache.

## Regression and scope evidence

All previous manual/AI/discovery/Offer/count/selection/concurrency/Assignment/privacy/Calendar/Notification/Review/timeline/verification tests remain green without backend test weakening. Existing API factories are unchanged. Screen actions still await server responses rather than predicting lifecycle state or bypassing authorization. Figma paid acceptance visuals remain generic Offer -> Selection -> Confirmation, with no direct acceptance route. Rating zero/unverified/empty cases remain honest.

UI changes include theme, shared primitives/cards/chrome, session hook, small hardware-back helper, presentation utilities, product auth/onboarding/Me/Circle/Task list/detail, optional AI editor, discovery list/filter/detail, own offers/assignments, Offer cards, arrival details, grouped UTC agenda, Inbox, Reviews, activity and verification states. Map preview, finance/earnings and identity submission are explicitly unavailable; nearby Helper directory, Community and Messages are omitted. No fake persistent product data is introduced.

No backend/API change was made or required. Profile names/avatars are unavailable in current safe DTOs, so real ID aliases/initials are used transparently. Unselected closed-task Offers can have a generic title because the own-Offer DTO has no title and discovery appropriately refuses closed tasks; no privacy workaround was added. Inbox dot reflects only the bounded recent Notification response. Review/agenda limits and UTC behavior remain as documented in existing APIs.

## Remaining acceptance / future work

Restore Figma context/screenshots for a frame-by-frame visual pass and configure a native Android target/phone for the recorded acceptance checklist. Native layout/back/keyboard/font-scaling remains the main unverified frontend risk. Hosted CI and upstream advisory remediation remain outstanding. No known backend blocker was found for ongoing frontend work. Community/Messaging need their own authorized backend/domain/API slices before functional screens can be built; do not create local fake persistence. Real providers, maps, push, medical-record modeling, Points/Payments/Payouts, no-show/dispute/post-start cancellation policies and deployment remain deferred.

---

The following archived Sprint 5A and earlier records describe previous implementation/validation stages. Sprint 5B frontend navigation and screen labels above supersede their development/debug UI instructions.

# Sprint 5A validation - November 6, 2026

Windows, Node 22.23.4/npm 10.9.9/Java 21.0.13. Existing Expo/API/services/repositories/Firestore architecture and Sprint 4 lifecycle preserved. No new dependency, provider credential or production resource is required.

| Check | Result |
| --- | --- |
| Typecheck | Passed: shared contracts, backend, mobile |
| Unit tests | 13 passed (11 existing + Notification identity/privacy and support schema bounds) |
| Mobile API tests | 19 passed (18 existing + supporting paths/auth/encoded queries/write bodies) |
| Emulator integration | 65 passed (57 existing + 8 supporting-feature cases) |
| Functions smoke | Passed: real Functions v2 health 200 / protected route 401 |
| Full HTTP default AI-disabled | Passed: manual lifecycle and all supporting endpoints using Firebase JS auth + mobile API modules + real Functions + Firestore |
| Full HTTP explicit AI mock | Passed: labelled suggestion/PATCH/summary and same publication/discovery/Offer/lifecycle/supporting flows |
| Android Hermes export | Passed: 618 modules, Android bytecode bundle, not APK/device rendering |
| Config/static checks | CI YAML and Firestore indexes parse; no mobile Firestore/Admin imports/collection calls/private document contracts |
| Dependency audit | Unchanged 28 affected package entries: 1 low, 20 moderate, 7 high, 0 critical; no upgrades/force fixes |

Emulators use demo-team517, Auth 9099, Firestore 8280, Functions 5001 and UI 4000. Suites ran serially and shut down their emulators. Smoke, default HTTP and explicit mock HTTP all exited successfully. The default flow was also recorded separately in ignored .tools/http-default-sprint5a.log to keep its status unambiguous. Node 22 CI retains both default and explicit mock flows and automatically includes new test files through workspace scripts/globs. No hosted CI run was dispatched/observed.

## New supporting-feature evidence

- Explicit public instructions publish without legacy text and appear in eligible discovery/list/pending Assignment public-task projection. New private instructions are absent there and in ordinary circle-member Task reads; owner manages them and only current confirmed working Helper execution projection unlocks them. Decline/cancel/completion removes execution access. Legacy instructions are never copied automatically. Existing address/coarse-coordinate and AI privacy regressions pass.
- Calendar returns only active managed Tasks/current own meaningful Assignments in startAt range. Date exclusion, excessive/reversed range validation, unrelated/backup/circle-member denial and lastActiveRole independence pass. No private location/context fields appear in summary. Bounds/truncation are explicit rather than claiming exhaustive history.
- OFFER_RECEIVED, HELPER_SELECTED, ASSIGNMENT_CONFIRMED, TASK_STARTED, COMPLETION_REQUESTED and TASK_COMPLETED Notifications persist with their source event. All other requested lifecycle types use the same planner/transaction path. Generic titles/body omit private content. Self notification suppression and event-linked IDs have unit coverage.
- Concurrent confirmation and completion approval each produce exactly one lifecycle Notification for the recipient, as well as one event/state transition. Another user cannot mark a Notification read or obtain it from their list; repeated read retains first readAt. Bounded read-all works.
- Review before completion is rejected. Completed creator/active Care Manager reviews succeed; unrelated users, ordinary circle members and Helper self-review are denied. Integer 1-5 and comment length are validated. Concurrent same-reviewer submission returns 201/409 and one document; another authorized manager may independently review. No edit API exists. Summary average/count matches real Reviews; zero-review Helper has no average. Public Review DTO omits all care/reviewer/task/assignment identifiers and uses generic Requester label.
- Timeline denies unrelated discovery viewers and private Draft access. Owner/manager and related Helper projections show generic allowlisted history without actor IDs, raw metadata, competing Offer identity/message, address or private instructions.
- Verification endpoint returns all four server-controlled states and role-aware eligibility; unverified/pending/failed external discovery stays rejected. No client status-write route or real identity processing exists.

Full HTTP harness exercises agenda, Notification list/read/read-all, immutable Review/rating, timeline, verification and public/private execution projection alongside the prior manual/AI/discovery/Offer/Assignment flow. Existing 57 integration regressions retain normal lifecycle, cancellation, completion self-approval denial, exact-location revocation and all concurrency cases. No existing test was removed or weakened this Sprint.

## Scope, native acceptance and follow-ups

Added only notifications and reviews collections; calendar/timeline are views over existing state/history. Added public/private fields with explicit legacy compatibility; support domain/permissions/repository/service/router; transactional Notification planner; public DTOs/client; agenda/Notification/verification screens; Review/timeline panels; focused tests; Firestore indexes and all five requested docs. Core Task statuses/transitions remain unchanged. Only readAt mutates a Notification; Reviews are immutable.

No adb/emulator command or standard local Android SDK executable was found, and no phone was explicitly configured. No rendered Calendar, native Review UI, notification-navigation, keyboard, GPS, map, role switch or device persistence testing was performed. Hermes and HTTP do not prove native acceptance. Push delivery was not implemented or tested. Existing Map placeholder and voice/manual-transcript fallback remain unchanged.

No backend feature blocker is known for the Figma frontend pass; new contracts are available. Native acceptance and hosted CI observation remain outstanding. Frontend decisions include production locale/timezone rendering, names/avatars when real profile data exists and Notification deep-link polish. Product decisions remain for post-start cancellation, dispute/no-show resolution and eventual direct paid acceptance. Account-scale pagination, manager Notification delegation/fan-out, Review/public-text moderation/retention and provider provisioning need future work before broad use. Tasks intentionally do not model medical records, diagnoses or medication lists.

Real FCM/push, Community, Messaging, real Maps/geo upgrade, real identity provider, No-show, dispute resolution, post-start cancellation, Points accounting/purchases, real Payments/Payouts and deployment remain intentionally deferred. Compensation remains metadata only.

---

The following is the archived Sprint 4 record, retained for regression history. References to deferred Reviews/in-app Notifications and absent operational fields describe that earlier sprint and are superseded above.

# Sprint 4 validation - November 6, 2026

Windows, Node 22.23.4, npm 10.9.9, Java 21.0.13. Architecture and dependency versions retained. Firestore emulator changed to 8280 because Windows reserves 8148-8247 (including the old 8180); no unrelated process was stopped or OS reservation modified.

| Check | Result |
| --- | --- |
| Typecheck | Passed: contracts, Functions, Expo |
| Unit | 11 passed, including identity-based lifecycle policy and manager-Helper self-approval denial |
| Mobile client | 18 passed, including all lifecycle request paths, bearer auth, encoded IDs and strict bodies |
| Emulator integration | 57 passed: prior 44 plus 13 Assignment lifecycle/privacy/concurrency cases |
| Functions smoke | Passed: health 200 / missing bearer 401 |
| Full HTTP, AI disabled | Passed: Firebase JS Auth through actual mobile client modules, real Functions and Firestore, manual task + discovery + Offers + selection + confirmation + execution + requester completion |
| Full HTTP, explicit AI mock | Passed: labelled mock suggestion/PATCH/summary, ordinary publication, discovery/matching and the same full lifecycle through completion |
| Emulator seed | Passed on Auth/Firestore 8280 with loopback-only demo fixtures |
| Android Hermes export | Passed; 614 modules, compiled Android bundle; no rendered/device claim |
| Frontend architecture scan | No Firestore/Admin imports, collection calls or private document models |
| Dependency audit | Unchanged 28 affected package entries: 1 low, 20 moderate, 7 high, 0 critical |

Initial sandbox unit run could not connect to ephemeral loopback ports; authorized local-network rerun passed all 11. First Firestore run stopped at the reserved port before executing tests; port correction resolved it. A Windows text-encoding write interrupted the HTTP harness edit; restored harness was exercised successfully against real Functions. No failing check was treated as a pass.

## Lifecycle evidence

Confirmation tests enforce selected Helper identity, deny requester impersonation, set confirmedAt/ARRANGED, keep selected Offer SELECTED, close backups NOT_SELECTED and reduce count to 1. Pending decline/requester cancellation clear activeAssignmentId, remove selected actionable count and restore HAS_OFFERS/OPEN; backup reselection passes. Confirmed cancellation by either side reopens OPEN without reviving old backups; explicit reoffer reuses the original record.

Helper-only start and completion request update both Task/Assignment with timestamps. Creator and active Care Manager approve completion. A Helper cannot approve or dispute their own work even after obtaining a manager membership. Completion retains activeAssignmentId and selected count 1 for history. Completed Task normal cancellation is denied. Dispute stores a bounded private reason; no reason/address/instructions enters events/general DTOs. No resolution exists.

Task cancellation closes pending/confirmed Assignment plus all live Offers/count atomically. Normal cancellation after execution starts is rejected. Events are append-only, compact, and duplicate attempts produce no second event. My Offers and My Assignments are bounded and caller-scoped.

Concurrency: confirm vs decline, two confirms, start vs arrangement cancel, and two completion approvals each produced exactly one 200 and one 409, coherent documents, and exactly one appropriate event. Existing duplicate-Offer/count/selection races still pass (one Assignment/selected Offer for concurrent selection).

Location: pending exact execution read denied; current confirmed Helper receives projected address/coordinates only. General Task/location endpoints remain circle-only. Declined/cancelled/completed/disputed execution reads are denied. General Assignment/list DTOs exclude location/instructions/reason. Discovery regression retains coarse coordinates and excludes drafts/cancelled/circle/awaiting/own tasks. Execution intentionally excludes existing general Task.instructions due possible medical content.

Manual regression retains location/draft/partial-save/reopen/publish/list/cancel/history. AI integration tests retain provider authorization, strict output, failures/timeouts/staleness, ordinary PATCH/publication and no AI-specific state. Both default-disabled and explicit mock HTTP flows passed through publication, discovery and Assignment completion.

## Native and CI limits

No adb/emulator on PATH, no ANDROID environment configuration, and no adb/emulator at the standard local Android SDK path. No configured phone was supplied. No native rendering, GPS, map, role switching, layout, keyboard or auth reload acceptance was performed. Hermes/HTTP checks do not establish these behaviors. Map remains a coordinate-list placeholder. Voice remains manual transcript input.

CI retains Node 22, Java 21, existing scripts and credential-free demo emulators; adds a separate explicit AI-mock full HTTP lifecycle step. No dependency/provider/map SDK added. No hosted run was dispatched or observed. Deployment was not attempted.

## Remaining work

Native acceptance, hosted CI observation and upstream dependency advisories remain. Before public operation, decide dispute resolution, cancellation after start and no-show policy; improve pagination, privacy, verification provisioning and public-text safeguards. Paid direct acceptance remains unresolved and intentionally absent. Reviews, Notifications/FCM, No-show resolution, Points ledger/purchases, Payments/payouts, Community and Messaging are deferred. General instructions vs dedicated operational instructions needs product/privacy clarification before unlocking more data.

---

The following is the archived Sprint 3A validation record. Statements about deferred Assignment behavior and port 8180 describe that earlier sprint, superseded by Sprint 4 above.

# Sprint 3A validation — November 5, 2026

## Runtime and checks

Windows, Node 22.23.4, npm 10.9.9 and Java 21.0.13. Existing Node declarations, Firebase runtime, emulator ports and architecture were preserved. No map SDK, real verification provider, paid AI call or new dependency is required.

| Check | Result |
| --- | --- |
| Workspace metadata | Lockfile metadata refreshed with npm install --package-lock-only --ignore-scripts; dependency versions unchanged |
| `npm run typecheck` | Passed: shared contracts, backend and Expo app |
| `npm test` | Passed: 9 tests (7 previous + 2 geography/query-bound unit tests) |
| `npm run test:mobile` | Passed: 17 tests (16 previous + Marketplace HTTP-client coverage) |
| `npm run test:integration` | Passed: 44 emulator-backed tests (33 previous + 11 Marketplace tests) |
| `npm run test:smoke` | Passed: v2 Functions HTTP health and protected-route rejection |
| `npm run test:e2e` with default AI configuration | Passed: manual Task regression plus verified discovery, Offer withdrawal/reactivation, multiple Offers, owner selection, pending Assignment/backup preservation and private endpoint denial |
| `npm run test:e2e` with explicit mock AI | Passed: suggestion/PATCH/summary plus publication through the same discovery/Offer/selection flow; no AI-specific matching model |
| `npm run seed:marketplace` under Auth/Firestore emulators | Passed: explicit loopback mock users, verification/roles, context membership and demo Location |
| `npm run mobile:export` | Passed: Android Hermes compilation, not a native APK/device run |
| Config/architecture scan | No frontend Firestore/Admin access; no exact Location fields in external DTOs; no provider keys or parallel AI models |

Auth (9099), Firestore (8180), Functions (5001) and Emulator UI (4000) ran together for HTTP validation. Suites ran sequentially. Metadata-discovery warnings were non-fatal. A new assertion initially expected TASK_NOT_OFFERABLE for an inaccessible private draft; the backend correctly returned FORBIDDEN before visibility could be bypassed. The test was corrected to assert that denial, and the suite passed.

## Sprint 3A matching and privacy results

Tests cover first/multiple Offers and concurrent increments, same-helper duplicate retries, creator rejection, unverified external rejection, verified external success, external circle-only rejection, unverified trusted-circle success, count-safe concurrent withdrawals, final withdrawal restoring OPEN, deterministic reactivation/createdAt preservation, private Offer lists, owner/context-manager review, helper eligibility recheck at selection, foreign/withdrawn Offer rejection, and role preference without privilege escalation.

**Concurrent selection passed:** two authorized requests for different Offers produced statuses 200/409, exactly one Assignment, exactly one SELECTED Offer, one ACTIVE backup and a matching Task.activeAssignmentId. The selected helper's ordinary withdrawal is blocked. ACTIVE backup withdrawals preserve pending state. Cancellation before selection remains available; pending Assignment cancellation is blocked for Sprint 4.

Discovery tests exclude Draft, Cancelled, care-circle-only, awaiting and creator-owned tasks; include eligible VERIFIED_HELPERS tasks; validate bounds; and check that safe list/detail JSON omits stored address, label, instructions, Location/context/creator IDs and exact coordinate pairs. Coarse centers and pole/antimeridian inputs have unit coverage. Selected external helpers still receive 403 from full Task/location endpoints and only relationship metadata from Assignment reads.

offerCount is ACTIVE + SELECTED; selection preserves it and backups remain ACTIVE. OFFER_CREATED/OFFER_WITHDRAWN/HELPER_SELECTED events hold compact IDs only, not messages/profiles. Assignments implement only PENDING_CONFIRMATION. There are no confirm, decline, start, completion, payment or direct paid-acceptance operations.

## AI behavior tested

- Authentication and Care Context authorization happen before provider use. Draft privacy remains creator/active-context-manager only, including summaries/improvements; OPEN tasks cannot be AI-edited.
- An authorized suggestion may be incomplete. It creates no Task/event and has no backend-owned state fields.
- Invalid user input, timezone, arbitrary provider parameters and audio URLs are rejected.
- Strict provider output validation rejects backend fields, invented Location IDs, unknown enums, malformed dates/rewards/money, excessive text, malformed structures and reasoning keys.
- Missing provider, provider exception, timeout and malformed response produce stable errors without mutating a saved Draft or exposing vendor error text.
- Mock-generated relative-time wording remains uncertain; no server-local timezone inference is used.
- Unique context-scoped Location labels may map to an existing ID; foreign/unmatched locations cannot be authorized by the provider.
- Reviewed values apply through the normal Task PATCH path and remain DRAFT. Existing publish/compensation/location validation is still required to become OPEN. POINTS and PAID remain metadata, with no accounting/financial operations.
- Summary access is authorized, tied to taskUpdatedAt/generatedAt and not persisted. Concurrent changes invalidate suggestions/summaries.
- Providers receive only explicit input text, timezone/referenceTime and editable Task fields, with no injected IDs/profile/address data.
- Default-disabled and explicit mock configurations are distinguished. Mock mode is forbidden outside the non-production Functions Emulator. No production result is silently faked.
- AI client paths, bearer headers, safe failure codes and manual fallback messages are covered without a UI test framework.

The existing Node 22 CI automatically includes the new tests through Functions scripts/mobile glob and the expanded HTTP harness. AI tests still inject deterministic providers. No real map/verification provider or secret is required. No hosted GitHub Actions run was dispatched or observed.

## Native, voice and persistence status

**No native Android/iOS device/emulator UI, map, GPS or native role switch was exercised.** No SDK/AVD/configured phone was provided/provisioned. Layout, keyboard, scrolling, rapid taps and AsyncStorage persistence remain unverified. Map mode is a coordinate-list placeholder consuming the same discovery DTOs; no native map provider or GPS API exists. HTTP and Hermes checks are not rendered acceptance.

Voice entry is the documented manual-transcript fallback: enter/paste plain text, explicitly review it, then call the same suggestion endpoint. There is no recorder, start/stop microphone implementation, speech adapter, audio upload/transcription endpoint or audio URL fetch. No audio is collected or retained, so audio size/duration and deletion behavior are not implemented or claimed. A future native recorder/transcription service must add those limits and private temporary cleanup independently from Task extraction.

The app's existing Firebase Auth still uses getReactNativePersistence(AsyncStorage); no native dependency was added or persistence mechanism changed. The Node harness intentionally uses in-memory Auth and cannot prove native persistence.

## Configuration, data and retention

Backend-only `functions/.env.example` documents AI_PROVIDER=mock; copy to ignored `.env.local` and restart Firebase emulators. Without it, or outside the Functions Emulator/non-production runtime, AI returns AI_NOT_CONFIGURED and manual routes remain usable. A real adapter is not implemented/configured. Adding one later requires backend secret binding and provider-specific validation, timeout, quality and privacy review; Expo must never receive credentials.

There is still one Task model. Only offers/assignments collections are added to the six prior collections. Existing Task.offerCount and activeAssignmentId are now used, and TaskStatus/Event types are extended. User.verificationStatus is optional, defaults to UNVERIFIED and is server-controlled; the loopback seed supplies explicit mock VERIFIED fixtures. No real ID verification/self-verification API exists. UI role preference can only choose an existing role. AI operations remain read-only suggestions/summary and create no AI-specific event/model.

External discovery reads at most 100 candidates and returns at most 30, with truncation metadata; it is not exhaustive geo search. Location is a generic area label plus optional 0.02° representative, never stored label/address/ID. Distances are whole km from the coarse point, not exact private coordinates. This is not production-grade privacy (including sparse-area and publicly typed title leakage risks). Private endpoint access still requires circle membership; pending external selection grants none.

## Dependency advisories

The audit remains **28 affected package entries: 1 low, 20 moderate, 7 high, 0 critical**. These include parent package entries sharing underlying transitive advisories. No dependency/major framework changes or force fixes were made. The previous Functions production-only baseline is six moderate entries and no high/critical findings.

| Dependency family | Classification / why retained |
| --- | --- |
| glob/minimatch with rimraf/gaxios/gcp-metadata/google-gax parents | Transitive backend runtime and development-tool entries. Patched major lines are outside current upstream constraints; no forced override. |
| Firebase client Firestore/grpc and Firebase umbrella parents | High entries in installed but unused client Firestore dependencies; mobile imports App/Auth only. Firebase's pinned grpc range does not include patched newer lines; no Firebase downgrade/unsupported override. |
| Expo CLI Zod 3 and Expo parents | Development-tool high advisory; backend Zod 4.6.7 is unaffected by that advisory. No major Zod replacement inside Expo/SDK upgrade. |
| Expo deepmerge/config/build tooling | Low/moderate transitive entries. Requires supported upstream releases rather than forcing a newer Expo family. |
| Firebase CLI OpenTelemetry/PubSub, uuid/archive/glob tool chains | Development-only moderate entries here; safe upstream constraints remain unchanged. |

Primary references: [gRPC](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [gRPC errors](https://github.com/advisories/GHSA-f596-whhp-79r4), [glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [OpenTelemetry](https://github.com/advisories/GHSA-8988-4f7v-96qf), [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), [uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Track upstream remediation before production; these entries are not dismissed as harmless.

## Sprint 3A files and scope

Added backend marketplace domain/repository/authorization/service/DTOs/router/validation; discovery geography/service; role preference service; marketplace integration/geography unit tests; and an explicit loopback emulator seed. Updated TaskStatus/TaskEvent/User/public contracts, user DTO mapping, store preference operation, cancellation guard, API wiring, test scripts and Firestore discovery index.

Added mobile marketplace API, DiscoveryWorkspace, OffersWorkspace, CircleOfferPanel and AssignmentPanel plus API-client test. Updated App/Home role navigation, Task sections/detail/workspace and editor visibility text. Expanded full HTTP flows and updated lockfile metadata/README/all requested docs. No dependencies or provider credentials were added.

Paid tasks use the same Offer → pending Assignment flow; a separate direct acceptance path was intentionally not implemented. Confirmation/decline/execution/completion/no-show/reviews, real maps/GPS/search provider, Nearby Helper discovery, accounting/payments/payouts, Community/Messaging/notifications and deployment remain out of scope.

## Retained Sprint 2B implementation

Added backend `functions/src/ai/{provider,mock-provider,config,validation,service}.ts`, `functions/src/api/ai-routes.ts`, `functions/.env.example`, `functions/test/ai.unit.test.ts`, and `functions/test/ai.integration.test.ts`.

Added mobile `apps/mobile/src/api/ai.ts`, `apps/mobile/src/screens/AiAssistantPanel.tsx`, `AiSummaryPanel.tsx`, and `apps/mobile/test/ai.test.ts`.

Updated shared DTOs; backend app wiring and Functions test scripts; mobile API client/transport, editor/workspace, development sprint label; HTTP flow harness; lockfile metadata; README and all requested docs. Existing repositories, Task models, manual validation, permission policy, rules, Node 22 CI workflow and lifecycle transitions are preserved.

## Before Sprint 3B / Sprint 4

- Complete native acceptance and observe a hosted CI run. No microphone/recording claim is justified yet.
- Resolve paid direct acceptance vs generic selection, robust approximate-location privacy, verification provisioning, Task expiry and pending/My Offers inbox UX. No chosen architecture is bypassed in this sprint.
- Add pagination/geospatial indexing behind the current discovery contracts and assess owner Offer-list scaling; the current candidate set is intentionally bounded.
- Define Assignment confirmation/decline/reselection/cancellation and backup NOT_SELECTED timing in Sprint 4; do not treat pending selection as confirmation.
- Integrate/evaluate a real AI/speech provider only with backend secrets, output quality tests, privacy/retention policy, audio limits and cost/rate controls.
- Add atomic draft revision preconditions/If-Match before concurrent editing is relied upon. The current UI preflight version check is not atomic across GET/PATCH.
- Plan pagination that preserves Draft privacy, write idempotency and operational monitoring; assign advisory ownership.
- Keep later Assignment execution/completion and Points/Payments accounting in their own slices. No later transitions or production deployment were implemented here.

## Maker Day 3 / Crit #3 capture — 2026-11-13

Scope: presentation polish and reproducible fictional local story, not a feature sprint. [Reproduction / honesty boundaries](maker-day-3-demo.md); [eight PNGs and per-shot steps](../artifacts/maker-day-3-screenshots/SCREENSHOT_README.md).

- Node v22.23.4, existing Java 21 / SDK; no dependency upgrades. Full existing suite: typecheck PASS; backend unit **22/22**; client **80/80** (including two explicit LOCAL fictional-identity isolation tests); emulator integration **92/92**; smoke PASS; default HTTP PASS; AI mock HTTP PASS; Android Hermes export PASS. Existing Community/Messaging/privacy/concurrent-selection regressions remain in these suites. Logs are local under `.tools/md3-*.log`.
- Local standalone release APK built and installed successfully on **Pixel_9_Pro / Android 16 / API 36 / x86_64 / emulator-5554, state device**. Auth 9199 / Firestore 8280 / Functions 5001 / UI 4300 started; Android guest authenticated through 10.0.2.2. No Metro or cloud credential was required for the session.
- Eight final native PNGs were checked as 1170×2532 (390×844 at 3×), then visually inspected together and individually during capture. Android system bars only were cropped. No keyboard, loading overlay, terminal, debug ID, real address or personal-machine path appears. Long forms/details continue by scrolling; some lower secondary sections fall outside the viewport. Primary story controls remain visible.
- Actually exercised native: Grace login; existing filled draft/editor; care context/task home; detail; compare Marcus/Lena; Choose Marcus; account switching; Marcus Confirm and success; Grace calendar/date selection; progress/review; Grace Confirm completion. Final authenticated API check returned COMPLETED. Publication, two Offer messages, Start and completion request were prepared using authenticated existing public API clients, not native taps; these are documented staged transitions.
- Fixture date is November 18, 2026 (Wednesday, 10AM–12PM Eastern). Future-day progress is a fictional illustration. No field research, real assistance, user validation, pilot metric or experimental outcome is claimed. No On-my-way/Arrived feature, structured partial-availability feature or prior reviews were fabricated.
- Frontend business-Firestore boundary scan: no matches in mobile source/App/plugins. Existing safe aliases remain in PREVIEW and ordinary sessions. Fictional identity display is gated to an explicit LOCAL/demo-project/emulator/local-URL scenario. No backend/domain/DTO/privacy-rule changes. Local HTTP build plugin explicitly restores cleartext=false for PREVIEW, including subsequent incremental prebuilds.
- Secret preflight: no findings. Final presentation PNGs/README are deliberately tracked from the otherwise ignored artifact directory; raw captures, local manifest, credentials, APKs and build output remain ignored.
- This was a targeted emulator presentation capture, not a new physical-phone, keyboard stress, Maps or push acceptance run. Existing unrelated teammate branches were preserved; no Maps/new feature work followed screenshot completion.

## Sprint 7C — final validation (2026-11-13)

[Map implementation/configuration/privacy](maps.md) · [observed native matrix](native-acceptance.md).

- Node **22.23.4**, Java21, Expo SDK55 unchanged. Typecheck PASS; backend unit **22/22**; mobile/client **89/89**; emulator integration **92/92**; Functions smoke PASS; default HTTP PASS on retry; AI mock HTTP PASS; Android Hermes export PASS. New focused tests cover safe marker projection, invalid/missing coordinates, stable IDs, neighborhood framing, selection/filter invalidation, coincident areas, denial/no repeated prompts, one-shot granted location, errors/timeouts and permission-decision timing. No native Map renderer snapshot or credentialed provider is required in CI.
- One default-HTTP run stopped before business flow because Firebase CLI failed loading Functions definitions with `TypeError: fetch failed`, yielding an API 404. No backend source changed. The isolated Node22 rerun passed the full existing HTTP flow. Original failure and retry logs are retained locally as `.tools/7c-http.log` / `7c-http-retry.log`; results do not conceal the transient startup failure. Other final suite checks passed on their run.
- Standalone Preview native release build PASS; actual signed APK installed/rendered on API36 Pixel and API34 vivo, retaining real Auth/API/FCM. Final artifact SHA-256: `7b19aa692eded88ae71a7afcd23b2cdb15b5dae60a848d38dcb18dc290deada7`. Restricted Maps key is supplied locally, not committed; no runtime Admin credential is bundled. Actual two-route FCM regression passed on the final candidate.
- Privacy: existing server coarse 0.02-degree projection/whole-km policy unchanged; cloud discovery JSON checked for forbidden private fields; native pending/confirmed/terminal synthetic arrival checks performed. No exact execution location feeds a Map; no GPS persistence or new collection/API/backend deployment. All committed map evidence is synthetic emulator-only; vivo GPS permission was denied.
- Frontend business-Firestore boundary scan: no matches. Secret preflight: no findings. npm audit **28 total: 1 low / 20 moderate / 7 high / 0 critical**, unchanged counts; no audit fix --force or major dependency upgrade. New installed libraries are Expo-resolved react-native-maps1.27.2 and expo-location~55.1.15.
- Native scope: List/Map/preview/detail/Offer, shared filters, one/multiple/empty markers, denied/granted/unavailable location, offline/retry, same-cell selection, four widths including large text, physical Offer keyboard, background FCM and privileged-data clearing. This is not production geospatial search, Nearby Helper tracking, an iOS test or a full rerun of every prior native acceptance screen.
- Hosted CI and the final disconnected-phone user report are recorded below when observed. Until then Sprint7C closure remains pending; source implementation/native observations must not be presented as those external results.

Hosted source CI: **PASS**, commit `cae4cdc`, [Node22 CI run](https://github.com/KuoFuKai/team517/actions/runs/43445857548). This run includes the final source and89 client tests, all existing integration/HTTP/AI-mock/Hermes jobs, without Maps credentials. Started from origin/main `2e587b5` on `codex/sprint-7c-maps`; visible source batches were5367b42,69283dc,263be0b,5798847,546f493,f92d5d6, followed by evidence/configuration commitcae4cdc. No incoming main divergence or conflict was encountered; Kingsley's unmerged schedule-picker branch was inspected and preserved, not merged into this scope. The final USB-disconnected report is still pending and is not inferred from CI.

Shared-main hosted CI also **PASS** at `f329e4c`: [Node22 CI run](https://github.com/KuoFuKai/team517/actions/runs/43446964566). Work was fast-forwarded into main after fetching and confirming main had no incoming divergence. The working tree was clean and main matched origin/main. Runtime implementation, native checks, final APK and synthetic evidence are complete; Sprint7C's remaining acceptance item is the explicitly requested USB-disconnected user report.


Final manual closure: Kevin replied **“看來沒問題”** to the requested USB-disconnected normal-Internet Map/marker/detail/List flow. Record this as **user-reported**, not an agent-observed disconnected run. Together with the observed native scope and successful hosted runtime/source/main checks, Sprint7C can close. No new feature was started afterward. Final documentation-only commit CI is observed separately in the delivery report.

## Photo-backed demo content — 2026-11-13

[Content/provenance/reproduction](demo-content.md). Five additional fictional Tasks and five public Feed resources were created through existing authenticated APIs; two Tasks have real fixture Offers, and each Feed resource has a seeded like/comment. No business backend, DTO, collection, permission or dependency changed. Exact-ID Preview-only bundled covers and guarded fictional author presentation preserve normal aliases and redaction behavior; new focused client tests cover these boundaries.

Node22: typecheck PASS; backend22/22, client91/91, integration92/92, smoke/default HTTP/AI-mock HTTP/Hermes export PASS. Standalone Preview release built and installed on Pixel_9_Pro API36; owner Tasks/details, Helper cards and Feed photos/scrolling were actually rendered and visually inspected. No new physical-device acceptance is claimed yet. Existing Maps/privacy/push architecture remains; this slice adds no native module. The cloud seed was rerun without duplicating its five Task/post IDs or comments/likes. Sources/license recorded; no patient photos or private real addresses used. Latest APK SHA-256 is in demo-content.md.

## 2026-11-13 photo content: emulator acceptance follow-up

Target: Pixel_9_Pro, Android 16 / API 36, emulator-5554 (`device`). All five seeded Task details were opened with their corresponding photographs; all five Feed posts were rendered and reached through native scrolling. Release update and cold relaunch retained the existing signed-in session.

One MEDIUM issue was observed: RESOURCE post detail rendered the same photograph twice, pushing comments down. The duplicate post cover was removed only in detail mode; the resource card and Feed retain their photographs. The corrected release APK was installed and exercised: one detail photograph, comments and input reachable by scrolling, Android Back returns to Feed with its cover intact. No BLOCKER/HIGH issues were observed in this focused photo acceptance. No data mutations or backend changes were needed.

Post-fix Node 22 typecheck and client tests (91/91) PASS; Android release build/Hermes bundling PASS. The preceding full photo-content regression remains PASS (backend 22/22, integration 92/92, smoke/default HTTP/AI mock flows, standalone Hermes export). This follow-up does not claim a new full lifecycle, keyboard, GPS or Maps acceptance run.

The user deferred physical-phone testing while away. The corrected APK is not yet accepted on vivo; emulator results are not physical-device results. Artifact: `artifacts/android/team517-preview.apk`, SHA-256 `3f6d373eef906a4544974e95f0b7a7beeb86d500f1d5412a9dba59b14ab9c7ba`.

### Sprint 8A final emulator acceptance

Actual Pixel_9_Pro / Android16 API36 x86_64, emulator-5554 state device. Final standalone APK `artifacts/android/team517-preview.apk`, SHA-256 `4f13f979097ff878428580cb3c42ca4f196854b7d21489315af2b058dbd11f14`. [Native evidence](native-evidence/2026-11-14-points/README.md).

Wallet rendered and history scrolled at 320/360/390/412dp, fonts1.0/1.3 (8 combinations). Reward/affordability input and Save/Post controls rendered and reached at all four widths with font1.3, plus normal390dp native editing/publication. Native Post request rejected an API-prepared 2,000-point reward against1,250, preserved the draft/editor, then native correction to250 and successful publication showed250 reserved/1,000 available. Helper completion feedback, real +250 earned activity and550 balance were rendered after peer API settlement. Existing List/Map/marker/detail rendered the POINTS Task and250 reward, without wallet/private-location fields. No GPS action was used.

Observed MEDIUM issues fixed: wallet number/caption collided because TonePanel nests Text; replaced with branded block layout. Old metadata-only task-form hint contradicted the now-working reservation; replaced with current policy. No new BLOCKER/HIGH defect found in this scoped pass; no new LOW cosmetic issue requiring redesign. Backend changes implement the requested Points domain, not an unrelated native workaround.

Android Back returns wallet→Me and detail→Map; long wallet/form content and safe areas were inspected. Cloud Auth survived repeated APK updates/relaunches; no adb reverse, Auth/Firestore/Functions emulator or Metro listener was present during cloud acceptance. Emulator floating keyboard obstructed some automated taps; value entry succeeded with Android input, but full docked IME/keyboard-overlap acceptance is not claimed for this build.

Node22 typecheck;25 backend unit;94 client;100 emulator integration;smoke;default HTTP;AI mock HTTP;Hermes export and release build PASS. Additional final direct-access rules test PASS. Audit unchanged28 (1low/20moderate/7high/0critical). Boundary scan and secret preflight PASS. Hosted full source CI PASS at1f6d746: https://github.com/KuoFuKai/team517/actions/runs/43571091937. No conflicts or incoming main work; later documentation/evidence commits and final integration are reported in the completion message.

Physical checklist (run together after Kevin reconnects vivo; do not repeatedly ask while absent): install final APK; five photo Tasks/five Feed covers from the earlier photo slice; My points/history; requester draft/reward keyboard/Back; publish/reservation; account-switch or clearly identified peer-assisted settlement/release; helper balance/activity; POINTS List/Map/detail/privacy clearing; existing generic TASK_COMPLETED/Conversation background FCM and routes; cold Auth/relaunch; USB-disconnected normal-network smoke. No new Points notification type exists. Sprint8A engineering/cloud/emulator work is ready; full physical acceptance remains pending and Sprint closure is conditional on that checklist. No money, cash-out, purchase, platform fee, mobile Firestore Points access or Maps privacy expansion; iOS deferred.


Final privacy review: HIGH — an authorized Care Manager could learn another Task creator's exact available balance from INSUFFICIENT_POINTS. A failing emulator regression reproduced it. Reservation now redacts the account total for non-owner actors; only the creator receives the safe numeric affordability error. No Task/balance mutation occurs on failure. This is an error-projection fix within the requested Points slice, not a new grant/read permission. Client copy distinguishes the creator from the manager. Updated final counts are95 client/101 integration; earlier94/100 checkpoints remain historical. Native matrices above are from the same relevant layouts; final APK also includes this error-only privacy fix.
