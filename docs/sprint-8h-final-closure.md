# Sprint8H final continuation — Auth edges and iOS handoff

November16,2026. **IN PROGRESS: controlled Google linking and final layout/runtime checks.** This is the delta to the authoritative [original8H report](sprint-8h-report.md), not a new product Sprint. Prior [physical core acceptance](physical-8a-8h-report.md) and frozen8G study artifact remain separately valid for their exact binaries. No iOS compile/runtime pass is inferred from Windows inspection.

|#|Requested result|Evidence / status|
|---|---|---|
|1|Starting origin/main|6727e94bc4a867fb040641ca7390b265b1f568f7, freshly fetched.|
|2|Work branch|codex/sprint-8h-auth-ios-readiness; started37e27dc, clean and synced.|
|3|Contributor branches|Kingsley brand7a86da8/1888ec8 unchanged; schedule-picker913b914 (Nov12) remains unmerged and unrelated to this Auth scope; inspected diff, did not remove current native datetime/iOS adapter. No incoming main/8H commits.|
|4|Conflicts|None; no force/reset/clean or contributor overwrite.|
|5|Physical Google baseline|Preserved: vivo/API34 real user-operated Google + Connected/cold persistence, original0193APK/85PNG evidence unchanged. Current phone absent; new tests use API36 emulator.|
|6|Email→Google link|PENDING user-controlled native authorization.|
|7|Multi-provider unlink|PENDING runtime.|
|8|Last-provider protection|Prior native Email-only/Google-only disabled controls preserved; source canUnlink and tests pass; new runtime checks pending.|
|9|Cancel|PASS new candidate: Kevin cancelled actual Google linking UI; Account returned naturally with no scary error, password-only provider/UID/business snapshot unchanged. Focused tests cover all3 intents and Google/Apple cancel codes.|
|10|Collision|PENDING native case; source/tests forbid silent merge, cached credential replay and business lookup by email. Separate fictional Casey baseline prepared.|
|11|Same UID|Before/cancel/mailbox verified snapshots share fingerprint48cb3c1b95e6; actual link comparison pending. Full UIDs remain in ignored local receipts.|
|12|Business preservation|Robin and Casey normal authenticated API baselines: profile/ordinary roles/0wallet/Trust/context/unpublished Task ownership captured; no business document writes outside APIs. Linking comparisons pending.|
|13|Reauth|Password native baseline preserved. Source/unit: correct intent, same UID before/after async completion, stale-session rejection and last-provider protection pass. Google runtime pending; session age will not be manipulated.|
|14|Verification redemption|Real request accepted; Kevin redeemed actual mailbox link; Firebase lookup emailVerified=true under same UID, business unchanged. New native Email login loaded Account with quality panel no longer required. No Helper verification privilege granted.|
|15|Reset redemption|PENDING actual mailbox link. Existing request/OOB logic remains passing.|
|16|Verification label|Only “Check verification” replaces long check label; no global text shrinking.320/360/390/412dp font1.3 rendered recheck pending.|
|17|Apple source|READY FOR IOS RUNTIME: official iOS-only button/availability/config guard,32random-byte nonce/SHA256 Apple/raw Firebase, existing-profile routing and explicit link/reauth/cancel preserved.|
|18|Apple external setup|Actual Team/App capability/Services ID/Key ID/protected private key/Firebase provider/registered return URL configuration missing; none invented.|
|19|Apple revocation|Source/unit fail closed: fresh Apple proof and configured successful CODE revocation required before deactivation; Apple unlink disabled. Actual code/redirect/provider runtime pending iOS + credentials.|
|20|iOS Firebase app|Resolved existing app1:628775953070:ios:a7428a2e9ad65fb3e9033f; bundle edu.cornelltech.team517; own iOS identity, no Android fallback.|
|21|Plist|Correct existing local ignored team517-dev plist verified; not recreated/copied to Git.|
|22|Google iOS config|Real plist CLIENT_ID + existing public Web client internally consistent; installed SDK reads native CLIENT_ID from plist. Android OAuth/package/SHA unchanged.|
|23|Google scheme|Resolved reversed scheme matches actual plist; callback runtime still pending.|
|24|Maps|Android Google retained; iOS default Apple provider, no Android key on iOS target; same coarse DTO/privacy.|
|25|Location|WhenInUse only, no Always/background-location keys; no registration request/tracking/history.|
|26|iOS Notifications|Existing iOS-only RNFirebase26 bridge preserved; APNs registration→FCM token→backend; raw APNs never submitted as FCM. Android Expo FCM unchanged. Build flag off pending setup.|
|27|APNs|Needs Apple team/capability, chosen key/cert, Firebase APNs upload, appropriate signing/provisioning and actual signed runtime. No delivery acceptance.|
|28|Dependency delta|None; package/lock unchanged, existing classifications retained for NitroGoogle/Apple/Crypto/RNFirebase/Maps/Location/datetime/safearea/gestures/fonts.|
|29|Doctor|Node22 Expo Doctor20/20 again.|
|30|Resolved config|PREVIEW Android and iOS introspection/checks passed; identifiers/plugins/Google scheme/Firebase/foreground permission/Maps separation validated locally. Full configs stay private.|
|31|Generation boundary|Windows: no repeated unsupported iOS generation; Pods/Xcode/native compile NOT RUN. MAC REQUIRED.|
|32|Mac handoff|Rewritten compile-first with exact source/tool/client-config/CNG/Pods/workspace/Release+Debug commands and staged runtime checks.|
|33|Optional EAS|Existing preview-simulator profile verified; documented optional authorized macOS builder, not executed or enrolled/signed/submitted.|
|34|Focused Android regression|New standalone candidate installed preserving existing session. Remaining focused native/layout checks in progress.|
|35|Android artifact|[New receipt](auth-closure-build.json): c6c15559671a668916c79d59b571fd0c349592bdf965363bb133e96f00428dd7, source02e6e669ccb6d40941795890dda813acc3ecf56f. Prior8H and frozen8G binaries/evidence unchanged.|
|36|Backend tests|40/40 local and same-source hosted CI pass.|
|37|Client tests|141/141 local/hosted pass (baseline139 + two meaningful edge regressions).|
|38|Integration|Same-source hosted Node22 Linux134/134 PASS. Local startup blocked by new Windows9198–9297 exclusion including Auth9199; tests did not run locally. No port/reservation change.|
|39|Other validation|Local typecheck/Hermes pass; hosted smoke/default/manualHTTP/mockAIHTTP/Hermes all pass. Business-Firestore/email-merge scans0matches; secret preflight findings[].|
|40|Advisories|Fresh29:0low/20moderate/9high/0critical. Previous low deepmerge advisory absent from latest registry result; no dependency/lock change or force fix.|
|41|Commits/pushes|02e6e66 focused UID race fence + verification copy/tests pushed; source freeze/docs batch tracked separately at completion.|
|42|Hosted CI|[02e6e66 SUCCESS](https://github.com/KuoFuKai/team517/actions/runs/43994413125), full Node22 suite. Final evidence/docs CI recorded at completion.|
|43|iOS matrix|SOURCE/CONFIG READY; compile/Pods/Xcode/Simulator/iOS Google/Apple/APNs/physical/distribution PENDING.|
|44|Before first compile|Mac+Xcode/Simulator/tools, exact source/dependencies, ignored plist and real public Web client. No known unimplemented application/config requirement found.|
|45|Before Simulator acceptance|Actual successful CNG/Pods/Xcode compile/launch and rendered Email/Google/basic Tasks/Maps/keyboard/safe-area checks.|
|46|Before Apple runtime|Real Apple Developer/provider/capability/key/return URL config + iOS runtime; enable build flag/rebuild only then.|
|47|Before iOS Push|Actual Apple team/signing/capability/APNs upload + push-capable signed runtime; enable build flag/rebuild then test FCM ownership/delivery.|
|48|Before physical iPhone|Matching signing/provisioning/device trust/Developer Mode and actual device execution.|
|49|Before TestFlight|Distribution/App Store Connect/team/provisioning/buildNumber/internal-test authorization and product/legal/privacy/deletion-retention review; no submission performed.|
|50|Source/config closure|PENDING final runtime/layout review; no known source blocker found in freeze audit.|
|51|Required closure statement|Withheld until remaining feasible runtime/layout checks finish; compiler/runtime/credential boundaries above remain genuine, not assumed passes.|
|52|8G human study|PENDING Yiru/Kingsley unaided study; no invented P0/P1/P2 and frozen artifact not rewritten.|

Firebase UID remains the business identity. No automatic email merge, new Points/Trust/Task identity on linking, signup verification/admin/Points grant, Payments work, Maps/privacy change or Points/Trust semantic change. Android Google acquisition SDK/config are unchanged. Apple runtime and iOS compilation are not claimed without their actual execution.
