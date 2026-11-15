# Team 517 — unaided review

Status: **READY to facilitate; actual Yiru / Kingsley study PENDING**. Kevin confirmed November 15 that the review will happen later. Preparation and agent-operated emulator checks are not participant results.

## Before the session — facilitator only

- Use the single [canonical build manifest](review-build.json) and `artifacts/android/team517-8g-review.apk`. Verify SHA256 before distribution; do not switch builds between scenarios. If a BLOCKER forces replacement, stop, record the failed build and affected tasks, then begin a separately identified round.
- Use fictional team517-dev accounts via the private account handoff. Do not paste passwords into notes or chat exports. No real care commitments, addresses or health details.
- Yiru uses the Helper account; Kingsley uses the requester account. Prepare login before timing navigation. Ask permission before recording audio/video; written observation is sufficient.
- Keep this facilitator section and the screenshot baseline away from participants until their attempt is recorded. Do not give a navigation tour, define backend enums, or explain Select / Confirm beforehand.
- Read current fixtures through normal authorized APIs before the session. The December20 **Help with a morning visit** is an unoffered appointment-companionship candidate; December21 **Company for a check-in** has two responses; December18 **Visit availability review**, December19 **New visit time to confirm**, and December22 **Clinic visit timing** are distinct pending-change examples. Earlier histories remain intact; never reset them to manufacture success.
- Kingsley creates a fresh fictional request during his scenario. During a short recorded pause, the facilitator may have two synthetic peer accounts respond through normal authenticated UI/API. Do not replace his new request silently with the prepared two-offer example. If peers cannot respond, record that part as NOT RUN and use the prepared example only as a separately identified comparison exercise.
- No participant is expected to finish a real appointment or wait until December. End-to-end execution belongs to the separately recorded physical acceptance session, not a fabricated study outcome.

## Read aloud

“We are testing the app, not you. Please say what you think the screens mean. Try what you would normally try; I will mostly watch. You may stop whenever you want.”

|Participant / goal to read verbatim|Watch without teaching|
|---|---|
|Yiru: “You have some free time and want to help someone with an appointment. Find a suitable request, understand what is needed, offer to help, and figure out what happens next.”|First tap and pause; List / Map; request meaning; Offer / message / availability; Trust wording; where she expects her Offer and work to appear.|
|Kingsley: “A family member needs someone to accompany them to an appointment. Create a request, review people who offer to help, choose someone, and figure out when the arrangement is confirmed.”|Post discoverability; form hierarchy; compensation; Urgent / Planned; multiple responses; Trust / availability; Select versus Confirm; whose turn follows.|
|Either participant in requester perspective: “Plans changed. Move the appointment to another time and figure out what happens to the selected helper.”|Reschedule discoverability; old / new time; reconfirmation; whether submitted availability changes; replacement expectations.|

Use neutral prompts: “What do you think will happen if you press that?”, “What do you think the current status is?”, “Whose turn do you think it is?” Do not correct an answer immediately. Rough pauses / time-to-first-action are enough; no analytics SDK.

If help is needed, first record the hesitation / failed attempt and time, then record the exact hint. Any subsequent completion is **ASSISTED**, not unaided. If the fixture, network or account fails, identify that separately from participant comprehension.

## Observation sheet — duplicate per scenario

Build SHA / participant / date / account role / device / scenario: ____________________

|Approx. time / first action / pause|Category|Raw action or exact words|Hint, if any|Outcome|
|---|---|---|---|---|
|Not observed yet|PENDING|—|—|NOT RUN|

Categories: **BLOCKED, HESITATED, MISUNDERSTOOD, WRONG EXPECTATION, VISUAL ISSUE, COPY ISSUE, NAVIGATION ISSUE, POSITIVE**. Preserve the participant's words before writing interpretation. Do not classify every pause as a required fix.

After both reviews, keep separate columns for **raw observation → developer interpretation → evidence → recommendation**. Severity: **P0** cannot complete a primary workflow; **P1** completes with meaningful confusion / wrong expectation; **P2** cosmetic / polish. Preference alone is not P0/P1. Policy proposals are **PRODUCT DECISION REQUIRED**, not automatic implementation.

## End questions — ask both

1. What do you think this product does?
2. What was hardest to find?
3. Which wording was confusing?
4. Did Offer → Select → Confirm make sense?
5. Which screen looked least finished?
6. Which screen felt strongest?
7. If we could fix only three things, what would you choose?

Kingsley: “Does this now feel like the product/business we intend to build?”

Yiru: “What are the three largest differences from your intended Figma/design experience?”

## After real observations

Create `docs/team-usability-findings.md` **after the actual review**, covering participants, scenario outcomes, observed successes, P0/P1/P2, product decisions, design feedback and recommended next direction. Include concise raw quotes separately from interpretation. No findings document or usability pass is fabricated now.

Fix only evidenced, high-confidence UI/copy/navigation issues compatible with accessibility and current policy. Fetch teammate work before each batch; validate, commit, push and observe CI. Record policy changes for team decision. No new feature Sprint is selected before evidence.

Physical acceptance is separate: [one combined vivo session](physical-review-checklist.md). Screenshot baseline is for later comparison, not participant training: [baseline/provenance](native-evidence/2026-11-15-review-baseline/README.md).
