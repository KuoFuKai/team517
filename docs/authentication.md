# Authentication — Sprint 8H

Firebase Authentication remains the identity/session authority. Native Google/Apple return credentials to the Firebase JS SDK; business requests still carry a Firebase ID token to the existing HTTP API. Firebase UID, never email/name/provider subject, keys Tasks, Offers, Assignments, Points, Trust and Messages. No second auth backend or mobile business-Firestore writes.

## User experience / identity

The 517 landing uses the existing logo, palette, Fraunces/Inter, responsive controls, Email/Google, registration and visible Preview Privacy/Terms routes. Android never offers Apple. iOS uses the actual `expo-apple-authentication` native button only after platform availability succeeds and actual provider setup is enabled through `TEAM517_APPLE_AUTH_ENABLED=true`. Unconfigured Apple is hidden, with Email/Google fallback. Facebook is absent: no real Meta configuration was supplied/found. Future credential adapters fit the same provider boundary; no fake provider credentials/buttons.

Email registration collects only email/password. Firebase owns credentials; no password logging/storage in app code. Show/hide is accessible, minimum6 characters is explained, duplicate writes are locked. Reset uses generic account-existence-safe copy. Verification is onboarding/account quality, **not** marketplace identity verification and not a new authorization gate. Existing Preview users remain valid even when email is unverified or legacy onboardingStatus is STARTED. Explicit resend/reset calls reserve a60-second cooldown before the async request; cancellation/network errors retain usable navigation.

For genuinely missing application profiles, onboarding asks public first name (existing safe Unicode first-name policy) and Need help / Want to help / Both. Backend maps to ordinary CARE_MANAGER / HELPER roles; other normal roles can be added later. This creates no Care Context membership, VERIFIED status, admin rights, reviews or Points grant. Existing Care Context creation remains separate. Existing profile existence, not social-provider “new user” metadata, determines routing.

New backend contracts: `POST /api/v1/me/onboarding`, `POST /api/v1/me/roles`, `POST /api/v1/me/delete-account`. Public DTOs only; strict request schemas reject privilege fields. `lastActiveRole` remains navigation preference, never authority.

## Native provider choices

Google: `react-native-nitro-google-signin`2.3.1 + Nitro Modules0.37.1. Its Android Credential Manager flow fits SDK55/RN0.83 and the actual Android build; iOS uses native Google Sign-In with real plist/reversed scheme. Evaluated alternative `@react-native-google-signin/google-signin`17.0.0; did not choose its legacy Android route. See [Expo Google guidance](https://docs.expo.dev/guides/google-authentication/) and [chosen SDK configuration](https://github.com/react-native-nitro-google-sign-in/google-signin). No legacy browser OAuth shortcut or new backend Google-token authorization.

Google is enabled in team517-dev (Kevin confirmed, API metadata checked). The actual existing Preview certificate SHA-1 `5e8f16062ea3cd2c4a0d547876baa6f38cabf625` was registered on Android app `edu.cornelltech.team517`; refreshed local SDK config contains Android and Web OAuth clients. No OAuth restriction weakened. Kevin completed real account entry in Google’s system UI. On November15 the API36 Android emulator rendered new-user onboarding, completed fictional public-name/ordinary-role setup, and showed Google — Connected. The corrected standalone APK retained that session after update and force-stop/relaunch; Connected was observed again. Private Google identity/screenshots are excluded from committed evidence. This is Android-emulator evidence, not iOS or physical-phone acceptance.

Apple: `expo-apple-authentication`55.0.17 and `expo-crypto`55.0.19 resolved using Expo install.32 random cryptographic bytes form a nonce; Apple receives SHA256, Firebase receives identity token + raw nonce. Email/name/Apple user ID alone never authenticate. Optional first-authorization given name remains transient, is associated with the successfully authenticated UID, and is only a suggestion for explicit profile onboarding. Later logins may return neither name nor email; private relay is accepted normally. [Firebase Apple nonce/revocation guidance](https://firebase.google.com/docs/auth/ios/apple).

Kevin has no Apple Developer/Sign in with Apple credentials configured. Capability/source exists; Firebase Apple provider and real native login/revocation are **PENDING APPLE SETUP / iOS RUNTIME**. No Team ID/key/Services ID was invented.

## Linking / account management

Me → Account and sign-in methods shows Connected methods without OAuth tokens/internal provider IDs. Explicit `linkWithCredential` and `reauthenticateWithCredential` operate on the existing Firebase user and assert the same UID. Email linking uses Firebase's Email credential API. No application code queries/joins business data by matching email, silently migrates another UID, or merges two business identities. Firebase remains responsible for credential validation and its configured provider trust/collision behavior.

On a provider collision, show recovery: authenticate with the existing method, then connect the other method from Account using fresh authorization. No pending OAuth credential is persisted or automatically replayed. Already-linked/provider-in-use failures are clear, user cancellation is quiet, and account changes during an open dialog fence late credentials. Never leave zero sign-in methods. Apple unlink is deliberately unavailable until revocation is configured, so unlink cannot bypass the deletion revocation requirement. See [Firebase account linking](https://firebase.google.com/docs/auth/web/account-linking).

Logout performs existing push ownership cleanup with captured identity, bounded native-provider cleanup and Firebase sign-out. UID changes unmount/reset auth-scoped navigation/data; existing execution/location invalidation remains. No wallet/chat data is used as identity or copied to a new account. A provider account switch is a real Firebase session change, not a role switch.

## Configuration / test boundaries

`google-services.json` and `GoogleService-Info.plist` remain ignored local native client config. Backend Admin credentials/private keys are never included. iOS uses its own Firebase app ID via platform selection; it cannot silently fall back to Android's app ID. Google Web client ID can come from the real Android SDK config or `TEAM517_GOOGLE_WEB_CLIENT_ID` (public OAuth metadata). [iOS handoff](ios-build-handoff.md) documents iOS-only setup.

CI uses real Auth/Firestore emulators for signup, verify/reset, provider UID linking, account onboarding/deletion and ordinary Firebase-token API access. Only provider acquisition is faked in focused adapter tests; no Google/Apple UI automation or real credentials in CI. Real email inbox delivery, actual Google sign-in, and Apple runtime each require separately recorded acceptance. Email action links open Firebase's browser handler; return to the app and check verification. No passwordless email-link auth was added.

Preview Privacy/Terms are explicitly development information, not invented production legal promises. Public distribution requires actual legal/contact/retention review. [Deletion policy](account-deletion.md), [platform readiness](ios-readiness.md), [validation](validation.md).

Credential-free LOCAL Hermes export omits the Google native config plugin when neither native service file exists; it does not invent OAuth settings. PREVIEW still requires real Firebase configuration and provider availability still requires its actual Web client ID. Root @firebase/app0.15.0 and client Firebase12.15.0 keep the HTTP test harness/client registry coherent; Functions explicitly declares its test client dependency. Keep these aligned on upgrades.
