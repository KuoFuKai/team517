# Product policy — Sprint 7B

This is the source of truth for product direction, not a claim that future behavior is implemented. Current authority remains the backend lifecycle and permissions. UI preference `lastActiveRole` never grants permission. All paid, points and volunteer tasks currently use **Task → Offer → requester selects → helper confirms Assignment**.

The table separates **CURRENT BEHAVIOR** from **FUTURE POLICY**. Statements in the future-policy column are **NOT IMPLEMENTED** unless the current-behavior column explicitly says otherwise. In particular, the demo has no exception-resolution, finance, automatic expiry or production-retention automation.

| Topic | CURRENT BEHAVIOR | FUTURE POLICY / NOT IMPLEMENTED |
| --- | --- | --- |
| Completion dispute | Requester may report an issue; DISPUTED is unresolved | Parties first communicate, then may escalate to platform arbitration. No arbitration tooling or automated resolution exists. |
| In-progress cancellation | No ordinary cancellation once IN_PROGRESS | Future early termination / report issue path; rules and recovery remain to be designed. |
| Helper no-show | No dedicated reporting/penalty flow | Grace period → requester reports Helper no-show → reopen Task; a future reliability record/penalty may apply. Duration/evidence/appeal rules TBD. |
| Requester no-show | No dedicated flow or settlement | Grace period then helper report; compensation/refund decisions TBD. |
| Unfulfilled Task | No automatic expiration job | Future expiration at startAt; possibly requester-defined deadline. No new scheduler or auto-transition. |
| Paid matching | Same Offer/selection/confirmation path | Instant Match may become an explicit future option. No direct paid acceptance now. |
| Backup offers | ACTIVE backups survive selection | Close as NOT_SELECTED only when the chosen helper actually confirms. Pending selection is not a final arrangement. |
| Points | Intended platform value/internal currency concept; current Demo/Preview displays Task metadata only, with no ledger, cash-out or payment settlement | Future direction may allow conversion/withdrawal as money. Legal/compliance, accounting, exchange-rate and implementation design remain future work; no wallet, purchase, transfer, payout or fake success UI. |
| Platform fee | Demo policy is 0% | Future pricing TBD. No fee calculation or accounting has been implemented. |
| Payment disputes | No payment processing | team517/platform handles service disputes. Card chargebacks follow payment-provider/network procedures; they are separate processes. |
| Nearby helpers | Not implemented | Explicit opt-in, approximate location, off by default, no location history; consent/revocation details TBD. Task discovery is a separate existing capability. |
| Messaging retention | Existing emulator data; no production retention automation | Retain messages for a defined period. Duration, lawful retention exceptions and deletion process TBD. |
| Community retention | No production retention automation | Longer-lived posts/resources until user deletion/moderation; exact production policy and deletion implementation TBD. |

## Location and trust

External discovery exposes only backend-projected approximate areas/coarse coordinates, never stored private addresses. Approximation is an MVP strategy, not production-grade anonymization. Current confirmed helpers obtain arrival details through the separately authorized execution endpoint. The client clears these details on backgrounding and lifecycle/access changes. Public instructions must not contain addresses, access codes or medical records.

External helpers require VERIFIED status; trusted-circle relationships retain their existing policy. Development verification is explicitly seeded/mock, not a real identity check. AI is reviewed mock text assistance, not medical advice, real inference or voice transcription.

## Team decisions still needed

Choose no-show grace periods, proof and appeal rules; early termination responsibility; arbitration operations; Task expiry deadlines; retention periods and deletion behavior; Points value and the legal/compliance/accounting/exchange-rate design for the agreed potential cash-out direction; future pricing; and whether paid Instant Match should ever be offered. These decisions must precede their implementation sprints.
