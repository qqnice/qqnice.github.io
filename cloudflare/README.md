# QQ 知識海域的 Cloudflare 連線

網站仍部署在 GitHub Pages，改由老師手動發布。五島網站讀取同一發布版本的 `assets/islands/catalog.json`，不再優先讀取 Worker 的獨立目錄。老師更新入口為 `/manage/`；操作說明見 `tools/MANUAL_PUBLISH.md`。R2 儲存桶維持私有，Worker 只提供 `public/` 前綴檔案的唯讀網址。

| 資源 | 名稱 | 用途 |
| --- | --- | --- |
| D1 | `qqnice-site-db` | 92 筆教材索引，資料表 `lesson_catalog` |
| R2 | `qqnice-site-files` | 教材圖片與附件，預設 Standard、私有 |
| Worker | `qqnice-site-api` | 讀取 D1、R2，提供網站 API |

API 網址：`https://qqnice-site-api.qqnice-mb.workers.dev`

- `GET /catalog`：回傳 D1 的教材索引 JSON。
- `GET /media/<檔名>`：讀取 R2 中 `public/<檔名>` 的物件。
- 沒有公開寫入 API；新增或更動資料需從 Cloudflare 控制台或 Wrangler 執行。

## 維護獨立 D1 教材索引（五島網站已不使用此來源）

修改網站的 `assets/islands/catalog.json` 後，在這個資料夾執行：

```sh
python3 build_catalog_sql.py
npx wrangler d1 execute qqnice-site-db --remote --file catalog.sql
```

`catalog.sql` 使用 `INSERT OR REPLACE`，會更新同 ID 教材。若刪除教材，也要從 D1 刪除相應 ID，避免舊資料仍出現在 API。部署 Worker 程式可在本資料夾執行 `npx wrangler deploy`，或從 Cloudflare 控制台的 Worker 編輯器部署。使用 Wrangler 時先以 `npx wrangler login` 登入同一個 Cloudflare 帳戶。

## R2 圖片與附件

在 R2 控制台將可公開展示的檔案上傳至 `qqnice-site-files/public/`。例如物件 `public/example.png` 的網站網址是 `https://qqnice-site-api.qqnice-mb.workers.dev/media/example.png`。R2 儲存桶本身不開放公開讀取，Worker 只處理讀取請求。

## 免費額度與帳務

截至 2026-10-26，D1 Workers Free 方案每日含 500 萬列讀取、10 萬列寫入，總儲存量 5 GB；單一免費資料庫上限 500 MB。Workers Free 每日含 10 萬次請求。R2 Standard 每月含 10 GB-month、100 萬次 Class A、1000 萬次 Class B 操作，超額會計費；預算提醒只是通知，不會自動停止用量。

官方文件：[D1 定價](https://developers.cloudflare.com/d1/platform/pricing/)、[D1 限制](https://developers.cloudflare.com/d1/platform/limits/)、[R2 定價](https://developers.cloudflare.com/r2/pricing/)、[Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)、[預算提醒](https://developers.cloudflare.com/billing/manage/budget-alerts/)。
