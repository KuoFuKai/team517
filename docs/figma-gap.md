# Figma alignment gaps — Sprint 7B

Current implementation: [PDF-based batch 1](design-alignment-batch1.md) updates role navigation and receiver Tasks/By status, with native before/after evidence. Other body screens and exact original font/icon fidelity remain open. Do not treat the older approximation labels below as acceptance.

**November 12 audit supersedes the unknown-visual-reference limitation for the sampled PDF pages:** the user supplied a 101-page Figma PDF export. All pages were inventoried; 16 were rendered/reviewed against actual Preview baselines and frontend code. The fresh Figma MCP requests still hit Starter-plan quota, so authoritative tokens/assets remain unavailable. See [alignment audit and implementation plan](figma-alignment-plan.md), [complete page inventory](design-audit/2026-11-12/page-inventory.csv) and labelled comparison boards there. The following Sprint 7B table is historical and its “close approximation” description is not current visual acceptance. No UI redesign was implemented in this audit.

Source file: [Patient / Family — Schedule](https://www.figma.com/design/kRer5BBbNvdSdPkanLC6HT/Patient---Family-%E2%80%94-Schedule?node-id=0-1).

Metadata and **145:3991 / V2 Caregiver Find tasks · List** design context were retrieved November 10, 2026. That response included a screenshot. The next Post-task request hit the Starter-plan quota. Metadata indicates frame names, not visual fidelity. No other V2 screenshot is claimed as inspected this sprint.

Closure audit, November 11: this is the last observed access result. No new Figma fetch was attempted in this documentation-only pass; quota availability has not been freshly rechecked. **Visual parity is not verified.** “Implemented / close approximation” describes existing UI, not a pixel-perfect comparison. The remaining categories are **Needs visual comparison**, **Missing future backend capability** and **Intentionally deferred**.

| Product area / frame | Classification | Existing UI and remaining gap |
| --- | --- | --- |
| Role switch 145:3275 | Needs visual comparison | Actual-role buttons and saved UI preference work; screenshot unavailable |
| Receiver Tasks | Needs visual comparison | Shared compact cards, status filters, important/upcoming ordering; latest frame parity unverified |
| Post Task 145:3299 / AI preview 145:3442 | Needs visual comparison | Functional draft form, public/arrival copy and reviewed mock suggestions; exact layout unavailable |
| Task Detail 145:3479 | Needs visual comparison | Existing information sections and arrival privacy; exact frame parity unverified |
| Offers | Needs visual comparison | Safe aliases, verification, real ratings/messages and earlier Select action; unavailable profiles are not fabricated |
| Helper Find Tasks List 145:3991 | Implemented / close approximation | Retrieved warm/teal/ink reference informed shared cards; system font, glyphs, filters and navigation still differ |
| Helper Tasks / Assignment 145:3928 / 145:4179 | Needs visual comparison | Next-action guidance and existing lifecycle; generic Offer → Select → Confirm retained |
| Calendar | Needs visual comparison | Local-day agenda, explicit zone and shared cards; no recurrence or advanced scheduling |
| Community | Needs visual comparison | Existing feed, Need, resource, share, comment, like/save controls; audience controls compacted; latest reference unavailable |
| Messaging 145:4199 | Needs visual comparison | Existing Inbox, composer, history and read-only relationship state; manual refresh remains honest |
| Notifications | Needs visual comparison | Existing persistent history, unread state and real Android push; no new categories/backend behavior |
| Me/Profile 145:3595 / 145:4254 | Needs visual comparison | Actual roles, circle entry, permission settings, mock verification and sign-out; no invented profile information |
| Points/Earnings, buy/exchange, transfer out | Missing future backend capability | Coming-later copy only; no ledger, wallet, cash-out, payment, payout, balance or fake success |
| Map 145:4064 / GPS | Intentionally deferred | Honest existing placeholder and shared safe data; native Maps is Sprint 7C |
| Nearby Helper location | Missing future backend capability | Separate future opt-in policy; no helper-location discovery/history implementation |
| Direct paid acceptance / Instant Match | Intentionally deferred | Paid Tasks use the same Offer → Select → Confirm flow today |

The reference includes static SVG icons. Existing native glyphs are retained and explicitly marked approximate; no temporary Figma asset URL is used at runtime. DM Sans/custom icon parity and additional frame retrieval remain follow-up design work, not grounds for claiming pixel-perfect completion. The five-destination maximum is a deliberate adaptation to preserve the functional Calendar and secondary Inbox/Circle rather than replacing working navigation.
