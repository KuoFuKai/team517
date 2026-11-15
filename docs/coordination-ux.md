# Coordination and status clarity — Sprint 8F

The UI explains four questions: what is happening, whose turn it is, the next action, and its consequence. `utils/coordination.ts` is a presentation-only model; `CoordinationCard` renders the status, distinct next actor and concise next-step explanation. Existing endpoint authorization, membership, actual resource relationships and transaction checks remain authoritative. Presentation labels never grant an action and `lastActiveRole` is not authority.

| Existing state | Requester explanation | Helper explanation |
| --- | --- | --- |
| DRAFT | Request not published; edit/review/publish | Not a discovery commitment |
| OPEN | Waiting for helpers | Review request / offer to help |
| HAS_OFFERS | Helpers responded; Review offers | Still open for an offer, unless own Offer context overrides |
| AWAITING_CONFIRMATION / PENDING_CONFIRMATION | Waiting for selected Helper | You've been selected; Confirm task or decline |
| ARRANGED / CONFIRMED | Help arranged; no action needed now | You're scheduled to help; Start task when help begins |
| IN_PROGRESS | Help is in progress; no current action | Request completion after finishing |
| COMPLETION_PENDING | Your turn; Confirm completion or report issue | Waiting for requester approval |
| COMPLETED | Completed / task complete; available reviews/activity | Completed / task complete; existing reward activity |
| DISPUTED | Completion needs attention; no implemented resolution action | Same existing resolution boundary |
| Cancelled/declined relationship | Arrangement ended; inspect current Task | No current commitment; inspect current Task |

## Two independent review cases

Helper changes availability: Requester sees **Alex updated availability / Your turn / Review availability**. Helper sees **Your availability needs review / Waiting for requester**. Keeping the Helper selected is acknowledged visibly and still requires Helper confirmation.

Requester changes Task schedule: Requester sees **Waiting for Alex to confirm the new time**; Helper sees **Task schedule changed / Your turn / Review new schedule**. Strict8E coverage and exact revision confirmation remain unchanged. Where both guards exist, requester availability review takes precedence for the next actor; the Helper cannot bypass it. Old/new comparisons appear only while the corresponding review is unresolved. One primary current availability block is used rather than duplicating it beneath the comparison.

## Hierarchy and safe context

Task title and current requested time lead into the coordination card. Important primary actions use existing handlers. Instructions, compensation, history, Message, cancellation and reschedule remain secondary. Requester copy uses the latest already-authorized Offer/Assignment projection rather than stale parent status. No new API or DTO is required. Pending Helper summaries first hydrate the existing protected Assignment endpoint; before that, they say to open the arrangement rather than guessing whose turn it is. Secondary chips use neutral Selection pending / Confirmation needed. Opening a row fetches current protected detail, so an incomplete summary cannot briefly offer a misleading confirm action. Calendar only loads existing authorized relationship/profile context for rendered rows; no global name cache. A safe contextual public display name comes from the established Trust projection. There is no email, Auth display-name or UID-suffix name fallback. Missing safe names use neutral Helper / task-participant / care-circle labels; explicit LOCAL fictional presentation retains its documented demo identities.

Task-specific chat says **Task conversation**, with send/read-only relationship context. It does not add private Task detail or new messaging authority. Calendar prioritizes current coordination state. Persistent notification headings and Timeline use the same product vocabulary, without raw enum names, actor IDs, metadata, wallet details or private locations. Events not provided by the API are never fabricated. OS push payloads remain generic and unchanged.

## Feedback, grammar and responsive behavior

Selection, availability review, confirmation, start, completion request and completion approval have visible acknowledgment, not only card reordering. Refreshing a peer-updated state does not claim the user performed that mutation. In-flight duplicate-tap locks remain. Review errors and refresh controls stay beside their review actions; ordinary failures become visible at the status/recovery area without discarding form input. No unseen-state automatic retry.

The existing small `countLabel` formatter handles helper/offer/review/point singular/plural. Focused headers allow controlled two-line titles with fixed Back/action hit areas, no arbitrary font shrinking. Narrow content stacks and scrolls. See the dated native matrix for actually exercised widths/font scales rather than claiming an unrendered device.

## Minimal backend exception discovered during validation

No Task/Assignment model, state, transition, Points or Trust redesign. An intermittent local Firestore contention recurrence exposed an error-boundary defect: one concurrent confirm committed correctly, while another exhausted SDK transaction retries and returned unknown500. The narrow mapper now returns existing409 `CONFLICT` for numeric ABORTED10 with transaction/contention details, excluding vendor details from the response. SDK retry behavior, transaction bodies and original concurrency assertions are unchanged. Unknown errors remain500. This does not claim the emulator will never abort a transaction; the original failure evidence is retained.

No automatic matching/ranking, scheduling expansion/provider calendars, Payments, real providers or iOS work. Combined8A–8F phone and unaided teammate comprehension checks remain separate from engineering/emulator acceptance.

If a readable Task lacks protected management context, use neutral state copy and Refresh rather than inventing requester authority. Actual authenticated Assignment helperId determines Helper perspective even when the navigation preference is requester mode. When both review guards exist, show current availability once and one requester decision group; forward both existing revisions for guarded cancellation.
