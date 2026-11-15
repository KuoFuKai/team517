# One combined vivo acceptance session — 8A–8F

**READY / NOT RUN in 8G.** Current adb inventory contains only the emulator. Per Kevin, continue emulator preparation and wait for the phone without repeated connection requests. Prior phone results are historical, not passes for this APK.

Target: vivo V2324A / Android14 API34 / approximately360dp. Record actual serial privately, package/version, physical size/density, current font scale and input method when available. **Do not change density/font for appearance.** Freeze the [canonical review APK](review-build.json); one install/session, no swapping builds between tasks except a recorded BLOCKER.

Use fictional data only. Each row starts **NOT RUN**. Record native tap evidence separately from synthetic peer UI/API actions, server assertions and Kevin's disconnected-network report. Emulator automation is not physical acceptance.

|Scope|One-session checks|Result|
|---|---|---|
|Preflight|adb state device; verify vivo / API; canonical installed APK hash; Maps / cloud Auth / API / FCM; no debug banner or Tools; existing font/density retained.|NOT RUN|
|8A Points|My Points available/reserved/history; reward input; fresh POINTS draft → publish/reservation; normal completion settlement; Helper earned activity; separate safely prepared cancellation release. Snapshot authorized balances/activity before/after, never patch accounting.|NOT RUN|
|8B Trust|Multiple Offers; summary → Helper Profile → Reviews; zero-review Helper; Message → Back; Select and confirmation feedback. No private email, wallet balance, invented verification/background-check claim.|NOT RUN|
|8C Availability|Offer window; Use task times; actual native picker; provided / unspecified window; COVERS / PARTIAL / CONFLICT comparison and contextual profile. No new recurring availability.|NOT RUN|
|8D Change|ACTIVE and selected edits; covers→covers and covers→partial/conflict; requester review / Keep; peer change while review open → stale rejection / explicit refresh; replacement. Verify Task times, Points and Trust unchanged by these edits.|NOT RUN|
|8E Reschedule|Requester old/new preview; Calendar day move; fit recalculation; selected and confirmed Helper explicit reconfirm; update window if needed; replacement. Submitted availability unchanged by reschedule; reservation intact.|NOT RUN|
|8F Clarity|Render OPEN / HAS_OFFERS / pending / arranged / started / completion pending / completed / availability review / schedule reconfirmation. Record screen meaning, next actor and next action; do not substitute enum inspection for UI.|NOT RUN|
|Docked Gboard|Login, Task title/instructions, Offer message, Community comment, Message composer, Review comment; availability text only if actually present. Each field visible; input preserved after dismissal; action reachable. Log actual docked IME; no floating-keyboard substitution.|NOT RUN|
|Navigation|Hardware Back; nested modal; Offer→Profile→Message→Back; Notification→Task→Back; Calendar→Task→Back; Map→Task→Back; Review modal→Assignment.|NOT RUN|
|FCM|Final build background Task and Conversation OS notifications; tap to correct authenticated current destination; OS text generic, no chat/location/availability/instructions.|NOT RUN|
|Privacy|Synthetic arrival info absent before authorization; visible for valid confirmed Helper; cleared after learned revoked/terminal state and refresh. No real-address screenshot.|NOT RUN|
|Cold Auth|Force-stop and launch; account persists; current Task refreshes; no Metro / local Firebase dependency.|NOT RUN|
|Disconnected|After adb checks, reverse empty, local services off; Kevin unplugs USB and checks launch / Tasks / Calendar / Map / Community / Messaging / Points / Offer/Profile over normal network. Record his exact report separately. Do not claim laptop-off unless actually tested.|NOT RUN|

Fixture inventory (read fresh, never rewind): 8F December18/19/22 change examples, December20 OPEN, December21 two responses; earlier Family appointment POINTS70 draft, availability comparison and active-edit examples are in the private local receipts. Recheck status/eligibility before choosing each; already-completed histories are not execution fixtures. Create distinct synthetic records through normal authorized APIs if needed; do not repeatedly mutate the participant's study Task or consume its pending example during preparation.

Record issues BLOCKER/HIGH/MEDIUM/LOW for physical reliability; keep usability P0/P1/P2 separately. Stop on unsafe/privacy defects, preserve evidence, fix minimally after the observation round, and identify any replacement APK as a new build/round. No participant-comprehension pass follows from agent-operated physical checks.

## Sprint8H follow-up candidate (not the frozen8G participant build)

Physical8A–8H remains NOT RUN. Once Kevin reconnects the phone, use one explicitly recorded8H candidate from [auth-build.json](auth-build.json) for the consolidated engineering pass; do not replace the frozen8G binary during a participant session. Add Email signup/verify/reset/onboarding, real owner-operated Google login/cancel/link, existing-user login, Account/last-method guard, safe fictional-account deletion, logout/switch and cold persistence. Repeat Maps/coarse-location clearing, Points/Trust, Task/Message FCM and disconnected-network checks with exact installedhash. No physical/iOS pass is inferred from API36 evidence. Do not request connection repeatedly.
