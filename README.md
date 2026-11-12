# team517

November 12 whole-app UI overhaul: [implementation, native evidence and remaining visual differences](docs/design-overhaul.md). Shared typography, focused headers, forms/native scheduling, Offers, Discovery, account/roles, Community and Messaging were reworked; exact Figma parity and ordinary software-keyboard acceptance are not claimed. Earlier batch/test notes below remain historical.

UI alignment batch 2: Tasks now has a functional month grid, marked dates, compact daily rows and bounded month/custom-range queries with local-time/DST handling. The [Calendar report](docs/design-alignment-batch2.md) records the new APK, 55 client tests and actual API 36 evidence. Batch 1 was pushed at `aaf7297` and hosted CI passed; broader form/Offer/Assignment visual alignment remains in progress.

UI alignment batch 1 (November 12): compact receiver Tasks/status rows, role-specific navigation, Tasks Calendar entry and Post draft-intent protection are implemented and tested on API 36. The standalone APK was rebuilt; [batch report / before-and-after evidence](docs/design-alignment-batch1.md) records the new hash, tests and remaining design work. PDF-based approximation was explicitly approved; whole-app Figma parity is not claimed.

For a private GitHub handoff, see [repository sharing](docs/repository-sharing.md): source/docs/lockfile are included; local credentials, Preview passwords, native build output and APKs remain excluded.

November 12 Preview update: Blaze is confirmed. Firebase CLI Google-user login deploys separately from runtime ADC. Native Firestore in us-central1, rules/20 READY indexes, `api` and `deliverNotification` are deployed; Email/password Auth and synthetic Preview accounts are ready. Extended cloud smoke passed. Actual API 36 standalone cloud login, Message send, background FCM/Task/Assignment/Conversation routes, Assignment confirmation/start/completion request, refreshed location clearing and cold-relaunch Auth persistence passed. Physical-phone/disconnected-USB/class rehearsal remains pending. See [Android Preview](docs/android-preview.md) and [native evidence](docs/native-evidence/2026-11-12-preview-cloud/README.md).

Sprint 7B.1 **Android Preview**: a standalone internal APK is available at `artifacts/android/team517-preview.apk`, bundles JS and launched on API 36 with Metro/Firebase emulators stopped and no floating Tools UI. **This sprint cannot close until the remaining native/physical/cloud acceptance checks pass.** See [android-preview.md](docs/android-preview.md) for the artifact, current status, install and before-class checklist. This is not production or a Google Play release; iOS and Maps remain deferred.

LOCAL remains default (legacy `development` accepted), with Auth 9199 / Firestore 8280 / Functions 5001 / UI 4300 and centralized Android host 10.0.2.2. Use `npm run preview:android` for the bundled build. Backend/admin tools require explicit `--project team517-dev`: `preview:check`, `preview:deploy`, `preview:prepare`, `preview:smoke`. There is no cloud delete-all/reset command. Never substitute LOCAL `demo:reset` for cloud preparation.

Sprint 7B: demo polish and team review preparation. Shared warm/teal/ink tokens and Task cards, clearer next actions, less crowded navigation, local-time Calendar and focused native scroll fixes preserve the existing API/domain architecture. Figma discovery context was retrieved; other V2 visual parity remains unverified due quota. No backend/API or future-feature implementation was added.

Start with the [5–7 minute demo and local reset runbook](docs/demo-script.md), [team review](docs/team-review.md), [product policy](docs/product-policy.md) and [Figma gaps](docs/figma-gap.md). `npm run demo:reset` intentionally clears **only loopback demo-team517 Auth/Firestore**, then prepares synthetic accounts, two Offers, a Community resource and Message; reauthenticate afterwards. `npm run demo:prepare` preserves progress and avoids duplicate prepared Offers/messages.

Sprint 7B Node 22 validation passed: typecheck, **22 backend unit / 36 mobile-client / 91 emulator integration**, smoke, default/AI-mock full HTTP, Android Hermes export and frontend Firestore boundary scan. Actual Android API 36 screen/keyboard/flow and real Assignment/Conversation push observations are scoped in [native acceptance](docs/native-acceptance.md); [validation](docs/validation.md) retains results and limitations. Maps is intentionally **Sprint 7C**. Points, Payments, cash-out, no-show and arbitration remain unimplemented.

**Sprint 7B can close for the documented Android demo/team-review scope.** Remaining LOW issues are the own-assignment Review-status API gap and unverified Figma font/icon/layout parity; see the review documents before treating the app as production-ready.

The [final Sprint 7B closure audit](docs/sprint7b-closure.md) separates actual visual changes, existing functionality, demo tooling, known LOW statuses and evidence for Yiru/Kingsley. The closure pass changed documentation only; Maps was not started.

Sprint 7A (November 10) has actual Android FCM acceptance on **Pixel_9_Pro / Android 16 / API 36**, using the locally built SDK 55 development APK and test project **team517-dev**. Permission denial/grant, real token registration, foreground unread refresh, background and process-absent OS delivery, authenticated warm/cold Task/Assignment/Conversation taps, ended-relationship read-only history, device disable/enable and same-device account transfer were exercised. Persistent Notifications remain the history/read-state authority. See [native matrix and screenshots](docs/native-acceptance.md), [validation](docs/validation.md) and [build/provider setup](docs/push-delivery.md).

The native build uses a scoped Foojay/Gradle compatibility init script and an Expo config plugin preserving notification intents before development-launcher redirects. Metro excludes transient native compiler directories. Real FCM requires explicit backend-only configuration; ordinary development and CI default to disabled delivery. The earlier Sprint 6C record below covers its Expo Go acceptance. Maps remains a separately scoped next sprint.

Sprint 6C (November 9): the existing product was rendered and exercised on **Pixel_9_Pro, Android 16/API 36, Expo Go 55.0.7**, with adb state `device`. The native core lifecycle, supporting screens, Community, Messaging and location-revocation checks passed after focused frontend fixes. See the [scoped native matrix and screenshots](docs/native-acceptance.md) and [final automated results](docs/validation.md). Exact Figma parity, physical-device/iOS and standalone release-build acceptance remain separate.

**Sprint 6C can close for this tested Android development target.** Remaining LOW items are documented; no observed BLOCKER/HIGH product issue remains. Push/Maps may be planned as a separate sprint; this work adds neither.

Local ports remain Auth **9199**, Firestore **8280**, Functions **5001**, UI **4300**. Windows also reserved Metro 8081 during this run; the user approved **8099 for this session**, launched with `EXPO_PUBLIC_DEV_HOST=10.0.2.2` and `npm run start -w @team517/mobile -- --android --port 8099`. No Windows reservations or services were changed.

Cornell Tech Product Studio foundation through Sprint 6B: manual/reviewed AI Task drafts, privacy-aware discovery, Offers, the Assignment lifecycle, agenda, in-app Notifications, Reviews and safe activity history. Expo + TypeScript mobile, Firebase Auth, a v2 HTTP API, and Firestore. Product branding is provisional. See [architecture](docs/architecture.md), [API contract](docs/api-contract.md), and [development plan](docs/development-plan.md).

## Sprint 5B product frontend

The development menu is replaced by a shared product shell: **Tasks, Calendar, Find tasks (Helper accounts), Community, Circle and Me**, plus the header Inbox. Sign-in restores the server profile automatically. New users choose an onboarding role and Continue. Me switches among existing roles; mode is a view preference, never authorization. Helper mode opens My tasks/My offers. Opening a circle gives access to trusted-circle Tasks even for a Helper-only account; it does not change roles.

Choose a circle to view task cards, post/save/edit/publish a draft, review Offers and manage the existing Assignment lifecycle. The optional writing assistant sits inside the editor; expand **Describe with AI** to review text/manual-transcript suggestions. It remains optional and honest about mock/unavailable modes. Calendar provides a date-grouped UTC agenda. Inbox, Reviews, activity history and verification use their existing APIs. Privileged execution details clear on actions, navigation/unmount and backgrounding; no new persistent cache exists.

The earlier Figma design-context and screenshot calls hit the account's Starter-plan tool limit. Colors, system typography, cards and spacing remain **an approximation, not verified V2 parity**. See [frontend audit and screen/API mapping](docs/frontend-audit.md). Actual API 36 native screenshots and functional results are now recorded separately in the Sprint 6C report; native rendering does not establish Figma parity.

Only actual implemented features are in functional navigation. Map preview, points/earnings and identity submission are explicitly unavailable; no wallet balance, direct paid acceptance, fake microphone recording, messages, Community posts or push delivery is simulated. Backend source, public contracts and API clients remain unchanged.

## Requirements and setup (PowerShell)

Use Node.js **22.x**, npm, and Java **21+**. Root and workspace engines, `.nvmrc`, `.node-version`, and Firebase's `nodejs22` runtime agree. Use your existing version manager or install Node 22 directly; no version manager is required by this repository. Verify `node --version` prints `v22.*` before installing. Install Java and expose `java` on PATH before starting emulators. No Firebase Console project or service account is needed for the demo emulators.

```powershell
node --version
npm ci
Copy-Item apps/mobile/.env.example apps/mobile/.env
npm run emulators
```

Emulators: Auth 9199, Firestore 8280, Functions 5001, UI [localhost:4300](http://localhost:4300). Bindings permit device access on your local network; use a trusted network and appropriate Windows Firewall rules. Emulated data is ephemeral by default. Demo project: `demo-team517`. Rebuild and restart emulators after backend changes.

`npm run emulators` starts only Auth, Firestore and Functions plus the configured UI. Storage is unused and excluded from this command; its default port would otherwise compete with Auth 9199. The local port migration does not change product/API/domain behavior or Windows reservations.

In another terminal:

```powershell
npm run mobile
```

Use Expo Go compatible with SDK 55 or a development build. Environment-specific URLs are centralized in `apps/mobile/src/config.ts`. Configure `apps/mobile/.env` as follows:

| Target | `EXPO_PUBLIC_DEV_HOST` | Derived API base URL |
| --- | --- | --- |
| Local desktop | `localhost` | `http://localhost:5001/demo-team517/us-central1/api/api/v1` |
| Android Emulator | `10.0.2.2` | `http://10.0.2.2:5001/demo-team517/us-central1/api/api/v1` |
| Physical phone | Your Windows LAN IPv4, e.g. `192.168.1.50` | `http://192.168.1.50:5001/demo-team517/us-central1/api/api/v1` |

Auth uses the same host on port 9199 (`http://10.0.2.2:9199` on Android Emulator). Optional `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_AUTH_EMULATOR_URL` override the derived URLs; remove stale overrides when switching to DEV_HOST. Restart Expo after changes. On a phone, use the same Wi-Fi network and allow the emulator/Metro ports through Windows Firewall. The API URL includes `/api/api/v1` intentionally. `.env` files remain ignored; `.env.example` is safe to commit. Do not store secrets in EXPO_PUBLIC variables.

Manual mobile acceptance flow:

1. Create an account using an email and password of at least 6 characters against the Auth emulator, or sign in to an existing emulator account.
2. Choose **Family & care manager** and **Continue** on first onboarding. Existing accounts load automatically.
3. Open **Circle** and choose **Create a care circle**, enter `Mom's care`, then **Save care context**. Submission is disabled/guarded while pending.
4. Confirm `Mom's care` appears after refresh. Tap it to load the detail endpoint through the API.
5. Sign out and initialize a different account; its list should be empty. The automated HTTP suite additionally verifies cross-user read denial.

Sprint 2A manual Task acceptance (continue with your care manager account):

1. Open **Mom's care** → **Tasks / Post a task** → **Locations**. Enter `Home` and a manual street address, then **Create location**.
2. Choose **Post a task**. This creates an empty backend DRAFT and opens its editor. Enter a partial title, choose **Save draft**, and confirm it appears under **Drafts**.
3. Open that draft → **Edit draft**. Complete title, help type (e.g. `ERRANDS`), instructions, start/end ISO times with timezone (e.g. `2026-12-01T14:00:00Z` and `2026-12-01T15:00:00Z`), select Home, urgency PLANNED, visibility CARE_CIRCLE, and compensation VOLUNTEER.
4. Choose **Save and publish task**. Confirm it moves to **Open tasks**, then open it to retrieve Task Detail through the API.
5. Choose **Cancel task**, confirm CANCELLED in detail, then return to the **Cancelled tasks** section.
6. Try publishing an incomplete draft to see structured field feedback. POINTS and PAID metadata can also be exercised; they do not transfer value. Save changes before leaving the editor to manage locations, or unsaved edits will be discarded as labelled.

The context Task list includes every lifecycle status. Drafts remain creator/active-context-manager-only. Each lifecycle change is an explicit authenticated backend operation, never an arbitrary status PATCH.

## Sprint 3A discovery and matching acceptance

Start Firebase emulators, then in another Node 22 terminal run:

```powershell
npm run seed:marketplace
npm run mobile
```

The seed accepts loopback emulators only and writes demo-team517. It creates public development accounts `manager@team517.test`, `alex@team517.test`, `marcus@team517.test`, `lisa@team517.test`, `circle@team517.test`, all with the **demo-only** password `development517`. Manager has CARE_MANAGER + HELPER; Alex/Marcus/Lisa are server-seeded mock VERIFIED Helpers. Circle is an UNVERIFIED active member of Mom's care. No real identity verification occurred. Seed data is ephemeral unless you explicitly configure emulator export/import. There is no client endpoint to grant roles or verification.

1. Sign in as manager and use the automatically loaded profile (seeded accounts already exist). Open Mom's care → Tasks. Create or reopen a manual/AI-assisted draft and publish with visibility VERIFIED_HELPERS. Use the seeded Demo home for a coordinate-backed example. Title and help type are public discovery metadata: keep private addresses/access instructions out of them.
2. Sign out, sign in as Alex, open **Find tasks**, or switch to Helper mode in **Me**. Discover/open the task, enter an optional message and choose **Offer to help**. Test withdrawal and reactivation; the Offer ID is reused.
3. Repeat as Marcus/Lisa to create multiple Offers. None can inspect competing Offers. An unverified external Helper is rejected. Circle may offer through Care contexts under the trusted-circle policy but cannot use external discovery until verified.
4. As manager, open Task Detail → **Offers & arrangement**. Select one ACTIVE Offer. Confirm PENDING_CONFIRMATION, Task AWAITING_CONFIRMATION and other Offers still ACTIVE. Use the Assignment controls below to confirm, decline and execute. The selected Offer cannot be withdrawn through the normal path; backup ACTIVE Offers may still be withdrawn.
5. As the selected Helper, refresh the Offer while detail is open to retrieve pending Assignment metadata. It contains no address/instructions. Reloading discovery excludes awaiting tasks; use Home > My Offers / My Assignments to return to your selected work.
6. Test the List/Map toggle: both consume the same fetched results. Map mode is a development coordinate listing, **not a rendered native map**. Coordinates/radius are entered manually; no GPS is requested. Discovery is bounded to 100 candidates/30 results and is not exhaustive geospatial search.

External helpers receive no stored location label, street address, Location ID, context/receiver/creator ID or private instructions in discovery. Coarse points use a 0.02° grid representative (roughly 2.2 km north/south), with a guard against returning an identical stored coordinate pair. Distances are whole-km approximations computed from those coarse points, not exact private coordinates. This is an MVP approximation, not production-grade location privacy. Missing coordinates mean unknown area/distance; radius-filtered results omit them.

Role switching changes only lastActiveRole among existing roles. It grants no roles, context access or verification. Backend authorization always uses persisted roles/membership/verification/resource relationships. Offer lists use helper IDs and available verification status; names, avatars, ratings and reviews are not invented.

All compensation types currently follow **Task → Offer → selected pending Assignment**. Whether paid Tasks should later support direct acceptance is unresolved; no separate paid acceptance/payment path was added. Backup Offers close on confirmation, not selection. Native role switching, map/layout rendering and GPS were not tested.

Native acceptance status: no native target is configured on the validation machine, so the rendered acceptance flow remains pending. When an Android Emulator/AVD is available, set `EXPO_PUBLIC_DEV_HOST=10.0.2.2`, start the Firebase emulators, run Expo, and choose Android. On an explicitly configured phone use your development machine's LAN IP and the same network. Desktop tools use localhost. Keep these values in the existing config/environment module; full URL overrides take precedence over DEV_HOST.

On the device, also check rapid repeated Save/Publish taps, loading indicators, validation errors, keyboard access to form controls, and scrolling at a small viewport. Stop the backend while leaving the app running, attempt a refresh, verify readable connection feedback, then restart the backend. Reload the app (not just Fast Refresh) and confirm sign-in is restored; navigate back to the context/draft to verify persisted backend data. Record the exact device/OS and results before closing acceptance.

Firebase Auth already uses `initializeAuth` with `getReactNativePersistence(AsyncStorage)` from the installed compatible stack. Native sessions are configured for local persistence across reloads; there is no intentional in-memory fallback in the app. The startup observer waits for Auth state restoration. Actual reload persistence has not been verified on a device. The Node HTTP test harness intentionally uses in-memory persistence and does not prove this behavior.

The UI reports sign-in, validation, permission, backend and network failures. Requests have a 15-second HTTP timeout and no automatic POST retries. After an ambiguous network failure, refresh the list before resubmitting. A confirmed creation leaves the form even if refreshing subsequently fails.

## AI development setup and acceptance

AI is **disabled by default**. Manual task/location creation, editing and publishing work without AI. No real AI or speech provider is configured or implemented; no provider key is required for local tests. To explicitly enable the deterministic emulator mock:

```powershell
Copy-Item functions/.env.example functions/.env.local
npm run emulators
```

Restart emulators after changing backend configuration. `AI_PROVIDER=mock` is accepted only when Firebase sets `FUNCTIONS_EMULATOR=true` and NODE_ENV is not production. Outside that environment, or with unset/unsupported values, requests return AI_NOT_CONFIGURED. Mock responses are labelled MOCK in both DTOs and UI; they are not production AI results. A real provider later requires an AiProvider adapter and backend-only secret configuration in the provider factory, not merely a client key or URL. Never put provider keys in Expo/EXPO_PUBLIC variables. `.env.local` is ignored.

1. Create/open your existing DRAFT → **Edit draft**. Save manual changes before using AI; context is the last saved draft.
2. Under **Describe with AI**, enter a description or editing instruction and confirm the explicit timezone. Example: `Urgent grocery pickup tomorrow morning; location: Home`. Generate a suggestion.
3. Review the MOCK label, proposed fields, missing/invalid fields and warnings. The mock does not interpret relative times; enter exact ISO times yourself. A unique existing location label can be suggested; unmatched wording needs manual location selection/creation.
4. Toggle proposed fields to accept all or a subset, then **Apply selected fields**. This calls normal PATCH and leaves the task DRAFT. Discard leaves it unchanged. Unsaved, unselected manual inputs remain in the form.
5. Complete/edit fields normally and use the existing **Save and publish task** when ready. AI never publishes. Failed AI requests preserve your draft and manual form.
6. On Task Detail, choose **Generate derived AI summary**. It is on-demand, labelled non-authoritative, tied to updatedAt and never stored. A changed task invalidates it.

Voice mode is the **manual transcript fallback**: enter/paste a transcript, review it, choose **Use reviewed transcript**, then request the same suggestion flow. No microphone package, recorder, speech provider, audio upload endpoint or audio URL support was added. No recording/transcription/microphone behavior was tested. A future recording → temporary transcription adapter must return plain text to this same suggestion API; it must not mutate/publish tasks. No audio is collected or retained in this implementation. Text/suggestions live in UI/server request memory; only user-accepted editable Task fields are persisted through normal PATCH. Prompts, transcripts, full responses and reasoning have no separate database fields/logs/events.

The backend allows 5,000 input characters, 16 KB JSON bodies, fixed provider operations, authenticated/context-authorized access and an 8-second provider deadline. The client has a 15-second HTTP timeout. No arbitrary model/temperature/provider parameters are accepted. Application-level distributed rate limiting and real-provider cost controls remain follow-ups before public use.

## Validation

```powershell
npm run typecheck
npm test
npm run test:mobile
npm run test:integration
npm run test:smoke
npm run test:e2e
npm run mobile:export
```

Integration tests launch Auth and Firestore emulators and use real emulator-issued ID tokens against the Express app with Admin persistence. Unit tests cover health and authentication rejection. API-client tests use Node's built-in test runner with injected fetch/token providers. No lint tool is configured; strict TypeScript checks are the initial static check. `mobile:export` bundles Android JavaScript; it is not a native APK build.

`test:smoke` starts Functions and checks health/missing-token rejection. `test:e2e` requires Node 22, starts Auth, Firestore, Functions and Emulator UI, and runs Firebase JS Auth plus the actual mobile API modules through identity/context operations and the complete manual Task flow (location, draft, partial save, reopen, publish, list/detail, cancel), history verification and unrelated-user denial. Backend integration tests cover invalid states/fields, permissions, foreign locations, all compensation modes and concurrent publishing. The harness uses in-memory Auth persistence in Node; it does not render React Native or prove native device behavior. Stop interactive Firebase emulators before running these commands, and run emulator suites sequentially to avoid port conflicts. Test emulator data is temporary. See [validation results and dependency advisory analysis](docs/validation.md).

`.github/workflows/ci.yml` runs these checks on push, pull request and manual dispatch using Node 22 and Temurin Java 21: clean install, typecheck, unit/client tests, integration, smoke, HTTP flow and Android export. Emulator suites run serially against demo-team517 without credentials. The workflow has read-only repository permissions and no deployment. Its commands are validated locally on Windows; a hosted GitHub run remains to be observed after the workflow is pushed. It is not a substitute for native acceptance.

This machine has ignored, local Node 22.23.4 and Java 21 runtimes used for validation. To use both in a PowerShell session:

```powershell
$env:PATH = (Resolve-Path '.tools/node22/node-v22.23.4-win-x64').Path + ';' + (Resolve-Path '.tools/java/jdk-21.0.13+9-jre/bin').Path + ';' + $env:PATH
node --version
```

Those folders are machine-local and will not exist in a fresh clone. Install Node 22 and Java 21+ normally on other machines. The project does not modify the system-wide Node installation.

## Firebase Console and production

For production, create/select a separate real Firebase project, enable email/password Authentication, create Firestore, choose location deliberately, and enable billing needed for Functions deployment. Configure an explicit production CLI alias (do not repoint the demo default by accident). Set mobile APP_ENV to production, supply real Firebase public app configuration and the HTTPS API base URL, and register the app as appropriate. Firebase web config is public identification, not a privileged secret. Never put service-account credentials or server secrets in EXPO_PUBLIC variables.

Deploy only after reviewing project, billing and production settings; this scaffold does not deploy anything. Build from the root before deployment. The backend has no secrets for Sprint 1; local Admin credentials are provided by emulators and deployed Admin uses its runtime identity. Keep `.env`, credentials, build outputs and emulator logs out of version control. The committed `.env.example` has only demo values.

Cloud Storage has deny-all rules as a placeholder and is not started locally. Sprint 7A adds FCM registration/delivery infrastructure; actual OS delivery still requires native acceptance. Sprint 3A adds only offers and assignments collections alongside the six existing collections. Assignments now support the Sprint 4 lifecycle. There is still one Task model and publish workflow. Real AI/ID verification, audio recording/transcription, native Maps/geocoding, points ledger, Payments/payouts, Community and one-to-one Messaging are implemented below.

## Sprint 4 acceptance

1. Select a Helper as above. As that Helper, open **My Offers / My Assignments**, select the pending Assignment and **Confirm Assignment**. Exact operational location is unavailable before confirmation. Confirmation arranges the Task and closes other ACTIVE Offers as NOT_SELECTED.
2. Alternatively **Decline Assignment**. Task returns to HAS_OFFERS with active backups, or OPEN without backups. As requester select a backup. Requester **Cancel arrangement** has the same fallback but closes the selected Offer as NOT_SELECTED.
3. A confirmed Helper or requester may cancel the arrangement before start: Task reopens OPEN; closed backups stay closed. Helpers must explicitly offer again. **Cancel task** means the Task is no longer needed and atomically closes pending/confirmed arrangements and Offers instead of reopening.
4. As confirmed Helper choose **Load operational location**, then **Start Task**, then **Request completion review**. General Task instructions remain private because they may contain medical information; new privateInstructions now carries explicitly entered operational notes after confirmation; legacy instructions remain withheld.
5. As requester open Task > Offers & arrangement, refresh and **Confirm completion** or **Dispute completion** with an optional reason up to 500 characters. The Helper cannot approve their own work, even with a manager membership. DISPUTED requires future operational handling.
6. Completed history keeps activeAssignmentId as a relationship reference, but exact-location access through execution ends at completion. Declined/cancelled Helpers similarly lose privileged access. Data already viewed cannot be recalled; the screen clears loaded details on refresh/actions.

Task cancellation is allowed only before execution: DRAFT, OPEN, HAS_OFFERS, AWAITING_CONFIRMATION, ARRANGED. In-progress, completion-pending, completed and disputed Tasks cannot use normal cancellation. All compensation remains display metadata; paid Tasks still use Offer > Selection > Confirmation, with no direct acceptance or settlement.

Firestore moved from 8180 to **8280** because Windows reserved 8148-8247 on this machine. Seed defaults and Firebase config agree. No host reservations were modified.

## Sprint 5A supporting-feature acceptance

Existing manual/AI publishing, discovery, Offers and lifecycle controls are preserved. New collections are **notifications** and **reviews** only. Calendar and timeline do not create another source of truth.

1. In a draft, enter **Public instructions** (safe for eligible Helpers evaluating the Task) and **Private operational instructions** (e.g. buzz/entrance/arrival instructions after confirmation). Both are optional draft fields capped at 2,000 characters. Publishing requires publicInstructions or the existing legacy instructions. Legacy instructions stay private and are never automatically copied to either new field. Do not enter medical records, diagnoses, medication lists or broad health information in Tasks. Public title/help type/instructions must contain no exact address or access details.
2. As Helper, discovery detail and pending Assignment show public instructions only. Confirm and choose **Load operational location** to retrieve the current operational address and private instructions. Declined/cancelled/completed/disputed relationships lose this access. Regular circle members cannot retrieve the new privateInstructions through general Task Detail; owner/active manager can manage them. Existing legacy circle/location access is unchanged.
3. From Home choose **calendar**. Set a UTC date range (start inclusive/end exclusive, at most 93 days); optionally select one date. Agenda lists published managed Tasks and current selected/confirmed/in-progress/completion-pending/completed Helper relationships, with time/status/role and open-detail controls. It is a bounded read model, not recurrence or an external calendar integration.
4. Choose **notifications** to see the newest 50, mark one read, mark the most recent 200 records read, or open the related Task/Assignment. Notifications reflect persisted history; navigation rechecks current access. The Task creator receives requester-side notices; selected Helper receives selection/completion-review outcome notices. Self actions are not notified. Sprint 7A adds device registration and isolated FCM delivery; no fake OS-push success is claimed.
5. Open a Task/Assignment and **Load Task timeline**. It uses existing task_events, mapped to generic labels/timestamps, without raw metadata. Related external Helpers see their own Offer/selection events and appropriate generic lifecycle history, never competitor identities/messages.
6. After completion, requester opens the Assignment, chooses 1-5 stars, optionally comments (max 1,000 characters) and submits an immutable Review. Only one per reviewer per Assignment is allowed; creator and each active Care Manager may independently review. Helper self-review is forbidden. Comments are shared with authenticated app users: exclude private care/address/health details. Completion never depends on a Review.
7. **Load Helper reviews** shows real average/count and the latest 20 Reviews with a generic Requester label. No names/context/assignment IDs are exposed in review history. Zero reviews means no average rating, not a fabricated score. Offer review includes lightweight real rating summaries; Task discovery does not load full review histories.
8. Choose **verification** for server-controlled UNVERIFIED/PENDING/VERIFIED/FAILED status and a clear eligibility message. External discovery remains enforced by the backend; seeded/mock development verification is explicit, with no ID processing or self-verification endpoint.

These are functional development screens pending native acceptance. Calendar groups in UTC; production locale/time-zone polish is deferred to the frontend pass. DISPUTED resolution, no-show, post-start cancellation, direct paid acceptance, real push/Maps/identity providers, Points/Payments and deployment remain deferred.


## Sprint 6A Community

Community adds **Needs, Resources, Shares, flat Comments, Likes and saved Resources**, using the Sprint 5B theme and authenticated API clients. It does not add another Task/Offer/Assignment system. In-app comments are shared discussion, not direct messaging.

1. Start demo emulators and optionally run `npm run seed:marketplace`. Public Community requires server-controlled VERIFIED status for every role, including authors; seeded manager/helpers provide explicit mock states. Unverified active circle members may use their circle feed. No self-verification endpoint exists.
2. Open **Community**. Choose Verified community or an authorized care circle, select All/Needs/Resources/Shares, then **Refresh / apply filters**. The newest 30 posts are shown; there is no production pagination yet.
3. **Share a need**: choose an existing circle and a Task you manage that is currently OPEN/HAS_OFFERS. Add a public-safe caption. A public Need requires a VERIFIED_HELPERS Task; circle-only Tasks cannot be widened. The post stores taskId, not a copy of Task location/status/compensation/title. Needs use a live safe discovery projection, including only public instructions and approximate location.
4. **View task / Offer to help** on a Need uses the existing offerHelp Task API. Self-offer, verification, eligibility, duplicates, counts and matching transitions remain unchanged. The optional offer message is available in detail. Check Tasks > My offers afterward. A Need linked to a closed or newly private Task shows unavailable content; it never unlocks an exact address or private instructions.
5. **Add a resource**: enter title, summary, category, optional HTTPS link, and separate post caption. No URL is fetched/scraped by the backend. Links open only on an explicit client action. The Resource is reusable independently from its post. A failed post step retains a known created Resource ID for retry rather than automatically creating another.
6. Like/unlike and save/unsave are server-confirmed and independent. **Saved resources** uses server persistence, not local bookmarks. Archived or newly inaccessible resources are omitted from saved lists/previews; there is no author archive/edit UI yet.
7. **Comments & details** shows up to 50 recent flat comments and allows one-level text submission. No nested replies, private chats or comment deletion exist. commentCount counts all comments created through the API. After an ambiguous failure, refresh before submitting again.
8. **Share post** writes a caption/reference with original provenance, normalizing Share-of-Share to its root. Circle content cannot leave its source circle. One Share exists per author/root/destination; retries return the first existing Share and caption. Each preview rechecks the original's current access; missing/unauthorized originals show unavailable without content/provenance leakage.

Posts/comments/captions/resource summaries must not contain private addresses, access instructions, medical or care details. Text lengths and visibility are enforced, but there is no semantic moderation, reporting, blocking, retention policy or link safety reputation system yet. Community Notifications are deferred to avoid expanding notification policy/delivery scope; existing Task Notifications still work. No Like notifications or Community push delivery is added.

New collections: community_posts, community_comments, community_likes, resources, resource_saves. No community_tasks/community_offers/community_assignments exist; conversations/messages are added separately in Sprint 6B. The UI remains an approximation where Figma access was unavailable; no exact Community visual parity or rendered-native scrolling/keyboard/navigation test is claimed. One-to-one Messaging is now implemented in Sprint 6B; Points/Payments/Maps/providers and production deployment remain deferred.

Emulator UI uses port **4300** because this Windows host now reserves 3951-4050 (including 4000). No OS port reservation was changed. HTTP tests use the configured 4300 default, with optional EMULATOR_UI_URL override.


## Sprint 6B one-to-one Messaging

Header **Inbox** now opens real conversations. **Task updates & notifications** and Me > Notifications retain existing in-app lifecycle updates. No group chat, attachments, voice, presence, typing or live transport is implemented. Sprint 7A separately adds NEW_MESSAGE push delivery over the existing Notification.

1. Use the demo seed for active circle members and verified external Helpers. In **Circle**, choose **View circle members to message**, then **Message** for a member. Both users must be initialized active members of that same circle. No arbitrary contact, invitation or group creation is simulated.
2. For external Task communication, submit an Offer first. Helper discovery/own Offer and Assignment screens provide **Message**, using one TASK conversation with the Task creator by default. Owners/active managers can Message a specific Helper from an Offer card. Multiple managers are never silently added or notified; each pair has its own history.
3. **Inbox** lists the newest 50 conversations (last-message time first), safe member aliases, short last-message previews, unread counts and read-only status. Profile names/photos are not available in existing contracts; aliases are not invented names. Empty conversations sort after those with messages.
4. Open a conversation. It loads the newest 50 Messages in chronological order, with **Load older messages** using a simple sequence cursor. **Refresh messages** receives updates. No Firestore listener, WebSocket/SSE or periodic/background polling is used. History is not downloaded unboundedly.
5. Enter plain text up to 2,000 characters; angle brackets/HTML and non-text control characters are rejected. Send uses a clientMessageId retained for retry while the trimmed text is unchanged. Failed sends preserve the text. Changing it starts a new logical send; refresh after an ambiguous failure before changing/retyping. A server-acknowledged Message is not added optimistically before success.
6. Incoming read state is marked in batches of at most 200. If older unread Messages remain, use **Mark next unread batch**. Read never modifies your own sent Messages; a sent Message displays Read only when the recipient's server readAt exists. Notification read state is separate from Message read state.
7. Task messaging permits ACTIVE Offers on OPEN/HAS_OFFERS/AWAITING_CONFIRMATION and current selected pending/confirmed/in-progress/completion-pending Assignments. Pending backup Offers stay eligible; confirmation closes them as NOT_SELECTED and sending stops. Withdrawn/declined/cancelled/completed/disputed relationships are read-only unless a new live Offer/Assignment independently restores Task eligibility.
8. Removed circle members retain their actual participant history, but neither side may send in that CARE_CONTEXT conversation until both memberships are active. A valid TASK relationship uses a separate conversation, not an implicit override of circle scope. Replacements cannot read a previous Helper's chat.
9. Each newly committed send atomically creates Message + updated Conversation/read counters + one generic NEW_MESSAGE in-app Notification for the other participant. Retrying the same sender/conversation/client ID returns the committed Message without another Notification or last-message update. Reusing the ID for different text conflicts. NEW_MESSAGE opens the corresponding conversation, including read-only history.

Only conversations/messages collections are added; Community comments and Review comments remain separate. Conversations store relationship IDs, safe short user-authored previews and counters, never automatic Task addresses/private instructions/medical data. Do not use chat as a medical-record or identity-document store. Users can manually type sensitive text; no content scanning, reporting/blocking, moderation or retention/deletion policy is implemented. No full Message body is copied into Notifications or routine logs.

Native chat keyboard, scrolling, safe areas and Inbox navigation remain untested without a configured Android SDK/AVD/phone. Existing approximate theme is reused; exact Figma parity is not claimed. Points/Payments, providers, Maps, no-show/dispute/post-start cancellation and deployment remain deferred.
