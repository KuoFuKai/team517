# Measured-PDF native evidence — November 12

Actual Android16/API36 Pixel_9_Pro x86_64 screenshots, synthetic team517-dev accounts/data only. Screenshots are scaled copies, not mocked UI. Password-entry captures are deliberately excluded. [Coverage and limits](../../design-fidelity.md).

- [Overview 1](overview-1.png): Task/Offers/editor/AI/location/save/Calendar/Notifications.
- [Overview 2](overview-2.png): Circle/chat/Inbox/Community/Profile/verification/roles/points.
- [Overview 3](overview-3.png): Auth/Helper Discovery/Offer/Reviews/final APK fixes and persistence.

The main captures used intermediate APK `dd0327586a052e833c3427e5ac76d181d8bdd1be7ab8bb5448c22c3ab4a345bb`. Final-prefixed images used delivered APK `3179eb3576df7b0db28fba50773ab7aa3a1bffbf1ebda7e82d8d2b565a19ec3b`. The intermediate build has old wrapped assistant copy/extra location Back and pre-fix detail tabs/resource footer. Final focused captures document corrections; do not treat intermediate visual issues as remaining final bugs.

Comparisons normalize both sources to 390-pixel width and show the top 844-pixel viewport; Android status/gesture bars are cropped. They do not stretch long PDF scroll frames to fit screen height. Android native logical width is about 426.7dp versus the prototype390, so responsive wrapping/density, fixtures and OS chrome differ. These are visual review aids, not pixel scores.

| PDF | Native | Comparison |
| --- | --- | --- |
| 4 Tasks | launch | [Same-width](compare-launch.png) |
| 14 Task | task | [Same-width](compare-task.png) |
| 17 Find | helper-find | [Same-width](compare-helper-find.png) |
| 19 Helper detail | helper-detail | [Same-width](compare-helper-detail.png) |
| 21 Inbox | inbox | [Same-width](compare-inbox.png) |
| 25 Community | community | [Same-width](compare-community.png) |
| 41 Form | editor | [Same-width](compare-editor.png) |
| 11 Roles | roles | [Same-width](compare-roles.png) |

AI review is explicitly a read-only layout preview, not a generated cloud suggestion. Map/points/media previews are unconnected. VERIFIED reflects existing development fixture state, not a real identity provider. Only the report's exercised states count as native evidence; confirmation/start/completion transitions, real maps, GPS, physical phone and docked keyboard are not newly certified by these images.

Final retests: [equal-height assistant buttons](final-editor.png), [single location Back](final-locations.png), [manager mode](final-manager-mode.png).
