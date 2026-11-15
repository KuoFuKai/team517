# Task rescheduling — Sprint 8E

November14–15 acceptance: engineering, guarded development-cloud and API36 emulator checks completed within the [46-item report](sprint-8e-report.md) and [actual evidence](native-evidence/2026-11-15-task-reschedule/README.md). Consolidated physical acceptance remains queued.

Task startAt/endAt remain authoritative. An authorized active Task owner/manager may explicitly reschedule OPEN, HAS_OFFERS, AWAITING_CONFIRMATION or ARRANGED before execution. The currently selected Helper cannot reschedule their own assignment through manager privileges. DRAFT retains its ordinary editor; executing, disputed and terminal Tasks reject this operation.

Existing scheduleRevision defaults to0. Different normalized instants increment it; identical retry is read-only. Preview and commit require expectedRevision and expectedAssignmentId (explicit null for no relationship), and commit revalidates both. A selected/confirmed Assignment keeps its ID but becomes PENDING_CONFIRMATION, Task AWAITING_CONFIRMATION, requiresHelperReconfirmation true. Previous accepted time stays separate from the latest proposal. Repeated proposals replace only the current Task window.

Every selected Helper must explicitly confirm the current schedule revision, even when availability still covers it. Conflicting, partial or unspecified availability must first be updated to COVERS_TASK, or the Helper may Decline. Covering availability is not confirmation. Ordinary Confirm cannot bypass the new schedule gate. Start and exact execution/location detail also validate the accepted schedule revision. Existing 8D availability review remains separate; requester-initiated reschedule supersedes the previous requester-review requirement, while subsequent non-covering Helper edits still follow8D.

ACTIVE Offers retain their original availability, message, revision, timestamps and identity. Fit is computed against the current Task window. No auto withdrawal, ranking or replacement. Pending backups remain ACTIVE; backups already closed by an earlier actual confirmation remain closed. After a confirmed relationship is declined, Helpers may explicitly re-offer using the existing flow; they are never silently reactivated.

Task-lock transactions serialize reschedule, select, availability edit, reconfirm, decline, cancellation and Start. Same-window and same accepted confirmation retries create no duplicate writes/events/notifications. Events TASK_RESCHEDULED/SCHEDULE_RECONFIRMED carry compact revision/identity metadata, not dates, instructions or locations. One persistent Task update per affected Helper; selected Helper routes to current Assignment, active external Helper to own safe Offer. FCM stays generic. Requester gets no self-notification.

Internal Calendar and Map/detail read the authoritative Task time; no duplicated old-date entry. Foreground/manual data refresh uses existing bounded queries, not external provider sync. Rescheduling itself never changes Points reservation/ledger, Trust, verification, Task location or submitted Helper availability. Completed/execution semantics and existing cancellation/replacement remain authoritative. Previously obtained privileged location data clears on app background or learned invalidation; polling is bounded refresh, not instantaneous revocation transport.

Public APIs:

- POST /api/v1/tasks/:id/reschedule/preview
- POST /api/v1/tasks/:id/reschedule
- POST /api/v1/assignments/:id/reconfirm-schedule

Reschedule request: startAt, endAt, expectedRevision, expectedAssignmentId. Helper confirmation: expectedRevision. Selection adds optional scheduleRevision, required to match after a Task has been rescheduled. Decline/guarded pending cancellation carry expectedScheduleRevision. Stable409 errors include SCHEDULE_STALE, TASK_NOT_RESCHEDULABLE, SCHEDULE_RECONFIRMATION_REQUIRED, AVAILABILITY_UPDATE_REQUIRED and SCHEDULE_NOT_RECONFIRMABLE. All use existing error/auth contracts.

Guarded development fixtures: npm run preview:scheduling -- --project team517-dev --mode prepare; --mode smoke. Normal authenticated APIs only, private ignored receipts, no ADC/direct aggregates/delete-all. The smoke reserves20 existing development Points through ordinary Task publication, verifies no reservation/ledger mutation during reschedules, then uses ordinary Task cancellation to release them. Partial smoke receipts stop for inspection rather than rewind.

Future: recurring/global availability, provider calendars, Task interruption/Early Termination, no-show, Payments, real providers and iOS. None introduced here. Consolidated8A/8B/8C/8D/8E vivo acceptance remains pending until an actual phone session.
