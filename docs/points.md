# Sprint 8A — internal Points

Work starts from origin/main `1c95779` on `codex/sprint-8a-points`. Existing Kingsley brand and schedule-picker branches were inspected; no new incoming main commits or overlapping teammate changes were found.

First visible slice: Me → My points reads `GET /api/v1/me/points` through the authenticated API/service/repository layer. An absent account projects zero available/reserved/earned/spent without manual setup. The caller identity comes from authentication; no arbitrary-user or mobile balance mutation route exists. Client Firestore rules remain closed. Available and reserved balances are private, separate from reputation. Buy/cash-out remain outside this sprint.

Lifecycle accounting, immutable ledger and fixture grants are the next slices; this checkpoint does not claim them complete. Emulator acceptance proceeds when no phone is connected. Physical vivo checks will be collected later at Kevin's request.
