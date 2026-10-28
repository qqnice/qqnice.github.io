// ============================================================================
// AI 工作應用圖文手冊 × ChatGPT 服務與頁面對照（具體圖說互動版）
// 依據：ChatGPT五大概念_服務與頁面對照_2026-10-28.md
// 設計原則：具體畫面入口 ＋ 單一任務（辦校內研習）貫穿 ＋ 大圖解配短圖說
// ============================================================================

const PORTAL_META = {
  title: 'Prompt・Skill・Tool・Agent・Bot｜ChatGPT 服務與頁面對照圖說',
  subtitle: '不是五種付費等級，也不是五個互斥按鈕——用「辦一場校內研習」看懂在 ChatGPT 哪裡按、怎麼用',
  coreReminder: '這五個概念是理解工作的五個角度，可以組合使用。單純請它寫通知 ≠ 已寄出；說明如何做 ≠ 工具已執行。',
  checkedDate: '2026-10-28'
};

// 5 大 AI 功能獨立頁面資料（具體對應 ChatGPT 畫面入口與「辦研習」實例）
const FIVE_PAGES = [
  {
    id: 'prompt',
    stepNum: '01',
    name: 'Prompt',
    zhName: '交代本次要求',
    badge: '第 1 頁｜從對話框開始',
    color: 'sky',
    accentHex: '#38bdf8',
    icon: '💬',
    uiEntryBadge: '📍 畫面入口：ChatGPT 首頁 → 新對話 → 底部訊息輸入框（Chat／Work 皆適用）',
    oneLiner: '把「要什麼成果、依據什麼資料、符合什麼標準」一次講清楚',
    voiceIntro: '第一頁：Prompt，交代本次要求。在 ChatGPT 開啟新對話，直接在底部訊息輸入框交代任務。以辦研習為例：貼上公告，指定列出 6 個欄位、限制 250 字內，並規定沒寫的標示未提供。先講清楚成果、資料與標準，產出後再核對日期與地點！',
    steps: [
      {
        step: 1,
        label: '① 進入 Chat 對話框',
        caption: '📍 在哪裡按：開啟 ChatGPT 新對話，在底部訊息輸入框貼上研習公告與本次要求（不需要額外安裝）。',
        voice: '第一步：開啟 ChatGPT 新對話，在底部訊息輸入框貼上教學用公告與本次要求。'
      },
      {
        step: 2,
        label: '② 給齊 3 個關鍵條件',
        caption: '🧱 怎麼交代：指定「6 個必填欄位」＋「250 字上限」＋「沒寫的標示未提供、不自行補上」。',
        voice: '第二步：交代清楚三個關鍵條件：列出活動名稱、日期、地點等六個欄位，限制兩百五十字內，沒寫的標示未提供。'
      },
      {
        step: 3,
        label: '③ 產出摘要與待確認清單',
        caption: '✅ 驗收成果：獲得「250 字研習摘要」＋「承辦人待確認事項」。注意：寫好通知草稿 ≠ 已經寄出通知！',
        voice: '第三步：取得研習摘要與待確認事項清單。驗收時核對日期、地點與期限；注意寫好草稿不代表已經寄出通知。'
      }
    ],
    visualCards: [
      {
        icon: '🖥️',
        tag: '對應服務與入口',
        title: 'Chat 訊息輸入框',
        caption: 'ChatGPT 首頁 → 新對話 → 輸入框（切換到 Work 時同樣用 Prompt 交代）'
      },
      {
        icon: '📝',
        tag: '辦研習示範任務',
        title: '把公告變同仁通知',
        caption: '同一份公告，改變 Prompt 要求，摘要的對象、欄位與格式就會跟著改變'
      },
      {
        icon: '🔍',
        tag: '驗收與避坑重點',
        title: '標示「未提供」防亂編',
        caption: '要求標出缺漏欄位；核對日期、地點、對象，且「寫出通知 ≠ 已寄出」'
      }
    ],
    demoPromptTitle: '📋 課堂實作指令：整理研習公告（可在 Chat 直接貼上）',
    demoPrompt: `請根據下方公告，整理給校內同仁閱讀的研習摘要。

請列出：活動名稱、日期時間、地點、參加對象、報名期限與報名方式。
全文不超過 250 字，最後另列「承辦人待確認事項」。
公告沒有寫的內容，請標示「未提供」，不要自行補上。

公告內容：
［貼上教學用公告］`,
    officialLink: 'https://learn.chatgpt.com/docs/use-chatgpt',
    officialLabel: 'Chat 與 Work 官方使用說明'
  },
  {
    id: 'skill',
    stepNum: '02',
    name: 'Skill',
    zhName: '保存重用方法',
    badge: '第 2 頁｜到 Skills 管理與 @ 呼叫',
    color: 'emerald',
    accentHex: '#10b981',
    icon: '📦',
    uiEntryBadge: '📍 畫面入口：桌面版左側邊欄「Skills」管理 ｜ 對話框輸入「@」選取技能',
    oneLiner: '先完成一次滿意成果，再用 @skill-creator 把「步驟、格式、檢查規則」存起來重複用',
    voiceIntro: '第二頁：Skill，保存重用方法。在 ChatGPT 桌面版左側邊欄點選 Skills 查看，或在對話框輸入小老鼠符號呼叫技能。以辦研習為例：先完成一次滿意的通知，再用 skill-creator 把欄位、步驟與缺漏檢查存成「研習通知」技能，下一場活動直接呼叫重用！',
    steps: [
      {
        step: 1,
        label: '① 呼叫 @skill-creator 建立',
        caption: '📍 怎麼建立：先做好一次滿意的研習通知，在 Work 輸入 `@skill-creator` 把步驟、欄位與限制打包成技能。',
        voice: '第一步：先完成一次滿意的通知，接著呼叫 skill-creator，把步驟、輸出格式與限制保存成「研習通知」技能。'
      },
      {
        step: 2,
        label: '② 側邊欄 Skills 啟用與 @ 選取',
        caption: '📂 在哪裡按：從桌面版左側邊欄「Skills」查看（或使用 Plugin 附帶技能），在對話框打 `@` 選取技能。',
        voice: '第二步：從桌面版側邊欄 Skills 確認啟用後，在對話框輸入小老鼠符號，從選單選取建立好的技能。'
      },
      {
        step: 3,
        label: '③ 換新活動資料直接重用＆抓漏',
        caption: '✅ 驗收成果：貼入第二場活動資料（故意漏掉報名連結），確認它能維持一致格式並自動抓出缺漏！',
        voice: '第三步：換第二場活動資料測試，並故意漏掉報名連結，確認技能會保持一致風格並主動指出缺漏。'
      }
    ],
    visualCards: [
      {
        icon: '🗂️',
        tag: '對應服務與入口',
        title: '側邊欄 Skills ＋ 輸入框 @',
        caption: '獨立 Skill 在桌面版側邊欄管理；Plugin 附帶的 Skill 可跨網頁、桌面與手機使用'
      },
      {
        icon: '🔄',
        tag: '辦研習示範任務',
        title: '每場研習照同一標準寫',
        caption: '每次只換「活動日期、地點、連結」，固定保留「必要欄位、風格、缺漏檢查」'
      },
      {
        icon: '🧪',
        tag: '驗收與避坑重點',
        title: '用缺漏資料測防呆',
        caption: '筆記裡的提示詞只是起點，須經平台建立啟用才成為可 `@` 呼叫的 Skill'
      }
    ],
    demoPromptTitle: '📋 課堂實作指令：把通知方法保存成 Skill（在 Work 呼叫 @skill-creator）',
    demoPrompt: `@skill-creator
請把這次已確認的研習通知製作方式，建立成一個可重用的技能。
技能名稱暫定為「研習通知」。

輸入：活動資料與單位通知範本。
步驟：檢查必要欄位 → 列出缺漏 → 撰寫通知 → 核對原始資料。
輸出：通知草稿與待確認清單。
限制：沒有提供的講師、研習時數與核定資訊，不得自行補寫。

請先讓我檢查技能內容，再用第二場活動資料測試。`,
    officialLink: 'https://learn.chatgpt.com/docs/build-skills',
    officialLabel: 'Skills 官方操作說明'
  },
  {
    id: 'tool',
    stepNum: '03',
    name: 'Tool',
    zhName: '取得資料或執行動作',
    badge: '第 3 頁｜內建工具與 Plugins 頁面',
    color: 'amber',
    accentHex: '#f59e0b',
    icon: '🔌',
    uiEntryBadge: '📍 畫面入口：對話內建檔案/搜尋工具 ｜ 外部服務從「Plugins 頁面」安裝並用「@」呼叫',
    oneLiner: '不只動嘴寫字，而是實際「讀 Excel、算人數、查雲端文件、建日曆草稿」',
    voiceIntro: '第三頁：Tool，取得資料或執行動作。除了內建的搜尋與檔案計算能力，外部服務可到 Plugins 頁面安裝並授權 Google Drive、Gmail 或日曆。以辦研習為例：上傳報名名單 Excel，請工具實際篩選有效紀錄、去除重複編號並統計各單位人數！',
    steps: [
      {
        step: 1,
        label: '① 上傳檔案或從 Plugins 授權',
        caption: '📍 在哪裡按：在對話框上傳報名 Excel，或至 `chatgpt.com/plugins` 安裝並連接 Google Drive／Gmail／Calendar。',
        voice: '第一步：在對話中上傳教學用報名 Excel，或從 Plugins 頁面安裝並連接 Google Drive、Gmail 等外部工具。'
      },
      {
        step: 2,
        label: '② 工具實際讀取、去重與計算',
        caption: '⚙️ 怎麼執行：呼叫資料分析工具，只算「有效」紀錄、依報名編號去重，且「不修改原始檔」。',
        voice: '第二步：工具實際讀取檔案，只計算狀態為有效的紀錄，以報名編號去除重複，並保留原始檔案不修改。'
      },
      {
        step: 3,
        label: '③ 交付可開啟的統計檔與差異表',
        caption: '✅ 驗收成果：核對原始筆數、去重人數、取消紀錄與實際產出的檔案。「說明如何做」≠「工具已執行」！',
        voice: '第三步：核對統計結果與實際產出的檔案。請務必區分：模型只有說明怎麼做，還是工具已經真正執行完畢。'
      }
    ],
    visualCards: [
      {
        icon: '🧩',
        tag: '對應服務與入口',
        title: '內建工具 ＋ Plugins 頁面',
        caption: '內建搜尋、讀檔與計算；外部服務從 chatgpt.com/plugins 安裝授權後用 `@` 選取'
      },
      {
        icon: '📊',
        tag: '辦研習示範任務',
        title: '核對報名名單並去重統計',
        caption: '自動算出原始筆數、有效筆數、去重後人數、各單位人數，並抓出重複與取消紀錄'
      },
      {
        icon: '🧭',
        tag: '秒懂 Tool・MCP・Plugin',
        title: '動作 vs 協定 vs 套件',
        caption: 'Tool 是具體動作；MCP 是連接服務的協定；Plugin 是打包 Skill 或 MCP 的安裝套件'
      }
    ],
    demoPromptTitle: '📋 課堂實作指令：讀取報名 Excel 去重與統計（上傳名單後貼上）',
    demoPrompt: `請讀取我上傳的報名名單。
只計算狀態為「有效」的紀錄，再以報名編號去除重複。
列出原始筆數、有效筆數、去重後人數，以及各單位人數。
另外列出重複編號、取消紀錄及待確認紀錄。

不要修改原始檔。
若可建立檔案，請另存統計結果；若無法執行，請明確說明缺少什麼能力。`,
    officialLink: 'https://learn.chatgpt.com/docs/plugins',
    officialLabel: 'Plugins 官方操作說明'
  },
  {
    id: 'agent',
    stepNum: '04',
    name: 'Agent',
    zhName: '依目標安排與調整步驟',
    badge: '第 4 頁｜切換到 ChatGPT Work',
    color: 'purple',
    accentHex: '#a855f7',
    icon: '🧭',
    uiEntryBadge: '📍 畫面入口：頂部「Chat ／ Work 切換器」選擇 Work（程式與版本工作可選 Codex）',
    oneLiner: '交代「成果、範圍與停止條件」，讓它比對多份資料、發現矛盾時自動追查依據',
    voiceIntro: '第四頁：Agent，依目標安排與調整步驟。在 ChatGPT 頂部切換器選擇 Work，交代要交付的成果、授權範圍與停止條件。以辦研習為例：提供公告、網頁與信件三份日期不一致的資料，讓它自動比對差異、追查依據，找不到依據時停下來交回人工處理！',
    steps: [
      {
        step: 1,
        label: '① 頂部切換到 ChatGPT Work',
        caption: '📍 在哪裡按：在頂部切換器選擇 `Work`（Agent 是工作方式，Work 是產品入口；技術工作可選桌面版 `Codex`）。',
        voice: '第一步：在 ChatGPT 頂部切換器選擇 Work，準備交辦需要規劃步驟與多源查核的任務。'
      },
      {
        step: 2,
        label: '② 比對三份資料並依結果追查',
        caption: '🔄 怎麼運作：比對「核定公告、活動網頁、主辦信件」發現日期衝突 → 自動在授權範圍內追查哪份才是依據。',
        voice: '第二步：同時比對核定公告、活動網頁與主辦信件，發現日期不一致時，自動根據中途結果判斷還要查哪份資料。'
      },
      {
        step: 3,
        label: '③ 觸發停止條件，交付差異查核表',
        caption: '🛑 驗收成果：每個結論附來源；找不到判定依據就停下交回人工，絕不擅自修改公告或寄出訊息！',
        voice: '第三步：交付附有來源的差異與待確認事項表。遇到無法判定的疑點就停下來交回人工，不擅自修改公告或寄信。'
      }
    ],
    visualCards: [
      {
        icon: '🔀',
        tag: '對應服務與入口',
        title: 'Chat ／ Work 切換器',
        caption: 'Work 是產品入口，Agent 是依結果調整步驟的工作方式（固定加總用公式即可，不必都用 Agent）'
      },
      {
        icon: '🕵️',
        tag: '辦研習示範任務',
        title: '查清三份活動資料衝突',
        caption: '核定公告、網頁摘錄、主辦信件日期不同 → 自動比對並標註來源與待確認疑點'
      },
      {
        icon: '🛑',
        tag: '驗收與避坑重點',
        title: '必設「範圍＋停止條件」',
        caption: '不因文件較新就當成已核定；找不到依據立即停下交回承辦人，不直接改公告或寄信'
      }
    ],
    demoPromptTitle: '📋 課堂實作指令：在 Work 查核三份研習資料衝突（含範圍與停止條件）',
    demoPrompt: `請查核這場研習的活動資訊，交付一份「來源、差異與待確認事項表」。

範圍：只使用我提供的資料，以及我指定且已授權的來源。
先比較活動名稱、日期、時間、地點與報名期限。
發現衝突時，判斷還需要查哪一份資料；能在授權範圍內取得，就繼續查核。
每個結論附來源，不要只因文件較新就認定它已正式核定。

停止條件：若找不到足以判定的依據，列出問題並交回我處理。
不要修改公告，也不要寄送訊息。`,
    officialLink: 'https://learn.chatgpt.com/docs/get-started-with-work',
    officialLabel: 'ChatGPT Work 官方交辦指引'
  },
  {
    id: 'bot',
    stepNum: '05',
    name: 'Bot',
    zhName: '透過訊息提供服務',
    badge: '第 5 頁｜Slack／Teams 的 @ChatGPT',
    color: 'rose',
    accentHex: '#f43f5e',
    icon: '🤖',
    uiEntryBadge: '📍 畫面入口：同仁在 Slack／Microsoft Teams 對話輸入「@ChatGPT」（管理員於 admin.openai.com 設定）',
    oneLiner: '把 AI 放進同仁每天用的群組頻道，直接 @ChatGPT 問研習資訊並附公告來源',
    voiceIntro: '第五頁：Bot，透過訊息提供服務。官方代表例子是在 Slack 或 Microsoft Teams 頻道裡輸入小老鼠 ChatGPT。同仁不必打開 ChatGPT 網站，直接在原本的工作群組提問研習日期與報名期限，就能收到附有公告來源的回覆！同時要注意執行身分與頻道可見範圍。',
    steps: [
      {
        step: 1,
        label: '① 同仁在 Slack／Teams 輸入 @ChatGPT',
        caption: '📍 在哪裡按：同仁直接在已開通的 Slack 或 Teams 頻道打 `@ChatGPT` 提問（管理員於後台 Agents 設定權限）。',
        voice: '第一步：同仁在平常使用的 Slack 或 Teams 工作群組中，直接輸入小老鼠 ChatGPT 提出問題。'
      },
      {
        step: 2,
        label: '② 依據群組共享公告查核並附來源',
        caption: '🔍 怎麼運作：Bot 讀取本對話提供的核定公告，整理日期、地點與報名期限，沒寫的回答「目前無法確認」。',
        voice: '第二步：Bot 根據對話中提供的核定公告整理答案並附上來源，資料沒寫的明確回答「目前無法確認」。'
      },
      {
        step: 3,
        label: '③ 回傳群組訊息＆檢查權限可見範圍',
        caption: '🔐 驗收成果：區分「在 ChatGPT 用 Slack Plugin (Tool)」與「在 Slack 叫 @ChatGPT (Bot)」，並注意誰看得到回覆！',
        voice: '第三步：同仁在群組收到回覆。請特別注意：人在哪裡輸入決定它是 Tool 還是 Bot，並留意頻道內誰看得到答案。'
      }
    ],
    visualCards: [
      {
        icon: '💬',
        tag: '對應服務與入口',
        title: 'Slack／Teams 裡的 @ChatGPT',
        caption: '同仁入口在群組對話串；管理員從 admin.openai.com 的 Agents 設定連線與可用工具範圍'
      },
      {
        icon: '⚖️',
        tag: '最易混淆秒懂對照',
        title: 'Slack Plugin vs Slack @ChatGPT',
        caption: '人在 ChatGPT 讀 Slack 訊息 ＝ Tool；人在 Slack 頻道叫 @ChatGPT 服務 ＝ Bot'
      },
      {
        icon: '🛡️',
        tag: '驗收與避坑重點',
        title: '看清執行身分與誰看得到',
        caption: '組織 Bot 可能使用共用服務帳號而非個人權限；在公開頻道回覆會被頻道內所有人看到'
      }
    ],
    demoPromptTitle: '📋 課堂實作指令：在 Slack／Teams 工作群組詢問研習資訊',
    demoPrompt: `@ChatGPT 請依本對話提供的核定公告，說明這場研習的日期、地點與報名期限。
請附公告來源；資料沒有提到的內容，請回答「目前無法確認」。`,
    officialLink: 'https://learn.chatgpt.com/docs/enterprise/chatgpt-slack-and-teams',
    officialLabel: 'Slack／Teams 中的 @ChatGPT 官方說明'
  }
];

// 總覽頁：「辦一場校內研習」串聯五個主題 ＋ 以前的「自訂 GPT」對照
const OVERVIEW_DATA = {
  scenarioTitle: '🎯 用同一個任務連起五個主題：「辦一場校內研習」',
  scenarioSubtitle: '點擊下方任一階段圖卡，立即切換到該頁看「ChatGPT 畫面入口圖解 ＋ 可複製指令」',
  customGptNote: {
    title: '💡 那麼，以前的「自訂 GPT」放在哪裡？',
    desc: '自訂 GPT 是把特定指示、參考資料與能力整理成專用助手（不宜直接畫等號寫成 GPT = Skill 或 GPT = Agent）。依官方遷移指引：',
    items: [
      '📦 原有的「指示與參考資料」 ➔ 可轉為可重用的 Skill',
      '🔌 原有的「外部操作（Actions）」 ➔ 檢查支援方式後轉為 Plugin／Tool'
    ]
  },
  preClassChecklist: [
    { item: 'Chat（對話輸入框）', entry: 'chatgpt.com 新對話', note: '交代本次要求（Prompt）' },
    { item: 'Skills（方法管理）', entry: '桌面版側邊欄 Skills ／ 輸入 @', note: '保存重用方法（Skill）' },
    { item: 'Plugins（外部工具）', entry: 'chatgpt.com/plugins ／ 輸入 @', note: '讀取計算與外部動作（Tool）' },
    { item: 'Work（交付成果入口）', entry: '頂部 Chat／Work 切換器', note: '依目標與結果調整步驟（Agent）' },
    { item: '@ChatGPT（訊息服務）', entry: 'Slack／Teams 頻道輸入 @ChatGPT', note: '群組訊息服務入口（Bot）' }
  ]
};
