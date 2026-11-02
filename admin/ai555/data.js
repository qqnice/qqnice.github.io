// ============================================================================
// AI555 核心資料庫 (data.js)
// 研讀 11/2 AI 行政自動化工作坊：用 Codex 打造個人 AI 小幫手 (Day3-11/01)
// 授課講師：國立臺中科技大學 資訊管理系 QQ林文彥 (qqice@gm.nutc.edu.tw)
// ============================================================================

const AI555_DATA = {
  meta: {
    workshopTitle: "11/2 AI 行政自動化工作坊：用 Codex 打造個人 AI 小幫手 (Day3-11/01)",
    author: "國立臺中科技大學 資訊管理系 QQ林文彥",
    email: "qqice@gm.nutc.edu.tw",
    subtitle: "5 個重塑辦公效率的核心模組 × 3D 互動元宇宙劇院",
    version: "2026.11.02",
    conceptCheckDate: "2026 年 11 月 02 日"
  },

  // 5 大模組定義
  modules: [
    {
      id: "prompt",
      name: "Prompt",
      chineseName: "提問生成",
      pantone: "Panton 300",
      colorHex: "#0284c7",
      colorTailwind: "sky",
      icon: "💬",
      shortDesc: "單次任務的要求與格式。定義材料、要求與驗收標準，單次指令精準產出。",
      quote: "「輸入明確材料，規定欄位限制，換來乾淨標準的結構化成果。」",
      threeStage: {
        stage1: { label: "輸入模塊", title: "材料", desc: "原始公文、長篇法規、網頁文字或報章草稿" },
        stage2: { label: "處理模塊", title: "本次要求", desc: "明確規範受眾（如校內同仁）、字數（250字內）、欄位、輸出格式" },
        stage3: { label: "輸出模塊", title: "成果", desc: "結構化通知、條列清單、缺漏清單或即時比較表" }
      },
      cases: [
        {
          tag: "碩士推甄比對",
          title: "五校 116 學年度碩士推甄入學資訊彙整",
          promptText: "幫我搜尋台北科技大學、台灣科技大學、雲林科技大學、高雄科技大學、勤益科技大學的 116 學年度碩士推甄入學相關資訊：\n1. 報名起迄時間\n2. 報名費用\n3. 口試時間\n請彙整成一個完整的表單，並且把這些簡章全部下載回來。",
          resultSummary: "即時萃取五校精準時間表與收費，並生成 Excel/Markdown 比對表，自動下載簡章 PDF。"
        },
        {
          tag: "公文範本改寫",
          title: "給過去公文，請 AI 調整為新學年度標準格式",
          promptText: "這是去年國科會計畫核定公文範本。請依據附件最新來文，將主旨改為：貴校林文彥副教授所提「雙眼並視之數位轉譯：運用 AI RAG 與 XR 技術於阿美族跨域科學教育對學習成效與認同」，並依規章修正說明段落與報部期程。",
          resultSummary: "精準產出符合政府公文函復格式，承辦同仁僅需人工核對文號與期程。"
        },
        {
          tag: "Gemini Notebook",
          title: "NotebookLM / Gemini 深度解析與資訊圖表產製",
          promptText: "匯入本校 AI 行政應用教材，以「五大核心元件與選用指南」為主題，提煉出 Prompt、Skill、Tool、Agent、Bot 的分工架構，並生成可視化資訊圖表結構與決策指引。",
          resultSummary: "將大量文字教材轉化為圖表骨架，協助長官與同仁 30 秒看懂整體架構。"
        }
      ],
      uiEntry: "ChatGPT / Codex 訊息輸入框 (Chat)；支援 Web 網頁對話與 Desktop 專用軟體 (建議安裝在桌面上)。",
      voiceScript: "第一站 Prompt 提問生成。它是單次指令的精準產出。核心公式是：輸入模塊給材料、處理模塊下規範、輸出模塊收成果。就像請助理整理推甄資訊或修改公文，把驗收標準說清楚，AI 就能給出完美的結構化成果。"
    },

    {
      id: "skill",
      name: "Skill",
      chineseName: "重複技能",
      pantone: "Panton 360",
      colorHex: "#10b981",
      colorTailwind: "emerald",
      icon: "🔄",
      shortDesc: "封裝重複流程。保存固定方法（欄位、範本、檢查規則），替換資料即可重用。",
      quote: "「方法可重用，每次更換資料，產出規格完全一致的穩定結果。」",
      threeStage: {
        stage1: { label: "步驟一", title: "完成並修好", desc: "先用一份真實資料（如活動 A 通知）完整跑通並人工審核修正到滿意" },
        stage2: { label: "步驟二", title: "保存方法", desc: "把欄位規格、輸出範本、檢查規則固化成 Skill（先測完整資料，再測缺漏資料）" },
        stage3: { label: "步驟三", title: "換資料重用", desc: "下次直接丟入活動 B 通知或新帳單，一鍵瞬間產出標準規格結果" }
      },
      cases: [
        {
          tag: "核銷憑證",
          title: "信用卡帳單 ➔ 10 張支出證明單 Word 一次列印",
          promptText: "給予匿名的信用卡電子帳單，將每筆海外扣款自動拆解為「交易款」與「國外交易手續費」兩張證明單，套入學校標準版面，合併為一個 Word 檔一次印出。",
          resultSummary: "承辦人不必手動剪貼 2 小時，30 秒產出無個資外洩疑慮的完整核銷憑證。"
        },
        {
          tag: "通知草稿",
          title: "多場研習與工作坊通知草稿批次生成",
          promptText: "套用標準研習通知 Skill，更換講師名稱、時間、教室與報名連結，自動生成語意通順且包含行事曆備註的通知信件。",
          resultSummary: "確保所有系所對外通知規範統一，避免漏列關鍵期程與注意事項。"
        },
        {
          tag: "影片知識萃取",
          title: "YouTube 影片與研討會錄影 ➔ 萃取為常用生成 Skill",
          promptText: "透過 Gemini 將長影片解析為摘要與實作步驟，點擊右上角「儲存為技能」，日後只要貼入新影片連結即可套用同樣的萃取結構。",
          resultSummary: "把專家智慧與行政流程沉澱為單位的專屬技能庫。"
        }
      ],
      uiEntry: "Skills 功能選單，或在對話框中輸入「@」喚出技能選單，直接套用已保存的標準作業流程。",
      voiceScript: "第二站 Skill 重複技能。它的靈魂在於「封裝重複流程」。保存欄位、範本與檢查規則。就像支出證明單，做好一次之後，換上新的帳單資料，就能自動吐出規格完全一致的成果，省下數十倍的重複勞動！"
    },

    {
      id: "tool",
      name: "Tool",
      chineseName: "外部工具 / 外掛 / MCP",
      pantone: "Panton 1505",
      colorHex: "#f59e0b",
      colorTailwind: "amber",
      icon: "🔌",
      shortDesc: "突破對話框，連接真實世界。AI 的手腳，串接外部系統與檔案（讀取、計算、寫入）。",
      quote: "「讀取資料、MCP 調度 API 計算、寫入外部系統，AI 不再只是純聊天。」",
      threeStage: {
        stage1: { label: "讀取 (Read)", title: "讀取資料源", desc: "檔案、郵件、行事曆 PDF、Google Drive、Notion、GitHub" },
        stage2: { label: "計算 (Compute)", title: "MCP 調度 API", desc: "文字去重、日期解析、數據統計、行程衝突比對" },
        stage3: { label: "寫入 (Write)", title: "寫入外部系統", desc: "更新檔案、建立草稿、新增 Google 日曆行程、發送 LINE 通知" }
      },
      cases: [
        {
          tag: "校園行事曆",
          title: "115 NUTC 校園行事曆：PDF ➔ Google 日曆自動排程",
          promptText: "解析臺中科技大學 115 學年校園行事曆 PDF，自動建立 81 筆日間部與 76 筆夜間部獨立行程，經審核後透過 Google Calendar API 寫入「nutc-115行事曆」。",
          resultSummary: "免除人工逐筆輸入 157 筆行事曆的痛苦，日夜間部自動分流標記。"
        },
        {
          tag: "課表戰情室",
          title: "全校教學單位主管課表暫行表比較",
          promptText: "跨 53 位主管、19 個一級單位進行課表衝擊比對與會議排程分析。若資料僅放在地端電腦，則純靠前端運算，不需要 Tool 串接外網，確保隱私安全。",
          resultSummary: "彈性調配：需要串雲端才用 Tool，純地端運算即可關閉連網。"
        },
        {
          tag: "LINE 串接",
          title: "LINE Developers Messaging API 雙向介接",
          promptText: "串接 LINE Official Account，讓行政同仁直接在手機 LINE 群組傳訊，透過 MCP 調用後端行政工具並回報處理結果。",
          resultSummary: "將沉重的後台系統化為掌上即時通訊服務。"
        }
      ],
      uiEntry: "點選 ChatGPT 頭像 ➔ 設定 ➔ 整合 ➔ 外掛程式 / MCP 瀏覽目錄；或在 Antigravity 內掛載 MCP 伺服器。",
      voiceScript: "第三站 Tool 外部工具與 MCP。AI 要能真正替你分擔工作，就必須擁有手腳。Tool 串接真實世界：從 PDF 讀取資料、透過 API 去重比對、最後自動寫入 Google 日曆或發送通知。它讓 AI 跨越了對話框的限制！"
    },

    {
      id: "agent",
      name: "Agent",
      chineseName: "代理任務",
      pantone: "Panton 2603",
      colorHex: "#a855f7",
      colorTailwind: "purple",
      icon: "🧠",
      shortDesc: "具備感知決策與自我修正的自主大腦。多項任務安排，根據目標自主觀察與修正。",
      quote: "「遇到日期異常或資料缺失，自主追查來源，而非停機當機等待。」",
      threeStage: {
        stage1: { label: "傳統固定規則", title: "死板流程", desc: "讀取名單 ➔ 篩選去重 ➔ 統計人數。遇到格式異常或日期缺失直接崩潰當機。" },
        stage2: { label: "Agent 動態迴圈", title: "自主決策閉環", desc: "選擇步驟 ➔ 使用工具 ➔ 觀察結果 ➔ 調整或結束 ➔ 交付成果。" },
        stage3: { label: "容錯自癒能力", title: "自我修正", desc: "發現不同檔案日期記載衝突時，自主決定回查校網或公文附件，動態調整後續路徑。" }
      },
      cases: [
        {
          tag: "自動化流水線",
          title: "從文件到官網最新消息的自動化流水線",
          promptText: "公文丟入雲端資料夾 ➔ Agent 自動判斷分類（研習/競賽/行政） ➔ 調用 Skill 整理為閱讀格式 ➔ 調用 Tool (GitHub API) 批次發布 ➔ Rpage 官網同步更新。",
          resultSummary: "全自動完成 6 大節點，並在發布前保留人工審核節點，行政同仁僅需拍板確認。"
        },
        {
          tag: "Vibe Coding",
          title: "Google Antigravity + GitHub 代理平台",
          promptText: "利用新一代代理程式平台 Antigravity，結合多 Agent 自主協同，自動撰寫程式、跑靜態測試、修復錯誤並自動發布到 GitHub Pages。",
          resultSummary: "從概念到產品上線，體驗思維即產出的 Vibe Coding 全新境界。"
        },
        {
          tag: "考生聯絡戰情表",
          title: "註冊組與系辦聯絡考生半自動電話戰情室",
          promptText: "考生追蹤名單地端直讀，點擊按鈕透過 PC Modem 自動撥號，地端 TTS 自動語音宣達，回撥直接接通承辦人，保護喉嚨且 100% 隱私不外流。",
          resultSummary: "AI 大腦自主記錄通話狀態、摘要記事，無縫接軌後續追蹤。"
        }
      ],
      uiEntry: "ChatGPT Work 模式；專業技術與複雜多步驟工作可使用 Codex 或 Google Antigravity。",
      voiceScript: "第四站 Agent 代理任務。傳統腳本只要碰到資料異常就會當機；而 Agent 是具備感知決策的自主大腦。它在循環迴圈中觀察結果、自我修正。發現日期衝突會自己追查來源，真正實現端到端的任務交付！"
    },

    {
      id: "bot",
      name: "Bot",
      chineseName: "專屬秘書 / 訊息服務入口",
      pantone: "Panton 211",
      colorHex: "#ec4899",
      colorTailwind: "rose",
      icon: "🤖",
      shortDesc: "24小時專屬秘書，人類與複雜系統的最簡對話入口。同仁無需學習複雜介面，日常對話即可調動全套 AI 系統。",
      quote: "「對話即介面：觸發固定規則、啟動 Skill、喚醒 Agent，都在你最熟悉的聊天室。」",
      threeStage: {
        stage1: { label: "第 1 層", title: "觸發固定規則", desc: "對應日常一般問答（如：辦公室分機、常見法規、申請表下載網址）" },
        stage2: { label: "第 2 層", title: "啟動 Skill", desc: "調用特定公文模具或憑證模板（如：「幫我生這筆帳單的核銷單」）" },
        stage3: { label: "第 3 層", title: "喚醒 Agent", desc: "處理高度複雜的排程衝突、多方會議協調或跨系統批次發布" }
      },
      cases: [
        {
          tag: "掌上行政秘書",
          title: "LINE / @ChatGPT 24hr 行事與公文助理",
          promptText: "「小幫手，幫我處理今天的公文與排程。」Bot 立即讀取新公文摘要、比對行事曆、標記衝突並將確認通知送至主管手機。",
          resultSummary: "無痛落地：一般行政同仁完全不用學複雜後台，只要會傳 LINE 就會用 AI。"
        },
        {
          tag: "多端助手生態",
          title: "Dot. / Grok Bot / dots 雲端隨身助理",
          promptText: "透過語音輸入或通訊軟體，即時調動雲端運算環境，處理跨電腦的行政交接與資料盤點。",
          resultSummary: "讓 AI 成為每位行政同仁 24 小時無休、最貼心的數位夥伴。"
        }
      ],
      uiEntry: "Dot. / @ChatGPT / LINE Developers Messaging API / 通訊軟體機器人介面。",
      voiceScript: "第五站 Bot 專屬秘書。它是人類與所有複雜系統的最簡入口。同仁完全不需要學習複雜的後台，在 LINE 聊天室說一句話，Bot 就能幫你觸發固定規則、啟動 Skill 範本，甚至喚醒 Agent 處理排程衝突！"
    }
  ],

  // 決策矩陣 (Slide 31)
  decisionMatrix: [
    {
      question: "需要定義交付什麼標準、欄位與驗收規格？",
      targetId: "prompt",
      name: "Prompt",
      reason: "單次需求明確，需要用清晰咒語定義材料、要求與格式"
    },
    {
      question: "有固定作業方法與檢查規則，需要套用新資料反覆重用？",
      targetId: "skill",
      name: "Skill",
      reason: "流程固定，只需替換資料（如支出證明、活動通知），保存一次終身受益"
    },
    {
      question: "需要讓 AI 讀取檔案、呼叫 API 或寫入外部軟體（如 Google 日曆）？",
      targetId: "tool",
      name: "Tool",
      reason: "需要突破文字框，讓 AI 伸出手腳執行真實系統讀寫與 MCP 調度"
    },
    {
      question: "過程中充滿變數與未知，需要 AI 自行觀察、判斷下一步與自我修正？",
      targetId: "agent",
      name: "Agent",
      reason: "涉及多步驟決策、非線性流程與異常自我修復（如文件到官網流水線）"
    },
    {
      question: "需要給全校同仁或主管一個最簡單、免學習的即時通訊介面？",
      targetId: "bot",
      name: "Bot",
      reason: "以 LINE 或日常對話為入口，背後無縫串接 Skill 與 Agent"
    }
  ],

  // 綜合演練：從文件到官網的自動化流水線 6 步驟 (Slide 32 & Slide 22)
  pipeline6Steps: [
    {
      step: 1,
      moduleType: "人類 / 外部",
      title: "收集公文與通知",
      desc: "日常公文、校外研習競賽簡章、各處室宣導資料紙本掃描或電子檔。",
      detail: "由各處室承辦人或信箱接收，作為原始材料。",
      icon: "📥"
    },
    {
      step: 2,
      moduleType: "雲端儲存",
      title: "集中放入指定雲端資料夾",
      desc: "集中存放到指定 Google Drive / 本地資料夾，下達啟動指令或自動觸發。",
      detail: "確立單一資訊來源 (Single Source of Truth)，便於 AI 批次讀取。",
      icon: "📂"
    },
    {
      step: 3,
      moduleType: "Agent (大腦)",
      title: "Agent 智慧讀取與分類",
      desc: "由 Agent 自主閱讀內容，判斷公告屬性（研習活動、競賽獲獎、一般行政）。",
      detail: "遇到簡章缺漏或日期不明時，主動標註需追查之處，而非卡死中斷。",
      icon: "🧠"
    },
    {
      step: 4,
      moduleType: "Skill (模具)",
      title: "Skill 整理成網頁標準格式",
      desc: "調用預先寫好的新聞發布 Skill，自動萃取人事實地物、重點期程四格卡與報名超連結。",
      detail: "確保全校或全系公告風格百分之百統一，規格完美一致。",
      icon: "⚙️"
    },
    {
      step: 5,
      moduleType: "Tool (手腳)",
      title: "Tool 串接 GitHub Pages 批次發布",
      desc: "透過 GitHub CLI / API (Tool) 自動更新遠端倉庫的 index.html 與靜態附件。",
      detail: "自動計算 SHA1 防重複，寫入 published_log.json 保留稽核軌跡。",
      icon: "🚀"
    },
    {
      step: 6,
      moduleType: "終端呈現",
      title: "完美嵌入學校官網最新消息",
      desc: "以 iframe 方式無縫嵌入學校 Rpage 官網，全白底無外框，同仁即刻查閱！",
      detail: "支援單頁原地展開 (SPA) 與響應式 RWD，手機電腦皆順暢。",
      icon: "🌐"
    }
  ],

  // 避坑守則與前置設定 (Slide 3 & 守則文件)
  criticalTips: [
    {
      title: "📬 關鍵前置步驟：學校信箱轉寄至 Gmail",
      badge: "最常踩坑",
      content: "若要讓 AI 幫你收信寄信，務必登入 Mail2000 ➔ 個人設定 ➔ 信件處理 ➔ 自動轉寄至 Gmail（最好是 gm.nutc.edu.tw）。且「設定完必須實測真的收得到」！注意：轉寄只代表能在 Gmail 收信，不代表可以學校帳號 From 寄出。"
    },
    {
      title: "🛡️ 地端執行與隱私防護罩",
      badge: "資安第一",
      content: "像課表戰情室、考生聯絡電話系統，涉及敏感個資時，程式與資料應維持「地端執行」，不需要 Tool 串接外網，確保個資絕不外流。"
    },
    {
      title: "🚦 發布前保留「人工審核節點」",
      badge: "安全護欄",
      content: "AI 代勞資料整理與格式轉換，真人專注「內容確認與拍板核准」。公文草稿做完 ≠ 已上簽核准，等待是正常工作狀態，嚴守安全邊界。"
    }
  ]
};
