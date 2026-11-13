# Maker Day 3 / Crit #3 presentation capture

Captured November 13, 2026. These are **fictional product demonstrations, not research evidence, pilot results, or real appointments**. The single story is trusted family/friends coordinating non-medical appointment accompaniment: ASK → CLAIM → CONFIRM.

## Files and reproducibility

The eight PNGs and detailed state-by-state instructions are in [the screenshot package](../artifacts/maker-day-3-screenshots/SCREENSHOT_README.md). All are native Android captures, 1170×2532 PNG (390×844 logical at 3×), with only Android system bars cropped. No annotations, generated UI, or retouched application pixels. The long request form continues below the viewport; controls not visible in the capture remain available by scrolling.

1. Use Node 22, Java 21, the existing Android SDK and a booted API 36 emulator. No cloud Admin credential is needed. Start `npm run emulators` with Auth 9199, Firestore 8280, Functions 5001 and UI 4300. Do not import cloud or old fixtures into this scenario session.
2. In a second Node 22 shell, run `npx tsx scripts/maker-day3.ts init` from the repository root. It creates only its named fictional users/context/location and a normal API-created draft. It refuses to add another task if this context already contains one; it never deletes existing tasks. To repeat from the beginning, stop **your dedicated presentation emulator session** and restart without import. Do not clear a teammate's emulator session.
3. Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-makerday3-android.ps1`. This produces `artifacts/android/team517-maker-day3.apk`, independently of the existing cloud Preview artifact. Install with `adb install -r artifacts/android/team517-maker-day3.apk`. Same Android package: installing replaces the emulator's current app build; reinstall Preview afterward if needed. Sign out any prior session before using the local accounts.
4. Android guest endpoints are `http://10.0.2.2:9199` and `http://10.0.2.2:5001/demo-team517/us-central1/api/api/v1`. The standalone APK needs no Metro. Local HTTP is enabled by the explicit presentation build; PREVIEW explicitly disables cleartext again, including incremental prebuilds.
5. Set `adb shell wm size 1170x2760`, `adb shell wm density 480`, `adb shell settings put system font_scale 1.0`. Use America/New_York. API 36 Pixel 9 Pro had 156px top / 72px bottom system insets. Other devices must verify their own insets rather than reusing this crop. Restore `wm size reset` and `wm density reset` afterward.
6. Follow the per-shot table in the screenshot README. Capture with `powershell -File scripts/capture-makerday3.ps1 -Name 01-care-context` (substitute each basename). Wait for requests to settle and dismiss the keyboard first. The script refuses a different raw viewport or visible keyboard; visually inspect every output.

The fixture is deliberately limited to loopback Auth/Firestore on project `demo-team517`. It never reads ADC, writes cloud data, or changes authorization. Business transitions call the same public mobile API clients. `init` uses Admin only for local fictional Auth identities, context membership and location setup, as existing seeds do. Reproduction manifest is ignored under `.tools/maker-day3/session.json`; tokens are never written to it.

## Presentation scope and honesty

- Grace Chen (Daughter · Primary caregiver), Linda Chen, Marcus Chen (Family), Lena Wu (Family friend), Mom’s Care; generic fictional clinic lobby, no diagnosis, real address, profile photo or medical record.
- November 18, 2026 is Wednesday; 10AM–12PM America/New_York. Marcus offers the whole window; Lena offers 10–11 in her actual Offer message. There is no structured partial-availability feature, rating history, transportation service or simulated GPS.
- Existing DTOs intentionally use identity aliases. Only `EXPO_PUBLIC_DEMO_SCENARIO=maker-day-3`, LOCAL, emulator project, emulator mode and an allowlisted local API together enable four fixed fictional display identities. Ordinary sessions and PREVIEW retain existing alias behavior. Names are never used for access control.
- The real owner selection is the requester's decision; the real helper Confirm is a separate step. No additional Grace-confirmation field or silently booked assignment is invented. Backup offers remain ACTIVE until helper confirmation under existing policy.
- The implemented progression is IN_PROGRESS → COMPLETION_PENDING → COMPLETED, not “On my way / Arrived.” Screenshot 07 uses the existing Start operation, and 08 shows the existing requester approval screen. Future-date progress is staged solely to illustrate the flow; no real-world assistance occurred.
- Core native taps observed: open/edit draft, compare both offers, open Marcus, Choose Marcus, switch accounts, Confirm, open calendar and appointment date, open progress/review, Confirm completion. API checkpoint commands prepared publication, offers, Start and completion request. A capture is evidence of rendering, not a claim every transition was tapped on-device.
- No optional backup/marketplace screenshot is included: the trusted-circle story is the focus. No Maps, new provider, domain transition, cloud deployment or dependency upgrade was added.

## Visible polish

Request form keeps its existing fields and validation, moves the expandable writing assistant below the coordination fields, brings description next to timing/location, and reduces gaps. It still supports AI review and manual draft saving/publishing. “Post request,” “View responses,” “Who can help?”, “2 people can help,” “Choose Marcus,” “Confirm,” “Start helping” and “Mark done” use existing operations. Primary assignment actions have explicit primary styling; refresh moves below the task actions. Fictional names also resolve in Circle/Messaging for consistency if the presenter opens those existing screens; no new messages or community posts are fabricated.

## Deck recommendation

Use **02 → 04 → 05 → 06 → 08** for a five-minute story: specific ask, two real offers, deliberate confirmation, clear ownership, requester-approved completion. 01 is an optional opening context slide; 07 supports an accountability discussion. Do not label these screens as experiment outcomes.
