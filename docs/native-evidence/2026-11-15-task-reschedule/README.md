# Sprint 8E actual Android evidence

November14–15, 2026. Pixel_9_Pro / emulator-5554, Android16 API36 x86_64, state `device`. Native taps use fresh UI hierarchies; synthetic peer actions use ordinary authenticated team517-dev APIs. No physical-phone pass is claimed.

## Build provenance

| Build | Actual evidence |
| --- | --- |
| `06768e00…` source98d3210 | Initial requester same/next-day, rapid submit, fit and stale requester reproduction. |
| `e186109c…` source04021ae | Helper conflict/edit/reconfirm, stale confirm, actual visible-location clearing, decline and four-width Helper matrix. |
| `c5186514…` source1b2d0dc | Confirmed Calendar entry omission reproduced before fix. |
| `347b17d4…` sourcec83996a | Fixed Calendar entry/invalid-input copy; requester and Calendar four-width matrices. |
| `2d1bdc723be8473cd3ca7d4a1dfb5fc79d2c38ff2ea46c67e953228813686d54` sourcecffdf9c | Final APK installed; confirmed Task native reschedule, quiet Calendar peer refresh, four-width Offers, explicit backup selection, active/historical Notification routing and final push/Helper checks. |

Earlier screenshots are not relabeled as final-build captures. The final notification patch does not change previously checked form/Helper layouts.

## Native matrix

| Check | Actual result / evidence |
| --- | --- |
| Requester native picker cancel | Cancel preserved the original instant; untouched precision/DST instant provenance also unit-tested. |
| Same-day + rapid taps |10–12 to13–15, one Task revision despite rapid submit; [preview](active-preview.png). |
| Next-day | Native both date controls moved the window; [preview](next-day-preview.png), [Calendar](calendar-moved.png). |
| Invalid pair | End <= start blocked, then specific error after fix: [fixed error](invalid-fixed.png). |
| Impact / pending selection | Old/new windows and selected-helper reconfirm consequence rendered; pending Helper remains separate. |
| Confirmed Task | Calendar Task opens authorized Reschedule task; actual final-APK commit makes same Assignment pending, old confirmation retained only as previous snapshot. |
| Offer fit | Original Alex window conflicts; Marcus covers after same-day move: [Alex](active-alex-conflict.png), [Marcus](active-marcus-covers.png). |
| Requester stale preview | Peer proposal wins; old submit rejected and fields retained: [stale requester](stale-requester.png). |
| Helper conflict | No one-tap acceptance of known conflict; edit/decline reachable; submitted window remains independent. |
| Helper explicit acceptance | Native Use task times → Save → still pending → Confirm new schedule → Scheduled; repeated proposals and stale revision exercised. |
| Helper stale tap | Old visible Confirm tapped immediately after peer proposal; stable refresh error, no stale acceptance: [feedback](helper-stale-feedback.png). |
| Privacy | Synthetic exact arrival instructions were actually visible after confirmation; next proposal removed both Arrival details and Start after learned invalidation: [cleared](visible-location-cleared.png). Private pre-clear capture deliberately remains ignored, not published. API403 gate independently verified. |
| Decline + replacement | Actual Helper decline; owner explicitly selected Marcus with confirmation sheet; no automatic replacement or confirmation: [decline](helper-declined.png), [selection](backup-select-preview.png), [pending](backup-selected.png). |
| Calendar peer refresh | Foreground Calendar Dec7 count3→2 and Dec8 count1→2 after peer moved active Task; no manual reload, old-day agenda no duplicate: [current counts](calendar-live-refresh.png). |
| Active-Offer Notification | Final APK opened safe own-Offer current Task time, conflict and edit/withdraw/message actions; no exact private address or competitor data. |
| Historical Notification | Old Company schedule notification opened the current selected Assignment comparison rather than obsolete active Offer. |
| Task OS FCM | Final APK background generic Task update, tap opens current revision conflict/reconfirmation; details below. |
| Conversation OS FCM | Separate explicitly sent synthetic human message; generic background push and correct Conversation destination; details below. |
| Month/year/DST | Automated Calendar/schema/date coverage; not simulated as native timezone transitions. |
| Navigation | Editor cancel and header Back preserve context; final hardware Back/cold Auth recorded below. No new software-keyboard layout claim for date-picker-only forms. |

## Responsive matrix — actual font scale1.3

All required widths were rendered and vertically scrolled. No fabricated screenshot; a scroll-capture guard rejected incomplete top captures and they were replaced by verified captures. Current screenshots are representative viewport sections, not claims that all content fits without scrolling.

| dp | Requester impact/actions | Helper confirm/actions | Calendar agenda | Offer fit/selection |
| --- | --- | --- | --- | --- |
|320|[image](320-requester-actions.png)|[image](320-helper-confirm.png)|[image](320-calendar-agenda.png)|[image](320-offers-backup.png)|
|360|[image](360-requester-actions.png)|[image](360-helper-confirm.png)|[image](360-calendar-agenda.png)|[image](360-offers-backup.png)|
|390|[image](390-requester-actions.png)|[image](390-helper-confirm.png)|[image](390-calendar-agenda.png)|[image](390-offers-backup.png)|
|412|[image](412-requester-actions.png)|[image](412-helper-confirm.png)|[image](412-calendar-agenda.png)|[image](412-offers-backup.png)|

Old/new ranges stack; actions stay reachable. Header ellipsis at narrow width, repeated availability summary, legacy Helper aliases and “1 helpers” grammar remain LOW. No BLOCKER/HIGH observed. MEDIUM issues and fixes are in the [report](../../sprint-8e-report.md).

## Physical boundary

vivo8A/8B/8C/8D/8E remains one queued session: wallet/settlement; trust/comparison/Profile; availability inputs/keyboard; requester Keep/stale/replacement; Task reschedule/Calendar/fit/Helper confirmation; privacy clearing/read-only messaging; background Task/Message FCM; cold Auth and USB-disconnected ordinary-network report. Kevin explicitly requested emulator first. No repeated phone request and no emulator-to-phone equivalence.

## Final APK push and data assertions

Final source `cffdf9c`, APK SHA256 `2d1bdc723be8473cd3ca7d4a1dfb5fc79d2c38ff2ea46c67e953228813686d54`:

- [Active external Helper safe Offer route](own-offer-notification.png).
- [Historical notification resolves current Assignment](historical-current-assignment.png).
- [Actual OS Task alert](final-task-os-push.png): “You have a task update.” → [current schedule comparison](final-task-push-open.png).
- Native Use task times → Save availability still pending → [explicit confirmation success](final-reconfirmed.png) → [Scheduled and restored Start/arrival entry](final-arranged.png).
- [Actual OS Conversation alert](final-message-os-push.png): “You have a new message.” → [correct Conversation and explicit synthetic peer message](final-message-push-open.png). No chat content in the OS payload. Legacy “Member AGER” alias is LOW.
- [Android hardware Back](final-hardware-back.png) returned to Notifications. UI-automation hierarchy became temporarily unavailable on the Conversation; a direct fresh device screenshot confirmed the rendered Conversation, rather than reusing stale hierarchy or claiming a missing screen.
- Final guarded normal-API invariant assertion PASS: all four wallet and ledger snapshots, three unscoped Trust profiles unchanged; original confirmed Assignment identity preserved; phone story remains confirmed/revision0; every Task revision equals compact reschedule-event count; external own-Offer DTO excludes private address/instructions/internal relationship fields.

No new text-input keyboard acceptance is claimed for this date-picker-focused Sprint. Date/time controls, cancel, large-text scrolling, safe insets and navigation were actually exercised. Combined phone docked-keyboard checks remain queued.

Final cold relaunch after restoring1280x2856/480dpi/font1.0 retained Alex authentication and loaded current cloud tasks: [cold Auth](final-cold-auth.png). `adb reverse --list` was empty; no listeners on8081/8099/9199/8280/5001/4300. Android release16 / SDK36 / AVDPixel_9_Pro rechecked. This is standalone emulator/cloud evidence, not a USB-disconnected physical-phone observation.
