# Sprint7B.2 actual physical evidence

Canonical physical target: vivo V2324A / Android14 API34 /1260×2800 @560dpi ≈360dp /font1.12. Synthetic team517-dev content only. Top status bars are cropped; OS alerts are cropped to the team517 card only. Password-entry/system-lockscreen/other-app screenshots are excluded.

- [Nine visible areas](visible-progress.png): Tasks, Post, Task detail, Offers, Assignment, Calendar, Community, Conversation and Profile.
- [Tasks width/font matrix](tasks-width-font-matrix.png) / [Post matrix](post-width-font-matrix.png): actual emulator320/360/390/412dp ×font1.0/1.3. Additional360dp/font0.85 rendered, not another large image set.
- [Seven docked input contexts](docked-keyboard-matrix.png): physical Gboard, not emulator floating keyboard. Login captured before successful English re-entry; Review captured before distribution-label fix. [Fixed review](reviews-fixed.png).
- [Inbox](inbox.png), [Discovery empty/self-excluded](discovery.png), [Notifications](notifications.png), [Circle](circle.png).
- Actual OS [Message](os-message.png) / [Task](os-task.png), resulting [Conversation](push-conversation-route.png) / [Task](push-task-route.png).

Artifact provenance: most core/mobile input captures used candidate SHA256 `d1e6c67cd70b036096bb89d887a51110ba3be21fe81f47a09148c67f6c35a61a`; review fix and physical push routes used `9eef93e9990461cf2d15c9903ac4dcabe26a033509999e6d7e3adfacb4897f9f`; final delivered cold-Auth Tasks and Circle used `2af447b575958703cf7b742e2bf23b288b1367dc4c06db695e41504a96223ae1`. Last candidate reconciles duplicate brand changes (loading/tagline/font weight/dependency cleanup), retaining responsive layout behavior. Do not describe every screenshot as the last APK or every page as tested at every width.

[Full matrix, actions, limits and peer-API distinction](../../sprint-7b2.md). USB-disconnected testing is user-reported separately; these screenshots prove connected physical use, background OS alerts and routing, not killed-process push or every lifecycle variant.
