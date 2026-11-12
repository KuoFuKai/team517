# Design alignment — batch 1, November 12, 2026

Implemented the first bounded slice of the [alignment plan](figma-alignment-plan.md): role-aware shell and receiver Tasks / By status. The user explicitly approved **PDF-based implementation with approximate fonts/icons** after fresh Figma context requests remained quota-limited. Reference: supplied Figma PDF pages 4, 11, 16–17; detailed audit/source limits remain in the plan. No pixel-perfect claim.

## Changes

- Compact context/role heading and notification bell replace the technical brand/role stack and full-width Inbox action. Receiver context opens the existing circle selector; Helper context opens Me for the existing role switch. The bell opens persistent Notifications rather than conflating them with Messages.
- Receiver navigation: **Tasks / Community / Post / Circle/Msg / Me**. Helper mode: **Tasks / Community / Find / Messages / Me**. Navigation uses current UI mode, not global HELPER membership; authorization still uses actual backend roles/relationships.
- Calendar is reachable through a **Calendar / By status** segmented control within Tasks. The existing functional agenda is preserved; the reference month grid is **not implemented in this batch**.
- Receiver tasks use compact tappable rows grouped by real lifecycle status, with draft/history access retained. Needs-choice counts are Task counts. The existing summary DTO does not supply Offer counts, so no invented “2 offers” text is shown.
- Refresh, location management and the secondary Post action move to an accessible Task options menu. The central Post button uses the existing draft API/editor. One Post intent shares its pending draft request across repeated taps/notification remounts, restores its server draft ID and returns to Tasks after saving. Failed creation can be retried; this is not a new server-side idempotency guarantee or an assertion that arbitrary unsaved form fields survive every navigation path.
- Bundled Feather icons replace Unicode navigation glyphs. Existing installed `@expo/vector-icons` 15.1.1 and `expo-font` 55.0.8 are now explicit mobile dependencies for clean clones. They approximate the reference; they are not original Figma exports. System font remains, not an invented exact font match.
- Fixed the pre-existing mobile typecheck failure in the index-regression test by using Node's URL type rather than the incompatible global React Native URL.

No backend/API/domain/Firestore rules or deployed Function changes. No Maps/GPS, payment/Points ledger, real AI/verification or iOS work. Existing manual/AI Task APIs, Offer/Assignment flow, location projections and persistent Notification architecture remain intact.

## Actual native verification

Target: **Pixel_9_Pro / emulator-5554, Android 16/API 36, x86_64**, adb device. Final standalone APK installed successfully; cloud Auth restored. Metro/local Firebase ports were stopped and adb reverse was unused. Only synthetic team517-dev fixtures were touched.

| Rendered / exercised | Result |
| --- | --- |
| Receiver Tasks | Compact rows, status groups and five receiver navigation entries rendered |
| Drafts / History | Existing records remained reachable; final draft list showed four real drafts, including the two labelled native test saves |
| Post | Repeated Post taps kept the editor; native title entry, keyboard dismissal, long-form scrolling and Save draft succeeded |
| Post → Notifications → Android Back | Returned to the same server draft; did not create an extra draft; final save returned to Tasks |
| Task options / Locations | Existing location management reachable from the new utility menu |
| Calendar | Segmented entry opened existing local-time agenda; not reference month-grid acceptance |
| Receiver Circle/Msg | Existing circle selector and Messages action reached Inbox |
| Role switch / Helper shell | Same manager account switched to Helper UI; correct five entries and direct Messages tab rendered; requester preference restored afterward |
| Real FCM regression | Synthetic peer Message produced generic Android background alert; tapping opened the authenticated Conversation in the final shell |
| Safe areas / icons | New navigation and bundled icons visually inspected on this AVD; no physical-device claim |

The cloud synthetic drafts `PDF alignment native draft` and `PDF alignment navigation check` remain deliberately. No main clinic Task was published or lifecycle history reset. The peer Message was sent through the normal cloud API, not a fake push endpoint. Full all-screen keyboard, confirmation/execution, permission-denial, process-absent push and physical-phone acceptance were not repeated in this visual batch; historical evidence retains its own scope.

## Validation

Node 22 / Java 21: typecheck passed; **22 backend unit, 49 mobile/client, 92 emulator integration** passed; default HTTP and explicit AI-mock HTTP passed (including Community/Messaging/Notification regressions); final Hermes export passed; frontend business Firestore boundary scan had zero matches. Initial Functions smoke hit the known startup source-discovery `fetch failed` / health 404; isolated retry passed health 200/protected 401. No backend workaround was added.

Full-suite logs: `.tools/design-batch1-*`; final focused checks `.tools/design-final-{typecheck,client,export}.log`, smoke retry `.tools/design-batch1-smoke-retry.log`. The original aggregate retains that initial smoke failure; the successful retry supersedes it. Later Post-guard/UI refinements were checked with final typecheck/client/Hermes and actual native tests. Fresh root audit: **28 advisories: 1 low / 20 moderate / 7 high / 0 critical**. No forced upgrades; hosted CI was not observed.

## Updated APK

Local ignored artifact: `artifacts/android/team517-preview.apk`, **39,990,716 bytes**.

SHA256: `8510aff3478725df1ad33057684b79c620ae4578082eda856410d094242efaa2`.

Same package/internal signing identity as existing Preview; install as an update. It bundles JS, uses team517-dev cloud services and requires no Metro/local emulator at runtime. Physical installation and disconnected-USB/laptop-closed acceptance remain pending. This is not production/store distribution. Batch 1 was subsequently pushed by explicit user request at `aaf7297`; hosted CI passed. Later Calendar work is documented in batch 2.

## Remaining alignment

Receiver Tasks composition and the role shell are changed; Calendar month grid, dedicated role-switch composition, Task/AI forms/detail, Offers/Assignment cards, Discovery body, Community, Messaging composer and Me body still need their planned batches. Existing helper hero/cards and supporting-screen duplicate headings are pre-existing out-of-scope mismatches, not claimed aligned. Original Figma font/assets, matching viewport/data fixtures and physical-phone review remain needed for stronger visual acceptance.

[Before / PDF / after](native-evidence/2026-11-12-design-batch1/tasks-before-reference-after.png) · [Native evidence](native-evidence/2026-11-12-design-batch1/README.md)
