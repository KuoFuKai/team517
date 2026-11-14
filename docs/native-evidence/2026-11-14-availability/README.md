# Sprint8C native evidence — November14

Actual Pixel_9_Pro/Android16 API36 emulator observations. Not physical-vivo evidence or design mockups. All identities/content are synthetic Preview. Native screenshots preserve actual scroll positions; partial offscreen cards remain vertically scrollable.

## Provenance

- Final APK `9e46ae5d47e548e1bf57c419e62b2b05b95a91732611d00b1471950ffe0d1ece`: `8c-accepted-*` screenshots, OS-card crops. Installed, cold Auth persisted, independent Helper Confirm, legacy NOT_PROVIDED reactivation and both actual background OS notification taps passed.
- Layout candidate `750e707dbebf0f26ac1b2edc50d52f26527c19caa4d0df91190482537db3a56b`: `matrix-*-card/confirm.png`;320/360/390/412dp,font1.3. Final changes only legacy missing-availability initialization, not these provided-window/card/confirmation layouts. Do not relabel these as final-hash screenshots.
- Earlier candidate `e2fd749c9bc5fcfd59cd0a699822227e828f617d5824cacc311cd049d5dd1417`: `matrix-*-form.png`, native date/time input, error, scoped profiles, Message/Back, Map and conflict selection screenshots. Subsequent fixes preserve these layouts; final-specific changed missing-state behavior is explicitly captured separately.

## Try the evidence

[Date picker](8c-native-date.png) → [native clock](8c-native-time.png) → [edited4:30PM](8c-native-edited.png). [Missing-until error](8c-invalid-range.png). Actual docked-IME typing: [app input crop](offer-input-crop.png) and [lower keyboard crop](docked-keyboard-lower-crop.png). Keyboard toolbar/suggestions are intentionally omitted for clipboard privacy; these are two crops, not a fabricated full-screen composition.

[Alex contextual availability](8c-profile-availability-large.png), [Marcus partial](8c-marcus-availability.png), [Sam unspecified](8c-sam-card.png), [Message](8c-profile-message.png) and [Back](8c-profile-message-back.png). [Conflict warning](8c-conflict-warning.png) → [pending selection](8c-conflict-selected.png) → final APK [Helper reviews](8c-accepted-helper-review.png) → [separate Confirm](8c-accepted-helper-confirmed.png). Exact arrival-details screenshots are deliberately not published.

| Width/font | Provided form/actions | Covers comparison | Long partial-selection warning |
| --- | --- | --- | --- |
|320dp/1.3|[form](matrix-320-form.png)|[card](matrix-320-card.png)|[sheet](matrix-320-confirm.png)|
|360dp/1.3|[form](matrix-360-form.png)|[card](matrix-360-card.png)|[sheet](matrix-360-confirm.png)|
|390dp/1.3|[form](matrix-390-form.png)|[card](matrix-390-card.png)|[sheet](matrix-390-confirm.png)|
|412dp/1.3|[form](matrix-412-form.png)|[card](matrix-412-card.png)|[sheet](matrix-412-confirm.png)|

[Map selected POINTS Task](8c-map-points.png), [Map detail](8c-map-detail.png). Final [legacy unspecified form](8c-accepted-legacy-form.png), [reactivated](8c-accepted-legacy-reactivated.png), [restored original AVD/cold Auth](8c-accepted-restored.png).

Final OS acceptance: [generic Message card](os-message-card.png) → [Conversation](8c-accepted-message-route.png); [generic Task card](os-offer-card.png) → [correct synthetic Task](8c-accepted-offer-route.png). Only the relevant team517 notification card is cropped; unrelated system notifications are omitted. No GPS/physical phone/native DST/native PAID-completion pass is implied. [Full40-item report](../../sprint-8c-report.md).
