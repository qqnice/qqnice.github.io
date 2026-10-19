// ============================================================================
// 10 個 AI 打工仔：招生行政自動化高互動指南 - 互動邏輯控制器 (app.js)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const data = window.WORKFLOW_DATA;

  // 狀態管理
  let currentSkillIndex = 0;
  let learnedSkills = new Set(JSON.parse(localStorage.getItem("learnedSkills_v1") || "[0]"));
  let checkedPrereqs = new Set(JSON.parse(localStorage.getItem("checkedPrereqs_v1") || "[]"));
  let currentWarRoomMode = "modeA";
  let currentPrivacyView = "private"; // 'private' | 'stranger' | 'boss'
  let currentFileIndex = 0;
  let currentTheaterRound = 0;
  let currentWaitCategory = "全部";

  // --------------------------------------------------------------------------
  // 工具函式：複製文字與 Toast 提示
  // --------------------------------------------------------------------------
  window.copyTextToClipboard = function (text, label = "指令咒語") {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`✅ 已複製「${label}」！可直接貼給 AI 使用`);
    }).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast(`✅ 已複製「${label}」！`);
    });
  };

  function showToast(msg) {
    const toast = document.getElementById("global-toast");
    const toastMsg = document.getElementById("global-toast-msg");
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-enter");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.classList.remove("toast-enter");
      toast.classList.add("toast-hidden");
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // 1. 渲染「前置作業：上工前裝備檢查站」
  // --------------------------------------------------------------------------
  function renderPrereqSection() {
    const listContainer = document.getElementById("prereq-checklist-container");
    const progressText = document.getElementById("prereq-progress-text");
    const progressBar = document.getElementById("prereq-progress-bar");
    if (!listContainer) return;

    const total = data.prereqChecklist.length;
    const doneCount = checkedPrereqs.size;
    const pct = Math.round((doneCount / total) * 100);

    progressText.textContent = `已完成 ${doneCount} / ${total} 項 (${pct}%)`;
    progressBar.style.width = `${pct}%`;

    listContainer.innerHTML = data.prereqChecklist.map((item) => {
      const isChecked = checkedPrereqs.has(item.id);
      return `
        <div onclick="togglePrereq('${item.id}')" 
             class="cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
               isChecked
                 ? "bg-emerald-50/70 border-emerald-400 shadow-sm"
                 : "bg-white border-slate-200 hover:border-blue-300"
             }">
          <div class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm border transition-colors ${
            isChecked
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-slate-50 border-slate-300 text-transparent"
          }">✓</div>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">${item.category}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">${item.tag}</span>
              <h4 class="font-bold text-slate-900 ${isChecked ? "line-through text-slate-500" : ""}">${item.title}</h4>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${item.desc}</p>
            <div class="mt-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200/70 inline-block">
              💡 提醒：${item.tip}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  window.togglePrereq = function (id) {
    if (checkedPrereqs.has(id)) {
      checkedPrereqs.delete(id);
    } else {
      checkedPrereqs.add(id);
    }
    localStorage.setItem("checkedPrereqs_v1", JSON.stringify([...checkedPrereqs]));
    renderPrereqSection();
  };

  window.checkAllPrereqs = function () {
    if (checkedPrereqs.size === data.prereqChecklist.length) {
      checkedPrereqs.clear();
    } else {
      data.prereqChecklist.forEach((i) => checkedPrereqs.add(i.id));
    }
    localStorage.setItem("checkedPrereqs_v1", JSON.stringify([...checkedPrereqs]));
    renderPrereqSection();
  };

  // 渲染「四種身分要分清楚」與「檔案樹探索器」
  function renderIdentitiesAndFileTree() {
    const idContainer = document.getElementById("four-identities-container");
    if (idContainer) {
      idContainer.innerHTML = data.fourIdentities.map((item) => `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover-lift">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="text-2xl">${item.icon}</span>
            <h4 class="font-bold text-slate-900 text-sm">${item.role}</h4>
          </div>
          <p class="text-xs text-slate-600 mb-2.5"><strong>這是誰：</strong>${item.meaning}</p>
          <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <strong>⚠️ 防呆鐵律：</strong>${item.trap}
          </div>
        </div>
      `).join("");
    }

    const matContainer = document.getElementById("workspace-materials-tbody");
    if (matContainer) {
      matContainer.innerHTML = data.workspaceMaterials.map((m) => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80">
          <td class="py-2.5 px-3 font-bold text-slate-800 text-xs">${m.item}</td>
          <td class="py-2.5 px-3 text-slate-600 text-xs">${m.usage}</td>
          <td class="py-2.5 px-3 text-emerald-700 font-medium text-xs">${m.fallback}</td>
        </tr>
      `).join("");
    }

    renderFileTree();
  }

  function renderFileTree() {
    const listEl = document.getElementById("file-tree-list");
    const detailEl = document.getElementById("file-tree-detail");
    if (!listEl || !detailEl) return;

    listEl.innerHTML = data.fileTreeItems.map((item, idx) => {
      const iconMap = { folder: "📁", json: "🧩", doc: "📄", web: "🌐", mail: "✉️", excel: "📊", pdf: "📕" };
      const isActive = idx === currentFileIndex;
      return `
        <div onclick="selectFileTreeItem(${idx})" 
             class="file-tree-item px-3 py-2 rounded-lg text-xs flex items-center justify-between ${isActive ? "active text-blue-900" : "text-slate-700"}">
          <div class="flex items-center gap-2 truncate">
            <span>${iconMap[item.type] || "📄"}</span>
            <span class="font-mono-code truncate">${item.path}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">${item.stage}</span>
        </div>
      `;
    }).join("");

    const activeItem = data.fileTreeItems[currentFileIndex];
    detailEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
        <div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">${activeItem.stage}</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 ml-1">${activeItem.badge}</span>
        </div>
        <span class="text-xs text-slate-400">點擊左側檔案可切換說明</span>
      </div>
      <h4 class="font-mono-code font-bold text-base text-slate-900 mb-2">${activeItem.path}</h4>
      <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">${activeItem.desc}</p>
      <div class="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-medium">
        <span>💡 跨電腦交接秘訣：</span>
        <span>只要把整個專案資料夾同步到雲端硬碟，換電腦開同一資料夾呼叫 @activityagent 就能無縫接續！</span>
      </div>
    `;
  }

  window.selectFileTreeItem = function (idx) {
    currentFileIndex = idx;
    renderFileTree();
  };

  // --------------------------------------------------------------------------
  // 2. 渲染「戰情表 A/B/C 三階段進化 ＆ 7 大行政檢核 ＆ 隱私分享模擬器」
  // --------------------------------------------------------------------------
  function renderWarRoomSimulator() {
    const modeData = data.warRoomModes[currentWarRoomMode];
    if (!modeData) return;

    // 更新按鈕狀態
    ["modeA", "modeB", "modeC"].forEach((m) => {
      const btn = document.getElementById(`btn-warroom-${m}`);
      if (btn) {
        if (m === currentWarRoomMode) {
          btn.className = "px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-emerald-600 text-white shadow-md transition-all";
        } else {
          btn.className = "px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all";
        }
      }
    });

    const container = document.getElementById("warroom-mode-content");
    if (container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <!-- 左側：該模式重點解說 -->
          <div class="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">${modeData.badge}</span>
              <h4 class="text-lg font-black text-slate-900 mb-2">${modeData.title}</h4>
              <p class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
                <strong class="text-slate-800">⏰ 啟動時機：</strong>${modeData.when}
              </p>
              <div class="text-xs font-bold text-slate-800 mb-2">✨ 這一階段戰情表幫你做到什麼：</div>
              <ul class="space-y-2 text-xs text-slate-700">
                ${modeData.highlights.map((h) => `<li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">✔</span><span>${h}</span></li>`).join("")}
              </ul>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">CreateSite 在全流程會出場 3 次，永遠更新同一個網站！</span>
            </div>
          </div>

          <!-- 右側：擬真戰情表網頁預覽 -->
          <div class="lg:col-span-7 mockup-window flex flex-col">
            <div class="mockup-header justify-between">
              <div class="flex items-center gap-2">
                <div class="mockup-dots"><span class="bg-rose-400"></span><span class="bg-amber-400"></span><span class="bg-emerald-400"></span></div>
                <span class="font-mono-code text-[11px] bg-white px-2.5 py-0.5 rounded border border-slate-200 text-slate-600 truncate max-w-xs sm:max-w-md">${modeData.urlText}</span>
              </div>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">${modeData.statusText}</span>
            </div>
            <div class="p-4 sm:p-5 bg-slate-900 text-white flex-1 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div class="text-[11px] text-emerald-400 font-mono-code">代號：EVT-20261219-001</div>
                  <div class="text-base font-bold">🎓 1151219 高雄高商大學博覽會・招生戰情表</div>
                </div>
                <div class="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  承辦窗口：招生處 QQnice (#1234)
                </div>
              </div>

              <!-- 四格即時指標 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div class="bg-slate-800/90 p-3 rounded-lg border border-slate-700">
                  <div class="text-slate-400 text-[11px]">📝 Google 報名表短網址</div>
                  <div class="font-mono-code text-sky-300 mt-0.5 truncate">${modeData.stats.formLink}</div>
                </div>
                <div class="bg-slate-800/90 p-3 rounded-lg border border-slate-700">
                  <div class="text-slate-400 text-[11px]">📊 回覆試算表 (Sheet) 狀態</div>
                  <div class="font-mono-code text-emerald-300 mt-0.5 truncate">${modeData.stats.sheetLink}</div>
                </div>
                <div class="bg-slate-800/90 p-3 rounded-lg border border-slate-700">
                  <div class="text-slate-400 text-[11px]">👥 有效報名人數統計</div>
                  <div class="font-bold text-amber-300 mt-0.5">${modeData.stats.regCount}</div>
                </div>
                <div class="bg-slate-800/90 p-3 rounded-lg border border-slate-700">
                  <div class="text-slate-400 text-[11px]">🏫 全校教學單位母表對照</div>
                  <div class="font-bold text-purple-300 mt-0.5">${modeData.stats.deptStatus}</div>
                </div>
              </div>

              <!-- 7項行政檢核預覽條 -->
              <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div class="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>✅ 戰情表內建「7 項行政檢核」狀態（隨進度推進，不洗掉歷史勾選）：</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  ${data.sevenChecklists.map((chk, idx) => {
                    const done = modeData.checks[idx];
                    return `
                      <div class="px-2.5 py-1.5 rounded flex items-center gap-2 ${done ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-slate-900/60 text-slate-400 border border-slate-800"}">
                        <span>${done ? "☑️" : "⬜"}</span>
                        <span class="truncate">${chk.num}. ${chk.title}</span>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 渲染下方 7 項行政檢核詳細卡片
    const chkContainer = document.getElementById("seven-checklists-grid");
    if (chkContainer) {
      chkContainer.innerHTML = data.sevenChecklists.map((c) => `
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">${c.num}</span>
            <h5 class="font-bold text-slate-900 text-xs sm:text-sm">${c.title}</h5>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed pl-8">${c.rule}</p>
        </div>
      `).join("");
    }
  }

  window.switchWarRoomMode = function (mode) {
    currentWarRoomMode = mode;
    renderWarRoomSimulator();
  };

  // --------------------------------------------------------------------------
  // 3. 渲染「隱私保護 (owner-private) vs 分享給長官」互動模擬器
  // --------------------------------------------------------------------------
  function renderPrivacySimulator() {
    ["private", "stranger", "boss"].forEach((v) => {
      const btn = document.getElementById(`btn-privacy-${v}`);
      if (btn) {
        if (v === currentPrivacyView) {
          btn.className = "px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 text-white shadow-md transition-all";
        } else {
          btn.className = "px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all";
        }
      }
    });

    const stage = document.getElementById("privacy-simulator-stage");
    if (!stage) return;

    if (currentPrivacyView === "private") {
      stage.innerHTML = `
        <div class="bg-slate-800/90 border-2 border-emerald-500/60 rounded-2xl p-5 text-white">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">👩‍💻</span>
              <div>
                <div class="font-bold text-emerald-300 text-base">視角 1：承辦人自己登入查看（預設狀態：owner-private）</div>
                <div class="text-xs text-slate-300">戰情表發布後，預設只有「你本人的帳號」看得到，保有 100% 隱私權！</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">🔒 權限：owner-private (預設僅自己可見)</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div class="font-bold text-sky-300 mb-1">✔ 安心測試與打草稿</div>
              <p class="text-slate-300 leading-relaxed">即使名單裡還有老師填暱稱（如 QQnice）或公文還沒上簽，也不用擔心被外人或別系誤點看到。</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div class="font-bold text-amber-300 mb-1">✔ 隨時隨地掌握進度</div>
              <p class="text-slate-300 leading-relaxed">你自己打開網址就能看到 7 項行政檢核做到哪、還有哪幾個系所沒報名，一步一步照表操課。</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <div class="font-bold text-emerald-300 mb-1">✔ 想給誰看、由你決定</div>
              <p class="text-slate-300 leading-relaxed">不需要公開給全世界！只有當你想讓特定人（例如處長、組長）知道進度時，才授權分享給他。</p>
            </div>
          </div>
        </div>
      `;
    } else if (currentPrivacyView === "stranger") {
      stage.innerHTML = `
        <div class="bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 text-center text-white">
          <div class="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-3xl mx-auto mb-3">🚫</div>
          <h4 class="text-lg font-bold text-rose-300 mb-1">視角 2：未獲授權的其他人／路人點開網址</h4>
          <p class="text-xs text-slate-300 max-w-xl mx-auto mb-4">
            因為戰情表與成果網站預設皆為 <code class="text-amber-300 font-mono-code">access: "owner-private"</code>，就算別人不小心猜到網址，也完全看不到任何內容！
          </p>
          <div class="max-w-md mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono-code text-xs text-slate-400">
            🔒 403 Private Site — 此網站為私人專屬（Owner-Private），僅擁有者或已獲授權之特定人員可檢視。
          </div>
        </div>
      `;
    } else {
      stage.innerHTML = `
        <div class="bg-slate-800/90 border-2 border-amber-400 rounded-2xl p-5 text-white">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">👔</span>
              <div>
                <div class="font-bold text-amber-300 text-base">視角 3：把戰情表分享給長官（長官一打開就看懂全局！）</div>
                <div class="text-xs text-slate-300">長官問：「高雄高商那場現在辦到哪了？」你不用重做簡報，把戰情表分享給長官，長官直接看到這畫面：</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">✨ 特定授權分享：長官專屬進度視角</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <div class="text-slate-400 mb-1">📌 長官一眼看到：整體檢核進度</div>
              <div class="text-base font-black text-emerald-400 mb-1">已完成 5 / 7 項行政檢核</div>
              <div class="text-[11px] text-slate-300">☑ 群組信已發 ☑ 名單已核對 ☑ 公文已上簽 ☑ 行前通知已寄 ⏳ 等待活動成果回收</div>
            </div>
            <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <div class="text-slate-400 mb-1">📌 長官一眼看到：各系參與狀況</div>
              <div class="text-base font-black text-sky-400 mb-1">已報名 3 系 ／ 未報名 21 系</div>
              <div class="text-[11px] text-slate-300">透過全校教學單位母表自動對照，哪個系已經派老師、哪個系還沒動靜清清楚楚。</div>
            </div>
            <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <div class="text-slate-400 mb-1">📌 長官一眼看到：最後更新時間</div>
              <div class="text-base font-black text-amber-300 mb-1">快照時間誠實標示</div>
              <div class="text-[11px] text-slate-300">清楚顯示最後一次 Excel 下載與驗證時間，有憑有據，承辦人省下 90% 口頭回報時間！</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.switchPrivacyView = function (view) {
    currentPrivacyView = view;
    renderPrivacySimulator();
  };

  // --------------------------------------------------------------------------
  // 4. 渲染「10 個打工仔一步一步互動進度條 ＆ 示意圖」 (核心要求 1 & 2)
  // --------------------------------------------------------------------------
  function renderSkillStepper() {
    const navContainer = document.getElementById("skill-stepper-nav");
    const detailContainer = document.getElementById("skill-stepper-detail");
    const overallProgressBar = document.getElementById("skill-overall-progress-bar");
    const overallProgressText = document.getElementById("skill-overall-progress-text");
    if (!navContainer || !detailContainer) return;

    const totalSkills = data.skills.length;
    const learnedCount = learnedSkills.size;
    const learnedPct = Math.round((learnedCount / totalSkills) * 100);
    if (overallProgressBar) overallProgressBar.style.width = `${learnedPct}%`;
    if (overallProgressText) overallProgressText.textContent = `已探索掌握 ${learnedCount} / ${totalSkills} 個打工仔 (${learnedPct}%)`;

    // 渲染 10 個進度節點按鈕
    navContainer.innerHTML = data.skills.map((s, idx) => {
      const isActive = idx === currentSkillIndex;
      const isLearned = learnedSkills.has(idx);
      return `
        <button onclick="selectSkillStep(${idx})"
                class="step-node text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? "active bg-blue-600 text-white border-blue-600"
                    : isLearned
                    ? "bg-emerald-50/90 text-slate-800 border-emerald-300 hover:border-blue-400"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                }">
          <div class="flex items-center justify-between w-full mb-1">
            <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
              isActive
                ? "bg-blue-800 text-blue-100"
                : isLearned
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600"
            }">${s.code}</span>
            <span class="text-lg">${s.avatar}</span>
          </div>
          <div class="font-bold text-xs truncate w-full">${s.name}</div>
          <div class="text-[11px] truncate w-full ${isActive ? "text-blue-100" : "text-slate-500"}">${s.persona.split("（")[0]}</div>
        </button>
      `;
    }).join("");

    // 渲染當前選中的 Skill 完整內容與示意圖
    const skill = data.skills[currentSkillIndex];
    const isCurrentLearned = learnedSkills.has(currentSkillIndex);
    const prevIdx = currentSkillIndex > 0 ? currentSkillIndex - 1 : null;
    const nextIdx = currentSkillIndex < totalSkills - 1 ? currentSkillIndex + 1 : null;

    detailContainer.innerHTML = `
      <div class="bg-white rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden">
        <!-- 頂部角色橫幅 -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                ${skill.avatar}
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-amber-500 text-slate-950">${skill.code}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono-code bg-blue-500/30 text-blue-200 border border-blue-400/30">@${skill.id}</span>
                  <span class="text-xs text-emerald-300 font-semibold">✦ ${skill.persona}</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black tracking-tight">${skill.name}</h3>
                <p class="text-xs sm:text-sm text-slate-300 mt-1">${skill.tagline}</p>
              </div>
            </div>

            <!-- 上一步 / 標記讀懂 / 下一步 -->
            <div class="flex items-center gap-2 shrink-0">
              <button ${prevIdx === null ? "disabled" : `onclick="selectSkillStep(${prevIdx})"`}
                      class="px-3 py-2 rounded-xl text-xs font-bold border border-white/20 ${
                        prevIdx === null ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
                      }">◀ 上一步</button>
              <button onclick="toggleSkillLearned(${currentSkillIndex})"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrentLearned
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "bg-white/15 text-white hover:bg-white/25 border border-white/30"
                      }">
                ${isCurrentLearned ? "✓ 已讀懂這一步" : "○ 標記已讀懂"}
              </button>
              <button ${nextIdx === null ? "disabled" : `onclick="selectSkillStep(${nextIdx})"`}
                      class="px-3 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow ${
                        nextIdx === null ? "opacity-40 cursor-not-allowed" : ""
                      }">下一步 ▶</button>
            </div>
          </div>
        </div>

        <div class="p-5 sm:p-6 space-y-6">
          <!-- 區塊 1：這一步完成後可以達成什麼？（具體成果與價值） -->
          <div class="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5">
            <div class="flex items-center gap-2 text-emerald-950 font-black text-sm sm:text-base mb-3">
              <span class="text-xl">🎯</span>
              <span>這一步完成後，你可以達成什麼？（具體產出與省力成果）</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              ${skill.whatYouGet.map((item, i) => `
                <div class="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm flex items-start gap-2.5">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span>
                  <span class="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">${item}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 區塊 2：互動視覺示意圖（幫助理解這一步具體在做什麼） -->
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                <span class="text-xl">🖼️</span>
                <span>步驟運作示意圖（一眼看懂打工仔怎麼幫你做事）</span>
              </div>
              <span class="text-xs text-slate-500">視覺化流程拆解</span>
            </div>
            ${skill.diagramHtml}
          </div>

          <!-- 區塊 3：具體執行步驟 ＆ 安全護欄（AI 做什麼 vs 真人把關什麼） -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <!-- 左：標準執行細節 -->
            <div class="lg:col-span-7 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div class="font-black text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
                <span>⚙️</span>
                <span>打工仔的標準執行順序與細節</span>
              </div>
              <ol class="space-y-2.5 text-xs sm:text-sm text-slate-700">
                ${skill.executionSteps.map((st, idx) => `
                  <li class="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80">
                    <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono-code font-bold text-xs shrink-0">0${idx + 1}</span>
                    <span class="leading-relaxed">${st}</span>
                  </li>
                `).join("")}
              </ol>
            </div>

            <!-- 右：AI vs 真人把關與絕不犯的錯 -->
            <div class="lg:col-span-5 space-y-3">
              <div class="bg-blue-50/80 p-4 rounded-xl border border-blue-200">
                <div class="font-bold text-blue-950 text-xs sm:text-sm mb-1">🤖 AI 自動幫你代勞：</div>
                <p class="text-xs text-slate-700 leading-relaxed">${skill.guardrails.aiDoes}</p>
              </div>
              <div class="bg-amber-50/90 p-4 rounded-xl border border-amber-300">
                <div class="font-bold text-amber-950 text-xs sm:text-sm mb-1">👩‍💼 承辦人（你）只需拍板確認：</div>
                <p class="text-xs text-slate-700 leading-relaxed">${skill.guardrails.humanDoes}</p>
              </div>
              <div class="bg-rose-50/90 p-4 rounded-xl border border-rose-300">
                <div class="font-bold text-rose-950 text-xs sm:text-sm mb-1">🛡️ 絕對遵守的安全鐵律（絕不越權）：</div>
                <p class="text-xs text-rose-900 leading-relaxed font-medium">${skill.guardrails.neverDo}</p>
              </div>
            </div>
          </div>

          <!-- 區塊 4：一鍵複製對話咒語 -->
          <div class="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div class="font-bold text-sm text-amber-300 flex items-center gap-2">
                <span>💬</span>
                <span>這一步你可以直接對 AI 這樣說（點擊即可複製咒語）：</span>
              </div>
              <span class="text-[11px] text-slate-400">小撇步：已知資料 AI 會自動沿用，是非題會給你選項按鈕，不用辛苦重打字！</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${skill.prompts.map((p) => `
                <div class="bg-slate-800 p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-sky-300 mb-1">${p.label}</div>
                    <p class="text-xs text-slate-200 font-mono-code leading-relaxed">「${p.text}」</p>
                  </div>
                  <button onclick="copyTextToClipboard('${p.text.replace(/'/g, "\\'")}', '${p.label}')"
                          class="self-end px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors">
                    📋 複製這句話
                  </button>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.selectSkillStep = function (idx) {
    currentSkillIndex = idx;
    learnedSkills.add(idx);
    localStorage.setItem("learnedSkills_v1", JSON.stringify([...learnedSkills]));
    renderSkillStepper();
  };

  window.toggleSkillLearned = function (idx) {
    if (learnedSkills.has(idx)) {
      learnedSkills.delete(idx);
    } else {
      learnedSkills.add(idx);
    }
    localStorage.setItem("learnedSkills_v1", JSON.stringify([...learnedSkills]));
    renderSkillStepper();
  };

  // --------------------------------------------------------------------------
  // 5. 渲染「高雄高商 5 回合實戰劇場」
  // --------------------------------------------------------------------------
  function renderTheater() {
    const tabsEl = document.getElementById("theater-round-tabs");
    const contentEl = document.getElementById("theater-round-content");
    if (!tabsEl || !contentEl) return;

    tabsEl.innerHTML = data.theaterRounds.map((r, idx) => {
      const active = idx === currentTheaterRound;
      return `
        <button onclick="selectTheaterRound(${idx})"
                class="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  active
                    ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                }">
          第 ${r.round} 回合
        </button>
      `;
    }).join("");

    const round = data.theaterRounds[currentTheaterRound];
    contentEl.innerHTML = `
      <div class="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 sm:p-6 text-white">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4 mb-4">
          <div>
            <div class="text-xs font-bold text-amber-400 mb-1">${round.subtitle}</div>
            <h4 class="text-lg sm:text-xl font-black">${round.title}</h4>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${round.skillsUsed.map((s) => `<span class="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono-code">${s}</span>`).join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <!-- 承辦人說 -->
          <div class="lg:col-span-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div class="flex items-center gap-2 text-sky-300 font-bold text-xs mb-2">
              <span class="text-lg">👩‍💼</span>
              <span>承辦人（你）對 AI 說：</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              ${round.userSays}
            </p>
          </div>

          <!-- AI 執行 -->
          <div class="lg:col-span-8 bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div class="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-2">
              <span class="text-lg">🤖</span>
              <span>打工仔團隊自動幫你完成：</span>
            </div>
            <ul class="space-y-2 text-xs sm:text-sm text-slate-200">
              ${round.aiActions.map((act) => `
                <li class="flex items-start gap-2">
                  <span class="text-emerald-400 font-bold mt-0.5">✔</span>
                  <span>${act}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>

        <div class="mt-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-medium">
          ${round.stopState}
        </div>
      </div>
    `;
  }

  window.selectTheaterRound = function (idx) {
    currentTheaterRound = idx;
    renderTheater();
  };

  // --------------------------------------------------------------------------
  // 6. 渲染「15 個等待點速查表」
  // --------------------------------------------------------------------------
  function renderWaitStatesTable() {
    const filterEl = document.getElementById("wait-states-filter");
    const tbodyEl = document.getElementById("wait-states-tbody");
    if (!filterEl || !tbodyEl) return;

    const categories = ["全部", "初期建檔與工具", "表單與群組信", "報名與公文簽核", "行前通知與成果"];
    filterEl.innerHTML = categories.map((cat) => `
      <button onclick="filterWaitStates('${cat}')"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cat === currentWaitCategory
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }">
        ${cat}
      </button>
    `).join("");

    const filtered = currentWaitCategory === "全部"
      ? data.waitStates
      : data.waitStates.filter((w) => w.category === currentWaitCategory);

    tbodyEl.innerHTML = filtered.map((w) => `
      <tr class="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
        <td class="py-3 px-3 text-xs">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold block w-fit mb-1">${w.category}</span>
          <strong class="text-slate-900">${w.wait}</strong>
        </td>
        <td class="py-3 px-3 text-xs text-emerald-800 font-medium">✔ ${w.canDo}</td>
        <td class="py-3 px-3 text-xs text-rose-700 font-medium">🚫 ${w.cannotDo}</td>
        <td class="py-3 px-3 text-xs">
          <div class="flex items-center justify-between gap-2 bg-slate-100 px-2.5 py-1.5 rounded-lg font-mono-code text-slate-800">
            <span>${w.prompt}</span>
            <button onclick="copyTextToClipboard('${w.prompt.replace(/[「」]/g, "")}', '接續語句')"
                    class="text-blue-600 hover:text-blue-800 font-sans font-bold shrink-0">複製</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  window.filterWaitStates = function (cat) {
    currentWaitCategory = cat;
    renderWaitStatesTable();
  };

  // --------------------------------------------------------------------------
  // 7. 渲染「拆解我的行政工作」互動工作坊
  // --------------------------------------------------------------------------
  window.loadDeconstructTemplate = function (key) {
    const tpl = data.deconstructTemplates[key];
    if (!tpl) return;

    document.getElementById("dc-task-name").value = tpl.name.replace(/^[^\s]+\s/, "");
    document.getElementById("dc-task-goal").value = tpl.goal;
    document.getElementById("dc-init-data").value = tpl.initData;
    document.getElementById("dc-checklists").value = tpl.checklists.join("\n");
    document.getElementById("dc-wait-points").value = tpl.waitPoints.join("\n");
    document.getElementById("dc-outputs").value = tpl.outputs;

    generateCustomBlueprint();
  };

  window.generateCustomBlueprint = function () {
    const name = document.getElementById("dc-task-name")?.value.trim() || "未命名行政任務";
    const goal = document.getElementById("dc-task-goal")?.value.trim() || "";
    const initData = document.getElementById("dc-init-data")?.value.trim() || "";
    const checklists = (document.getElementById("dc-checklists")?.value || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const waitPoints = (document.getElementById("dc-wait-points")?.value || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const outputs = document.getElementById("dc-outputs")?.value.trim() || "";

    const previewEl = document.getElementById("dc-blueprint-preview");
    if (!previewEl) return;

    const generatedPrompt = `我要啟動一項新的行政自動化任務：「${name}」。
任務目標：${goal}
請依「先開戰情表、步步檢核、預設私密（owner-private）」的工作流引導我：
1. 先協助我建檔並確認以下基本資料：${initData}
2. 立即為我建立本機戰情表，內含以下行政檢核項目：${checklists.join("、")}
3. 在以下關鍵節點請務必停下來等我確認草稿或核對資料後再執行：${waitPoints.join("；")}
4. 預計最終產出：${outputs}。`;

    previewEl.innerHTML = `
      <div class="bg-slate-900 text-white p-5 rounded-2xl border-2 border-blue-500/40 shadow-lg space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🔒 預設 Owner-Private（分享長官才可見）</span>
            <h4 class="text-lg font-black text-white mt-1">🗂️ 【${name}】AI 戰情表＆打工仔任務藍圖</h4>
          </div>
          <button onclick="copyTextToClipboard(document.getElementById('dc-generated-prompt-raw').textContent, '專屬任務啟動咒語')"
                  class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow transition-all">
            📋 一鍵複製這套任務啟動咒語
          </button>
        </div>

        <p class="text-xs text-slate-300 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
          <strong class="text-sky-300">🎯 任務目標：</strong>${goal}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
            <div class="font-bold text-emerald-300 mb-2">🛡️ 戰情表檢核清單（一步一步掌握進度）：</div>
            <ul class="space-y-1.5 text-slate-200">
              ${checklists.map((c) => `<li class="flex items-center gap-2"><span>☑️</span><span>${c}</span></li>`).join("")}
            </ul>
          </div>
          <div class="space-y-3">
            <div class="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
              <div class="font-bold text-amber-300 mb-1.5">🛑 真人把關與等待點（AI 不越權）：</div>
              <ul class="space-y-1 text-slate-200">
                ${waitPoints.map((w) => `<li class="flex items-start gap-1.5"><span class="text-amber-400">•</span><span>${w}</span></li>`).join("")}
              </ul>
            </div>
            <div class="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
              <div class="font-bold text-purple-300 mb-1">📦 預計產出檔案與網站：</div>
              <p class="text-slate-300">${outputs}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div class="text-[11px] font-bold text-amber-300 mb-1">💬 自動產生的 AI 啟動咒語（可直接複製貼入 Codex）：</div>
          <pre id="dc-generated-prompt-raw" class="text-xs text-slate-300 whitespace-pre-wrap font-mono-code leading-relaxed">${generatedPrompt}</pre>
        </div>
      </div>
    `;
  };

  // 鍵盤左右鍵切換 10 個打工仔步驟
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    if (e.key === "ArrowRight" && currentSkillIndex < data.skills.length - 1) {
      window.selectSkillStep(currentSkillIndex + 1);
    } else if (e.key === "ArrowLeft" && currentSkillIndex > 0) {
      window.selectSkillStep(currentSkillIndex - 1);
    }
  });

  // 初始化所有模組
  renderPrereqSection();
  renderIdentitiesAndFileTree();
  renderWarRoomSimulator();
  renderPrivacySimulator();
  renderSkillStepper();
  renderTheater();
  renderWaitStatesTable();
  window.loadDeconstructTemplate("workshop");
});
