# Sprint 1 through Sprint 3A API

## Sprint 7A additions

All use existing Firebase bearer authentication/error envelope. Device APIs derive user identity from middleware and reject unknown input fields.

November 10 real FCM acceptance confirmed these contracts from an SDK 55 Android development APK. Native cold/warm taps still call the recipient-only Notification endpoint followed by the current Task/Assignment/Conversation endpoint. The native launch fix adds no endpoint or authorization shortcut. Business domain API contracts remain compatible.

| Method / path (under /api/v1) | Request | Response |
| --- | --- | --- |
| POST /me/device-tokens | token (20–4096 native FCM characters), platform=android, deviceId? (1–128), appVersion? (1–64), deliveryEnabled? (boolean, default true) | DeviceTokenDto: id, platform, enabled, registrationId, lastSeenAt |
| GET /me/device-tokens/:id | SHA-256 token ID | Own DeviceTokenDto; absent/other owner 404 |
| POST /me/device-tokens/:id/disable | registrationId (UUID) | { disabled: true } idempotent acknowledgement; only matching owner/generation is changed |
| GET /notifications/:id | Existing notification ID | Recipient-only NotificationDto; absent 404 / other recipient 403 |

Raw tokens/ownership documents and private push attempt metadata are never returned. A 400 rejects arbitrary userId/enabled/registrationId on registration. Unauthorized calls use existing 401. Registration requires an initialized user (404 USER_NOT_FOUND). Same active-owner token is idempotent; transfer/reactivation rotates registrationId. Disable acknowledgement does not disclose another owner's registration. Only safe status DTOs are shared; backend DeviceToken models are not exported to mobile.

deliveryEnabled=false allows an opted-out account to take inactive ownership atomically after account switching, without briefly enabling alerts. It changes only the caller's delivery preference, never ownership authorization. Known permanently invalid tokens cannot reactivate (409 PUSH_TOKEN_INVALID); use a fresh native token. Push data contains notificationId/resourceType/resourceId only. Tap fetches recipient Notification, then current authorized resource; it does not grant access, mark read or create product history. [Push lifecycle, failure semantics and limits](push-delivery.md) supplement the existing persistent Notification contract below.

Base path: `/api/v1`. Local function URL: `http://localhost:5001/demo-team517/us-central1/api/api/v1`. The first `api` is the function name; the second begins the versioned Express path. Set the frontend API base URL as a whole; client features know only ordinary HTTP endpoints.

All endpoints except health require a Firebase ID token in `Authorization: Bearer <token>`. JSON request bodies are limited to 16 KB. Unknown fields are rejected. Dates are ISO 8601 strings. The canonical DTO definitions are in `packages/contracts/src/index.ts`.

| Method / path | Request | Response |
| --- | --- | --- |
| GET `/health` | none | 200 `{ status: "ok", service: "team517-api" }` |
| GET `/me` | none | 200 UserDto; 404 before initialization |
| POST `/users/initialize` | `{ primaryOnboardingRole: "CARE_MANAGER" }` | 200 UserDto, including on repeated calls |
| POST `/care-contexts` | `{ name: "Mom's care" }` | 201 CareContextDto |
| GET `/care-contexts` | none | 200 `{ careContexts: CareContextDto[] }` |
| GET `/care-contexts/:id` | generated context ID | 200 CareContextDto for active members |

UserDto: `id`, `roles` (array), `primaryOnboardingRole`, optional `lastActiveRole`, `onboardingStatus` (`STARTED` or `COMPLETE`), `createdAt`, `updatedAt`. Roles: `CARE_RECEIVER`, `CARE_MANAGER`, `HELPER`. Initialization sets a single selected role and STARTED status; subsequent calls return the saved record without changing roles. The model supports multiple roles; role editing and onboarding completion are deferred.

CareContextDto: `id`, `name`, `createdBy`, optional `careReceiverUserId`, `status` (`ACTIVE` or `ARCHIVED`), `createdAt`, `updatedAt`. Creation trims names and accepts 1–120 characters. Receiver association and archival endpoints are deferred.

Errors: `{ error: { code: string, message: string, fields?: { field: string, message: string }[] } }`. Statuses: 400 invalid request, 401 missing/invalid authentication, 403 insufficient role or membership, 404 missing app user/resource/endpoint, 409 initialization required or invalid task state, 500 unexpected server error. An inaccessible context returns 403 without revealing whether it exists. A task lookup returns 404 for a missing task and 403 for a present inaccessible task. Initialization is idempotent; resource creation is not, so clients must avoid automatic POST retries.

## Sprint 2A endpoints

Paths below follow the same `/api/v1` base. Every operation requires authentication and an initialized app user. IDs are generated 20-character resource IDs. Unknown draft/location fields are rejected, including backend-controlled task fields.

| Method / path | Body | Response |
| --- | --- | --- |
| POST `/care-contexts/:careContextId/locations` | CreateLocationRequest | 201 LocationDto |
| GET `/care-contexts/:careContextId/locations` | none | 200 `{ locations: LocationDto[] }` |
| POST `/care-contexts/:careContextId/tasks/drafts` | CreateTaskDraftRequest, possibly `{}` | 201 TaskDetailDto with DRAFT status |
| PATCH `/tasks/:taskId` | UpdateTaskDraftRequest | 200 TaskDetailDto, DRAFT only |
| POST `/tasks/:taskId/publish` | `{}` | 200 TaskDetailDto with OPEN status and publishedAt |
| GET `/tasks/:taskId` | none | 200 TaskDetailDto |
| GET `/care-contexts/:careContextId/tasks` | none | 200 `{ tasks: TaskSummaryDto[] }`, authorized statuses, newest first |
| POST `/tasks/:taskId/cancel` | `{}` | 200 TaskDetailDto with CANCELLED status |

CreateLocationRequest: `label` (1–80 trimmed characters), `formattedAddress` (1–500), optional `latitude` (-90…90) and `longitude` (-180…180), supplied together. LocationDto includes those fields plus `id` and `careContextId`. It omits creator/internal timestamps. Location references are checked on draft creation/update when provided and again in the publish transaction.

CreateTaskDraftRequest / UpdateTaskDraftRequest share optional fields: `title` (max 120), `helpType` (max 80), `instructions` (legacy, max 5000), `publicInstructions`/`privateInstructions` (max 2000 each), `startAt`, `endAt` (ISO datetime with offset), `locationId`, `urgency`, `visibility`, `compensationType`, `pointReward`, `cashAmount`, `currency`. Each field may be null to clear it. Empty/omitted text can be saved; publish requires nonempty trimmed text. Finite positive numeric values are required when supplied; points must be integers. Both numeric fields are capped at 1,000,000. A missing reward is permitted in an incomplete draft. Currency, if supplied, must be three uppercase letters. Drafts may contain an incomplete or conflicting compensation selection until publish validation; invalid numeric/enumerated values are never accepted. The UI clears irrelevant compensation fields when saving a changed type.

Stable enum values:

- TaskUrgency: `PLANNED`, `URGENT`.
- TaskVisibility: `CARE_CIRCLE`, `VERIFIED_HELPERS` (private details remain circle-restricted; VERIFIED_HELPERS allows eligible external discovery of safe public fields).
- TaskCompensationType: `VOLUNTEER`, `POINTS`, `PAID`.
- TaskStatus: `DRAFT`, `OPEN`, `HAS_OFFERS`, `AWAITING_CONFIRMATION`, `ARRANGED`, `IN_PROGRESS`, `COMPLETION_PENDING`, `COMPLETED`, `DISPUTED`, `CANCELLED`.

Publish requires title, helpType, publicInstructions or legacy instructions, startAt, endAt, locationId, urgency, visibility and compensationType. startAt must precede endAt; dates are not otherwise required to be in the future in this development slice. VOLUNTEER rejects reward, amount and currency fields. POINTS requires a positive integer pointReward and rejects cash/currency. PAID requires positive cashAmount and currency and rejects points. Cash amount is metadata in major currency units, not a transaction or precision guarantee. No accounting/payment collections exist.

TaskSummaryDto: `id`, `careContextId`, optional `title`, `startAt`, `urgency`, and `status`. TaskDetailDto adds `createdBy`, optional helpType/instructions/publicInstructions/privateInstructions/endAt/locationId/visibility/compensationType/pointReward/cashAmount/currency, `createdAt`, `updatedAt`, and optional `publishedAt`. Backend-only offerCount, activeAssignmentId and event metadata are omitted. Firestore timestamps never cross the API boundary.

Active context members can read locations and create drafts/locations. DRAFT tasks remain creator/active-context-manager-only; a global app manager role is insufficient. Other Task statuses retain circle-member reads. Only creator/active manager can edit/publish/cancel, with editing/publish still DRAFT-only. Cancel is permitted only before execution, including pending/confirmed Assignments, which it closes atomically. CANCELLED is terminal. No-op draft updates keep timestamps/history unchanged.

## Sprint 3A endpoints

All paths use the same authenticated `/api/v1` base. No direct paid acceptance, confirmation/decline/start/completion endpoints exist.

| Method / path | Input | Result |
| --- | --- | --- |
| GET `/tasks/discover` | latitude?, longitude?, radiusKm?, urgency?, compensationType? query | TaskDiscoveryListDto |
| GET `/tasks/:id/discovery` | Task ID | TaskDiscoveryItemDto, discovery-safe detail |
| POST `/tasks/:id/offers` | OfferHelpRequest `{ message? }` | 201 OfferDto |
| POST `/tasks/:id/offers/mine/withdraw` | `{}` | 200 OfferDto, WITHDRAWN |
| GET `/tasks/:id/offers/mine` | Task ID | MyOfferDto `{ offer: OfferDto|null, taskStatus }` |
| GET `/tasks/:id/offers` | Task ID | OfferListDto `{ offers: OfferSummaryDto[], task: TaskOfferStateDto }` |
| POST `/tasks/:id/select-offer` | SelectOfferRequest `{ offerId }` | SelectOfferResponse `{ task, assignment }` |
| GET `/assignments/:id` | Assignment ID | AssignmentDto |
| PATCH `/me/preferences` | `{ lastActiveRole }` | UserDto, choosing only an existing role |

Discovery accepts paired latitude (-90…90)/longitude (-180…180); radius is positive, at most 100 km, and needs coordinates. Urgency/compensation use existing enums. Unknown parameters and arbitrary limits are rejected. Response includes `tasks`, `candidateLimit:100`, `resultLimit:30`, `truncated`. Filtering/distance ordering applies to that bounded candidate set; truncated or empty results are not proof of exhaustive geographic coverage. Missing coordinates are allowed in unfiltered discovery but excluded by radius filters.

TaskDiscoveryItemDto contains id/title/helpType/startAt/endAt/status (OPEN or HAS_OFFERS)/urgency/compensationType, optional reward/amount/currency, approximateLocation, optional integer distanceKm and offerCount. It may include publicInstructions and omits legacy/private instructions, addresses, stored location labels/IDs, context/receiver/creator IDs and internal document fields. ApproximateLocationDto is `{ areaLabel, latitude?, longitude? }` with generic wording and a 0.02° coarse representative, never an exact stored pair. Distance is based on that coarse representative. No geocoding, GPS or production privacy guarantee is implied. Public title/helpType must not contain private data.

Offers use deterministic `{taskId}_{helperId}` IDs, ACTIVE/WITHDRAWN/SELECTED implemented states, and reserved NOT_SELECTED/EXPIRED values. Message is trimmed and at most 1,000 characters. Duplicate ACTIVE creation returns 409; reactivation reuses ID/createdAt and updates updatedAt/message. OfferDto is id/taskId/helperId/message?/status/createdAt/updatedAt, with assignmentId only in the selected helper's own-Offer response. No private location data is included. OfferSummaryDto adds available verificationStatus for authorized managers and never invents ratings/name/avatar data.

TaskOfferStateDto is `{ id, status, offerCount, activeAssignmentId? }`, deliberately separate from the existing TaskDetailDto. Count includes ACTIVE plus SELECTED, not WITHDRAWN. Selection leaves backups ACTIVE and count unchanged. Withdrawal decrements and changes HAS_OFFERS to OPEN only when the final response is removed. Backup withdrawals during pending selection are allowed; selected withdrawal is not. Task cancellation retains history but closes live Offers as NOT_SELECTED and zeroes count.

AssignmentDto contains id/taskId/offerId/helperId/selectedBy/status (see Sprint 4 states below)/selectedAt/createdAt/updatedAt. Task and Assignment creation, Offer selection and HELPER_SELECTED event commit atomically. The selected helper or active owner/context manager can read this metadata, but selection grants no private Task/location access. Explicit lifecycle APIs are documented below.

Eligibility: actual global HELPER role; no offering on one's own Task; active circle membership may bypass verification for trusted-circle tasks. External discovery/offering requires VERIFIED and VERIFIED_HELPERS visibility. Legacy/missing verificationStatus defaults to UNVERIFIED. Verification is backend-controlled; role preference cannot change roles/verification. Offer review/selection is restricted to active creator/context manager, not random members or competitors. Own-Offer reads expose only the actor's record; without an existing Offer, normal response eligibility is required.

Errors preserve the existing envelope: TASK_NOT_OFFERABLE (409 for accessible closed tasks, 404 in unavailable discovery detail), OFFER_ALREADY_ACTIVE (409), OFFER_NOT_FOUND (404), OFFER_NOT_ACTIVE (409), TASK_NOT_SELECTABLE (409), ACTIVE_ASSIGNMENT_EXISTS (409), HELPER_NOT_VERIFIED (403), FORBIDDEN (403), CONFLICT (409 for inconsistent count), plus validation/auth errors. A private inaccessible Draft can return FORBIDDEN before offerability checks. Existing private Task/context-location endpoints retain circle permissions; the separate execution projection below unlocks only the current confirmed Helper.

Example incomplete publish response:

```json
{
  "error": {
    "code": "TASK_NOT_READY",
    "message": "Task is not ready to publish.",
    "fields": [{ "field": "title", "message": "Title is required." }]
  }
}
```

Field messages are descriptive and may vary; clients should use code/field identifiers, not match message text. General schema errors use `VALIDATION_ERROR`; invalid/mismatched locations use `INVALID_LOCATION` with locationId field feedback. Task events have no public endpoint in this sprint.

## Sprint 2B AI endpoints

| Method / path | Request | Response |
| --- | --- | --- |
| POST `/ai/task-suggestions` | `{ careContextId, text, timezone, currentTaskId? }` | 200 TaskDraftSuggestionDto; no creation/mutation |
| POST `/tasks/:id/ai-suggestions` | `{ text, timezone }` | 200 TaskDraftSuggestionDto for authorized DRAFT editing |
| POST `/tasks/:id/ai-summary` | `{}` | 200 AiTaskSummaryDto under normal task read authorization |

GenerateTaskSuggestionRequest: valid context ID, trimmed text of 1–5,000 characters and explicit IANA timezone, optionally a same-context editable Draft ID. ImproveTaskSuggestionRequest has text/timezone and uses the path Task ID. Arbitrary fields, models, generation parameters, audio blobs and URLs are not accepted. All endpoints require Firebase authentication, initialized app user and authorized context/task access. Improvement of OPEN/CANCELLED returns 409 INVALID_TASK_STATE. No provider result writes Task status or invokes publish.

TaskDraftSuggestionDto: `fields` (a partial TaskDraftFields), optional `locationText` and derived `summary`, `missingFields: string[]`, `warnings: string[]`, `providerMode: "MOCK" | "REAL"`, `generatedAt`, and optional `sourceTaskUpdatedAt` when based on an existing draft. Fields use existing startAt/endAt ISO names rather than duplicate suggested-time names. Null proposes clearing an existing value. Internal reasoning is never returned. MissingFields is computed by backend publish validation and may include inconsistent compensation/time fields. Incomplete suggestions are valid previews and may be saved as DRAFT.

Provider structured output is stricter than this public DTO: it cannot return Location IDs or any backend-owned fields, providerMode/readiness/version metadata or arbitrary keys. The backend may attach a unique existing Location ID after context-scoped label matching; otherwise it preserves locationText and proposes locationId=null to clear an old location and require user selection. Normal PATCH validates referenced locations again.

Apply is deliberately **not** a separate AI endpoint. User-selected `fields` go through `PATCH /tasks/:id`, leaving status DRAFT. Final publication is still `POST /tasks/:id/publish`. No AI-specific TaskEvent, collection, status or provenance field is added.

AiTaskSummaryDto: `summary` (1–800 characters), `warnings`, `providerMode`, `generatedAt`, `taskUpdatedAt`. It is generated on demand, never stored/cached as business state, and represents that saved Task version only. If a Task changes during generation, request returns 409 AI_STALE_TASK. UI invalidates old summaries when the Task version changes.

AI errors preserve the `{ error: { code, message, fields? } }` envelope:

- 400 INVALID_AI_INPUT: malformed/oversized text, invalid timezone or unknown request fields.
- 503 AI_NOT_CONFIGURED: default/unsupported provider setting; continue manually or explicitly enable emulator mock mode.
- 503 AI_UNAVAILABLE: provider failure or 8-second deadline; no mutation.
- 502 AI_INVALID_RESPONSE: malformed/unsafe provider output; no mutation.
- 409 AI_STALE_TASK: saved Task changed during provider work.
- Existing 401 UNAUTHENTICATED / 403 FORBIDDEN retain the established unauthorized-access semantics; no incompatible UNAUTHORIZED code is introduced.

The client preserves AI-specific failure codes and handles NETWORK_ERROR separately. It also has a readable TRANSCRIPTION_FAILED fallback message for a future speech adapter, but **no recording/upload/transcription endpoint is implemented**. Voice entry currently accepts a manually reviewed transcript in the same text field flow. No audio is collected, stored or published. No paid AI calls or secrets are required for tests.

## Sprint 4 Assignment APIs

All paths below are relative to `/api/v1`, require a Firebase bearer token, and use the existing error envelope. No controller accepts arbitrary Task/Assignment state fields.

| Method/path | Request | Result / caller |
| --- | --- | --- |
| GET `/me/offers` | none | `{offers: OfferDto[],limit:50,truncated}`; own helperId only, newest updated first, selected current assignmentId when available |
| GET `/me/assignments` | none | `{assignments: AssignmentDto[],limit:50,truncated}`; own helperId only, including terminal history |
| GET `/assignments/:id` | none | metadata-only AssignmentDto; assigned Helper or active owner/context manager |
| GET `/assignments/:id/execution` | none | AssignmentExecutionDto; current confirmed working Helper only |
| POST `/assignments/:id/confirm` | `{}` | AssignmentDto; selected Helper, pending -> confirmed |
| POST `/assignments/:id/decline` | `{}` | AssignmentDto; selected Helper, pending -> declined |
| POST `/assignments/:id/cancel` | `{}` | AssignmentDto; requester pending/confirmed or Helper confirmed |
| POST `/assignments/:id/start` | `{}` | AssignmentDto; Helper confirmed -> in progress |
| POST `/assignments/:id/request-completion` | `{}` | AssignmentDto; Helper in progress -> completion pending |
| POST `/assignments/:id/confirm-completion` | `{}` | AssignmentDto; requester completion pending -> completed |
| POST `/assignments/:id/dispute` | `{reason?:string}` | AssignmentDto; requester completion pending -> disputed; reason trimmed 1-500 chars |

AssignmentDto/AssignmentSummaryDto include existing IDs/status/selectedAt/createdAt/updatedAt and optional confirmedAt, startedAt, completionRequestedAt, completedAt ISO timestamps. Status is PENDING_CONFIRMATION, CONFIRMED, IN_PROGRESS, COMPLETION_PENDING, COMPLETED, DECLINED, CANCELLED_BY_HELPER, CANCELLED_BY_REQUESTER or DISPUTED. They never contain exact location, general instructions or dispute reason.

AssignmentExecutionDto contains assignmentId, taskId, optional title/helpType/startAt/endAt and `location:{label,formattedAddress,latitude?,longitude?}`. It omits general Task instructions and all unrelated medical/care/profile data. Only paired confirmed/arranged, in-progress or completion-pending current work permits this read. Pending, declined, cancelled, completed and disputed execution reads return 403 LOCATION_NOT_VISIBLE (or FORBIDDEN for a different user). General Task/location endpoints still require circle membership.

Confirmation closes backup ACTIVE Offers as NOT_SELECTED and reduces count to 1. Pending decline/cancellation clears activeAssignmentId and preserves ACTIVE backup count; Task becomes HAS_OFFERS or OPEN. Confirmed cancellation reopens OPEN with count 0 and stale NOT_SELECTED backups remain closed. Helpers can explicitly reoffer WITHDRAWN/NOT_SELECTED records; creation caps actionable count at 100. Task cancellation closes all live Offers and pending/confirmed Assignment atomically, sets CANCELLED/count 0 and clears relationship. It is allowed only before execution starts. Completed Task retains activeAssignmentId for history, but not exact-location access.

Invalid/repeated transitions return 409 ASSIGNMENT_NOT_CONFIRMABLE, ASSIGNMENT_NOT_DECLINABLE, ASSIGNMENT_NOT_CANCELLABLE, TASK_NOT_STARTABLE, COMPLETION_NOT_REQUESTABLE or COMPLETION_NOT_CONFIRMABLE. State races produce one commit and one conflict. Requests accept strict empty bodies except dispute. Forbidden actions return 403 FORBIDDEN. No internal Firestore exception details reach clients. Events append compact Assignment/Offer IDs, never location/instructions/reason.

No direct paid acceptance, settlement or no-show API is present; Sprint 5A Review/in-app Notification APIs are below. DISPUTED has no resolution API in this Sprint.


## Sprint 5A support endpoints

All paths are relative to /api/v1 and require authentication. Public DTOs contain ISO strings, never Firestore models. Unknown request properties are rejected for writes/date query. Existing error envelope is unchanged.

| Method/path | Request | Response |
| --- | --- | --- |
| GET `/me/calendar` | start/end ISO offset timestamps, increasing, max 93 days | CalendarDto `{tasks,limit:100,truncated}` |
| GET `/me/notifications` | none | `{notifications:NotificationDto[],limit:50,truncated}` |
| POST `/notifications/:id/read` | `{}` | NotificationDto; recipient only; stable first readAt |
| POST `/me/notifications/read-all` | `{}` | `{marked,limit:200,truncated}`; newest 200 records only |
| POST `/assignments/:id/reviews` | `{rating:integer 1-5,comment?:string(1-1000)}` | 201 ReviewDto; active owner/manager, completed non-self Assignment |
| GET `/helpers/:id/reviews` | none | `{reviews:ReviewDto[],summary,limit:20,truncated}` |
| GET `/helpers/:id/rating` | none | HelperRatingSummaryDto `{reviewCount,averageRating?}` |
| GET `/tasks/:id/timeline` | none | `{events:TaskTimelineEventDto[],limit:100,truncated}` |
| GET `/me/verification` | none | `{status,canDiscover,message}` |
| GET `/assignments/:id/task` | none | `{taskId,title?,publicInstructions?}`; assigned Helper or active owner/manager |

CalendarTaskDto: taskId/title?/startAt/endAt/status/roleInTask (REQUESTER or HELPER)/assignmentId?/helperId?. No addresses, instructions or care-context IDs. startAt range is [start,end); ongoing tasks beginning before start are not included. At most 20 memberships, 50 range Tasks per context, newest 100 Helper relationships and 100 results are considered; bounds set truncated. Requester means active creator/context manager. Helper requires their own current meaningful Assignment; backup Offers alone do not add calendar entries. DRAFT/CANCELLED are excluded. UTC agenda is a development UI, not recurrence or calendar synchronization.

NotificationDto: id/type/resourceType/resourceId/title/body/readAt?/createdAt. Recipient ID and internal delivery data are not returned. Records are created with the source lifecycle event atomically, not as asynchronous best-effort side effects. Generic body contains no address/instructions/profile. Task creator is the MVP requester-side recipient; selected Helper receives selection/completion result, and arrangement cancellation informs the counterpart. No self notices. Sprint 7A adds post-commit FCM delivery; its failures never undo this persistent record. Mark-all is bounded to recent records; older unread history can remain and is disclosed by truncation.

ReviewDto: id/rating/comment?/reviewerLabel/createdAt. Reviewer label is generic Requester; no reviewer/context/task/assignment IDs. Authenticated initialized users may read Helper review history/summary. Rating averages use indexed Firestore aggregation and omit averageRating when count=0. Each reviewer has one immutable Review per completed Assignment; different authorized managers may independently review. No review modification endpoint. Errors: 409 REVIEW_NOT_ELIGIBLE before completion, 409 REVIEW_ALREADY_EXISTS for duplicate, 403 FORBIDDEN for unrelated/self/inactive reviewer, 400 VALIDATION_ERROR for invalid rating/comment/unknown fields.

TaskTimelineEventDto: type/label/createdAt only. Generic allowlisted history, no event IDs/actors/raw metadata. Circle visibility follows normal Task reads/draft privacy. Related external Helpers receive appropriate generic history and only their own Offer/selection events, never competing details. Unrelated discovery viewers receive 403 FORBIDDEN.

TaskDraftFields and owner/manager TaskDetailDto now support publicInstructions/privateInstructions (optional 0-2000 characters in drafts, null clears). Legacy instructions remains 0-5000 and is never copied automatically. Publish requires nonempty public or legacy instructions. Discovery DTO and AssignmentPublicTaskDto expose publicInstructions. AssignmentExecutionDto adds publicInstructions/privateInstructions only under current confirmed/in-progress/completion-pending execution authorization; general Assignment metadata never gains private text. Ordinary circle Task readers do not get new privateInstructions; owners/active managers do. Completed/declined/cancelled/disputed execution remains forbidden. Neither field is for medical records, diagnoses or medication lists. Public text and Review comments must exclude private information; no semantic moderation is implemented.

VerificationStatusDto reports UNVERIFIED/PENDING/VERIFIED/FAILED from server state and actual role-based canDiscover. No self-verify/upload/write endpoint exists. Backend discovery checks remain authoritative. All unresolved Sprint 4 lifecycle policies remain unchanged.


## Sprint 5B frontend consumption

No endpoint, request, DTO, authorization or domain change was made for the frontend pass. api/*.ts is unchanged. The product shell automatically calls getCurrentUser after Firebase Auth restoration; role preference still uses PATCH /me/preferences among existing roles. Inbox's header unread dot reflects unread records in the existing bounded recent Notification response, not an invented global unread total. My assignments obtains available titles from GET /assignments/:id/task; it never loads full private Task documents for external Helpers. Display labels/alias IDs and friendly errors are presentation only. All mutations remain server-authoritative and have no optimistic lifecycle transitions. Existing bounded history/query semantics and privacy projections remain authoritative.


## Sprint 6A Community APIs

All paths are relative to /api/v1 with Firebase bearer authentication. Public Community requires initialized server-VERIFIED status (any role); circle scope requires active context membership instead. No lastActiveRole-based authorization. Existing error envelope applies.

| Method/path | Request | Result |
| --- | --- | --- |
| GET `/community/feed` | type? NEED/RESOURCE/SHARE, careContextId? | CommunityFeedDto `{posts,limit:30,truncated}`; absent context means public verified feed |
| POST `/community/posts` | CreateCommunityPostRequest | 201 CommunityPostDto |
| GET `/community/posts/:id` | none | `{post,comments:{comments,limit:50,truncated}}` |
| GET `/community/posts/:id/comments` | none | CommunityCommentsDto |
| POST `/community/posts/:id/comments` | `{body}` | 201 CommunityCommentDto |
| POST `/community/posts/:id/like` | `{}` | updated CommunityPostDto, idempotent current-user Like |
| POST `/community/posts/:id/unlike` | `{}` | updated CommunityPostDto, idempotent current-user unlike |
| POST `/community/posts/:id/share` | `{visibility,careContextId?,body,title?}` | 201 root-normalized Share; repeats return existing same ID/caption |
| POST `/resources` | `{title,summary,category,url?,visibility,careContextId?}` | 201 ResourceDto |
| GET `/resources/:id` | none | current authorized ACTIVE ResourceDto |
| POST `/resources/:id/save` | `{}` | `{saved:true}`; deterministic current-user save |
| POST `/resources/:id/unsave` | `{}` | `{saved:false}`; own cleanup allowed after access ends |
| GET `/me/saved-resources` | none | `{resources,limit:50,truncated}`; unavailable resources omitted |

CreateCommunityPostRequest is strict: type NEED requires taskId; RESOURCE requires resourceId; SHARE requires originalPostId. All have body (trimmed 1-3000), optional independent title (1-120), visibility PUBLIC_VERIFIED/CARE_CIRCLE and context only for CARE_CIRCLE. Irrelevant resource/task/original fields, author IDs and counters are rejected. NEED creation uses normal Task ID and requires active owner/context manager plus a published OPEN/HAS_OFFERS Task. A public Need requires VERIFIED_HELPERS Task visibility; circle destination must match Task's context. Missing Task is 404; inaccessible sharing is 403; non-actionable Task is 409 TASK_NOT_OFFERABLE.

CommunityPostDto: id/authorId/authorLabel/type/title?/body/visibility/likeCount/commentCount/liked/createdAt/updatedAt, with taskId/taskPreview?, resource?, originalPostId/originalAuthorId/original? or unavailable. Need preview is the exact TaskDiscoveryItemDto projection (public text/coarse coordinates only), derived live without duplicated Task document fields. Closed/restricted Task preview is unavailable. Share embeds at most one authorized root. Missing/restricted originals omit content and original provenance IDs. No careContextId or private profile is returned in post DTOs. Author labels are transparent Member-ID suffix aliases because profile names/photos are not available.

CommunityCommentDto: id/authorId/authorLabel/body/createdAt, with trimmed body 1-1000 characters. Flat only; parentCommentId/replies are rejected. Comment count includes all created records; no delete/edit API exists. ResourceDto: id/title/summary/category/url?/status ACTIVE/saved/createdAt. Title 1-120, summary 1-2000, category 1-60, optional HTTPS URL max 2000 without credentials. No backend URL fetch. Archived Resources return 404 RESOURCE_UNAVAILABLE. Visibility is inherited and rechecked by post preview/save/list. No save count/Like coupling or raw save records are returned.

Like/save IDs are deterministic resource/user pairs. Like and comment counters are backend-owned transactional fields. Duplicate Like/save and Share requests are safe; distinct comment POSTs remain distinct. No optimistic local counter increment is required. Feed/comments/saved lists are bounded recent windows, without cursor/exhaustive-history guarantee. Shared originals intersect source/destination visibility; a public original shared into a circle still requires verification to embed its contents.

Errors include 403 COMMUNITY_VERIFICATION_REQUIRED, FORBIDDEN and VISIBILITY_MISMATCH; 404 NOT_FOUND/RESOURCE_UNAVAILABLE; 409 TASK_NOT_OFFERABLE/SHARE_UNAVAILABLE/CONFLICT; 400 VALIDATION_ERROR for malformed/irrelevant fields. Need offer action is NOT a Community endpoint: use existing POST /tasks/:id/offers with unchanged eligibility, self/duplicate checks, count and lifecycle semantics. Community cannot unlock exact Task location/privateInstructions. Comments are shared post discussion, not Messaging. No Community Notification or moderation API is present.


## Sprint 6B Messaging API

All paths below use /api/v1, authenticated bearer identity and existing error envelope. Shared contracts are public DTOs only; private Firestore Conversation/Message documents never cross the API.

| Method/path | Request | Response |
| --- | --- | --- |
| GET `/me/conversations` | none | `{conversations:ConversationSummaryDto[],limit:50,truncated}` |
| POST `/conversations` | `{scope:CARE_CONTEXT,careContextId,otherUserId}` or `{scope:TASK,taskId,otherUserId}` | ConversationDetailDto; get-or-create deterministic pair |
| GET `/conversations/:id` | none | `{conversation,messages:MessagesDto}` |
| GET `/conversations/:id/messages` | before? positive sequence cursor | `{messages,limit:50,truncated,nextBefore?}`; chronological page |
| POST `/conversations/:id/messages` | `{text,clientMessageId}` | 201 MessageDto, same result for duplicate identical send |
| POST `/conversations/:id/read` | `{}` | `{marked,unreadCount,limit:200,truncated}` |
| POST `/tasks/:id/conversations` | `{otherUserId?}` | ConversationDetailDto; default Task creator, server derives context |
| GET `/care-contexts/:id/messaging-members` | none | `{members:[{id,label}],limit:50,truncated}`; active caller membership required |

The last two are small entry-point support APIs: discovery DTOs intentionally omit Task creator/private context IDs, and no member roster existed. They avoid weakening discovery/profile privacy or asking the client to invent contact permissions. Task requester UI supplies the authorized Helper ID from Offers/Assignments. No arbitrary group/participant list/permission flag is accepted.

ConversationSummaryDto: id/scope/taskId? or careContextId?/otherParticipant{id,label}/lastMessagePreview?/lastMessageAt?/unreadCount/canSend/createdAt. TASK omits careContextId. Previews are at most 80 user-authored Unicode characters; no automatic Task content. Inbox includes only caller pairs, sorted lastMessageAt desc then createdAt desc, newest 50. No Inbox cursor yet. ConversationDetailDto includes newest chronological Message page and current canSend. Labels are explicit member-ID aliases, not fabricated profile names/photos/emails.

MessageDto: id/conversationId/senderId/text/clientMessageId/sequence/createdAt/readAt?. Text trims to 1-2000 UTF-16 characters; HTML angle brackets/non-text control characters and extra attachment/edit fields are rejected. clientMessageId is 8-100 alphanumeric/underscore/hyphen characters, generated once per logical client send. Required sender identity is always token-derived. Content is immutable. Same sender/conversation/client ID and identical trimmed text returns existing Message without another Notification/time/counter update; different text returns 409 CLIENT_MESSAGE_ID_CONFLICT. A successful old-send retry is allowed as participant history after termination; a new send is not.

CARE_CONTEXT requires both initialized active members to create/send. TASK requires active owner/context-manager requester plus valid active Offer/current Assignment Helper; no arbitrary external or helper-to-helper contact. ACTIVE Offer uses existing verification/role/visibility eligibility and OPEN/HAS_OFFERS/AWAITING_CONFIRMATION states. Current selected PENDING_CONFIRMATION/CONFIRMED/IN_PROGRESS/COMPLETION_PENDING matches Task/Offer/activeAssignmentId. Cancelled/completed/disputed Task or withdrawn/not-selected/terminal Helper is read-only, unless a genuinely new live relationship exists. Removing a circle member makes that circle conversation read-only; any Task scope is a separate pair. lastActiveRole has no permission meaning.

Actual participants keep read-only history and read marking after termination. No new inactive conversation can be created. Read selects up to 200 oldest incoming unread messages, never caller-sent messages, preserving existing readAt and an exact remaining unread counter. Use truncated to continue. Message listing uses before=nextBefore for older pages, with sequence ordering independent from timestamp ties. Inbox count is full incoming unread count, not just the visible 50. Notification read state is independent from Message read.

NEW_MESSAGE extends existing NotificationType and CONVERSATION resourceType. One generic recipient-only Notification commits atomically with each new Message; no body text is placed in Notification, no sender notification. Sprint 7A delivers its push through the shared post-commit service. Existing lifecycle Notifications are unchanged. Notification navigation rechecks participant access/current canSend.

Errors: 404 CONVERSATION_NOT_FOUND/NOT_FOUND; 403 FORBIDDEN, CONVERSATION_NOT_ALLOWED or MESSAGING_RELATIONSHIP_INACTIVE; 400 MESSAGE_EMPTY/MESSAGE_TOO_LONG or VALIDATION_ERROR; 409 CLIENT_MESSAGE_ID_CONFLICT/CONFLICT. No Firestore internals or private Task data are exposed. This API is HTTP refresh only, not realtime/presence or a general chat platform.
