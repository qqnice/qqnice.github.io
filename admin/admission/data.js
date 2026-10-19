// ============================================================================
// 10 個 AI 打工仔：招生行政自動化互動指南 - 核心資料庫與視覺示意圖 (data.js)
// ============================================================================

window.WORKFLOW_DATA = {
  // --------------------------------------------------------------------------
  // 1. 前置作業：帳號與應用程式檢核清單 (對應手冊 2.1)
  // --------------------------------------------------------------------------
  prereqChecklist: [
    {
      id: "prep-1",
      category: "1. 帳號準備",
      title: "準備 ChatGPT 帳號 ＋ Google / Gmail 帳號",
      desc: "準備好 ChatGPT 與 Google 帳號。注意：工具可以使用同一個 Gmail 方便記憶，但並非強制同信箱。",
      tag: "Step 1 基礎帳號",
      tip: "尚未註冊者請依官方說明先行申請。"
    },
    {
      id: "prep-2",
      category: "2. 信箱轉寄（必做！）",
      title: "⭐ 先把「學校信箱」設定自動轉寄到 Gmail（並實測收件！）",
      desc: "關鍵前置步驟！為了讓 AI（第 08 步 CollectEventResults）能自動幫你收到學校信箱的回信與成果附件，請先依學校允許的轉寄方式，把學校信箱設定自動轉寄到你的 Gmail，並實際寄一封信確認 Gmail 真的收得到！",
      tag: "Step 2 關鍵前置",
      tip: "重要觀念：轉寄到 Gmail 代表「能在 Gmail 收信」，但不代表能以學校信箱作為 From（寄件人）寄出！"
    },
    {
      id: "prep-3",
      category: "3. 桌面環境",
      title: "安裝桌面版 Codex（可讀寫本機專案資料夾）",
      desc: "必須安裝桌面版 Codex 並能開啟本機資料夾！單純開網頁版一般聊天，不具備本機技能與檔案操作環境。",
      tag: "Step 3 核心環境",
      tip: "若在第三會議室上課未預裝，請依講師當天提供的安裝檔操作。"
    },
    {
      id: "prep-4",
      category: "4. 額度確認",
      title: "確認模型、工具權限與使用額度",
      desc: "確認帳號目前的訂閱方案與可用額度。不同方案額度不同，需留意是否足夠執行完整階段。",
      tag: "Step 4 額度確認",
      tip: "只檢查當前階段所需工具即可，不必因為後面工具沒連好就卡住第一步。"
    },
    {
      id: "prep-5",
      category: "5. 校務系統",
      title: "確認校務 ePortal 帳號 ＋ 群組寄信權限",
      desc: "用於第 04 步寄發全校教學單位與專任教師招募公告信。",
      tag: "Step 5 校務權限",
      tip: "搭配已連接的 Chrome 官方個人檔案進行自動填表與組織樹選取。"
    },
    {
      id: "prep-6",
      category: "6. Google 工具連接",
      title: "確認 Google 表單 / 試算表權限 ＆ 核對 Gmail 連接信箱",
      desc: "確認 Google 帳號可建立 Google Form 與連結回覆試算表（Sheet），並核對 AI 的 Gmail 連接工具實際連到上述接收轉寄的那個 Gmail 信箱。",
      tag: "Step 6 工具核對",
      tip: "請確認連接的 Gmail 與接收學校轉寄信的是同一個信箱！"
    },
    {
      id: "prep-7",
      category: "7. 瀏覽器外掛",
      title: "使用 Chrome 官方連接入口（勿裝山寨外掛）",
      desc: "需要 Chrome 外掛操作表單或 ePortal 時，務必使用 App 提供的官方連接入口，並確認連對 Chrome 個人檔案。",
      tag: "Step 7 資安守則",
      tip: "千萬不要在商店亂裝名稱相近的第三方不明外掛！"
    },
    {
      id: "prep-8",
      category: "8. 技能包下載",
      title: "下載課程招生版技能包 ZIP 與教材",
      desc: "從講師連結或 TronClass 取得招生版 10 個技能 ZIP 包（Notion 僅作教材記錄，非執行必要條件）。",
      tag: "Step 8 技能安裝",
      tip: "切勿把個人密碼、驗證碼或權杖（Token）放進技能 ZIP 包裡！"
    }
  ],

  // --------------------------------------------------------------------------
  // 2. 四種身分要分清楚 (對應手冊 2.1 重點提示)
  // --------------------------------------------------------------------------
  fourIdentities: [
    {
      role: "身分 1：ChatGPT / Codex 登入者",
      icon: "🤖",
      color: "blue",
      meaning: "目前坐在電腦前操作 AI 軟體的帳號",
      trap: "AI 絕對不會因為你登入了 Codex，就自動假設你就是這次活動的聯絡承辦人！"
    },
    {
      role: "身分 2：Google 表單擁有者",
      icon: "📝",
      color: "purple",
      meaning: "瀏覽器中建立報名表與回覆試算表（Sheet）的 Google 帳號",
      trap: "建立表單前 AI 會先跟你確認使用哪個 Google 帳號，避免建在私人或錯誤帳號下。"
    },
    {
      role: "身分 3：實際 Gmail 收寄件帳號（接收學校信箱轉寄）",
      icon: "📧",
      color: "amber",
      meaning: "接收「學校信箱自動轉寄來信」以及第 07 步寄發「行前通知」的 Gmail 信箱",
      trap: "務必先設定「學校信箱自動轉寄到此 Gmail」才能讓 AI 自動收信！但注意：轉寄僅代表可收信，寄出時 From 仍是此 Gmail，送出前必展示完整帳號供你確認。"
    },
    {
      role: "身分 4：活動承辦人（署名）",
      icon: "🪪",
      color: "emerald",
      meaning: "印在所有信件底部署名、戰情表窗口、讓老師打分機找人的那位同仁",
      trap: "第 01 步就會存成《承辦人資料.json》與《信件署名.txt》，之後每封信自動帶入，不用重打！"
    }
  ],

  // --------------------------------------------------------------------------
  // 3. 工作區準備資料與檔案樹互動預覽 (對應手冊 2.3 & 第十五節)
  // --------------------------------------------------------------------------
  workspaceMaterials: [
    { item: "⭐ 學校信箱設定自動轉寄至 Gmail", usage: "讓老師回傳至學校信箱的信件與成果自動進入 Gmail 供 AI 查收", fallback: "必做前置步驟！設定後請實測確認收得到信（轉寄僅供收信，寄出 From 仍為 Gmail）" },
    { item: "招生邀請信、公文或活動要約", usage: "活動事實唯一來源（時間、地點、對象）", fallback: "可先貼文字；缺項由 AI 集中向你確認，絕不自己亂編" },
    { item: "承辦人聯絡資訊", usage: "全部郵件底部署名、戰情表聯絡窗口", fallback: "第 01 步初始化時先收集並確認，之後全程沿用" },
    { item: "公文範本/", usage: "第 06 步製作 Word 上簽草稿的版型參考", fallback: "到製作公文階段再補也可以，不會擋住前面建檔與開表單！" },
    { item: "必要附件/", usage: "第 07 步寄行前通知需要的表單與說明檔", fallback: "寄行前通知前盤點即可（不強迫永遠固定五份）" },
    { item: "本次正式公文 PDF", usage: "核對請假依據與行前通知附件", fallback: "公文草稿可先做；但正式行前通知會等待正式文件核對" },
    { item: "教學單位母表", usage: "表單下拉選單 ＆ 戰情表已報名/未報名分母", fallback: "查學校可驗證來源；未知先標待建立，不拿舊名單冒充當日查證" }
  ],

  fileTreeItems: [
    {
      path: "招生專案/AGENTS.md",
      type: "doc",
      stage: "總控 ActivityAgent",
      badge: "工作流規則",
      desc: "專案的工作流總規則說明。若資料夾原本就有 AGENTS.md，AI 會保留既有內容並適度增補，不會粗暴覆蓋其他專案規則。"
    },
    {
      path: "招生專案/公文範本/",
      type: "folder",
      stage: "06 CreateNormal",
      badge: "前置/階段準備",
      desc: "存放學校上簽公文的標準 Word 範本。AI 在第 06 步會打開內文核對結構，但絕不會把舊範本裡的經費、舊主管簽名或印章抄過來。"
    },
    {
      path: "招生專案/必要附件/",
      type: "folder",
      stage: "07 SendEventMail",
      badge: "行前通知附件庫",
      desc: "存放給報名老師的通用附件，如：招生倫理守則、公差假流程、交通明細表 Word、活動成果空白範本 Word。"
    },
    {
      path: "1151219高雄高商/活動資料.json",
      type: "json",
      stage: "01 InitActivity",
      badge: "核心身分證",
      desc: "記錄唯一代號（如 EVT-20261219-001）、資料夾路徑、活動日期時間，以及後續補上的 Google 表單短網址與 Sheet ID。所有打工仔都認這張身分證！"
    },
    {
      path: "1151219高雄高商/承辦人資料.json ＆ 信件署名.txt",
      type: "doc",
      stage: "01 InitActivity",
      badge: "自動署名檔",
      desc: "保存承辦人的姓名、單位、職稱、電話分機與 Email。後續第 04、07、08 步寫信時自動帶入正文底部，免去每次重打！"
    },
    {
      path: "1151219高雄高商/工作進度.json",
      type: "json",
      stage: "總控 ActivityAgent",
      badge: "跨電腦記憶中樞",
      desc: "保存每一階段的 status（狀態）、outputs（產物）、evidence（證據）、pending_questions（待確認問題）與 resume_hint（下一句接續語句）。換電腦也能一秒接續！"
    },
    {
      path: "1151219高雄高商/戰情表網站/ ＆ 戰情表紀錄.json",
      type: "web",
      stage: "02 CreateSite",
      badge: "私人戰情室 (owner-private)",
      desc: "你的任務導航中心！包含網站原始碼、Site ID、部署網址（chatgpt.site，預設僅自己可見）、7 大行政檢核狀態與教學單位母表對照紀錄。"
    },
    {
      path: "1151219高雄高商/群組信草稿.md ＆ 群組寄信紀錄.json",
      type: "mail",
      stage: "04 SendGroupMail",
      badge: "雙重確認留存",
      desc: "完整保存招募信主旨、內文、預設寄送群組，以及「本機草稿確認」與「ePortal 提交確認」兩道安全把關紀錄。"
    },
    {
      path: "1151219高雄高商/報名資料/報名資料最新.xlsx",
      type: "excel",
      stage: "05 UpdateNews",
      badge: "真實快照＋雜湊驗證",
      desc: "從 Google Sheet 匯出的真正 XLSX 檔案（絕非 CSV 假改副檔名），搭配《來源紀錄.json》記下 SHA-256 指紋、下載時間與回覆筆數。"
    },
    {
      path: "1151219高雄高商/高雄高商大學博覽會上簽公文草稿.docx",
      type: "doc",
      stage: "06 CreateNormal",
      badge: "可編輯 Word 草稿",
      desc: "自動帶入活動說明與已核對報名名單的上簽公文草稿。採用「擬、敬請核示」等草稿語氣，方便承辦人微調後依校內程序送簽。"
    },
    {
      path: "1151219高雄高商/本次正式公文.pdf",
      type: "pdf",
      stage: "07 SendEventMail",
      badge: "真人放入、AI 核對內文",
      desc: "長官核准後由承辦人放進資料夾的正式公文。AI 會打開 PDF 內文核對學校、日期與人員，確認真的能當作請假依據後，才會夾帶進行前通知！"
    },
    {
      path: "1151219高雄高商/活動成果/ ＆ 成果網站/",
      type: "web",
      stage: "08 & 09 成果回收與建站",
      badge: "智慧歸檔＋私人成果展",
      desc: "《活動成果/》存放從信箱收回並按「姓名_用途_郵件ID」命名的附件；《成果網站/》則是自動配對照片與說明後生成的深藍質感私人成果網站！"
    }
  ],

  // --------------------------------------------------------------------------
  // 4. 戰情表 (CreateSite) 三模式進化 ＆ 7 項行政檢核 ＆ 隱私模擬器資料
  // --------------------------------------------------------------------------
  warRoomModes: {
    modeA: {
      id: "modeA",
      badge: "A 模式：活動剛建檔（第 02 步）",
      title: "本機戰情表草稿（Localhost 預覽）",
      statusText: "🏠 本機草稿・尚未發布至網路",
      urlText: "http://localhost:8000 (僅本機預覽，外人無法連線)",
      when: "只要完成第 01 步（確認活動、承辦人、建立資料夾）即可立刻啟動！不需要等表單、不需要等任何人報名。",
      highlights: [
        "呈現活動基本資訊（115/12/19 高雄高商大學博覽會）、承辦窗口與待辦事項",
        "列出 7 項行政檢核（Checklist）與全校教學單位母表框架",
        "因為還沒建表單，報名統計區誠實顯示「尚未建立／尚未讀取」，絕不假造「0 人、0%」欺騙自己！"
      ],
      stats: {
        formLink: "尚未建立（待第 03 步完成）",
        sheetLink: "尚未建立（待第 03 步完成）",
        regCount: "尚未讀取來源",
        deptStatus: "母表已載入（待報名資料匯入後對照）"
      },
      checks: [false, false, false, false, false, false, false]
    },
    modeB: {
      id: "modeB",
      badge: "B 模式：表單完成後（第 03 步後）",
      title: "補齊雙連結 ＆ 首次發布私人戰情表",
      statusText: "🔒 已發布上線（預設 Owner-Private 僅自己可見）",
      urlText: "https://kaohsiung-admissions-dashboard.nutcqqnice.chatgpt.site",
      when: "當第 03 步完成 Google 表單發布，且驗證「作答短網址」與「回覆 Sheet」兩個連結都可用後，立即補回原戰情表並首次發布！",
      highlights: [
        "戰情表正式具備點擊跳轉「Google 報名表」與「回覆 Sheet」的雙連結按鈕",
        "發布至授權的 chatgpt.site（注意：不是 Google Sites），綁定固定 Site ID，後續永遠更新同一網站、不重複亂建新站",
        "無須等待第一位老師報名即可先發布上線，讓你在寄發全校群組信前就擁有完整指揮台！"
      ],
      stats: {
        formLink: "https://forms.gle/kH8x... (已驗證可用 ✅)",
        sheetLink: "docs.google.com/spreadsheets/d/18WQ... (已配對 ✅)",
        regCount: "0 筆有效報名（等待第 04 步寄出招募信）",
        deptStatus: "全校 24 個教學單位待報名"
      },
      checks: [true, true, false, false, false, false, false]
    },
    modeC: {
      id: "modeC",
      badge: "C 模式：報名期間與後續追蹤（第 05~09 步）",
      title: "更新報名名單、教學單位對照 ＆ 檢核推進",
      statusText: "📊 動態追蹤中（已同步最新報名 XLSX 快照）",
      urlText: "https://kaohsiung-admissions-dashboard.nutcqqnice.chatgpt.site",
      when: "第 05 步下載最新《報名資料最新.xlsx》後，自動將有效報名人員對應到「完整教學單位母表」，並隨進度推進 7 項行政檢核！",
      highlights: [
        "自動比對「完整教學單位母表」：清楚列出各單位報名人數、已報名單位 vs. 未報名單位（方便規劃催辦，但絕不會擅自亂寄催繳信）",
        "智慧抓錯：若遇到未知單位、重複報名或暱稱（如 QQnice），會特別標示「待人工核對」，不會把原始回覆筆數直接當成定案人數",
        "保護歷史勾選：更新名單時會提示承辦人重新核對第 3 項，但會完整保留既有的寄信紀錄與其他檢核狀態！"
      ],
      stats: {
        formLink: "https://forms.gle/kH8x... (開放填答中 ✅)",
        sheetLink: "最後快照：2026-10-18 19:17 (SHA-256 已驗證 ✅)",
        regCount: "3 位報名（含待核對暱稱：QQnice、QQ2、QQ3）",
        deptStatus: "已報名 3 單位 ／ 未報名 21 單位（母表減法對照）"
      },
      checks: [true, true, true, true, true, false, false]
    }
  },

  sevenChecklists: [
    { num: 1, title: "是否已經寄發群組信", rule: "「送出 ePortal 申請」與「實際寄發」分開記錄，誠實反映進度。" },
    { num: 2, title: "是否收到群組信寄發成功", rule: "依校務系統成功通知或可驗證證據打勾，絕不因為有人報名就自己倒推打勾。" },
    { num: 3, title: "確認報名、確認線上表單報名資訊", rule: "有有效名單後由「承辦人親自核對」才打勾，不會因為下載完 Excel 就自動打勾！" },
    { num: 4, title: "活動公文已上簽", rule: "未完成第 3 項名單核對前，不可新增此項勾選；且「Word 草稿完成」不等於「已上簽」。" },
    { num: 5, title: "是否發送老師群組信／行前通知", rule: "指第 07 步寄給「已報名人員」的 Gmail 行前通知，與第 1 項全校招募公告嚴格區分。" },
    { num: 6, title: "是否收到老師的成果報告", rule: "誠實顯示實際收件數（如：已收 1/3 份），部分收到絕不能宣稱全員繳齊。" },
    { num: 7, title: "是否製作完成果網站", rule: "以第 09 步實際部署網站結果判斷；但網站做好不代表行政程序已正式結案。" }
  ],

  // --------------------------------------------------------------------------
  // 5. 十個打工仔 (1 總控 + 9 執行技能) 完整互動步驟資料
  // --------------------------------------------------------------------------
  skills: [
    {
      stepIndex: 0,
      code: "總控入口",
      id: "activityagent",
      name: "ActivityAgent",
      persona: "總控包工頭（專案領班）",
      avatar: "👷‍♂️",
      color: "blue",
      tagline: "負責任務導航、記憶進度、協調 9 大打工仔，絕不擅自越權！",
      whatYouGet: [
        "自動建立或讀取《工作進度.json》，清楚知道目前做到哪一步、停在哪裡",
        "每次對話結束都貼心告訴你：「現在完成什麼、正在等什麼、下一句可以怎麼跟我說」",
        "換電腦或隔天重開時，一秒幫你找回狀態，不用從頭翻聊天紀錄"
      ],
      executionSteps: [
        "呼叫 @activityagent 後，先讓你選擇：「建立新活動」、「接續既有活動」或「只查看流程與進度」（不會因為你瀏覽器開著某網頁就自己亂猜活動）。",
        "確認執行範圍：「依流程引導完成」、「只做指定階段」或「先看計畫」。若選只查看，絕不偷建資料夾或動外部工具。",
        "需要某一步時，精準讀取該打工仔的 SKILL.md 規則，並把產物、證據與待確認問題寫入《工作進度.json》。"
      ],
      guardrails: {
        aiDoes: "讀取現有檔案與進度、協調對應階段的 Skill、記錄檢查證據、提示下一步接續語句。",
        humanDoes: "選擇要處理的活動與範圍、在每個等待點（審稿、核對名單、放公文）做出決定。",
        neverDo: "總控是「對話式協調者」，不是常駐偷跑的背景程式！沒有你的明確要求，絕不會半夜自己偷查信、偷下載或亂發催繳信。"
      },
      prompts: [
        {
          label: "🚀 啟動全新招生活動（萬用起手式）",
          text: "@activityagent 我要開始新的招生活動，以下是邀請內容。請依招生工作流引導我，先整理活動與承辦人資料，再建立本機戰情表。需要確認的事情請優先用選項，寄信一定先給我看完整草稿。"
        },
        {
          label: "🔄 隔天或換電腦接續進度",
          text: "@activityagent 接續既有活動，先讀工作進度，告訴我目前停在哪裡、下一步該做什麼。"
        }
      ],
      diagramHtml: `
        <div class="bg-slate-900 text-white p-5 rounded-xl border border-slate-700 shadow-inner">
          <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">👷‍♂️</span>
              <div>
                <div class="font-bold text-blue-300 text-sm">ActivityAgent 總控領班指揮台</div>
                <div class="text-xs text-slate-400">記憶檔案：1151219高雄高商/工作進度.json</div>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-medium">狀態：對話式安全協調中</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700">
              <div class="text-blue-400 font-bold mb-1.5 flex items-center gap-1"><span>①</span> 選活動與範圍</div>
              <div class="space-y-1.5 text-slate-300">
                <div class="p-1.5 rounded bg-blue-600/30 border border-blue-500/50 text-white font-medium">🔘 建立新活動</div>
                <div class="p-1.5 rounded bg-slate-700/50">⚪ 接續：1151219高雄高商</div>
                <div class="p-1.5 rounded bg-slate-700/50">⚪ 只查看流程與進度</div>
              </div>
            </div>
            <div class="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700">
              <div class="text-amber-400 font-bold mb-1.5 flex items-center gap-1"><span>②</span> 調度 9 大專職打工仔</div>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                <span class="p-1.5 bg-emerald-600/30 border border-emerald-500/40 rounded text-emerald-200">01 建檔 ✓</span>
                <span class="p-1.5 bg-emerald-600/30 border border-emerald-500/40 rounded text-emerald-200">02 戰情 ✓</span>
                <span class="p-1.5 bg-blue-600/40 border border-blue-400 rounded text-white font-bold animate-pulse">03 表單 ⏳</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">04 群組信</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">05 下載</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">06 公文</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">07 行前信</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">08 收成果</span>
                <span class="p-1.5 bg-slate-700/60 rounded text-slate-400">09 成果站</span>
              </div>
            </div>
            <div class="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700">
              <div class="text-emerald-400 font-bold mb-1.5 flex items-center gap-1"><span>③</span> 每次停駐清楚交接</div>
              <div class="font-mono-code text-[11px] text-slate-300 space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                <div><span class="text-purple-400">"status"</span>: <span class="text-amber-300">"等待確認"</span>,</div>
                <div><span class="text-purple-400">"outputs"</span>: [<span class="text-emerald-300">"本機戰情表"</span>],</div>
                <div><span class="text-purple-400">"resume_hint"</span>: <span class="text-sky-300">"請建立報名表"</span></div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 1,
      code: "Step 01",
      id: "initactivity",
      name: "InitActivity",
      persona: "建檔書記官（情報整理員）",
      avatar: "🗂️",
      color: "indigo",
      tagline: "讀懂來文邀請、區分已知與待確認、建立全流程唯一標準資料夾與署名檔！",
      whatYouGet: [
        "自動建立唯一活動資料夾（如 `1151219高雄高商/`）與專屬代號（如 `EVT-20261219-001`）",
        "產出《活動資料.json》、《活動資訊.txt》、《邀請內容.txt》保存原始證據",
        "產出《承辦人資料.json》與《信件署名.txt》，後續寄信自動帶入聯絡方式"
      ],
      executionSteps: [
        "檢查是否有既有承辦人資料：有就展示讓你選「沿用」或「修改」；沒有才集中詢問（絕不把電腦登入者直接當承辦人）。",
        "精讀邀請內文：萃取學校、活動名稱、日期、時間、地點與對象，嚴格區分「來文日、報名截止日、活動當日」三種日期！",
        "區分「原文明載」、「使用者補充」與「待確認」：若預計人數或截止時刻未定，誠實標記為「待定」，絕不自行腦補填滿。",
        "檢查工作區流水號後分配唯一 `activity_id`，後續所有技能都認這個 ID 與資料夾，不會重複亂開新資料夾。"
      ],
      guardrails: {
        aiDoes: "解析邀請函文字、檢查既有承辦人設定、建立標準檔案結構、分離原文與待確認項目。",
        humanDoes: "確認活動日期與身分、點選「沿用」或補充承辦人分機與信箱、確認非必要缺項是否先標為待定。",
        neverDo: "日期或承辦人未確認前絕不擅自完成初始化；也絕不會把來文日期誤當成活動日期！"
      },
      prompts: [
        {
          label: "📥 提供邀請內容並啟動建檔",
          text: "這是高雄高商大學博覽會的邀請函內容：[貼上文字或提供檔案]，承辦人資料請沿用既有設定，未定的截止時間請先標記待定。"
        },
        {
          label: "✅ 確認建檔完成，推進到戰情表",
          text: "活動資料與承辦人署名都確認無誤了，請先建立本機戰情表。"
        }
      ],
      diagramHtml: `
        <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200">
          <div class="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            <!-- 左：輸入 -->
            <div class="md:col-span-4 bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
              <div class="text-xs font-bold text-slate-500 mb-1">📄 輸入：原始招生邀請函</div>
              <div class="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div>「誠摯邀請貴校參加 <strong class="text-indigo-700">115年12月19日 (08:30-12:30)</strong> 高雄高商大學博覽會... 請於 <strong class="text-amber-700">11月5日</strong> 前回覆...」</div>
              </div>
              <div class="mt-2 flex flex-wrap gap-1 text-[11px]">
                <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">自動分離：來文日 ≠ 截止日 ≠ 活動日</span>
              </div>
            </div>
            <!-- 中：轉換箭頭 -->
            <div class="md:col-span-3 flex flex-col items-center justify-center text-center py-2">
              <div class="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow animate-float">
                🗂️ InitActivity 萃取核對
              </div>
              <div class="text-[11px] text-indigo-700 font-medium mt-1.5">真人確認承辦人：沿用 / 修改</div>
              <div class="text-indigo-400 text-lg font-bold mt-0.5">━━━▶</div>
            </div>
            <!-- 右：產出資料夾 -->
            <div class="md:col-span-4 bg-white p-3.5 rounded-lg border-2 border-indigo-400 shadow-sm">
              <div class="text-xs font-bold text-indigo-900 mb-1.5 flex items-center justify-between">
                <span>📁 1151219高雄高商/</span>
                <span class="font-mono-code text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">EVT-20261219-001</span>
              </div>
              <ul class="text-xs space-y-1 text-slate-700 font-mono-code">
                <li class="flex items-center gap-1.5"><span class="text-emerald-600">✔</span> 活動資料.json <span class="text-[10px] text-slate-400">(唯一ID)</span></li>
                <li class="flex items-center gap-1.5"><span class="text-emerald-600">✔</span> 活動資訊.txt / 邀請內容.txt</li>
                <li class="flex items-center gap-1.5"><span class="text-emerald-600">✔</span> 承辦人資料.json</li>
                <li class="flex items-center gap-1.5"><span class="text-emerald-600">✔</span> 信件署名.txt <span class="text-[10px] text-slate-400">(郵件自動帶入)</span></li>
              </ul>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 2,
      code: "Step 02",
      id: "createsite",
      name: "CreateSite",
      persona: "戰情室設計師（全場靈魂人物）",
      avatar: "🛡️",
      color: "emerald",
      tagline: "先開戰情表再做事！自帶 7 大行政檢核與教學單位母表對照，預設私密、分享長官即看進度！",
      whatYouGet: [
        "【A 模式】建檔後立即產出《戰情表網站/》本機預覽，掌握全局待辦與 7 大行政檢核",
        "【B 模式】第 03 步表單建好後，補上「表單＋Sheet 雙連結」並首次發布至私人 `chatgpt.site`",
        "【C 模式】第 05 步下載 Excel 後，自動對照「全校教學單位母表」，呈現已報名/未報名單位與待核對名單"
      ],
      executionSteps: [
        "【A 模式（初始化後立即建立）】：不需等表單或報名者！立刻建立本機戰情表，報名統計誠實顯示「尚未建立／尚未讀取」，不假造 0 人。",
        "【B 模式（首次發布上線）】：驗證 Google 表單作答網址與回覆 Sheet 兩者皆可用後，補入原戰情表並發布至 `chatgpt.site`（預設 `owner-private` 只有你看得到）。",
        "【C 模式（持續追蹤更新）】：讀取已驗證的報名 Excel，用「全校教學單位母表」減去「有效報名單位」得出未報名單位清單，並維持同一 Site ID 原站更新！"
      ],
      guardrails: {
        aiDoes: "建立與更新戰情表網頁、驗證雙連結、執行教學單位母表對照、分開保存「機器證據」與「人工勾選」。",
        humanDoes: "核對有效報名名單後勾選第 3 項檢核、完成送簽後勾選第 4 項、決定是否將戰情表連結授權分享給長官查看。",
        neverDo: "絕不因為換對話就另建新網站（永遠查既有 Site ID 更新原站）；下載失敗時絕不把舊名單清空歸零；絕不自動寄出催報名信！"
      },
      prompts: [
        {
          label: "🏠 A 模式：建檔後立即啟動本機戰情表",
          text: "活動資料確認了，請先建立本機戰情表（A 模式）。"
        },
        {
          label: "🚀 B 模式：表單完成後補雙連結並首次發布",
          text: "表單與 Sheet 都好了，請補到原戰情表再發布（B 模式）。"
        },
        {
          label: "📊 C 模式：用最新報名 Excel 更新原戰情表",
          text: "用剛下載的報名資料更新原戰情表，保留既有檢核與寄信狀態（C 模式）。"
        }
      ],
      diagramHtml: `
        <div class="bg-emerald-950 text-white p-5 rounded-xl border border-emerald-700">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🛡️</span>
              <div>
                <div class="font-bold text-emerald-300 text-sm">CreateSite 戰情表：會出場 3 次的指揮中心</div>
                <div class="text-xs text-emerald-400/80">網址：*.chatgpt.site ｜ 預設權限：🔒 owner-private（僅自己可見，分享長官才可見）</div>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold">同一 Site ID 持續進化</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-emerald-900/50 p-3.5 rounded-lg border border-emerald-700/80">
              <div class="font-bold text-emerald-200 mb-1">🏠 A 模式（第 02 步）</div>
              <div class="text-emerald-100/90 mb-2">剛建檔完立刻做！本機草稿預覽</div>
              <div class="p-2 rounded bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300">
                • 活動資訊與承辦窗口<br/>
                • 7 項行政檢核表框架<br/>
                • 報名區標示「尚未建立」
              </div>
            </div>
            <div class="bg-emerald-900/50 p-3.5 rounded-lg border border-emerald-500 shadow">
              <div class="font-bold text-amber-300 mb-1">🌐 B 模式（第 03 步後）</div>
              <div class="text-emerald-100/90 mb-2">補齊「表單＋Sheet」雙連結首次發布</div>
              <div class="p-2 rounded bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300">
                • 驗證兩連結可用後嵌入<br/>
                • 首次發布至 chatgpt.site<br/>
                • 跨網域保存既有人工檢核
              </div>
            </div>
            <div class="bg-emerald-900/50 p-3.5 rounded-lg border border-emerald-700/80">
              <div class="font-bold text-sky-300 mb-1">📈 C 模式（第 05 步後）</div>
              <div class="text-emerald-100/90 mb-2">匯入真實 XLSX ＆ 教學單位母表對照</div>
              <div class="p-2 rounded bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300">
                • 各系人數、已報 vs 未報單位<br/>
                • 暱稱/異常列為「待核對」<br/>
                • 推進 7 項檢核（不洗掉舊勾選）
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 3,
      code: "Step 03",
      id: "creategoogleform",
      name: "CreateGoogleForm",
      persona: "表單工匠（報名系統建築師）",
      avatar: "📝",
      color: "purple",
      tagline: "嚴格遵守「全部題目與設定檢查完才發布」，自動搞定單位下拉、五職稱與回覆 Sheet 配對！",
      whatYouGet: [
        "設計完整且已發布的 Google 報名表單，取得真正的 `forms.gle` 短網址",
        "完成建立並實際連結的 Google 回覆試算表（Sheet 連結）與表單編輯連結",
        "自動設定好「系統收集 Email」與「一律寄送回覆副本（自動回條）」，報名老師填完立刻收到回條"
      ],
      executionSteps: [
        "確認工具與帳號：先確認使用「側邊瀏覽器」或「Chrome 外掛」，以及要用哪個 Google 帳號建立表單。",
        "寫入表單說明與 6 大核心題目：表單頂部放活動時間地點（不讓老師重填）；依序建立「單位（必填下拉，與戰情表母表一致並保留其他）」、「姓名」、「職稱（必填下拉：教授、副教授、助理教授、職員、學生）」、「聯絡電話」、「確認參加活動（必填核取方塊）」。",
        "設定收集 Email 與回條：開啟系統收集電子郵件（不重複加問 Email 題目），並將回覆副本設為「一律／總是」寄送。",
        "不可顛倒的鐵律：未發布表單 ➔ 完成全部題目與設定 ➔ 展開下拉選單檢查繁體字與五職稱 ➔ 發布 ➔ 取得 `forms.gle` 短網址 ➔ 建立並連結回覆 Sheet ➔ 驗證兩連結後交回 CreateSite B 發布戰情表！"
      ],
      guardrails: {
        aiDoes: "自動操作瀏覽器建立表單題目、核對教學單位母表選項、設定自動回條、建立連結 Sheet、記錄資源 ID。",
        humanDoes: "處理 Google 帳號登入與密碼/兩步驟驗證（AI 絕不保存密碼）、確認特殊報名需求。",
        neverDo: "絕不「先發布半成品表單再補題目」；若只做好表單但 Sheet 連結失敗，會誠實記錄部分完成，絕不謊稱全部完成！"
      },
      prompts: [
        {
          label: "📝 啟動建立 Google 報名表與 Sheet",
          text: "請使用 Chrome 外掛與我目前已登入的 Google 帳號，依活動資料建立 Google 報名表單，完成所有題目與回條設定檢查後再發布，並連結回覆試算表。"
        },
        {
          label: "🔗 表單完成後接續發布戰情表",
          text: "表單短網址與回覆 Sheet 都驗證完成了，請補回原戰情表並執行首次發布。"
        }
      ],
      diagramHtml: `
        <div class="bg-purple-50 p-5 rounded-xl border border-purple-200">
          <div class="text-xs font-bold text-purple-900 mb-3 flex items-center justify-between">
            <span>🔄 不可顛倒的 7 步安全工序（先設計檢查完，才准發布！）</span>
            <span class="px-2 py-0.5 bg-purple-200 text-purple-900 rounded">自動連動戰情表 B 模式</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-medium mb-4">
            <span class="px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-900">1. 未發布草稿</span>
            <span class="text-purple-400">➔</span>
            <span class="px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-900">2. 完成全題目+回條設定</span>
            <span class="text-purple-400">➔</span>
            <span class="px-2.5 py-1 bg-amber-100 border border-amber-400 rounded-lg text-amber-900 font-bold">3. 展開下拉預覽檢查</span>
            <span class="text-purple-400">➔</span>
            <span class="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-bold">4. 正式發布</span>
            <span class="text-purple-400">➔</span>
            <span class="px-2.5 py-1 bg-emerald-100 border border-emerald-400 rounded-lg text-emerald-900">5. 取 forms.gle 短網址</span>
            <span class="text-purple-400">➔</span>
            <span class="px-2.5 py-1 bg-emerald-100 border border-emerald-400 rounded-lg text-emerald-900">6. 建立並連結 Sheet</span>
          </div>
          <div class="mockup-window">
            <div class="mockup-header">
              <div class="mockup-dots"><span class="bg-rose-400"></span><span class="bg-amber-400"></span><span class="bg-emerald-400"></span></div>
              <div class="text-xs text-slate-600 font-medium">Google 表單規格預覽：1151219高雄高商大學博覽會報名表</div>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white">
              <div class="space-y-2">
                <div class="p-2 bg-purple-50/70 rounded border border-purple-100">
                  <span class="font-bold text-purple-800">⚙️ 系統自動收集：</span>電子郵件 + 一律寄送回覆副本（自動回條）
                </div>
                <div class="p-2 bg-slate-50 rounded border border-slate-200">
                  <span class="font-bold text-slate-800">1. 單位（必填下拉）：</span>與戰情表教學單位母表完全一致 +「其他」
                </div>
                <div class="p-2 bg-slate-50 rounded border border-slate-200">
                  <span class="font-bold text-slate-800">2. 姓名（必填簡答）</span> ＆ <span class="font-bold text-slate-800">4. 聯絡電話（保留 0、+、分機）</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="p-2 bg-amber-50/70 rounded border border-amber-200">
                  <span class="font-bold text-amber-900">3. 職稱（必填下拉・嚴格五項）：</span><br/>
                  <span class="inline-block mt-1 px-1.5 py-0.5 bg-white border rounded text-[11px]">教授 ▾</span>
                  <span class="inline-block mt-1 px-1.5 py-0.5 bg-white border rounded text-[11px]">副教授</span>
                  <span class="inline-block mt-1 px-1.5 py-0.5 bg-white border rounded text-[11px]">助理教授</span>
                  <span class="inline-block mt-1 px-1.5 py-0.5 bg-white border rounded text-[11px]">職員</span>
                  <span class="inline-block mt-1 px-1.5 py-0.5 bg-white border rounded text-[11px]">學生 (繁體檢查)</span>
                </div>
                <div class="p-2 bg-emerald-50/70 rounded border border-emerald-200">
                  <span class="font-bold text-emerald-900">5. 確認參加活動（必填核取方塊）：</span><br/>
                  ☑️ 我確認參加本次活動
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 4,
      code: "Step 04",
      id: "sendgroupmail",
      name: "SendGroupMail",
      persona: "大聲公郵差（ePortal 群組信專家）",
      avatar: "📢",
      color: "amber",
      tagline: "自動擬妥招募信，嚴守「先審本機草稿 ➔ 再填 ePortal ➔ 再次確認才提交」的雙重安全鎖！",
      whatYouGet: [
        "自動結合活動資訊、報名短網址與承辦人署名，產出《群組信草稿.md》，不用自己從頭打字",
        "自動在 ePortal 組織樹勾選預設兩大群組：「本校公務帳號（教學單位）」與「本校專任教師」",
        "完整保存兩階段確認紀錄與《群組寄信紀錄.json》，清楚區分「已提交待審」與「實際寄發成功」"
      ],
      executionSteps: [
        "【自動擬稿】：讀取活動資料、表單短網址與承辦署名，擬好主旨與正文，存為《群組信草稿.md》。",
        "【第一道鎖：本機草稿內容確認】：在聊天室完整展示主旨、正文（含署名）、預設收件群組、附件與日期。等你點選「內容正確，前往 ePortal 填寫」後，才開啟 ePortal！",
        "【ePortal 組織樹精準操作】：點收件者「＋」後，在組織樹捲動選取「本校公務帳號（教學單位）」與「本校專任教師」（絕不誤選全校教職員或含兼任教師群組），按「確定加入」回填收件者。",
        "【第二道鎖：填寫後提交確認】：填妥頁面後再次展示實際登入帳號、完整內容與群組，明示「尚未提交／寄出」。等你第二次確認後，才按下提交按鈕！"
      ],
      guardrails: {
        aiDoes: "自動撰寫招募信草稿、操作 ePortal 組織樹選取預設群組、填入主旨內文、查驗提交後的系統狀態。",
        humanDoes: "第 1 次審閱本機草稿內容、決定驗證碼由誰填寫、第 2 次看著填好的 ePortal 畫面下達最終「確認提交」指令。",
        neverDo: "未經確認絕不偷開 ePortal 填寫；絕不為了存檔亂按用途不明的「儲存／提交」按鈕；提交後等待校務系統寄發時，絕不繞去 Gmail 亂代寄或盲目重送！"
      },
      prompts: [
        {
          label: "✍️ 第一階段：審閱本機草稿並授權填寫",
          text: "這份群組信草稿內容與收件群組正確，請幫我填入 ePortal（先不要提交）。"
        },
        {
          label: "🚀 第二階段：檢視 ePortal 畫面後授權提交",
          text: "我已確認目前 ePortal 展示的帳號、收件群組與草稿內容無誤，確認提交目前展示的這份草稿。"
        }
      ],
      diagramHtml: `
        <div class="bg-amber-50 p-5 rounded-xl border border-amber-200">
          <div class="text-xs font-bold text-amber-900 mb-3">🔐 雙重確認安全鎖（兩道關卡，保護全校群組信絕不誤發！）</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-white p-3.5 rounded-lg border-2 border-amber-400 shadow-sm">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-amber-900">🛑 第一道鎖：本機草稿確認</span>
                <span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px]">開網頁前</span>
              </div>
              <p class="text-slate-600 text-[11px] mb-2">AI 產出《群組信草稿.md》，在對話中完整展示：</p>
              <div class="p-2 bg-slate-50 rounded border text-[11px] space-y-0.5 text-slate-700">
                <div>• 完整主旨 ＋ 正文 ＋ 承辦署名</div>
                <div>• 群組：公務帳號(教學單位)、專任教師</div>
                <div class="text-amber-700 font-bold pt-1">👉 你點「內容正確」才進 ePortal</div>
              </div>
            </div>
            <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-800">🌳 中段：ePortal 組織樹填表</span>
                <span class="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">自動填寫</span>
              </div>
              <p class="text-slate-600 text-[11px] mb-2">透過已連接 Chrome 個人檔案操作：</p>
              <div class="p-2 bg-slate-50 rounded border text-[11px] space-y-1 text-slate-700">
                <div>1. 點收件者「＋」開組織樹視窗</div>
                <div>2. 左欄捲動選群組 ➔ 中欄勾選 ➔ 右欄核對</div>
                <div>3. 按「確定加入」（僅回填，非寄出）</div>
              </div>
            </div>
            <div class="bg-white p-3.5 rounded-lg border-2 border-emerald-500 shadow-sm">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-emerald-900">🛑 第二道鎖：提交前最終確認</span>
                <span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">按送出前</span>
              </div>
              <p class="text-slate-600 text-[11px] mb-2">填妥後保留頁面，明示「尚未提交」：</p>
              <div class="p-2 bg-emerald-50/60 rounded border border-emerald-200 text-[11px] space-y-0.5 text-slate-700">
                <div>• 再次核對登入帳號、全文、附件</div>
                <div>• 你下達「確認提交」才按送出鈕</div>
                <div class="text-emerald-800 font-bold pt-1">✔ 分開記錄：已提交 vs 寄發成功</div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 5,
      code: "Step 05",
      id: "updatenews",
      name: "UpdateNews",
      persona: "情報收集員（報名快照管家）",
      avatar: "📥",
      color: "cyan",
      tagline: "每次都從雲端重新匯出真正的 XLSX，驗證結構與 SHA-256 指紋後，連動戰情表更新名單！",
      whatYouGet: [
        "下載真正的 Excel 檔至 `報名資料/報名資料最新.xlsx`（絕非拿 CSV 偷改副檔名）",
        "自動產出《來源紀錄.json》，完整記錄 Sheet ID、下載時間、檔案大小、SHA-256 雜湊值與回覆筆數",
        "安全替換機制：先暫存驗證工作表與欄位無誤，才替換舊快照；若下載失敗會保留上一份成功檔案，絕不洗白舊名單！"
      ],
      executionSteps: [
        "確認來源與目的地：顯示活動名稱、表單連結的 Sheet ID 與下載路徑。",
        "重新讀取與匯出：每次執行都真正從雲端匯出最新資料，絕不拿上一輪聊天室記住的舊數字充當最新結果。",
        "暫存驗證與保留原貌：檢查格式、工作表與欄位後寫入 `報名資料最新.xlsx`，完整保留原始列與歷史欄位，不在這一步擅自刪重或改名。",
        "連動戰情表 C 模式：將最新快照交給 CreateSite C 更新教學單位對照與報名統計。"
      ],
      guardrails: {
        aiDoes: "從 Google Sheet 下載真實 XLSX、計算 SHA-256 指紋、驗證欄位完整性、觸發戰情表 C 模式更新。",
        humanDoes: "在報名期間決定何時要更新一次快照、在準備寫公文前「親自核對有效報名名單（姓名、職稱、單位）」並勾選戰情表第 3 項。",
        neverDo: "零筆報名是有效快照，但絕不能拿零筆空名單去寄信或做公文；人數大於零也不代表名單已定案（例如出現 QQnice 暱稱必須等人工核對）！"
      },
      prompts: [
        {
          label: "📥 下載最新報名 Excel 並更新戰情表",
          text: "請更新這場活動的最新報名資料（UpdateNews），並用新快照更新原戰情表（CreateSite C）。"
        },
        {
          label: "✅ 人工核對完名單，準備進入公文階段",
          text: "我已核對目前戰情表上的有效報名名單，請幫我把戰情表第 3 項「確認報名資訊」打勾，並準備製作上簽公文草稿。"
        }
      ],
      diagramHtml: `
        <div class="bg-cyan-50 p-5 rounded-xl border border-cyan-200">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
            <div class="md:col-span-4 bg-white p-3.5 rounded-lg border border-cyan-200 shadow-sm">
              <div class="font-bold text-cyan-900 mb-1">☁️ Google 回覆試算表 (Sheet)</div>
              <div class="text-[11px] text-slate-600 mb-2">即時收集老師填表回覆（含測試或暱稱）</div>
              <div class="p-2 bg-slate-50 rounded border font-mono-code text-[10px] text-slate-700">
                Row 1: 資訊工程系 | QQnice | 教授<br/>
                Row 2: 應用英語系 | QQ2    | 副教授<br/>
                Row 3: 企業管理系 | QQ3    | 助理教授
              </div>
            </div>
            <div class="md:col-span-4 bg-cyan-900 text-white p-3.5 rounded-lg shadow">
              <div class="font-bold text-cyan-300 mb-1">🛡️ UpdateNews 安全下載守則</div>
              <ul class="text-[11px] space-y-1 text-cyan-100">
                <li>✔ 真正匯出 .xlsx（禁假 CSV）</li>
                <li>✔ 先暫存驗證欄位 ➔ 再覆蓋舊檔</li>
                <li>✔ 保留原始列，不擅自刪改人名</li>
                <li>✔ 寫入 SHA-256 與下載時間戳記</li>
              </ul>
            </div>
            <div class="md:col-span-4 bg-white p-3.5 rounded-lg border-2 border-cyan-500 shadow-sm">
              <div class="font-bold text-slate-900 mb-1">📊 連動戰情表 C 模式 ＆ 人工把關</div>
              <div class="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 mb-1.5">
                ⚠️ 發現示範/暱稱（QQnice 等）：<br/>保留原文並標示「待人工核對正式姓名」
              </div>
              <div class="text-[11px] text-emerald-800 font-bold">
                👉 承辦人核對完成 ➔ 解鎖戰情表檢核 #3
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 6,
      code: "Step 06",
      id: "createnormal",
      name: "CreateNormal",
      persona: "公文師爺（上簽草稿撰寫員）",
      avatar: "📜",
      color: "rose",
      tagline: "結合公文範本、來文與已核對名單，自動產出可編輯 Word 上簽草稿，絕不偽造核准或亂抄舊資料！",
      whatYouGet: [
        "自動產出排版整齊、可編輯的 Word 檔：《活動名稱上簽公文草稿.docx》存於活動根目錄",
        "自動將報名人員的「單位、姓名、職稱、統計人數」帶入公文說明與名單區塊",
        "AI 會在產出後自動渲染檢查中文字型、換頁、名單表格與簽核區版面，並列出待補事項"
      ],
      executionSteps: [
        "核對三方輸入：讀取《公文範本/》內文、本次活動來文與最新報名名單快照（不只看檔名，會真正讀內文）。",
        "依範本撰寫公文結構：包含主旨、活動說明、參加人員名單、辦理事項與擬辦，全程採用「擬、敬請核示、奉核後」等標準草稿語氣。",
        "嚴格隔離舊活動殘留：絕不搬用範本裡舊活動的經費、舊主管姓名、核准狀態、簽名或印章！若有未確認的暱稱（如 QQnice），保留並標記待核對，絕不自己亂猜真名。",
        "等待校內程序：交付 Word 草稿後停駐，等待承辦人依校內規定送簽，並於奉核後放入正式公文 PDF。"
      ],
      guardrails: {
        aiDoes: "讀取公文範本與來文、自動填入活動事實與參加名單、產出 .docx 並檢查排版換頁、標記待核對姓名。",
        humanDoes: "微調 Word 草稿、走校內公文簽核流程、在名單核對且實際送簽後勾選戰情表第 4 項「活動公文已上簽」。",
        neverDo: "本技能不送簽、不蓋章、不代替核准！你可以要求提早做公文草稿，但在還沒完成第 3 項報名名單核對前，絕不能先去勾選「公文已上簽」！"
      },
      prompts: [
        {
          label: "📜 依目前核對名單製作 Word 上簽公文草稿",
          text: "請使用公文範本與最新報名名單，幫我製作這場活動的 Word 上簽公文草稿（CreateNormal）。"
        },
        {
          label: "📄 正式公文核准後，放進資料夾並呼叫下一步",
          text: "正式公文 PDF 已經放進本活動資料夾了，請打開核對內文，並準備行前通知草稿（SendEventMail）。"
        }
      ],
      diagramHtml: `
        <div class="bg-rose-50 p-5 rounded-xl border border-rose-200">
          <div class="grid grid-cols-1 md:grid-cols-11 gap-3 items-center text-xs">
            <div class="md:col-span-4 space-y-2">
              <div class="bg-white p-2.5 rounded-lg border border-rose-200 shadow-sm">
                <span class="font-bold text-rose-800">1. 公文範本/</span> <span class="text-[11px] text-slate-500">（只取版型，剔除舊經費/舊簽章）</span>
              </div>
              <div class="bg-white p-2.5 rounded-lg border border-rose-200 shadow-sm">
                <span class="font-bold text-rose-800">2. 活動來文＆資訊</span> <span class="text-[11px] text-slate-500">（時間、地點、來文依據）</span>
              </div>
              <div class="bg-white p-2.5 rounded-lg border border-rose-200 shadow-sm">
                <span class="font-bold text-rose-800">3. 已核對報名快照</span> <span class="text-[11px] text-slate-500">（自動帶入單位/職稱/姓名）</span>
              </div>
            </div>
            <div class="md:col-span-2 text-center py-2">
              <div class="inline-block px-3 py-1.5 bg-rose-600 text-white rounded-full font-bold text-xs shadow">📜 合成檢查</div>
              <div class="text-[10px] text-rose-700 mt-1">渲染檢查換頁與字型</div>
            </div>
            <div class="md:col-span-5 bg-white p-4 rounded-xl border-2 border-rose-400 shadow-sm">
              <div class="flex items-center justify-between border-b pb-2 mb-2">
                <span class="font-bold text-slate-800">📄 高雄高商大學博覽會上簽公文草稿.docx</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">狀態：草稿完成（待人工送簽）</span>
              </div>
              <div class="bg-slate-50 p-2.5 rounded border text-[11px] text-slate-700 space-y-1">
                <div><strong>主旨：</strong>擬派員參加「115年高雄高商大學博覽會」招生宣導活動，<strong>敬請核示</strong>。</div>
                <div><strong>說明：</strong>依來文辦理，參加人員共計 3 員（詳如名單）...</div>
                <div><strong>擬辦：</strong><strong>奉核後</strong>，通知參加人員依規定辦理公差假事宜。</div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 7,
      code: "Step 07",
      id: "sendeventmail",
      name: "SendEventMail",
      persona: "行前秘書（報名人員通知管家）",
      avatar: "✉️",
      color: "orange",
      tagline: "親自打開公文 PDF 核對內文與請假依據，盤點必要附件後建立 Gmail 草稿，讓你審閱無誤才寄出！",
      whatYouGet: [
        "自動對「本次正式公文 PDF」進行內文查驗，確保真的屬於本活動且可作為請假依據",
        "在你的 Gmail 建立一封真正未寄出的草稿（含已附加的所有適用附件與報名老師收件名單）",
        "一次完整展示「From 寄件帳號、所有收件者姓名與 Email、完整主旨正文、附件清單與數量」供你拍板"
      ],
      executionSteps: [
        "【嚴格核對公文 PDF 內文】：檔名像數字（如 `1231324165.pdf`）只是線索！AI 必定打開 PDF 內文核對學校、日期、地點與參加人員，確認：① 屬於本次活動、② 足以作為信中宣稱的請假依據（未核准的上簽草稿轉 PDF 不算數！）。",
        "【盤點必要附件】：掃描 `必要附件/` 與正式公文（常見如：招生倫理守則、公差假流程、交通明細表 Word、活動成果 Word、正式公文 PDF；以本次確認清單為準，不死板固定五份）。",
        "【撰寫清楚的行前交代】：正文清楚說明：① 活動前依公文附件辦理差假、② 活動後**直接回覆本封信**並夾帶活動成果 Word、③ **交通證明與假單請列印簽名後送回承辦辦公室**（不收電子檔）。",
        "【建立 Gmail 草稿並等待確認】：預設將有效報名人員放於同一封信的 To（明示彼此可見信箱），建立真正 Gmail 草稿後完整展示所有細節，等你確認才寄出一次！"
      ],
      guardrails: {
        aiDoes: "打開 PDF 核對公文真偽與用途、盤點並附加檔案、建立 Gmail 草稿、完整列出收件人與附件清單。",
        humanDoes: "放入正式公文 PDF、核對收件人稱謂（混合教師/職員/學生時）、審閱完整 Gmail 草稿後下達寄送指令。",
        neverDo: "絕不略過附件清單只寫一句「已附五份附件」；若名單新增了報名者，絕不偷偷塞進已確認的草稿裡而不告訴你；若寄送瞬間網路結果不明，必先查「寄件備份」，絕不盲目再按一次寄出造成重複轟炸！"
      },
      prompts: [
        {
          label: "🔍 核對公文 PDF 與附件，建立 Gmail 行前通知草稿",
          text: "正式公文 PDF 已放入活動資料夾，請核對公文內文與《必要附件/》，幫我建立給已報名人員的 Gmail 行前通知草稿（先不要寄出）。"
        },
        {
          label: "📨 審閱完整清單後，授權寄出 Gmail 行前通知",
          text: "我已確認 Gmail 寄件帳號、收件名單、正文與附件清單都正確，請依這份完整草稿寄出。"
        }
      ],
      diagramHtml: `
        <div class="bg-orange-50 p-5 rounded-xl border border-orange-200">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div class="md:col-span-5 bg-white p-3.5 rounded-lg border border-orange-200 shadow-sm space-y-2">
              <div class="font-bold text-orange-900">🔍 第一關：公文 PDF 內文實質查驗</div>
              <div class="p-2 bg-orange-50/70 rounded border border-orange-200 text-[11px] text-slate-700">
                📄 讀取：<span class="font-mono-code">1231324165...上簽公文.pdf</span><br/>
                ✔ 核對學校、日期 (12/19)、地點、名單相符<br/>
                ✔ 確認為已核准依據（非待簽核草稿）
              </div>
              <div class="font-bold text-orange-900 pt-1">📎 第二關：動態盤點本次適用附件</div>
              <div class="flex flex-wrap gap-1 text-[10px]">
                <span class="px-2 py-0.5 bg-slate-100 border rounded">1. 招生倫理守則</span>
                <span class="px-2 py-0.5 bg-slate-100 border rounded">2. 公差假流程</span>
                <span class="px-2 py-0.5 bg-slate-100 border rounded">3. 交通明細表.docx</span>
                <span class="px-2 py-0.5 bg-slate-100 border rounded">4. 活動成果範本.docx</span>
                <span class="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 font-bold">5. 本次正式公文.pdf</span>
              </div>
            </div>
            <div class="md:col-span-7 bg-white p-3.5 rounded-lg border-2 border-orange-400 shadow-sm">
              <div class="flex items-center justify-between border-b pb-2 mb-2">
                <span class="font-bold text-slate-900">📧 Gmail 實體草稿預覽（一次攤開全部細節供審閱）</span>
                <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Draft 已建立・等待確認寄出</span>
              </div>
              <div class="space-y-1.5 text-[11px] text-slate-700">
                <div><strong>From 實際寄件帳號：</strong><span class="font-mono-code text-blue-700">nutcqqnice@gmail.com</span></div>
                <div><strong>To 已報名人員 (3位)：</strong>QQnice &lt;...&gt;, QQ2 &lt;...&gt;, QQ3 &lt;...&gt; <span class="text-slate-400">(同封 To 彼此可見)</span></div>
                <div class="p-2 bg-slate-50 rounded border space-y-1">
                  <div class="font-bold text-slate-800">📌 信中三大明確指引：</div>
                  <div>① <strong>活動前：</strong>請依附檔正式公文辦理公差假。</div>
                  <div>② <strong>活動後（電子檔）：</strong>請直接回覆本封信，夾帶填妥的《活動成果.docx》。</div>
                  <div>③ <strong>活動後（紙本）：</strong><span class="text-rose-700 font-bold">交通證明與假單請列印簽名送回承辦辦公室</span>（免傳電子檔）。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 8,
      code: "Step 08",
      id: "collecteventresults",
      name: "CollectEventResults",
      persona: "成果捕手（回信查收與歸檔偵探）",
      avatar: "🕵️‍♂️",
      color: "teal",
      tagline: "自動翻找原信串與新回信，排除簽名圖與空白範本，還能聰明識破「甲代寄、乙撰寫」的代寄關係！",
      whatYouGet: [
        "自動下載老師回傳的成果附件至 `活動成果/`，以「姓名_用途_郵件ID_序號」標準命名，絕不因同名互相覆蓋",
        "智慧比對「寄件 Email vs. Word 內文作者署名 vs. 報名名單」，遇到代寄自動詢問歸屬",
        "貼心幫你擬好給該位老師的「紙本繳交提醒信（交通證明與假單）」，讓你自由選擇寄或不寄"
      ],
      executionSteps: [
        "【前置關鍵：學校信箱已轉寄至 Gmail】：因為前置作業已將學校信箱設定自動轉寄到 Gmail，不論老師是直接回覆 Gmail 行前通知信串（Thread），或另外寄回你的學校信箱，AI 都能在 Gmail 完整搜尋並交代檢查範圍。",
        "【過濾雜訊與辨識作者】：自動排除原寄出的空白範本、引述附件與簽名檔小圖；打開附件內文核對作者與報名名單。",
        "【經典代寄偵測（甲寄乙寫）】：例如寄件信箱是 `QQ2`，但 Word 成果檔案裡面寫作者是 `QQ3`！AI 會先安全保存原檔並詢問你；等你確認是「QQ2 代 QQ3 寄送」後，將成果正確歸檔給 `QQ3`，絕不盲目算在寄件人頭上！",
        "【雜湊防重與可選紙本提醒】：保存雜湊值（Hash），重跑時自動略過已收過的同一份附件；並為已交電子成果的老師準備「紙本交通證明與假單繳交提醒草稿」，由你決定是否寄出。"
      ],
      guardrails: {
        aiDoes: "搜尋 Gmail 回信（含學校信箱轉寄來信）、過濾無關圖片與空白範本、比對文件內作者與寄件人、防覆蓋歸檔、準備紙本提醒信草稿。",
        humanDoes: "確認前置作業已完成「學校信箱轉寄 Gmail」、當寄件人與文件內作者不同時裁定歸屬（如甲代乙寄）、決定是否寄出紙本提醒信。",
        neverDo: "交通證明與假單本來就是交紙本，絕不會把它們列為「電子缺件」；沒有你的要求，也絕不會自己排程亂發催交成果信！"
      },
      prompts: [
        {
          label: "🕵️‍♂️ 查收最新活動成果回信",
          text: "現在請查收這場活動的成果回信（CollectEventResults），保留已收檔案並告訴我有誰交了、有沒有代寄需確認的情況。"
        },
        {
          label: "🤝 確認代寄歸屬（例如 QQ2 代寄 QQ3 的成果）",
          text: "確認這份檔案是 QQ3 寫的、由 QQ2 代寄，請將成果歸屬給 QQ3，並準備給 QQ3 的紙本繳交提醒草稿讓我審閱。"
        }
      ],
      diagramHtml: `
        <div class="bg-teal-50 p-5 rounded-xl border border-teal-200">
          <div class="text-xs font-bold text-teal-900 mb-3">🕵️‍♂️ 學校信箱轉寄 Gmail ➔ 智慧代寄辨識 ＆ 三軌分離追蹤機制</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-white p-3.5 rounded-lg border border-teal-200 shadow-sm">
              <div class="font-bold text-teal-800 mb-1.5">1. 信箱打撈与雜訊過濾</div>
              <ul class="space-y-1 text-[11px] text-slate-600">
                <li>📬 <strong>前置轉寄生效：</strong>學校信箱來信自動轉入 Gmail</li>
                <li>🔎 查原通知信串 (Thread) ＋ 另開新信</li>
                <li>🚫 自動踢除：原空白範本、簽名檔圖示</li>
                <li>🔒 防覆蓋命名：<span class="font-mono-code text-[10px] text-teal-700">QQ3_活動成果_msg8f2_01.docx</span></li>
              </ul>
            </div>
            <div class="bg-amber-50 p-3.5 rounded-lg border-2 border-amber-400 shadow-sm">
              <div class="font-bold text-amber-900 mb-1.5">2. 💡 經典情境：甲代乙寄偵測！</div>
              <div class="text-[11px] text-slate-700 space-y-1">
                <div>• 信件寄件人：<strong class="text-blue-700">QQ2</strong></div>
                <div>• Word 內文填寫人：<strong class="text-purple-700">QQ3</strong></div>
                <div class="p-1.5 bg-white rounded border border-amber-300 text-amber-900 font-medium mt-1">
                  🤖 AI 提問：「請問是 QQ2 代 QQ3 寄送嗎？」<br/>
                  👉 確認後正確記在 <strong>QQ3</strong> 名下！
                </div>
              </div>
            </div>
            <div class="bg-white p-3.5 rounded-lg border border-teal-200 shadow-sm">
              <div class="font-bold text-teal-800 mb-1.5">3. 三件事嚴格分開、不混為一談</div>
              <div class="space-y-1.5 text-[11px]">
                <div class="p-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">① 電子成果已收到（觸發可選紙本提醒）</div>
                <div class="p-1.5 bg-blue-50 border border-blue-200 rounded text-blue-900">② 內容審核是否通過（承辦人把關）</div>
                <div class="p-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700">③ 紙本假單/交通證明收訖（辦公室收件）</div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      stepIndex: 9,
      code: "Step 09",
      id: "create-report",
      name: "Create Report",
      persona: "策展設計師（私人成果網站建築師）",
      avatar: "🏆",
      color: "sky",
      tagline: "從 Word/PDF 結構精準配對活動照片與圖說，打造深藍科技質感「私人成果網站」，保護個資不外洩！",
      whatYouGet: [
        "自動產出深藍/科技藍配橘色點綴的響應式《成果網站/》（手機單欄、電腦多欄卡片設計）",
        "發布至私人 `chatgpt.site`，預設僅自己可見（`owner-private`），且絕不把原始名冊、老師電話與 Email 公開到網頁上",
        "即使只有少數老師先交成果（如 1/3 份），也能先做「期中展示版」，日後新成果寄來再原站無縫更新！"
      ],
      executionSteps: [
        "【確認來源與變更比對】：檢查已核對歸屬的成果檔案。若已有成果站，先比對文件雜湊值（Hash）；有新增或修改才更新同一 Site ID，沒變更絕不無意義重發。",
        "【結構化圖文配對】：從 Word／PDF 內部結構精準核對「哪張活動照片配哪段文字說明」，絕不只靠圖片檔名亂猜順序，也不會把活動現場照誤當成老師個人肖像照！",
        "【嚴格個資保護】：網站首頁呈現活動名稱、時間、地點與各人員成果卡片；自動剔除原始名冊、聯絡電話、Email 與整封信件內容。",
        "【期中展示與誠實交接】：若目前僅 1 人繳交，可先產出成果網站供長官預覽，但會在《成果網站紀錄.json》與戰情表誠實保留「尚有 2 人未繳」的待辦狀態，不宣稱全案結案！"
      ],
      guardrails: {
        aiDoes: "解析成果 Word/PDF 圖文結構、生成深藍質感響應式網頁、比對雜湊更新同一 Site ID、回寫《成果網站紀錄.json》。",
        humanDoes: "確認開始製作或更新成果網站、決定是否將成果網站分享給長官檢視、完成最終行政結案。",
        neverDo: "若還沒有任何可用成果，絕不編造假照片或假活動故事；少數人先交時絕不謊稱全員繳齊；絕不把老師私人電話與 Email 放上成果網站！"
      },
      prompts: [
        {
          label: "🏆 使用目前已確認的成果建立/更新私人成果網站",
          text: "請使用目前已確認歸屬的活動成果，幫我建立私人成果網站（Create Report），並保留未繳人員的待辦追蹤。"
        },
        {
          label: "🔄 新成果寄達後，更新原成果網站與戰情表",
          text: "有新成果收回並確認了，請更新原有的成果網站（同一 Site ID），並將進度回寫至戰情表。"
        }
      ],
      diagramHtml: `
        <div class="bg-slate-900 text-white p-5 rounded-xl border border-sky-500/40 shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏆</span>
              <div>
                <div class="font-bold text-sky-300 text-sm">Create Report 私人成果展示網站預覽</div>
                <div class="text-xs text-slate-400">深藍＋活力橘點綴 ｜ 響應式卡片 ｜ 🔒 預設私人（隱藏電話/Email 個資）</div>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-orange-500/20 text-orange-300 border border-orange-400/40 rounded-full text-xs font-bold">支援期中先行展示 (1/3 份可先建站)</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="md:col-span-2 bg-slate-800 p-3.5 rounded-lg border border-slate-700">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-white">🎓 1151219 高雄高商大學博覽會・活動成果紀實</span>
                <span class="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded">結構化圖文核對 ✓</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div class="bg-slate-900/90 p-2.5 rounded border border-slate-700">
                  <div class="h-16 bg-gradient-to-r from-sky-900 to-blue-900 rounded mb-2 flex items-center justify-center text-sky-200 text-[11px]">
                    📸 [現場攤位互動照片 01]
                  </div>
                  <div class="font-bold text-orange-300 text-[11px]">企業管理系・QQ3 老師成果</div>
                  <div class="text-[10px] text-slate-300 mt-0.5">從 Word 結構精準對應之活動照片與攤位諮詢說明（已自動隱去個人電話與 Email）。</div>
                </div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-dashed border-slate-700 flex flex-col items-center justify-center text-center text-slate-400">
                  <div class="text-lg mb-1">⏳</div>
                  <div class="text-[11px] font-medium text-slate-300">待收成果保留區 (2 位待補)</div>
                  <div class="text-[10px] mt-0.5">日後新回信到達 ➔ 比對雜湊原站更新</div>
                </div>
              </div>
            </div>
            <div class="bg-slate-800 p-3.5 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div>
                <div class="font-bold text-emerald-300 mb-1.5">🛡️ 成果站 4 大保證</div>
                <ul class="space-y-1.5 text-[11px] text-slate-300">
                  <li>✔ <strong>不看檔名亂猜：</strong>依文件結構配對圖片與說明</li>
                  <li>✔ <strong>不洩漏個資：</strong>絕不公開名冊、電話、Email</li>
                  <li>✔ <strong>不重複建站：</strong>雜湊有變才更新同一 Site ID</li>
                  <li>✔ <strong>不假造結案：</strong>誠實保留未繳名單供交接</li>
                </ul>
              </div>
              <div class="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[11px] text-emerald-200 text-center">
                戰情表檢核 #7：成果網站已完成 ✅
              </div>
            </div>
          </div>
        </div>
      `
    }
  ],

  // --------------------------------------------------------------------------
  // 6. 高雄高商 5 回合實戰劇場 (對應手冊第十六節：一次不是全部跑完)
  // --------------------------------------------------------------------------
  theaterRounds: [
    {
      round: 1,
      title: "第一回合：收到高雄高商邀請函",
      subtitle: "建檔 ＋ 立刻開啟本機戰情表（約 3 分鐘）",
      skillsUsed: ["ActivityAgent", "01 InitActivity", "02 CreateSite (A模式)"],
      userSays: "「這是高雄高商邀請，請啟動招生工作流。」（貼上 115/12/19 08:30-12:30 邀請文字，報名截止為 11/5）",
      aiActions: [
        "整理已知活動資訊，提供既有承辦人資料讓你一鍵點選「沿用」",
        "發現截止時刻與預計人數未載明，集中向你詢問確認後標記為「待定」（絕不自己亂編時刻）",
        "建立唯一資料夾 `1151219高雄高商/` 與代號 `EVT-20261219-001`",
        "隨即啟動 CreateSite (A 模式)，產出本機戰情表草稿"
      ],
      stopState: "🛑 此時停留點：已可查看本機戰情表與待辦清單，尚未公開網站、尚無報名統計（誠實顯示尚未建立）。"
    },
    {
      round: 2,
      title: "第二回合：開放全校報名＆寄出招募信",
      subtitle: "建表單 ＋ 戰情表首次上線 ＋ ePortal 雙重確認寄信",
      skillsUsed: ["03 CreateGoogleForm", "02 CreateSite (B模式)", "04 SendGroupMail"],
      userSays: "「表單與 Sheet 確認使用目前帳號建立。」「這份群組信草稿正確，請填入 ePortal。」「確認提交目前展示的草稿。」",
      aiActions: [
        "在 Google 表單完成單位下拉、五職稱下拉、Email 收集與自動回條，檢查完畢後發布並連結回覆 Sheet",
        "將「表單短網址＋Sheet 連結」補入原戰情表，首次發布至私人 `chatgpt.site`（B 模式）",
        "自動擬妥招募信，先展示本機草稿與預設兩群組（公務帳號教學單位、專任教師）",
        "獲第 1 次確認後填入 ePortal 組織樹；獲第 2 次確認後才按下提交！"
      ],
      stopState: "🛑 此時停留點：查證 ePortal 寄發結果並「等待老師實際報名」，絕不會在這時候偷跑空名單公文或行前通知！"
    },
    {
      round: 3,
      title: "第三回合：報名名單逐漸到齊＆製作公文草稿",
      subtitle: "下載真實 XLSX ＋ 戰情表母表對照 ＋ 產出上簽 Word 草稿",
      skillsUsed: ["05 UpdateNews", "02 CreateSite (C模式)", "06 CreateNormal"],
      userSays: "「請更新最新報名，並依目前版本先製作上簽公文草稿。」",
      aiActions: [
        "從雲端匯出最新 `報名資料最新.xlsx` 並記錄 SHA-256 指紋，回報共有 3 筆回覆",
        "更新原戰情表（C 模式）：對照全校教學單位母表，並發現 3 筆姓名為 `QQnice`、`QQ2`、`QQ3` 等示範/暱稱，保留原文並特別提醒「正式姓名待人工核對」",
        "依公文範本與目前名單產出《高雄高商大學博覽會上簽公文草稿.docx》，標記待核對姓名"
      ],
      stopState: "🛑 此時停留點：Word 草稿交付承辦人辦理校內簽核；在名單核對完成且實際送簽前，嚴格守住戰情表「公文已上簽」勾選！"
    },
    {
      round: 4,
      title: "第四回合：正式公文奉核＆寄發 Gmail 行前通知",
      subtitle: "內文查驗 PDF ＋ 盤點附件 ＋ 建立 Gmail 草稿審閱寄出",
      skillsUsed: ["07 SendEventMail"],
      userSays: "「正式公文 PDF 已放進活動資料夾，請核對並準備行前通知。」「確認依這份完整草稿寄出。」",
      aiActions: [
        "重新掃描並親自打開 `1231324165高雄高商大學博覽會上簽公文.pdf` 內文，核對活動日期與請假依據無誤",
        "盤點 `必要附件/`，在 Gmail 建立真正未寄出的草稿",
        "一次完整攤開展示：實際寄件帳號、3 位有效收件者姓名與 Email、完整主旨正文（交代電子成果回信＆紙本假單/交通證明送辦公室）、實際附件清單",
        "獲承辦人明確確認後，執行寄出一次！"
      ],
      stopState: "🛑 此時停留點：等待 12/19 活動舉行及老師回傳成果，絕不會因為行前通知寄出了就標示活動完成！"
    },
    {
      round: 5,
      title: "第五回合：成果陸續收回＆打造私人成果網站",
      subtitle: "識破代寄關係 ＋ 紙本提醒 ＋ 產出深藍質感私人成果展",
      skillsUsed: ["08 CollectEventResults", "09 Create Report", "02 CreateSite (更新進度)"],
      userSays: "「現在查收這場活動的成果。」「確認是 QQ2 代寄 QQ3 的成果，請先製作成果網站。」",
      aiActions: [
        "查收信箱發現 `QQ2` 寄來的 Word 成果檔內文署名是 `QQ3`，主動詢問歸屬",
        "獲確認代寄後，將成果正確歸給 `QQ3` 並保存在 `活動成果/`，同時準備給 `QQ3` 的紙本繳交提醒草稿供選寄",
        "即便目前僅收到 1 份有效成果，立即依結構配對照片與說明，產出深藍質感私人《成果網站》（隱藏電話與 Email 個資）",
        "誠實記錄「已收 1/3 份、尚有 2 人待補」，日後新成果寄達再原站更新！"
      ],
      stopState: "🎉 完美閉環：戰情表與私人成果網站隨時可授權分享給長官檢視，未完事項清楚記錄，換人換電腦都能無縫接手！"
    }
  ],

  // --------------------------------------------------------------------------
  // 7. 所有等待點速查表 (對應手冊第十四節：16 種等待情境)
  // --------------------------------------------------------------------------
  waitStates: [
    { category: "初期建檔與工具", wait: "活動／執行範圍未選", canDo: "讀取既有活動清單供選擇", cannotDo: "自行建檔或偷動外部服務", prompt: "「接續高雄高商，依流程引導」" },
    { category: "初期建檔與工具", wait: "承辦人、日期或必要資訊缺少", canDo: "整理來源文字與缺項問題清單", cannotDo: "假填資料、擅自宣告完成初始化", prompt: "「這些是承辦資料，日期確認無誤」" },
    { category: "初期建檔與工具", wait: "登入／工具權限不足", canDo: "保留已完成本機檔案與瀏覽器頁面", cannotDo: "謊稱工具已連接成功", prompt: "「已登入完成，請繼續原頁面操作」" },
    { category: "表單與群組信", wait: "只有表單、缺回覆 Sheet", canDo: "保留已建表單與本機戰情表", cannotDo: "首次發布戰情表、假造 Sheet 網址", prompt: "「請完成原表單的回覆試算表連結」" },
    { category: "表單與群組信", wait: "群組信草稿待內容確認（第1鎖）", canDo: "保存本機草稿並展示全文供審閱", cannotDo: "偷跑進 ePortal 填寫", prompt: "「內容正確，請前往 ePortal 填寫」" },
    { category: "表單與群組信", wait: "ePortal 填妥待提交確認（第2鎖）", canDo: "保留填妥頁面及本機草稿", cannotDo: "擅自按提交、送審或偷改用 Gmail 寄", prompt: "「確認提交目前展示的這份草稿」" },
    { category: "表單與群組信", wait: "ePortal 已提交，寄發結果未知", canDo: "記錄 submitted 狀態與畫面證據", cannotDo: "直接勾選寄發成功、或盲目重送", prompt: "「請檢查原申請的實際寄發結果」" },
    { category: "報名與公文簽核", wait: "等待老師報名中", canDo: "保留表單開放，按需手動更新快照", cannotDo: "把目前暫時名單當作最終定案", prompt: "「請幫我更新一次最新報名資料」" },
    { category: "報名與公文簽核", wait: "報名名單待承辦人人工核對", canDo: "在戰情表顯示差異與待核對列（如暱稱）", cannotDo: "新增勾選「活動公文已上簽」", prompt: "「我已核對這版有效報名名單」" },
    { category: "報名與公文簽核", wait: "公文只有 Word 草稿／尚未奉核", canDo: "產出可編輯 Word 與準備通知架構", cannotDo: "宣稱已核准、偽造主管印章", prompt: "「正式公文 PDF 已放入資料夾，請核對」" },
    { category: "行前通知與成果", wait: "行前通知缺附件或待草稿確認", canDo: "保存真正 Gmail 草稿並列出清單", cannotDo: "漏附檔案寄出、或偷塞新收件者", prompt: "「確認依這份完整 Gmail 草稿寄送」" },
    { category: "行前通知與成果", wait: "活動尚未舉行／尚無成果回信", canDo: "保存通知紀錄與《工作進度.json》", cannotDo: "宣稱活動完成、虛構假照片假成果", prompt: "「活動結束了，現在請查收活動成果」" },
    { category: "行前通知與成果", wait: "成果作者與寄件者不一致（代寄）", canDo: "安全保存原檔並標記待確認歸屬", cannotDo: "亂猜歸屬、寄錯紙本提醒信對象", prompt: "「確認 QQ3 是作者，由 QQ2 代寄」" },
    { category: "行前通知與成果", wait: "部分成果已建站，新成果未到", canDo: "維持既有私人成果網站與待補紀錄", cannotDo: "無意義重複建站、或自動狂發催交信", prompt: "「有新回信到了，請再檢查並更新原站」" },
    { category: "行前通知與成果", wait: "網站更新或 Excel 下載偶發失敗", canDo: "完整保留上一次成功版本與快照", cannotDo: "把舊名單清空歸零、或另建重複新網站", prompt: "「網路與權限恢復了，請更新同一資源」" }
  ],

  // --------------------------------------------------------------------------
  // 8. 「拆解我的行政工作」互動工作坊預設範本 (賦能同仁舉一反三)
  // --------------------------------------------------------------------------
  deconstructTemplates: {
    workshop: {
      name: "📚 辦理校內教師研習／工作坊",
      goal: "從收到講師資訊開始，完成研習建檔、報名表、全校宣傳、簽到單/公文、行前提醒與研習成果集。",
      initData: "研習主題、講師姓名、日期時間、教室地點、人數上限、承辦人分機",
      checklists: [
        "1. 是否已寄發全校研習公告信",
        "2. 確認報名名單與餐盒/講義數量核對",
        "3. 講師聘函／活動經費公文已上簽",
        "4. 是否已寄發研習行前通知（含講義與教室地圖）",
        "5. 是否收回課後回饋與研習照片",
        "6. 是否完成私人研習成果展示網站"
      ],
      waitPoints: [
        "ePortal 公告信草稿審閱與提交前確認",
        "報名截止後，人工核對正取/備取名單",
        "行前通知 Gmail 草稿與附件確認後才寄出"
      ],
      outputs: "研習戰情表網站 (chatgpt.site)、Google 報名表與 Sheet、簽到表/公文草稿.docx、私人研習成果網"
    },
    evaluation: {
      name: "📋 系所評鑑／高教深耕佐證資料催繳",
      goal: "向各教學單位收集年度評鑑或計畫佐證資料，透過戰情表即時掌握「哪幾系已交、哪幾系未交」，並整理成私人成果站供長官檢閱。",
      initData: "計畫/評鑑名稱、繳交截止日、需收集之表格範本、全校應繳交單位母表、承辦窗口",
      checklists: [
        "1. 是否已寄發資料繳交說明與範本通知信",
        "2. 各單位聯絡窗口確認回條核對",
        "3. 第一階段收件盤點與格式人工核對",
        "4. 提醒信／補充說明草稿確認與寄送",
        "5. 佐證附件歸檔與代寄作者確認",
        "6. 彙整完成私人評鑑成果檢視網站"
      ],
      waitPoints: [
        "通知信與空白範本附件清單確認後才寄出",
        "收回檔案若寄件人與填表單位不符，由承辦人確認歸屬",
        "長官檢閱前，由承辦人核對缺件名單（不自動亂發催繳信）"
      ],
      outputs: "各系繳交進度戰情表 (含母表對照)、標準化命名之佐證資料夾、長官檢視專用私人成果網站"
    },
    committee: {
      name: "🏛️ 校級委員會會議通知、出席調查與紀錄歸檔",
      goal: "針對校內外委員進行會議時間調查/報名、寄送開會通知公文與議程附件、收回提案或委託書並整理會議專區。",
      initData: "會議名稱、時間地點、委員名單母表、提案單範本、開會通知公文號",
      checklists: [
        "1. 出席意願與膳食調查表單發布",
        "2. 委員出席名單人工核對（確認是否達法定人數）",
        "3. 開會通知單公文已奉核",
        "4. 會議資料與公文附件行前寄送完成",
        "5. 委託書或會後確認單回收歸檔",
        "6. 會議成果與決議追蹤私密專頁更新"
      ],
      waitPoints: [
        "委員稱謂（校內外委員、職稱）與收件信箱人工核對",
        "正式開會通知公文 PDF 內文核對無誤後才附檔寄出",
        "代理出席／代寄委託書之身分人工確認"
      ],
      outputs: "出席率即時戰情表、開會通知公文草稿.docx、含完整議程附件之 Gmail 紀錄、私人會議成果頁"
    },
    custom: {
      name: "✨ 自訂我的日常行政任務（自由拆解）",
      goal: "請在下方輸入您手邊常做的行政業務，系統將自動為您套用「戰情表先行 ＋ 步步檢核 ＋ 預設私密」架構！",
      initData: "任務名稱、截止日期、對象單位母表、承辦人署名資訊",
      checklists: [
        "1. 任務建檔與本機戰情表啟動",
        "2. 資料收集表單與試算表雙連結發布",
        "3. 對象名單與回覆內容人工核對",
        "4. 相關簽呈或公文草稿完成並送簽",
        "5. 正式通知信與必要附件審閱寄出",
        "6. 成果附件回收與私人展示網站更新"
      ],
      waitPoints: [
        "所有對外信件必定先看完整草稿、確認收件人後才寄出",
        "名單與正式公文必定經過承辦人實質核對，不以草稿冒充核准"
      ],
      outputs: "專屬任務戰情表 (預設僅自己可見，可分享長官)、工作進度.json、標準化歸檔資料夾"
    }
  }
};
