# Sprint 7C — Android task discovery map

Status: IN PROGRESS. First visible batch: native Google map tiles rendered on Pixel_9_Pro / Android 16 / API 36, standalone cloud Preview. Marker interactions and full native/physical acceptance are not complete yet.

- Started from origin/main `2e587b5`; work branch `codex/sprint-7c-maps`. No new main changes; Kingsley's unmerged schedule-picker branch remains untouched.
- Expo SDK 55 compatible resolution: react-native-maps **1.27.2**, expo-location **~55.1.15**. No SDK migration. [Expo map configuration](https://docs.expo.dev/versions/v55.0.0/sdk/map-view/) and [foreground location documentation](https://docs.expo.dev/versions/v55.0.0/sdk/location/).
- Enabled only **Maps SDK for Android**, service `maps-android-backend.googleapis.com`, in existing `team517-dev`. No Places, Routes, Directions, Geocoding or Roads APIs were enabled.
- Dedicated Android client key is restricted at creation and read-back verified: package `edu.cornelltech.team517`, actual Preview APK certificate SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, API usage only Android Maps SDK. Existing Firebase keys were not reused or changed. No unrestricted key or service-account credential is shipped.
- Existing Preview release variant currently signs with the existing development/debug certificate (verified from the actual APK, not assumed). This is a development Preview, not production signing. LOCAL generated builds currently use the same certificate; a different signer must be explicitly added/restricted before use.
- Set **TEAM517_ANDROID_MAPS_API_KEY** securely in the build shell, then use the existing Preview build script. Value is native client configuration only, never committed or documented; runtime extra exposes only a configured boolean. Without configuration, source CI/LOCAL still builds and Find Tasks offers List fallback. The supported react-native-maps Expo config plugin handles native metadata; rebuild required.
- Foreground/background location service options are disabled. Batch 1 requests no location permission and collects no GPS. Foreground one-shot UX is a later batch in this Sprint.
- Backend DiscoveryService remains authoritative: candidate bound 100, result bound 30, existing 0.02-degree representative coordinates and whole-kilometer approximate distances. No backend or Firestore model change. Panning is local; no camera-triggered queries. Exact arrival location is not fetched by the map.
- First batch validation: Node 22 typecheck, 80 client tests and standalone release build passed; real map tiles visually observed. Full regressions, markers, Offer routing and physical acceptance remain pending.

Nearby Helpers, background tracking, Points, Payments and iOS remain out of scope.
