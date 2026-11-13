# Design alignment — batch 3: Post a task

November 12, 2026. Implements change-map item **A08** (`EditTaskScreen` / AI panel recomposition) against the live Figma frame **"3. post"** (`4:185`) in [Patient & Family — Schedule](https://www.figma.com/design/kRer5BBbNvdSdPkanLC6HT/Patient---Family-%E2%80%94-Schedule?node-id=4-185). Unlike batches 1–2 this one used authoritative `get_design_context` output — reference code, the frame screenshot and the file's type styles — not the PDF approximation. No pixel-parity, original-font or original-icon claim is made.

## Implemented

- **Date and time pickers replace ISO text entry.** A single `Date` field opens the existing `CalendarGrid` in a bottom sheet; `Start time` and `End time` sit side by side and open a 15-minute list that scrolls to the chosen value (or to a morning start) instead of opening at midnight.
- **`src/utils/datetime.ts`**: splits an ISO instant into local date/time parts and rebuilds the instant. Refuses impossible calendar days, out-of-range ISO days that `Date()` would silently roll forward, and the local hour skipped by a spring-forward change. Day arithmetic crosses months, years and leap days.
- **One date drives both ends.** An end time at or before the start runs past local midnight; the screen says `Ends <day>` when it does. A loaded draft whose end falls on a different day keeps that day rather than being truncated.
- **Controls from the design**: `Planned | Urgent` segmented control, `Who can see it` radio option cards, a `Where is help needed?` card with a `Change ›` action opening a saved-place sheet, a help-type dropdown with the users icon, and a `Save Draft | Post` button pair above a top border.
- **Field copy follows the frame**: Task name, What do you need?, Date, Start time, End time, Where is help needed?, How soon is help needed?, What should the helper do?, Who can see it.
- Shared `FormControls` (`Field`, `Sheet`, `SelectField`, `DateField`, `TimeField`, `OptionCard`, `LocationCard`, `LocationField`, `FooterActions`) are reusable by the remaining batch-3 screens.
- `TextInput` gained an optional `hint`, removing the duplicated visible label that wrapping produced; placeholders now use the design's `text-subtle` tone so example copy cannot be mistaken for saved content.
- Theme additions are additive only: `radius.field` (14) and `colors.subtle`. No existing colour changed, so no other screen was restyled.

## Deliberate deviations

| Design | Decision |
| --- | --- |
| Map thumbnail inside the location card | Not implemented. Maps remains Sprint 7C and `figma-alignment-plan.md` forbids placing exact private Task coordinates in a map placeholder. The card keeps heading, place and `Change ›`. |
| "Verified volunteers" | Kept as **Verified helpers**. "Volunteer" is already a compensation value and Helper is a role; renaming would collide with both. "Care circle only" was adopted as drawn. |
| No compensation section | The app's Volunteer / Points / Paid section is **retained** — removing a working field to match the frame would drop a feature. It now uses the same radio cards as "Who can see it" and is titled "How is help recognised?". |
| Sticky footer | The actions render as the design's `Save Draft | Post` pair above a top border, but scroll with the page. A truly fixed footer needs the single root `ScrollView` in `App.tsx` restructured, which is outside this batch. |
| Modal header with X and archive icons | Not added. The Post tab already renders "Post a task" through `AppHeader`, and the tab bar is the exit. |
| Figma icon assets | Feather (`@expo/vector-icons`), already this project's icon system, is used for users / chevron-down / calendar / clock / check / edit. These are an **approximation**, not the file's exported SVGs; `react-native-svg` is not a dependency and none was added. |
| Help-type dropdown | `helpType` is still free text in the contract. The dropdown offers six suggestions plus "Something else", which reveals the text input. A value already on a draft is preserved and shown. |

`urgency` now initialises to `PLANNED` and `visibility` to `CARE_CIRCLE` when a draft has neither, so the preselected control and the value that saves agree. `CARE_CIRCLE` is the narrowest audience, so the default cannot widen who sees a task.

## Tests and native evidence

Typecheck and the full client suite pass: **64 tests**, including 9 new `datetime` tests covering instant↔local round-trip, UTC-vs-local day boundaries, impossible days, the DST spring-forward gap, fall-back times, the 15-minute grid with an off-grid saved value preserved, locale clock labels and day arithmetic across months/years/leap days. The emulator integration suite was not run in this batch.

Device: **Pixel_9_Pro_API36 / emulator-5554, Android 16 / API 36**, Expo Go over Metro against the local Firebase emulator suite, signed in as the demo manager. Exercised: every picker opens and dismisses, a complete draft (`Clinic visit with Mom` · Clinic companion · Fri Nov 20 · 10:00 AM–12:00 PM · Demo home · Planned · Volunteer) saved and reopened with `Nov 20, 10:00 AM EST – Nov 20, 12:00 PM EST` intact — the local pickers wrote the correct instants end to end.

Not exercised natively: publish-from-this-screen, the AI assistant panel, a DST-gap submission, screen-reader output, large font scales and a rebuilt standalone APK. The distributed Preview APK is unchanged by this batch.

[Before](native-evidence/2026-11-12-design-batch3/before-post-form.png) · [After, top](native-evidence/2026-11-12-design-batch3/after-post-top.png) · [After, footer](native-evidence/2026-11-12-design-batch3/after-post-footer.png) · [Time picker](native-evidence/2026-11-12-design-batch3/after-time-picker.png) · [Saved draft](native-evidence/2026-11-12-design-batch3/after-saved-draft.png)

## 517 brand style guide

The guide now lives at [`docs/517 brand style guide.pdf`](517%20brand%20style%20guide.pdf) and drives [`src/theme/index.ts`](../apps/mobile/src/theme/index.ts). Its seven named colours are exact; every other value is a documented derivation (the named colour blended toward Oat for soft fills, or darkened so it reads as text), because the UI needs badge backgrounds and text-safe variants the guide does not name.

| Role | Colour | Hex | Used as |
| --- | --- | --- | --- |
| Primary | Deep Pine | `#1F3D36` | text, structure, primary buttons, selected states |
| Primary | Hearth Terracotta | `#C8553D` | the tagline accent only — a restrained accent, not an alert |
| Supporting | Sage | `#8FB39A` | supportive states; darkened to `#4F7560` where it carries text |
| Supporting | Marigold | `#E9A23B` | upcoming/attention; darkened to `#8A5A14` where it carries text |
| Supporting | Oat | `#F6EFE4` | the app canvas and secondary button fill |
| Supporting | Stone | `#6B6A64` | secondary text and field labels |
| Alert | Alert Brick | `#A3312A` | errors and urgent states only |

Also applied: body copy raised to **16px** (`type.body`) per the guide's readability rule; secondary buttons take the clear Deep Pine border the guide draws; `StatusBadge` now uses Sage for completed, confirmed and verified states; and the auth screen shows the **517** wordmark with **Care, <span>shared.</span>** in Terracotta. Product copy that said "team517" now says "517" — package id, workspace names, Firebase project ids and environment labels are untouched.

Measured contrast: Deep Pine on Oat **10.3:1**, Deep Pine on white **11.8:1**, white on Deep Pine **11.8:1**, Stone on Oat **4.8:1**, Alert Brick on its soft fill **5.6:1**, darkened Marigold on its soft fill **5.2:1** — all at least AA. Two knowingly below AA: Sage-as-text on its soft fill (**4.2:1**, large/semibold badge text only) and placeholder Stone-toward-Oat (**3.2:1**, non-essential hint text). Warm borders sit below the 3:1 non-text guidance; `colors.border` is used for decorative card edges and `colors.outline` (`#B9A98D`) for interactive control outlines, which additionally read as white fills against the Oat canvas, the pattern the guide's own component page uses.

**Fonts.** `@expo-google-fonts/fraunces` and `@expo-google-fonts/inter` are the only new dependencies in this batch; both are SIL OFL asset packages and `expo-font` was already present. Six faces load at startup — Inter 400/500/600/700 and Fraunces 600/700, **1.5 MB** of TTF in all. `App` holds the first paint until they resolve so text never reflows from a fallback, and a load failure is not fatal: the platform default still renders.

Android does not synthesise weights for custom faces, so a declared `fontWeight` has to pick a real file. `typeface()` in [`ui.tsx`](../apps/mobile/src/components/ui.tsx) does that in one place: the shared `Text` flattens its merged style, maps the weight to a concrete Inter face, and clears `fontWeight` so Android cannot double-bold. Anything with `accessibilityRole="header"` resolves to Fraunces instead, which is how page titles, section headings and card titles pick up the display face without each screen being touched. Raw text inside `ui.tsx` — button labels, badges, the avatar initial and `TextInput` — sets its face directly.

**Logo.** The guide's cover sets the wordmark in Fraunces, but the supplied [`docs/517 caregiver app logo.png`](517%20caregiver%20app%20logo.png) rounded `5i7` mark is the one to use. The source is a 2000×2000, 1.5 MB square: flat cream background, the mark centred, and a smaller repeat below it. [`apps/mobile/assets/logo-wordmark.png`](../apps/mobile/assets/logo-wordmark.png) is derived from it — the large mark cropped to its bounding box (1149×707), downscaled to 600×369 and given a transparent background, 62 KB. The mark's own ink is **`#2B4740`**, a shade lighter than Deep Pine `#1F3D36`; the asset keeps the logo's colour rather than being recoloured to the palette. The source PNG carries scan noise across its cream field, so coverage below a small threshold is clamped to zero — without that the whole crop picks up a faint ink tint and the logo renders as a visible rectangle on the Oat canvas.

[Brand auth screen](native-evidence/2026-11-12-design-batch3/brand-auth.png) · [Brand Post footer](native-evidence/2026-11-12-design-batch3/brand-post-footer.png) · [Brand profile and Sage badge](native-evidence/2026-11-12-design-batch3/brand-profile.png)

## Whole-app review under the brand

Applying the palette and type restyles **every** screen, so all of them were checked rather than just Post a task.

A static pass first, because it catches what a screenshot cannot:

- **Only `ui.tsx` imports React Native's `Text`.** Every screen renders through the shared component, so the Fraunces/Inter resolver reaches all of them with no per-screen edits.
- **No hex colour is declared outside `theme/index.ts`,** and no `fontFamily` outside the resolver. There is no screen quietly holding an old colour or face.

Two real defects came out of it, both fixed:

| Defect | Fix |
| --- | --- |
| The picker sheet backdrop was still `rgba(18,43,61,…)` — the pre-brand ink, not Deep Pine. | Repointed at Deep Pine at 35%. |
| A disabled filled button was Deep Pine at 50% opacity, leaving its white label at **3.08:1** over the Oat canvas — effectively unreadable, and worse under this palette than the old teal. | Disabled filled buttons now take a flat Oat-darkened fill with a Stone label, **4.3:1**, and still read as unavailable. Pressed keeps the opacity treatment. |

Rendered and reviewed on the device under the new palette and type: auth (sign in and register), profile and mode switch, Tasks by status and calendar, Post a task with every picker, task detail, Review Offers, Community, Messages inbox, a conversation with its composer, and helper Discovery. A complete draft was published end to end — `Clinic visit with Mom` moved to **Needs help · 1 / Waiting for offers** with its times intact.

One publish attempt was refused with "Complete the required task details before publishing." That is **correct behaviour, not a regression**: [`functions/src/validation/tasks.ts:54`](../functions/src/validation/tasks.ts) requires either public instructions or legacy instructions, and the field was blank. Publishing succeeded once it was filled.

Not a brand problem but still open: Community, Discovery and Messaging remain dense with equally-weighted outlined buttons. That is items A12–A14 of the [alignment plan](figma-alignment-plan.md), untouched by this batch.

[Community](native-evidence/2026-11-12-design-batch3/brand-community.png) · [Conversation](native-evidence/2026-11-12-design-batch3/brand-conversation.png) · [Task detail](native-evidence/2026-11-12-design-batch3/brand-task-detail.png) · [Discovery](native-evidence/2026-11-12-design-batch3/brand-discovery.png)

## Not done

The design's Schedule and Tasks frames are hidden in the Figma file and remain a separate, larger piece of work: the design's Schedule is a week strip with an urgent banner and a stats row, not the month grid batch 2 shipped.
