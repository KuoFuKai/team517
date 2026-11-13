# Maker Day 3 screenshots

Eight fictional product demonstrations captured November 13, 2026, on **Pixel_9_Pro / Android 16 / API 36 / x86_64 / emulator-5554 (`device`)**. All PNGs are **1170×2532** (390×844 logical, 3×). Raw device override: 1170×2760, 480dpi, font scale 1.0, America/New_York. Only the 156px Android top system bar and 72px bottom system bar were cropped; no UI pixels were retouched, no captions/annotations were embedded. This is not research evidence or a real appointment.

Full setup, guardrails and build instructions: [docs/maker-day-3-demo.md](../../docs/maker-day-3-demo.md).

## Setup

From the repo root under Node 22 / Java 21:

1. Start a dedicated empty presentation emulator session: `npm run emulators`. Auth 9199, Firestore 8280, Functions 5001, UI 4300. Do not import other fixtures or cloud data. No Metro is required by the standalone build.
2. Run `npx tsx scripts/maker-day3.ts init`.
3. Build with `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-makerday3-android.ps1`; install `artifacts/android/team517-maker-day3.apk` using `adb install -r`.
4. Set `adb shell wm size 1170x2760`, `adb shell wm density 480`, `adb shell settings put system font_scale 1.0`. Confirm the same API 36 device/insets/timezone before reusing the crop. Restore display size/density afterward with `wm size reset` / `wm density reset`.
5. Sign out any previous emulator session. Local fictional accounts use the public emulator-only password **development517**:
   - Grace: `grace@makerday.team517.test`
   - Marcus: `marcus@makerday.team517.test`
   - Lena: `lena@makerday.team517.test`
   - Linda: `linda@makerday.team517.test`
6. Capture each rendered state with `powershell -File scripts/capture-makerday3.ps1 -Name <basename>`. Wait for loading to finish and dismiss the keyboard. The script checks the raw viewport and refuses a shown keyboard. Inspect each PNG manually as well.

## Exact sequence and states

Capture **02 first**, then 01/03/04/05/06/07/08. The files are numbered in presentation order rather than fixture preparation order. Each row uses the same Task ID saved by init in ignored `.tools/maker-day3/session.json`.

| File | Implemented screen/state | Exact reproduction after setup |
|---|---|---|
| 01-care-context.png | Grace's Tasks / By status; Mom’s Care; appointment needs a choice | After 02, run `npx tsx scripts/maker-day3.ts publish`, then `npx tsx scripts/maker-day3.ts offers`. Return to Tasks or relaunch; ensure Active filter. Capture with task options closed. |
| 02-post-request.png | Existing filled draft editor, ASK | Sign in as Grace → Tasks → Task options → Drafts → Appointment companion → Edit draft. Top of form, keyboard hidden. Capture before publish. The form continues below the viewport. |
| 03-helper-responses.png | Published request with HAS_OFFERS, time/place/description, View responses | From 01, open Appointment companion. Top of detail; location/private-details disclosure closed. This screen uses the existing generic responses message; 04 has the exact count. |
| 04-choose-helper.png | Real offer comparison, Marcus and Lena, “2 people can help” | From 03 tap View responses. Both ACTIVE offers show actual messages: Marcus 10–12, Lena 10–11. Capture before selection. Then tap View offer from Marcus Chen → Choose Marcus. Both native interactions were exercised. |
| 05-confirmation.png | Marcus's actual PENDING_CONFIRMATION arrangement and Confirm / Decline | After selecting Marcus, return to Me → scroll → Log out. Sign in as Marcus → Tasks → Appointment companion. Capture before Confirm. “Chosen by Grace Chen” is the actual selectedBy relationship; no separate Grace-confirmation field was fabricated. Then tap Confirm and observe Task confirmed. |
| 06-scheduled.png | Grace's real calendar; Scheduled · Marcus Chen, 10AM–12PM | After Marcus confirms, return to the task list (Back from success, Back from arrangement), Me → Log out. Sign in as Grace → Calendar → Wednesday, Nov 18 (marked date). Capture top of calendar including appointment row. |
| 07-progress.png | Existing IN_PROGRESS arrangement, Marcus responsible | Run `npx tsx scripts/maker-day3.ts start` (authenticates as Marcus). In Grace's App: By status → Appointment companion → View arrangement. Capture top after loading. |
| 08-completion.png | Existing COMPLETION_PENDING review, Confirm completion | Run `npx tsx scripts/maker-day3.ts request-completion` (Marcus). From 07: Back → View arrangement to reload. Capture before approval. Grace then tapped Confirm completion; actual Task/Assignment reached COMPLETED (verified with `npx tsx scripts/maker-day3.ts info`). |

Supported alternate API checkpoints: `select`, `confirm`, `complete`; these invoke existing business APIs and are useful for repeating a presentation without account switching. Captures in this package used native Choose Marcus, Confirm and Confirm completion; publish/offers/start/request-completion were API-prepared. None are frontend-fabricated lifecycle states.

`init` refuses another task in this scenario context and never deletes existing tasks. To reproduce from the beginning, stop and restart **your own dedicated emulator session without import**, then rerun init. Do not erase someone else's local development state. The date is intentionally fixed to **Wednesday, November 18, 2026**, 10AM–12PM Eastern, for this classroom story; change the source fixture date deliberately for a later presentation rather than claiming it is a real upcoming appointment.

## Visible polish / boundaries

- Fictional Grace Chen, Linda Chen, Marcus Chen, Lena Wu; Mom’s Care; Clinic · Roosevelt Island. Generic fictional clinic lobby, no real patient information, address or diagnosis.
- Existing form fields/validation preserved. Writing assistant moved into an expandable section below coordination fields; description moved near location; gaps reduced. The assistant and Save Draft / Post request remain reachable by scrolling.
- Consumer copy: Post request, View responses, Who can help?, 2 people can help, Choose Marcus, Confirm, Start helping, Mark done. Existing operations only. Assignment primary actions are emphasized; refresh is lower in the page.
- Four fictional identity mappings are enabled only by explicit LOCAL scenario flag + emulator project/mode + allowlisted local API. PREVIEW/ordinary sessions retain safe aliases. Membership, verification, location privacy and authorization are unchanged; no backend DTO was expanded.
- Both helpers' availability is plain **Offer.message**, not a structured availability feature. No reviews were invented. Lena's ACTIVE/Available status means the offer is active; her message states the shorter window.
- Screenshot 05 is the closest implemented mutual-confirmation flow: owner chooses; helper separately confirms. Screenshot 07 shows actual IN_PROGRESS, not unimplemented “On my way / Arrived.” Screenshot 08 is requester review before approval.
- No optional backup/nearby-request screens were added. No Maps, new features, provider integration, research statistics, pilots or payment claims.

Recommended five-slide sequence: **02 → 04 → 05 → 06 → 08**. Use 01 as an optional opener and 07 when discussing accountability.
