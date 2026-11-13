# Sprint 7B.1 standalone cloud acceptance — November 12, 2026

Sprint7B.2: [physical Android / responsive acceptance / collaboration](sprint-7b2.md) and [visible progress](visible-progress.md). Actual vivo V2324A Android14/API34 ≈360dp/font1.12 rendered the documented core/support paths; 320/360/390/412dp emulator Tasks/Post at1.0/1.3 and360dp at0.85 also rendered. Physical docked keyboard, synthetic draft/comment/message send and background Conversation/Task FCM taps passed within scope. Final APK SHA256 `2af447b575958703cf7b742e2bf23b288b1367dc4c06db695e41504a96223ae1`; Node22 full suite22 unit/78 client/92 integration plus smoke/default+mock HTTP/Hermes passed. Kevin reported the complete USB-disconnected normal-network short flow succeeded (user-observed, separately from adb evidence). Sprint7B.2 can close within the documented scope. Kingsley branding/history preserved on the Sprint branch; final integration/CI state is recorded in the Sprint report/completion. Earlier checkpoints below are historical.

User-requested clean presentation follow-up: removed visible Design preview / service-not-connected labels and technical placeholder captions; use natural empty states and ordinary button labels. Unimplemented writes remain disabled, balances stay unknown, saved-draft review does not claim generated AI output, and no backend/provider behavior changed. New APK SHA256 `ee14824b172578c1714735d4bdc9b7a7fae5bc1ed7776508b73471afe65468a1`. Typecheck /65 client tests and Android release/Hermes build passed; profile/points rendered on API36. [Evidence](native-evidence/2026-11-12-clean-presentation/README.md). Previous labeled-preview screenshots and artifact hashes below are historical.

Latest visual acceptance checkpoint: [PDF fidelity report and matrix](design-fidelity.md), [actual screenshots](native-evidence/2026-11-12-design-fidelity/README.md). Pixel_9_Pro / emulator-5554 state device / Android16 API36. Final APK cold-relaunch Auth, role switching, Task editor/save/preservation, Offer/list/detail/withdraw/reactivate, Calendar, Notifications, Community comment, circle Messaging send, zero-state Reviews and completed Assignment privacy rendered/exercised as individually recorded. No claim that every lifecycle/state variant passed this visual pass; docked keyboard, existing terminal-chat-history and physical acceptance remain pending. Earlier environment-blocked matrices below are historical.

November 12 whole-app UI overhaul: [implementation, native evidence and remaining visual differences](design-overhaul.md). Shared typography, focused headers, forms/native scheduling, Offers, Discovery, account/roles, Community and Messaging were reworked; exact Figma parity and docked software-keyboard acceptance are not claimed. Earlier batch/test notes below remain historical.

Calendar follow-up: [UI batch 2](design-alignment-batch2.md) adds actual API 36 month/day grid, task markers/rows, Task/Assignment opening and preserved date, next/empty month and selected/all-date toggle. Circle clipping was fixed/re-rendered. Native invalid-input submission was interrupted by Android stylus onboarding and remains unclaimed; deterministic validation/DST tests passed. Not a full native or physical acceptance rerun.

Later UI batch 1: [scoped native results and screenshots](design-alignment-batch1.md) record the rebuilt PDF-based shell/receiver Task screen, preserved draft/history/Calendar/Message/location entry and final real background FCM Conversation routing. These are additional AVD observations, not a full repetition of every screen below or physical-phone acceptance.

Target: **Pixel_9_Pro / emulator-5554**, adb **device**, Android **16/API 36**, x86_64. Reinstalled standalone `team517 Preview` APK; Metro 8081/8099 and Firebase 9199/8280/5001/4300 stopped, adb reverse empty. This is cloud team517-dev, separate from historical LOCAL acceptance below. Initial offline transport required the user to restart the AVD; no wipe/reset performed.

| Actually rendered/exercised | Result and limit |
| --- | --- |
| Auth / role switch | Real manager/Alex cloud login, manager Helper UI preference switch and normal logout passed |
| Auth cold relaunch | Force-stop, absent PID, cold launch restored Alex and cloud Task data |
| Task / Offer review / Discovery | Native detail/owner two-Offer list and approximate Helper discovery rendered; no main clinic Task auto-seeded |
| Community | Real cloud Resource/Post feed rendered; comment input not retested in this Preview run |
| Messaging | Inbox/history rendered; keyboard text entry, scroll/dismiss and native send persisted; Android Back from conversation returned to Inbox |
| FCM | Existing granted permission, native registration/account transfer and real generic background OS alerts passed; Task/Assignment/Conversation taps routed correctly |
| Assignment | Peer API created/published/offered/selected a clearly labelled probe; Alex confirmation/Start/completion request were native taps; owner approval was peer API |
| Location privacy | Pending had no exact arrival; confirmation unlocked explicit arrival fetch; loaded private arrival cleared after completion refresh; no instantaneous revocation claim |
| Calendar | Completed cloud Assignment rendered in local-time agenda |
| Tools / navigation / scrolling | No floating Tools; bottom navigation and tested long pages scroll; not an exhaustive all-screen safe-area/keyboard regression |
| Physical / laptop-free | Not tested: no physical phone attached; no disconnected-USB/adb-stopped/laptop-closed physical flow |

No newly observed product BLOCKER/HIGH. Configuration/tooling fixes: missing reviews aggregate index and invalid synthetic fixture IDs; API/domain logic unchanged. Known LOW reopened Review entry remains. Background FCM passed; process-absent delivery was **not** verified (`am kill` left PID alive). Native manual Task draft/publish, Review submit, Timeline, verification detail, Community comment and read-only terminated Messaging were not re-exercised in this Preview run; prior LOCAL results below retain their own scope. Sprint 7B.1 cannot fully close until physical phone-only acceptance/full rehearsal. [Screenshots and evidence scope](native-evidence/2026-11-12-preview-cloud/README.md), [cloud runbook](android-preview.md).

# Historical Sprint 7B native polish acceptance — November 10, 2026

Target rechecked: **Pixel_9_Pro / emulator-5554**, adb **device**, boot complete **1**, Android **16 / API 36**, x86_64, 1280×2856, font scale 1.0. Existing SDK 55 debug development APK `edu.cornelltech.team517` was used with updated JavaScript; no new native dependency/manifest change required rebuilding it. Metro **8099** was restarted with a clean cache and final arrangement/Calendar rendering was rechecked. Firebase remained Auth **9199**, Firestore **8280**, Functions **5001**, UI **4300**, centralized Android host **10.0.2.2**.

| Actually rendered / exercised this sprint | Result |
| --- | --- |
| Authentication / role switch | Manager login, Helper mode, return to care-manager mode, logout and Alex/manager account switches passed |
| Auth persistence | Force-stopped app, verified absent PID, relaunched a fresh bundle; manager login restored while Auth emulator data remained unchanged |
| Care Context / requester Tasks | Mom’s care loaded, current/draft/history controls and selected circle rendered |
| Manual Task | Entered synthetic title/type/public/private details, times, location, visibility/compensation; saved, reopened with values preserved, then published; Helper subsequently offered on it |
| AI mock | Text request, loading indicator, explicitly MOCK preview, deselected help type/private instructions, applied only title to an ordinary Draft; no microphone or real AI claim |
| Discovery / Offer | External Alex saw safe area/public details without stored private address; entered message and created Offer; refreshed status showed one Offer |
| Multiple Offers / selection | Compared Alex and Marcus messages/verification/real available ratings on prepared clinic Task; rapid double-tap on Select produced one pending arrangement in UI; transactional concurrency is separately checked by integration tests |
| Assignment / privacy / execution | Alex opened pending arrangement without arrival control, confirmed, fetched synthetic exact address/private note, backgrounded/reopened and verified note/address cleared; Start and Request completion passed |
| Requester completion / Review | Manager opened completion request through Calendar, approved, submitted Review; form disappeared after server success; singular star/review copy rendered |
| Calendar | Local dates and America/New_York caption; clinic 10:00–12:00 EST matched Task detail; shared compact cards and arrangement-first final layout rendered |
| Timeline / verification | Opened real lifecycle event list and explicitly mock/seeded verification status |
| Community | Feed/resource, save, like, details, comment input and actual posted comment; same-audience mutation retained scroll after fix; hardware Back returned to feed |
| Messaging | Inbox, real circle history, message input/send and refreshed sent bubble; hardware Back returned to Inbox; bounded history/older-history control rendered |
| Push Assignment route | Actual generic Android OS task-update notification opened the fetched PENDING_CONFIRMATION Assignment |
| Push Conversation / terminated relationship | Actual generic Message notification was delivered, relationship then cancelled through existing API; tapping opened read-only Task history with disabled composer/send |
| Keyboard / safe areas | Gboard shown for Task, Community comment and Message entry; focused text remained above keyboard. Back dismissed keyboard and preserved inputs. Long forms/lists scrolled, fixed bottom navigation and Android gesture area stayed separate. Original hardware-keyboard preference restored to 0 |

This is an Android development-target observation, not universal device acceptance. The 7B push smoke was **background/warm routing**: the PID remained alive after `am kill`, so process-absent delivery/cold-route claims belong only to the separately documented Sprint 7A run below. Force-stop/relaunch above tested Auth persistence, not FCM delivery to a force-stopped package. No new iOS, physical-device, release-build, Doze, Maps or GPS test was performed. Older history pagination has existing automated/6C coverage; this sprint does not claim every older page was fetched natively.

| Severity | Finding | Resolution / remaining limit |
| --- | --- | --- |
| BLOCKER / HIGH | None observed in exercised product flows | No backend defect or backend/API change |
| MEDIUM | Shared root ScrollView carried deep form/list offset into a new feature screen | Added navigation-key scroll reset; does not fire on typing/ordinary refresh; native new-screen top and back behavior rechecked |
| MEDIUM | Community save/like cleared content and jumped to feed top | Keep same-audience projection during refresh; audience/filter changes still explicitly clear stale data. Native Like retained position |
| MEDIUM | Backend publish validation appeared above the viewport of a long Task form and used validator jargon | Added error-only scroll reveal and centralized field hints; validation semantics and typed fields are unchanged. Native incomplete-draft retest shows readable required-field guidance |
| MEDIUM | Pending/active work and requester arrangement actions buried below secondary content | Next-action guidance and work ordering; active arrangement precedes comparison/history; fresh-bundle completed arrangement rendered first |
| LOW | “1 reviews” / “1 stars”, UTC Calendar mismatch | Reusable count formatter; local-day grouping/range conversion and explicit zone, with deterministic timezone tests |
| LOW | Reopened reviewed Assignment still presents Review form | Confirmed current DTO lacks own-assignment review status. Documented API gap; server success/duplicate conflict hides form in current panel. No fabricated persisted local completion state or API expansion |
| LOW | Figma fonts/icons, final spacing and notification group-summary behavior | Exact parity unverified outside retrieved discovery context; prior 7A grouped-summary limitation retained. No broad redesign |

Unedited Android captures are indexed in [the Sprint 7B evidence folder](native-evidence/2026-11-10-polish/README.md). They use synthetic emulator data; helper aliases change after local resets. The gray floating Tools gear is development-build chrome, not a production app control. Captures document the observed stages of this polish run rather than implying every state was rendered simultaneously from one pristine fixture snapshot. No private credential/token or unrelated keyboard clipboard suggestion was included in committed evidence.

See [frontend audit](frontend-audit.md), [Figma gaps](figma-gap.md), [demo runbook](demo-script.md), [team review](team-review.md) and [validation](validation.md). Historical evidence below is preserved.

# Sprint 7A real FCM native acceptance — November 10, 2026

Actual target: **Pixel_9_Pro / emulator-5554**, adb state **device**, boot-completed **1**, Android **16 / API 36**, x86_64, Google Play services **26.43.30**. Installed package **edu.cornelltech.team517**, local **debug development APK 0.1.0**, Expo SDK **55**, expo-notifications **55.0.27**. The following results use the development APK and real FCM project **team517-dev**. They supersede the November 9 missing-configuration checkpoint below.

Auth **9199**, Firestore **8280**, Functions **5001**, UI **4300** and the session Metro fallback **8099** were used. Successful native login/API reads and registration used centralized Android host **10.0.2.2**. All business records stayed in the demo-team517 emulators. The real test project supplied native Firebase registration and FCM delivery through a separately named backend Admin app. The external ADC file was passed through GOOGLE_APPLICATION_CREDENTIALS in the backend process; its contents were never printed or copied into the app/repository. The local Android Firebase client file and generated Android project are ignored.

| Native check | Observed result |
| --- | --- |
| Permission explanation and explicit request | Settings rendered; OS prompt appeared after pressing Allow/refresh |
| Denial | Denied in Android prompt; settings showed denied and the app remained usable |
| Grant and registration | Second request granted; UI showed granted; one enabled own-device record appeared through the API |
| Foreground arrival | One Message/Notification committed; real provider accepted one send, Inbox changed from no unread dot to unread, Android active notification list stayed empty |
| Background arrival | Actual Android notification shade showed team517 / You have a new message.; no Message text or private Task fields |
| Arrival with app process absent | pidof confirmed no app process before API send; Android still presented the real notification |
| Warm Conversation tap | OS notification opened the correct care-circle Conversation and its current history |
| Cold Conversation tap | After process death, individual OS notification opened the correct Task Conversation with restored login |
| Cold Task tap | OFFER_RECEIVED notification opened the fetched owner Task detail after process-absent delivery |
| Cold Assignment tap | HELPER_SELECTED notification opened PENDING_CONFIRMATION Assignment; exact/private arrival information stayed hidden |
| Ended relationship | A Task Message was posted, the pending Assignment was cancelled through its normal API, then an individual stale Message notification cold-opened read-only history with sending disabled |
| Disable/re-enable | Native disable set the current registration inactive; a Message still committed with zero OS sends; Allow/refresh restored delivery |
| Native logout and account switch | Manager logout disabled its registration, Alex login took the same token ID, and Alex→manager switched it back; only current ownership remained active |
| Stale logout fence | Submitted the manager's old registration generation after native Alex login; Alex's registration stayed enabled |
| Auth restoration | Restored login automatically across multiple native process deaths and APK reinstall-with-data-preservation |

Sanitized backend audit for this run recorded **24 persistent Notifications / 19 successful one-device FCM sends / 0 provider failures / 0 invalid tokens**. Types exercised through actual domain operations were NEW_MESSAGE, OFFER_RECEIVED, HELPER_SELECTED and ASSIGNMENT_CANCELLED. Five records had no active recipient device during explicit disable/account-switch cases. Foreground sends intentionally suppressed OS presentation. These provider counts are distinct from individual OS observations in the matrix. Remaining configured lifecycle types have unit/integration/HTTP coverage, without a separate native OS observation for every type. Multi-device fan-out is covered with fake providers; this native run used one AVD.

| Severity | Finding | Resolution and verification |
| --- | --- | --- |
| BLOCKER, build infrastructure | RN 0.83 Foojay 0.5.0 referenced IBM_SEMERU removed by Gradle 9 | Scoped scripts/gradle-foojay.init.gradle selects resolver 1.0.0. Debug APK compiled successfully. |
| BLOCKER, local infrastructure | Reboot interrupted NDK installation, leaving source.properties absent | Preserved the incomplete directory under ignored .tools, installed NDK 27.1.12297006, API 36 platform, required build-tools and CMake through Gradle. |
| HIGH | Windows Metro watcher crashed on disappearing CMake directories | metro.config.js excludes .cxx/.gradle trees while keeping JS package build directories. Regression test passed; subsequent native builds and bundling stayed live. |
| HIGH | Cold notification started the workspace and lost its intended destination | Native config plugin captures onCreate/onNewIntent direct FCM and serialized Expo responses before launcher redirection. JS keeps listeners across Auth restoration, deduplicates response receipts and waits for ready session after account reset. Rebuilt APK passed cold Task, Assignment and Conversation taps. |
| LOW | Collapsed Android notification group summary opened the workspace | Individual standalone notification routes passed. Expanded group children were not separately tested. Group-summary landing remains an Android presentation limitation. |
| LOW | Existing Messaging footer still said no push delivery | Updated copy to describe manual history refresh and device notification settings; final native bundle rendered the corrected text. |

No observed BLOCKER/HIGH remains in the tested Android push flow. **Sprint 7A can close for this scoped API 36 development-build acceptance; the final full Node 22 regression suite passed.** Physical devices, iOS, release-build behavior and forced-stop/Doze/OEM delivery are separate acceptance targets. App process death here used am kill; no Android force-stop delivery guarantee is made. Older Sprint 6C keyboard/Community/layout results retain their original scope. New native work exercised Auth, Me, notification settings, system shade, Task/Assignment/Conversation destinations and their scrolling/navigation. No new Maps or financial feature was added.

Evidence: [OS Message](native-evidence/2026-11-10-push/message-os-notification.png), [permission prompt](native-evidence/2026-11-10-push/permission-prompt.png), [denied](native-evidence/2026-11-10-push/permission-denied.png), [granted](native-evidence/2026-11-10-push/permission-granted.png), [cold Conversation](native-evidence/2026-11-10-push/conversation-cold-tap.png), [cold Task](native-evidence/2026-11-10-push/task-cold-tap.png), [cold Assignment](native-evidence/2026-11-10-push/assignment-cold-tap.png), [disabled delivery](native-evidence/2026-11-10-push/delivery-disabled.png). Captures are unedited Android images with synthetic product data. [Build/provider instructions](push-delivery.md) and [final automated results](validation.md).

# Historical Sprint 7A checkpoint — November 9, 2026

Actual target reverified: **Pixel_9_Pro / emulator-5554**, adb state **device**, Android **16 / API 36**. SDK 55 app rendered in the existing Expo Go host. Auth9199, Firestore8280, Functions5001 and UI4300 ran with restored synthetic fixtures; Android API/Auth host remains 10.0.2.2 and Metro used the previously approved session port 8099. Windows reservations were not changed.

| Check | Actual result / scope |
| --- | --- |
| Sign-in → Me → device notification settings | Rendered and exercised; explanation readable |
| Unsupported Expo Go state | Rendered Permission: Unavailable and development-build explanation; both unsupported actions confirmed disabled in Android hierarchy |
| Settings scroll / safe areas / bottom navigation | Exercised; controls reachable above gesture/bottom navigation, no observed clipping in this screen |
| Persistent Notifications → Conversation → hardware Back | Exercised, existing in-app history still works; this was not an OS notification tap |
| Sign-out / sign-in | Exercised with new best-effort hook, no FCM registration present |
| Auth restoration after force-stop / reopening experience | Authenticated Task content rendered without another sign-in; initial Expo host launch needed a second explicit URL intent |
| Android push permission granted/denied prompt | Not run; Expo Go cannot exercise remote push |
| Real FCM token registration / native token rotation | Not run; only fake-provider/API/client tests passed |
| Foreground OS suppression / unread refresh from real push | Not run; implementation/testable contracts only |
| Background OS notification | Not run; no actual OS push observed |
| OS tap → Conversation / Task / Assignment, cold/warm auth restore | Not run; authenticated resolver automated tests passed, not native taps |
| Real-token logout / same-device account transfer | Not run natively; concurrency/generation-fence automated tests passed |
| Native development build | Not built; external test google-services.json, FCM project ID and credentials unavailable |

**Sprint 7A cannot close as native-push accepted.** Required next input is a private local Android Firebase config path, matching test FCM project ID and external ADC/FCM credentials. A checksum-verified full JDK 21.0.13 was prepared and javac verified under ignored .tools/jdk21, avoiding Studio's Java 25/Gradle compatibility issue without global changes. The API 36 AVD works; the first native build still needs API 36 compile-platform/Gradle dependencies (currently only android-37.0 compile platform is installed). [Exact local debug build/provider instructions](push-delivery.md) are ready; no production deployment or release build was attempted. Maps remains a separately scoped future sprint; no Maps work started here.

Issues: BLOCKER for native-push acceptance is missing FCM/build configuration, not a demonstrated product defect. A HIGH-risk token-listener recursion found by SDK/source inspection was fixed and covered by a fake native-port test; it was not observed on a real FCM build. MEDIUM environment observation: first cold Expo URL launch sometimes surfaced Google Lens; a second explicit URL intent opened the Expo experience. No unrelated camera permission was granted. Do not use this host behavior as evidence of native push launch compatibility. No new LOW cosmetic issue was observed in the small added settings screen; previous Sprint 6C LOW items remain below. No new keyboard/input claim is made: the added settings screen has buttons, not text inputs.

Evidence: [actual unavailable settings](native-evidence/2026-11-09-push/settings-unavailable.png), [existing in-app Conversation route](native-evidence/2026-11-09-push/in-app-conversation.png). These are unedited device captures with synthetic data, not simulated push screenshots. Full automated outcomes are in [validation](validation.md).

# Sprint 6C rendered native acceptance — November 9, 2026

The infrastructure-only blocker is superseded: the app was actually rendered and exercised on **Pixel_9_Pro / emulator-5554**, Android **16 / API 36**, x86_64, boot-completed=1 and adb state **device**. Expo Go **55.0.7** ran the existing SDK 55 project. Device screenshots are 1280×2856. This is development acceptance in Expo Go on one emulator, not a standalone APK, physical-device, iOS, GPS or production-map validation.

**Sprint 6C can close for this documented Android development target.** All observed HIGH and reasonable MEDIUM product defects were fixed and natively retested; the final Node 22 suite is green. Remaining LOW items are listed below. Push/Maps may proceed as a separate scoped sprint; neither was started here. This is not production/release certification or Figma-parity approval.

Auth 9199, Firestore 8280, Functions 5001 and UI 4300 started together under Node 22.23.4 / Java 21.0.13. The documented seed created manager/alex/marcus/lisa/circle accounts. Successful native sign-in and authenticated data reads demonstrate Android guest access to Auth/API through centralized **10.0.2.2** configuration. No screens construct service URLs.

Windows now excludes 7998–8097, so Metro 8081 returned EACCES on IPv4 and IPv6 with no listener. The user explicitly approved **Metro 8099 for this session**. No Windows reservation, security/network setting or virtualization service was changed. Default project ports remain documented; the acceptance launch was:

```powershell
$env:EXPO_PUBLIC_DEV_HOST = '10.0.2.2'
npm run start -w @team517/mobile -- --android --port 8099
```

The actual guest launch/relaunch URL was `exp://10.0.2.2:8099`. Native controls were inspected with screenshots and Android UI hierarchy/adb inputs; the Windows computer-use helper was also used for initial rendering. Ignored `.tools/native36-*.png` captures contain synthetic acceptance data. No new UI testing framework was introduced.

## Current native acceptance matrix

Pass means only the specific interactions listed were rendered and exercised. API fixture setup and automated assertions are distinguished from native actions. Historical Not run tables below describe earlier attempts, not this run.

| Area | Screen / flow actually exercised | Rendered? | Result | Fix / remaining scope |
| --- | --- | --- | --- | --- |
| Authentication | Initial sign-in, software keyboard, manager/Helper/circle sign-out/in, authenticated force-stop/relaunch | Yes | Pass | Auth and Helper-mode preference survived app relaunch while services remained running. Restarting the Auth emulator during outage testing required reauthentication; persistence across emulator reset is not promised. |
| Role switching | Manager → Helper → force-stop/relaunch → manager | Yes | Pass | Mode changes navigation; no authorization changes. |
| Care Context | Seeded Mom's care, Circle list, member roster, existing location selection, create Native acceptance circle through its native form | Yes | Pass | Existing context and newly created context both rendered; no direct business storage writes from mobile. |
| Manual Task | Title/help type, public/private instructions, ISO times, location, urgency, verified-helper visibility, Volunteer; Save draft → leave → reopen/edit → publish | Yes | Pass | Keyboard obstruction fixed in shared shell. Rapid publication taps produced one published Task in the UI. No payment/points execution. |
| AI mock | Explicit MOCK preview, deselect title/help type/instructions, apply urgency only; incomplete draft warnings; Discard and return to manual editing | Yes | Pass | Missing Start/End/Location/Priority/Visibility/Compensation were listed; Discard kept the unsaved manual title, which was then saved normally. No real AI, microphone or transcription test. |
| AI unavailable | Generate with provider disabled → readable unavailable message → edit/save manual draft | Yes | Pass | Manual creation remained usable. |
| Task states | Draft, Open, Offers received, Waiting for confirmation, Scheduled, In progress, Completion pending, Completed, Cancelled, Issue reported | Yes | Pass | All ten existing Task states were represented through Task/Assignment screens; no new lifecycle states. |
| Discovery | Verified Helper list/detail, Volunteer metadata, public instructions and approximate-only area | Yes | Pass | No exact address/private code visible before selection. Real Maps/GPS not implemented or tested. |
| Offer | Alex native Offer, My offers, normal active Offer withdrawal | Yes | Pass | Available → Withdrawn rendered. Duplicate/race/count invariants are additionally covered by automated tests, not claimed as exhaustive native tap stress. |
| Multiple Offers / selection | Requester reviews Alex + Marcus, selects Alex; Alex Selected / Marcus Available while pending | Yes | Pass | Marcus backup was prepared through authenticated HTTP APIs; its creation is not a native pass. Confirmation later showed backup Not selected. |
| Core Assignment | Pending → Helper confirms → arrival unlock → Start → request completion → requester approves | Yes | Pass | Full main lifecycle executed through native UI across separate accounts. |
| Alternative lifecycle | Helper decline, confirmed Helper cancellation, requester pending arrangement cancellation, whole-Task cancellation dialog, requester dispute | Yes | Pass | Alternative starting states were prepared through normal APIs; the listed terminal actions were native. Pending cancellation returned Task to Open; whole-Task cancellation showed Cancelled. |
| Exact-location privacy | Pending withheld; confirmed Show arrival details; Start clearing; completed history; already-visible data cleared on cancellation, background/reopen and Refresh after requester-side revocation | Yes | Pass | Only synthetic address/code used. Remote revocation was a normal authenticated API action, followed by native Refresh. No claim of realtime revocation detection without refresh/background/action. |
| Calendar | Date grouping, explicit UTC times, Helper label, completed Task | Yes | Pass | Task details elsewhere use local date labels; record the presentation difference as LOW. No timezone policy change. |
| Notifications | Unread list, mark-all-read, Task/Assignment route, NEW_MESSAGE route, return to list | Yes | Pass | Conversation read and Notification read remain separate. No system push claim. |
| Review | Default selected five stars, comment keyboard, submit, actual 5.0 / 1-review summary | Yes | Pass | Zero-review Offer originally showed No rating / 0 reviews. Reopening can display the review form again; backend duplicate protection is automated, a native duplicate submission was not attempted. LOW follow-up. |
| Timeline | Requester activity labels/timestamps and scroll through history | Yes | Pass | No raw metadata rendered. Competing-user authorization remains additionally covered by API tests. |
| Verification | VERIFIED, UNVERIFIED, PENDING, FAILED; unverified external discovery blocked | Yes | Pass | PENDING/FAILED were explicit server-side emulator fixtures, restored afterward. Trusted-circle access remained available; no provider/client verification write was added. |
| Community | Feed, Needs/Resources/Shares filters, resource creation/detail, Save/Unsave/Saved resources, Like/Unlike, Share, long comment, NEED preview → Task/Offer | Yes | Pass | NEED fixture created through normal APIs; its Offer was native. Preview omitted exact address/private instructions. Hardware Back returned resource detail to feed. |
| Messaging | Task and Circle entry, Inbox, long Task message send/bubble, manual refresh/read state, 55-message history and Load older, NEW_MESSAGE navigation, terminal read-only history | Yes | Pass | Final bounded-history retest showed latest messages on open/Refresh, older page at start, nearby composer and one committed Message after rapid Send taps. History fixture messages were normal API setup. No polling/WebSocket/SSE/push. |
| Error / data retention | Stop local backend while comment entered → connection error and retained text; eligibility denial → inline error/retained text → restored eligibility/retry succeeds | Yes | Pass | Comment error now stays with composer instead of shifting above viewport. Auth emulator restart needed sign-in again; fixtures were exported/imported locally. |
| Android Back | Assignment → My tasks, Conversation → Inbox/Circle, Notification conversation → Notifications, resource detail → Community; keyboard dismiss | Yes | Pass after fixes | Missing nested handlers previously exited app from Assignment. Cold-relaunch retest used final navigation handlers. |
| Keyboard / safe areas | Login, Task title, AI description, Review, resource summary, Community comment and Message text; bottom tabs/status/gesture area | Yes | Pass for listed inputs | Shared keyboard avoidance and real safe-area insets replace the obstructed/clip-prone layout. Not every device width/orientation tested. |
| Map | Coming-later button observed in discovery | Button only | Real map/GPS not run | Expected scope exclusion, not a native map pass. |

## Observed issues and disposition

| Severity | Observed issue | Correction / validation |
| --- | --- | --- |
| BLOCKER — environment | Metro 8081 excluded by Windows | User-approved session-only 8099; no OS changes. API 36 boot and all Firebase ports were usable. |
| HIGH | Software keyboard covered focused Task Title | Shared KeyboardAvoidingView now uses padding; focused fields and long Community/Message text were retested with software keyboard. |
| HIGH | Hardware Back exited app from Helper Assignment detail | Existing useHardwareBack hooked into MyWork, Conversation, Discovery, Support and Community nested views. Cold-relaunch native Assignment/Conversation/Community returns passed. |
| MEDIUM | Bottom labels could clip near gesture area after keyboard transitions | Expo SDK 55-compatible react-native-safe-area-context ~5.6.2, provider/root SafeAreaView; removed manual Android top inset. Cold native captures show bottom tabs above gesture area. |
| MEDIUM | Comment failure appeared above current scroll position | Separate inline comment-error state next to retained input; native denial and successful retry retested. |
| MEDIUM | 50 chronological messages put composer far below screen | Bounded nested history pane; native retest passed latest-on-load/refresh/send, older-page positioning, keyboard input and rapid Send. Fresh authenticated read confirmed exactly one matching Message. |
| LOW | Singular grammar such as 1 reviews / 1 stars | Documented; no broad visual redesign. |
| LOW | Calendar explicitly UTC while Task details use local labels | Documented presentation consistency follow-up; times correspond correctly. |
| LOW | Review entry can reappear on reopening an already reviewed Assignment | Documented; immutable duplicate protection remains backend-owned. No new review-status endpoint in this sprint. |

Product changes are frontend-only: App shell keyboard/safe-area handling, nested hardware-back hooks, comment-error placement and bounded Messaging history. Mobile package/lockfile add only the SDK-compatible safe-area dependency. No backend/API/domain/permission/repository/Firestore rule changes were made. All business reads/writes still use the existing authenticated API layer.

The emulator keyboard was temporarily configured to show the software IME with hardware keyboard and disable stylus handwriting for input checks; original fixture settings were restored after testing. Exact Figma parity remains unverified; no new Figma access failure or hosted CI success is claimed. No Push/Maps/Points/Payments/real AI/voice/verification/realtime features were added.

Selected unedited native captures, containing only synthetic test content: [comment error](native-evidence/2026-11-09/comment-error.png), [bounded conversation/composer](native-evidence/2026-11-09/conversation.png), [revoked Assignment without arrival data](native-evidence/2026-11-09/revoked-assignment.png), [Calendar](native-evidence/2026-11-09/calendar.png). Larger ignored `.tools/native36-*` evidence includes before/after privacy, keyboard, missing-field/Discard and new-context cases. Test-only fixture helpers stayed under ignored `.tools`; normal business fixtures used authenticated APIs, with Admin writes confined to the existing emulator identity/verification seeding policy.

Final automated checks: typecheck; 17 backend unit tests; 25 client tests; 84 emulator integration tests; smoke; default and explicit mock HTTP flows (including manual/AI Tasks, Community and Messaging); frontend Firestore boundary scan; Android Hermes export 641 modules / 2.2 MB. All passed. Fresh audit remains 28 advisories (1 low, 20 moderate, 7 high, 0 critical); no forced dependency upgrade. Ignored evidence logs use `.tools/native36-final-*`. Later supplementary native fixture interactions changed no code after these checks.

Handoff state: API 36 AVD remains booted (`device`); Auth/API/UI/Metro health probes returned 200 on 9199/5001/4300/8099. Acceptance Firebase data is restored and exported at `.tools/native36-fixtures`; explicit AI mock is active. Metro and Firebase remain running for inspection, with the app returned to Mom's care. To restore after stopping services, prepend the documented Node 22/Java paths, set AI_PROVIDER=mock explicitly if desired, and run `npm run emulators -- --import=.tools/native36-fixtures`. The extra native-created circle/draft are synthetic fixtures.

## Historical local infrastructure checkpoint — November 9, 2026

Auth Emulator is configured on **9199** instead of historical 9099. Firestore 8280, Functions 5001, Emulator UI 4300 and Metro 8081 remain unchanged. No Windows excluded ranges, virtualization/network services or security settings are changed. This supersedes the November 7 advice to resolve the Windows reservation: the project now avoids it through local configuration.

Use the centralized `EXPO_PUBLIC_DEV_HOST=10.0.2.2` for Windows services inside Android Emulator. The mobile config derives `http://10.0.2.2:9199` for Auth and the existing port-5001 API URL. Clear/update stale EXPO_PUBLIC_AUTH_EMULATOR_URL overrides and restart Expo. Desktop defaults remain localhost. Integration tests consume Firebase-injected FIREBASE_AUTH_EMULATOR_HOST; the HTTP harness imports the same mobile config. Seed fallback and the environment example use 9199.

`npm run emulators` explicitly starts only auth,firestore,functions (and the configured UI), excluding unused Storage whose default 9199 would otherwise collide. Initial live checks confirmed listeners on Auth 9199, Firestore 8280, Functions 5001 and UI 4300; Auth/Firestore/UI HTTP probes returned 200. The initial Functions discovery attempt failed with fetch failed; fresh smoke/HTTP validation is recorded separately in validation. Port binding alone is not a Functions health pass.

Final automated result: typecheck, 17 unit tests, 25 client tests, 84 integration tests, Functions smoke, default HTTP, explicit AI-mock HTTP, Community/Messaging regressions, Hermes export and frontend boundary scan passed. Fresh Functions health returned 200, protected route 401, and both full HTTP flows verified UI 4300. The Auth bind blocker is resolved through project configuration; no Windows repair was needed. These results do not mark any native screen passed.

**Native screen acceptance is still pending.** The user will manually create and boot a clean Android 16/API 36, x86_64, Google APIs, Pixel-class phone AVD. Do not retry the failed API 37 AVDs as compatibility evidence. Resume native acceptance only once `adb devices -l` reports a booted target in state `device`. No native screen passes are added by this infrastructure change; every unexercised matrix row remains Not run. Automated results appear in [validation](validation.md).

Historical 9099 references in dated November 6/7 findings below intentionally preserve the actual test environment and failure evidence. They are not current configuration. Follow the current runbook port 9199 and API 36 policy.

## Historical November 7 attempt

**Still blocked; Sprint 6C cannot close.** Android tooling is now installed, superseding the November 6 missing-tooling finding below. No product screen was rendered or exercised in this attempt. All screen matrix rows below remain **No / Not run**. No product/native UI defect or pass can be inferred from this environment failure.

## November 7 verified environment and launch attempts

| Check | Actual evidence |
| --- | --- |
| Android Studio | Running from `E:\Program Files\Android\Android Studio\bin\studio64.exe` |
| SDK | `C:\Users\kevin\AppData\Local\Android\Sdk`; platform-tools, emulator, platforms and system-images present |
| adb | `adb --version`: Android Debug Bridge 1.0.41, Platform-Tools 37.0.1-15733141 |
| Emulator | 37.2.13.0, build 16740729 |
| Acceleration | `emulator -accel-check`: exit 0, WHPX 10.0.26200 installed and usable |
| Configured AVDs | `Pixel_10_Pro` and `Medium_Phone_API_37.0` |
| System image | Installed image reports API 37.0, Google Play x86_64; no running guest Android version was obtained |
| Pixel configuration | Pixel 10 Pro, 1280×2856, density 480; configuration only, not rendered device evidence |
| Environment | Current Codex process has no ANDROID_HOME/ANDROID_SDK_ROOT or adb/emulator PATH; SDK path supplied explicitly/session-locally for launch |
| Target actually used | None successfully booted; repeated `adb devices -l` returned an empty list |
| Expo connectivity | Node 22 launch with centralized EXPO_PUBLIC_DEV_HOST=10.0.2.2 reached Metro startup, then failed opening the AVD; no device-to-Metro/Auth/API connectivity verified |

Launch attempts: Pixel default boot, Pixel verbose boot, Pixel cold boot with `-no-snapshot -gpu software`, and the second existing Medium Phone AVD with `-no-snapshot -gpu software -accel off`. Processes exited with code 1 before adb registration; Windows computer-use window enumeration found no Android emulator window. Logs do not establish the root cause. No wipe-data, SDK install, AVD configuration rewrite or Windows setting change was performed. Nonaccelerated emulation is diagnostic, not the recommended acceptance target.

## Historical November 7 blockers and recovery (superseded)

| Severity | Issue | Action / remaining dependency |
| --- | --- | --- |
| BLOCKER | Neither configured AVD reaches adb or a targetable window | Reproduce launch in Android Studio Device Manager; inspect emulator crash diagnostics and SDK Manager updates. A stable API 36 phone image is a reasonable isolation target if API 37 continues failing, but requires a manual system-image download. Root cause remains unknown. Require `adb devices -l` to show a booted `device` before retrying acceptance. |
| BLOCKER | Windows reserves Auth port 9099 | `netsh interface ipv4 show excludedportrange protocol=tcp` reports 9003–9102. No listener owns 9099; direct Node bind returns EACCES. Firebase says port taken and exits before tests/app services start. Other configured ports 8280/5001/4300 and Metro 8081 bind successfully. Preserve ports; resolve the Windows reservation before resuming. |

No product HIGH/MEDIUM/LOW native issues were observed because no app screen rendered. No UI/backend fixes were made. Existing exact-location authorization/cache clearing, keyboard behavior, long content, rapid taps, safe areas, bottom/hardware-back navigation, Community and Messaging remain unverified on Android.

Manual recovery: first try a normal Windows restart, then rerun the exclusion-range check and the fixed-port bind check before launching services. Restart is not guaranteed to remove dynamically reserved ranges. If 9099 remains reserved, identify the Windows virtualization/network component responsible and resolve it through the administrator's supported configuration; no reservation deletion, service stopping or security/network changes were attempted here. Do not change Firebase ports to conceal this blocker. After both blockers are resolved, use the runtime/seed/Expo runbook below and complete every screen row.

Fresh automated results and blocked-suite evidence are in [validation](validation.md). Prior green emulator suites from November 6 remain historical results, not passes for this attempt. Figma visual comparison and hosted CI remain unverified. Push/Maps work should wait for core rendered acceptance and closure of BLOCKER/HIGH issues.

## Historical November 6 attempt and resumption runbook

Status: **BLOCKED; native acceptance is not complete.** No Android screen was rendered. Automated HTTP tests and Hermes export are separate evidence and cannot establish native usability.

## Environment evidence

Windows x64, AMD Ryzen 7 9800X3D. Firmware virtualization is enabled and Windows reports an active hypervisor. Emulator acceleration cannot be tested without the emulator executable; CPU extension flags reported under an active hypervisor are not proof of unsupported hardware.

No Android Studio/SDK/adb/emulator was found on PATH, in Android environment variables, installed-app registry entries, known Android registry keys, common user SDK/Program Files locations, or inspected alternate D:/E: program locations. Checked literal C:/Users/kevin/AppData/Local/Android/Sdk and C:/Users/kevin/Android/Sdk paths. C:/Users/kevin/.android exists with adb keys, but no avd directory. Keys are not evidence of a connected phone. Without adb, no phone is verified. No large tooling or Windows settings were changed.

Repository runtimes: Node 22.23.4, npm 10.9.9, Temurin JRE 21.0.13. Global Node is 24; use the repository Node 22 PATH below. Expo SDK 55, React Native 0.83.10 and React 19.2 are the existing stack. Hermes export is not proof of Expo Go/native runtime compatibility.

## Minimal manual setup

1. Install [Android Studio for Windows](https://developer.android.com/studio). In its Setup Wizard install Android SDK, Platform-Tools and Android Emulator. Keep the SDK path shown in SDK Manager; the usual path is `%LOCALAPPDATA%\Android\Sdk`.
2. Open More Actions → Virtual Device Manager (or Tools → Device Manager). Create a normal Pixel phone AVD with an x86_64 Google APIs system image, for example Android 16/API 36. Download that image and start the AVD. See [Android AVD instructions](https://developer.android.com/studio/run/managing-avds) and [Expo emulator setup](https://docs.expo.dev/workflow/android-studio-emulator/).
3. In a new PowerShell session, configure only that session using the actual installed SDK path. Confirm the commands below. If acceleration fails, inspect `-accel-check` output and the [Windows Hypervisor Platform guidance](https://developer.android.com/studio/run/emulator-acceleration) before changing Windows features. This run did not change them.

```powershell
Set-Location E:\Workspaces\VibeCoding\team517
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;" + $env:PATH
adb version
emulator -list-avds
emulator -accel-check
adb devices -l
```

Require a booted device listed as `device`, not `offline` or `unauthorized`. A physical phone is an alternative only after USB debugging authorization and this check; use its reachable development host rather than 10.0.2.2.

4. In each repository terminal prepend the existing runtimes:

```powershell
$env:PATH = (Resolve-Path '.tools/node22/node-v22.23.4-win-x64').Path + ';' + (Resolve-Path '.tools/java/jdk-21.0.13+9-jre/bin').Path + ';' + $env:PATH
node --version
java -version
```

5. Terminal A: `npm run emulators`. Use current Auth 9199, Firestore 8280, Functions 5001 and UI 4300. For AI mock acceptance set `$env:AI_PROVIDER='mock'` before starting; restart without it for unavailable-mode acceptance. Never enable a real provider.
6. Terminal B: `npm run seed:marketplace` against those running emulators. Existing local accounts include manager, alex, marcus, lisa and circle at `@team517.test`, password `development517`. Manager has CARE_MANAGER and HELPER modes; alex/marcus/lisa are verified Helpers, circle follows trusted-circle policy. The seed creates identity/context/location fixtures; create Tasks, Offers and Community posts through the UI/normal APIs. No business population bypass was added. Fresh HTTP suites use separate temporary fixtures and are not persistent UI seed data. PENDING/FAILED verification fixtures still need preparation before those native cases.
7. Terminal C: set the centralized host and start Expo:

```powershell
$env:EXPO_PUBLIC_DEV_HOST = '10.0.2.2'
$env:EXPO_NO_TELEMETRY = '1'
npm run start -w @team517/mobile -- --android
```

Ensure EXPO_PUBLIC_API_URL and EXPO_PUBLIC_AUTH_EMULATOR_URL overrides do not point elsewhere; unset stale session overrides if necessary. Use [SDK 55-compatible Expo Go](https://expo.dev/go?sdkVersion=55&platform=android&device=true), rather than assuming the current store version supports SDK 55. Expo's terminal `a` shortcut can open the Android target. Record actual AVD name, Android API, device width and Expo Go version before acceptance. A local native build would require additional build tooling; the existing JRE alone is not a full Android build setup.

## Historical initial screen matrix — November 6 (superseded)

All rows have the same environment blocker; **Not run** is not a pass. No UI fix was justified without rendered evidence.

| Area | Screen / flow | Rendered on Android? | Passed? | Issues found | Fix applied | Remaining issue |
| --- | --- | --- | --- | --- | --- | --- |
| Auth | Launch, login, reload, persistence, logout/relaunch | No | Not run | Environment blocker | None | Verify native Auth persistence |
| Navigation | Tabs, hardware back, nested return, deep links | No | Not run | Environment blocker | None | Exercise every entry/return |
| Roles | Manager/Helper switch, reload, authorization | No | Not run | Environment blocker | None | Verify UI preference persistence |
| Task editor | Location, draft/save/reopen/edit/publish | No | Not run | Environment blocker | None | Keyboard, long fields, failed-save retention |
| AI | Mock preview, selective Apply, Discard, unavailable | No | Not run | Environment blocker | None | Manual editing survives failure; no microphone claim |
| Tasks | All ten lifecycle states and detail actions | No | Not run | Environment blocker | None | Labels, long content, loading and rapid taps |
| Discovery | List/detail, compensation, Offer/withdraw | No | Not run | Environment blocker | None | Verify approximate-only display |
| Offers | Multiple Offers, selection, backups, My offers | No | Not run | Environment blocker | None | Refresh and mutation navigation |
| Assignment | Confirm/start/request/approve completion | No | Not run | Environment blocker | None | Exercise across two accounts |
| Alternatives | Decline, pending/confirmed cancellation, dispute | No | Not run | Environment blocker | None | Appropriate actions and final state |
| Privacy | Before selection, pending, confirmed, terminal | No | Not run | Environment blocker | None | Inspect UI and stale-data clearing/backgrounding |
| Calendar | UTC agenda, date grouping, empty ranges/detail | No | Not run | Environment blocker | None | Local timezone comprehension and long titles |
| Notifications | Unread/read/all-read and Task/Assignment/chat links | No | Not run | Environment blocker | None | Native navigation; no system push expected |
| Reviews | Rating, comment, submit, duplicates/history | No | Not run | Environment blocker | None | Keyboard and zero-review presentation |
| Timeline | Order, labels, long history, privacy | No | Not run | Environment blocker | None | Readability; no raw metadata |
| Verification | Four states, discovery eligibility | No | Not run | Environment blocker | None | PENDING/FAILED fixtures and native labels |
| Circle | Member roster, Tasks, Message entry | No | Not run | Environment blocker | None | Return navigation and scope |
| Community | Feed/filters/detail/comments/likes/saves/NEED | No | Not run | Environment blocker | None | Long content, keyboard, safe preview and returns |
| Messaging | Inbox, circle/task chat, send/read/older/refresh | No | Not run | Environment blocker | None | Long bubbles, rapid send, terminal read-only; manual refresh |
| Me | Profile, verification and support entry points | No | Not run | Environment blocker | None | Responsive layout and navigation |
| Cross-screen | Keyboard, safe areas, network failure, rapid taps | No | Not run | Environment blocker | None | Login/editor/AI/review/comments/chat input and actions |
| Map | Existing approximate-coordinate placeholder | No | Not run | Environment blocker | None | No map SDK, GPS or map-rendering claim |

## Resumption protocol and severity

BLOCKER: no runnable native Android target. Installation is a manual dependency explicitly required by the request; do not treat automated checks as resolving it. No product HIGH/MEDIUM/LOW defects have been observed in native use because there was no native use. This does not imply their absence.

After setup, follow the rows above with manager and Helper accounts; publish a Task, make two Offers, select/confirm one, start/request/approve completion and review. Repeat decline/cancellation/dispute on separate Tasks. Inspect location/instructions at each relationship transition and after background/reload. Test Community NEED and Task Messaging while that relationship is active, then terminal read-only history. Test long input, older messages, manual refresh and repeated taps. Temporarily stop Functions while editing, verify readable errors/content retention, then restart it. Record device, screenshots, observations, severity, fix and retest per row. Stop progression to Push/Maps until core native acceptance and any BLOCKER/HIGH fixes are complete.

No product/backend/API/permission changes were made in this acceptance attempt. Existing architecture and API-only mobile business access are retained. Exact Figma parity remains unverified: historical access hit quota, and no native rendering exists for comparison; no new Figma failure is claimed. Hosted CI has not been observed.

Automated results for this attempt are recorded in [validation](validation.md); they establish separate server/client/export evidence only.

## Sprint 7C — Native Maps acceptance (2026-11-13)

[Implementation, restricted-key setup and limits](maps.md). No business backend or lifecycle change. All tasks, positions and arrival information used for evidence were fictional; no physical GPS screenshot is committed.

| Check | Target / observation | Result |
|---|---|---|
| Native provider tiles / SDK config | Pixel_9_Pro Android 16 / API 36 and vivo V2324A Android 14 / API 34 | PASS: actual Google map rendered with dedicated Android-app/API-restricted client key |
| Shared discovery | Map/List, urgency filter, compensation filter, one/empty/multiple result sets | PASS: same authorized result/filter state; no fabricated pins |
| Marker interactions | Tap/select, clear/Back, two tasks in the same privacy cell, preview → existing detail | PASS; same-cell cycling added without jitter or clustering dependency |
| Offer flow | Synthetic verified Helper; normal Offer, success, message and withdrawal on both targets | PASS; no new Offer endpoint/direct acceptance |
| Foreground location | Pixel only: denied/repeat tap, granted with fresh synthetic NYC fix, provider unavailable | PASS; non-blocking denied/unavailable messages; no repeated prompt, watcher or persisted GPS |
| Physical location privacy | vivo permission denied and repeat tap | PASS; real physical GPS was not read; map/results stayed usable |
| Network error / recovery | Emulator airplane mode, failed Discovery refresh, List/Map accessible, restored connection/retry | PASS; emulator networking restored afterward; no Windows network changes |
| Responsive map preview | 320×800dp / font1.3, 360×850 /1.12, 390×920 /1.0, 412×940 /1.0 | PASS: all rendered and View task exercised; full-height primary CTA checked; final four-width rerun after spacing fixes |
| Physical map / navigation | vivo about360dp, font1.12; List/Map, select, preview, detail, Offer, withdrawal, Back | PASS on final standalone candidate |
| Keyboard | Final vivo Offer message, docked Gboard, text retained after dismissal, scroll/submit | PASS for this focused form; not a new comprehensive keyboard matrix |
| FCM regression | Final vivo, app background; actual generic NEW_MESSAGE → Conversation; generic task update → pending Assignment | PASS; no private message/address in OS notification payload |
| Arrival privacy | Pending denied; native Confirm and Show arrival details; completion via existing APIs; terminal GET denied | PASS; only synthetic arrival values used |
| Stale privileged display | Native refresh after completion; return to Find Map | PASS: arrival text cleared; Discovery tree did not contain it; Map receives only safe DTOs |
| USB-disconnected final phone | User asked to relaunch → Find Map → Errands marker → View task → List on normal Internet | PASS — USER-REPORTED: user replied “看來沒問題” to the requested disconnected flow; no issues reported; agent did not observe the disconnected screen |

Fixes: HIGH coincident-area task reachability; MEDIUM permission-modal feedback/provider nags and sensor timeout; MEDIUM large-font CTA clipping. LOW provider label/callout density remains cosmetic. No BLOCKER/HIGH product defect remains in observed paths. The requested disconnected-phone user report is now received, and runtime/source plus shared-main hosted CI passed. Sprint7C can close for the documented two-device scope.

Final Preview APK: `artifacts/android/team517-preview.apk`, SHA-256 `7b19aa692eded88ae71a7afcd23b2cdb15b5dae60a848d38dcb18dc290deada7`. Actual signer SHA-1 is recorded in maps.md; existing development signing is unchanged. Maps uses cloud Preview, no Metro or 10.0.2.2; adb reverse was empty and local service ports were stopped during focused standalone phone checks. Separate automated regression emulators were run independently on the PC afterward.

Synthetic emulator evidence: [five curated screenshots](native-evidence/2026-11-13-sprint7c/README.md). Device display/network/location test settings were restored after testing. No rotation/iOS/all-device compatibility claim. Nearby Helpers, Points/Payments, real providers and background tracking remain out of scope.


Closure update: Kevin responded “看來沒問題” to the requested USB-disconnected relaunch → Find → Map → Errands marker → View task → List flow on ordinary Internet. This is user-reported evidence, not an agent-observed disconnected run. Sprint7C is closed for the documented Android/MVP scope; no all-device or production geospatial claim.

## 2026-11-13 photo content: emulator acceptance follow-up

Target: Pixel_9_Pro, Android 16 / API 36, emulator-5554 (`device`). All five seeded Task details were opened with their corresponding photographs; all five Feed posts were rendered and reached through native scrolling. Release update and cold relaunch retained the existing signed-in session.

One MEDIUM issue was observed: RESOURCE post detail rendered the same photograph twice, pushing comments down. The duplicate post cover was removed only in detail mode; the resource card and Feed retain their photographs. The corrected release APK was installed and exercised: one detail photograph, comments and input reachable by scrolling, Android Back returns to Feed with its cover intact. No BLOCKER/HIGH issues were observed in this focused photo acceptance. No data mutations or backend changes were needed.

Post-fix Node 22 typecheck and client tests (91/91) PASS; Android release build/Hermes bundling PASS. The preceding full photo-content regression remains PASS (backend 22/22, integration 92/92, smoke/default HTTP/AI mock flows, standalone Hermes export). This follow-up does not claim a new full lifecycle, keyboard, GPS or Maps acceptance run.

The user deferred physical-phone testing while away. The corrected APK is not yet accepted on vivo; emulator results are not physical-device results. Artifact: `artifacts/android/team517-preview.apk`, SHA-256 `3f6d373eef906a4544974e95f0b7a7beeb86d500f1d5412a9dba59b14ab9c7ba`.