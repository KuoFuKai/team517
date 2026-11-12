# Calendar UI batch 2 evidence

November 12, 2026; Pixel_9_Pro / Android 16/API 36, synthetic team517-dev data. [Report, final APK hash and limits](../../design-alignment-batch2.md).

- [Before / PDF / after](calendar-before-reference-after.png): existing requester agenda, PDF page 2, final month grid. Different months/data/viewports are labelled.
- [Final default month](calendar-final-month.png), [final selected day](calendar-final-selected.png), [final next month](calendar-final-next.png).
- [Task/Assignment open](calendar-opened-task.png), [return preserves date](calendar-date-restored.png): pre-clipping candidate, same controller as final.
- [Custom-range controls](calendar-final-range.png): rendered candidate form; no native invalid-submission pass claimed.
- [Final all-loaded-dates](calendar-final-all-dates.png), [selected-day restoration](calendar-final-selection-restored.png).

Selected-day clipping was fixed and the final circle visually checked. Android stylus onboarding interrupted keyboard validation; this is not an error-state pass. User-approved approximate icons/system font remain. No passwords, Admin keys, FCM tokens or physical-phone acceptance included.
