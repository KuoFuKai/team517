# Sprint 8A — internal Points

Work starts from origin/main `1c95779` on `codex/sprint-8a-points`. Existing Kingsley brand and schedule-picker branches were inspected; no new incoming main commits or overlapping teammate changes were found.

First visible slice: Me → My points reads `GET /api/v1/me/points` through the authenticated API/service/repository layer. An absent account projects zero available/reserved/earned/spent without manual setup. The caller identity comes from authentication; no arbitrary-user or mobile balance mutation route exists. Client Firestore rules remain closed. Available and reserved balances are private, separate from reputation. Buy/cash-out remain outside this sprint.

Lifecycle accounting, immutable ledger and fixture grants are the next slices; this checkpoint does not claim them complete. Emulator acceptance proceeds when no phone is connected. Physical vivo checks will be collected later at Kevin's request.

Ledger/history slice: `GET /api/v1/me/points/transactions` returns 20 owner-only entries and an explicit opaque cursor. Cross-owner cursors fail; private source metadata is excluded. Entries are create-only in repository transactions. Backend-only grants use deterministic source identities, so fixture reruns never reset balances or grant twice. Preview fixtures receive manager 1,500 and Alex/Marcus 300 once; LOCAL fixtures follow the same model. Transaction descriptions use ordinary product language. No mobile grant/edit/delete endpoint exists.

Validation checkpoint: initial owner-read emulator suite 93/93 PASS; ledger slice typecheck, 25 backend unit and 93 client tests PASS. Full ledger emulator suite is running; this is not Sprint closure or cloud acceptance.
