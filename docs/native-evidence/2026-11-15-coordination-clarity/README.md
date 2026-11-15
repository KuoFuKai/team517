# Sprint 8F — actual Android evidence, November 15, 2026

Pixel_9_Pro / emulator-5554 state **device** / Android16 API36 x86_64. PNGs are actual adb native captures, not HTML mocks. Fictional team517-dev records; authenticated peer API setup/actions are distinguished from native taps. No phone or unaided human-study pass. [Full report](../../sprint-8f-report.md).

## Recorded responsive matrix

|Files (each width320/360/390/412)|Font scale|Actual scope / source|
|---|---|---|
|`*-requester-review.png`, `*-availability-comparison.png`|1.3|Requester actor/review and old/current windows; source7799342 / APK ddffc580…|
|`*-helper-schedule.png`, `*-helper-comparison.png`|1.3|Helper time change, conflicting submitted window, explicit confirmation; sourcea9fd5a9 / APK7d2f420c…|
|`*-calendar-status.png`, `*-notifications.png`, `*-timeline-complete.png`, `*-offers-actions.png`|1.0|Current Calendar / notifications / completed history / two-offer comparison; sourcea9fd5a9 / APK7d2f420c…|
|`*-mywork-actors.png`|1.0|Current protected review context, requester-review wait vs Helper turn; source561b598 / APKe2625315…|

Scoped matrix, not every screen at every font. Canonical lifecycle 390dp/font1.0. Display restored1280×2856/480dpi/font1.0. Long content was scrolled; focused Back remained available. Earlier keyboard/DST/GPS results are not relabeled as new tests.

## Lifecycle and recovery captures

- `story-a-*`: OPEN rendered → peer API two Offers → requester native compare/select → Helper native confirm → arranged. Selection capture sourcefcb3284; confirmation39f441a.
- `story-b-*`: peer Helper availability edit → requester native Keep with explicit waiting consequence → Helper native confirm. Requester580f578; Helper39f441a.
- `story-c-*`: native requester date/time editor /1-helper impact /reschedule; native Helper availability edit and explicit acceptance; later current revision4 acceptance. Earlier requester580f578; Helper/final recoverya9fd5a9.
- `stale-helper-feedback.png`: actual stale visible confirm rejected; inline Refresh next to action. No automatic retry. `privacy-cleared.png`: previously visible privileged instructions and Start removed after learned reschedule. Private before-image is deliberately excluded.
- `story-d-*`: native Helper rapid Start taps → request completion → requester approval → completed / Timeline / Review entry. No new Review submitted. Existing one logical start/request/approval verified through cloud APIs. Sourcea9fd5a9; `helper-points-earned.png` later561b598 shows normal20-point reward, unchanged rules.
- `mywork-review-beforefix.png` is explicitly **before fix**, not passing evidence. `mywork-current-actors.png` / `helper-awaits-requester.png` show corrected pending-review actor after protected context hydration (561b598).
- `open-final.png`, `has-offers-final.png`: independent handoff examples, not history rewinds. `combined-review*.png`: finalb826d7a binary, requester-first combined guard, one current availability and one Keep/Choose another group, left unresolved.
- `map-*.png`: existing actual Google map marker Errands nearby → View task → own Offer state; no new GPS action or map infrastructure. Source561b598.

## Final standalone binary

Product source **b826d7a3641f43e6b35900fe85e4c638dc1efecf**. APK SHA256 **4c28b567eef7486e2e207fabe0b0829e7ae9ac8a8b30a6cdf8ec5a7225faadf7**. [Source CI](https://github.com/KuoFuKai/team517/actions/runs/43702657180). `final-task-os-push.png` → `final-task-push-open.png`, `final-message-os-push.png` → `final-message-push-open.png`, `final-hardware-back.png`, `final-cold-auth.png` are final-binary retakes, not the earlier intermediate captures. OS bodies stay generic; current Task review / authorized Task conversation loaded, Back worked, Auth persisted after force-stop/relaunch. No local services or reverse dependency. Build-provenance distinctions above are intentional; intermediate matrix images are not claimed to have been retaken on every later build.

No observed BLOCKER/HIGH. Remaining LOW: neutral unavailable names / historical actors, Calendar reconstructed month after leaving Notifications, legacy selected timestamp secondary row. Physical8A–8F and actual Yiru/Kingsley comprehension remain pending.
