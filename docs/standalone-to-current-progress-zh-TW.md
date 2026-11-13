# team517：Standalone APK 首次輸出至目前開發進度報告

報告日期：2026 年 11 月 12 日（America/New_York）  
範圍：Sprint 7B.1 首次 Standalone Android Preview APK → 雲端啟用與原生驗證 → GitHub 協作 → PDF/Figma 頁面對齊 → 最新版面調整。  
程式碼基準：GitHub main / `3b6c90f`。本報告依 repository 文件、Git 紀錄與已保存的原生證據整理，沒有重新執行整套驗收。

## 一、整體成果

team517 已從「可獨立啟動、但雲端尚未驗證的 APK」，推進到「連接真實開發雲端、保留既有業務流程、具背景推播與多頁原生驗證紀錄，且完成多輪介面對齊的內部測試 App」。目前可提供 APK 給團隊安裝測試，原始碼已推送至私人 GitHub repository，最新版 Node 22 CI 通過。

目前仍屬內部 Android Preview，尚不是正式上架版本。實體手機、拔除 USB／一般網路使用及完整現場演示仍待驗收；不能僅依模擬器結果宣告 Sprint 7B.1 全部結案。

## 二、開發里程碑

| 階段 | 主要完成項目 | 當時驗證與限制 |
| --- | --- | --- |
| 1. 首次 Standalone APK，11/11 | 建立 PREVIEW 環境；Expo prebuild + Gradle assembleRelease；打包 Hermes JS；移除 dev-client 依賴 | API36 模擬器可在 Metro／本機 Firebase 停止時啟動登入畫面。當時尚未證明雲端登入、資料或推播可用 |
| 2. 雲端開發環境就緒，11/12 | 啟用 team517-dev 的必要服務；建立 Firestore；部署既有 API／推播 Function；啟用 Email/Password；準備合成測試帳號與資料 | 雲端 smoke 驗證 Auth、Tasks、Discovery、Offer、Community、Messaging、Notifications 與權限；Firestore 20 個索引就緒 |
| 3. Standalone 雲端原生測試 | APK 直接使用雲端；測試登入、角色切換、Discovery、Offer 清單、Community、Inbox、Message send、Calendar | Pixel_9_Pro / Android16 API36 / x86_64；沒有 Metro、本機 Firebase 或 adb reverse 依賴；未使用實體手機 |
| 4. 推播與 Assignment／隱私驗證 | 背景 FCM 的 Conversation／Task／Assignment 通知與點擊導航；Helper 確認、Start、完成申請；精確地點解鎖／清除 | 確認／Start／完成申請為原生操作；建立、發布、Offer、選擇及完成核准部分由合成 peer API harness 執行，不能全部稱為原生點擊 |
| 5. GitHub 協作整理 | 原始碼、測試、文件、lockfile、CI 與合成原生截圖納入版本管理；排除秘密及本機產物 | 私人 repository 已推送；Admin credential、測試密碼、google-services.json、APK、SDK／JDK 等留在本機或另行安全提供 |
| 6. 導航與 Tasks 第一輪對齊 | 依核准 PDF 調整角色導航、Task 狀態分組、緊湊清單與 Post draft 行為 | `aaf7297`；API36 原生檢查與 CI 通過 |
| 7. 功能性 Calendar | 月曆、日期切換、真實任務標記、當日清單、月份／自訂範圍與本地時區處理 | `39b47ac`；涵蓋閏年、跨年、DST、日期分組及返回保留選取日期 |
| 8. 全頁改版與原生修正 | DM Sans／共用 tokens、表單、Task／Offer／Assignment、Auth／角色／Profile、Community、Messaging、Reviews 等布局重整 | `c85287b` → `5ccc90b` → `94f8138`；修正 Android Back 層級、聚焦詳情與聊天呈現 |
| 9. PDF 量測後的第二輪對齊 | 檢視 101 頁 PDF 輸出，量測字級／色彩；重組逐頁資訊層級；補成功頁、取消確認、AI Review、外觀頁；整理對照圖 | `05aaab4`；39 張原生截圖與 8 張同寬比較圖；未將 101 頁視為 101 個獨立已完成功能 |
| 10. 最新乾淨版面調整 | 依使用者要求移除醒目的展示／未連接標示；使用自然空狀態與一般按鈕文案 | `3b6c90f`；未實作寫入仍停用，不虛構餘額／評價；新版 APK 已安裝並檢查 Profile／Points |

## 三、目前功能與介面狀態

### 已存在且保留的業務能力

- Firebase Email/Password 登入與持續登入；多角色 UI 切換，授權仍由實際角色／成員關係／資源關係判斷。
- Care Context／Location；手動 Task 草稿、編輯與發布；既有 AI mock 建議／審核／套用流程。
- Helper Discovery、Offer、撤回、多人 Offer、任務方選擇與 Assignment 狀態流程。
- Assignment 確認、執行、完成申請／核准及既有替代狀態處理；這些是此時專案已有功能，沒有因視覺改版重新設計領域模型。
- Calendar、持久化 Notifications、既有 FCM、Reviews、Timeline、開發用 Verification 狀態。
- Community Feed／Resource／留言／互動與 Messaging Inbox／Conversation／Send／歷史及關係限制。

上述列表表示現有程式能力與回歸涵蓋範圍，不代表每一個狀態都在最新視覺 APK 上重新原生操作過。

### 介面整理成果

- 統一暖色背景、青綠主色、DM Sans、字級層級、卡片、輸入框、按鈕與分段控制。
- 分離任務方與 Helper 底部導航，詳情頁採聚焦標題與返回路徑。
- Tasks／Calendar、Post／Edit、Task Detail、Offer 清單／詳情、Assignment、Discovery、Profile／角色、Circle、Locations、Notifications、Community、Messaging、Reviews 均有對應版面調整。
- 未實作的 Maps、點數／付款、證照／可用時段等保留外觀；依最新偏好，不在畫面上放工程性展示標示。操作並未因此接通真實服務。

### 已修正的實際問題

- Android 返回鍵從 Offer 詳情跳過清單：改為集中管理優先層級。
- 管理 Locations 時可能失去未儲存 Task 欄位：保留隱藏 editor 的狀態並實測返回。
- Helper Assignment／Calendar 詳情殘留根頁分段控制：詳情模式隱藏。
- 在同一 Community 貼文按 Comment 可能清掉未送出留言：只在切換貼文時重設。
- AI 區按鈕換行造成高度不一致、Locations 重複 Back、Resource 重複操作入口：已調整並複驗相關畫面。

## 四、架構、安全與隱私

既有架構維持 Expo → frontend API/service → authenticated HTTP API → backend services → repositories → Firestore。前端沒有直接存取業務 Firestore collections。

- Preview 直接連線 team517-dev HTTPS API；LOCAL 仍使用 Auth9199／Firestore8280／Functions5001／UI4300，Android guest host 為 10.0.2.2。
- 雲端 Firestore 直接客戶端讀寫維持 deny-all；業務存取經既有 API 授權。
- 外部 Helper Discovery／Detail 只取得近似地點；符合條件的已確認 Helper 才能解鎖精確到達資訊。
- 原生證據確認 pending 不顯示精確到達資料、確認後可明確載入，完成加 refresh 後清除；不宣稱無 refresh 的即時撤權已驗證。
- FCM 使用通用通知內容，不將私人地址或聊天正文放入通知 payload。
- Admin credential 未放入 mobile／GitHub；部署身分與 runtime 身分分開。
- 介面改版未改動後端 API／領域規則，paid Tasks 仍沿用 Offer → selection → Assignment，未新增直接接受捷徑。

## 五、驗證結果

| 驗證項目 | 最近已確認結果 |
| --- | --- |
| Node 22 Typecheck | 通過 |
| Backend unit | 22 通過 |
| Mobile/client | 65 通過 |
| Emulator integration | 92 通過 |
| Functions smoke | 通過 |
| Default HTTP 完整流程 | 通過，含 Community／Messaging 回歸 |
| AI mock HTTP 流程 | 通過 |
| Android Hermes export／Release build | 通過 |
| Mobile Firestore 邊界掃描 | 零匹配 |
| Repository secret preflight | 未發現掃描範圍內的秘密 |
| 最新 GitHub CI | `3b6c90f` 完成且 success；與本機測試分開確認 |
| 依賴警示 | 最近 audit：28，1 low／20 moderate／7 high／0 critical；尚未進行強制升級 |

最新 GitHub CI：https://github.com/KuoFuKai/team517/actions/runs/43320520972

原生已實際操作的重點包括：登入／登出與冷啟動持續登入、角色切換、手動草稿儲存與欄位保留、Offer review／withdraw／reactivate、Community 留言、Messaging send、Calendar、Notifications、零評價畫面與完成 Assignment 的地點清除。背景 FCM 與路由證據來自先前雲端原生 checkpoint；最後一次文案調整沒有重新測試 FCM。

## 六、尚未完成／不能宣稱的項目

1. **實體手機與現場演示**：安裝、拔 USB、一般網路／筆電關閉使用與完整 all-native demo 尚待驗收，Sprint 7B.1 尚不能全面結案。
2. **原生測試變體**：停駐軟體鍵盤、極端長內容／字體縮放／無障礙、全部 loading/error／生命週期狀態未在最新 APK 逐項重跑。浮動 Gboard 結果不能代替停駐鍵盤驗收。
3. **通知邊界**：背景通知已驗證；process-absent/cold notification delivery 尚未證明。冷啟動 Auth 成功不等於冷程序推播成功。
4. **Messaging**：完整自動化涵蓋關係結束後唯讀；本輪原生拒絕建立已結束關係聊天，不等於重新驗收了既有終止聊天歷史。
5. **設計素材**：Figma MCP 額度與網頁登入限制仍存在，依核准 PDF 實作；原始 SVG／照片與全部精確 variants 尚未取得，不宣稱像素級完全一致。
6. **未實作服務**：正式 Maps／GPS／Nearby Helper、點數帳務、支付／payout、真實 AI／語音轉錄、真實身份驗證、WebSockets/SSE、iOS／商店正式發布均未完成。既有 FCM 已存在，不應再列為完全未實作。

## 七、最新交付物與建議下一步

- 原始碼：GitHub `KuoFuKai/team517`，main，commit `3b6c90f`。
- APK：`artifacts/android/team517-preview.apk`，40,884,680 bytes；SHA256 `ee14824b172578c1714735d4bdc9b7a7fae5bc1ed7776508b73471afe65468a1`。APK 未提交至 GitHub，需另行分享。
- 團隊接手：clone 可取得原始碼／測試／文件，但 SDK、環境設定、Android client config、授權測試帳號及必要 backend credentials 需依角色另行配置；不是 clone 後無設定即可使用所有服務。
- 優先收尾：實體 Android 完整演示 → 停駐鍵盤與權限變動等原生矩陣補測 → 確認設計素材差異 → 排程依賴修補 → 再評估 Maps 等後續服務。

## 來源文件

- [Standalone／雲端部署與限制](android-preview.md)
- [雲端原生與推播證據](native-evidence/2026-11-12-preview-cloud/README.md)
- [導航與 Tasks 第一輪](design-alignment-batch1.md)
- [Calendar](design-alignment-batch2.md)
- [整體介面改版](design-overhaul.md)
- [PDF 量測／逐頁涵蓋與原生證據](design-fidelity.md)
- [最新乾淨版面](native-evidence/2026-11-12-clean-presentation/README.md)
- [驗證紀錄](validation.md)／[原生矩陣](native-acceptance.md)／[GitHub 協作設定](repository-sharing.md)
