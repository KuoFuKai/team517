# Sprint 7B pre-change audit — November 10, 2026

Architecture inspected before edits: existing string-state navigation, centralized theme/UI primitives, API factories, role preference, safe discovery projection, Assignment panel, Calendar, Reviews, Community, Messaging and persistent notification routing. No replacement navigation/state library is warranted.

Figma metadata was accessible. The design context for **145:3991 / V2 Caregiver Find tasks · List** was retrieved with its screenshot. It specifies warm canvas `#faf7f2`, ink `#122b3d`, teal `#087f79`, line `#ddd9d3`, 20px page padding, compact white cards and five navigation destinations. The next request (145:3299) hit the Starter-plan quota. Only the discovery frame has a retrieved visual reference; metadata alone does not prove visual parity. Existing system font and glyph icons remain approximations, with no invented photos, ratings or finance data.

| Figma frame / concept | Mobile implementation | Existing backend capability | Visual status before changes | Visual/data gap |
| --- | --- | --- | --- | --- |
| 145:3991 Find tasks List | DiscoveryWorkspace | discoverTasks, safe detail, offers | Reference retrieved; current green canvas differs | DM Sans, exact icons and final filter layout |
| 145:4064 Find tasks Map | same discovery source | coarse coordinates | Metadata only | Native map intentionally Sprint 7C |
| 145:3299 Post task; 145:3442 AI draft | EditTaskScreen, AiAssistantPanel | manual draft/publish; mock suggestions | Existing functional sections; screenshot unavailable | No voice transcription; finance preview excluded |
| 145:3479 Task details | TaskDetailScreen | normal Task DTO / Timeline | Existing functional detail | Exact frame parity unverified |
| Offers / selection | OffersWorkspace | summary, select, backups | Existing helper cards and status chips | Public aliases; no invented profile name/avatar |
| 145:3928 Helper Tasks; 145:4179 accepted | MyWorkScreen, AssignmentPanel | full confirmation/execution/completion | Existing status/actions | No direct paid acceptance; prioritize actionable work |
| Calendar / schedule | SupportScreen | bounded Calendar API | UTC presentation inconsistent with Task local time | Align local date grouping, range and visible zone |
| 145:3275 Role switch; 145:3595 / 4254 Me | HomeScreen | actual roles plus preference | Existing functional controls | Exact layout unavailable; preference never authorization |
| Community | CommunityScreen | feed, Needs, resources, comments, likes/save | Existing functional cards | New visual parity unverified |
| 145:4199 Messages | MessagingScreen | Inbox/history/read-only/auth checks | Existing native-validated screens | Manual refresh; no fake live presence |
| Notifications | SupportScreen / PushSettings | persistent history plus real native FCM | Existing native-validated routes | Keep secondary navigation and real permission state |
| Review | ReviewsPanel | immutable submit, aggregate/recent reviews | Singular/plural defect | Public review DTO has no own-assignment lookup; reopen status cannot be authoritative without API expansion |

Sprint 7B scope: reuse tokens/cards across these screens, reduce primary navigation crowding, preserve API/privacy boundaries and record unverified parity. Historical audits below remain unchanged evidence.

## Sprint 7B implementation / review delta

Central theme now uses the retrieved warm canvas, ink, teal and border colors, compact 12px cards and quieter shadow. A reusable TaskPreviewCard serves requester Tasks, Discovery, Helper assignments and Calendar; Community Needs continues to use the same Card/Badge primitives with its underlying safe Task projection. System fonts and existing glyph icons remain explicit reference gaps.

Primary navigation is Tasks / Calendar / Find tasks (actual Helper-capable accounts) / Community / Me. Circle is available through Tasks’ context selector and Me. Inbox and Notifications remain secondary. The existing state architecture, backend roles and authorization are unchanged. No library was added.

Helper work prioritizes confirmation and active responsibility, with state-specific next-step copy. Current arrangements precede offer comparison/history; selection controls precede secondary reviews. Requester lists prioritize completion review/offers and upcoming times. Public versus Arrival details uses ordinary language without changing fields or privacy contracts. Calendar converts local date inputs to ISO instants, groups by device-local day and explicitly names the zone; stored timestamps remain untouched. Singular counts share one formatter.

Native findings led to navigation-key scroll resets, error-only Task scroll reveal, and same-audience Community refresh without content-height collapse. None resets typed input during editing. Screenshots and exact tested scope are indexed in native-acceptance.md; no unobserved Figma screen is marked aligned.

Current historical scope: Sprint 6A Community extension is recorded below; the Sprint 5B mapping is retained as frontend history.

# Sprint 5B frontend audit and screen mapping

Inspected before UI edits: App.tsx owns authentication observer, profile/context selection, global mutation guard and string screen state. TaskWorkspace/DiscoveryWorkspace/MyWorkScreen/SupportScreen own their API data and feature navigation. Each existing operation is through api/client.ts factories with Firebase bearer tokens. Firebase client Auth is the only client Firebase data capability. No reusable UI/theme/navigation library or screenshot/design assets were found. Existing React state is sufficient; no Redux/navigation/map/calendar dependency is needed.

Figma source: https://www.figma.com/design/kRer5BBbNvdSdPkanLC6HT/Patient---Family-%E2%80%94-Schedule?node-id=0-1

Figma session was created; get_design_context (screenshot included) and separate get_screenshot both returned the Starter-plan MCP call-limit error. No frames, tokens, assets or screenshots could be retrieved. The following mappings use the user's named screen concepts, not invented exact frame IDs/layouts. Current V2 visual fidelity cannot be assessed. This pass uses an explicitly approximate, centralized visual language pending reference access.

| Figma concept | Existing screen / coordinator | Existing API calls | Scope for this pass |
| --- | --- | --- | --- |
| Onboarding / authentication | AuthScreen, HomeScreen, App | initializeUser, getCurrentUser; Firebase Auth login/register | Product sign-in, role onboarding and automatic profile load |
| V2 Role switch / Me | HomeScreen | updateRolePreference | Existing roles only; UI mode preference, never authorization |
| Receiver Tasks / status | TaskWorkspace, TasksListScreen | listCareContexts, listTasks, getTask | Card list, consistent status labels and context selector |
| V2 Post/Edit task | EditTaskScreen, LocationsScreen | create/updateTaskDraft, publishTask, create/listLocations | Full incomplete draft/manual fields preserved |
| V2 AI voice/text / draft ready | AiAssistantPanel | improveTaskSuggestion; ordinary updateTaskDraft | Optional reviewed suggestions, honest manual transcript fallback |
| Task details / Offers | TaskDetailScreen, OffersWorkspace | getTask, listOffers, selectOffer, cancelTask | Detail sections, privacy-safe helper cards, backups preserved |
| Helper Tasks / accepted | MyWorkScreen, AssignmentPanel | getMyOffers, getMyAssignments, getAssignment; lifecycle APIs | Existing confirmation/execution/review rules, no direct paid acceptance |
| Find Tasks List / paid details | DiscoveryWorkspace | discoverTasks, getDiscoveredTask, offerHelp, withdrawOffer | Polished list/details using only safe discovery DTOs |
| Find Tasks Map | DiscoveryWorkspace | same discovery API | Explicit approximate-coordinate preview, no map SDK/GPS |
| Calendar | SupportScreen calendar | getCalendar, getTask, getAssignment | Date-grouped UTC agenda; future calendar can reuse contract |
| Notifications | SupportScreen notifications | get/mark/read-all Notifications | Unread/read list and authorized navigation; no push |
| Reviews / helper profile | ReviewsPanel | getHelperReviews, getHelperRatingSummary, submitReview | Available real identity/rating data only; no invented profile |
| Timeline | TimelinePanel | getTaskTimeline | Safe existing projection only |
| Verification | SupportScreen verification | getVerificationStatus | Four server states, no self verification/provider |
| Circle | CareContextsScreen/CreateCareContextScreen | list/create/getCareContext | Existing contexts only; no fake invitations/social logins |
| Points / earnings / payments | No implemented financial screen | compensation metadata only | Explicit deferred information in Me; no balances/transactions |
| Nearby caregivers / Circle Helper directory | No supported directory API | none | Omitted; no fake nearby profiles or matching |
| Community / Messages | No backend/UI feature | none | Omitted from functional navigation |

API inventory reviewed: service.ts (identity/context), tasks.ts (draft/publish/detail/location), ai.ts, marketplace.ts, assignments.ts, support.ts. Existing error transport preserves safe standardized errors; UI will map these to product copy. Privileged execution data stays in an in-memory Assignment panel, clears on actions/refresh/unmount, with no persistence/cache introduced.

State ownership plan: session bootstrap in a small hook; top-level tabs/mode and context in App; existing feature coordinators retain their server state and mutation locks. Shared theme/primitives/cards/formatters apply across screens. Bottom navigation remains outside the scroll region; keyboard avoidance and flexible max-width content address typical phone widths. Backend source/contracts/rules/indexes remain untouched.


## Delivered implementation

- Shared approximate theme and Text/Button/PrimaryButton/SecondaryButton/TextField/TextArea/Card/StatusBadge/Chip/Avatar/EmptyState/LoadingState/ErrorState/InfoRow/SectionHeader primitives, plus AppHeader/BottomNavigation and Task/Offer/Profile cards.
- Automatic session/account bootstrap, first-role onboarding, product auth, Tasks/Calendar/Find tasks/Circle/Me tabs and header Inbox. No app-user JSON, context IDs or debug menu in the product shell.
- Context cards, current/drafts/history task cards, structured Task detail, complete manual editor and optional expandable AI suggestion/manual-transcript panel. Save/publish API behavior is unchanged.
- Discovery list/filter/detail and honest Map preview; own Offer/Assignment sections with safe titles; real Offer/verification/rating cards; existing Assignment lifecycle actions with friendly status text.
- UTC date-grouped agenda, read/unread Inbox cards/navigation, Review form/history, safe activity cards and server verification-state presentation. Deferred finance/identity/map features are explicit; Community/Messages/nearby directory are absent from functional navigation.
- Safe typed-error presentation, per-feature mutation locks, cancellation confirmation, flexible layout and configured safe-area/keyboard/back handling. Execution details clear on background and stale in-flight results are discarded.

Backend source/contracts/rules/API modules are unchanged. No assets were retrieved from Figma and no visual/reference comparison or native rendering was possible. System text glyphs/initial avatars are approximate UI affordances, not substituted Figma assets or invented user photographs. Helper aliases use the last four characters of an authorized helper ID because real profile names/avatars are not in current DTOs. Full profile fidelity is therefore a known gap, not an API redesign.

## Acceptance to perform when tooling is available

At 320/390/430-point widths, exercise sign-in/register/onboarding, multi-role switch, circle selection (including Helper-only trusted member), task tabs, long task form/keyboard, save draft, optional AI preview/apply/discard/unavailable, publish, discovery/filter/map notice, offer/withdraw, owner selection/backups, confirmation/decline, execution details/background clearing, start/request completion, requester approve/dispute, agenda date selection, Inbox read/navigation, review submission/history, timeline and verification. Test repeated taps, failure recovery, back navigation, safe areas, large text and auth reload persistence. No checklist item is marked rendered-native passed in this environment.


A direct web-reader fallback for the supplied Figma URL also reported that the URL was inaccessible. No screenshot/token/layout data was obtained from that fallback. Source-level fixes additionally preserve arrival details when a read-only details request occurs inside the requester Offer workspace, and keep sensitive responses from before backgrounding from being displayed later. These are code-path fixes, not native-device findings.


My Offers uses existing safe discovery details for titles while those tasks remain externally discoverable, and Assignment public-task titles after selection. An unselected Offer on a closed/non-discoverable Task may show the generic Your offer plus its real message/date because the current own-Offer DTO has no title. No full private Task read or new backend contract was introduced to fill that gap. Names/avatars and that closed-Offer title are explicitly future API/product polish rather than fabricated data.


## Sprint 6A extension

Community is now a functional top-level tab using the existing shell/theme. CommunityScreen calls api/community.ts for public/circle/type feeds, post create/detail, comments, Like/unlike, Shares, Resource creation/detail and server saved resources. Need cards receive the existing safe TaskDiscoveryItemDto; View Task uses live Community projection, and Offer to help calls the unchanged api.offerHelp. No new matching/assignment UI state machine, direct Firestore, real link-preview fetch or local fake persistence exists.

Composer selects existing context Tasks (backend rechecks actual management rights) or creates a reusable Resource followed by a referencing post. Known Resource ID is retained if the post step fails. Share preserves root provenance and audience; saved Resources is reachable inside Community. Like/save UI updates after server success, comments preserve text on failed writes, and existing synchronous lock prevents rapid duplicate mutations. Needs show public/coarse Task details only; current confirmed execution details remain in existing Assignment UI.

Figma Community concepts (Needs/Resources/Shares/feed/comments/saved/shared) are implemented as a functional approximation with the established Sprint 5B theme. Current frame assets/tokens remain unavailable from the earlier quota restriction; no exact parity claim or rendered native scrolling/comment keyboard/deep navigation result is made. Messaging was omitted in Sprint 6A and is implemented in the Sprint 6B extension below. Community comment Notifications are deferred; normal Task Notifications from Need-originated Offers still work.


## Sprint 6B extension

Header Inbox now opens MessagingScreen (real GET /me/conversations) while keeping Task updates/Notifications reachable; Me has separate Messages and Notifications entries. ConversationScreen loads/refreshes real HTTP history, supports older sequence pages, real sender alignment/timestamps/basic read flags, read-only mode, retry-safe send identity and bounded read batches. No direct business Firestore listener or periodic refresh exists. Existing keyboard-aware shell/theme is reused without a new navigation/chat framework.

CircleMessagingPanel obtains only active member IDs/aliases via the new protected roster and starts CARE_CONTEXT MessageEntry. Offer review, helper discovery/own-Offer and Assignment panels start TASK conversations. Helper defaults to the Task creator; requester selects one Helper from authorized Offer/Assignment data. No group/fan-out or Community interaction auto-contact is created. NEW_MESSAGE resource navigation opens the same conversation/history, including terminal read-only mode. Existing notifications list is preserved.

All content is real server data; profile names/photos remain unavailable and aliases are explicit. Client IDs are reused for unchanged trimmed text after a failed send; editing starts another logical attempt. No persistent offline outbox is claimed. Read marks up to 200 current incoming messages before reloading history; newer arrivals can remain unread until another explicit action. No fake delivery/presence/typing states, attachment controls or microphone recording are shown. Current Figma visuals are not inspected; established approximate theme is used. No native chat keyboard, scrolling, safe-area, Inbox navigation or polling validation occurred without a configured target.
