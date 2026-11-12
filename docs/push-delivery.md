# Sprint 7A: Android push delivery

November 10 acceptance used real FCM project team517-dev and the local SDK 55 Android development APK on Pixel_9_Pro / Android 16 API 36. Actual OS notifications, foreground suppression, process-absent arrival, warm/cold Task/Assignment/Conversation taps, read-only ended relationships and native token/account switching passed. The final Node 22 suite is green. [Native evidence and scope](native-acceptance.md) and [validation](validation.md) supersede the earlier missing-credential checkpoint.

Persistent `notifications` is still the only product history, read-state and notification-routing authority. Existing Task/Offer/Assignment and Message transactions still create their records atomically. They do not call a push provider. A separate v2 `deliverNotification` Firestore **create** trigger calls `NotificationDeliveryService` after commit. Provider failures cannot roll back business state. Updating read state or delivery metadata does not invoke this create trigger.

`PushProvider` isolates Firebase Admin FCM. Default/emulator mode is disabled; tests inject deterministic fake providers. CI always disables real delivery, including when real-provider environment variables are accidentally present. No queue platform, second notification-history collection, new business event or production deployment was added.

## Device lifecycle and permissions

`device_tokens/{sha256(token)}` holds one record per native FCM token: id, userId, token, platform=android, optional deviceId/appVersion, enabled, lastSeenAt, createdAt, updatedAt, and registrationId. Registration is transactional, idempotent for the same active owner, refreshes lastSeenAt and transfers ownership to the authenticated caller. Reactivating or changing owner rotates registrationId. Multiple devices are allowed. There is a bounded 100-active-device read per recipient; larger installations need deliberate pagination/fan-out policy.

Optional deliveryEnabled defaults true. An opted-out new account sends false, atomically claiming inactive ownership instead of leaving an old account's active registration behind or briefly re-enabling alerts. Idempotence also covers the same owner in the same inactive mode. Internal disabledReason distinguishes user cleanup from a permanently invalid provider token; the latter cannot reactivate with the same token value (409 PUSH_TOKEN_INVALID), preventing automatic refresh from repeatedly retrying a known invalid token. A fresh native token gets a new record.

Only authenticated own-device APIs can register, inspect safe status or disable. Strict schemas reject userId/enabled/registrationId on registration. DTOs return id/platform/enabled/registrationId/lastSeenAt, never the token or userId. Status for absent/other-owner records is 404. Disable is an idempotent acknowledgement; it changes a record only when both owner and registrationId still match. This fences late A logout and late invalid-token results after B login, including A→B→A. Firestore client rules remain deny-all.

Me explains generic alerts before the explicit permission button. Permission is never requested automatically at sign-in. Existing grants refresh registration at restored session, foreground and native token-change events. Denial/unavailable/provider/network failures leave the app and in-app updates usable. Expo Go displays unavailable rather than importing unsupported remote-notification code. Only Android native FCM tokens are accepted in this sprint; iOS/APNs is not implemented.

Mobile registration work is serialized and uses captured account credentials, not whichever account happens to be current later. A revision fence rejects stale work after disable/logout. Only safe registration receipts and the per-user disable preference persist locally; raw tokens are not cached or logged. Explicit disable persists across relaunch until the user chooses Allow/refresh. Token rotation attempts to disable the previous receipt. Logout attempts cleanup before local sign-out, waits at most 1.5 seconds and never fails because cleanup failed. The receipt survives a failed cleanup for a later attempt. New-account registration re-associates the current token, even if old cleanup failed.

Residual limitation: offline logout cannot guarantee remote unregister. A previously queued/in-flight OS notification cannot be recalled. A send can race a transfer after the final ownership check. Payload text stays generic, and tap fetches authenticated recipient history and current resource access; the old account's resource is not authorized for the new account. Registration ownership is last committed registration; token possession is not a device-attestation system. Expiry/periodic stale-registration sweeping, account-deletion cleanup and abuse/rate controls remain follow-ups.

## Delivery semantics and privacy

The delivery service transactionally claims the existing Notification by writing private `pushDelivery` metadata on that same document. Concurrent/repeated invocation claims once. It fans out to unique enabled recipient tokens, rechecks ownership just before each send and conditionally disables only the matching invalid registration. Explicit unregistered/invalid-registration-token errors disable; ambiguous invalid-argument/payload/config/network errors remain failed attempts and do not delete good devices.

Important existing types: OFFER_RECEIVED, HELPER_SELECTED, ASSIGNMENT_CONFIRMED, ASSIGNMENT_DECLINED, ASSIGNMENT_CANCELLED, COMPLETION_REQUESTED, TASK_COMPLETED, COMPLETION_DISPUTED, NEW_MESSAGE. TASK_STARTED, likes, Community minor activity and read-state changes do not push.

Payload title is always `team517`. Body is `You have a new message.` or `You have a task update.` It never copies persisted title/body, Message text, name/profile, exact address, private instructions, medical/AI/care-context content. Data contains only notificationId, resourceType and resourceId. FCM Android channel is `updates`; tag uses notification identity. No payload/token is logged.

This is **at-most-once logical attempt**, not guaranteed delivery/exactly-once OS presentation. The claim precedes the provider request. A crash after claiming may lose delivery or leave CLAIMED; partial fan-out is not retried. Provider errors are recorded as counts/status, without secrets. A provider/OS may still drop, delay or duplicate presentation. There is no durable retry/recovery queue in this MVP. Do not clear claims or re-create Notifications to retry manually. Notification history remains available regardless.

Foreground handler suppresses OS banners/list/sound and refreshes in-app unread indicators; it does not create another Notification or mutate read state. Cold/warm taps preserve only a notification ID while session restores. The app fetches `GET /notifications/:id`, then the actual Task, Assignment or Conversation using current authorization. Payload resource hints are not trusted. Relationship-ended Conversations use existing read-only policy; denied/deleted resources show normal unavailable errors. Notification lookup does not mark read automatically.

The SDK 55 development launcher needed a small native prebuild integration for cold taps. plugins/withNotificationLaunch forwards both direct FCM extras and serialized Expo responses before onCreate/onNewIntent redirection, using the SDK's NotificationManager. The JavaScript listener remains registered through Auth restoration, deduplicates native receipt IDs and applies queued navigation after session readiness/account reset. The native plugin is idempotent and fails clearly if its expected Kotlin lifecycle template changes. It adds no resource authority or business persistence. Metro also excludes transient .cxx/.gradle directories to prevent Windows watcher crashes during native compilation.

## Development build and FCM configuration

[Expo SDK 55 documentation](https://docs.expo.dev/versions/v55.0.0/sdk/notifications/) confirms Android Expo Go does not support remote notifications from SDK 53. The API 36 Expo Go acceptance from Sprint 6C does not validate push. Dependencies use SDK 55 compatible expo-notifications, expo-constants and expo-dev-client. `app.config.js` adds their plugins and reads **build-only** TEAM517_GOOGLE_SERVICES_FILE. Native directories and google-services.json are ignored; service accounts remain outside the repository. The user supplied team517-dev and its external ADC file for the November 10 acceptance run.

Use a private Firebase **test** project with Android package `edu.cornelltech.team517`, FCM enabled and its google-services.json. Configure a matching FCM service account/ADC outside the repository. Keep JS Auth/Firestore on demo-team517 emulators for acceptance. The provider uses a separately named Admin FCM app with explicit FCM_PROJECT_ID, so it does not accidentally address FCM to demo-team517 or replace the business database app.

From repo root in PowerShell, using the documented Node 22/Java setup (Android builds require a full JDK; the emulator JRE alone is insufficient):

```powershell
$env:PATH = (Resolve-Path '.tools/node22/node-v22.23.4-win-x64').Path + ';' + $env:PATH
$env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk"
# Full JDK 21 prepared locally; does not replace the existing emulator JRE.
$env:JAVA_HOME = (Resolve-Path '.tools/jdk21/jdk-21.0.13+9').Path
$env:TEAM517_GOOGLE_SERVICES_FILE = (Resolve-Path 'apps/mobile/google-services.json').Path
$env:EXPO_PUBLIC_DEV_HOST = '10.0.2.2'
Set-Location apps/mobile
npx expo prebuild --platform android --no-install
Set-Location android
./gradlew.bat --init-script ../../../scripts/gradle-foojay.init.gradle :app:assembleDebug -PreactNativeArchitectures=x86_64 -PreactNativeDevServerPort=8099 --console=plain
# From the repo root, install the generated debug APK on the selected device:
# adb -s emulator-5554 install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

The first native build exposed the upstream React Native 0.83 Foojay resolver 0.5.0 / Gradle 9 incompatibility (`IBM_SEMERU` was removed). The checked-in scripts/gradle-foojay.init.gradle overrides only that exact resolver version to 1.0.0, including composite builds. It leaves the wrapper and installed package sources intact and must be supplied to Gradle until the upstream pin is corrected. [Upstream resolver compatibility fix](https://github.com/gradle/foojay-toolchains/blob/main/CHANGELOG.md).

8099 is the user-approved session fallback; the normal Metro default remains 8081. Do not change Windows reservations. Subsequent development-client sessions use `npx expo start --dev-client --port 8099`. A build requires the real file and Android Gradle dependencies; configuration/export alone is not a native build or OS-push pass. No EAS account, release signing or production deployment is required for this local debug path.

Local build preflight found Studio JBR javac 25.0.4, while the installed React Native Gradle plugin wrapper is 9.0.0. [Gradle's compatibility matrix](https://docs.gradle.org/current/userguide/compatibility.html) requires 9.1+ to run on Java 25. A checksum-verified official Temurin full JDK 21.0.13+9 was prepared under ignored .tools/jdk21. Automated emulator suites continue using the original JRE 21. The November 10 build installed API 36 compile platform, NDK 27.1.12297006, required build-tools and CMake 3.22.1 via Gradle with existing accepted SDK licenses. An NDK installation interrupted by reboot was preserved under .tools before reinstalling. Debug APK assembly and installation passed. Global Java/Gradle and Windows reservations were not changed.

For an explicitly authorized native test run only, supply backend variables in the emulator launch shell. The three PUSH_/FCM_ settings may alternatively use ignored functions/.env.local; GOOGLE_APPLICATION_CREDENTIALS stays in the shell, outside Firebase's reserved dotenv namespace:

```powershell
$env:PUSH_PROVIDER = 'fcm'
$env:FCM_PROJECT_ID = 'your-real-test-firebase-project'
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:/local-private/team517/fcm-service-account.json'
$env:PUSH_ALLOW_EMULATOR_FCM = 'true'
npm run emulators
```

Unset these for normal credential-free tests. CI=true unconditionally disables real FCM. No credentials should be pasted into logs, documentation or chat. Auth9199 / Firestore8280 / Functions5001 / UI4300 remain unchanged; Android host is 10.0.2.2. FCM is an external Google service, not an emulator service.

Observe a real background OS notification and its tap before recording a native push pass. Test permission granted/denied, foreground suppression, background delivery, Task/Assignment/Conversation taps, relaunch session restoration, relationship termination and logout/account switching. See [current native results](native-acceptance.md) and [automated validation](validation.md).

Provider references: [Firestore trigger duplicate-event semantics](https://firebase.google.com/docs/functions/firestore-events), [FCM error codes](https://firebase.google.com/docs/cloud-messaging/error-codes), [Expo native FCM delivery](https://docs.expo.dev/push-notifications/sending-notifications-custom/).
