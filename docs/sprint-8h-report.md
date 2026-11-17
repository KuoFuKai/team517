November16 physical continuation: see [consolidated vivo matrix](physical-8a-8h-report.md) and [actual physical evidence](native-evidence/2026-11-15-vivo-8a-8h/README.md). Native core lifecycle/Points/Trust/privacy/Community/Messaging/Maps/FCM, disposable Email onboarding/deletion and Kevin-operated real Google/cold persistence executed; unplugged checklist all successful by Kevin report. No product/backend change. Extended provider-link/mailbox/iOS/runtime variants and8G human study remain pending. Earlier numbered checkpoints below retain their original dates/scope.

# Sprint8H — Authentication, registration and iOS source readiness

November15,2026. [Auth](authentication.md) · [Deletion](account-deletion.md) · [iOS matrix](ios-readiness.md) · [Mac handoff](ios-build-handoff.md) · [Native evidence](native-evidence/2026-11-15-auth/README.md) · [Build receipt](auth-build.json).

1. **Starting main.** 6727e94bc4a867fb040641ca7390b265b1f568f7.

2. **Work branch.** codex/sprint-8h-auth-ios-readiness; main is unchanged by8H.

3. **Kingsley changes.** Inspected existing brand/brand-system/schedule-picker heads; no incoming main changes during8H checks; preserve prior integration.

4. **Conflicts.** No merge conflicts; no force/reset/clean.

5. **Architecture.** Native credentials → Firebase JS Auth → Firebase ID token → existing authenticated HTTP API → services/repositories → Firestore. UID remains business identity.

6. **Landing.** 517 logo, palette, Fraunces/Inter; Google/Email/Create account; visible Preview Privacy/Terms. Actual Android rendering recorded.

7. **Email sign-in.** Existing Firebase password sign-in retained; explicit validation/error/loading/show-hide; legacy Alex login rendered on earlier8H candidate.

8. **Registration.** Real Firebase email/password signup; fictional account actually reached native verification/onboarding on finalAPK. Android password-manager save declined.

9. **Verification.** Real Firebase action requests and emulator OOB consumption tested; native quality panel rendered. Real mailbox delivery not tested; no authorization privileges from email verification.

10. **Resend.** 60-second reservation before async call, reload/check action; focused tests. Real inbox receipt not claimed.

11. **Reset.** Generic enumeration-safe response, actual Firebase request; real emulator OOB reset consumed. Native reset matrix separately scoped.

12. **Google package.** react-native-nitro-google-signin2.3.1, Nitro Modules0.37.1; modern Android Credential Manager. Original17 package evaluated, not installed.

13. **Actual Android Google.** Kevin entered own identity in system UI. Agent observed onboarding, completed public first-name/ordinary-role setup and Google — Connected. Corrected0193APK retained Auth after update/force-stop/relaunch; Connected reobserved. Private identity excluded from evidence.

14. **Google iOS.** Real Firebase iOS app/plist/reversed scheme + native plugin prepared; no Mac compile/native iOS login yet.

15. **Apple package.** expo-apple-authentication55.0.17; expo-crypto55.0.19.

16. **Apple capability.** usesAppleSignIn true, official native button, availability/config guards; random nonce SHA256 to Apple/raw nonce to Firebase. Button disabled/hidden by default until actual provider setup.

17. **Apple Firebase.** PENDING: Kevin reports no Apple Developer/Sign in with Apple configuration. No credentials invented.

18. **Apple runtime.** PENDING iOS runtime; no successful login/revocation claimed.

19. **Facebook.** No real Meta configuration; no placeholder login button.

20. **Linking.** Explicit fresh native credential, linkWithCredential/reauthenticateWithCredential on captured same UID; collision recovery via existing sign-in method then Account. No cached OAuth replay.

21. **Duplicates.** No app-side email merge, email business lookup or UID migration; Firebase owns provider credential validation. Collision/UID fencing covered in tests.

22. **Provider UI.** Me → Account and sign-in methods. Connected status, explicit connect/unlink. Never remove last method; Apple unlink disabled pending revocation. Available even before onboarding.

23. **Onboarding.** Only public first name and Need help/Want help/Both; separate existing Care Context creation. Native Google and fictional Email onboarding exercised.

24. **Roles.** Ordinary CARE_MANAGER/HELPER only; additional ordinary role via API. No membership, verification/admin or Points self-grant. lastActiveRole remains preference.

25. **Existing users.** Existing profiles not forced through new-user setup; no passwords reset or business records migrated. Legacy Alex Auth/profile/Points rendered on earlier8H candidate.

26. **Logout/cache.** Captured-user push cleanup, bounded native cleanup then Firebase signout; UID changes reset navigation/auth data and queued private routes; initial cold notification retained.

27. **Deletion.** In-app DELETE + recent Firebase auth; backend auth_time check; active commitments/reserved Points guard. Durable DELETING tombstone and idempotent retry worker. Real Auth/Firestore integration and real dev-cloud selfdeletion passed; native pre-onboarding DELETE + recent-password flow displayed Account deleted; clean result screenshot is in the native matrix.

28. **Apple revocation.** Source supported revokeToken CODE path, requires fresh Apple provider proof and configured backend redirect/key. Fail closed before deactivation. Runtime pending Apple setup; no bypass via unlink.

29. **Retention.** Clear public name/roles/verification, owned tokens and Auth identity; retain pseudonymous shared history/audit/immutable ledger to avoid corruption. Production content-retention/legal/active-responsibility policy unresolved; see account-deletion.md.

30. **iOS bundle.** edu.cornelltech.team517; Android unchanged; version0.2.0/build2.

31. **Firebase iOS.** Actual team517-dev app registered:1:628775953070:ios:a7428a2e9ad65fb3e9033f.

32. **Plist.** Actual local GoogleService-Info.plist obtained; ignored/not committed. iOS JS appID selected independently, never Android fallback. Admin credentials never embedded.

33. **URL schemes.** Real Google reversed scheme from plist, config introspection verified. Native callback runtime pendingMac.

34. **Location.** WhenInUse only; Always/background flags explicitlyfalse. No registration-time location request.

35. **iOS Maps.** Default Apple Maps; same coarse DTO/privacy. Android Google Maps retained; iOS-target config omits Android Maps key.

36. **FCM/APNs source.** iOS-only RNFirebase App/Messaging26.0.0; actual FCM token obtained after APNs registration, raw APNs never submitted as FCM. Build flag off pendingsetup. Android excluded from bridge and retains Expo FCM.

37. **APNs prerequisites.** Actual Apple team/capability/signing/APNs key upload to Firebase and signed runtime delivery still required.

38. **Safe areas.** Shared SafeAreaProvider/View retained; Android responsive captures recorded. No iPhone safe-area acceptance.

39. **Keyboard.** Existing scroll/KeyboardAvoidingView architecture retained; native fictional-name/password and Message input/send exercised; IME capture did not establish a docked keyboard. No iOS/floating-keyboard acceptance inferred.

40. **Back.** Visible Auth Back and Android hardware handler; actual visible Back/scroll in responsive matrix. All iOS native navigation remains pending runtime.

41. **Native dependency audit.** RNFirebase26 iOS CocoaPods/Firebase Apple12 line chosen; Android bridgeexcluded. No RNFirebase Auth/Firestore. See ios-readiness.md fullpackage matrix.

42. **Doctor/config.** Expo doctor20/20 at recordedcheckpoint; actual config introspection verified Firebase identities/schemes/permissions. Credential-free LOCAL export omits unconfigured Google plugin, PREVIEW remains strict.

43. **iOS prebuild.** Windows explicitly skipped iOS generation; no generated nativeproject/Pods/Xcode success.

44. **Mac handoff.** ios-build-handoff.md: Node22/npmci/contractsbuild, actual ignorednativeconfig, Xcode26.2+, SDK55 defaults, CNG/podinstall/Release simulator; inspect effective target beforeclaim.

45. **EAS.** Optional path documented; no cloudbuild, paid enrollment or signingcredential generation authorized/run.

46. **Android responsive.** Actual 320/360/390/412dp font1.0/1.3 Auth landing/signup/scroll/Back matrix recorded in native evidence; it does not imply every Auth action at every size.

47. **Standalone regression.** FinalAPK installed successfully, Google Auth retained afterupgrade/coldlaunch, GoogleConnected rechecked, fictionalEmail signup/onboarding/logout exercised. Physical phone absent; Final0193 existing Alex login/cold persistence, Me/Trust summary, private wallet570/0reserved and history scroll/Back, native Map tiles/markers, actual Task+Message background OS alerts/taps and native Message send passed. Full lifecycle/physical/native real-mailbox matrix retains separate pendingitems.

48. **APK.** 0193d2e8223b7494185074dbe375376fedc23a58d5fda37d5e7b8654a242c235; builtfromb0de62ba48889874ce3e122d899be0e28c399101; docs/auth-build.json. Later repository/config/test edits do not alter bundledJS. Frozen8G hash/source unchanged.

49. **Backend units.** 40 passing in recorded finalrun.

50. **Client tests.** 139 passing after credential-freeexport regression added.

51. **Integration.** 134 tests; original acceptedrun134/134. Final rerun status and transient failures documented in validation.md; do not conceal failedattempts.

52. **Other validation.** Typecheck, smoke, default/manual HTTP, mockAIHTTP, Hermes all passed finalrun. Boundary/secrets scans documented in validation.md. Real dev-cloud Authsmoke passed registration/zeroPoints/zeroContexts/actions/deletion/oldtokenrejection.

53. **Advisories.** 30 total:1low20moderate9high0critical. Added RNFirebase package entries inherit existing Firebase/Firestore/grpc advisorychain; no npm auditfix --force or unrelatedmajorupgrade.

54. **Commits/pushes.** Dedicated featurebranch batches cc266e0 through93f0b2a; gitlog records intermediate build/registry fixes. Main and8G frozenartifact untouched.

55. **Hosted CI.** 93f0b2a: success https://github.com/KuoFuKai/team517/actions/runs/43760592623 ; documentation checkpoint cff76e7 also passed https://github.com/KuoFuKai/team517/actions/runs/43765777730 . Prior1cf9bc6 failed missingnativeconfig on credential-freeexport; fixed and regressiontested, not hidden.

56. **iOS READY/PENDING.** Source/config ready for firstMac attempt; compilation, runtime, Applelogin/revocation, APNs, physical/distribution remainPENDING. Full matrix ios-readiness.md.

57. **Scope closure.** Source/config implementation prepared; complete cross-platform/native acceptance is NOT closed. Remaining Android nativeitems and iOS external/runtime prerequisites remain explicit.

58. **Before Simulator.** Mac/Xcode26.2+/runtime, Node22/npmci/contractsbuild, real ignoredplist/publicWebclient, CNG/podinstall; resolve any actual compileerrors. Email/Google can be tested before Apple/APNs setup.

59. **Before iPhone/TestFlight.** Actual Apple team/enrollment/signing/provisioning, Google/Apple provider setup, APNs/Firebase configuration, physicaldevice acceptance, legal/deletion policyreview and explicit distributionauthorization.

60. **Next step.** Complete remaining auth/native matrix and firstMac compilation, then the consolidated physical8A–8H checklist and pending8G humanstudy. Do notstart unrelated Payments/matching/tracking features.

Firebase UID remains the business identity. Social providers add no parallel backend; accounts are not silently merged by email. Signup grants no verification/admin/Points. Apple runtime and macOS compilation are not claimed. Maps/location privacy and Points/Trust rules are unchanged; no Payments work was started.
