# Google Antigravity 開發前置環境準備與下載安裝手冊（學生與教師專用）

> **適用對象**：準備開始使用 Google Antigravity 進行 AI 輔助寫程式、製作互動教學網頁、執行 Python 資料分析或串接 GitHub 發佈網站的老師與學生。  
> **內容核對日期**：2026-10-26  
> **安全原則**：請一律從各工具的官方網站或系統官方套件管理工具（`winget` / `Homebrew`）下載安裝，切勿下載來路不明的破解版或第三方打包檔。

---

## 一、核心觀念解答：為什麼用 Antigravity 還需要安裝 Python、Node.js 與 Git？

許多第一次接觸 **Google Antigravity** 的師生會問：*「Antigravity 不是下載安裝就能直接打開用了嗎？為什麼還要另外裝 Python 或 Node.js？」*

### 1. Antigravity 本身啟動「不需要」Python，但 AI 幫你做事時「需要調用它」！
- **Antigravity 主程式**（Antigravity IDE / Antigravity 2.0）是獨立的桌面應用程式，下載安裝後即可直接開啟並與 AI 對話。
- 但 Antigravity 是 **Agentic AI（代理型 AI 開發夥伴）**——它不只是在聊天室吐出程式碼讓你自己複製，而是會**直接在你的電腦背景執行終端機指令、跑腳本、啟動測試伺服器、打包專案**。
- 當你請 Antigravity：
  - 寫並執行 **Python 程式、資料分析、爬蟲或自動化腳本**
  - 在本機啟動網頁預覽伺服器（例如 `python3 -m http.server 8765`）
  - 安裝並使用官方 **Antigravity Python SDK**（`pip install google-antigravity`）
  - 執行科學計算或資料分析相關的 **Skills（技能包）**
  - 👉 **你的電腦系統裡就必須裝好 Python（建議 Python 3.11 或 3.12+）**，AI 才調用得到！

### 2. 還需要另外安裝 VS Code 等其他程式碼編輯器嗎？
- **不需要另外裝！Antigravity IDE 本身就是功能完整的專業程式碼編輯器。**
- Antigravity IDE 底層採用與 **VS Code（Visual Studio Code）** 相同的核心架構，內建：
  - 完整的檔案樹管理、多國語言程式碼語法高亮、內建終端機（Terminal）
  - **Antigravity Tab**：智慧預測下一步程式碼與游標跳轉（按 `Tab` 接受）
  - **Inline Command（`Cmd + I` / `Ctrl + I`）**：反白任一段程式碼，直接下指令請 AI 重構、加上繁體中文註解或修正錯誤
  - **Sidebar Chat & Agent Mode**：側邊欄多步驟 AI 協作代理，可自動讀寫檔案、執行測試與預覽
- **如果你原本就有裝 VS Code 呢？** 兩者可以完全和平並存，Antigravity 甚至支援直接匯入你原本在 VS Code 習慣的主題與外掛設定。

---

## 二、讓 Antigravity 隨時能自己調用的「4 大黃金工具箱」總覽

在正式下載 Antigravity 之前（或剛裝好 Antigravity 時），建議把以下 4 個常用基礎工具準備好，未來開發時 AI 就能直接調用，不會遇到 `command not found`：

| 優先順序 | 工具名稱 | Antigravity 會在什麼時候自動調用它？ | 建議版本 | 官方下載網址 |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Git + GitHub CLI (`gh`)** | 自動備份程式碼版本（`git commit`）、透過瀏覽器 8 碼一鍵登入 GitHub、自動建立儲存庫並發佈 GitHub Pages 網站。 | 最新穩定版 | • Git：[git-scm.com/downloads](https://git-scm.com/downloads)<br>• GitHub CLI：[cli.github.com](https://cli.github.com/) |
| **2** | **Python + `uv`** | 執行 Python 腳本、啟動本機網頁預覽伺服器（`http.server`）、資料分析、安裝 `google-antigravity` SDK。搭配 **`uv`** 可用極速建立虛擬環境與執行工具。 | **Python 3.11 或 3.12+**<br>（Windows 必勾 `Add to PATH`） | • Python：[python.org/downloads](https://www.python.org/downloads/)<br>• uv：[docs.astral.sh/uv](https://docs.astral.sh/uv/) |
| **3** | **Node.js (LTS)** | 開發前端互動網頁（React / Vite / Next.js），以及**啟動超過 80% 的 MCP 擴充伺服器（透過內附的 `npx` 指令）**。 | **LTS 長期支援版**<br>（如 v20 或 v22 LTS） | • Node.js：[nodejs.org](https://nodejs.org/) |
| **4** | **Google Chrome** | 搭配 Antigravity 內建的 **Browser Automation 與 Chrome DevTools MCP**，讓 AI 自動打開瀏覽器幫你測試網頁、檢查排版與除錯。 | 最新穩定版 | • Chrome：[google.com/chrome](https://www.google.com/chrome/) |

---

## 三、分步安裝指南（Windows 與 macOS 對照）

你可以選擇**「方法 A：終端機一行指令快速安裝（推薦老師與進階同學）」**，或是**「方法 B：去官網下載安裝包點擊安裝（推薦初學者）」**。

### ⚡ 方法 A：終端機一鍵安裝四大工具（最快、最不容易漏勾 PATH）

#### 🪟 Windows 10 / 11（使用內建 `winget`）
請在開始選單搜尋 **PowerShell**（建議按右鍵「以系統管理員身分執行」），貼上以下指令並按 Enter：

```powershell
# 一次安裝 Git、GitHub CLI、Python 3.12 與 Node.js LTS
winget install -e --id Git.Git
winget install -e --id GitHub.cli
winget install -e --id Python.Python.3.12
winget install -e --id OpenJS.NodeJS.LTS

# 選配推薦：安裝極速 Python 套件與環境管理工具 uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
> ⚠️ **重要提醒**：安裝完成後，請**把 PowerShell 或終端機視窗關掉重開**，新的系統路徑（`PATH`）才會正式生效！

#### 🍎 macOS（Apple Silicon M1~M4 / Intel）
1. 先確保已安裝蘋果官方開發工具包（內含基礎 `git` 與 `python3`），打開「終端機（Terminal）」輸入：
   ```bash
   xcode-select --install
   ```
2. 若已安裝 [Homebrew](https://brew.sh/)，可直接一行裝齊所有黃金工具：
   ```bash
   brew install git gh python node uv
   ```
   *(若尚未安裝 Homebrew，也可直接用下方「方法 B」點擊官方 `.pkg` / `.dmg` 安裝檔！)*

---

### 🖱️ 方法 B：官方圖形化安裝包逐步重點（初學者必看避坑指南）

#### 第 1 項：安裝 Git 與 GitHub CLI (`gh`)
1. 前往 **[https://git-scm.com/downloads](https://git-scm.com/downloads)** 下載對應系統的安裝檔，一路使用預設值按 `Next` 完成安裝。
2. 前往 **[https://cli.github.com/](https://cli.github.com/)** 下載安裝 `gh`（GitHub CLI）。這能讓你之後在 Antigravity 裡不用手動產生與貼上長長的 Token，直接用瀏覽器點一下就能完成 GitHub 授權。

#### 第 2 項：安裝 Python（⚠️ Windows 同學請特別注意！）
1. 前往 **[https://www.python.org/downloads/](https://www.python.org/downloads/)** 點擊黃色按鈕下載最新穩定版（Python 3.12+）。
2. **【Windows 最大地雷】**：點開安裝檔的第一個畫面最下方，**務必把 `Add python.exe to PATH` 打勾 ✅**，再點選 `Install Now`！
   - 如果忘了打勾，Antigravity 在終端機呼叫 `python` 時就會找不到程式，或被導向 Microsoft Store。
3. **【macOS 注意事項】**：下載 `.pkg` 安裝完成後，若打開安裝資料夾看到 `Install Certificates.command`，建議雙擊執行一次，避免未來 Python 下載套件時遇到 SSL 憑證錯誤。

#### 第 3 項：安裝 Node.js (LTS 長期支援版)
1. 前往 **[https://nodejs.org/](https://nodejs.org/)**。
2. 請認明標示有 **LTS（Long Term Support，長期支援穩定版）** 的版本下載安裝。
3. 安裝過程中保持預設勾選即可，它會自動幫你把 `node`、`npm` 與 **`npx`（啟動 MCP 工具必備）** 加入系統環境變數。

---

## 四、【壓軸主角】下載與安裝 Google Antigravity

當前置工具準備好後，就可以把主角 **Google Antigravity** 迎進電腦裡了！

### 1. 下載桌面版主程式（Antigravity IDE / Antigravity 2.0）—— 所有師生必裝
1. 開啟官方網站：**[https://antigravity.google/](https://antigravity.google/)**（官方文件首頁：[https://antigravity.google/docs](https://antigravity.google/docs)）。
2. 點擊 **Download**，選擇符合你電腦的作業系統版本：
   - **🍎 macOS**：下載 `.dmg` 安裝映像檔（請確認你的 Mac 是 **Apple Silicon (M1 / M2 / M3 / M4)** 還是 **Intel** 晶片），開啟後將 **Antigravity** 圖示拖曳到 `Applications（應用程式）` 資料夾。
   - **🪟 Windows**：下載 `.exe` 安裝程式，雙擊執行完成安裝。
   - **🐧 Linux**：依官網指引下載對應套件包（`.deb` / `.rpm` / AppImage）安裝。
3. 首次啟動 **Antigravity**：
   - 依畫面引導登入你的 **Google 帳號**。
   - 選擇你喜歡的介面主題（深色 / 淺色），即可進入工作區（Workspace）！

### 2. 進階選配：安裝 Antigravity CLI (`agy`) 與 Python SDK
除了桌面版之外，Google Antigravity 還提供兩種進階開發介面（可依課程需求選裝）：

- **終端機輕量版 Antigravity CLI (`agy`)**：
  適合喜歡直接在 Terminal 裡快速呼叫 AI Agent 的使用者：
  ```bash
  curl -fsSL https://antigravity.google/cli/install.sh | bash
  ```
  安裝後在終端機輸入 `agy` 即可啟動，輸入 `/help` 查看斜線指令，按兩次 `Ctrl + D` 離開。
- **Antigravity Python SDK (`google-antigravity`)**：
  適合想在 Python 程式裡用程式碼自動調度 AI Agent 的進階課程（官方 GitHub：[google-antigravity/antigravity-sdk-python](https://github.com/google-antigravity/antigravity-sdk-python)）：
  ```bash
  pip install google-antigravity
  ```
  *(使用 SDK 時可至 [Google AI Studio](https://aistudio.google.com/app/api-keys) 申請 `GEMINI_API_KEY`)*

---

## 五、開機驗收：給 Antigravity 的「第一句環境自動健檢 Prompt」

安裝並打開 **Antigravity** 後，學生不需要自己去終端機背指令逐一測試。請直接複製下面這段 **「開機環境健檢 Prompt」** 貼給 Antigravity，讓 AI 自動幫你檢查、列表，甚至幫你補裝漏掉的工具！

```text
請幫我做一次完整的「開發環境自動健檢」：
1. 請在終端機檢查我這台電腦是否已經正確安裝以下工具，並確認都在 PATH 環境變數中：
   - Git (`git --version`)
   - GitHub CLI (`gh --version`)
   - Python 與套件管理 (`python3 --version` 或 `python --version`、`pip --version`、`uv --version`)
   - Node.js 與前端/MCP 工具 (`node -v`、`npm -v`、`npx -v`)
2. 請用清楚的繁體中文表格列出每個工具的「安裝狀態、目前版本號、用途說明」。
3. 如果有任何工具顯示未安裝、找不到指令，或是 Windows 的 Python 指到 Microsoft Store 空殼捷徑，請直接告訴我原因，並一步步協助我在這台電腦完成安裝與設定！
```

---

## 六、官方參考來源與直達連結清單

1. **Google Antigravity 官方網站與下載入口**：[https://antigravity.google/](https://antigravity.google/)
2. **Google Antigravity 官方說明文件（Docs）**：[https://antigravity.google/docs](https://antigravity.google/docs)
3. **Google Antigravity Python SDK 官方儲存庫**：[https://github.com/google-antigravity/antigravity-sdk-python](https://github.com/google-antigravity/antigravity-sdk-python)
4. **Python 官方下載頁**：[https://www.python.org/downloads/](https://www.python.org/downloads/)
5. **uv (Astral) 官方安裝文件**：[https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)
6. **Node.js 官方下載頁（LTS）**：[https://nodejs.org/](https://nodejs.org/)
7. **Git 官方下載頁**：[https://git-scm.com/downloads](https://git-scm.com/downloads)
8. **GitHub CLI (`gh`) 官方網站**：[https://cli.github.com/](https://cli.github.com/)
