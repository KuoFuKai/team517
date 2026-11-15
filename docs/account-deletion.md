# Account deletion — internal Preview

Me → Account and sign-in methods → Delete account is an in-app destructive route. Type DELETE and provide recent Firebase authentication (Email/password, Google, or fresh native Apple for an Apple-linked account). Backend independently verifies the Firebase token, UID and auth_time within5 minutes. UI state is not proof. Existing accounts/fixture passwords are not reset by this feature.

`POST /api/v1/me/delete-account` accepts only confirmation and optional transient Apple authorization code. Active requests/drafts, ACTIVE Offers, current responsibility and reserved Points must first be resolved through the existing lifecycle; a409 ACTIVE_COMMITMENTS explains that clearly. No automatic cancellation, Early Termination, accounting transfer/forfeit or invented completion is introduced. This restriction requires product/legal/App Review evaluation before public release, especially for started/disputed arrangements; it is not an App Store compliance guarantee or a new cancellation policy.

## Accepted deletion

1. For an Apple-linked account, require fresh Apple authorization and successful configured provider revocation **before** deactivating. Missing/rejected configuration fails closed; it does not claim deletion/revocation success.
2. Write a durable DELETING tombstone to the existing users record, clear public first name/roles and verification badge. Authenticated API middleware rejects inactive accounts, and initialize/onboarding cannot resurrect that UID.
3. Idempotent cleanup first clears owned device tokens in bounded100-record pages with fresh ownership checks, then disables/removes Firebase Auth identity and revokes sessions. Registration and delivery also reject inactive users, including during external Auth cleanup retries. A token transferred to another user is not disabled by stale cleanup.
4. Mark DELETED after cleanup. Shared transaction/history records remain. HTTP returns DELETED when finished, PENDING when durable retry must finish. The UI distinguishes “Deletion started” from “Account deleted” and leaves via logout.

`finishDeletion` is a retry-enabled Firestore write trigger (including initially uninitialized-account tombstones) scoped to server-written DELETING users. It allows accepted deletion to finish if the initiating connection or external Auth cleanup fails. Client rules still deny business writes; no public administrative endpoint or future collection was added. Duplicate worker executions tolerate missing Auth users and already-completed tombstones. Retry policy may run for the platform's retry period; no guaranteed completion-time/legal retention promise is made.

## Retained / removed data

Removed: Firebase sign-in identity/email/Auth profile, public first name, active account roles/verification, and active owned push token material. Public Trust naming becomes Deleted account where that projection is available. No identity is reconstructed from email/Auth names.

Retained: pseudonymous UID tombstone, shared Task/Offer/Assignment state/history, Reviews, Messages/Community content, audit events, and immutable Points wallet/ledger records needed to avoid corrupting other participants' history. No new Points grant, cash-out, settlement or Trust metric rule. User-authored content can still contain personal information; production retention/content-redaction policy and statutory requirements are **not determined** in this Preview. Do not use real medical/address data in acceptance fixtures.

The preflight responsibility guard is not a redesign of every existing in-flight business transaction. Public-distribution review must cover concurrent account closure/ongoing operations and active-responsibility policy; current protections include API deactivation, original resource authorization and transaction checks. Ordinary core regressions remain required. Do not market this as complete compliance tooling.

## Apple external prerequisite

The source revocation path uses the supported Identity Toolkit `accounts:revokeToken` CODE flow with the fresh Apple code and Firebase ID token. Configure the actual Firebase Apple Services ID/OAuth code-flow credentials and the actual HTTPS `APPLE_AUTH_REDIRECT_URI`; provide backend `FIREBASE_WEB_API_KEY` through backend-only environment configuration. Never store Apple private keys/client secrets in mobile code or Git. Redirect/code-flow behavior must be validated on real iOS before shipping. [Firebase guidance](https://firebase.google.com/docs/auth/ios/apple), [revokeToken API](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/accounts/revokeToken).

Apple credentials are unavailable now: native revocation/deletion is source-prepared and deliberately blocked until configured/tested. Apple provider unlink is disabled so UI unlink cannot evade that requirement. No native Apple revocation pass is claimed. [iOS checklist](ios-readiness.md).

November15 acceptance: real team517-dev cloud signup/onboarding/self-deletion verified Auth removal and old-token401 on the final deployed implementation. API36 native fresh fictional account, before completing onboarding, reached Account options and Account deleted after DELETE + recent password. This does not establish Apple revocation, real mailbox delivery or public-distribution compliance. [Native result](native-evidence/2026-11-15-auth/account-deleted.png).
