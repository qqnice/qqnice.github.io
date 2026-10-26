/**
 * Google Antigravity 開發前置環境準備與官方下載安裝互動教學 - 資料與邏輯
 */

const ENV_STEPS = [
  {
    id: 'env-1',
    num: 1,
    shortTitle: '環境全景與編輯器觀念',
    title: '步驟 1：為什麼用 Antigravity 還要裝 Python / Node.js？還需要裝別的編輯器嗎？',
    summary: '先釐清最重要的兩個觀念：① Antigravity IDE 本身就是內建 VS Code 核心的專業編輯器，不需要另外裝別的編輯器；② Antigravity 啟動不用 Python，但當 AI Agent 要在背景幫你跑程式、開網頁預覽或啟動 MCP 工具時，需要調用你電腦裡的 Python、Node.js 與 Git！',
    promptTitle: '💡 觀念速記（也可在安裝 Antigravity 後直接貼這句給 AI 詢問）：',
    promptText: `請用適合初學者的繁體中文，檢查並向我說明我這台電腦目前有哪些開發工具（Python、Node.js、Git、GitHub CLI）已經可以讓你直接調用？以及我接下來想做互動教學網頁與 Python 腳本，還建議補裝什麼？`,
    bullets: [
      '<strong>觀念 1（關於編輯器）</strong>：<strong>Antigravity IDE 本身就是完整編輯器！</strong>它基於 VS Code 架構打造，內建檔案樹、語法高亮、終端機、<code>Tab</code> 智慧補全、<code>Cmd/Ctrl + I</code> 行內改 Code 與側邊欄 AI Agent，<strong>不需要</strong>另外去裝其他編輯器（若原本有裝 VS Code 也能並存並匯入設定）。',
      '<strong>觀念 2（關於 Python）</strong>：Antigravity 主程式下載就能直接開，<strong>但當你請 AI 寫 Python、跑資料分析、啟動本機網頁預覽（<code>python3 -m http.server</code>）或使用 Python SDK 時</strong>，系統裡必須另外裝好 Python，AI 才調用得到！',
      '<strong>觀念 3（關於 Node.js 與 Git）</strong>：<strong>Node.js (LTS)</strong> 內附的 <code>npx</code> 是啟動超過 80% MCP 擴充工具與前端網站的關鍵；<strong>Git + GitHub CLI (<code>gh</code>)</strong> 則是讓 AI 自動幫你備份與發佈網站的必備橋樑。',
      '<strong>教學最佳順序</strong>：先裝好「Git ＋ Python ＋ Node.js ＋ Chrome」四大黃金工具箱 ➔ 最後壓軸<strong>下載並啟動 Google Antigravity</strong>，開機就能 100% 發揮 AI 戰力！'
    ],
    uiTerms: [
      'Antigravity IDE (Built on VS Code)',
      'Agentic AI Runtime',
      'Python 3.12+',
      'Node.js LTS (npm / npx)',
      'Git & GitHub CLI (gh)'
    ],
    calloutTitle: '老師備課小撇步：如果課堂時間有限，可以先裝 Antigravity 再裝工具嗎？',
    calloutText: '可以！如果教室電腦權限允許，你也可以讓學生先跳到「步驟 6」下載打開 Antigravity，再直接複製「步驟 7」的健檢 Prompt 貼給 Antigravity，讓 AI 帶著學生透過 winget 或 Homebrew 把缺少的 Python / Node.js / Git 自動裝起來！',
    calloutType: 'warning',
    links: [
      { label: 'Google Antigravity 官網首頁', url: 'https://antigravity.google/' },
      { label: 'Antigravity 官方說明文件 (Docs)', url: 'https://antigravity.google/docs' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🧩 Antigravity 與四大黃金工具的調用關係圖</span>
          <span>Architecture Overview</span>
        </div>
        <div class="mock-gh-body">
          <div style="background:#eef5ff; border:2px solid #0969da; border-radius:8px; padding:12px; margin-bottom:12px;">
            <div style="font-weight:800; color:#0550ae; font-size:0.95rem; margin-bottom:4px;">🚀 主角：Google Antigravity (IDE / 2.0 桌面端)</div>
            <div style="font-size:0.82rem; color:#1f2328;">內建 VS Code 編輯器核心 ＋ 側邊欄 AI Agent ＋ 內建終端機（免另外裝其他編輯器！）</div>
          </div>
          <div style="text-align:center; font-size:0.82rem; font-weight:800; color:#57606a; margin-bottom:10px;">⬇️ AI Agent 在背景自動調用你電腦裡的四大工具 ⬇️</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem;">
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong style="color:#1f2328;">1. Git + GitHub CLI (<code>gh</code>)</strong><br>
              <span style="color:#57606a;">負責：版本備份、8 碼登入 GitHub、自動發佈 GitHub Pages</span>
            </div>
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong style="color:#1f2328;">2. Python 3.12+ &amp; <code>uv</code></strong><br>
              <span style="color:#57606a;">負責：跑 Python 腳本、資料分析、<code>http.server</code> 網頁預覽、Python SDK</span>
            </div>
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong style="color:#1f2328;">3. Node.js LTS (<code>npx</code>)</strong><br>
              <span style="color:#57606a;">負責：啟動 80% 以上的 MCP 擴充伺服器、React/Vite 前端專案</span>
            </div>
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong style="color:#1f2328;">4. Google Chrome</strong><br>
              <span style="color:#57606a;">負責：讓 AI 透過 Browser / DevTools MCP 自動開網頁測試與除錯</span>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'env-2',
    num: 2,
    shortTitle: '安裝 Git 與 GitHub CLI',
    title: '步驟 2：安裝 Git 與 GitHub CLI (gh) —— 讓 AI 能幫你備份與發佈網站',
    summary: '要讓 Antigravity 幫你把作品存檔（commit）並一鍵發佈到 GitHub Pages（例如 qqnice.github.io/linux/），電腦裡必須先裝好 Git 與 GitHub 官方命令列工具 gh。',
    promptTitle: '📋 終端機一鍵安裝指令（Windows PowerShell / macOS Terminal）：',
    promptText: `# 【Windows 10/11】打開 PowerShell 貼上執行：
winget install -e --id Git.Git
winget install -e --id GitHub.cli

# 【macOS】打開 Terminal 終端機貼上執行（或先跑 xcode-select --install）：
brew install git gh`,
    bullets: [
      '<strong>為什麼要同時裝 <code>git</code> 和 <code>gh</code>？</strong><code>git</code> 負責在電腦裡記錄版本變更；而 <strong>GitHub CLI (<code>gh</code>)</strong> 則讓你在 Antigravity 裡透過瀏覽器輸入 8 碼就能完成 GitHub 授權，完全不用手動去複製貼上長長的 Token！',
      '<strong>圖形化安裝包下載（不習慣用指令的同學）</strong>：請直接點右下角官方連結前往 <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer">git-scm.com/downloads ↗</a> 與 <a href="https://cli.github.com/" target="_blank" rel="noopener noreferrer">cli.github.com ↗</a> 下載安裝檔，一路按 <code>Next</code> 即可。',
      '<strong>macOS 內建快速法</strong>：Mac 使用者就算沒裝 Homebrew，只要在終端機輸入 <code>xcode-select --install</code>，系統就會自動跳出視窗幫你裝好蘋果官方的 <code>git</code> 與基礎開發工具。',
      '<strong>安裝後驗收方式</strong>：重開終端機輸入 <code>git --version</code> 與 <code>gh --version</code>，有顯示版本號碼即代表成功！'
    ],
    uiTerms: [
      'Git.Git',
      'GitHub.cli (gh)',
      'xcode-select --install',
      'git --version',
      'gh --version'
    ],
    calloutTitle: 'Windows 安裝完找不到 git 或 gh 指令？',
    calloutText: '在 Windows 安裝完任何開發工具後，原本開著的 PowerShell 或命令提示字元「不會自動重新讀取 PATH 環境變數」。請把終端機視窗完全關掉、重新打開一個新的視窗再測試即可！',
    calloutType: 'warning',
    links: [
      { label: 'Git 官方下載頁 (git-scm.com)', url: 'https://git-scm.com/downloads' },
      { label: 'GitHub CLI (gh) 官方下載頁', url: 'https://cli.github.com/' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>💻 終端機安裝與版本驗收示意</span>
          <span>git &amp; gh CLI</span>
        </div>
        <div class="mock-gh-body">
          <div style="background:#1f2328; color:#e6edf3; padding:12px; border-radius:6px; font-family:monospace; font-size:0.8rem; line-height:1.6;">
            <div style="color:#8b949e;"># 檢查 Git 與 GitHub CLI 是否安裝成功</div>
            <div>$ git --version</div>
            <div style="color:#7ee787;">git version 2.47.0</div>
            <div style="margin-top:6px;">$ gh --version</div>
            <div style="color:#7ee787;">gh version 2.60.1 (https://github.com/cli/cli/releases/latest)</div>
          </div>
          <p class="caption-note" style="margin-top:10px;">
            ▲ 只要這兩個指令都能正常印出版本號，之後在「Antigravity × GitHub 串接教學」中，AI 就能全自動幫你建 Repo 並推送網站！
          </p>
        </div>
      </div>
    `
  },
  {
    id: 'env-3',
    num: 3,
    shortTitle: '安裝 Python 與 uv (避坑必看)',
    title: '步驟 3：安裝 Python (3.11 / 3.12+) 與 uv —— 讓 AI 能跑腳本、開預覽伺服器與用 SDK',
    summary: '確認你的印象：沒錯！如果要在 Antigravity 裡使用 Python（包含跑資料分析、啟動 python3 -m http.server 本機網站預覽、或安裝 google-antigravity SDK），必須先在系統裡裝好 Python。Windows 同學請特別注意勾選「Add python.exe to PATH」！',
    promptTitle: '📋 終端機一鍵安裝 Python 3.12 與極速管理神器 uv：',
    promptText: `# 【Windows 10/11】打開 PowerShell 貼上執行（自動加入 PATH）：
winget install -e --id Python.Python.3.12
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 【macOS】打開 Terminal 終端機貼上執行：
brew install python uv`,
    bullets: [
      '<strong>為什麼需要另外裝 Python？</strong>Antigravity 本身不包含全域 Python 直譯器。裝好 Python 後，Antigravity 才能在背景幫你執行 <code>.py</code> 程式、安裝套件（<code>pip</code>）、啟動本機網頁伺服器，或使用官方 <code>google-antigravity</code> Python SDK。',
      '<strong>🚨 Windows 頭號地雷（用官網安裝包必看）</strong>：若從 <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer">python.org/downloads ↗</a> 下載 <code>.exe</code> 安裝檔，<strong>第一個畫面最下方的「<code>Add python.exe to PATH</code>」一定要打勾 ✅</strong>，再點 <code>Install Now</code>！',
      '<strong>為什麼推薦順便裝 <code>uv</code>？</strong><code>uv</code> 是現代 AI 與 MCP 工具最常調用的新一代 Python 環境管理員（速度比傳統 pip 快 10～100 倍），許多 Antigravity 科學與資料分析技能（Skills）會直接透過 <code>uv run</code> 自動建立乾淨環境！',
      '<strong>避開 Windows 假捷徑陷阱</strong>：若在 Windows 輸入 <code>python</code> 卻跳出 Microsoft Store 視窗，請到 Windows「設定 > 應用程式 > 進階應用程式設定 > 應用程式執行別名」，把 <code>python.exe</code> 與 <code>python3.exe</code> 的商店捷徑關閉。'
    ],
    uiTerms: [
      'Python 3.12+',
      'Add python.exe to PATH',
      'Install Now',
      'uv (Astral)',
      'pip install google-antigravity'
    ],
    calloutTitle: 'Windows 學生最常卡關：忘記勾選「Add python.exe to PATH」怎麼辦？',
    calloutText: '不用解除安裝！只要再點開一次剛下載的 Python 安裝檔（.exe），選擇「Modify（修改）」，在下一步把「Add Python to environment variables」打勾並完成即可；或者直接複製上方 winget 指令讓系統自動幫你設定好。',
    calloutType: 'danger',
    links: [
      { label: 'Python 官方下載頁 (python.org)', url: 'https://www.python.org/downloads/' },
      { label: 'uv 官方安裝指南 (docs.astral.sh/uv)', url: 'https://docs.astral.sh/uv/' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🪟 Windows Python 官方安裝畫面重點示意（必勾 PATH！）</span>
          <span>Python 3.12 Setup</span>
        </div>
        <div class="mock-gh-body">
          <div style="background:#ffffff; border:2px solid #d0d7de; border-radius:8px; padding:14px; font-size:0.84rem;">
            <div style="font-weight:800; font-size:1rem; color:#1f2328; margin-bottom:6px;">Install Python 3.12 (64-bit)</div>
            <div style="background:#eef5ff; border:1px solid #0969da; border-radius:6px; padding:8px 10px; margin-bottom:12px; color:#0550ae; font-weight:700;">
              👉 點選：Install Now (Includes IDLE, pip and documentation)
            </div>
            <div style="background:#ffebe9; border:2px solid #cf222e; border-radius:6px; padding:10px; color:#1f2328;">
              <div style="font-weight:800; color:#cf222e; margin-bottom:4px;">⚠️ 畫面最下方這兩個核取方塊請務必打勾：</div>
              <div>☑️ <strong>Use admin privileges when installing py.exe</strong></div>
              <div style="margin-top:4px; font-size:0.9rem;">☑️ <strong style="background:#fff8c5; padding:2px 6px; border-radius:4px;">Add python.exe to PATH</strong> ⬅️ <strong>（最重要！沒勾 AI 會找不到 Python）</strong></div>
            </div>
          </div>
          <p class="caption-note" style="margin-top:8px;">
            ▲ 只要勾選 <code>Add python.exe to PATH</code>，Antigravity 就能在終端機直接調用 <code>python</code> 與 <code>pip</code>。
          </p>
        </div>
      </div>
    `
  },
  {
    id: 'env-4',
    num: 4,
    shortTitle: '安裝 Node.js (LTS 版)',
    title: '步驟 4：安裝 Node.js (LTS 長期支援版) —— 讓 AI 能跑前端網站與啟動 MCP 擴充工具',
    summary: '除了 Python 之外，Node.js 是 Antigravity 生態系裡第二個最常被自動調用的執行環境！因為不管是現代互動網頁（Vite / React），還是超過 80% 的 MCP 擴充伺服器（Model Context Protocol），都是透過 Node.js 內附的 npx 指令直接啟動。',
    promptTitle: '📋 終端機一鍵安裝 Node.js LTS 長期支援版：',
    promptText: `# 【Windows 10/11】打開 PowerShell 貼上執行：
winget install -e --id OpenJS.NodeJS.LTS

# 【macOS】打開 Terminal 終端機貼上執行：
brew install node`,
    bullets: [
      '<strong>為什麼一定要選 LTS（Long Term Support）版本？</strong>在 <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org ↗</a> 官網上通常會有兩個按鈕：請一律選擇標示 <strong>LTS（長期支援穩定版，例如 v20 或 v22 LTS）</strong>，相容性最高、最不會遇到套件編譯問題。',
      '<strong>裝一個 Node.js，同時獲得三個必備工具</strong>：安裝完成後，你的電腦會自動擁有 <code>node</code>（JavaScript 執行器）、<code>npm</code>（套件管理員）與 <strong><code>npx</code>（免安裝直接執行 MCP 工具與建置腳本的神器）</strong>。',
      '<strong>Antigravity 什麼時候會用到它？</strong>當你在 Antigravity 啟用 Chrome DevTools MCP、Firebase 工具、或是請 AI 建立現代網頁框架時，AI 會在背景自動呼叫 <code>npx</code> 或 <code>npm run dev</code>。',
      '<strong>安裝後驗收指令</strong>：在終端機輸入 <code>node -v</code> 與 <code>npx -v</code>，能印出版本號（如 <code>v22.x.x</code>）即大功告成。'
    ],
    uiTerms: [
      'Node.js LTS (Long Term Support)',
      'OpenJS.NodeJS.LTS',
      'node -v',
      'npm -v',
      'npx (MCP Server Runner)'
    ],
    calloutTitle: '不需要自己手動設定複雜的 npm 全域路徑',
    calloutText: '使用官網 LTS 安裝包或 winget / brew 安裝 Node.js 時，安裝程式已經自動把 node、npm、npx 加進系統 PATH 了，維持預設選項直接安裝即可！',
    calloutType: 'warning',
    links: [
      { label: 'Node.js 官方下載頁 (認明 LTS 版)', url: 'https://nodejs.org/' },
      { label: 'Antigravity MCP 擴充官方文件', url: 'https://antigravity.google/docs/mcp' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🟢 Node.js (LTS) 三劍客與 AI 調用場景</span>
          <span>node / npm / npx</span>
        </div>
        <div class="mock-gh-body">
          <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem;">
            <div style="background:#eafbef; border:1px solid #1a7f37; border-radius:6px; padding:10px;">
              <strong style="color:#116329;">✔ <code>node</code>（執行環境）</strong>：讓 Antigravity 執行 JavaScript / TypeScript 測試與後端程式。
            </div>
            <div style="background:#eef5ff; border:1px solid #0969da; border-radius:6px; padding:10px;">
              <strong style="color:#0550ae;">✔ <code>npm</code>（套件管理員）</strong>：讓 Antigravity 自動幫你的前端專案安裝套件（<code>npm install</code>）與打包網站（<code>npm run build</code>）。
            </div>
            <div style="background:#fff8e5; border:1px solid #9a6700; border-radius:6px; padding:10px;">
              <strong style="color:#9a6700;">✔ <code>npx</code>（MCP 擴充啟動器 ⭐）</strong>：讓 Antigravity 一鍵掛載 Chrome DevTools MCP 等外部能力，無須手動配置伺服器！
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'env-5',
    num: 5,
    shortTitle: 'Chrome 瀏覽器與編輯器整理',
    title: '步驟 5：確認 Google Chrome 瀏覽器與編輯器配置 —— 讓 AI 能看畫面、自動測網頁',
    summary: '回答「還需要準備什麼常用工具或編輯器？」：除了前面的 Git、Python、Node.js 之外，強烈建議電腦裡安裝 Google Chrome 瀏覽器。至於程式碼編輯器，Antigravity IDE 本身就內建完整的 VS Code 體驗，直接用它就夠了！',
    promptTitle: '💡 未來開發網頁時，可以直接貼給 Antigravity 的自動測試 Prompt：',
    promptText: `請幫我在本機啟動這個網頁的預覽伺服器，並透過瀏覽器工具（或 Chrome DevTools）幫我檢查網頁在電腦版與手機版有沒有排版跑掉、圖片破圖或 Console 報錯，有的話請直接幫我修復！`,
    bullets: [
      '<strong>為什麼推薦搭配 Google Chrome？</strong>Antigravity 支援強大的 <strong>Browser Automation（瀏覽器自動化）</strong> 與 <strong>Chrome DevTools MCP</strong>。當你裝好 Chrome，AI 做完網頁後可以自己打開瀏覽器檢查畫面、測試無障礙（a11y）、看 Console 有沒有錯誤並自動修好！',
      '<strong>編輯器怎麼選？直接用 Antigravity IDE！</strong>你不需要讓學生先裝 VS Code、Sublime Text 或 PyCharm 再裝 Antigravity。因為 <strong>Antigravity IDE 本身就是一個完整的程式碼編輯器</strong>。',
      '<strong>Antigravity IDE 內建的 3 種 AI 寫程式模式</strong>：<br>① <code>Tab</code> 鍵智慧預測補全与跳轉；<br>② 選取程式碼按 <code>Cmd + I</code>（Mac）或 <code>Ctrl + I</code>（Windows）行內局部修改；<br>③ 右側 <strong>Sidebar Agent</strong> 多步驟自動開發與執行終端機。',
      '<strong>如果電腦原本就有裝 VS Code 呢？</strong>完全不衝突！安裝 Antigravity 時還可以選擇一鍵匯入你原本在 VS Code 的主題、快捷鍵與擴充套件。'
    ],
    uiTerms: [
      'Google Chrome',
      'Chrome DevTools MCP',
      'Antigravity Tab',
      'Inline Command (Cmd/Ctrl + I)',
      'Sidebar Agent'
    ],
    calloutTitle: '進階選配小工具（給想處理影音或容器的課程）',
    calloutText: '如果未來的課程會讓 AI 剪輯轉換影片音訊，可多裝一個 FFmpeg（winget install Gyan.FFmpeg 或 brew install ffmpeg）；若是 Linux 伺服器容器課程，則可搭配 Docker Desktop。一般網頁與 Python 課程只需前 4 項即可！',
    calloutType: 'warning',
    links: [
      { label: 'Google Chrome 官方下載頁', url: 'https://www.google.com/chrome/' },
      { label: 'Antigravity 瀏覽器自動化文件', url: 'https://antigravity.google/docs/ide/browser' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🖥️ Antigravity IDE 內建編輯器三大互動模式</span>
          <span>No Extra Editor Needed</span>
        </div>
        <div class="mock-gh-body">
          <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
            <thead>
              <tr style="background:#f0f4f8; text-align:left;">
                <th style="padding:6px 8px; border:1px solid #d0d7de;">操作模式</th>
                <th style="padding:6px 8px; border:1px solid #d0d7de;">快捷鍵 / 位置</th>
                <th style="padding:6px 8px; border:1px solid #d0d7de;">適合場景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 8px; border:1px solid #d0d7de;"><strong>1. Antigravity Tab</strong></td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;">按 <code>Tab</code> 接受建議</td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;">寫程式時自動補全下一行、自動補 <code>import</code></td>
              </tr>
              <tr>
                <td style="padding:6px 8px; border:1px solid #d0d7de;"><strong>2. Inline Command</strong></td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;"><code>⌘+I</code> 或 <code>Ctrl+I</code></td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;">反白一段程式碼，請 AI 加註解、改寫或抓 Bug</td>
              </tr>
              <tr>
                <td style="padding:6px 8px; border:1px solid #d0d7de;"><strong>3. Sidebar Agent</strong></td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;">側邊欄對話框 / 2.0 面板</td>
                <td style="padding:6px 8px; border:1px solid #d0d7de;">直接下中文 Prompt 做整份網站、跑測試、推上 GitHub</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  },
  {
    id: 'env-6',
    num: 6,
    shortTitle: '【壓軸】下載安裝 Antigravity',
    title: '步驟 6：【壓軸主戲】前往官網下載並安裝 Google Antigravity！',
    summary: '當前面的基礎環境概念與工具準備就緒後，現在就來下載主角 Google Antigravity！請前往唯一官方網站 antigravity.google 下載適合你電腦作業系統（macOS / Windows / Linux）的桌面版安裝檔。',
    promptTitle: '📋 （進階選配）若想同時安裝終端機輕量版 agy CLI 或 Python SDK：',
    promptText: `# 選配 A：安裝 Antigravity 終端機輕量版 CLI (agy)
curl -fsSL https://antigravity.google/cli/install.sh | bash

# 選配 B：在 Python 虛擬環境安裝官方 Antigravity Python SDK
pip install google-antigravity`,
    bullets: [
      '<strong>步驟 A：打開官方唯一下載入口</strong>：點擊前往 <a href="https://antigravity.google/" target="_blank" rel="noopener noreferrer"><strong>https://antigravity.google/ ↗</strong></a>。',
      '<strong>步驟 B：選擇你的作業系統安裝包</strong>：<br>• <strong>🍎 macOS</strong>：點擊下載 <code>.dmg</code>（配備 M1/M2/M3/M4 晶片請選 <strong>Apple Silicon</strong>；舊款 Mac 請選 <strong>Intel</strong>），打開後將 Antigravity 拖進 <code>Applications</code> 資料夾。<br>• <strong>🪟 Windows</strong>：點擊下載 Windows <code>.exe</code> 安裝檔，雙擊執行完成安裝。<br>• <strong>🐧 Linux</strong>：依官網說明下載對應套件包安裝。',
      '<strong>步驟 C：首次啟動與登入</strong>：打開 <strong>Google Antigravity</strong> 應用程式，依照畫面提示使用你的 <strong>Google 帳號</strong>完成登入驗證，並開啟一個專案資料夾（Workspace）。',
      '<strong>認識三種介面型態</strong>：除了最推薦師生安裝的<strong>桌面版（Antigravity IDE / Antigravity 2.0）</strong>之外，進階使用者也可用上方指令選裝終端機版 <code>agy</code> CLI 或 <code>google-antigravity</code> Python SDK。'
    ],
    uiTerms: [
      'antigravity.google',
      'Download for macOS (Apple Silicon / Intel)',
      'Download for Windows (.exe)',
      'Antigravity IDE / Antigravity 2.0',
      'agy CLI & google-antigravity SDK'
    ],
    calloutTitle: '請認明官方網域 antigravity.google',
    calloutText: '下載時請確認瀏覽器網址列為 Google 官方網域 https://antigravity.google/（說明文件為 https://antigravity.google/docs），不要從不明論壇下載改裝版安裝檔。',
    calloutType: 'warning',
    links: [
      { label: '🚀 立即前往 Google Antigravity 官網下載', url: 'https://antigravity.google/' },
      { label: 'Antigravity 官方說明文件 (Docs)', url: 'https://antigravity.google/docs' },
      { label: 'Antigravity Python SDK (GitHub)', url: 'https://github.com/google-antigravity/antigravity-sdk-python' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🌟 Google Antigravity 官方下載與啟動流程</span>
          <span>antigravity.google</span>
        </div>
        <div class="mock-gh-body">
          <div style="background:linear-gradient(135deg, #0969da 0%, #0550ae 100%); color:#fff; border-radius:10px; padding:16px; text-align:center; margin-bottom:12px;">
            <div style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.08em; opacity:0.9;">Official Download Portal</div>
            <div style="font-size:1.25rem; font-weight:800; margin:6px 0;">Google Antigravity</div>
            <div style="font-size:0.84rem; opacity:0.95; margin-bottom:12px;">AI-First Development Platform &amp; Agentic IDE</div>
            <a href="https://antigravity.google/" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#0550ae; font-weight:800; padding:8px 18px; border-radius:6px; text-decoration:none; font-size:0.9rem;">
              前往 antigravity.google 下載安裝包 ↗
            </a>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; font-size:0.78rem; text-align:center;">
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong>🍎 macOS</strong><br><span style="color:#57606a;">Apple Silicon / Intel (.dmg)</span>
            </div>
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong>🪟 Windows</strong><br><span style="color:#57606a;">Windows 10 / 11 (64-bit .exe)</span>
            </div>
            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:8px;">
              <strong>🐧 Linux</strong><br><span style="color:#57606a;">x64 / ARM64 Packages</span>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'env-7',
    num: 7,
    shortTitle: '開機首發 AI 環境健檢 Prompt',
    title: '步驟 7：打開 Antigravity 的第一件事 —— 貼上「AI 環境自動健檢與補齊 Prompt」！',
    summary: '裝好並打開 Google Antigravity 之後，怎麼確認前面的 Python、Node.js、Git 跟 GitHub CLI 都設定成功、而且 AI 真的調用得到？直接複製下方這段「開機健檢 Prompt」貼進 Antigravity 對話框，讓 AI 自己幫你跑完所有檢查，有漏裝的還能請它直接幫你裝好！',
    promptTitle: '✨ 複製這段「開機環境自動健檢 Prompt」貼給剛裝好的 Antigravity：',
    promptText: `請幫我做一次完整的「開發環境自動健檢」：
1. 請在終端機檢查我這台電腦是否已經正確安裝以下工具，並確認都在 PATH 環境變數中：
   - Git (git --version)
   - GitHub CLI (gh --version)
   - Python 與套件管理 (python3 --version 或 python --version、pip --version、uv --version)
   - Node.js 與前端/MCP 工具 (node -v、npm -v、npx -v)
2. 請用清楚的繁體中文表格列出每個工具的「安裝狀態、目前版本號、用途說明」。
3. 如果有任何工具顯示未安裝、找不到指令，或是 Windows 的 Python 指到 Microsoft Store 空殼捷徑，請直接告訴我原因，並一步步協助我在這台電腦完成安裝與設定！`,
    bullets: [
      '<strong>為什麼這一步最受老師與學生歡迎？</strong>因為每位學生的電腦狀況不同（有人漏勾 PATH、有人舊版還沒更新），讓 Antigravity 自己執行終端機健檢，AI 會根據真實報錯直接給出修復動作！',
      '<strong>確認全部顯示「✅ 已安裝」後</strong>：你的 Antigravity 就擁有完整的 Python 執行力、Node.js/MCP 擴充力與 Git 版本控制力了。',
      '<strong>下一步去哪裡？</strong>環境準備完成後，請直接進入下一份實戰教材：<a href="../antigravity-github-guide/"><strong>《Antigravity × GitHub：下 Prompt 就完成串接與網站發佈》→</strong></a>，開始你的第一個 AI 網站發佈實戰！'
    ],
    uiTerms: [
      '開發環境自動健檢 Prompt',
      'PATH 環境變數驗證',
      'All Tools Ready ✅',
      '前往 Antigravity × GitHub 串接實戰'
    ],
    calloutTitle: '恭喜完成 Antigravity 前置環境準備與主程式安裝！',
    calloutText: '現在你的電腦已經同時具備 Google Antigravity 主程式與四大黃金開發工具箱，未來無論是做 3D 互動網頁、Python 資料科學分析或自動化 GitHub Pages 部署，AI Agent 都能直接調用！',
    calloutType: 'warning',
    links: [
      { label: '👉 下一關：Antigravity × GitHub 下 Prompt 串接教學', url: '../antigravity-github-guide/' },
      { label: '前備關卡：GitHub 帳號申請與 2FA 教學', url: '../github-account-guide/' }
    ],
    visualHtml: `
      <div class="mock-gh-box">
        <div class="mock-gh-header">
          <span>🤖 Antigravity 執行環境健檢後的回報範例</span>
          <span>Agent Health Check Output</span>
        </div>
        <div class="mock-gh-body">
          <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:10px;">
            <thead>
              <tr style="background:#f0f4f8; text-align:left;">
                <th style="padding:6px; border:1px solid #d0d7de;">工具名稱</th>
                <th style="padding:6px; border:1px solid #d0d7de;">狀態</th>
                <th style="padding:6px; border:1px solid #d0d7de;">偵測版本</th>
                <th style="padding:6px; border:1px solid #d0d7de;">AI 調用確認</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px; border:1px solid #d0d7de;"><strong>Git / gh</strong></td>
                <td style="padding:6px; border:1px solid #d0d7de; color:#1a7f37; font-weight:700;">✅ 正常</td>
                <td style="padding:6px; border:1px solid #d0d7de;"><code>2.47 / 2.60</code></td>
                <td style="padding:6px; border:1px solid #d0d7de;">可自動備份與推送 GitHub</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #d0d7de;"><strong>Python / uv</strong></td>
                <td style="padding:6px; border:1px solid #d0d7de; color:#1a7f37; font-weight:700;">✅ 正常</td>
                <td style="padding:6px; border:1px solid #d0d7de;"><code>3.12.7 / 0.5</code></td>
                <td style="padding:6px; border:1px solid #d0d7de;">可跑腳本、預覽伺服器與 SDK</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #d0d7de;"><strong>Node.js / npx</strong></td>
                <td style="padding:6px; border:1px solid #d0d7de; color:#1a7f37; font-weight:700;">✅ 正常</td>
                <td style="padding:6px; border:1px solid #d0d7de;"><code>v22.11.0 LTS</code></td>
                <td style="padding:6px; border:1px solid #d0d7de;">可啟動前端專案與 MCP 工具</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align:center;">
            <a href="../antigravity-github-guide/" class="btn btn-primary" style="display:inline-block; text-decoration:none; font-size:0.86rem; padding:8px 16px;">
              前往下一關：Antigravity × GitHub 下 Prompt 串接教學 →
            </a>
          </div>
        </div>
      </div>
    `
  }
];
