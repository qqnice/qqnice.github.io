# 五島網站的手動發布

公開網站：https://qqnice.github.io/
老師入口：https://qqnice.github.io/manage/
發布按鈕：https://github.com/qqnice/qqnice.github.io/actions/workflows/publish-site.yml

## 日常操作

1. 將教材或網站程式推送到 `master`。此時不會發布到 Pages。
2. 開啟老師更新室，按「檢查 GitHub 新版」可比較目前發布與 GitHub 版本；此操作只讀取資訊。
3. 按「前往 GitHub，手動發布」，在 GitHub 按 Run workflow，選 master，再按綠色 Run workflow。
4. 等待 build 與 deploy 都成功。新版本資訊會顯示在老師更新室。

## 設定與資料來源

Pages 的 Build and deployment / Source 必須為 GitHub Actions（API build_type: workflow），不可再從 master 分支自動發布。
`.github/workflows/publish-site.yml` 只有 workflow_dispatch，沒有 push 或排程觸發。只允許 master 發布。
流程會執行 `tools/prepare_publish.py`：重新產生四區教材目錄與文字鏡像、驗證路徑，再產生 site-version.json。
Jekyll 建置保留既有 Liquid includes 與教材頁面。build 失敗時不進行 deploy。

五島網站使用同一發布產物中的 `assets/islands/catalog.json`，不再優先讀取 Cloudflare 的獨立教材目錄，因此發布版本與目錄保持一致。
Cloudflare 的其他服務維持各自用途；本流程不部署 Worker、不寫入 D1 或 R2。網站中的第三方即時資料不屬於靜態發布快照。
YouTube 精選仍由 `assets/islands/youtube-selection.js` 控制。新教材放在 linux、unreal、tpr、admin 對應資料夾，分類規則位於 tools/build_catalog.py。
GitHub 推送與 Pages 發布不會自動更新電腦內的 checkout；本機若需同步，請先提交自身修改，再 git pull --ff-only。

## 專區首頁與 3D 島入口同步

四區 index.html 中的 `<a class="card">` 精選會在手動發布時寫入目錄（標題讀取 strong，說明讀取 span.d），並以相同順序在 3D 島登島畫面顯示前六個。僅採用對應專區內、已納入教材目錄的本地連結。其餘教材可由主題、搜尋或原專區完整目錄開啟。修改首頁卡片後不必另外改寫 3D 導覽。
