# Helper trust profile

Sprint8B adds a server-owned, authenticated trust read model and native Offer comparison. [Delivery, acceptance, evidence and limitations](sprint-8b-report.md).

## Public fields

`HelperTrustSummaryDto`: userId, displayName, verificationStatus, completedTaskCount, optional averageRating, reviewCount. `HelperTrustProfileDto` adds optional memberSince (YYYY-MM), optional task-scoped relationship, recentReviews(max5), reviewLimit and reviewsTruncated. OfferSummaryDto has additive optional trust/relationship fields; raw domain documents stay backend-only.

Safe display name comes only from a validated optional backend-controlled publicFirstName; otherwise a stable Helper alias. No inferred Auth/legal name, email, phone, exact address/access instructions, private verification evidence, wallet or Points balance. No avatar/bio data is fabricated. Public self profile from Me uses the same projection.

## Access and Circle relationship

`GET /api/v1/helpers/:id/profile?taskId=...` requires initialized authentication and an actual HELPER target. Unscoped reads do not reveal Circle membership. Optional Task scope reuses VIEW_OFFERS and validates the matching Task/context/Helper Offer; only authorized creator/active manager can obtain comparison context. Ordinary Circle members and other Helpers are denied. Active membership is distinct from verification. A Circle member may be unverified externally yet eligible under existing trusted-circle rules. lastActiveRole remains a navigation preference.

## Verification semantics

UNVERIFIED/PENDING/VERIFIED/FAILED are existing server-controlled states. Preview uses controlled synthetic fixtures. VERIFIED does not mean KYC, professional licensing, background/criminal-record checking or a safety guarantee. No identity provider, document upload or background-check service was implemented; any future real provider must remain behind the existing server boundary and revise policy/copy explicitly.

## Sources and bounds

Completed-task count uses server COUNT of completed Assignments, authoritative under the existing atomic terminal Task/Assignment completion invariant. Cancelled/disputed/incomplete relationships do not count. Existing Review COUNT/AVG supplies real count/average; zero reviews omit the average and display No reviews yet. Recent Reviews reuse the existing safe Requester/comment/rating/date projection, bounded to5 with truncation metadata; the separate existing Reviews API remains bounded20. Reviews are immutable and duplicates are prevented by existing policy.

Counts are freshly computed, never permanent Offer snapshots or seeded numeric counters. Offer summaries batch users/memberships and use4aggregate workers (at most8 aggregate operations concurrently). Comparison explicitly caps100historical Offers, reading101 to detect overflow; it never silently hides active candidates. A new assignments/helperId/status index supports count queries. Greater-scale paging/search and aggregate cost optimization remain future work.

## Interaction and fixtures

Profile/list/detail Message reuses existing Task Conversation authorization. Conversation's contextual profile entry appears only after server-authorized lookup; safe returned name is reused, otherwise the existing generic alias remains. Profile uses an independent Modal scroll context so Android Back preserves the underlying comparison list.

Select opens an explicit cancelable confirmation: Helper must still confirm, backups remain available. Existing transactional selection and in-flight tap guard are preserved. Normal flow is Offer→Select→Helper Confirm, including PAID metadata Tasks; there is no direct paid acceptance path.

Guarded `npm run preview:trust -- --project team517-dev` creates five fictional VOLUNTEER histories through normal Task/Offer/Assignment/Review APIs, then three comparison Offers. Local ignored receipts preserve progress and immutable Reviews; unexpected states stop rather than reset. Wallets are asserted unchanged. Alex6completed/3reviews/4.7, Marcus2/2/5.0, Sam0/no reviews/unverified Circle were actually rendered. These are synthetic demonstration histories, not real community help/research.

No real identity/background provider, public Points, Payments, cash-out, purchase, fees or iOS work. Physical8A and8B acceptance remain separate pending checklists; emulator passes do not close them.
