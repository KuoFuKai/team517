# Design alignment — batch 2: functional Calendar

November 12, 2026. The requested first-batch push completed at [`aaf7297`](https://github.com/KuoFuKai/team517/commit/aaf7297f4459c0d932feeb8d300ce4d609814bf4); its [hosted Node 22 CI passed](https://github.com/KuoFuKai/team517/actions/runs/43251108709). This follow-up implements the missing Tasks Calendar month grid and compact daily agenda using the previously approved PDF approximation (reference PDF page 2). Months/data/system bars differ; no pixel-parity or original font/icon claim.

## Implemented components

- `CalendarGrid`: Monday-first layout, previous/next month, selectable day, real loaded-task markers and accessible labels. An observed Android square selection background was fixed with explicit rounded clipping, then re-rendered.
- `CalendarTaskRow`: compact date/time/status rows opening the existing authorized Task/Assignment flow.
- Calendar utilities: year rollover, Gregorian leap-year rules, exclusive next-month end, local-day grouping and DST-aware local-midnight query conversion.
- Existing `getCalendar()` is the only data source; ordinary queries cover one month. Older responses are ignored after range changes/unmount; stale markers are cleared while loading.
- Today, selected-day/all-loaded-dates toggle, refresh, loading/error/empty-day states and the existing custom date inputs are retained. Ranges must be valid, ordered and within the existing 93-day maximum. Dates outside a custom loaded interval are disabled.
- Selected date survives opening details and returning, and switching all-dates mode. Dots reflect loaded records by local **start date**, not every day overlapped by a multi-day Task. Existing truncation warnings remain; unloaded records/counts are not invented.

No backend/API/schema/deployment change, direct Firestore access, new calendar provider/SDK, recurrence, Maps/GPS, finance, real AI/verification or iOS work. No new synthetic Task or business mutation was needed for Calendar acceptance.

## Tests and native scope

Full credential-free LOCAL Node 22 / Java 21 suite passed: **typecheck, 22 backend unit, 55 client, 92 integration, Functions smoke, default HTTP, explicit AI-mock HTTP and Hermes export**. Smoke passed first run. Six new client tests cover Monday-first layout/every-day coverage, leap/century exceptions, year rollover/exclusive end, invalid/oversize ranges, spring/fall DST and local-day ordering. Final clipping refinement also passed focused typecheck/client and final Hermes export. Root dependency versions are unchanged from batch 1; last audit remains 28 (1 low, 20 moderate, 7 high, 0 critical).

Logs: `.tools/design-batch2-*`; full exit codes in `.tools/design-batch2-results.json`; final checks/build in `design-batch2-final-{typecheck,client,export,build}.log`. Batch 2 hosted CI is separate from the observed successful batch 1 run.

Actual target: **Pixel_9_Pro / emulator-5554, Android 16/API 36, x86_64**, adb device. Standalone APK installed/cold-launched with cloud Auth/data restored. Rendered/tested: marked day with two real synthetic records; Task/Assignment opening and preserved date on return; next/empty month; all-dates toggle/selection restoration; custom-range controls; final circular selection. Pre-clipping candidate supplied Task-open/return/custom-control screenshots; controller behavior was unchanged by the final style-only fix. Final screenshots show the corrected circle and date toggle.

An attempted native invalid-date edit encountered Android stylus onboarding. **Native invalid-date submission is not claimed**; validation/DST are covered by deterministic tests. Physical phone, new network-failure simulation, full all-screen styling and a complete repeat of FCM/lifecycle acceptance are not claimed. First-batch evidence retains its scope.

## Artifact and next work

Ignored local artifact: `artifacts/android/team517-preview.apk`, **39,998,872 bytes**, SHA256 `02f64f6e7a4b106f4a262c6db3520424d70e2d67b413fc2004c22a175c188b6f`.

Same internal package/signing identity; install as an update. Metro/local Firebase are not runtime dependencies. APK/credentials remain excluded from source control; physical disconnected-USB acceptance remains pending. Task/AI form date/time controls, detail/Offer/Assignment composition, role-switch body and supporting screens remain planned work.

[Before / PDF / after](native-evidence/2026-11-12-design-batch2/calendar-before-reference-after.png) · [Evidence](native-evidence/2026-11-12-design-batch2/README.md)
