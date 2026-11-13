# Figma-accurate schedule picker

November 12, 2026. Replaces the native Android date/time picker on Post a task with the in-app Date + Start/End time controls the Figma frame ["3. post" (4:185)](https://www.figma.com/design/kRer5BBbNvdSdPkanLC6HT/Patient---Family-%E2%80%94-Schedule?node-id=4-185) actually draws.

## Why

`TaskDateTimeField` opened `DateTimePickerAndroid` — the OS picker. The frame draws something different: one **Date** field, then **Start time** and **End time** beside it, each a list of clock choices. This ports that, and nothing else.

It keeps everything else the screen gained in the design overhaul — `useScreenHeader`, the back-stack, `Choices`/`Disclosure`/`TonePanel`, and the `FieldTrigger` + expanding-`Card` pattern `FormSelect` established. Only the contents of `ScheduleChooser` changed.

## What changed

- **`TaskSchedulePicker`** renders the existing `CalendarGrid` for the date and two scrollable clock lists at a 15-minute step. Each list opens at the chosen time, or a plausible morning start, rather than at midnight.
- **One date drives both ends.** The frame has a single Date field; the contract has two instants. The end reuses the start's date and rolls to the next day when it is at or before the start, so an overnight task still stores two correctly ordered instants. The picker says `Ends <day>` when it has rolled.
- **`task-time.ts` gained part accessors** — `taskDatePart`, `taskClockPart`, `composeTaskTime`, `shiftTaskDate`, `taskClockChoices`, `taskClockLabel`, `taskDayLabel`, `isTaskDate`. The stored form value is still `"YYYY-MM-DD HH:mm"` and still goes through `parseTaskTime` / `taskTimeValue`, so the DST-gap rejection and the seconds-preserving save are untouched. No second time module was introduced.
- **`scheduleSummary`** gives the closed field a readable value — `Fri, Nov 13 · 9:00 AM` — in place of `taskWhenLabel`.
- **`TaskDateTimeField` and `@react-native-community/datetimepicker` are removed.** Nothing else used either.

## One thing that would have broken the build

`@react-native-community/datetimepicker` was also registered as an **Expo config plugin** in `app.config.js`, not only as a dependency. Removing the package alone left `expo start` failing with `PluginError: Failed to resolve plugin for module`. The plugin entry is removed too.

`FormSelect` and `task-time.ts` stay — `CareContextsScreen` and `FormSelect` respectively still use them. `taskWhenLabel` stays; `AiAssistantPanel` uses it.

## Verification

Typecheck and the client suite pass: **69 tests**, 4 new — part round-tripping, day arithmetic across months, years and leap days, the clock grid preserving an off-step saved value, and an overnight pair still resolving to ordered instants.

Rendered on **Pixel_9_Pro_API36 / Android 16** against the local Firebase emulators: the closed field's empty state, the expanded calendar, date selection, and the time lists opening at the chosen time.

[Closed](native-evidence/2026-11-12-schedule-picker/closed.png) · [Calendar](native-evidence/2026-11-12-schedule-picker/calendar.png) · [Times](native-evidence/2026-11-12-schedule-picker/times.png)

## Not done

- Saving and reopening a draft through this picker was not exercised end to end on the device; the round-trip is covered by tests only.
- The emulator integration suite was not run, and the standalone Preview APK is unchanged.
- This branch is independent of the 517 brand work, so it renders in the current palette.
