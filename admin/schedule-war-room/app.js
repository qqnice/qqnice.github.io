// ============================================================================
// 課表戰情表專案初衷與技能包互動示範網站 - 互動邏輯控制器 (app.js)
// ============================================================================

// 全域狀態
let voiceEnabled = true;
let autoTourActive = false;
let currentTourIdx = 0;
let autoTourTimer = null;

// 區塊 2：輸入與 5 步管線狀態
let currentInputExIdx = 3; // 預設顯示最震撼的 54 人全校案例
let currentPipelineStep = 1;

// 區塊 3：進階課表戰情表沙盒狀態
let selectedPersonIds = new Set(WARROOM_PEOPLE.map(p => p.id)); // 預設全選 54 位唯一人員
let activeGroupFilter = "ALL"; // 人員清單顯示的群組篩選
let warroomViewMode = "week"; // 'week' | 'day' | 'person'
let selectedDayForDayView = 3; // 預設週三
let selectedCellSlot = { day: 3, period: 5 }; // 預設點選週三第5節 (黃金空堂 + Office Hour 排除示範)
let selectedPersonIdForSingle = "t300"; // 預設陳夏蓮 (兼職 + Office Hour + 0000教室)

// 區塊 4：快取比較模式 ('first' | 'next') 與三層查核選取人物
let currentCacheMode = "first";
let selectedTrustPersonId = "t300";

// 區塊 5：目前選中的實戰情境索引
let currentScenarioIdx = 0;

// ============================================================================
// 初始化入口
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderWorkValueTable();
  updatePainCalculator();
  renderInputExamples();
  renderPipelineStepper();
  initWarRoomDemo();
  renderTrustInspector();
  switchCacheCompareMode("first");
  renderScenarioPrompts();
  renderPrinciplesAndQuiz();
  renderTourBar();
});

// ============================================================================
// 語音合成與 60 秒互動導覽 (Guided Tour)
// ============================================================================
function speakText(text, force = false) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  if (!voiceEnabled && !force) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-TW";
  utter.rate = 1.08;
  utter.pitch = 1.0;

  const waveEl = document.getElementById("tour-sound-wave");
  utter.onstart = () => {
    if (waveEl) waveEl.classList.remove("hidden");
  };
  utter.onend = () => {
    if (waveEl) waveEl.classList.add("hidden");
  };
  utter.onerror = () => {
    if (waveEl) waveEl.classList.add("hidden");
  };

  window.speechSynthesis.speak(utter);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  const icon = document.getElementById("voice-toggle-icon");
  const label = document.getElementById("voice-toggle-label");
  if (icon) icon.textContent = voiceEnabled ? "🔊" : "🔇";
  if (label) label.textContent = voiceEnabled ? "語音解說：開啟" : "語音解說：靜音";
  if (!voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function renderTourBar() {
  const pillsBox = document.getElementById("tour-step-pills");
  if (!pillsBox) return;

  pillsBox.innerHTML = TOUR_STEPS.map((s, idx) => {
    const active = idx === currentTourIdx;
    return `
      <button onclick="goToTourStep(${idx}, true)"
        class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
          active
            ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.02]"
            : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700"
        }">
        <span class="w-4 h-4 rounded-full ${active ? "bg-slate-950 text-amber-300" : "bg-slate-700 text-slate-300"} text-[10px] font-black flex items-center justify-center">${s.step}</span>
        <span class="truncate">${s.badge}</span>
      </button>
    `;
  }).join("");

  const cur = TOUR_STEPS[currentTourIdx];
  const titleEl = document.getElementById("tour-banner-title");
  const subEl = document.getElementById("tour-banner-subtitle");
  const numEl = document.getElementById("tour-banner-num");
  if (titleEl) titleEl.textContent = cur.title;
  if (subEl) subEl.textContent = `「${cur.subtitle}」`;
  if (numEl) numEl.textContent = `${cur.step}/${TOUR_STEPS.length}`;
}

function clearTourHighlights() {
  document.querySelectorAll(".tour-highlight").forEach(el => {
    el.classList.remove("tour-highlight");
  });
}

function goToTourStep(idx, shouldScroll = true) {
  if (idx < 0) idx = TOUR_STEPS.length - 1;
  if (idx >= TOUR_STEPS.length) idx = 0;
  currentTourIdx = idx;

  renderTourBar();
  clearTourHighlights();

  const stepObj = TOUR_STEPS[currentTourIdx];
  if (typeof stepObj.action === "function") {
    stepObj.action();
  }

  const targetEl = document.getElementById(stepObj.targetId);
  if (targetEl) {
    targetEl.classList.add("tour-highlight");
    if (shouldScroll) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  speakText(`${stepObj.title}。${stepObj.subtitle}`);
}

function startOrStopAutoTour() {
  const btnIcon = document.getElementById("auto-tour-icon");
  const btnLabel = document.getElementById("auto-tour-label");
  const tourBar = document.getElementById("sticky-tour-bar");

  if (autoTourActive) {
    autoTourActive = false;
    if (autoTourTimer) clearTimeout(autoTourTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearTourHighlights();
    if (btnIcon) btnIcon.textContent = "▶️";
    if (btnLabel) btnLabel.textContent = "看 60 秒互動導覽";
    return;
  }

  autoTourActive = true;
  if (tourBar) tourBar.classList.remove("hidden");
  if (btnIcon) btnIcon.textContent = "⏹️";
  if (btnLabel) btnLabel.textContent = "停止導覽";

  const runNext = (idx) => {
    if (!autoTourActive) return;
    goToTourStep(idx, true);
    autoTourTimer = setTimeout(() => {
      if (!autoTourActive) return;
      if (idx + 1 < TOUR_STEPS.length) {
        runNext(idx + 1);
      } else {
        startOrStopAutoTour();
      }
    }, 9500);
  };

  runNext(0);
}

// ============================================================================
// 區塊 1：痛點模擬滑桿與人工時間估算器 ＋ 8 大工作對照表
// ============================================================================
function updatePainCalculator() {
  const peopleSlider = document.getElementById("pain-people-slider");
  const perPersonInput = document.getElementById("pain-mins-per-person");
  const crossFactorInput = document.getElementById("pain-cross-mins");

  if (!peopleSlider || !perPersonInput || !crossFactorInput) return;

  const peopleCount = parseInt(peopleSlider.value, 10) || 54;
  const minsPerPerson = parseFloat(perPersonInput.value) || 4;
  const baseCrossMins = parseFloat(crossFactorInput.value) || 35;

  // 交叉比對時間隨人數非線性成長（人數越多，攤開比對、排除 Office Hour 與兼職核對越久）
  const scaledCrossMins = Math.round(baseCrossMins * Math.pow(peopleCount / 25, 1.35));
  const lookupTotalMins = Math.round(peopleCount * minsPerPerson);
  const totalManualMins = lookupTotalMins + scaledCrossMins;

  const hours = Math.floor(totalManualMins / 60);
  const mins = totalManualMins % 60;

  // 更新 DOM 數字
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("pain-people-display", `${peopleCount} 位`);
  setTxt("pain-per-person-display", `${minsPerPerson} 分鐘/人`);
  setTxt("pain-cross-display", `${scaledCrossMins} 分鐘`);
  setTxt("pain-formula-lookup", `${peopleCount} 人 × ${minsPerPerson} 分 = ${lookupTotalMins} 分鐘`);
  setTxt("pain-formula-cross", `${scaledCrossMins} 分鐘`);
  setTxt(
    "pain-total-time-display",
    hours > 0 ? `約 ${hours} 小時 ${mins} 分鐘（${totalManualMins} 分鐘）` : `約 ${totalManualMins} 分鐘`
  );

  // 情境文字描述
  let scaleTag = "小型討論會議";
  let scaleColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  let riskDesc = "人數尚少，人工逐張查詢與目視比對還算應付得來。";
  if (peopleCount >= 15 && peopleCount < 35) {
    scaleTag = "學院／處室級聯席會議";
    scaleColor = "bg-amber-100 text-amber-800 border-amber-300";
    riskDesc = "分頁開到眼花！開始出現『兼任兩個職務被算兩次』與『漏看 Office Hour』的錯誤。";
  } else if (peopleCount >= 35) {
    scaleTag = "全校主管／大型委員會（高負擔警戒！）";
    scaleColor = "bg-rose-100 text-rose-800 border-rose-300";
    riskDesc = "50 幾張課表攤滿桌！只要有 2 位名單異動或換學期，半天的心血就要全部重來。";
  }

  const tagEl = document.getElementById("pain-scale-badge");
  if (tagEl) {
    tagEl.className = `px-3 py-1 rounded-full text-xs font-bold border ${scaleColor}`;
    tagEl.textContent = scaleTag;
  }
  setTxt("pain-risk-desc", riskDesc);

  // 渲染視覺化課表小卡片堆疊
  const stackBox = document.getElementById("pain-sheets-stack");
  if (stackBox) {
    const sampleNames = WARROOM_PEOPLE.slice(0, peopleCount);
    stackBox.innerHTML = sampleNames
      .map((p, i) => {
        const hasOH = p.entries.some(e => e.kind === "office_hour");
        const isDup = p.isMultiRole;
        let badgeHtml = "";
        if (isDup) {
          badgeHtml = `<span class="px-1 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">兼2職</span>`;
        } else if (hasOH) {
          badgeHtml = `<span class="px-1 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">含OH</span>`;
        }
        return `
          <div class="sheet-mini-card bg-white border ${
            isDup ? "border-purple-300 bg-purple-50/40" : "border-slate-200"
          } rounded-lg p-1.5 shadow-sm flex flex-col justify-between text-[10px]">
            <div class="flex items-center justify-between gap-1">
              <span class="font-bold text-slate-800 truncate">#${i + 1} ${p.name}</span>
              ${badgeHtml}
            </div>
            <div class="mt-1 grid grid-cols-5 gap-0.5">
              ${[1, 2, 3, 4, 5]
                .map(
                  d =>
                    `<span class="h-1.5 rounded-sm ${
                      (i + d) % 3 === 0 ? "bg-rose-400" : (i + d) % 4 === 0 ? "bg-amber-300" : "bg-slate-200"
                    }"></span>`
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function renderWorkValueTable() {
  const tbody = document.getElementById("work-value-tbody");
  if (!tbody) return;

  tbody.innerHTML = WORK_VALUE_COMPARISONS.map(
    item => `
    <tr class="hover:bg-slate-50/90 transition-colors">
      <td class="py-3.5 px-4 text-slate-700 font-medium">
        <div class="flex items-start gap-2.5">
          <span class="text-lg shrink-0">${item.icon}</span>
          <span>${item.oldWork}</span>
        </div>
      </td>
      <td class="py-3.5 px-4 text-slate-900 font-bold bg-sky-50/50">
        ${item.newHelp}
      </td>
      <td class="py-3.5 px-4">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-xs font-bold">
          ✅ ${item.value}
        </span>
      </td>
    </tr>
  `
  ).join("");
}

// ============================================================================
// 區塊 2：自然語言輸入示例 ＆ 5 步嚴謹運作管線
// ============================================================================
function renderInputExamples() {
  const tabsBox = document.getElementById("input-example-tabs");
  if (!tabsBox) return;

  tabsBox.innerHTML = INPUT_EXAMPLES.map((ex, idx) => {
    const active = idx === currentInputExIdx;
    return `
      <button onclick="selectInputExample(${idx})"
        class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border text-left flex flex-col gap-0.5 ${
          active
            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
        }">
        <span class="text-[10px] uppercase tracking-wider ${active ? "text-blue-200" : "text-slate-400"}">${ex.tag}</span>
        <span>${ex.label}</span>
      </button>
    `;
  }).join("");

  const cur = INPUT_EXAMPLES[currentInputExIdx];
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("sim-meeting-title", cur.meetingTitle);
  setTxt("sim-user-input", cur.userInput);
  setTxt("sim-parsed-summary", cur.parsedSummary);
  setTxt("sim-roster-count", `${cur.rosterCount} 個職務列`);
  setTxt("sim-unique-count", `${cur.uniqueCount} 位唯一人員`);
  setTxt("sim-dedup-note", cur.dedupNote);

  const rosterBox = document.getElementById("sim-roster-preview");
  if (rosterBox) {
    rosterBox.innerHTML = cur.sampleRoster
      .map(
        r => `
      <tr class="border-b border-slate-100 last:border-none">
        <td class="py-2 px-3 text-xs font-bold text-slate-700">${r.group}</td>
        <td class="py-2 px-3 text-xs text-slate-600">${r.unit} · ${r.title}</td>
        <td class="py-2 px-3 text-xs font-black text-slate-900">${r.name}</td>
        <td class="py-2 px-3 text-xs font-mono-code text-blue-700">#${r.teacherId}</td>
        <td class="py-2 px-3 text-xs">
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">${r.note}</span>
        </td>
      </tr>
    `
      )
      .join("");
  }
}

function selectInputExample(idx) {
  currentInputExIdx = idx;
  renderInputExamples();
}

function renderPipelineStepper() {
  const navBox = document.getElementById("pipeline-step-buttons");
  const detailBox = document.getElementById("pipeline-step-detail");
  if (!navBox || !detailBox) return;

  navBox.innerHTML = PIPELINE_STEPS.map(s => {
    const active = s.stepNum === currentPipelineStep;
    return `
      <button onclick="selectPipelineStep(${s.stepNum})"
        class="p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
          active
            ? "bg-slate-900 text-white border-amber-400 shadow-lg ring-2 ring-amber-400/40"
            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
        }">
        <span class="w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
          active ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-600"
        }">${s.stepNum}</span>
        <div class="min-w-0">
          <div class="text-[10px] font-mono-code ${active ? "text-amber-300" : "text-slate-400"}">${s.codeName}</div>
          <div class="text-xs sm:text-sm font-bold leading-snug mt-0.5">${s.title}</div>
        </div>
      </button>
    `;
  }).join("");

  const cur = PIPELINE_STEPS.find(s => s.stepNum === currentPipelineStep) || PIPELINE_STEPS[0];
  detailBox.innerHTML = `
    <div class="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-xl space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span class="text-xs font-mono-code text-amber-300 font-bold">${cur.codeName}</span>
          <h4 class="text-lg sm:text-xl font-black text-white mt-0.5">${cur.title}</h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
          nutc-advanced-schedule-war-room 核心規範
        </span>
      </div>

      <p class="text-sm text-slate-200 leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
        💡 <strong>這一步在做什麼：</strong>${cur.summary}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-7 bg-slate-800/50 rounded-xl p-4 border border-slate-700/80 space-y-2">
          <div class="text-xs font-bold text-sky-300">🤖 技能包自動執行的標準動作：</div>
          <ul class="space-y-2 text-xs sm:text-sm text-slate-200">
            ${cur.whatAiDoes.map(item => `<li class="flex items-start gap-2"><span class="text-sky-400 font-bold">▸</span><span>${item}</span></li>`).join("")}
          </ul>
        </div>
        <div class="md:col-span-5 bg-amber-500/10 rounded-xl p-4 border border-amber-400/30 flex flex-col justify-between">
          <div>
            <div class="text-xs font-bold text-amber-300 mb-1.5">🛡️ 真人把關與防呆護欄：</div>
            <p class="text-xs sm:text-sm text-amber-100 leading-relaxed">${cur.humanGuard}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-between text-[11px] text-amber-200">
            <span>進度：Step ${cur.stepNum} / 5</span>
            <div class="flex gap-1.5">
              <button onclick="selectPipelineStep(${cur.stepNum > 1 ? cur.stepNum - 1 : 5})" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold">◀ 上一步</button>
              <button onclick="selectPipelineStep(${cur.stepNum < 5 ? cur.stepNum + 1 : 1})" class="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-black">下一步 ▶</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectPipelineStep(stepNum) {
  currentPipelineStep = stepNum;
  renderPipelineStepper();
}

// ============================================================================
// 區塊 3：54 位唯一主管進階課表戰情表互動沙盒 (War Room Sandbox)
// ============================================================================
function initWarRoomDemo() {
  renderWarRoomGroupBar();
  renderWarRoomRosterPills();
  renderWarRoomMainView();
  renderWarRoomSlotInspector();
}

// 取得某群組內的唯一人員列表
function getPeopleInGroup(groupId) {
  if (groupId === "ALL") return WARROOM_PEOPLE;
  return WARROOM_PEOPLE.filter(p => p.groups.includes(groupId));
}

// 計算目前已選人員對應的「職務總列數」與「唯一人數」（展示一人多職只計一次）
function getSelectionDeduplicationStats() {
  const selectedPeople = WARROOM_PEOPLE.filter(p => selectedPersonIds.has(p.id));
  let totalAppointments = 0;
  let multiRoleSelected = [];
  selectedPeople.forEach(p => {
    const roleCount = p.roles ? p.roles.length : 1;
    totalAppointments += roleCount;
    if (roleCount > 1) {
      multiRoleSelected.push(p);
    }
  });
  return {
    uniqueCount: selectedPeople.length,
    appointmentCount: totalAppointments,
    dedupSaved: totalAppointments - selectedPeople.length,
    multiRoleSelected
  };
}

// 預設快速情境按鈕
function applyDemoPreset(presetName) {
  if (presetName === "all54") {
    selectedPersonIds = new Set(WARROOM_PEOPLE.map(p => p.id));
    activeGroupFilter = "ALL";
    warroomViewMode = "week";
    selectedCellSlot = { day: 3, period: 5 };
  } else if (presetName === "exec_deans") {
    selectedPersonIds = new Set(
      WARROOM_PEOPLE.filter(p => p.groups.includes("一級主管") || p.groups.includes("院長")).map(p => p.id)
    );
    activeGroupFilter = "一級主管";
    warroomViewMode = "week";
    selectedCellSlot = { day: 3, period: 5 };
  } else if (presetName === "cross_college") {
    // 商學院 + 資訊與流通學院 跨院比較
    selectedPersonIds = new Set(
      WARROOM_PEOPLE.filter(p => p.groups.includes("商學院") || p.groups.includes("資訊與流通學院")).map(p => p.id)
    );
    activeGroupFilter = "商學院";
    warroomViewMode = "week";
    selectedCellSlot = { day: 2, period: 4 };
  } else if (presetName === "single_multi") {
    // 直接檢視兼職＋Office Hour＋0000教室代表人物：陳夏蓮
    warroomViewMode = "person";
    selectedPersonIdForSingle = "t300";
  } else if (presetName === "clear") {
    selectedPersonIds = new Set();
  }
  initWarRoomDemo();
}

// 點擊群組按鈕：在衝突模式下將該組所有人「加入（聯集累加）」目前選取；若該組已全選則切換檢視或移除
function toggleGroupSelection(groupId) {
  activeGroupFilter = groupId;
  if (groupId === "ALL") {
    selectedPersonIds = new Set(WARROOM_PEOPLE.map(p => p.id));
  } else {
    const groupMembers = getPeopleInGroup(groupId);
    const allAlreadySelected = groupMembers.every(p => selectedPersonIds.has(p.id));
    if (allAlreadySelected && selectedPersonIds.size === groupMembers.length) {
      // 若目前只有這組，維持不變
    } else if (!allAlreadySelected) {
      // 跨組累加（聯集）
      groupMembers.forEach(p => selectedPersonIds.add(p.id));
    }
  }
  initWarRoomDemo();
}

// 僅切換特定群組全選／取消該群組
function addOrRemoveEntireGroup(groupId, mode) {
  const members = getPeopleInGroup(groupId);
  if (mode === "only") {
    selectedPersonIds = new Set(members.map(p => p.id));
    activeGroupFilter = groupId;
  } else if (mode === "add") {
    members.forEach(p => selectedPersonIds.add(p.id));
    activeGroupFilter = groupId;
  } else if (mode === "remove") {
    members.forEach(p => selectedPersonIds.delete(p.id));
  }
  initWarRoomDemo();
}

function toggleSinglePersonSelection(personId) {
  if (selectedPersonIds.has(personId)) {
    selectedPersonIds.delete(personId);
  } else {
    selectedPersonIds.add(personId);
  }
  initWarRoomDemo();
}

function setWarRoomViewMode(mode, personId = null) {
  warroomViewMode = mode;
  if (personId) {
    selectedPersonIdForSingle = personId;
  }
  initWarRoomDemo();
}

function selectDayViewDay(dayNum) {
  selectedDayForDayView = dayNum;
  renderWarRoomMainView();
}

function renderWarRoomGroupBar() {
  const box = document.getElementById("warroom-group-buttons");
  if (!box) return;

  box.innerHTML = WARROOM_GROUPS.map(g => {
    const members = getPeopleInGroup(g.id);
    const selectedInGroup = members.filter(p => selectedPersonIds.has(p.id)).length;
    const isFilterActive = activeGroupFilter === g.id;
    const isAllGroupSelected = selectedInGroup === members.length && members.length > 0;

    return `
      <div class="inline-flex items-center rounded-xl border transition-all overflow-hidden ${
        isFilterActive
          ? "border-blue-600 bg-blue-50/90 shadow-sm"
          : isAllGroupSelected
          ? "border-emerald-300 bg-emerald-50/50"
          : "border-slate-200 bg-white"
      }">
        <button onclick="toggleGroupSelection('${g.id}')"
          class="px-3 py-2 text-xs font-bold flex items-center gap-1.5 text-slate-800 hover:bg-slate-100/70 transition-colors"
          title="${g.desc}（點選可篩選並將本組累加加入比較）">
          <span>${g.name}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono-code ${
            isAllGroupSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
          }">${selectedInGroup}/${members.length}人</span>
        </button>
        ${
          g.id !== "ALL"
            ? `<button onclick="addOrRemoveEntireGroup('${g.id}', 'only')"
                class="px-2 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100 border-l border-slate-200"
                title="只看${g.name}">單看</button>`
            : ""
        }
      </div>
    `;
  }).join("");

  // 更新去重統計橫幅
  const stats = getSelectionDeduplicationStats();
  const dedupBox = document.getElementById("warroom-dedup-banner");
  if (dedupBox) {
    dedupBox.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black">
            目前選取唯一人員：${stats.uniqueCount} 人 / 全校 ${WARROOM_PEOPLE.length} 人
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 font-bold">
            涵蓋職務數：${stats.appointmentCount} 個職務 ➔ 自動去重少算 ${stats.dedupSaved} 次重複衝突！
          </span>
        </div>
        <div class="text-[11px] text-slate-600">
          ${
            stats.multiRoleSelected.length > 0
              ? `⚡ 跨組兼職去重生效中：${stats.multiRoleSelected.map(p => `${p.name}(${p.roleDisplay})`).join("、")}`
              : "點選上方任一群組可「跨院／跨組累加」比較"
          }
        </div>
      </div>
    `;
  }
}

function renderWarRoomRosterPills() {
  const box = document.getElementById("warroom-roster-pills");
  if (!box) return;

  const list = getPeopleInGroup(activeGroupFilter);
  box.innerHTML = list
    .map(p => {
      const isSelected = selectedPersonIds.has(p.id);
      const hasOH = p.entries.some(e => e.kind === "office_hour");
      const reviewBadge =
        p.humanReview === "matched"
          ? `<span class="text-emerald-600" title="人工核對：相同">✔</span>`
          : p.humanReview === "different"
          ? `<span class="text-rose-600 font-black" title="人工核對：有差異">⚠</span>`
          : `<span class="text-amber-600" title="人工核對：未核對">●</span>`;

      return `
        <div class="inline-flex items-center rounded-lg border text-xs transition-all ${
          isSelected
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
        }">
          <button onclick="toggleSinglePersonSelection('${p.id}')"
            class="px-2.5 py-1 flex items-center gap-1.5 font-bold">
            <span>${isSelected ? "☑️" : "⬜"}</span>
            <span>${p.name}</span>
            ${p.isMultiRole ? `<span class="px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[9px]">兼職</span>` : ""}
            ${hasOH ? `<span class="px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[9px]">OH</span>` : ""}
            ${reviewBadge}
          </button>
          <button onclick="setWarRoomViewMode('person', '${p.id}')"
            class="px-1.5 py-1 text-[10px] border-l ${
              isSelected ? "border-slate-700 text-sky-300 hover:bg-slate-800" : "border-slate-200 text-blue-600 hover:bg-slate-100"
            }"
            title="查看 ${p.name} 的個人完整一週課表與人工核對">
            課表↗
          </button>
        </div>
      `;
    })
    .join("");
}

// 計算某星期、某節次的衝突與狀態
function evaluateSlotStatus(day, period) {
  const selectedPeople = WARROOM_PEOPLE.filter(p => selectedPersonIds.has(p.id));
  const totalSelected = selectedPeople.length;

  const busyPeople = [];
  const officeHourPeople = [];
  const unknownOrDiffPeople = [];

  selectedPeople.forEach(p => {
    const slotEntries = p.entries.filter(e => e.day === day && e.period === period);
    const formalCourses = slotEntries.filter(e => !e.excluded && e.kind === "course");
    const ohEntries = slotEntries.filter(e => e.excluded || e.kind === "office_hour");

    if (ohEntries.length > 0) {
      officeHourPeople.push({ person: p, entries: ohEntries });
    }

    if (formalCourses.length > 0) {
      busyPeople.push({ person: p, courses: formalCourses });
    } else {
      // 無正式課程，檢查是否符合 free 前提 (systemVerified=true 且 humanReview !== 'different')
      if (!p.systemVerified || p.humanReview === "different") {
        unknownOrDiffPeople.push(p);
      }
    }
  });

  // 共同無課嚴格定義：被選人數 > 0，且 busyPeople === 0，且 unknownOrDiffPeople === 0
  const isCommonFree = totalSelected > 0 && busyPeople.length === 0 && unknownOrDiffPeople.length === 0;
  const hasDiffBlocker = totalSelected > 0 && busyPeople.length === 0 && unknownOrDiffPeople.length > 0;

  return {
    day,
    period,
    totalSelected,
    busyCount: busyPeople.length,
    busyPeople,
    officeHourPeople,
    unknownOrDiffPeople,
    isCommonFree,
    hasDiffBlocker
  };
}

function renderWarRoomMainView() {
  // 更新三個模式切換按鈕樣式
  ["week", "day", "person"].forEach(m => {
    const btn = document.getElementById(`btn-view-${m}`);
    if (btn) {
      btn.className =
        warroomViewMode === m
          ? "px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 text-white shadow"
          : "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700";
    }
  });

  const container = document.getElementById("warroom-main-stage");
  if (!container) return;

  if (warroomViewMode === "week") {
    renderWeekHeatmapView(container);
  } else if (warroomViewMode === "day") {
    renderSingleDayComparisonView(container);
  } else {
    renderSinglePersonTimetableView(container);
  }
}

function renderWeekHeatmapView(container) {
  // 統計全週共同無課節數與少數衝堂節數
  let commonFreeSlots = [];
  let lowConflictSlots = [];
  DAY_META.forEach(d => {
    PERIOD_META.forEach(p => {
      const st = evaluateSlotStatus(d.day, p.period);
      if (st.isCommonFree) commonFreeSlots.push(`${d.short}第${p.period}節`);
      else if (st.totalSelected > 0 && st.busyCount > 0 && st.busyCount <= 2) {
        lowConflictSlots.push(`${d.short}第${p.period}節(${st.busyCount}人有課)`);
      }
    });
  });

  container.innerHTML = `
    <div class="space-y-3">
      <!-- 黃金候選時段自動摘要列 -->
      <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="text-xs text-emerald-950">
          <span class="font-black text-emerald-700">🟢 共同無固定授課時段（共 ${commonFreeSlots.length} 節）：</span>
          <span class="font-medium">${commonFreeSlots.length > 0 ? commonFreeSlots.slice(0, 8).join("、") : "請先選取人員或檢查是否有標記差異"}</span>
        </div>
        <div class="text-[11px] text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg font-bold shrink-0">
          💡 點選下方任一節次格子，右側立即顯示「衝堂人員明細」與「已排除的 Office Hour」！
        </div>
      </div>

      <!-- 週一至週五 1-8 節熱力矩陣 -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="bg-slate-900 text-white">
              <th class="py-2.5 px-3 text-left rounded-tl-xl w-28">節次 ／ 時間</th>
              ${DAY_META.map(d => `<th class="py-2.5 px-3 text-center">${d.full}</th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${PERIOD_META.map(p => {
              return `
                <tr>
                  <td class="py-2.5 px-3 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                    <div>${p.label}</div>
                    <div class="text-[10px] font-mono-code text-slate-500">${p.time}</div>
                  </td>
                  ${DAY_META.map(d => {
                    const st = evaluateSlotStatus(d.day, p.period);
                    const isSelectedCell =
                      selectedCellSlot.day === d.day && selectedCellSlot.period === p.period;

                    let cellBg = "bg-slate-50 text-slate-400";
                    let badgeText = "未選人";
                    let subText = "";

                    if (st.totalSelected > 0) {
                      if (st.isCommonFree) {
                        cellBg = "bg-emerald-100/90 hover:bg-emerald-200/90 text-emerald-950 border-emerald-300";
                        badgeText = "🟢 共同無課 (0人忙)";
                        subText =
                          st.officeHourPeople.length > 0
                            ? `☕ 已自動排除 ${st.officeHourPeople.length} 人 Office Hour`
                            : `全員 ${st.totalSelected} 人皆可出席`;
                      } else if (st.hasDiffBlocker) {
                        cellBg = "bg-orange-100 hover:bg-orange-200 text-orange-950 border-orange-400";
                        badgeText = "🟠 0人有課 (含差異待驗)";
                        subText = `${st.unknownOrDiffPeople.length} 人標記有差異，不宣稱共同空堂`;
                      } else if (st.busyCount <= 2) {
                        cellBg = "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300";
                        badgeText = `🟡 ${st.busyCount} 人有課`;
                        subText = st.busyPeople.map(b => b.person.name).join("、");
                      } else {
                        cellBg = "bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-200";
                        badgeText = `🔴 ${st.busyCount} 人有課`;
                        subText =
                          st.busyPeople
                            .slice(0, 2)
                            .map(b => b.person.name)
                            .join("、") + ` 等 ${st.busyCount} 人`;
                      }
                    }

                    return `
                      <td class="p-1.5 border-r border-slate-100 last:border-none">
                        <button onclick="selectWarRoomCell(${d.day}, ${p.period})"
                          class="schedule-cell w-full text-left p-2 rounded-xl border ${cellBg} ${
                      isSelectedCell ? "active-cell" : ""
                    }">
                          <div class="font-black text-xs flex items-center justify-between">
                            <span>${badgeText}</span>
                            <span class="text-[10px] font-mono-code opacity-75">${st.busyCount}/${st.totalSelected}</span>
                          </div>
                          <div class="text-[10px] mt-1 truncate opacity-90">${subText}</div>
                        </button>
                      </td>
                    `;
                  }).join("")}
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSingleDayComparisonView(container) {
  const selectedPeople = WARROOM_PEOPLE.filter(p => selectedPersonIds.has(p.id));

  container.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-3 rounded-xl">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-slate-700 mr-1">選擇單日橫向對照：</span>
          ${DAY_META.map(
            d => `
            <button onclick="selectDayViewDay(${d.day})"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDayForDayView === d.day
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-700 hover:bg-slate-200"
              }">
              ${d.full}
            </button>
          `
          ).join("")}
        </div>
        <span class="text-xs text-slate-600">顯示目前已選 ${selectedPeople.length} 位唯一人員於各節次狀態</span>
      </div>

      <div class="overflow-x-auto max-h-[420px] overflow-y-auto border border-slate-200 rounded-xl">
        <table class="w-full border-collapse text-xs">
          <thead class="sticky top-0 z-10 bg-slate-900 text-white">
            <tr>
              <th class="py-2.5 px-3 text-left w-48">姓名 ／ 完整職稱</th>
              ${PERIOD_META.map(p => `<th class="py-2.5 px-2 text-center">${p.label}<div class="text-[9px] font-mono-code text-slate-300">${p.time}</div></th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${selectedPeople
              .map(p => {
                return `
                <tr class="hover:bg-slate-50">
                  <td class="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                    <div class="flex items-center justify-between gap-1">
                      <button onclick="setWarRoomViewMode('person', '${p.id}')" class="hover:text-blue-600 underline decoration-dotted text-left">
                        ${p.name}
                      </button>
                      <span class="text-[10px] font-mono-code text-slate-400">#${p.teacherId}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 font-normal truncate max-w-[175px]" title="${p.roleDisplay}">${p.roleDisplay}</div>
                  </td>
                  ${PERIOD_META.map(pm => {
                    const slotEntries = p.entries.filter(
                      e => e.day === selectedDayForDayView && e.period === pm.period
                    );
                    const formal = slotEntries.filter(e => !e.excluded && e.kind === "course");
                    const oh = slotEntries.filter(e => e.excluded || e.kind === "office_hour");

                    if (formal.length > 0) {
                      const c = formal[0];
                      return `<td class="p-1.5 text-center bg-rose-50 border-r border-slate-100">
                        <div class="font-bold text-rose-900 text-[11px] truncate max-w-[90px] mx-auto" title="${c.course}">${c.course}</div>
                        <div class="text-[9px] text-rose-700">${c.className} ${c.room !== "" ? `(${c.room})` : "(空白教室)"}</div>
                      </td>`;
                    }
                    if (oh.length > 0) {
                      return `<td class="p-1.5 text-center bg-amber-50/70 border-r border-slate-100">
                        <div class="font-bold text-amber-800 text-[10px] line-through">Office Hour</div>
                        <div class="text-[9px] text-emerald-700 font-bold">已排除衝突</div>
                      </td>`;
                    }
                    if (p.humanReview === "different") {
                      return `<td class="p-1.5 text-center bg-orange-50 text-orange-800 border-r border-slate-100 text-[10px] font-bold">⚠ 有差異待驗</td>`;
                    }
                    return `<td class="p-1.5 text-center bg-emerald-50/40 text-emerald-700 border-r border-slate-100 text-[11px] font-bold">🟢 無課</td>`;
                  }).join("")}
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSinglePersonTimetableView(container) {
  const person =
    WARROOM_PEOPLE.find(p => p.id === selectedPersonIdForSingle) || WARROOM_PEOPLE[0];

  container.innerHTML = `
    <div class="space-y-4">
      <!-- 個人選擇器與官方資訊卡 -->
      <div class="p-4 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-400">切換檢視人員：</span>
            <select onchange="setWarRoomViewMode('person', this.value)"
              class="bg-slate-800 text-white border border-slate-600 rounded-lg px-2.5 py-1 text-xs font-bold">
              ${WARROOM_PEOPLE.map(
                p =>
                  `<option value="${p.id}" ${p.id === person.id ? "selected" : ""}>#${p.teacherId} ${
                    p.name
                  } — ${p.roleDisplay}</option>`
              ).join("")}
            </select>
            ${
              person.isMultiRole
                ? `<span class="px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/50 text-purple-200 text-[11px] font-bold">✨ 一人兼多職（只保留一份唯一課表）</span>`
                : ""
            }
          </div>
          <div class="text-xs text-slate-300 pt-1">
            <strong>完整職稱：</strong>${person.roleDisplay} ｜ <strong>所屬群組：</strong>${person.groups.join("、")} ｜ <strong>唯一編號：</strong><code class="text-amber-300">teacherId=${person.teacherId}</code>
          </div>
          <div class="text-[11px] text-sky-300">
            🔗 官方課表來源：<a href="${person.sourceUrl}" target="_blank" rel="noopener" class="underline hover:text-sky-200 font-mono-code">${person.sourceUrl} ↗</a>（學期標籤：<code>115年(上) 教師課表</code>）
          </div>
        </div>

        <!-- 人工核對狀態即時切換器 -->
        <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 shrink-0">
          <div class="text-[11px] font-bold text-amber-300 mb-1.5">👩‍💼 同仁人工核對狀態（試著切換看看！）：</div>
          <div class="flex items-center gap-1.5">
            ${[
              { key: "unconfirmed", label: "● 未核對", cls: "bg-slate-700 text-slate-200" },
              { key: "matched", label: "✔ 相同 (可重用快取)", cls: "bg-emerald-600 text-white" },
              { key: "different", label: "⚠ 有差異 (取消共同無課)", cls: "bg-rose-600 text-white" }
            ]
              .map(
                opt => `
              <button onclick="updatePersonHumanReview('${person.id}', '${opt.key}')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  person.humanReview === opt.key
                    ? `${opt.cls} ring-2 ring-amber-300 shadow`
                    : "bg-slate-900 text-slate-400 hover:bg-slate-700"
                }">
                ${opt.label}
              </button>
            `
              )
              .join("")}
          </div>
          <div class="text-[10px] text-slate-400 mt-1.5">
            備註：瀏覽器切換供即時預覽；跨次快取重用仍以地端 Excel 為準。
          </div>
        </div>
      </div>

      <!-- 單人一週課表 (含 Office Hour 排除與 0000/空白教室原樣保留) -->
      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100 text-slate-800 border-b border-slate-200">
              <th class="py-2 px-3 text-left w-28">節次 ／ 時間</th>
              ${DAY_META.map(d => `<th class="py-2 px-3 text-center">${d.full}</th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${PERIOD_META.map(pm => {
              return `
                <tr>
                  <td class="py-2.5 px-3 bg-slate-50 font-bold text-slate-700 border-r border-slate-200">
                    <div>${pm.label}</div>
                    <div class="text-[10px] font-mono-code text-slate-400">${pm.time}</div>
                  </td>
                  ${DAY_META.map(d => {
                    const list = person.entries.filter(
                      e => e.day === d.day && e.period === pm.period
                    );
                    if (list.length === 0) {
                      return `<td class="p-2 text-center text-slate-300 border-r border-slate-100">—</td>`;
                    }
                    return `<td class="p-2 border-r border-slate-100 align-top">
                      ${list
                        .map(e => {
                          if (e.kind === "office_hour" || e.excluded) {
                            return `
                              <div class="p-2 rounded-lg bg-amber-50 border border-dashed border-amber-400 text-amber-900">
                                <div class="font-black text-[11px]">☕ ${e.className}</div>
                                <div class="text-[10px] text-amber-700">教室：${e.room || "(空白)"}</div>
                                <div class="mt-1 inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                  excluded=true（不計入會議衝突）
                                </div>
                              </div>
                            `;
                          }
                          return `
                            <div class="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                              <div class="font-black text-xs">${e.course}</div>
                              <div class="text-[10px] text-rose-800 mt-0.5">班級：${e.className}</div>
                              <div class="text-[10px] font-mono-code mt-0.5 ${
                                e.room === "0000" || e.room === ""
                                  ? "text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded inline-block"
                                  : "text-slate-600"
                              }">
                                教室：${
                                  e.room === ""
                                    ? "（空白原樣保留）"
                                    : e.room === "0000"
                                    ? "0000（原樣保留）"
                                    : e.room
                                }
                              </div>
                            </div>
                          `;
                        })
                        .join("<hr class='my-1 border-slate-200'/>")}
                    </td>`;
                  }).join("")}
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function updatePersonHumanReview(personId, newStatus) {
  const target = WARROOM_PEOPLE.find(p => p.id === personId);
  if (!target) return;
  target.humanReview = newStatus;
  initWarRoomDemo();
  renderTrustInspector();
}

function selectWarRoomCell(day, period) {
  selectedCellSlot = { day, period };
  renderWarRoomMainView();
  renderWarRoomSlotInspector();
}

function renderWarRoomSlotInspector() {
  const box = document.getElementById("warroom-slot-inspector");
  if (!box) return;

  const { day, period } = selectedCellSlot;
  const dayObj = DAY_META.find(d => d.day === day) || DAY_META[0];
  const periodObj = PERIOD_META.find(p => p.period === period) || PERIOD_META[0];
  const st = evaluateSlotStatus(day, period);

  box.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div>
          <span class="text-[11px] font-bold text-blue-600 uppercase">時段衝突與查核明細</span>
          <h4 class="text-base font-black text-slate-900">${dayObj.full} · ${periodObj.label}（${periodObj.time}）</h4>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-black ${
          st.isCommonFree
            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
            : st.hasDiffBlocker
            ? "bg-orange-100 text-orange-800 border border-orange-300"
            : "bg-rose-100 text-rose-800 border border-rose-300"
        }">
          ${
            st.isCommonFree
              ? "🟢 共同無固定授課"
              : st.hasDiffBlocker
              ? "🟠 含差異待複核"
              : `🔴 ${st.busyCount} 人固定授課中`
          }
        </span>
      </div>

      <!-- 1. 正式授課衝突清單 -->
      <div class="space-y-1.5">
        <div class="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>📚 該節有正式授課人員（${st.busyCount} 人）：</span>
          <span class="text-[10px] text-slate-500">一人多職已去重</span>
        </div>
        ${
          st.busyCount === 0
            ? `<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
                🎉 太棒了！目前選取的 ${st.totalSelected} 位唯一主管在此節次皆無固定授課！
              </div>`
            : `<div class="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                ${st.busyPeople
                  .map(
                    b => `
                  <div class="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs flex items-start justify-between gap-2">
                    <div>
                      <div class="font-black text-rose-950">${b.person.name} <span class="font-normal text-[11px] text-slate-600">（${b.person.roleDisplay}）</span></div>
                      <div class="text-[11px] text-rose-800 mt-0.5">
                        ${b.courses.map(c => `《${c.course}》${c.className} · 教室 ${c.room || "(空白)"}`).join(" ／ ")}
                      </div>
                    </div>
                    <button onclick="setWarRoomViewMode('person', '${b.person.id}')"
                      class="px-2 py-1 rounded bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold shrink-0">
                      查個人表
                    </button>
                  </div>
                `
                  )
                  .join("")}
              </div>`
        }
      </div>

      <!-- 2. 自動排除的 Office Hour 提示 -->
      <div class="p-3 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1">
        <div class="text-xs font-bold text-amber-900">
          ☕ 自動排除之 Office Hour（${st.officeHourPeople.length} 人）：
        </div>
        ${
          st.officeHourPeople.length === 0
            ? `<p class="text-[11px] text-amber-800">本節次無人員登記 Office Hour。</p>`
            : `<p class="text-[11px] text-amber-900 leading-relaxed">
                <strong>${st.officeHourPeople.map(o => `${o.person.name}(${o.person.roleDisplay})`).join("、")}</strong> 在原始課表此節次為 <code>Office Hour</code>，系統已保留於原始快取供查驗，並自動排除於會議衝突之外！
              </p>`
        }
      </div>

      <!-- 3. 人工標記有差異或待核對提示 -->
      ${
        st.unknownOrDiffPeople.length > 0
          ? `<div class="p-3 rounded-xl bg-orange-100 border border-orange-300 text-xs text-orange-950">
              ⚠️ <strong>共同空堂保護機制觸發：</strong>${st.unknownOrDiffPeople.map(p => p.name).join("、")} 目前被標記為「有差異」，在重新確認前不將此節宣稱為已確認共同無課。
            </div>`
          : ""
      }
    </div>
  `;
}

// ============================================================================
// 區塊 4：三層信任狀態卡可視化 ＆ 「第一次 vs 下一次」快取重用模擬
// ============================================================================
function selectTrustPerson(personId) {
  selectedTrustPersonId = personId;
  renderTrustInspector();
}

function renderTrustInspector() {
  const selectorBox = document.getElementById("trust-person-selector");
  const cardBox = document.getElementById("trust-status-detail");
  if (!selectorBox || !cardBox) return;

  const samplePeople = ["t300", "t305", "t312", "t331"].map(id =>
    WARROOM_PEOPLE.find(p => p.id === id)
  );

  selectorBox.innerHTML = samplePeople
    .map(p => {
      const active = p.id === selectedTrustPersonId;
      return `
        <button onclick="selectTrustPerson('${p.id}')"
          class="px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
            active
              ? "bg-slate-900 text-white border-slate-900 shadow"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }">
          <span>${p.name}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] ${
            p.humanReview === "matched"
              ? "bg-emerald-500/20 text-emerald-300"
              : p.humanReview === "different"
              ? "bg-rose-500/20 text-rose-300"
              : "bg-amber-500/20 text-amber-300"
          }">
            ${p.humanReview === "matched" ? "人工已確認相同" : p.humanReview === "different" ? "標記有差異" : "待人工核對"}
          </span>
        </button>
      `;
    })
    .join("");

  const p = WARROOM_PEOPLE.find(x => x.id === selectedTrustPersonId) || WARROOM_PEOPLE[0];
  const formalCount = p.entries.filter(e => !e.excluded).length;
  const ohCount = p.entries.filter(e => e.excluded).length;
  const canReuseCache = p.systemVerified && p.humanReview === "matched";

  cardBox.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 第一層：官方來源已取得 -->
      <div class="p-4 rounded-2xl bg-white border-2 border-sky-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-100 text-sky-800">Layer 1 · 官方來源擷取</span>
          <span class="text-emerald-600 font-black text-sm">✔ 已取得</span>
        </div>
        <h5 class="font-black text-slate-900 text-base">${p.name}（#${p.teacherId}）</h5>
        <ul class="text-xs text-slate-600 space-y-1.5 pt-1">
          <li><strong>查詢學期：</strong><code>115年(上) 教師課表 (115-1)</code></li>
          <li><strong>官方網址：</strong><a href="${p.sourceUrl}" target="_blank" class="text-blue-600 underline font-mono-code break-all">${p.sourceUrl}</a></li>
          <li><strong>職務歸屬：</strong>${p.roleDisplay}</li>
        </ul>
      </div>

      <!-- 第二層：系統完整核對 -->
      <div class="p-4 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800">Layer 2 · 系統完整核對</span>
          <span class="text-emerald-600 font-black text-sm">systemVerified = true</span>
        </div>
        <h5 class="font-black text-slate-900 text-base">結構化與防呆驗證通過</h5>
        <ul class="text-xs text-slate-600 space-y-1.5 pt-1">
          <li><strong>原始總筆數：</strong>共 ${p.entries.length} 筆（含節次 1–8 完整對齊）</li>
          <li><strong>有效固定授課：</strong>${formalCount} 節（計入會議忙碌衝突）</li>
          <li><strong>排除 Office Hour：</strong>${ohCount} 節（保留於原始快取、不計衝突）</li>
        </ul>
      </div>

      <!-- 第三層：同仁人工確認與快取資格 -->
      <div class="p-4 rounded-2xl ${
        canReuseCache
          ? "bg-emerald-50/70 border-2 border-emerald-400"
          : p.humanReview === "different"
          ? "bg-rose-50 border-2 border-rose-400"
          : "bg-amber-50/70 border-2 border-amber-300"
      } shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/90 text-slate-800 border">Layer 3 · 同仁人工核對</span>
          <span class="font-black text-xs ${
            canReuseCache ? "text-emerald-700" : p.humanReview === "different" ? "text-rose-700" : "text-amber-700"
          }">
            ${
              canReuseCache
                ? "🟢 相同 (matched)"
                : p.humanReview === "different"
                ? "🔴 有差異 (different)"
                : "🟡 未核對 (unconfirmed)"
            }
          </span>
        </div>
        <h5 class="font-black text-slate-900 text-base">
          ${
            canReuseCache
              ? "✅ 下次開會可直接重用地端快取！"
              : p.humanReview === "different"
              ? "⚠️ 已鎖定：需重查或套用修訂 Excel"
              : "⏳ 候選快取（待同仁於 Excel 勾選相同）"
          }
        </h5>
        <p class="text-xs text-slate-700 leading-relaxed">${p.reviewerNote}</p>
        <div class="pt-1 flex gap-1.5">
          <button onclick="updatePersonHumanReview('${p.id}', 'matched')" class="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold">標記為相同</button>
          <button onclick="updatePersonHumanReview('${p.id}', 'unconfirmed')" class="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">設為未核對</button>
          <button onclick="updatePersonHumanReview('${p.id}', 'different')" class="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-bold">標記有差異</button>
        </div>
      </div>
    </div>
  `;
}

function switchCacheCompareMode(mode) {
  currentCacheMode = mode;
  const btnFirst = document.getElementById("btn-cache-first");
  const btnNext = document.getElementById("btn-cache-next");
  const contentBox = document.getElementById("cache-compare-stage");
  if (!contentBox) return;

  if (btnFirst && btnNext) {
    btnFirst.className =
      mode === "first"
        ? "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-900 text-white shadow"
        : "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200";
    btnNext.className =
      mode === "next"
        ? "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 text-white shadow"
        : "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200";
  }

  if (mode === "first") {
    contentBox.innerHTML = `
      <div class="p-5 rounded-2xl bg-slate-900 text-white border border-slate-700 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
            🌱 學期第一次建立戰情表（建立組織基礎資產）
          </span>
          <span class="text-xs text-slate-400">54 位主管全數從官方系統擷取並建立 Excel 快取</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div class="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-amber-300 font-black mb-1">1. 確認名單與去重</div>
            <p class="text-slate-300">解析 58 個主管職務，由承辦人確認姓名，合併為 54 位唯一人員。</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-sky-300 font-black mb-1">2. 官方課表批次查詢</div>
            <p class="text-slate-300">AI 自動進入 <code>by_teacher.aspx</code> 查詢 54 人，排除 Office Hour 並驗證完整性。</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-emerald-300 font-black mb-1">3. 同仁於 Excel 複核</div>
            <p class="text-slate-300">打開產出的 Excel 快取檔，對照官方連結後將核對欄選為「相同」。</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800 border border-amber-400/50">
            <div class="text-amber-300 font-black mb-1">4. 保存為可靠地端快取</div>
            <p class="text-slate-300">這份經真人確認的 Excel 成為本學期黃金快取，全處室皆可重用！</p>
          </div>
        </div>
      </div>
    `;
  } else {
    contentBox.innerHTML = `
      <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white border-2 border-emerald-500/50 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
            ⚡ 同一學期下一次開會（直接重用已確認快取・秒級完成！）
          </span>
          <span class="text-xs text-emerald-300 font-bold">省去 95% 重複網路查詢與人工重對時間</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div class="p-3.5 rounded-xl bg-slate-800/90 border border-emerald-500/40">
            <div class="text-emerald-300 font-black mb-1">1. 讀取已確認 Excel 快取</div>
            <p class="text-slate-200">發現 51 位主管在本學期已具 <code>systemVerified=true</code> 且人工標記「相同」，<strong>0 秒直接重用</strong>！</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div class="text-sky-300 font-black mb-1">2. 只查異動或新加入人員</div>
            <p class="text-slate-200">若新會議多了 3 位新聘委員，AI <strong>只針對這 3 人</strong>進官方系統補查。</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div class="text-amber-300 font-black mb-1">3. 立即產出新會議戰情表</div>
            <p class="text-slate-200">自動更換新會議標題與新分組，幾秒內就產出全新戰情表與候選時段。</p>
          </div>
          <div class="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400">
            <div class="text-white font-black mb-1">4. 組織核對成果持續累積</div>
            <p class="text-emerald-100">同仁投入過一次的核對心血不會白費，也不會造成學校課表伺服器重複負擔！</p>
          </div>
        </div>
      </div>
    `;
  }
}

// ============================================================================
// 區塊 5：6 大處室／學院實戰情境與一鍵複製咒語
// ============================================================================
function selectScenarioPrompt(idx) {
  currentScenarioIdx = idx;
  renderScenarioPrompts();
}

function renderScenarioPrompts() {
  const tabsBox = document.getElementById("scenario-tabs");
  const detailBox = document.getElementById("scenario-detail");
  if (!tabsBox || !detailBox) return;

  tabsBox.innerHTML = SCENARIO_PROMPTS.map((s, idx) => {
    const active = idx === currentScenarioIdx;
    return `
      <button onclick="selectScenarioPrompt(${idx})"
        class="p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
          active
            ? "bg-blue-600 text-white border-blue-500 shadow-lg"
            : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
        }">
        <span class="text-2xl shrink-0">${s.icon}</span>
        <div class="min-w-0">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
            active ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-600"
          }">${s.unitBadge}</span>
          <div class="font-black text-xs sm:text-sm mt-1 leading-snug">${s.title}</div>
        </div>
      </button>
    `;
  }).join("");

  const cur = SCENARIO_PROMPTS[currentScenarioIdx];
  detailBox.innerHTML = `
    <div class="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-xl space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl">${cur.icon}</span>
          <div>
            <span class="text-xs font-bold text-amber-300">${cur.unitBadge}</span>
            <h4 class="text-lg sm:text-xl font-black text-white">${cur.title}</h4>
          </div>
        </div>
        <button onclick="copyPromptText()"
          id="btn-copy-prompt"
          class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-1.5">
          <span>📋</span>
          <span>一鍵複製這段對話咒語</span>
        </button>
      </div>

      <div class="text-xs sm:text-sm text-slate-300 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
        😫 <strong>過去的行政痛點：</strong>${cur.painPoint}
      </div>

      <!-- 可複製咒語框 -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-emerald-300">💬 直接複製以下這段話貼給 AI（括號內文字可改成你的會議名稱）：</span>
          <span id="copy-toast" class="hidden text-amber-300 font-bold">✅ 已複製到剪貼簿！</span>
        </div>
        <div id="active-prompt-box" class="p-4 rounded-xl bg-slate-950 border-2 border-emerald-500/40 font-mono-code text-xs sm:text-sm text-emerald-100 leading-relaxed select-all">
          ${cur.promptText}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
        <div class="md:col-span-7 bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div class="text-xs font-bold text-sky-300">🤖 貼上後，技能包會自動幫你做這 3 件事：</div>
          <ol class="space-y-1.5 text-xs text-slate-200 list-decimal list-inside">
            ${cur.aiSteps.map(step => `<li class="leading-relaxed">${step}</li>`).join("")}
          </ol>
        </div>
        <div class="md:col-span-5 bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
          <div class="text-xs font-bold text-amber-300">📦 你會拿到的標準交付物：</div>
          <ul class="space-y-1.5 text-xs text-slate-200">
            ${cur.deliverables.map(d => `<li class="flex items-center gap-1.5"><span class="text-emerald-400">✔</span><code class="text-amber-200">${d}</code></li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function copyPromptText() {
  const cur = SCENARIO_PROMPTS[currentScenarioIdx];
  if (!cur) return;
  navigator.clipboard.writeText(cur.promptText).then(() => {
    const toast = document.getElementById("copy-toast");
    const btn = document.getElementById("btn-copy-prompt");
    if (toast) toast.classList.remove("hidden");
    if (btn) btn.innerHTML = `<span>✅</span><span>已複製成功！直接貼給 AI 即可</span>`;
    setTimeout(() => {
      if (toast) toast.classList.add("hidden");
      if (btn) btn.innerHTML = `<span>📋</span><span>一鍵複製這段對話咒語</span>`;
    }, 2600);
  });
}

// ============================================================================
// 區塊 6：9 大產品設計鐵律 ＆ 7 題新手驗收互動問答
// ============================================================================
function renderPrinciplesAndQuiz() {
  const pBox = document.getElementById("principles-grid");
  if (pBox) {
    pBox.innerHTML = PRODUCT_PRINCIPLES.map(
      p => `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all">
        <div class="flex items-center gap-2.5 mb-2">
          <span class="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 font-mono-code font-black text-xs flex items-center justify-center shrink-0">${p.num}</span>
          <h5 class="font-black text-slate-900 text-sm">${p.title}</h5>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${p.desc}</p>
      </div>
    `
    ).join("");
  }

  const qBox = document.getElementById("acceptance-quiz-list");
  if (qBox) {
    qBox.innerHTML = ACCEPTANCE_QUIZ.map(
      (q, idx) => `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button onclick="toggleQuizAnswer(${idx})"
          class="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
          <div class="flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">Q${q.qNum}</span>
            <div>
              <div class="font-black text-slate-900 text-sm sm:text-base">${q.question}</div>
              <div class="text-xs text-slate-500 mt-0.5">💡 提示：${q.shortHint}</div>
            </div>
          </div>
          <span id="quiz-arrow-${idx}" class="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
            看解答 ▼
          </span>
        </button>
        <div id="quiz-ans-${idx}" class="hidden px-4 pb-4 pt-2 bg-emerald-50/70 border-t border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <strong class="text-emerald-800">✅ 清楚解答：</strong>${q.answer}
        </div>
      </div>
    `
    ).join("");
  }
}

function toggleQuizAnswer(idx) {
  const ans = document.getElementById(`quiz-ans-${idx}`);
  const arrow = document.getElementById(`quiz-arrow-${idx}`);
  if (!ans) return;
  const isHidden = ans.classList.contains("hidden");
  if (isHidden) {
    ans.classList.remove("hidden");
    if (arrow) {
      arrow.textContent = "收合 ▲";
      arrow.className = "px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0";
    }
  } else {
    ans.classList.add("hidden");
    if (arrow) {
      arrow.textContent = "看解答 ▼";
      arrow.className = "px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold shrink-0";
    }
  }
}
