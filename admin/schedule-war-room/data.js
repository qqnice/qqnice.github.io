// ============================================================================
// 課表戰情表專案初衷與技能包互動示範網站 - 核心資料集 (data.js)
// 涵蓋：60秒導覽腳本、理念延伸對照、自然語言輸入與5步管線、54位主管(58職務)仿真戰情表、
//       三層信任查核與快取重用、6大處室實戰咒語、9大產品原則與7題驗收自測
// ============================================================================

const TOUR_STEPS = [
  {
    step: 1,
    targetId: "sec-origin",
    badge: "理念延伸",
    title: "從「辦活動寄信」延伸到「跨單位會議排程」",
    subtitle: "原本我們用 AI 小幫手協助辦活動、發信與追進度；現在我們把同樣的『戰情表先行』理念，延伸來解決全校最耗時的跨單位課表比對！",
    action: () => {}
  },
  {
    step: 2,
    targetId: "sec-pain",
    badge: "痛點放大器",
    title: "54 位主管的課表，人工逐張查要花多少時間？",
    subtitle: "當開會人數從 5 人擴大到 54 位主管，找名單、逐一查系統、排除 Office Hour 與交叉比對，往往耗掉整整半天。試著拉動滑桿感受看看！",
    action: () => {
      if (typeof updatePainCalculator === "function") {
        const slider = document.getElementById("pain-people-slider");
        if (slider) {
          slider.value = 54;
          updatePainCalculator();
        }
      }
    }
  },
  {
    step: 3,
    targetId: "sec-input-flow",
    badge: "技能包運作",
    title: "輸入姓名、職銜或單位，5 步嚴謹管線自動就位",
    subtitle: "不用自己先翻名錄！輸入『全校一級主管與各系主任』，技能包先從官方名錄列出姓名請你確認，自動合併一人多職，再查官方課表。",
    action: () => {
      if (typeof selectInputExample === "function") {
        selectInputExample(3);
      }
    }
  },
  {
    step: 4,
    targetId: "sec-warroom-demo",
    badge: "戰情表實測",
    title: "跨院整組選取、一人多職去重、Office Hour 自動排除",
    subtitle: "這就是實際產出的進階戰情表！點選『一級主管』加『院長』或跨學院組合，一眼找出綠色共同空堂，還能點開個人課表查驗官方來源。",
    action: () => {
      if (typeof applyDemoPreset === "function") {
        applyDemoPreset("cross_college");
      }
    }
  },
  {
    step: 5,
    targetId: "sec-trust-cache",
    badge: "信任與快取",
    title: "AI 系統核對 ＋ 同仁人工確認，下一次開會 0 秒重用！",
    subtitle: "每筆課表保留官方網址與原始節次。同仁在 Excel 確認『相同』後，同一學期再次排會議直接讀取地端快取，不必每次重頭查！",
    action: () => {
      if (typeof switchCacheCompareMode === "function") {
        switchCacheCompareMode("next");
      }
    }
  },
  {
    step: 6,
    targetId: "sec-how-to-use",
    badge: "立即上手",
    title: "複製一句對話咒語，把重複查表的時間省下來喝杯咖啡",
    subtitle: "不管你是秘書室、人事室、教務處、主計室還是各學院，點選你的情境、複製指令貼給 AI，就能輕鬆產出專屬的課表戰情表！",
    action: () => {
      if (typeof selectScenarioPrompt === "function") {
        selectScenarioPrompt(0);
      }
    }
  }
];

// ============================================================================
// 區塊 0 & 1：從辦活動到排會議的理念延伸 ＋ 8 大具體協助對照表
// ============================================================================
const WORK_VALUE_COMPARISONS = [
  {
    icon: "📋",
    oldWork: "不確定現任主管或委員會名單是誰，到處翻舊檔案",
    newHelp: "從學校官方公開名錄建立職務清單，先讓承辦人確認精確姓名",
    value: "降低名單錯誤、舊名單誤用與漏人風險"
  },
  {
    icon: "🔎",
    oldWork: "必須一位一位進入課表系統輸入姓名查詢",
    newHelp: "依確認後的名單批次查詢 `aisap.nutc.edu.tw` 並保存來源網址",
    value: "省去數十次重複開網頁與切換分頁的操作"
  },
  {
    icon: "✍️",
    oldWork: "人工抄寫星期、節次、課程、班級與教室，眼花撩亂",
    newHelp: "自動正規化為結構化 JSON 與 Excel 核對表（原樣保留 `0000` 與空白教室）",
    value: "徹底消除人工抄錯、漏抄與格式不一致"
  },
  {
    icon: "☕",
    oldWork: "把老師的 Office Hour 誤當成正式上課，以為沒空開會",
    newHelp: "原始快取保留 `Office Hour` 供查證，但自動標記 `excluded=true` 不算衝突",
    value: "還原真正可開會的共同空堂，不錯失好時段"
  },
  {
    icon: "👥",
    oldWork: "一人身兼多職（如副校長兼院長），被當成兩個人重複算衝突",
    newHelp: "職務列（`rosterPositions`）全部保留，但唯一人員（`people`）與課表只算一次",
    value: "跨群組篩選都找得到人，且衝突人數絕不重複放大"
  },
  {
    icon: "📊",
    oldWork: "五十幾張個人課表攤在桌上，很難逐日逐節交叉比對",
    newHelp: "產生整週熱力摘要、單日逐節對照、群組全選與跨院累加戰情表",
    value: "10 秒內找出『全部無課』或『最少人衝堂』的候選時段"
  },
  {
    icon: "🛡️",
    oldWork: "擔心 AI 亂猜或抓錯學期，不敢直接拿去簽辦開會時間",
    newHelp: "設計『系統完整核對 ＋ 同仁人工核對（未核對／相同／有差異）』雙層把關",
    value: "每筆資料可點擊回官方網頁複核，可追溯、敢信任"
  },
  {
    icon: "♻️",
    oldWork: "每次開不同會議、或換一位承辦人，就要全部重新查一次",
    newHelp: "人工確認『相同』後存入地端 Excel 快取，同學期後續會議優先重用",
    value: "一次核對、全學期共享，不浪費同仁時間與網路算力"
  }
];

// ============================================================================
// 區塊 2：4 種自然語言輸入示例 ＆ 技能包 5 步運作管線
// ============================================================================
const INPUT_EXAMPLES = [
  {
    id: "ex-names",
    tag: "示例 1：直接輸入具體姓名",
    label: "👤 指定 3 位教師姓名",
    meetingTitle: "跨領域AI課程教材研商小組會議",
    userInput: "請幫我建立「跨領域AI課程教材研商小組會議」的課表戰情表，學期 115-1，參與人員：陳夏蓮、林○宏、王○樺。",
    parsedSummary: "已直接識別 3 位指定姓名 ➔ 準備進入官方課表系統驗證唯一教師編號（teacherId）",
    rosterCount: 3,
    uniqueCount: 3,
    dedupNote: "無兼職重疊（3 職務 = 3 唯一人員）",
    sampleRoster: [
      { group: "指定名單", unit: "中護健康學院", title: "教授", name: "陳夏蓮", teacherId: "300", note: "唯一編號驗證" },
      { group: "指定名單", unit: "資訊工程系", title: "特聘教授", name: "林○宏", teacherId: "305", note: "唯一編號驗證" },
      { group: "指定名單", unit: "商業設計系", title: "副教授", name: "王○樺", teacherId: "321", note: "唯一編號驗證" }
    ]
  },
  {
    id: "ex-deans",
    tag: "示例 2：輸入職銜群組",
    label: "🎓 六個學院院長",
    meetingTitle: "115學年度第1學期 院長聯席協調會議",
    userInput: "我要排 115-1「院長聯席協調會議」，參與對象是全校六個學院院長，請先幫我列出名單確認。",
    parsedSummary: "從官方主管名錄解析「院長」群組 ➔ 列出 6 個學院院長職務與現任姓名，等待承辦人確認後查表",
    rosterCount: 6,
    uniqueCount: 6,
    dedupNote: "6 位現任院長皆為獨立教師編號",
    sampleRoster: [
      { group: "院長", unit: "商學院", title: "院長", name: "張○雅", teacherId: "312", note: "官方名錄解析" },
      { group: "院長", unit: "中護健康學院", title: "院長", name: "陳夏蓮", teacherId: "300", note: "官方名錄解析" },
      { group: "院長", unit: "設計學院", title: "院長", name: "王○樺", teacherId: "321", note: "官方名錄解析" },
      { group: "院長", unit: "語文學院", title: "院長", name: "劉○珊", teacherId: "331", note: "官方名錄解析" },
      { group: "院長", unit: "資訊與流通學院", title: "院長", name: "周○成", teacherId: "308", note: "官方名錄解析" },
      { group: "院長", unit: "智慧產業學院", title: "院長", name: "鄭○明", teacherId: "340", note: "官方名錄解析" }
    ]
  },
  {
    id: "ex-college",
    tag: "示例 3：輸入組織單位",
    label: "🏢 商學院所有主任",
    meetingTitle: "商學院 115-1 院務暨系所主管會議",
    userInput: "請建立「商學院 115-1 院務暨系所主管會議」課表戰情表，對象是商學院院長與商學院所有系所主任。",
    parsedSummary: "從官方名錄撈取商學院 11 個主管職務 ➔ 發現院長兼任國貿系代理主任，自動合併為 10 位唯一人員！",
    rosterCount: 11,
    uniqueCount: 10,
    dedupNote: "✨ 自動偵測：張○雅同時擔任「商學院院長」與「國貿系代理主任」，保留雙職務但只查一次課表！",
    sampleRoster: [
      { group: "商學院", unit: "商學院", title: "院長", name: "張○雅", teacherId: "312", note: "兼國貿系代理主任 (合併計1人)" },
      { group: "商學院", unit: "國際貿易與經營系", title: "代理主任", name: "張○雅", teacherId: "312", note: "與 teacherId=312 共用課表" },
      { group: "商學院", unit: "會計資訊系", title: "系主任", name: "蔡○玲", teacherId: "313", note: "快取已確認相同" },
      { group: "商學院", unit: "保險金融管理系", title: "系主任", name: "許○瑋", teacherId: "314", note: "快取已確認相同" },
      { group: "商學院", unit: "企業管理系", title: "系主任", name: "郭○豪", teacherId: "315", note: "快取已確認相同" },
      { group: "商學院", unit: "財政稅務系", title: "系主任", name: "謝○芳", teacherId: "316", note: "快取已確認相同" }
    ]
  },
  {
    id: "ex-all54",
    tag: "示例 4：大型全校會議（54位主管案例）",
    label: "🏛️ 全校一級主管＋院長＋各系主任 (54人)",
    meetingTitle: "115-1 全校行政暨教學一二級主管擴大會報",
    userInput: "我要排 115-1「全校行政暨教學一二級主管擴大會報」，包含全校一級主管、各學院院長及所有系所中心主任，請依學院與職務分組。",
    parsedSummary: "解析全校 58 個主管職務 ➔ 辨識出 4 位主管身兼二職 ➔ 確立 54 位唯一人員，跨 8 大群組建立進階戰情表！",
    rosterCount: 58,
    uniqueCount: 54,
    dedupNote: "✨ 4 位主管身兼二職（如：陳夏蓮「副校長／中護健康學院院長」、林○宏「研發長／資工系主任」等），58 個職務精準去重為 54 份課表！",
    sampleRoster: [
      { group: "一級主管 / 院長", unit: "校長室 / 中護健康學院", title: "副校長／中護健康學院院長", name: "陳夏蓮", teacherId: "300", note: "跨組兼職・只計 1 人" },
      { group: "一級主管 / 通識與中心", unit: "教務處 / 教發中心", title: "教務長／教學發展中心主任", name: "黃○哲", teacherId: "318", note: "跨組兼職・只計 1 人" },
      { group: "一級主管 / 資訊與流通學院", unit: "研發處 / 資訊工程系", title: "研發長／資工系主任", name: "林○宏", teacherId: "305", note: "跨組兼職・只計 1 人" },
      { group: "院長 / 商學院", unit: "商學院 / 國貿系", title: "商學院院長／國貿系代理主任", name: "張○雅", teacherId: "312", note: "同院兼職・只計 1 人" },
      { group: "其餘 50 位主管", unit: "各處室、六院系所與中心", title: "處長、院長、系主任、中心主任", name: "共 50 位唯一教師", teacherId: "301~354", note: "48 人重用快取 + 2 人重查" }
    ]
  }
];

const PIPELINE_STEPS = [
  {
    stepNum: 1,
    codeName: "Step 1 · Roster Resolution",
    title: "解析職銜與官方名錄（職務與人員分離）",
    summary: "把使用者輸入的『群組、單位或職銜』對照官方公開名錄，建立 `rosterPositions`（一個職務一列）。",
    whatAiDoes: [
      "讀取會議名稱（未指定時預設『進階課表比對戰情表』）與指定學期（如 `115-1`）。",
      "若輸入為『全校一級主管』或『商學院所有主任』，先從官方公開名錄建立職務清單並解析出精確姓名。",
      "嚴格區分三個層次：`rosterPositions`（職務列）、`people`（唯一教師身分）、`rawEntries`（該教師唯一課表）。"
    ],
    humanGuard: "絕不直接憑 AI 印象猜測『現任主任是誰』，也不在未確認姓名前就去亂抓課表。"
  },
  {
    stepNum: 2,
    codeName: "Step 2 · Name Confirmation & Deduplication",
    title: "真人確認名單 ＆ 一人多職自動合併（🛑 關鍵把關點）",
    summary: "列出『單位—職稱—姓名—群組』請承辦人先確認；一人身兼多職時保留全部職務與群組，但課表只算一份！",
    whatAiDoes: [
      "將解析出的名單呈現在對話中，等待承辦人點頭確認。",
      "以官方查詢取得的 `teacherId` 作為唯一鍵：若同一老師身兼『副校長』與『中護健康學院院長』，自動合併職務為 `副校長／中護健康學院院長`，並同時歸入兩個群組。",
      "若遇到同名異人（不同 `teacherId`）或名錄與課表系統姓名矛盾，立即標記為『受阻（Blocked）』並請使用者裁示。"
    ],
    humanGuard: "承辦人確認姓名與範圍無誤後，才啟動課表查詢，避免同名誤查或漏列委員。"
  },
  {
    stepNum: 3,
    codeName: "Step 3 · Cache Check & Official Extraction",
    title: "檢查同學期快取 vs. 官方課表系統精準擷取",
    summary: "先查地端 Excel 快取！已確認『相同』者直接重用；缺人或未確認者才進入 `aisap.nutc.edu.tw` 逐人查詢。",
    whatAiDoes: [
      "檢查 `nutc-<semester>-advanced-schedule-cache.xlsx`：若 `systemVerified=true` 且人工核對為 `相同 (matched)`，0 秒直接重用！",
      "需要重查時，透過瀏覽器開啟 `https://aisap.nutc.edu.tw/public/day/by_teacher.aspx`，核對學期標籤（如 `115年(上) 教師課表`）。",
      "逐人輸入精確姓名觸發官方查詢，記錄網址中的 `?teacher=<id>`、星期一至日、1–13 節、以及每格內的 `.class_name`、`.course_name`、`.room`（支援同格 `<hr>` 多筆課程）。"
    ],
    humanGuard: "禁止猜測教師編號或用搜尋引擎摘要代替官方課表；學期不符時立即停止批次作業。"
  },
  {
    stepNum: 4,
    codeName: "Step 4 · Normalization & Office Hour Exclusion",
    title: "資料正規化、保留 `0000` 教室 ＆ 自動排除 Office Hour",
    summary: "把原始課表與有效會議衝突分開：Office Hour 留在快取供查核，但一律排除於忙碌與衝突計算之外！",
    whatAiDoes: [
      "辨識班級欄為 `Office Hour` 的格子：在原始資料標記 `kind: 'office_hour'` 與 `excluded: true`，避免把老師留校輔導時間誤判為不能開會。",
      "原汁原味保留教室欄位：空白教室存為空字串，`0000` 教室必須原樣保留為 `'0000'`，絕不擅自改成『未定』。",
      "執行完整性檢查：確認姓名、學期、編號、顯示節次與非空格筆數 100% 吻合後，才將 `systemVerified` 設為 `true`（空白頁不得直接當成無課）。"
    ],
    humanGuard: "確保原始資料一字不改可供對照，同時讓會議排程只計算真正的固定授課衝突。"
  },
  {
    stepNum: 5,
    codeName: "Step 5 · Artifact Packaging & Validation",
    title: "打包 4 大標準交付物 ＆ 支援 Excel 人工複核回寫",
    summary: "一鍵產出地端 Excel 核對快取檔、JSON 快照與自包含互動戰情表網站，並通過 `validate` 驗收。",
    whatAiDoes: [
      "執行 `advanced_schedule_artifacts.py package` 產出：① `nutc-<semester>-advanced-schedule-cache.xlsx`、② `source-snapshot-advanced.json`、③ `dashboard/index.html`、④ `dashboard/schedule.json`。",
      "同仁在 Excel 下拉選單將個人課表標記為『相同』或修訂後，可執行 `build --review-workbook reviewed.xlsx` 立即刷新戰情表。",
      "預設保存在地端；若承辦人要求分享，必先詢問：『① GPT 網站 還是 ② GitHub Pages？』確認後才發布。"
    ],
    humanGuard: "不會把『網站打得開』當成『資料已核對』；所有未人工確認或標記有差異的人員，在戰情表上一目了然。"
  }
];

// ============================================================================
// 區塊 3：54 位唯一主管（58 個職務）的進階課表戰情表仿真資料集
// ============================================================================
const WARROOM_GROUPS = [
  { id: "ALL", name: "全部人員", badge: "唯一去重", desc: "全校 58 個主管職務，自動合併兼職為 54 位唯一人員" },
  { id: "一級主管", name: "一級主管", badge: "行政核心", desc: "校長室、教務、學務、總務、研發、國際、主計、人事等一級主管" },
  { id: "院長", name: "院長", badge: "六院院長", desc: "商學、中護健康、設計、語文、資訊與流通、智慧產業等學院院長" },
  { id: "商學院", name: "商學院", badge: "院系主管", desc: "商學院院長及國貿、會資、保金、企管、財稅、財金、應統等系主任" },
  { id: "資訊與流通學院", name: "資訊與流通學院", badge: "院系主管", desc: "資流學院院長及資管、資工、流通、人工智慧等系所主任" },
  { id: "中護健康學院", name: "中護健康學院", badge: "院系主管", desc: "中護健康學院院長及護理、美容、老服、休健等系主任" },
  { id: "設計學院", name: "設計學院", badge: "院系主管", desc: "設計學院院長及商設、室設、多媒、創商等系主任" },
  { id: "語文學院", name: "語文學院", badge: "院系主管", desc: "語文學院院長及應英、應日、應中等系主任" },
  { id: "通識與中心", name: "通識與中心", badge: "教學中心", desc: "通識教育中心、語言中心、體育室、教學發展中心等主管" }
];

const PERIOD_META = [
  { period: 1, label: "第 1 節", time: "08:10-09:00" },
  { period: 2, label: "第 2 節", time: "09:10-10:00" },
  { period: 3, label: "第 3 節", time: "10:10-11:00" },
  { period: 4, label: "第 4 節", time: "11:10-12:00" },
  { period: 5, label: "第 5 節", time: "13:25-14:15" },
  { period: 6, label: "第 6 節", time: "14:20-15:10" },
  { period: 7, label: "第 7 節", time: "15:20-16:10" },
  { period: 8, label: "第 8 節", time: "16:15-17:05" }
];

const DAY_META = [
  { day: 1, short: "週一", full: "星期一" },
  { day: 2, short: "週二", full: "星期二" },
  { day: 3, short: "週三", full: "星期三" },
  { day: 4, short: "週四", full: "星期四" },
  { day: 5, short: "週五", full: "星期五" }
];

// 建立 54 位唯一人員（其中前 4 位為身兼二職的重點示範人物，共 58 個職務）
function buildWarRoomPeople() {
  const featured = [
    {
      id: "t300",
      teacherId: "300",
      name: "陳夏蓮",
      isMultiRole: true,
      roles: ["副校長（校長室）", "中護健康學院院長（中護健康學院）"],
      roleDisplay: "副校長／中護健康學院院長",
      groups: ["一級主管", "院長", "中護健康學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 人事室林組員核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=300",
      entries: [
        { day: 1, period: 3, course: "高齡健康照護專題", className: "護研一甲", room: "H402", kind: "course", excluded: false },
        { day: 1, period: 4, course: "高齡健康照護專題", className: "護研一甲", room: "H402", kind: "course", excluded: false },
        { day: 2, period: 5, course: "", className: "Office Hour", room: "H501", kind: "office_hour", excluded: true },
        { day: 2, period: 6, course: "", className: "Office Hour", room: "H501", kind: "office_hour", excluded: true },
        { day: 4, period: 2, course: "護理行政與領導", className: "四護四甲", room: "0000", kind: "course", excluded: false }
      ]
    },
    {
      id: "t305",
      teacherId: "305",
      name: "林○宏",
      isMultiRole: true,
      roles: ["研發長（研究發展處）", "資工系主任（資訊工程系）"],
      roleDisplay: "研發長／資工系主任",
      groups: ["一級主管", "資訊與流通學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 秘書室陳小姐核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=305",
      entries: [
        { day: 1, period: 1, course: "深度學習實務", className: "資工三甲", room: "資訊702", kind: "course", excluded: false },
        { day: 1, period: 2, course: "深度學習實務", className: "資工三甲", room: "資訊702", kind: "course", excluded: false },
        { day: 3, period: 2, course: "人工智慧導論", className: "資工碩一", room: "資訊605", kind: "course", excluded: false },
        { day: 3, period: 3, course: "人工智慧導論", className: "資工碩一", room: "資訊605", kind: "course", excluded: false },
        { day: 3, period: 5, course: "", className: "Office Hour", room: "資訊710", kind: "office_hour", excluded: true },
        { day: 5, period: 6, course: "書報討論", className: "資工碩一／資工碩二", room: "", kind: "course", excluded: false }
      ]
    },
    {
      id: "t312",
      teacherId: "312",
      name: "張○雅",
      isMultiRole: true,
      roles: ["商學院院長（商學院）", "國貿系代理主任（國際貿易與經營系）"],
      roleDisplay: "商學院院長／國貿系代理主任",
      groups: ["院長", "商學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 商學院院辦核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=312",
      entries: [
        { day: 2, period: 2, course: "國際企業管理", className: "四國貿三甲", room: "中商2604", kind: "course", excluded: false },
        { day: 2, period: 3, course: "國際企業管理", className: "四國貿三甲", room: "中商2604", kind: "course", excluded: false },
        { day: 4, period: 6, course: "跨國經營策略研討", className: "企研碩一", room: "中商2708", kind: "course", excluded: false },
        { day: 4, period: 7, course: "跨國經營策略研討", className: "企研碩一", room: "中商2708", kind: "course", excluded: false },
        { day: 5, period: 3, course: "", className: "Office Hour", room: "中商2501", kind: "office_hour", excluded: true }
      ]
    },
    {
      id: "t318",
      teacherId: "318",
      name: "黃○哲",
      isMultiRole: true,
      roles: ["教務長（教務處）", "教學發展中心主任（教發中心）"],
      roleDisplay: "教務長／教學發展中心主任",
      groups: ["一級主管", "通識與中心"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 教務處核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=318",
      entries: [
        { day: 1, period: 6, course: "數位轉型與創新教學", className: "通識選修", room: "0000", kind: "course", excluded: false },
        { day: 1, period: 7, course: "數位轉型與創新教學", className: "通識選修", room: "0000", kind: "course", excluded: false },
        { day: 3, period: 5, course: "", className: "Office Hour", room: "行政302", kind: "office_hour", excluded: true },
        { day: 5, period: 1, course: "研究方法", className: "資管碩一", room: "資訊504", kind: "course", excluded: false },
        { day: 5, period: 2, course: "研究方法", className: "資管碩一", room: "資訊504", kind: "course", excluded: false }
      ]
    },
    {
      id: "t308",
      teacherId: "308",
      name: "周○成",
      isMultiRole: false,
      roles: ["資訊與流通學院院長"],
      roleDisplay: "資訊與流通學院院長",
      groups: ["院長", "資訊與流通學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 資流院辦核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=308",
      entries: [
        { day: 2, period: 1, course: "智慧流通系統專論", className: "流通碩一", room: "資訊401", kind: "course", excluded: false },
        { day: 2, period: 2, course: "智慧流通系統專論", className: "流通碩一", room: "資訊401", kind: "course", excluded: false },
        { day: 4, period: 3, course: "雲端架構實務", className: "四資管四甲", room: "資訊502", kind: "course", excluded: false },
        { day: 4, period: 4, course: "雲端架構實務", className: "四資管四甲", room: "資訊502", kind: "course", excluded: false }
      ]
    },
    {
      id: "t309",
      teacherId: "309",
      name: "吳○修",
      isMultiRole: false,
      roles: ["資訊管理系主任"],
      roleDisplay: "資訊管理系主任",
      groups: ["資訊與流通學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 資管系辦核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=309",
      entries: [
        { day: 1, period: 3, course: "生成式AI行政應用", className: "四資管三甲", room: "資訊508", kind: "course", excluded: false },
        { day: 1, period: 4, course: "生成式AI行政應用", className: "四資管三甲", room: "資訊508", kind: "course", excluded: false },
        { day: 3, period: 6, course: "", className: "Office Hour", room: "資訊512", kind: "office_hour", excluded: true },
        { day: 5, period: 3, course: "企業資源規劃", className: "四資管二甲", room: "資訊506", kind: "course", excluded: false },
        { day: 5, period: 4, course: "企業資源規劃", className: "四資管二甲", room: "資訊506", kind: "course", excluded: false }
      ]
    },
    {
      id: "t321",
      teacherId: "321",
      name: "王○樺",
      isMultiRole: false,
      roles: ["設計學院院長"],
      roleDisplay: "設計學院院長",
      groups: ["院長", "設計學院"],
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 設計院辦核對相同",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=321",
      entries: [
        { day: 1, period: 5, course: "視覺傳達設計研究", className: "商設碩一", room: "昌明4203", kind: "course", excluded: false },
        { day: 1, period: 6, course: "視覺傳達設計研究", className: "商設碩一", room: "昌明4203", kind: "course", excluded: false },
        { day: 3, period: 1, course: "品牌識別企劃", className: "四商設三甲", room: "昌明4301", kind: "course", excluded: false },
        { day: 3, period: 2, course: "品牌識別企劃", className: "四商設三甲", room: "昌明4301", kind: "course", excluded: false }
      ]
    },
    {
      id: "t331",
      teacherId: "331",
      name: "劉○珊",
      isMultiRole: false,
      roles: ["語文學院院長"],
      roleDisplay: "語文學院院長",
      groups: ["院長", "語文學院"],
      systemVerified: true,
      humanReview: "unconfirmed",
      reviewerNote: "系統已完整核對，待語文學院院辦人工勾選",
      sourceUrl: "https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=331",
      entries: [
        { day: 2, period: 3, course: "商務英語溝通", className: "四應英三甲", room: "中商2405", kind: "course", excluded: false },
        { day: 2, period: 4, course: "商務英語溝通", className: "四應英三甲", room: "中商2405", kind: "course", excluded: false },
        { day: 4, period: 1, course: "跨文化語用學", className: "應英碩一", room: "中商2409", kind: "course", excluded: false }
      ]
    }
  ];

  // 其餘 46 位主管模板（補足至 54 位唯一人員，對應 58 個職務）
  const extraSpecs = [
    // 一級主管 (再加 9 位 -> 共 12 位)
    { id: "t301", teacherId: "301", name: "鄭○源", roleDisplay: "校長（校長室）", groups: ["一級主管"], busySlots: [[1,1],[1,2]] },
    { id: "t302", teacherId: "302", name: "蔡○賢", roleDisplay: "副校長（校長室）", groups: ["一級主管"], busySlots: [[2,2],[2,3],[4,6]] },
    { id: "t303", teacherId: "303", name: "廖○君", roleDisplay: "主任秘書（秘書室）", groups: ["一級主管"], busySlots: [[1,5],[3,3],[3,4]] },
    { id: "t304", teacherId: "304", name: "何○廷", roleDisplay: "學務長（學務處）", groups: ["一級主管"], busySlots: [[2,6],[2,7],[5,2]] },
    { id: "t306", teacherId: "306", name: "楊○慧", roleDisplay: "總務長（總務處）", groups: ["一級主管"], busySlots: [[1,3],[4,1],[4,2]] },
    { id: "t307", teacherId: "307", name: "宋○達", roleDisplay: "國際長（國際事務處）", groups: ["一級主管"], busySlots: [[3,1],[3,2],[5,5]] },
    { id: "t310", teacherId: "310", name: "潘○梅", roleDisplay: "人事室主任（人事室）", groups: ["一級主管"], busySlots: [] },
    { id: "t311", teacherId: "311", name: "羅○文", roleDisplay: "主計室主任（主計室）", groups: ["一級主管"], busySlots: [] },
    { id: "t340", teacherId: "340", name: "鄭○明", roleDisplay: "智慧產業學院院長", groups: ["院長", "一級主管"], busySlots: [[1,7],[4,3],[4,4]] },

    // 商學院 (再加 9 位 -> 含張○雅共 10 位唯一人員、11 個職務)
    { id: "t313", teacherId: "313", name: "蔡○玲", roleDisplay: "會計資訊系主任", groups: ["商學院"], busySlots: [[1,1],[1,2],[4,2]] },
    { id: "t314", teacherId: "314", name: "許○瑋", roleDisplay: "保險金融管理系主任", groups: ["商學院"], busySlots: [[2,3],[2,4],[5,1]] },
    { id: "t315", teacherId: "315", name: "郭○豪", roleDisplay: "企業管理系主任", groups: ["商學院"], busySlots: [[1,5],[1,6],[3,2]] },
    { id: "t316", teacherId: "316", name: "謝○芳", roleDisplay: "財政稅務系主任", groups: ["商學院"], busySlots: [[2,6],[2,7],[4,7]] },
    { id: "t317", teacherId: "317", name: "洪○凱", roleDisplay: "財務金融系主任", groups: ["商學院"], busySlots: [[1,3],[1,4],[5,6]] },
    { id: "t319", teacherId: "319", name: "曾○琪", roleDisplay: "應用統計系主任", groups: ["商學院"], busySlots: [[3,1],[3,2],[4,3]] },
    { id: "t320", teacherId: "320", name: "蕭○偉", roleDisplay: "休閒事業經營系主任", groups: ["商學院"], busySlots: [[2,1],[2,2],[5,3],[5,4]] },
    { id: "t322", teacherId: "322", name: "賴○婷", roleDisplay: "國際商務碩士班主任", groups: ["商學院"], busySlots: [[1,7],[4,6]] },
    { id: "t323", teacherId: "323", name: "江○宇", roleDisplay: "商學博士班執行長", groups: ["商學院"], busySlots: [[3,3],[3,4]] },

    // 資訊與流通學院 (再加 6 位 -> 含林○宏、周○成、吳○修共 9 位)
    { id: "t324", teacherId: "324", name: "呂○翰", roleDisplay: "流通管理系主任", groups: ["資訊與流通學院"], busySlots: [[1,2],[2,5],[2,6]] },
    { id: "t325", teacherId: "325", name: "詹○雯", roleDisplay: "人工智慧應用工程系主任", groups: ["資訊與流通學院"], busySlots: [[3,1],[3,2],[5,2]] },
    { id: "t326", teacherId: "326", name: "葉○霖", roleDisplay: "智慧生產工程系主任", groups: ["資訊與流通學院"], busySlots: [[2,3],[4,1],[4,2]] },
    { id: "t327", teacherId: "327", name: "柯○良", roleDisplay: "資訊安全碩士學程主任", groups: ["資訊與流通學院"], busySlots: [[1,5],[1,6],[4,7]] },
    { id: "t328", teacherId: "328", name: "蘇○潔", roleDisplay: "大數據研究中心主任", groups: ["資訊與流通學院"], busySlots: [[3,3],[5,5],[5,6]] },
    { id: "t329", teacherId: "329", name: "盧○安", roleDisplay: "物聯網實驗室主任", groups: ["資訊與流通學院"], busySlots: [[2,7],[4,4]] },

    // 中護健康學院 (再加 6 位 -> 含陳夏蓮共 7 位)
    { id: "t330", teacherId: "330", name: "戴○茹", roleDisplay: "護理系主任", groups: ["中護健康學院"], busySlots: [[1,1],[1,2],[3,3]] },
    { id: "t332", teacherId: "332", name: "范○蓉", roleDisplay: "美容系主任", groups: ["中護健康學院"], busySlots: [[2,4],[4,1],[4,2]] },
    { id: "t333", teacherId: "333", name: "游○翔", roleDisplay: "老人服務事業管理系主任", groups: ["中護健康學院"], busySlots: [[1,6],[5,3],[5,4]] },
    { id: "t334", teacherId: "334", name: "彭○珍", roleDisplay: "休閒與健康促進系主任", groups: ["中護健康學院"], busySlots: [[2,1],[2,2],[4,6]] },
    { id: "t335", teacherId: "335", name: "溫○庭", roleDisplay: "高齡健康照護碩士班主任", groups: ["中護健康學院"], busySlots: [[3,2],[5,1]] },
    { id: "t336", teacherId: "336", name: "莊○怡", roleDisplay: "臨床技能中心主任", groups: ["中護健康學院"], busySlots: [[1,4],[4,3]] },

    // 設計學院 (再加 6 位 -> 含王○樺共 7 位)
    { id: "t337", teacherId: "337", name: "姚○銘", roleDisplay: "商業設計系主任", groups: ["設計學院"], busySlots: [[2,2],[2,3],[5,5]] },
    { id: "t338", teacherId: "338", name: "馮○萱", roleDisplay: "室內設計系主任", groups: ["設計學院"], busySlots: [[1,3],[1,4],[4,2]] },
    { id: "t339", teacherId: "339", name: "魏○傑", roleDisplay: "多媒體設計系主任", groups: ["設計學院"], busySlots: [[3,3],[3,4],[5,2]] },
    { id: "t341", teacherId: "341", name: "邱○慈", roleDisplay: "創意商品設計系主任", groups: ["設計學院"], busySlots: [[2,6],[4,7]] },
    { id: "t342", teacherId: "342", name: "石○原", roleDisplay: "設計創新研發中心主任", groups: ["設計學院"], busySlots: [[1,1],[3,1]] },
    { id: "t343", teacherId: "343", name: "紀○嵐", roleDisplay: "文化創意碩士學程主任", groups: ["設計學院"], busySlots: [[2,5],[5,6]] },

    // 語文學院 (再加 5 位 -> 含劉○珊共 6 位)
    { id: "t344", teacherId: "344", name: "簡○倫", roleDisplay: "應用英語系主任", groups: ["語文學院"], busySlots: [[1,2],[3,4],[4,6]] },
    { id: "t345", teacherId: "345", name: "高○美", roleDisplay: "應用日語系主任", groups: ["語文學院"], busySlots: [[2,1],[2,2],[5,3]] },
    { id: "t346", teacherId: "346", name: "傅○德", roleDisplay: "應用中文系主任", groups: ["語文學院"], busySlots: [[1,5],[4,3],[4,4]] },
    { id: "t347", teacherId: "347", name: "康○寧", roleDisplay: "雙語教學推動中心主任", groups: ["語文學院"], busySlots: [[3,2],[5,1]] },
    { id: "t348", teacherId: "348", name: "尤○欣", roleDisplay: "國際語文實習中心主任", groups: ["語文學院"], busySlots: [[2,7],[4,2]] },

    // 通識與中心 (再加 6 位 -> 含黃○哲共 7 位)
    { id: "t349", teacherId: "349", name: "韓○平", roleDisplay: "通識教育中心主任", groups: ["通識與中心"], busySlots: [[1,3],[3,1],[3,2]] },
    { id: "t350", teacherId: "350", name: "梁○華", roleDisplay: "語言中心主任", groups: ["通識與中心"], busySlots: [[2,4],[4,1]] },
    { id: "t351", teacherId: "351", name: "卓○志", roleDisplay: "體育室主任", groups: ["通識與中心"], busySlots: [[1,7],[5,4],[5,5]] },
    { id: "t352", teacherId: "352", name: "童○恩", roleDisplay: "職涯及諮商輔導中心主任", groups: ["通識與中心"], busySlots: [[2,5],[4,6]] },
    { id: "t353", teacherId: "353", name: "馬○瑞", roleDisplay: "圖書資訊處處長", groups: ["一級主管", "通識與中心"], busySlots: [[3,3],[5,2]] },
    { id: "t354", teacherId: "354", name: "巫○潔", roleDisplay: "推廣部主任", groups: ["一級主管", "通識與中心"], busySlots: [[1,6],[4,4]] }
  ];

  // 注意：刻意讓全體 54 位主管在以下時段完全「0 人正式授課」（共同無課黃金時段）：
  // - 週三 第 5 節 (13:25-14:15) -> 雖然陳夏蓮沒課、林○宏與黃○哲是 Office Hour (自動排除！)，所以全校 54 人皆無固定授課！
  // - 週三 第 6 節 (14:20-15:10) -> 吳○修是 Office Hour (自動排除！)，全校 54 人皆無固定授課！
  // - 週四 第 5 節 (13:25-14:15) -> 全校 54 人皆無固定授課！
  // - 週二 第 8 節、週三 第 7-8 節、週四 第 8 節、週五 第 7-8 節 -> 全校 54 人皆無固定授課！

  const sampleCourseNames = [
    ["專題討論", "碩一甲", "中商2502"],
    ["管理學導論", "四企二甲", "中商2301"],
    ["研究方法與論文寫作", "碩一乙", "資訊601"],
    ["跨域創新實務", "大三跨院班", "昌明3204"],
    ["專業倫理與法規", "大四甲", "0000"],
    ["數位科技應用", "大二乙", "資訊405"]
  ];

  const generated = extraSpecs.map((spec, idx) => {
    const entries = spec.busySlots.map((slot, sIdx) => {
      const [d, p] = slot;
      const meta = sampleCourseNames[(idx + sIdx) % sampleCourseNames.length];
      return {
        day: d,
        period: p,
        course: meta[0],
        className: meta[1],
        room: meta[2],
        kind: "course",
        excluded: false
      };
    });
    // 為部分老師加上週三第 5 節或第 6 節的 Office Hour，展示自動排除價值
    if (idx % 11 === 0) {
      entries.push({
        day: 3,
        period: 5,
        course: "",
        className: "Office Hour",
        room: "研究室",
        kind: "office_hour",
        excluded: true
      });
    }
    return {
      id: spec.id,
      teacherId: spec.teacherId,
      name: spec.name,
      isMultiRole: false,
      roles: [spec.roleDisplay],
      roleDisplay: spec.roleDisplay,
      groups: spec.groups,
      systemVerified: true,
      humanReview: "matched",
      reviewerNote: "2026/10/21 地端快取已確認相同",
      sourceUrl: `https://aisap.nutc.edu.tw/public/day/by_teacher.aspx?teacher=${spec.teacherId}`,
      entries
    };
  });

  return [...featured, ...generated];
}

const WARROOM_PEOPLE = buildWarRoomPeople();

// ============================================================================
// 區塊 5：6 大處室／學院實戰情境與一鍵複製咒語
// ============================================================================
const SCENARIO_PROMPTS = [
  {
    id: "scen-exec",
    unitBadge: "秘書室 ／ 人事室",
    title: "全校一級主管 ＋ 六院院長大型會議",
    icon: "🏛️",
    painPoint: "行政會議、校務會議會前協調或人評會，動輒邀集 15～50 幾位主管，身兼多職者常被重複算衝突。",
    promptText: "請使用 nutc-advanced-schedule-war-room 技能包，幫我建立「115-1 行政暨院長聯席會議」的進階課表戰情表。參與範圍包含：全校一級主管與六個學院院長。請先從官方名錄列出職務與現任姓名供我確認，並檢查是否有 115-1 已確認的地端快取可以重用。",
    aiSteps: [
      "從官方名錄列出「一級主管」與「院長」職務清單，標出兼職者（如副校長兼院長）請你確認姓名。",
      "優先讀取 `nutc-115-1-advanced-schedule-cache.xlsx` 中已標記「相同」的課表，只補查缺漏人員。",
      "排除 Office Hour 後，產出可依「一級主管」「院長」切換與跨組比較的戰情表。"
    ],
    deliverables: ["nutc-115-1-advanced-schedule-cache.xlsx", "dashboard/index.html (地端戰情表)", "共同無固定授課時段摘要"]
  },
  {
    id: "scen-academic",
    unitBadge: "教務處 ／ 教學發展中心",
    title: "全校院長 ＋ 各系所中心主任教學會議",
    icon: "🎓",
    painPoint: "全校系主任多達 30～40 人，跨 6 個學院與通識中心，人工根本無法找出衝堂最少的時段。",
    promptText: "請用 nutc-advanced-schedule-war-room 建立「115-1 全校課程與教學主管聯席會議」課表戰情表，對象為六院院長、各系所主任及通識教育中心、語言中心、體育室主任。請依學院與中心分組，先讓我確認名單後再產出戰情表。",
    aiSteps: [
      "依序建立院長、商學院、資流學院、中護健康學院、設計學院、語文學院與中心群組。",
      "自動將院長兼代理系主任、處長兼系主任去重為唯一 `teacherId`。",
      "產出整週熱力圖，一眼看出週三下午或週四中午哪些節次 0 人上課或僅 1~2 人有課。"
    ],
    deliverables: ["依學院分組之進階課表戰情表", "各節次衝堂人數與系主任明細", "Excel 人工核對工作簿"]
  },
  {
    id: "scen-college",
    unitBadge: "各學院辦公室 ／ 系辦",
    title: "院務會議 ／ 跨系教師課程與評鑑委員會",
    icon: "💼",
    painPoint: "院辦召集各系主任與教師代表開院務會議，常因老師把 Office Hour 填在課表上而誤以為整週都沒空。",
    promptText: "請幫我用 nutc-advanced-schedule-war-room 建立「115-1 商學院院務暨跨院合作會議」課表戰情表。參與對象為：商學院所有系所主任，另外加上資訊與流通學院的吳○修主任、林○宏主任。請先列出名單讓我確認。",
    aiSteps: [
      "支援「整個組織單位（商學院所有主任）＋ 個別指定姓名（跨院教師）」混合輸入。",
      "自動識別並排除 `Office Hour`，同時保留原始課表與 `0000` 教室紀錄供院辦助教複核。",
      "在戰情表可先單看「商學院」，再一鍵加入「跨院代表」看聯集空堂。"
    ],
    deliverables: ["商學院＋跨院代表混合戰情表", "個人完整週課表檢視（含官方連結）", "Office Hour 排除清單"]
  },
  {
    id: "scen-budget",
    unitBadge: "主計室 ／ 研發處 ／ 國際處",
    title: "預算決算協調 ／ 跨處室專案審查委員會",
    icon: "💰",
    painPoint: "臨時需要召集特定處室主管與幾位專家委員，每次名單組合都不同，重查課表非常浪費時間。",
    promptText: "我要排 115-1「校務發展經費暨專案審查委員會」，參與人員有：陳夏蓮副校長、黃○哲教務長、林○宏研發長、宋○達國際長、羅○文主任，以及六個學院院長。請直接重用 115-1 已人工核對相同的快取建立戰情表！",
    aiSteps: [
      "比對同學期地端快取：發現名單內人員先前已核對為「相同」，免開瀏覽器重爬課表！",
      "數秒內直接重組出這場專案委員會專屬的戰情表與候選時段。",
      "若其中有 1 位新聘委員不在快取內，只針對該名委員執行官方查詢。"
    ],
    deliverables: ["秒級重建之委員會專屬戰情表", "快取重用與新查人員狀態報告"]
  },
  {
    id: "scen-review-rebuild",
    unitBadge: "學期初核對 ➔ 全學期吃老本",
    title: "將同仁人工複核後的 Excel 套回戰情表",
    icon: "♻️",
    painPoint: "同仁在 Excel 裡把核對完的老師改為「相同」或修正了備註，希望能立即同步回戰情表並供後續重用。",
    promptText: "我已經在 nutc-115-1-advanced-schedule-cache.xlsx 完成人工核對，把核對無誤的主管標記為「相同」了。請幫我保留原始進階快照，根據這份已核對的 Excel 重新建置並驗證戰情表！",
    aiSteps: [
      "執行 `advanced_schedule_artifacts.py build --input source-snapshot-advanced.json --review-workbook reviewed.xlsx`。",
      "執行 `validate` 檢查所有工作表、公式與狀態一致性。",
      "網站上的狀態卡全數升級為「🟢 同仁人工確認相同」，成為全處室這學期最可靠的快取資產。"
    ],
    deliverables: ["更新人工核對狀態後的戰情表網站", "可跨會議重複使用的黃金快取 Excel"]
  },
  {
    id: "scen-publish",
    unitBadge: "分享給長官或協辦同仁",
    title: "將地端確認無誤的戰情表發布上線",
    icon: "🌐",
    painPoint: "地端確認完畢後，想產生一個連結讓長官或協辦同仁直接在手機／電腦上看各時段衝堂明細。",
    promptText: "地端的課表戰情表我已經確認無誤了，現在請幫我發布上線，我要選擇發布到 GitHub Pages（或 GPT 網站），發布後請幫我用實際網址驗收群組篩選與跨組比較功能。",
    aiSteps: [
      "遵循安全發布規則：先向使用者確認要發布到「① GPT 網站」還是「② GitHub Pages」及目標位置。",
      "完成部署後，實際開啟線上網址驗收：群組人數、兼職去重、單人課表及跨組比較。",
      "回報正式網址、版本及驗收結果，方便承辦人直接轉傳連結給長官參考。"
    ],
    deliverables: ["線上可互動之課表戰情表網址", "上線後完整功能驗收報告"]
  }
];

// ============================================================================
// 區塊 6：9 大產品設計鐵律 ＆ 7 題行政同仁驗收自測問答
// ============================================================================
const PRODUCT_PRINCIPLES = [
  { num: "01", title: "先確認人，再查課表", desc: "職銜或單位必須先從官方名錄解析成精確姓名並由同仁確認，絕不直接盲猜。" },
  { num: "02", title: "只使用可追溯官方來源", desc: "唯一權威來源為學校公開課表系統，搜尋摘要或模型記憶絕不能代替官方查詢。" },
  { num: "03", title: "原始資料與有效衝突分開", desc: "Office Hour 保留於原始快取供查核，但一律排除於固定授課衝突之外；空白與 `0000` 教室原樣保留。" },
  { num: "04", title: "一人多職只計一次", desc: "職務列可以有多筆、群組可同時歸屬多個，但教師身分與課表只有一份，衝堂絕不重複放大。" },
  { num: "05", title: "AI 核對 ≠ 人工確認", desc: "系統完整核對（`systemVerified`）與同仁人工核對（`未核對／相同／有差異`）清楚分開呈現。" },
  { num: "06", title: "人工成果可以跨次累積", desc: "經人工確認為『相同』的同學期快取可直接重用，不讓同仁每次開會都重頭查一次。" },
  { num: "07", title: "共同空堂必須有嚴格前提", desc: "只有所有被選人員皆完成系統核對、且未被人工標記『有差異』、該節無正式課程時，才宣稱共同無課。" },
  { num: "08", title: "發布與否由使用者決定", desc: "預設保存在地端；需要分享時才由使用者選擇發布至 GPT 網站或 GitHub Pages。" },
  { num: "09", title: "網站可開 ≠ 資料已核對", desc: "頁面功能正常與課表內容可信度分開回報，逐人清楚標示重查、重用快取、待核或受阻。" }
];

const ACCEPTANCE_QUIZ = [
  {
    qNum: 1,
    question: "這套「課表戰情表」技能包主要在替行政同仁解決什麼問題？",
    shortHint: "想想看：排 50 人會議時最痛苦的是什麼？",
    answer: "把「自己翻名錄找人、逐張進系統查課表、手動抄寫、排除 Office Hour、拿著幾十張課表交叉比對」的繁瑣工作，轉化成一套可查證、可重複使用、可跨單位自由組合的會議排程工作流程，協助承辦人快速找出有依據的候選開會時段。"
  },
  {
    qNum: 2,
    question: "如果我手上只有「六個學院院長」或「商學院所有主任」這類職銜與單位，還沒有完整姓名，可以直接用嗎？",
    shortHint: "系統會直接亂猜還是怎麼做？",
    answer: "完全可以！你可以直接輸入職銜、組織單位或群組名稱。技能包會先根據官方公開名錄解析出「職務對照姓名清單」請你確認；等你確認姓名無誤後，才進入課表查詢，避免查錯人或漏人。"
  },
  {
    qNum: 3,
    question: "我要在哪裡看「誰在什麼時間有課」？如果我想查看某位主管的完整週課表呢？",
    shortHint: "戰情表提供哪三種檢視視角？",
    answer: "在戰情表主畫面的「整週摘要熱力圖」點擊任一節次，右側就會列出該時段所有有課人員、課程名稱與教室；切換到「單日逐節對照」可橫向比較所有人；點擊任一主管姓名或切換至「單人完整課表」，就能查看他週一到週日的完整課表與官方來源連結。"
  },
  {
    qNum: 4,
    question: "我可以「跨學院、跨處室」選人比較嗎？如果有一位主管同時是「副校長」又是「院長」，會被算成兩個人嗎？",
    shortHint: "一人多職在系統裡怎麼處理？",
    answer: "可以跨群組自由累加（例如點「一級主管」再點「商學院」與「資訊與流通學院」），亦可個別勾選或取消。同一人身兼多職時，兩個群組都找得到他，但系統以唯一 `teacherId` 去重，他的課表與衝堂永遠只計算一次！"
  },
  {
    qNum: 5,
    question: "我怎麼知道 AI 取得的課表是正確的、沒有漏抓或抓錯學期？",
    shortHint: "看看雙層查核機制與原始連結！",
    answer: "每一份課表都保留官方查詢網址（`?teacher=編號`）、官方學期標籤（如 `115年(上) 教師課表`）與擷取時間。只有姓名、學期、編號、所有節次與非空格筆數完全對上時，才會通過「系統完整核對」，且同仁可隨時點開官方連結一鍵比對。"
  },
  {
    qNum: 6,
    question: "同仁人工確認過一次之後，下一次同一個學期要排另一場會議時，還要全部重新查嗎？",
    shortHint: "Excel 快取裡的「相同」狀態有什麼用？",
    answer: "不用重新查！當同仁在 Excel 快取表將核對無誤的人員標記為「相同（matched）」後，同一學期再次製作任何新會議戰情表時，系統會直接 0 秒重用已確認的地端快取，只針對新加入或異動的人員查詢。"
  },
  {
    qNum: 7,
    question: "如果人工核對時發現某位老師的課表「有差異」，我應該怎麼處理？系統會怎麼反應？",
    shortHint: "還能不能把那個時段當成「已確認共同空堂」？",
    answer: "你可以在戰情表或 Excel 將該員標記為「有差異（different）」並填寫備註或修正內容。一旦標記為「有差異」，系統會立即取消該員相關時段的「已確認共同無課」綠燈資格（改標示為含待複核／有差異人員），並可在下一次更新時強制重查或套用人工修訂檔。"
  }
];
