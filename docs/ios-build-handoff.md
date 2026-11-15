# First Mac build — team517

Start from the exact final Sprint8H source recorded in the Sprint report/build manifest, not the frozen8G APK source. iOS is **not compiled or runtime-accepted yet**. No Apple paid enrollment, credentials, EAS signing or paid build was performed automatically.

## Local Mac path

1. Install Node22 (repository .nvmrc), npm, compatible Xcode26.2+ and iOS Simulator runtime. Open Xcode once, accept its license/finish components, select its command-line tools. Install a compatible CocoaPods toolchain as required by Expo/Xcode; do not copy Windows native build directories.
2. Clone/fetch and checkout `codex/sprint-8h-auth-ios-readiness` at the reviewed final commit. Run `npm ci` and `npm run build -w @team517/contracts` at repository root. CNG ios/android are ignored; durable source is app config/plugins/package lock.
3. Sign into the Firebase CLI with a team-authorized Google user. From root obtain the actual native client configs (not Admin credentials):

```sh
npx firebase apps:sdkconfig IOS 1:628775953070:ios:a7428a2e9ad65fb3e9033f --project team517-dev --out apps/mobile/GoogleService-Info.plist
# Optional for shared Android setup / automatic Web client metadata:
npx firebase apps:sdkconfig ANDROID 1:628775953070:android:fa5004de1ec54d3be9033f --project team517-dev --out apps/mobile/google-services.json
```

CLI refuses overwriting an existing file: download to a new local temporary filename, validate project/bundle, then update only the intended client-config file. Both files are ignored. Never copy Firebase Admin/ADC, Apple private key or service-account JSON to mobile. For iOS-only configuration without Android JSON, set the real public `TEAM517_GOOGLE_WEB_CLIENT_ID` from the team517-dev Google Web OAuth client. Do not invent one.

4. From `apps/mobile`, set source-target environment:

```sh
export EXPO_PUBLIC_APP_ENV=PREVIEW
export EXPO_NO_DOTENV=1
export TEAM517_NATIVE_PLATFORM=ios
unset TEAM517_ANDROID_MAPS_API_KEY
npx expo-doctor
npx expo config --type introspect
npx expo prebuild --platform ios --no-install
cd ios
pod install
cd ..
npx expo run:ios --configuration Release
```

The Release command is the standalone/no-Metro path; default Debug requires Metro and is a different acceptance target. Match actual APNs signing/entitlements to the intended development or distribution build before enabling push. Do not post full introspection output publicly; native client metadata/config is local by policy. Prebuild/Pods are real first steps on Mac; no generated Xcode workspace was produced on Windows. Keep SDK55 defaults (iOS15.1+); inspect effective deployment target/Podfile properties, static frameworks, real reversed Google scheme and Apple/Push entitlements after generation. Do not use destructive prebuild --clean on unknown native edits. If Pods/Xcode expose a conflict, capture it before making the smallest durable config/plugin fix; do not assume Android success proves compatibility.

5. Run Simulator and test existing Email login; new account/verification/reset/onboarding; Google native login/cancel/link/reauth; logout/account switching; safe-area/keyboard/back controls and account deletion. Do not use another person's social identity. Existing Preview fixture accounts remain unchanged; obtain them privately.
6. Configure actual Apple Developer Sign in with Apple capability/App ID for `edu.cornelltech.team517` and Firebase Apple provider (Services ID/OAuth code-flow credentials as required). Supply actual Team/key/return URLs securely; no values exist in the repository. Rebuild with `TEAM517_APPLE_AUTH_ENABLED=true` only after that real provider setup. Test nonce/token handling and first-only name/private-relay behavior. Final deletion must obtain fresh Apple code, successfully revoke, then remove identity; backend-only `FIREBASE_WEB_API_KEY` / `APPLE_AUTH_REDIRECT_URI` must match actual provider setup. Apple unlink stays unavailable pending that work.
7. Verify Maps uses Apple Maps; no Android Google Maps key/SDK needed on iOS. Exercise denied/granted foreground location contextually; no Always/background permission. Inspect approximate DTOs and privileged arrival clearing.
8. Configure actual APNs signing/capability and upload the team-authorized APNs key/certificate to Firebase iOS Cloud Messaging. Only then rebuild with `TEAM517_IOS_PUSH_ENABLED=true`. Test native APNs→FCM registration, ownership on logout/switch, token refresh, generic background Task/Conversation alerts and authenticated destinations. Never treat the APNs device token as FCM or enable Push as an auth prerequisite. Alert delivery still needs a real signed runtime; Simulator results may not replace physical-device delivery acceptance.
9. Walk all existing Task/Offer/Assignment, Calendar, Notifications, Review, Timeline, Points, Trust, Community and Messaging paths; safe areas, long forms, native datetime, scrolling and keyboard at large fonts. Actual iOS runtime matrix remains pending until observed.

## Physical iPhone / distribution later

Use the correct Apple team, signing/provisioning and physical device trust/Developer Mode as required. APNs, Sign in with Apple, TestFlight/App Store distribution need their actual Apple Developer prerequisites. Increment iOS buildNumber for distributed builds. Do not promise physical install, TestFlight, App Review compliance or production readiness from source config. Preview legal/retention/deletion policy review remains required.

## Optional EAS macOS builder path

`apps/mobile/eas.json` preserves separate development-client, standalone preview, and preview-simulator profiles. Link a real team Expo/EAS project, supply the ignored native service config via team-controlled file environment variables (`TEAM517_GOOGLE_SERVICES_FILE`, `TEAM517_IOS_GOOGLE_SERVICES_FILE`), and real public Google Web client metadata if needed. iOS target selection uses EAS_BUILD_PLATFORM automatically; no Android Maps key required. Development is not standalone Preview.

Only after Kevin explicitly authorizes cloud build/signing workflow, from apps/mobile use the real account/project and appropriate profile, e.g. `eas build --platform ios --profile preview-simulator` for a Simulator artifact or preview for the intended signed internal build. No EAS build, Apple enrollment/purchase or signing credential creation has been run in8H. Local Mac compilation remains a first-class path; EAS is optional, not the sole workflow.
