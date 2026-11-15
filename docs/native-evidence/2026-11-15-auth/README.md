# Android Auth evidence — November15,2026

Target: emulator-5554, Pixel_9_Pro Android16/API36/x86_64, state device. Standalone PREVIEW package edu.cornelltech.team517, version0.2.0. [Exact APK receipt](../../auth-build.json). Not a physical-phone/iOS acceptance claim.

## Responsive matrix

Each row actually opened landing → Create an account → scrolled registration → visible Back. The same final APK was installed throughout. Density480dpi; widths320/360/390/412dp, height844dp, fonts1.0/1.3; original1280×2856/density480/font1.0 restored after the loop. Empty forms contain no personal identity. Files are original native PNG captures, not mocked/annotated layouts.

|Width|Font|Landing|Registration|Scrolled registration|
|---|---|---|---|---|
|320dp|1.0|[PNG](landing-320-1.0.png)|[PNG](signup-320-1.0.png)|[PNG](signup-bottom-320-1.0.png)|
|360dp|1.0|[PNG](landing-360-1.0.png)|[PNG](signup-360-1.0.png)|[PNG](signup-bottom-360-1.0.png)|
|390dp|1.0|[PNG](landing-390-1.0.png)|[PNG](signup-390-1.0.png)|[PNG](signup-bottom-390-1.0.png)|
|412dp|1.0|[PNG](landing-412-1.0.png)|[PNG](signup-412-1.0.png)|[PNG](signup-bottom-412-1.0.png)|
|320dp|1.3|[PNG](landing-320-1.3.png)|[PNG](signup-320-1.3.png)|[PNG](signup-bottom-320-1.3.png)|
|360dp|1.3|[PNG](landing-360-1.3.png)|[PNG](signup-360-1.3.png)|[PNG](signup-bottom-360-1.3.png)|
|390dp|1.3|[PNG](landing-390-1.3.png)|[PNG](signup-390-1.3.png)|[PNG](signup-bottom-390-1.3.png)|
|412dp|1.3|[PNG](landing-412-1.3.png)|[PNG](signup-412-1.3.png)|[PNG](signup-bottom-412-1.3.png)|

No BLOCKER/HIGH observed in these rendered landing/registration layouts. Narrow/large-font content requires ordinary vertical scrolling; buttons wrap without horizontal truncation. This scoped matrix does not establish every authentication action/keyboard/error at all eight sizes. Preview legal copy remains an internal-development limitation.

## Actual identity flows

- Kevin performed real Google credential entry in the OS screen. Agent then observed onboarding, completed a fictional public first name/ordinary Both roles and Google — Connected.
- Corrected final APK update succeeded; force-stop/relaunch retained Google authentication and Connected status. No Google password/token was read. Google account was subsequently logged out, not deleted.
- Native fictional Email registration reached Verify your email/onboarding. Android Password Manager save was declined/dismissed; credentials were not saved intentionally. Public-name/role onboarding reached app and logout returned to landing.
- Cloud API verification/reset requests and real Auth self-deletion passed separately; real inbox receipt is not proved by API acceptance. Emulator integration consumed verification/reset OOB codes; that is not native-mailbox acceptance.
- Native deletion before completing onboarding: Account options → Delete account → DELETE + recent password → **Account deleted**. [Actual result PNG](account-deleted.png). A fresh fictional account was used; Google identity and shared fixture accounts were not deleted. A temporary DPAPI-encrypted local test credential allowed recovery after automation interruption and was removed after acceptance. Final existing-business-route checks are recorded below when observed. Interrupted automation/system prompt mismatches are not product passes or product defects.

## Remaining scope

Real iOS Apple/Google/APNs, Mac compilation, phone8A–8H, unaided8G teammate study, native real mailbox verification/reset and the complete final business/FCM route matrix remain separately pending unless explicitly recorded. Earlier Sprint native evidence remains historical and is never relabelled as this APK.
