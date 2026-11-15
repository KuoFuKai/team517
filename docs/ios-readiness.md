# iOS source readiness — Sprint 8H

**Source/config preparation is separate from compilation, signing and runtime.** This Windows host did not run Xcode/CocoaPods or an iPhone Simulator. `expo prebuild --platform ios --no-install` explicitly skipped generation on Windows and returned “At least one platform must be enabled when syncing”. No generated ios project or successful iOS build is claimed. Config introspection succeeded; Expo doctor20/20 passed at the recorded checkpoint.

Stable bundle: **edu.cornelltech.team517**, Firebase project **team517-dev**, registered iOS app **1:628775953070:ios:a7428a2e9ad65fb3e9033f**. Local plist obtained using Firebase CLI, ignored like Android service config. Version0.2.0/build2, portrait, iPhone-only (supportsTablet false); increment buildNumber for later distributed builds. Android package is unchanged. Native directories remain CNG-generated/ignored.

## Source / external / runtime matrix

|Area|Status|Evidence / remaining boundary|
|---|---|---|
|Email Auth / onboarding|READY IN SOURCE; REQUIRES RUNTIME TEST|Shared Firebase JS persistence/token model; real emulator and Android checks separately recorded.|
|Google|READY IN SOURCE; REQUIRES MAC / RUNTIME TEST|Nitro native plugin, real plist/reversed scheme and Web client; no native iOS login claim.|
|Apple|READY IN SOURCE; REQUIRES APPLE CREDENTIAL / RUNTIME TEST|Official button availability guard, nonce and Firebase credential; Apple provider setup pending.|
|Firebase iOS app|READY IN SOURCE|Real registered app/config, platform-specific JS app identity, no Android fallback.|
|Maps|READY IN SOURCE; REQUIRES MAC / RUNTIME TEST|Default Apple Maps on iOS; Android retains Google. iOS-target config strips Android Maps key. Same approximate DTO/privacy.|
|Location|READY IN SOURCE; REQUIRES RUNTIME TEST|Only NSLocationWhenInUseUsageDescription; no Always/background keys; contextual one-shot use.|
|Notifications|READY IN SOURCE; REQUIRES APPLE CREDENTIAL / RUNTIME TEST|iOS-only RNFirebase Messaging converts APNs registration to FCM token; never register raw APNs token as FCM. Build flag off until configured.|
|APNs|REQUIRES APPLE CREDENTIAL|Push entitlement exists in introspection, but Team/signing/APNs key upload and real delivery are pending. Entitlement is not delivery evidence.|
|Keyboard|READY IN SOURCE; REQUIRES RUNTIME TEST|Existing KeyboardAvoidingView/scroll/composer architecture; Android results do not prove iOS behavior.|
|Safe areas|READY IN SOURCE; REQUIRES RUNTIME TEST|Shared SafeAreaProvider/View and modal/bottom-nav architecture; no native iPhone layout pass.|
|Navigation|READY IN SOURCE; REQUIRES RUNTIME TEST|Visible focused Back/modal close; Android hardware Back is supplementary. Test Task/Offer/Profile/Conversation/Calendar/Review/Auth paths.|
|Fonts|READY IN SOURCE; REQUIRES RUNTIME TEST|Bundled Fraunces/Inter, load gate with safe fallback; inspect actual iOS metrics.|
|Date/time|READY IN SOURCE; REQUIRES MAC / RUNTIME TEST|Native iOS datetime spinner with visible Use/Cancel; Android imperative picker retained.|
|Network|READY IN SOURCE; REQUIRES RUNTIME TEST|PREVIEW allowlisted HTTPS cloud API/Auth, no10.0.2.2 or Metro requirement.|
|Deep links|READY IN SOURCE; REQUIRES RUNTIME TEST|Google reversed URL scheme; notification destination authorization retained. Firebase verify/reset uses browser handler, not passwordless app links.|
|Deletion|READY IN SOURCE; REQUIRES APPLE CREDENTIAL / RUNTIME TEST|Email/cloud/emulator results separate; Apple revocation and active-responsibility policy require final evaluation.|
|Native compile|REQUIRES MAC|No CocoaPods/Xcode invocation on Windows; optional EAS macOS build not authorized/run.|
|Distribution|REQUIRES APPLE CREDENTIAL|No TestFlight/App Store/physical iPhone signing claim. Legal/privacy and deletion-policy review also pending.|

## Native dependency audit

|Dependency|iOS disposition|
|---|---|
|Firebase JS12.x / AsyncStorage2.2.0|iOS supported; JS session persistence is sole Auth authority; native storage/runtime test required.|
|RNFirebase App/Messaging26.0.0|iOS-only FCM bridge, Firebase Apple SDK12.15.0/CocoaPods line, minimum15.0; static frameworks configured. Android explicitly excluded and continues existing Expo FCM. No RNFirebase Auth/Firestore dependency. Mac compile required.|
|Nitro Google2.3.1 / Nitro Modules0.37.1|Native iOS Google SDK + config plugin; native framework compile/runtime required.|
|expo-apple-authentication55.0.17 / expo-crypto55.0.19|SDK55-resolved; Apple capability/button/random nonce; Apple credentials and runtime required.|
|expo-notifications55.0.27|iOS supported, APNs/signing/runtime needed; generic persisted Notification architecture retained.|
|react-native-maps1.27.2|iOS Apple provider, no Google Maps iOS SDK/key required. Compile and map/runtime tests needed.|
|expo-location55.1.15|Foreground-only supported permission config; actual permission UX/runtime pending.|
|expo-font55.0.8 / bundled brand fonts|iOS supported; compile and visual metrics pending.|
|safe-area-context5.6.2|iOS supported; notch/home-indicator runtime pending.|
|datetimepicker8.6.0|iOS-native source adapter added; Mac compile/timezone/DST/runtime pending.|
|Gesture handling|No additional gesture-handler package introduced; existing Pressable/ScrollView/native Map interactions require iOS runtime.|
|expo-build-properties SDK55 version|Supported CNG iOS static-framework configuration; no manual deployment-target raise.|

SDK55 supports iOS15.1+ and Xcode26.2+ per [Expo's SDK table](https://docs.expo.dev/versions/v55.0.0/). No generated project's effective deployment target was established on this Windows host; retain SDK defaults and verify after Mac prebuild. Native Firebase's15.0 minimum is lower, so no project target raise is introduced.

RNFirebase27 initially exposed Android Kotlin incompatibility and a Firebase Apple SDK13/SPM transition; it is not the final dependency. Chose26.0.0 to keep a CocoaPods/Firebase Apple SDK12 path and excluded the bridge from Android, rather than patching node_modules/upgrading React Native. Remaining Mac compilation is genuine evidence still needed, not assumed from metadata. [RNFirebase Expo setup](https://rnfirebase.io/), [Expo build properties](https://docs.expo.dev/versions/v55.0.0/sdk/build-properties/).

No iOS permission request during registration. Push source is build-gated by `TEAM517_IOS_PUSH_ENABLED=true` only after APNs/Firebase setup; ordinary app use works without push. APNs and Firebase native FCM token listeners are separated. [Exact handoff](ios-build-handoff.md), [auth](authentication.md), [deletion](account-deletion.md).
