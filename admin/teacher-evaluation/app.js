// =====================================================================
// 透過 AI 協助我們整理評鑑資料的幫手｜高互動大字體導覽網站 互動邏輯 (app.js)
// =====================================================================

let currentStep = 1;
let activeCategory = 'all'; // 'all' | 'teaching' | 'research' | 'service'
let activeStatusFilter = 'all'; // 'all' | 'verified' | 'pending'
let searchQuery = '';
let showEmptySubitems = false;
let selectedEvidenceId = 'doc-ipas';
let droppedCandidateIndex = 0;
let activeExtensionKey = 'eval';

let voiceEnabled = true;
let isAutoTouring = false;
let autoTourTimer = null;
let audioCtx = null;

// ---------------------------------------------------------------------
// 1. 全站字體大小即時切換器（大字 100% / 特大 112% / 簡報超大 125%）
// ---------------------------------------------------------------------
function setFontScale(scaleStr) {
  document.documentElement.style.setProperty('--root-scale', scaleStr);
  const btnMap = {
    '100%': 'font-btn-normal',
    '112%': 'font-btn-large',
    '125%': 'font-btn-xlarge'
  };
  Object.entries(btnMap).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (key === scaleStr) {
      el.className = 'px-2.5 py-1 rounded-lg text-sm font-black bg-sky-400 text-slate-950 transition-all';
    } else {
      el.className = 'px-2.5 py-1 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all';
    }
  });
  playTechSound('scan');
}

// ---------------------------------------------------------------------
// 2. Web Audio API 科技音效合成器
// ---------------------------------------------------------------------
function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTechSound(type = 'scan') {
  const ctx = getAudioCtx();
  if (!ctx) return;

  if (type === 'scan') {
    const freqs = [520, 680, 880];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.045, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.055);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.06);
    });
  } else if (type === 'success') {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.065, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  } else if (type === 'alert') {
    const freqs = [740, 554.37];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.11);
    });
  }
}

// ---------------------------------------------------------------------
// 3. Web Speech API 中文語音導覽引擎
// ---------------------------------------------------------------------
function getBestChineseVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang === 'zh-TW' && (v.name.includes('Meijia') || v.name.includes('Google') || v.name.includes('Microsoft'))) ||
    voices.find(v => v.lang === 'zh-TW') ||
    voices.find(v => v.lang.startsWith('zh')) ||
    null
  );
}

function setSpeakingIndicator(active) {
  const wave = document.getElementById('speaking-wave');
  if (!wave) return;
  if (active) {
    wave.classList.remove('hidden');
    wave.classList.add('inline-flex');
  } else {
    wave.classList.add('hidden');
    wave.classList.remove('inline-flex');
  }
}

function speakText(text, onEndCallback = null, rate = 1.05, pitch = 1.0) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) setTimeout(onEndCallback, 2600);
    return;
  }
  window.speechSynthesis.cancel();

  if (!voiceEnabled) {
    setSpeakingIndicator(false);
    if (onEndCallback) setTimeout(onEndCallback, 2400);
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  const voice = getBestChineseVoice();
  if (voice) utter.voice = voice;
  utter.lang = 'zh-TW';
  utter.rate = rate;
  utter.pitch = pitch;

  utter.onstart = () => setSpeakingIndicator(true);
  utter.onend = () => {
    setSpeakingIndicator(false);
    if (onEndCallback) onEndCallback();
  };
  utter.onerror = () => {
    setSpeakingIndicator(false);
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utter);
}

function speakCurrentStep(force = false) {
  const stepObj = STEPS[currentStep - 1];
  if (!stepObj) return;
  if (force && !voiceEnabled) {
    voiceEnabled = true;
    updateVoiceToggleUI();
  }
  speakText(stepObj.voiceText);
}

function toggleVoiceEnabled() {
  voiceEnabled = !voiceEnabled;
  updateVoiceToggleUI();
  if (!voiceEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    setSpeakingIndicator(false);
  } else {
    speakCurrentStep(false);
  }
}

function updateVoiceToggleUI() {
  const icon = document.getElementById('voice-icon');
  const label = document.getElementById('voice-label');
  const btn = document.getElementById('btn-voice-toggle');
  if (voiceEnabled) {
    icon.textContent = '🔊';
    label.textContent = '語音：開啟';
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-500/50 text-sm sm:text-base font-bold text-sky-300 transition-all';
  } else {
    icon.textContent = '🔇';
    label.textContent = '語音：靜音';
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm sm:text-base font-bold text-slate-400 transition-all';
  }
}

// ---------------------------------------------------------------------
// 4. 六大章節互動步進器與 3D 視覺舞台連動
// ---------------------------------------------------------------------
function renderStepPills() {
  const container = document.getElementById('step-pills-container');
  if (!container) return;
  container.innerHTML = STEPS.map(s => {
    const isActive = s.step === currentStep;
    const isPast = s.step < currentStep;
    return `
      <button
        onclick="goToStep(${s.step})"
        class="group relative flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
          isActive
            ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-lg shadow-sky-500/25 scale-[1.02]'
            : isPast
            ? 'bg-slate-800/95 text-emerald-300 border-emerald-500/40 hover:bg-slate-800'
            : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800/70 hover:text-white'
        }"
      >
        <span class="text-2xl sm:text-3xl shrink-0">${s.icon}</span>
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-black uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}">
            CHAPTER ${s.step}
          </div>
          <div class="text-base sm:text-lg font-black truncate ${isActive ? 'text-slate-950' : 'text-white'}">
            ${s.shortTitle}
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function updateChapterPanelAnd3DStage() {
  const s = STEPS[currentStep - 1];
  if (!s) return;

  document.getElementById('banner-step-tag').textContent = s.tag;
  document.getElementById('banner-step-title').textContent = s.title;
  document.getElementById('banner-key-question').textContent = s.keyQuestion;
  document.getElementById('banner-voice-subtitle').textContent = `「${s.voiceText}」`;

  const pointsEl = document.getElementById('banner-summary-points');
  pointsEl.innerHTML = s.summaryPoints.map(pt => `
    <li class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 leading-relaxed">
      ${pt}
    </li>
  `).join('');

  document.getElementById('hw-state-source').textContent = s.sourceState;
  document.getElementById('hw-state-ai').textContent = s.aiState;
  document.getElementById('hw-state-warroom').textContent = s.warroomState;
  document.getElementById('ai-core-bubble-text').textContent = s.badgeCmd;

  const wireRead = document.getElementById('wire-read');
  const wireClassify = document.getElementById('wire-classify');
  const wireVerify = document.getElementById('wire-verify');

  const sourceHalo = document.getElementById('source-halo');
  const aiHalo = document.getElementById('ai-halo');
  const warroomHalo = document.getElementById('warroom-halo');

  const speechBg = document.getElementById('speech-box-bg');
  const speechBadge = document.getElementById('speech-box-badge');
  const speechLine1 = document.getElementById('speech-box-line1');
  const speechLine2 = document.getElementById('speech-box-line2');
  const warroomScreenTag = document.getElementById('warroom-screen-tag');

  [wireRead, wireClassify, wireVerify].forEach(w => {
    if (w) w.setAttribute('class', 'opacity-25');
  });
  sourceHalo.setAttribute('opacity', '0.15');
  aiHalo.setAttribute('opacity', '0.15');
  warroomHalo.setAttribute('opacity', '0.15');

  document.getElementById('hw-card-source').className = 'rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-ai').className = 'rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-warroom').className = 'rounded-2xl bg-slate-900/95 border border-slate-800 p-3.5 flex items-center gap-3 transition-all';

  if (currentStep === 1) {
    document.getElementById('hw-card-source').classList.add('glow-active-rose');
    sourceHalo.setAttribute('opacity', '0.5');
    warroomScreenTag.textContent = '⏳ 目標：讓每份平時成果在填報時都找得到';
    speechBg.setAttribute('stroke', '#fb7185');
    speechBadge.setAttribute('fill', '#fda4af');
    speechBadge.textContent = '🔍 一、動機發想：為什麼評鑑填報總是特別花時間？';
    speechLine1.textContent = '真正耗時的往往不只是填表，而是反覆尋找：「資料在哪？放哪個子項？」';
    speechLine2.textContent = '解法：把填報前的集中整理，融入平時累積，隨手交給 AI 歸位！';
  } else if (currentStep === 2) {
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    warroomHalo.setAttribute('opacity', '0.55');
    wireClassify.setAttribute('class', 'opacity-100 wire-flow');
    warroomScreenTag.textContent = '✨ 教學 / 研究 / 服務 三入口・單頁直覽';
    speechBg.setAttribute('stroke', '#34d399');
    speechBadge.setAttribute('fill', '#6ee7b7');
    speechBadge.textContent = '🧭 二、設計理念：分類依照學校制度，操作貼近日常';
    speechLine1.textContent = '只留「教學、研究、服務」三個入口，單頁看清全部子項與收錄成果；';
    speechLine2.textContent = '初期不算分，先把「資料歸位、附件可找、待確認標記」做好！';
    playTechSound('scan');
  } else if (currentStep === 3) {
    document.getElementById('hw-card-source').classList.add('glow-active-blue');
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    sourceHalo.setAttribute('opacity', '0.4');
    aiHalo.setAttribute('opacity', '0.55');
    wireRead.setAttribute('class', 'opacity-100 wire-flow-fast');
    wireVerify.setAttribute('class', 'opacity-100 wire-flow');
    warroomScreenTag.textContent = '🏗️ 教學32＋研究29＋服務40＝101個評估子項';
    speechBg.setAttribute('stroke', '#fbbf24');
    speechBadge.setAttribute('fill', '#fde68a');
    speechBadge.textContent = '🏗️ 三、開發過程：101 個評估子項 × 5 份佐證文件實測';
    speechLine1.textContent = '• 區分教師角色（參與研習 vs 擔任講者）｜• 辨識 iPAS 研習證書 ≠ 專業證照';
    speechLine2.textContent = '• 先建本機戰情表核對架構與附件，再透過 Sites 發布為私人網站！';
    playTechSound('alert');
  } else if (currentStep === 4) {
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    wireRead.setAttribute('class', 'opacity-100 wire-flow');
    wireClassify.setAttribute('class', 'opacity-100 wire-flow-fast');
    warroomScreenTag.textContent = '🔄 讀取內容 ➔ 對照子項 ➔ 建立紀錄 ➔ 更新網站';
    speechBg.setAttribute('stroke', '#38bdf8');
    speechBadge.setAttribute('fill', '#7dd3fc');
    speechBadge.textContent = '🔄 四、應用方式：把新資料交給 AI，4 步驟逐步累積成果';
    speechLine1.textContent = '支援三類瀏覽、關鍵字搜尋、「已有資料／待確認」篩選與附件下載；';
    speechLine2.textContent = '由老師交付資料後請 AI 執行（尚未自動監看資料夾或串接校方系統）。';
    playTechSound('scan');
  } else if (currentStep === 5) {
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    aiHalo.setAttribute('opacity', '0.5');
    warroomHalo.setAttribute('opacity', '0.5');
    wireVerify.setAttribute('class', 'opacity-100 wire-flow-fast');
    warroomScreenTag.textContent = '💎 分類理由 ＋ 原始附件 ＋ 待確認事項 一起保留';
    speechBg.setAttribute('stroke', '#10b981');
    speechBadge.setAttribute('fill', '#6ee7b7');
    speechBadge.textContent = '💎 五、應用價值：人提供制度標準 ➔ AI 建議分類 ➔ 人確認適用性';
    speechLine1.textContent = '對教師：平時成果易被看見，不明確文件提早確認，免除填報前焦慮；';
    speechLine2.textContent = '對行政：分類理由與原始附件一起保留，讓整理結果有依據、好查核！';
    playTechSound('success');
  } else if (currentStep === 6) {
    document.getElementById('hw-card-source').classList.add('glow-active-blue');
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    sourceHalo.setAttribute('opacity', '0.45');
    aiHalo.setAttribute('opacity', '0.45');
    warroomHalo.setAttribute('opacity', '0.55');
    wireRead.setAttribute('class', 'opacity-100 wire-flow');
    wireClassify.setAttribute('class', 'opacity-100 wire-flow');
    wireVerify.setAttribute('class', 'opacity-100 wire-flow');
    warroomScreenTag.textContent = '🚀 延伸至研習紀錄、計畫成果、活動佐證與訪視準備';
    speechBg.setAttribute('stroke', '#a855f7');
    speechBadge.setAttribute('fill', '#d8b4fe');
    speechBadge.textContent = '🚀 六、後續推廣方向：讓每一份成果都有位置、有附件、找得到';
    speechLine1.textContent = '從教師評鑑出發，延伸到研習紀錄、計畫成果、活動佐證與訪視準備；';
    speechLine2.textContent = '清楚區分「已完成功能、需人工確認事項、尚待開發的自動化能力」！';
    playTechSound('success');
  }
}

function goToStep(stepNum, shouldSpeak = true) {
  currentStep = Math.max(1, Math.min(6, stepNum));
  renderStepPills();
  updateChapterPanelAnd3DStage();
  if (shouldSpeak) {
    speakCurrentStep(false);
  }
}

function nextStep() {
  stopAutoTour();
  const next = currentStep < 6 ? currentStep + 1 : 1;
  goToStep(next, true);
}

function prevStep() {
  stopAutoTour();
  const prev = currentStep > 1 ? currentStep - 1 : 6;
  goToStep(prev, true);
}

function triggerQuickScenario(type) {
  stopAutoTour();
  if (type === 'ipas') {
    goToStep(3, false);
    selectEvidenceCard('doc-ipas', true);
    document.getElementById('sec-warroom-sim').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (type === 'speaker') {
    goToStep(3, false);
    selectEvidenceCard('doc-speaker', true);
    document.getElementById('sec-warroom-sim').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (type === 'drop') {
    goToStep(4, false);
    document.getElementById('sec-warroom-sim').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => simulateDropNewFile(), 450);
  }
}

// ---------------------------------------------------------------------
// 5. 實機級「教師評鑑資料戰情表」互動模擬器
// ---------------------------------------------------------------------
function renderCategoryTabs() {
  const container = document.getElementById('category-tabs-container');
  if (!container) return;

  const keys = ['all', 'teaching', 'research', 'service'];
  container.innerHTML = keys.map(k => {
    const stat = CATEGORY_STATS[k];
    const isActive = activeCategory === k;
    const itemsInCat = EVIDENCE_ITEMS.filter(item => k === 'all' || item.category === k);
    const verifiedCount = itemsInCat.filter(i => i.status === 'verified').length;
    const pendingCount = itemsInCat.filter(i => i.status === 'pending').length;

    return `
      <button
        onclick="setCategory('${k}')"
        class="p-4 rounded-2xl border-2 text-left transition-all ${
          isActive
            ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.01]'
            : 'bg-slate-950/85 border-slate-800 hover:border-slate-600'
        }"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>${stat.icon}</span>
            <span>${stat.name}</span>
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-sm font-black ${isActive ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-300'}">
            ${stat.totalSubitems} 個子項
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm font-bold mt-2">
          <span class="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ✅ 已有資料 ${verifiedCount} 筆
          </span>
          <span class="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ❓ 待確認 ${pendingCount} 筆
          </span>
        </div>
      </button>
    `;
  }).join('');
}

function renderStatusFilters() {
  const container = document.getElementById('status-filter-container');
  if (!container) return;

  const baseItems = EVIDENCE_ITEMS.filter(item => activeCategory === 'all' || item.category === activeCategory);
  const allCount = baseItems.length;
  const verifiedCount = baseItems.filter(i => i.status === 'verified').length;
  const pendingCount = baseItems.filter(i => i.status === 'pending').length;

  const filters = [
    { key: 'all', label: `全部收錄資料 (${allCount})` },
    { key: 'verified', label: `✅ 已有資料 (${verifiedCount})` },
    { key: 'pending', label: `❓ 待確認資料 (${pendingCount})` }
  ];

  container.innerHTML = filters.map(f => {
    const active = activeStatusFilter === f.key;
    return `
      <button
        onclick="setStatusFilter('${f.key}')"
        class="px-4 py-2 rounded-xl text-sm sm:text-base font-black transition-all ${
          active
            ? 'bg-sky-400 text-slate-950 shadow-md'
            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
        }"
      >
        ${f.label}
      </button>
    `;
  }).join('');
}

function setCategory(catKey) {
  activeCategory = catKey;
  const stat = CATEGORY_STATS[catKey];
  document.getElementById('current-category-banner').textContent =
    `${stat.icon} 目前檢視：${stat.name}（共 ${stat.totalSubitems} 個評估子項｜${stat.desc}）`;
  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  playTechSound('scan');
}

function setStatusFilter(statusKey) {
  activeStatusFilter = statusKey;
  renderStatusFilters();
  renderEvidenceCards();
  playTechSound('scan');
}

function handleSearchInput(val) {
  searchQuery = val.trim().toLowerCase();
  renderEvidenceCards();
}

function toggleEmptySubitems(checked) {
  showEmptySubitems = checked;
  renderEvidenceCards();
  playTechSound('scan');
}

function renderEvidenceCards() {
  const container = document.getElementById('evidence-cards-container');
  if (!container) return;

  const filtered = EVIDENCE_ITEMS.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchStatus = activeStatusFilter === 'all' || item.status === activeStatusFilter;
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.subitemTitle.toLowerCase().includes(searchQuery) ||
      item.subitemCode.toLowerCase().includes(searchQuery) ||
      item.summaryNote.toLowerCase().includes(searchQuery) ||
      item.teacherRole.toLowerCase().includes(searchQuery);
    return matchCat && matchStatus && matchSearch;
  });

  if (filtered.length > 0 && !filtered.some(i => i.id === selectedEvidenceId)) {
    selectedEvidenceId = filtered[0].id;
  }

  let html = '';

  if (filtered.length === 0) {
    html += `
      <div class="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <div class="text-3xl">🔍</div>
        <div class="text-lg font-black text-white">沒有符合目前篩選條件的佐證資料</div>
        <p class="text-base text-slate-400">請切換上方「教學／研究／服務」類別或清除關鍵字搜尋。</p>
      </div>
    `;
  } else {
    html += filtered.map(item => {
      const isSelected = item.id === selectedEvidenceId;
      const isPending = item.status === 'pending';
      return `
        <div
          onclick="selectEvidenceCard('${item.id}', true)"
          class="cursor-pointer rounded-3xl p-5 border-2 transition-all ${
            isSelected
              ? 'bg-slate-800/95 border-sky-400 shadow-xl shadow-sky-500/15 scale-[1.01]'
              : 'bg-slate-950/90 border-slate-800 hover:border-slate-600'
          }"
        >
          <!-- 評估子項標題列 -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-lg text-sm font-black bg-slate-900 text-sky-300 border border-slate-700">
                ${item.subitemCode}
              </span>
              <span class="text-base sm:text-lg font-black text-slate-200">
                ${item.subitemTitle}
              </span>
            </div>
            <span class="px-3.5 py-1 rounded-full text-sm font-black border ${
              isPending
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
            }">
              ${item.statusLabel}
            </span>
          </div>

          <!-- 資料主標題 -->
          <h4 class="text-xl sm:text-2xl font-black text-white leading-snug mb-2">
            ${item.title}
          </h4>

          <!-- 活動日期 ＋ 教師角色 -->
          <div class="flex flex-wrap items-center gap-3 text-sm sm:text-base font-bold text-slate-300 mb-3">
            <span class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700">
              📅 活動日期：${item.eventDate}
            </span>
            <span class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-sky-200">
              🎭 教師角色：${item.teacherRole}
            </span>
          </div>

          <!-- 整理說明 -->
          <p class="text-base sm:text-lg text-slate-200 leading-relaxed mb-3">
            ${item.summaryNote}
          </p>

          <!-- 附件連結與操作列 -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-sm sm:text-base">
            <span class="text-emerald-300 font-bold flex items-center gap-1.5">
              <span>📎</span>
              <span class="underline underline-offset-4">${item.fileName}</span>
            </span>
            <span class="font-black ${isSelected ? 'text-sky-300' : 'text-slate-400'}">
              ${isSelected ? '👉 右側顯示 AI 4步驟判讀詳情' : '點擊檢視 AI 分類理由 ▶'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 若勾選「同頁顯示尚無資料子項」，展示單頁看清全部評估子項的效果
  if (showEmptySubitems) {
    const emptyList = EMPTY_SUBITEMS_SAMPLE.filter(
      e => activeCategory === 'all' || e.category === activeCategory
    );
    html += `
      <div class="pt-3">
        <div class="text-sm sm:text-base font-black text-slate-400 mb-2 px-1">
          📭 同頁直覽其他評估子項（尚無收錄資料之子項範例，免切換多層選單）：
        </div>
        <div class="space-y-2">
          ${emptyList.map(e => `
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <span class="px-2.5 py-0.5 rounded-md text-sm font-bold bg-slate-900 text-slate-400 border border-slate-800">
                  ${e.code}
                </span>
                <span class="text-base font-bold text-slate-300">${e.title}</span>
              </div>
              <span class="text-sm font-bold text-slate-500">目前已收錄 0 筆</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  renderAiInspectorPanel();
}

function selectEvidenceCard(id, shouldSpeak = false) {
  selectedEvidenceId = id;
  renderEvidenceCards();
  const item = EVIDENCE_ITEMS.find(i => i.id === id);
  if (!item) return;

  playTechSound(item.status === 'pending' ? 'alert' : 'scan');
  if (shouldSpeak) {
    const msg = `選取佐證文件：${item.title}。AI 判讀角色為「${item.teacherRole}」，歸入「${item.subitemCode} ${item.subitemTitle}」。${item.summaryNote}`;
    document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
    speakText(msg);
  }
}

function renderAiInspectorPanel() {
  const panel = document.getElementById('ai-inspector-panel');
  if (!panel) return;

  const item = EVIDENCE_ITEMS.find(i => i.id === selectedEvidenceId) || EVIDENCE_ITEMS[0];
  if (!item) return;

  const isPending = item.status === 'pending';

  panel.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span class="inline-flex items-center gap-1.5 text-sm font-black text-sky-400 uppercase tracking-wider">
            🤖 AI 整理幫手・4 步驟可追溯紀錄
          </span>
          <h4 class="text-xl font-black text-white mt-1 leading-snug">
            ${item.title}
          </h4>
        </div>
      </div>

      <!-- 若有容易誤判的錯誤子項對照（如 iPAS 或 講者角色），醒目顯示防呆提醒 -->
      ${item.wrongSubitemTitle ? `
        <div class="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-sm sm:text-base">
          <div class="font-black text-rose-300">🚫 AI 幫你避開的常見誤放子項：</div>
          <div class="text-slate-200 line-through mt-0.5">${item.wrongSubitemTitle}</div>
        </div>
      ` : ''}

      <!-- 4 步驟判讀詳情 -->
      <div class="space-y-2.5 text-base">
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-sm font-black text-sky-300 mb-1">1️⃣ 讀取內容（主題・日期・角色）</div>
          <p class="text-slate-200 leading-relaxed">${item.aiSteps.step1Read}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-sm font-black text-amber-300 mb-1">2️⃣ 對照 101 子項與分類理由</div>
          <p class="text-slate-200 leading-relaxed">${item.aiSteps.step2Match}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-sm font-black text-emerald-300 mb-1">3️⃣ 建立紀錄 ＆ 4️⃣ 更新網站</div>
          <p class="text-slate-200 leading-relaxed">${item.aiSteps.step4Update}</p>
        </div>
      </div>

      <!-- 人工確認與待確認事項區塊 -->
      <div class="p-4 rounded-2xl border-2 ${
        isPending
          ? 'bg-amber-950/40 border-amber-400/60'
          : 'bg-emerald-950/30 border-emerald-500/40'
      }">
        <div class="text-sm sm:text-base font-black ${isPending ? 'text-amber-300' : 'text-emerald-300'} mb-1">
          ${isPending ? '❓ 待人工確認事項（保留教師判斷空間）：' : '✅ 人工核對狀態：'}
        </div>
        <p class="text-base text-slate-200 leading-relaxed mb-3">
          ${item.pendingReason}
        </p>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            onclick="openAttachmentModal('${item.id}')"
            class="flex-1 px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-base text-center transition-all"
          >
            👁️ 開啟／下載原始附件
          </button>

          ${isPending ? `
            <button
              onclick="verifyPendingItem('${item.id}')"
              class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base text-center transition-all"
            >
              ✅ 我已確認歸類無誤
            </button>
          ` : `
            <button
              onclick="toggleBackToPending('${item.id}')"
              class="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all"
            >
              改標為待確認
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// 讓使用者親手點擊「我已確認歸類無誤」，體驗 AI 建議 + 人工拍板
function verifyPendingItem(id) {
  const item = EVIDENCE_ITEMS.find(i => i.id === id);
  if (!item) return;
  item.status = 'verified';
  item.statusLabel = '✅ 已有資料（教師已人工確認）';
  item.pendingReason = '👩‍🏫 教師已完成人工核對，確認歸入本評估子項無誤！';

  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  playTechSound('success');

  const msg = `太棒了！您已人工確認「${item.title}」的分類適用性，狀態已從「待確認」更新為「已有資料」！`;
  document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
  speakText(msg);
}

function toggleBackToPending(id) {
  const item = EVIDENCE_ITEMS.find(i => i.id === id);
  if (!item) return;
  item.status = 'pending';
  item.statusLabel = '❓ 待確認（人工標記覆核）';
  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  playTechSound('alert');
}

// 模擬把新取得的證明文件交給 AI 整理（對應第四節：應用方式 4 步驟）
function simulateDropNewFile() {
  stopAutoTour();
  if (droppedCandidateIndex >= NEW_DROP_CANDIDATES.length) {
    // 若兩份都已加入，直接聚焦最新加入的一筆並提示
    const lastAdded = NEW_DROP_CANDIDATES[NEW_DROP_CANDIDATES.length - 1];
    activeCategory = 'all';
    activeStatusFilter = 'all';
    selectedEvidenceId = lastAdded.id;
    renderCategoryTabs();
    renderStatusFilters();
    renderEvidenceCards();
    playTechSound('success');
    const msg = `新佐證檔案皆已加入戰情表！目前為您聚焦展示「${lastAdded.title}」。`;
    speakText(msg);
    return;
  }

  const newDoc = NEW_DROP_CANDIDATES[droppedCandidateIndex];
  droppedCandidateIndex += 1;
  EVIDENCE_ITEMS.unshift(newDoc);

  activeCategory = 'all';
  activeStatusFilter = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  selectedEvidenceId = newDoc.id;

  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  playTechSound('success');

  const btnLabel = document.getElementById('drop-btn-label');
  if (btnLabel) {
    btnLabel.textContent = droppedCandidateIndex < NEW_DROP_CANDIDATES.length
      ? '➕ 再模擬放入下一份新證明'
      : '✅ 已體驗新證明自動歸位！';
  }

  const msg = `模擬放入新文件：「${newDoc.title}」！AI 已完成四步驟：讀取內容、對照 101 子項、建立清楚標題與附件連結，並即時更新至戰情表！`;
  document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
  speakText(msg);
}

// 從第三節實驗室卡片點擊跳轉至模擬器對應檔案
function focusEvidenceFromLab(docId) {
  stopAutoTour();
  activeCategory = 'all';
  activeStatusFilter = 'all';
  selectedEvidenceId = docId;
  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  document.getElementById('sec-warroom-sim').scrollIntoView({ behavior: 'smooth', block: 'start' });
  selectEvidenceCard(docId, true);
}

// ---------------------------------------------------------------------
// 6. 原始附件預覽彈窗 (Modal)
// ---------------------------------------------------------------------
function openAttachmentModal(docId) {
  const item = EVIDENCE_ITEMS.find(i => i.id === docId);
  if (!item || !item.attachmentPreview) return;

  document.getElementById('modal-file-name').textContent = `📎 ${item.fileName} (${item.fileType})`;
  document.getElementById('modal-org').textContent = item.attachmentPreview.org;
  document.getElementById('modal-doc-title').textContent = item.attachmentPreview.docTitle;
  document.getElementById('modal-content').textContent = item.attachmentPreview.content;
  document.getElementById('modal-highlight').textContent = item.attachmentPreview.highlightWarn;

  const modal = document.getElementById('attachment-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  playTechSound('scan');
}

function closeAttachmentModal() {
  const modal = document.getElementById('attachment-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function simulateDownloadFile() {
  playTechSound('success');
  const item = EVIDENCE_ITEMS.find(i => i.id === selectedEvidenceId);
  const fileName = item ? item.fileName : '原始佐證附件.pdf';
  alert(`✅ 已開始下載原始佐證附件：\n\n📄 ${fileName}\n\n（實際使用時，點擊即可直接開啟或下載原始 PDF 檔案，供日後上傳校方評鑑系統使用！）`);
}

// ---------------------------------------------------------------------
// 7. 第六節：後續推廣方向 5 大行政延伸場景切換器 ＆ 複製提示詞
// ---------------------------------------------------------------------
function renderExtensionSection() {
  const tabsEl = document.getElementById('extension-tabs');
  const cardEl = document.getElementById('extension-detail-card');
  if (!tabsEl || !cardEl) return;

  tabsEl.innerHTML = EXTENSION_SCENARIOS.map(sc => {
    const active = sc.key === activeExtensionKey;
    return `
      <button
        onclick="selectExtensionScenario('${sc.key}')"
        class="px-4 py-2.5 rounded-2xl text-base font-black border transition-all flex items-center gap-2 ${
          active
            ? 'bg-indigo-400 text-slate-950 border-indigo-300 shadow-lg'
            : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-600'
        }"
      >
        <span>${sc.icon}</span>
        <span>${sc.title}</span>
      </button>
    `;
  }).join('');

  const cur = EXTENSION_SCENARIOS.find(s => s.key === activeExtensionKey) || EXTENSION_SCENARIOS[0];
  cardEl.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
        <span class="text-3xl">${cur.icon}</span>
        <h4 class="text-xl sm:text-2xl font-black text-white">${cur.title}</h4>
      </div>

      <div class="space-y-3 text-base sm:text-lg">
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span class="font-black text-rose-300">📂 日常資料分散困擾：</span>
          <p class="text-slate-200 mt-1">${cur.pain}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span class="font-black text-sky-300">🧭 明確分類依據（單頁入口）：</span>
          <p class="text-slate-200 mt-1">${cur.categories}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span class="font-black text-emerald-300">🤖 AI 協助整理什麼：</span>
          <p class="text-slate-200 mt-1">${cur.aiRole}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
          <span class="font-black text-amber-300">👩‍🏫 人工確認什麼（安全護欄）：</span>
          <p class="text-slate-200 mt-1">${cur.humanRole}</p>
        </div>
      </div>
    </div>
  `;
}

function selectExtensionScenario(key) {
  activeExtensionKey = key;
  renderExtensionSection();
  playTechSound('scan');
}

function copyEvalPrompt(btnEl) {
  const text = document.getElementById('eval-prompt-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ 已複製 AI 整理幫手提示詞！';
    btnEl.classList.add('bg-emerald-400', 'text-slate-950');
    playTechSound('success');
    setTimeout(() => {
      btnEl.innerHTML = orig;
      btnEl.classList.remove('bg-emerald-400', 'text-slate-950');
    }, 2400);
  });
}

// ---------------------------------------------------------------------
// 8. 一鍵自動語音導覽全流程 (6 大章節)
// ---------------------------------------------------------------------
function toggleAutoTour() {
  if (isAutoTouring) {
    stopAutoTour();
  } else {
    startAutoTour();
  }
}

function startAutoTour() {
  isAutoTouring = true;
  voiceEnabled = true;
  updateVoiceToggleUI();
  updateAutoTourButtonUI();

  const runStep = (stepIdx) => {
    if (!isAutoTouring) return;
    currentStep = stepIdx;
    if (stepIdx === 1 || stepIdx === 2) selectedEvidenceId = 'doc-ipas';
    if (stepIdx === 3) selectedEvidenceId = 'doc-speaker';
    if (stepIdx === 4) selectedEvidenceId = 'doc-project';
    if (stepIdx === 5 || stepIdx === 6) selectedEvidenceId = 'doc-forum';

    renderStepPills();
    updateChapterPanelAnd3DStage();
    renderEvidenceCards();

    const stepObj = STEPS[stepIdx - 1];
    speakText(stepObj.voiceText, () => {
      if (!isAutoTouring) return;
      if (stepIdx < 6) {
        autoTourTimer = setTimeout(() => runStep(stepIdx + 1), 900);
      } else {
        stopAutoTour();
      }
    });
  };

  runStep(1);
}

function stopAutoTour() {
  isAutoTouring = false;
  if (autoTourTimer) {
    clearTimeout(autoTourTimer);
    autoTourTimer = null;
  }
  updateAutoTourButtonUI();
}

function updateAutoTourButtonUI() {
  const btn = document.getElementById('btn-auto-tour');
  const icon = document.getElementById('tour-icon');
  const label = document.getElementById('tour-label');
  if (isAutoTouring) {
    icon.textContent = '⏹️';
    label.textContent = '停止自動導覽';
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/25 transition-all';
  } else {
    icon.textContent = '▶️';
    label.textContent = '一鍵導覽 6 大章節';
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowRight') nextStep();
  if (e.key === 'ArrowLeft') prevStep();
  if (e.key === 'Escape') closeAttachmentModal();
});

window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  renderCategoryTabs();
  renderStatusFilters();
  renderEvidenceCards();
  renderExtensionSection();
  goToStep(1, false);
});
