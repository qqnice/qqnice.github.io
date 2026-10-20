const STORAGE_KEY = "pavet-execution-workbench-v1";

const defaultState = {
  readiness: [],
  audit: [],
  journal: [],
  aiUses: [],
  policyRead: false,
  stage: "writing",
  timeline: 0,
  process: "recording"
};

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...defaultState };
  }
}

let state = loadState();

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local state is optional */ }
}

const timeline = [
  {
    time: "開學前4–8週",
    title: "倫理與研究工具定稿",
    summary: "在任何資料蒐集開始前，確認本校倫理程序、同意內容、問卷與訪談大綱，以及資料保存方式。",
    tags: ["研究倫理", "版本控制", "資料治理"],
    items: [
      ["必要產出", "審查結果或備案、同意書、工具版本"],
      ["最低檢核", "錄音、逐字稿、AI處理、保存期限與退出方式已說明"],
      ["不可補寫", "不能在開始蒐集後才回頭補成資料使用同意"]
    ]
  },
  {
    time: "開學前1–2週",
    title: "預試設備與資料流程",
    summary: "用假資料完整走一次錄音、轉寫、說話者標記、匿名化與備份流程。",
    tags: ["預試", "假資料", "工具版本"],
    items: [
      ["必要產出", "預試紀錄、設備清單、工具與參數"],
      ["最低檢核", "至少完成一次完整團體訪談試跑"],
      ["風險提醒", "不得拿真實受訪者錄音作公開示範"]
    ]
  },
  {
    time: "第1週",
    title: "基線測量與同意說明",
    summary: "建立介入前的可比較基線，並確認同意份數與實際修課名單一致。",
    tags: ["基線", "同意", "對帳"],
    items: [
      ["必要產出", "前測資料、簽署與退出紀錄"],
      ["最低檢核", "未同意者的資料不進入研究資料集"],
      ["研究者角色", "說明參與與成績、師生關係的處理"]
    ]
  },
  {
    time: "第3–5週",
    title: "先行組介入與延宕測量",
    summary: "先行組接受PAVET，延遲組暫作比較；記錄每一次流程偏離及原因。",
    tags: ["延遲介入", "近遷移", "保留"],
    items: [
      ["必要產出", "分組、介入日誌、近遷移與延宕保留資料"],
      ["最低檢核", "實際教學流程與原計畫逐次對照"],
      ["語氣界線", "可說結果與預測一致，不等於隨機對照證明因果"]
    ]
  },
  {
    time: "第6–18週",
    title: "全班實施與形成性資料",
    summary: "全班進入介入，持續蒐集作業、日誌、錄音、AI使用及課堂異常事件。",
    tags: ["教學日誌", "形成性資料", "備份"],
    items: [
      ["必要產出", "每次上課紀錄、作業與歷程資料"],
      ["最低檢核", "課後24小時內記錄；每兩週異地備份"],
      ["AI界線", "AI可整理已存在紀錄，不可補寫未曾發生的內容"]
    ]
  },
  {
    time: "第16–18週",
    title: "後測、訪談與逐字稿",
    summary: "完成後測與訪談，保留原始音檔、轉寫版本與人工核對痕跡。",
    tags: ["後測", "訪談", "匿名化"],
    items: [
      ["必要產出", "後測、逐字稿、匿名化對照與核對紀錄"],
      ["最低檢核", "引用回到逐字稿原文，不引用AI摘要當受訪者原話"],
      ["待核", "抽樣核對比例屬講者建議，須依研究品質需求決定"]
    ]
  },
  {
    time: "結束後1個月",
    title: "編碼與第一次分析",
    summary: "固定編碼本與分析腳本；AI若參與，定位為第二編碼者或檢核者。",
    tags: ["編碼本", "分析腳本", "人工裁決"],
    items: [
      ["必要產出", "編碼本、分析程式、差異裁決紀錄"],
      ["最低檢核", "人工初編、AI獨立編碼、回原文裁決"],
      ["方法界線", "一致性統計須符合資料型態與設計，不可只追求漂亮數字"]
    ]
  },
  {
    time: "結束後2個月內",
    title: "辦理結案",
    summary: "依教育部作業要點與校內流程完成結案；契約或專案類別若有更嚴格條件，以其為準。",
    tags: ["行政節點", "成果報告", "經費"],
    items: [
      ["已查證", "教育部作業要點列有計畫期滿後2個月內結案"],
      ["仍須確認", "校內流程、契約與專案計畫是否另有義務"],
      ["一致性", "行政變更文件須與實際執行紀錄一致"]
    ]
  },
  {
    time: "結束後3個月內",
    title: "成果報告公開或申請延後",
    summary: "成果報告與期刊稿分流管理，並先確認公開報告是否影響目標刊的先前發表政策。",
    tags: ["成果公開", "智財", "先前發表"],
    items: [
      ["已查證", "成果報告原則上須在期限內公開；符合條件可申請延後"],
      ["最低檢核", "投稿前閱讀目標刊對公開報告、預印本與相似稿件的政策"],
      ["寫作分流", "成果報告重過程；期刊稿重定位與論證"]
    ]
  },
  {
    time: "結束後3–9個月",
    title: "期刊稿、交叉批判與投稿",
    summary: "依目標刊重寫稿件、核對引用、盤點AI用途，並保存投稿與修訂紀錄。",
    tags: ["選刊", "AI揭露", "修訂回覆"],
    items: [
      ["必要產出", "投稿包、AI使用紀錄、揭露聲明與轉投清單"],
      ["最低檢核", "第二模型取得原文、來源包與規則；人工回原始來源裁決"],
      ["投稿策略", "範圍不符可轉投；方法或論證問題應先修再投"]
    ]
  }
];

const auditGroups = [
  { title: "倫理與同意", items: [["ethics-procedure", "本校倫理程序已確認"], ["consent-scope", "同意書涵蓋錄音與AI處理"], ["withdrawal", "退出與不影響成績已說明"], ["deid", "去識別與對照表分離"]] },
  { title: "研究工具", items: [["construct", "先定義構念與操作定義"], ["expert", "完成專家內容審查"], ["pilot", "完成小樣本預試"], ["original-scale", "既有量表回原始來源核對"]] },
  { title: "執行紀錄", items: [["timestamp", "課後24小時內留時間戳"], ["deviation", "流程偏離與理由有記錄"], ["backup", "原始唯讀且定期異地備份"], ["ai-version", "AI工具、版本、提示與裁決有保存"]] },
  { title: "成果與投稿", items: [["report-paper", "成果報告與期刊稿分檔"], ["journal-policy", "目標刊各項政策已存檔"], ["citation-audit", "引用完成存在、書目、主張三層查核"], ["release-clean", "散布檔案已移除金鑰與個人路徑"]] }
];

const processContent = {
  recording: {
    steps: [
      ["同意", "確認每位受訪者簽署並理解錄音與AI處理"],
      ["試錄", "用假資料測試麥克風、分軌與完整流程"],
      ["轉寫", "保存原音檔、工具版本、參數與輸出"],
      ["核對", "人工抽查辨識、重疊說話與專有名詞"],
      ["引用", "回逐字稿原文與代碼，不引用AI摘要"]
    ],
    warning: "WhisperX等工具有技術與授權條件；國語、台語與中英夾雜的準確度須以自己的假資料試測，不能直接假設。"
  },
  coding: {
    steps: [
      ["定義", "先由研究者建立編碼本與例示"],
      ["人工初編", "形成第一版類別與邊界"],
      ["AI第二編", "固定模型與提示，獨立輸出編碼"],
      ["差異報告", "比較一致與分歧，不把一致當作真實"],
      ["人工裁決", "回到原文、來源與研究問題決定"]
    ],
    warning: "建議寫法是「以人工編碼為主，AI作為第二編碼者，差異由研究者回原文裁決」；不要寫成「由AI完成編碼」。"
  },
  causal: {
    steps: [
      ["設計", "辨識前後測、跨年或延遲介入的限制"],
      ["量測", "把時間點、工具與缺漏規則預先寫清楚"],
      ["分析", "呈現效果量、不確定性與個案軌跡"],
      ["三角檢證", "連結量化、作品、歷程與訪談資料"],
      ["誠實論述", "使用支持、相符與關聯，不過度因果化"]
    ],
    warning: "延遲介入能增加時間序列證據，但若不是隨機分派，仍不能寫成隨機對照試驗。"
  }
};

const journalCriteria = [
  ["scope", "主題與近兩年文章相符"],
  ["type", "接受教學實踐／實務研究稿件"],
  ["index", "收錄與評比已用最新官方名單核對"],
  ["cost", "審查時間、APC與開放取用已確認"],
  ["ai-policy", "AI政策原文已閱讀並存檔"],
  ["ethics-policy", "倫理與資料政策已確認"],
  ["prior-publication", "公開報告／預印本政策已確認"],
  ["format", "字數、格式與引用規格可配合"]
];

const manuscriptStages = [
  ["writing", "撰寫中", "先完成一個可內審的完整版本，避免無限局部修飾。"],
  ["internal", "內審", "列出三個最可能被質疑的範圍、方法與倫理問題。"],
  ["submitted", "已投稿", "保存投稿版本、日期、稿件編號與期刊政策快照。"],
  ["review", "審查中", "等待期刊流程；超過公告時間時依官網指示詢問。"],
  ["major", "大修", "建立逐條回覆表，先處理方法與新增分析，再修文字。"],
  ["minor", "小修", "逐項完成並核對頁碼，確認修訂稿與回覆表一致。"],
  ["rejected", "退稿", "先判斷範圍不符或品質問題，再決定轉投或先修稿。"],
  ["accepted", "接受", "核對校樣、授權、資料聲明與最終公開版本。"]
];

function renderTimeline() {
  const tabs = document.querySelector("#timeline-tabs");
  tabs.innerHTML = timeline.map((phase, index) => `
    <button class="timeline-tab" id="timeline-tab-${index}" type="button" role="tab"
      aria-selected="${state.timeline === index}" aria-controls="timeline-detail" data-index="${index}">
      <span>${phase.time}</span><b>${phase.title}</b>
    </button>`).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.timeline = Number(button.dataset.index);
    saveState();
    renderTimeline();
    document.querySelector("#timeline-detail").focus({ preventScroll: true });
  }));
  const phase = timeline[state.timeline] || timeline[0];
  document.querySelector("#timeline-detail").innerHTML = `
    <div class="phase-copy">
      <span class="status verified">階段 ${String(state.timeline + 1).padStart(2, "0")}</span>
      <h3>${phase.title}</h3>
      <p>${phase.summary}</p>
      <div class="timeline-meta">${phase.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
    </div>
    <div class="deliverables">${phase.items.map(item => `<div class="deliverable"><b>${item[0]}</b><span>${item[1]}</span></div>`).join("")}</div>`;
}

function renderReadiness() {
  const boxes = [...document.querySelectorAll('[data-check-group="readiness"] input')];
  boxes.forEach(box => {
    box.checked = state.readiness.includes(box.value);
    box.addEventListener("change", () => {
      state.readiness = boxes.filter(item => item.checked).map(item => item.value);
      saveState();
      updateReadiness();
      renderAuditSummary();
    });
  });
  updateReadiness();
}

function updateReadiness() {
  const total = 6;
  const count = state.readiness.length;
  const percent = Math.round((count / total) * 100);
  document.querySelector("#progress-number").textContent = `${percent}%`;
  document.querySelector("#progress-circle").style.strokeDashoffset = String(301.59 * (1 - percent / 100));
  document.querySelector("#readiness-message").textContent = percent === 100
    ? "啟動條件齊備；進入實施後仍要持續記錄偏離與版本。"
    : percent >= 50 ? "基礎正在形成，請優先補齊倫理、同意與研究工具。"
      : "先完成倫理與同意，再開始資料蒐集。";
}

function renderAudit() {
  const host = document.querySelector("#audit-gates");
  host.innerHTML = auditGroups.map(group => `
    <article class="audit-card">
      <h3>${group.title}</h3>
      <div class="mini-checks">${group.items.map(([id, label]) => `
        <label><input type="checkbox" value="${id}" ${state.audit.includes(id) ? "checked" : ""}><span>${label}</span></label>`).join("")}
      </div>
    </article>`).join("");
  host.querySelectorAll("input").forEach(box => box.addEventListener("change", () => {
    state.audit = [...host.querySelectorAll("input:checked")].map(item => item.value);
    saveState();
    renderAuditSummary();
  }));
  renderAuditSummary();
}

function renderAuditSummary() {
  const completed = state.audit.length;
  const readiness = state.readiness.length;
  document.querySelector("#audit-score").textContent = `${completed} / 16`;
  document.querySelector("#audit-bar").style.width = `${(completed / 16) * 100}%`;
  const message = completed === 16
    ? "四道關卡已勾選完成；正式使用前仍需核對文件內容與最新規範。"
    : readiness < 2 ? "先從倫理與同意開始，再進入工具與分析。"
      : completed >= 10 ? "已具備大部分證據鏈，請補齊尚未勾選的弱點。"
        : "下一步是把尚未完成的項目轉成有日期與負責人的行動。";
  document.querySelector("#audit-message").textContent = message;
}

function renderProcess() {
  document.querySelectorAll(".process-tab").forEach(button => {
    const active = button.dataset.process === state.process;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const content = processContent[state.process];
  document.querySelector("#process-panel").innerHTML = `
    <div class="process-flow">${content.steps.map((step, index) => `
      <article class="process-step"><i>${index + 1}</i><b>${step[0]}</b><p>${step[1]}</p></article>`).join("")}</div>
    <p class="process-warning"><b>人工把關：</b>${content.warning}</p>`;
}

function initProcessTabs() {
  document.querySelectorAll(".process-tab").forEach(button => button.addEventListener("click", () => {
    state.process = button.dataset.process;
    saveState();
    renderProcess();
  }));
  renderProcess();
}

function updateClaimLab() {
  const design = document.querySelector("#design-select").value;
  const evidence = document.querySelector("#evidence-select").value;
  const designText = {
    prepost: ["可描述同一班級介入前後的改變", "避免直接寫「介入導致改善」；成熟、測驗與同期事件仍可能影響結果。"],
    crossyear: ["可呈現不同學年間的趨勢或差異", "世代、課程調整與教師經驗都可能混入，不能把跨年差異全歸因於介入。"],
    delayed: ["可說時間序列結果與介入預測一致，並支持介入的可能作用", "若非隨機分派，仍不是隨機對照試驗；須揭露分組與污染風險。"],
    qualitative: ["可解釋學習經驗、作用機制與情境條件", "不能用少數訪談直接推估整體效果，也不能把研究者詮釋寫成客觀因果。"]
  }[design];
  const strengthen = {
    single: "目前只有單一資料來源，建議降低主張強度並增加反面證據檢查。",
    triangulated: "多來源交叉佐證可提高解釋可信度，但資料一致仍不等於因果證明。",
    repeated: "重複測量與多來源能支持時間順序與穩定性，仍須依設計誠實陳述限制。"
  }[evidence];
  document.querySelector("#claim-output").innerHTML = `<b>建議論述：</b>${designText[0]}。<br><b>必須保留：</b>${designText[1]} ${strengthen}`;
}

function renderJournalChecks() {
  const host = document.querySelector("#journal-checks");
  host.innerHTML = journalCriteria.map(([id, label]) => `
    <label><input type="checkbox" value="${id}" ${state.journal.includes(id) ? "checked" : ""}><span>${label}</span></label>`).join("");
  host.querySelectorAll("input").forEach(box => box.addEventListener("change", () => {
    state.journal = [...host.querySelectorAll("input:checked")].map(item => item.value);
    saveState();
    updateJournalScore();
  }));
  updateJournalScore();
}

function updateJournalScore() {
  const count = state.journal.length;
  document.querySelector("#journal-score").textContent = `${count} / ${journalCriteria.length}`;
  document.querySelector("#journal-message").textContent = count === journalCriteria.length
    ? "已完成初步適配檢核"
    : count >= 5 ? "可進入投稿前缺口補查"
      : "尚未形成投稿判斷";
}

function renderDisclosure() {
  const boxes = [...document.querySelectorAll("#ai-use-options input")];
  boxes.forEach(box => {
    box.checked = state.aiUses.includes(box.value);
    box.addEventListener("change", () => {
      state.aiUses = boxes.filter(item => item.checked).map(item => item.value);
      saveState();
      updateDisclosure();
    });
  });
  const policy = document.querySelector("#policy-read");
  policy.checked = state.policyRead;
  policy.addEventListener("change", () => {
    state.policyRead = policy.checked;
    saveState();
    updateDisclosure();
  });
  updateDisclosure();
}

function updateDisclosure() {
  const uses = new Set(state.aiUses);
  const output = document.querySelector("#disclosure-output");
  if (!uses.size) {
    output.innerHTML = "尚未選擇用途。若完全未使用AI，也建議保留一筆確認紀錄。";
    return;
  }
  if (uses.has("review")) {
    output.innerHTML = "<strong>高風險：</strong>不要把機密審稿材料上傳至生成式AI，除非期刊明確允許且資料處理條件符合要求。";
    return;
  }
  const substantive = ["search", "analysis", "code", "content"].some(item => uses.has(item));
  const policyText = state.policyRead
    ? "你已標記已讀政策，請依原文準備用途、工具、版本與人工責任的揭露文字。"
    : "尚未閱讀目標刊政策，現在不能判定哪些用途必須揭露。";
  output.innerHTML = substantive
    ? `<strong>傾向揭露：</strong>包含編修以外的實質用途。${policyText}`
    : `<strong>先查政策：</strong>目前只選擇文字潤飾；部分期刊可能不要求揭露，但不能推論所有期刊相同。${policyText}`;
}

function renderStages() {
  const host = document.querySelector("#stage-buttons");
  host.innerHTML = manuscriptStages.map(([id, label]) => `
    <button class="stage-button ${state.stage === id ? "active" : ""}" type="button" data-stage="${id}">${label}</button>`).join("");
  host.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.stage = button.dataset.stage;
    saveState();
    renderStages();
  }));
  const current = manuscriptStages.find(item => item[0] === state.stage) || manuscriptStages[0];
  document.querySelector("#stage-output").innerHTML = `<strong>下一步：</strong>${current[2]}`;
}

function buildResponse() {
  const comment = document.querySelector("#reviewer-comment").value.trim();
  const response = document.querySelector("#author-response").value.trim();
  const location = document.querySelector("#change-location").value.trim();
  const output = document.querySelector("#response-output");
  if (!comment || !response || !location) {
    output.textContent = "請完整填入審查意見、作者回應與修改位置。";
    return;
  }
  output.textContent = `審查意見\n${comment}\n\n作者回應\n${response}\n\n修改位置\n${location}\n\n核對事項\n□ 回應是否直接回答審查意見\n□ 修改稿與回覆表是否一致\n□ 引用、分析與頁碼是否已重新確認`;
}

async function copyResponse() {
  const text = document.querySelector("#response-output").textContent;
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#copy-response").textContent = "已複製";
    setTimeout(() => { document.querySelector("#copy-response").textContent = "複製文字"; }, 1500);
  } catch {
    document.querySelector("#copy-response").textContent = "請手動複製";
  }
}

function exportProgress() {
  const payload = {
    exported_at: new Date().toISOString(),
    note: "本檔為瀏覽器內的自我檢核紀錄，不是倫理或行政核准證明。",
    readiness_completed: state.readiness,
    audit_completed: state.audit,
    journal_checks_completed: state.journal,
    ai_use_categories: state.aiUses,
    target_journal_policy_read: state.policyRead,
    manuscript_stage: state.stage
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "研究執行準備紀錄.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetState() {
  const confirmed = window.confirm("確定要清除這台裝置上的勾選與進度嗎？此動作不會刪除任何研究檔案。");
  if (!confirmed) return;
  state = { ...defaultState };
  saveState();
  location.reload();
}

renderReadiness();
renderTimeline();
renderAudit();
initProcessTabs();
renderJournalChecks();
renderDisclosure();
renderStages();
updateClaimLab();

document.querySelector("#design-select").addEventListener("change", updateClaimLab);
document.querySelector("#evidence-select").addEventListener("change", updateClaimLab);
document.querySelector("#build-response").addEventListener("click", buildResponse);
document.querySelector("#copy-response").addEventListener("click", copyResponse);
document.querySelector("#export-progress").addEventListener("click", exportProgress);
document.querySelector("#reset-state").addEventListener("click", resetState);
