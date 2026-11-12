# Android visual-overhaul evidence — November 12, 2026

Actual Pixel_9_Pro / emulator-5554 state device, Android16/API36 x86_64, 1280×2856. Real non-production team517-dev with synthetic accounts/content. Standalone Hermes APK, no Metro. Final installed APK: **40,852,436 bytes**, SHA256 **b53811a1e693f0e878b6bb9dbebe959b623cf7de86c65b1a3d5d517dfc652835**.

Evidence was collected during iterative APK rebuilds. final-* captures show the unchanged relevant layouts before final navigation/assistant refinement; native scheduling captures use 1fd87f5; backfix-* and release-ai-* use the final hash above. They are not all screenshots of a single build, and intermediate keyboard/system-dialog evidence is explicitly labelled. No credential-filled login screenshot is included.

[Overview](overview.png) · [Discovery comparison](compare-discovery.png) · [Community comparison](compare-community.png) · [Conversation comparison](compare-conversation.png) · [Task comparison](compare-task-detail.png). Before/reference/after images have different content, roles where indicated and device frames; no matching percentage is claimed.

| Screen / action | Actual observation | Evidence |
| --- | --- | --- |
| Auth | Rendered, blank sign-in produced validation; actual Helper and manager email/password login succeeded | [Auth](final-auth.png), [validation](final-auth-validation.png) |
| Auth persistence | Existing account survived APK update and cold launch; no uninstall/clear-data | [Account](final-profile.png) |
| Me / roles | Compact settings, dedicated role page; manager→Helper→manager switched real preference | [Me](final-profile.png), [roles](final-role-switch.png) |
| Tasks / draft | Active/drafts/history navigation rendered; one labelled draft saved and reopened with Nov13 11:52AM EST | [Saved drafts](final-saved-drafts.png), [Task list](release-task-list.png) |
| Task editor | Grouped fields, private disclosure, location/priority/visibility/compensation controls, save actions reached through scrolling | [Form](final-post-form.png), [actions](final-form-actions.png) |
| Date/time | Actual native calendar opened, Nov13 selected, time dialog confirmed; saved/reloaded local time retained | [Date](final-native-date-picker.png), [time](final-native-time-picker.png), [selected](final-schedule-selected.png) |
| AI | Final focused notes/transcript entry rendered; hardware Back returned to editor with saved task fields present | [AI](release-ai-entry.png), [Back](release-ai-back-preserved.png) |
| Owner Task | Actual HAS_OFFERS, summary, authorized synthetic location, private disclosure and existing CTA rendered | [Task](backfix-task.png), [actions](release-task-actions.png) |
| Offers | Two ACTIVE synthetic offers; focused detail, real verification, no fabricated rating; selection control rendered, not submitted | [List](backfix-offers.png), [detail](backfix-offer-detail.png) |
| Android Back defect | Before fix detail→Task skipped list. Final fix detail→Offers→Task→Task list tested | [Returned to Offers](backfix-returned-offers.png) |
| Helper work | Actual completed synthetic task displayed after Helper login; no native lifecycle mutation this pass | [Work](final-helper-login.png) |
| Discovery | Verified Alex saw populated list/detail; manager-as-helper empty state also exercised; no exact/private address in Helper detail | [List](final-discovery.png), [detail](final-discovery-detail.png) |
| Calendar | Month grid, selected-day empty state and tabs rendered using existing API | [Calendar](final-calendar.png) |
| Circle | Existing context and compact member/messages disclosure rendered; no new context created | [Circle](final-circle.png) |
| Notifications | Persistent history rendered, existing completion notification opened completed Assignment | [Notifications](final-notifications.png) |
| Assignment / Reviews | Completed arrangement and review form/rating row rendered and scrolled; review not submitted | [Reviews](final-reviews.png) |
| Verification | Actual VERIFIED status rendered; no real KYC | [Verification](final-verification.png) |
| Community | Existing resource post, compact resource preview, author metadata and actions rendered; detail/comments opened during iteration | [Feed](final-community.png) |
| Messaging | Real existing Inbox/conversation; history scrolled, draft text entered without sending | [Conversation](final-conversation.png) |
| Keyboard limitation | Android Try out your stylus system tutorial intercepted normal typing/gestures. Cancel/explicit touchscreen gestures allowed other work. Ordinary keyboard-overlap acceptance remains pending | [System tutorial](final-message-keyboard.png) |

No native pass claimed for all creation/error/loading states, native AI review result, every Assignment transition, native read-only relationship termination, stale-location revocation, physical-phone/iOS, large-font or TalkBack behavior. Backend/API regressions are separate from these rendered-screen observations. Earlier privacy/native lifecycle acceptance remains historical evidence; this UI pass does not replace it.

Issues: no new observed BLOCKER/HIGH; MEDIUM Back-order bug fixed and retested. LOW original icon/asset/precise spacing differences remain under the approved PDF approximation. Full Figma visual acceptance remains open until those differences and the pending native checks are reviewed.
