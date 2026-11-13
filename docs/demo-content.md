# Photo-backed fictional demo content — 2026-11-13

Five additional Tasks and five Community Feed posts were created in **team517-dev** through the existing authenticated frontend API clients. No backend/domain/DTO/Firestore security rule or new collection was added. These are fictional coordination examples, not real patients, real assistance, research evidence, medical advice or actual engagement statistics.

| Task | Feed resource | Real-photo cover |
|---|---|---|
| Company for Mom’s appointment | A simple plan for appointment day | Notebook / planning |
| Pick up a few groceries | A small grocery list makes a big difference | Grocery bags |
| Drop off a warm dinner | Leave dinner, not another decision | Prepared meal |
| An easy afternoon walk | Make room for a gentle walk | Park path |
| Return library books together | Company can be the whole point | Books / home still life |

Each Task is published, VOLUNTEER, visible to verified Helpers, scheduled in the coming days and uses only fictional public meeting points. The appointment and grocery Task have actual API-created Helper offers; the other three remain open. No Assignment or payment was simulated. Each new Feed resource has one real seeded like and one real seeded comment through the normal API, not a fabricated displayed count. Three existing synthetic accounts author the five posts.

## Reproduce safely

Use Node22 and the existing secure Preview fixture credential receipt / Android Firebase client configuration, then run from the repository root:

`npm run demo:content -- team517-dev`

The command refuses CI, emulator and other-project contexts under the existing Preview policy. It uses normal authenticated APIs, never reads the external Admin credential file, deletes no records and does not reset Task/Offer history. Repeated runs reuse the five matching records and preserve withdrawal/selection states. Existing unrelated tasks/posts remain intact. Generated `apps/mobile/src/demo/preview-content-manifest.json` contains only public fixture IDs, stock-photo keys and fictional presentation names; rebuild the Preview when its IDs change.

## Photo implementation and provenance

The existing Feed had an illustrative empty media area and no general media-upload contract. These five covers are bundled offline assets, associated **only with exact seeded public IDs**, in development **PREVIEW/team517-dev**. Unknown IDs, LOCAL/other projects and redacted/unavailable/private posts do not receive these decorations. Fictional author names apply only to the exact public fixture post and expected synthetic author; ordinary profiles/aliases and authorization are unchanged. This is presentation support for the seeded content, not a claim of a general upload feature.

Covers appear on owner Task rows/details, Helper discovery cards/details, Feed posts and resource detail. Map preview remains compact and uses the same privacy-safe DTO; no photo expands the Map/Assignment location boundary. New Feed photos replace the old placeholder; posts without a cover simply have no empty media block. No new dependencies or native permissions were introduced.

Five real photographs were downloaded from source pages marked free under the [Unsplash License](https://unsplash.com/license), with provenance stored in [credits.json](../apps/mobile/assets/demo-content/credits.json). They illustrate the content; they are not photographs of these fictional families, appointments or NYC meeting points.

| Asset | Photographer | Source |
|---|---|---|
| books.jpg | Priscilla Du Preez | https://unsplash.com/photos/l113LHLKaYc |
| groceries.jpg | Maria Lin Kim | https://unsplash.com/photos/8RaUEd8zD-U |
| meal.jpg | Mahadev Ittina | https://unsplash.com/photos/thrL1vpNO9U |
| park.jpg | Valerie | https://unsplash.com/photos/WBdUSZFP6ks |
| planning.jpg | Clay Banks | https://unsplash.com/photos/n9AaeihA9HI |

## Observed validation

Node22 typecheck PASS; backend22/22, client91/91, integration92/92; Functions smoke, default HTTP, AI mock HTTP and Android Hermes export PASS. Two focused tests cover exact-ID/project isolation and author/redaction boundaries. Seed rerun reused the five Task/post IDs and did not duplicate comments/likes. Android standalone Preview release build PASS.

Actual Pixel_9_Pro / Android16 / API36 renders were inspected: photo-backed owner Tasks with real offer states; Task detail; Helper discovery cards; Feed with fictional names, real photos and real like/comment controls; natural scrolling. Evidence: [Feed](native-evidence/2026-11-13-demo-content/feed.png), [Task](native-evidence/2026-11-13-demo-content/task.png). Only system bars were cropped. No new physical-device photo acceptance is claimed unless the phone is reconnected and tested separately.

New data is already on the cloud project. Existing installed APKs can fetch the text, but **must be updated to the photo-enabled APK** to display bundled covers. Latest artifact: `artifacts/android/team517-preview.apk`, SHA-256 `3f6d373eef906a4544974e95f0b7a7beeb86d500f1d5412a9dba59b14ab9c7ba`. It preserves the existing Maps configuration and real cloud Auth/API/FCM; no Metro or Firebase emulator is required by Preview.

## 2026-11-13 photo content: emulator acceptance follow-up

Target: Pixel_9_Pro, Android 16 / API 36, emulator-5554 (`device`). All five seeded Task details were opened with their corresponding photographs; all five Feed posts were rendered and reached through native scrolling. Release update and cold relaunch retained the existing signed-in session.

One MEDIUM issue was observed: RESOURCE post detail rendered the same photograph twice, pushing comments down. The duplicate post cover was removed only in detail mode; the resource card and Feed retain their photographs. The corrected release APK was installed and exercised: one detail photograph, comments and input reachable by scrolling, Android Back returns to Feed with its cover intact. No BLOCKER/HIGH issues were observed in this focused photo acceptance. No data mutations or backend changes were needed.

Post-fix Node 22 typecheck and client tests (91/91) PASS; Android release build/Hermes bundling PASS. The preceding full photo-content regression remains PASS (backend 22/22, integration 92/92, smoke/default HTTP/AI mock flows, standalone Hermes export). This follow-up does not claim a new full lifecycle, keyboard, GPS or Maps acceptance run.

The user deferred physical-phone testing while away. The corrected APK is not yet accepted on vivo; emulator results are not physical-device results. Artifact: `artifacts/android/team517-preview.apk`, SHA-256 `3f6d373eef906a4544974e95f0b7a7beeb86d500f1d5412a9dba59b14ab9c7ba`.