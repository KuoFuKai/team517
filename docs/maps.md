# Sprint 7C — Native Maps + Nearby Task Discovery

Status: native implementation and observed device checks complete; final hosted CI and disconnected-phone user report are recorded in the acceptance/validation documents. This is bounded MVP Task discovery, not production geospatial search or live tracking.

## Implementation and configuration

- Expo SDK 55 compatible resolution: **react-native-maps 1.27.2**, **expo-location ~55.1.15**. No SDK/React/Firebase major upgrade. [Expo map configuration](https://docs.expo.dev/versions/v55.0.0/sdk/map-view/) and [foreground location documentation](https://docs.expo.dev/versions/v55.0.0/sdk/location/).
- Enabled only **Maps SDK for Android** (`maps-android-backend.googleapis.com`) in existing `team517-dev`. No Places, Routes, Directions, Geocoding, Roads, iOS Maps service or new cloud project was created.
- Dedicated Android client key was restricted at creation and read-back verified: package `edu.cornelltech.team517`; actual Preview APK signing SHA-1 **5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25**; API usage only Maps SDK for Android. Existing Firebase keys were not reused or modified. No unrestricted Maps key or backend/Admin credential is shipped.
- The existing release/Preview variant currently uses the project's development/debug certificate, verified from the actual signed APK rather than assumed. LOCAL generated builds currently have the same identity. A different signing certificate must be explicitly restricted before use. This is development Preview signing, not a production distribution setup.
- Supply **TEAM517_ANDROID_MAPS_API_KEY** securely in the native build shell; then run the existing `scripts/build-android-preview.ps1` under Node 22 / Java 21. No key value belongs in source, logs or documentation. The supported react-native-maps Expo config plugin writes Android configuration; native rebuild is required. Runtime configuration exposes a configured boolean. Unconfigured LOCAL/credential-free CI retains an explanatory List fallback and does not require a Maps key to typecheck/test/export.
- LOCAL and PREVIEW retain their existing Firebase/API environment separation. PREVIEW uses real Auth, HTTPS team517-dev API and real FCM, with no Metro/10.0.2.2/emulator dependency. No backend deployment was needed for Maps.

## Shared discovery and privacy

`DiscoveryWorkspace` owns one result set and one filter state for List and Map. `DiscoveryMap` accepts only `TaskDiscoveryItemDto[]`, projects `approximateLocation` through `taskAreaMarkers`, and never fetches a private Location or Assignment execution DTO. There is no second endpoint, matching model, Map Offer endpoint or Firestore collection. Panning/zooming are local; no query is issued on camera movement. Refresh/filter application uses the existing discover endpoint.

Pins use the existing server-produced 0.02-degree representative/coarse coordinates, unchanged. Distance remains whole-kilometer approximate distance from the existing server contract. There is no client-side exact-fetch-and-round, geocoding, address lookup, route, ETA or navigation toolbar. Map framing uses task extents, a neighborhood-scale minimum span and maximum zoom 14; with no mappable result it falls back to generic NYC, without fabricated Task pins. Tasks lacking coordinates remain available in List and are called out in Map mode.

Tap a pin to select a public Task preview; **View task** opens the existing Discovery detail and normal Offer flow. Selection re-resolves against current results, disappears when filtered out, and can be cleared or dismissed with Android Back. Back from Map returns to List. The branded card is in normal scroll flow with ResponsiveActions, not an overlay that covers navigation. When selected, redundant location controls/hints are hidden to preserve the primary action under large text.

Privacy cells can legitimately coincide. Tapping the area cycles its actual tasks; **Next task in this area** exposes overlapping offers without moving/jittering any coordinate or adding clustering infrastructure. Marker IDs remain real Task IDs internally. Planned/urgent pins are simple; no ratings, financial accounting or helper locations are fabricated.

Exact synthetic arrival data was denied before Assignment confirmation, unlocked through the existing confirmed execution flow, denied again after completion, and cleared from the physical UI on refresh. Returning to discovery did not reuse that private content. No execution location is passed into a map component or persisted into discovery state.

## Optional foreground location

Nothing requests GPS at startup. **Use my location** explicitly requests foreground permission if needed and takes one sensor reading to center the camera. It does not change the query or publish/store the point. No background permission, foreground service, watcher, geofencing, location history, helper pin or continuous tracking is enabled. The device's continuously updating blue-dot layer is intentionally off. Final APK permission inspection confirmed no ACCESS_BACKGROUND_LOCATION or FOREGROUND_SERVICE_LOCATION. A generic FOREGROUND_SERVICE permission is merged by AndroidX WorkManager; this feature does not start a location service.

Permission denial leaves Map/List/tasks/offers usable and is remembered for this app session to avoid repeated prompts. A later grant in Android Settings is respected. Sensor reads time out after 12 seconds; the person's permission decision is not timed out. Provider-settings prompts are disabled; errors/unavailable GPS show a small non-blocking message. Background/unmount guards prevent stale results from moving a departed screen. No GPS or raw provider error is logged by this feature.

Synthetic GPS was used only on the Pixel emulator. The vivo location permission was denied; **no physical GPS was read or committed**. All committed screenshots are synthetic emulator captures, not physical phone maps or private notification-center images.

## Observed acceptance

| Target / case | Observed result |
|---|---|
| Pixel_9_Pro, Android 16 / API 36, x86_64 | Real Google map tiles, synthetic multiple/one/empty results, public marker preview and existing detail/Offer exercised |
| Same coarse area | Two coincident Task records reachable via pin cycling / Next task; no coordinate jitter |
| List ↔ Map / filters | Same urgency/compensation result set; urgent produced one Task; points produced empty results; reset restored eligible tasks |
| Foreground permission denied | Map and results remained; immediate optional-permission message; repeat tap did not prompt again |
| Foreground granted, synthetic NYC fix | One-shot read centered the camera; no continuous location layer or stored GPS |
| Granted but device location unavailable | Non-blocking unavailable message; map/list retained; emulator setting restored |
| Offline API / retry | Friendly network error; List/Map accessible; retry recovered after restoring emulator connectivity |
| 320×800dp, font 1.3 | Preview primary CTA fully visible and detail opened; actions stack; page remains scrollable |
| 360×850dp, font 1.12 | Preview/action/detail exercised |
| 390×920dp, font 1.0 | Preview/action/detail exercised; canonical synthetic evidence viewport |
| 412×940dp, font 1.0 | Preview/action/detail exercised |
| vivo V2324A, Android 14 / API 34, about 360dp, font 1.12 | Final Preview installed; map/markers/preview/detail/Offer/withdraw/List/Back exercised; permission-denied fallback; real GPS not requested after denial |
| vivo Offer message keyboard | Docked Gboard, readable input, text preserved on dismissal; scroll to normal Offer CTA and successful submit |
| Final Preview FCM | Actual background generic message notification → Conversation; actual generic task update → pending Assignment |
| Synthetic execution privacy | Pending denied; native Confirm unlocked synthetic arrival; completion revoked API access; native refresh cleared text; safe Map return verified |

Only observed cases above are claimed. No rotation scope was added (portrait app), iOS/all-device compatibility or full repeat of Sprint 7A/6C is claimed. USB-disconnected user feedback and hosted CI are tracked separately in `docs/native-acceptance.md` / `docs/validation.md`.

## Fixes and limitations

- HIGH: coincident coarse pins made some tasks unreachable from the top pin. Fixed with actual-task cycling, not fabricated coordinates.
- MEDIUM: Android permission/provider dialogs could discard feedback or outlive the sensor timeout. Fixed session/foreground guards, a sensor-only timeout and disabled provider-settings nags; regression coverage added.
- MEDIUM: 320dp with 1.3 font scale clipped the primary action. Fixed selected-card prioritization and responsive normal-flow actions; four widths rerendered.
- LOW: dense Google basemap labels and native callout presentation are provider-controlled. No broad brand redesign or custom map graphics were added.
- SDK authentication/tile failures have no complete structured JS error channel here. Missing config has List fallback, and a 15-second loading hint offers List when tiles are slow. Actual correctly restricted tiles were observed; deliberately invalid client credentials were not shipped/tested.
- Discovery still scans a bounded **100 eligible-status candidates**, returns at most **30 Tasks**, and can truncate before all relevant geographic results are considered. No production-grade spatial index, exhaustive nearby search, Search this area, automatic pan query or full clustering is claimed. Future indexing belongs behind the existing service contract.
- Refresh remains explicit; this Sprint does not add realtime transport. No Nearby Helper discovery, helper availability broadcasting, background sharing, Points/Payments, real AI/voice/identity provider or iOS work was implemented.

Evidence: [curated synthetic captures](native-evidence/2026-11-13-sprint7c/README.md). Automated checks and Git outcome: [validation](validation.md).
