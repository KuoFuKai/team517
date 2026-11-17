# First Mac compile — frozen Sprint8H handoff

**SOURCE/CONFIG READY; IOS COMPILE PENDING.** Windows config inspection and Android results do not establish CocoaPods, Xcode, Simulator or iPhone success. Start from the exact source commit in [final closure report](sprint-8h-final-closure.md); preserve the separately frozen8G study artifact. No EAS build/signing/enrollment/distribution operation has been run.

## 1. Restore source and tools

On a Mac with Xcode26.2+ and an installed iOS Simulator runtime, finish Xcode first-launch components/license and select its command-line tools. Keep SDK55 defaults (iOS15.1+); verify the generated effective deployment target after prebuild rather than raising it speculatively. Use a compatible installed CocoaPods toolchain.

```sh
# nvm is one option; use your existing Node manager if already configured.
nvm install 22
nvm use 22
node --version                     # must be v22.x
xcodebuild -version
xcode-select -p
pod --version

git fetch origin
# Replace only with the exact reviewed source SHA in the closure report.
git switch --detach 02e6e669ccb6d40941795890dda813acc3ecf56f
npm ci
npm run build -w @team517/contracts
```

Run repository commands from the root unless the command changes directory. Never copy Windows-generated android/ios, node_modules or Gradle caches onto the Mac. Native directories are ignored CNG output; app.config.js/plugins/package-lock are durable source. Do not use `prebuild --clean` over unknown native edits.

## 2. Restore ignored native client configuration

Bundle **edu.cornelltech.team517**, project **team517-dev**, existing Firebase iOS app **1:628775953070:ios:a7428a2e9ad65fb3e9033f**. Do not register another app. Sign in to Firebase CLI with a team-authorized user, then obtain the client plist:

```sh
npx firebase apps:sdkconfig IOS 1:628775953070:ios:a7428a2e9ad65fb3e9033f --project team517-dev --out apps/mobile/GoogleService-Info.plist
# Optional: only if also setting up Android / reusing the existing public Web client metadata.
npx firebase apps:sdkconfig ANDROID 1:628775953070:android:fa5004de1ec54d3be9033f --project team517-dev --out apps/mobile/google-services.json
```

These files stay ignored. If a file already exists, download to a separate local filename and validate project/bundle before replacing only the intended client config. No Admin/ADC, Apple private key or backend environment belongs in mobile. iOS Firebase app identity never falls back to Android.

For an iOS-only checkout, provide the existing real **public Web OAuth client ID** as `TEAM517_GOOGLE_WEB_CLIENT_ID` in the local build shell (the plist's iOS CLIENT_ID is not its substitute). With the existing Android JSON present, app config discovers that Web client automatically. `TEAM517_IOS_GOOGLE_SERVICES_FILE` may point to a local/team-controlled plist file instead of the default. The native Google plugin reads the plist and installs its actual REVERSED_CLIENT_ID callback scheme; do not invent one or modify Android OAuth/package/SHA restrictions.

## 3. Compile first, with Apple login and Push disabled

```sh
cd apps/mobile
export EXPO_PUBLIC_APP_ENV=PREVIEW
export EXPO_NO_DOTENV=1
export TEAM517_NATIVE_PLATFORM=ios
unset TEAM517_ANDROID_MAPS_API_KEY
unset TEAM517_APPLE_AUTH_ENABLED
unset TEAM517_IOS_PUSH_ENABLED
# For iOS-only setup, set TEAM517_GOOGLE_WEB_CLIENT_ID securely as described above.
npx expo-doctor
npx expo config --type introspect   # inspect locally; do not publish full config output
npx expo prebuild --platform ios --no-install
cd ios
pod install
cd ..
find ios -maxdepth 1 -name '*.xcworkspace' -print
npx expo run:ios --configuration Release
# Optional alternative for development with Metro:
# npx expo run:ios --configuration Debug
```

Release is the standalone/no-Metro acceptance target; Debug is a different target. Open the actual `.xcworkspace` returned above in Xcode, not an assumed project name or the `.xcodeproj` that omits Pods. Verify effective deployment target, Podfile/static frameworks, bundle, own iOS Firebase app, reversed Google scheme and entitlements. A Pod/Xcode failure is new evidence: capture it before the smallest durable config/plugin fix; do not patch node_modules or broadly upgrade dependencies. This Windows session deliberately does not rerun unsupported iOS generation.

First Mac session order: **checkout exact source → npm ci → restore plist/Web client → doctor → CNG → Pods → compile Simulator → launch → Email sign-in → Google sign-in → basic Tasks → Maps → keyboard/safe areas.** Ordinary Email/Google/product use must work with Apple/Push flags off. Then inspect other existing flows. Simulator runtime/permission/layout results remain pending until rendered and exercised. iOS Maps uses default Apple Maps and the same safe approximate discovery DTO; foreground location is contextual WhenInUse only, never registration/Always/background tracking.

## 4. Apple login and APNs only after external setup

Apple source is ready for iOS runtime, **not provider-configured or runtime-accepted**. Required external values/configuration:

- Actual Apple Developer enrollment/team and Team ID; matching App ID for edu.cornelltech.team517 with Sign in with Apple capability.
- Real Apple Services ID/OAuth configuration as required by the Firebase code-flow integration; Key ID and protected Sign in with Apple private key; correct registered return/redirect URLs. Configure Firebase Authentication Apple provider with the actual authorized values. None is fabricated or stored in Git.
- For Apple-linked deletion/revocation: matching backend-only `FIREBASE_WEB_API_KEY` and actual HTTPS `APPLE_AUTH_REDIRECT_URI`; freshly issued Apple authorization code, successful configured revokeToken CODE flow **before** account deactivation. Apple unlink remains disabled, so it cannot bypass revocation. Validate actual native code/redirect behavior before release.

After setup, rebuild with `TEAM517_APPLE_AUTH_ENABLED=true`. Test official button/availability, nonce, new/existing-account routing, first-only name/private relay, cancel/link/reauth and fail-closed deletion/revocation on actual iOS. No Apple credentials are required merely to attempt the initial Email/Google Simulator compile with Apple disabled.

For iOS Push, separately provide the real Apple team/signing, **Push Notifications capability**, chosen APNs authentication key (Team ID/Key ID/protected .p8) or appropriate certificate approach, Firebase iOS Cloud Messaging APNs upload/configuration and a signed push-capable iOS runtime/provisioning environment. Confirm intended development vs distribution entitlements. Only then rebuild with `TEAM517_IOS_PUSH_ENABLED=true`; test APNs registration → native Firebase **FCM** token → authenticated backend token registration/refresh/ownership. Never submit raw APNs token as FCM. Android remains on its existing Expo FCM adapter. iOS delivery has not been accepted; Simulator results cannot replace physical iPhone delivery acceptance.

## 5. Physical iPhone / TestFlight later

A real iPhone additionally needs matching signing/team/provisioning/device trust/Developer Mode and actual native acceptance. TestFlight needs appropriate Apple distribution/App Store Connect configuration, increasing buildNumber, internal-test/distribution authorization and product/legal/privacy/deletion-retention review. None follows from compilation. No enrollment, purchase, signing credential creation, upload or submission is authorized/run by this handoff.

## Optional EAS macOS compile

`apps/mobile/eas.json` already separates development-client, standalone preview and `preview-simulator` (extends preview with ios.simulator=true). Local Mac remains the primary path. For an optional EAS Simulator compile, a team-authorized Expo/EAS account/project must first be linked and the ignored native service file supplied through team-controlled file environment variables (`TEAM517_IOS_GOOGLE_SERVICES_FILE`, optionally Android `TEAM517_GOOGLE_SERVICES_FILE`) plus the real public Web client if needed. EAS_BUILD_PLATFORM selects iOS automatically; no Android Maps key is needed.

Only after explicit authorization for the cloud-build workflow:

```sh
# From apps/mobile with the actual authorized EAS project configured:
npx eas-cli build --platform ios --profile preview-simulator
```

A Simulator compile can provide macOS compiler evidence without claiming signing/distribution or Apple/APNs runtime. No EAS build was started here. Paid enrollment, credentials and distribution submission require their own explicit authorization.
