# 517 brand system

November 12, 2026. Applies the [517 brand style guide](517%20brand%20style%20guide.pdf) — palette, typography and wordmark — across the mobile app. Presentation only: no API, schema, backend or deployment change, and no screen was recomposed.

## Palette

The guide's seven named colours are exact in [`src/theme/index.ts`](../apps/mobile/src/theme/index.ts). Every other value is a documented derivation (the named colour blended toward Oat for soft fills, or darkened so it reads as text), because the UI needs badge backgrounds and text-safe variants the guide does not name.

| Role | Colour | Hex | Used as |
| --- | --- | --- | --- |
| Primary | Deep Pine | `#1F3D36` | text, structure, filled buttons, selected states |
| Primary | Hearth Terracotta | `#C8553D` | the tagline accent only — a restrained accent, not an alert |
| Supporting | Sage | `#8FB39A` | supportive states; darkened to `#4F7560` where it carries text |
| Supporting | Marigold | `#E9A23B` | upcoming/attention; darkened to `#8A5A14` where it carries text |
| Supporting | Oat | `#F6EFE4` | app canvas and secondary button fill |
| Supporting | Stone | `#6B6A64` | secondary text and field labels |
| Alert | Alert Brick | `#A3312A` | errors and urgent states only |

Measured contrast: Deep Pine on Oat **10.3:1**, Deep Pine on white **11.8:1**, white on Deep Pine **11.8:1**, Stone on Oat **4.8:1**, Alert Brick on its soft fill **5.6:1**, darkened Marigold on its soft fill **5.2:1** — all at least AA. Two knowingly below AA: Sage-as-text on its soft fill (**4.2:1**, semibold badge text only) and the placeholder tone (**3.2:1**, non-essential hint text). Warm borders sit below the 3:1 non-text guidance, so `colors.border` is used for decorative card edges and `colors.outline` (`#B9A98D`) for interactive control outlines, which additionally read as white fills against the Oat canvas — the pattern the guide's own component page uses.

## Typography

The app already resolved a weight to a concrete face centrally in `ui.tsx`; this points that same resolver at the guide's two families — **Fraunces** for anything with `accessibilityRole="header"`, **Inter** for everything else. No screen needed editing. Android does not synthesise weights for custom faces, so the declared `fontWeight` picks a real file and is then cleared to stop double-bolding.

Six faces load at startup — Inter 400/500/600/700 and Fraunces 600/700, **1.5 MB** of TTF. `App` holds the first paint until they resolve; a load failure is not fatal.

> **This replaces DM Sans, and that is a decision the team should confirm.** `@expo-google-fonts/dm-sans` was on `main` because **DM Sans is what the Figma file specifies** — it appears in the file's type styles. The brand style guide specifies Fraunces and Inter instead. The two sources disagree. This branch follows the brand guide and removes the now-unreferenced DM Sans package; reverting the typeface alone is a small change if the team prefers the Figma file.

## Wordmark

[`apps/mobile/assets/logo-wordmark.png`](../apps/mobile/assets/logo-wordmark.png) is derived from the supplied [`517 caregiver app logo.png`](517%20caregiver%20app%20logo.png), a 2000×2000, 1.5 MB square with a flat cream field, the mark centred and a smaller repeat below it. The large mark is cropped to its bounding box (1149×707), scaled to 600×369 and given a transparent background — **8.8 KB**. The mark's own ink is `#2B4740`, a shade lighter than Deep Pine; the asset keeps the logo's colour rather than being recoloured. The source carries scan noise across its cream field, so coverage below a small threshold is clamped to zero — without that the whole crop picks up a faint ink tint and renders as a visible rectangle on the Oat canvas.

Product copy now says **517**. Package id, workspace names, Firebase project ids and environment labels stay `team517`.

## One defect fixed

A disabled filled button was Deep Pine at 50% opacity, leaving its white label at **3.08:1** over the Oat canvas — worse under this palette than the teal it replaced. Disabled filled buttons now take a flat Oat-darkened fill with a Stone label at **4.3:1** and still read as unavailable; pressed keeps the opacity treatment.

## Verification

Typecheck and the full client suite pass: **65 tests**, unchanged from `main` — this branch adds no tests because it adds no behaviour.

Rendered on **Pixel_9_Pro_API36 / Android 16 (API 36)** against the local Firebase emulators: the wordmark and tagline on auth, the error state, sign-in, and the task shell.

[Auth](native-evidence/2026-11-12-brand/auth.png) · [Error state](native-evidence/2026-11-12-brand/auth-error.png) · [Tasks](native-evidence/2026-11-12-brand/tasks.png)

## Not done

- Only auth and the task shell were rendered on the device. The palette and faces are global and resolve centrally, but Community, Discovery, Messaging, Offers and task detail have not been looked at under these colours on this branch.
- The emulator integration suite was not run.
- The standalone Preview APK is unchanged and would need rebuilding.
- An earlier version of this work also recomposed Post a task to the Figma frame. That was dropped: `main` already has `TaskDateTimeField`, `FormSelect` and `task-time.ts` covering the same ground, with native Android pickers rather than in-app sheets.
