# Sprint 7C — curated native evidence

Captured November 13, 2026, from the actual standalone Preview on **Pixel_9_Pro / Android 16 / API36 / x86_64**. Five PNGs are **1170×2532**, representing 390×844 logical content at 3×. Raw emulator override was 1170×2760 /480dpi /font1.0; only 156px top and72px bottom Android system bars were cropped. No annotations, fabricated UI, exact private location or physical-device GPS appears. Google attribution is preserved.

| File | Actually rendered state |
|---|---|
| 01-find-tasks-list.png | Verified synthetic Helper, current authorized results and shared filters |
| 02-find-tasks-map.png | Same result set as native approximate-area pins; coincident privacy-cell tasks overlap rather than being jittered |
| 03-selected-task-preview.png | Appointment companion selected using same-area cycling; public preview and View task |
| 04-task-detail-from-map.png | Existing Discovery detail opened from preview; only approximate area, no private arrival data |
| 05-location-denied-map.png | Location denied, non-blocking optional-location message and task pins; naturally scrolled to keep the map/attribution visible |

Reproduce using the restricted-key Preview build instructions in [maps.md](../../maps.md), a verified synthetic Helper and the existing synthetic Preview tasks. Launch → Find → List/Map. Tap the appointment area and use **Next task in this area** when another real task shares the coarse point. View task opens the existing detail. Back returns to Map; Use my location → deny keeps discovery working. Wait for requests/tiles to settle before capturing; no loading or keyboard is intentionally captured.

The appointment and errands are fictional November18, 2026, 10AM–12PM Eastern. The older synthetic smoke probe was preserved rather than deleted. One owned appointment fixture was completed during privacy/FCM acceptance; a fresh fictional open appointment was then prepared through existing APIs for this final evidence/demo. No real assistance or research outcome is claimed. Exact fixture IDs/tokens/credentials are not required in shared screenshots or docs.

Physical vivo acceptance and both real FCM routes were observed separately. Physical screenshots/notification-center captures remain ignored locally and are deliberately not included here. Source CI is credential-free; these Google provider renders require the securely supplied restricted native client key and an Android build.
