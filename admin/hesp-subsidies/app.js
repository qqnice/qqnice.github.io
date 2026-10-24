// =====================================================================
// NUTC 高教補助方案公告總覽｜AI 戰情表 3D 語音互動導覽劇場 互動邏輯與語音引擎 (app.js)
// =====================================================================

let currentStep = 1;
let selectedSubsidyId = 's1';
let activeCategoryFilter = 'all'; // 'all' | 'student' | 'dept' | 'teacher'
let voiceEnabled = true;
let isAutoTouring = false;
let autoTourTimer = null;
let audioCtx = null;

// ---------------------------------------------------------------------
// 1. Web Audio API 科技音效合成器 (掃描音 / AI 解析音 / 戰情表點亮音 / 警示音)
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
    const freqs = [520, 680, 880, 1040];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.065);
    });
  } else if (type === 'success') {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.07, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    });
  } else if (type === 'alert') {
    const freqs = [740, 554.37];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }
}

// ---------------------------------------------------------------------
// 2. Web Speech API 中文語音導覽引擎
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

function speakText(text, onEndCallback = null, rate = 1.06, pitch = 1.0) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) setTimeout(onEndCallback, 2800);
    return;
  }
  window.speechSynthesis.cancel();

  if (!voiceEnabled) {
    setSpeakingIndicator(false);
    if (onEndCallback) setTimeout(onEndCallback, 2600);
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

function speakHighlight(index) {
  const text = HIGHLIGHT_VOICES[index];
  if (!text) return;
  if (!voiceEnabled) {
    voiceEnabled = true;
    updateVoiceToggleUI();
  }
  document.getElementById('banner-voice-subtitle').textContent = `「${text}」`;
  playTechSound('scan');
  speakText(text);
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
    label.textContent = '語音導覽：開啟';
    btn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-500/50 text-xs font-bold text-sky-300 transition-all';
  } else {
    icon.textContent = '🔇';
    label.textContent = '語音導覽：靜音';
    btn.className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 transition-all';
  }
}

// ---------------------------------------------------------------------
// 3. 渲染頂部 6 步驟進度膠囊、左側「高教補助戰情表」互動模擬器與 AI 解析面板
// ---------------------------------------------------------------------
function renderStepPills() {
  const container = document.getElementById('step-pills-container');
  container.innerHTML = STEPS.map(s => {
    const isActive = s.step === currentStep;
    const isPast = s.step < currentStep;
    return `
      <button
        onclick="goToStep(${s.step})"
        class="group relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all ${
          isActive
            ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/25 scale-[1.02]'
            : isPast
            ? 'bg-slate-800/90 text-emerald-300 border-emerald-500/30 hover:bg-slate-800'
            : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
        }"
      >
        <span class="text-lg sm:text-xl shrink-0">${s.icon}</span>
        <div class="min-w-0 text-center sm:text-left">
          <div class="text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}">
            STEP ${s.step}
          </div>
          <div class="text-xs font-black truncate ${isActive ? 'text-slate-950' : 'text-white'}">
            ${s.shortTitle}
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function setCategoryFilter(cat) {
  activeCategoryFilter = cat;
  const filtered = SUBSIDY_ITEMS.filter(item => cat === 'all' || item.category === cat);
  if (filtered.length > 0 && !filtered.some(i => i.id === selectedSubsidyId)) {
    selectedSubsidyId = filtered[0].id;
  }
  renderFilterButtons();
  renderSubsidyCards();
  renderAiInspectorToast();
  playTechSound('scan');
}

function renderFilterButtons() {
  const filters = [
    { key: 'all', label: '全部方案 (4)' },
    { key: 'student', label: '🏆 學生競賽' },
    { key: 'dept', label: '🏛️ 系所發展' },
    { key: 'teacher', label: '👩‍🏫 教師/創新' }
  ];
  const el = document.getElementById('warroom-filter-bar');
  if (!el) return;
  el.innerHTML = filters.map(f => {
    const active = activeCategoryFilter === f.key;
    return `
      <button
        onclick="setCategoryFilter('${f.key}')"
        class="px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
          active
            ? 'bg-sky-400 text-slate-950 shadow-sm'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
        }"
      >
        ${f.label}
      </button>
    `;
  }).join('');
}

function renderSubsidyCards() {
  const listEl = document.getElementById('subsidy-list');
  if (!listEl) return;

  const filtered = SUBSIDY_ITEMS.filter(item => activeCategoryFilter === 'all' || item.category === activeCategoryFilter);

  listEl.innerHTML = filtered.map(item => {
    const isSelected = item.id === selectedSubsidyId;
    const badgeStyle = {
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }[item.statusColor] || 'bg-slate-800 text-slate-300 border-slate-700';

    return `
      <div
        onclick="selectSubsidyCard('${item.id}')"
        class="cursor-pointer p-3 rounded-2xl border transition-all ${
          isSelected
            ? 'bg-slate-800/95 border-sky-400 shadow-lg shadow-sky-500/15 scale-[1.01]'
            : 'bg-slate-950/75 border-slate-800/90 hover:border-slate-700'
        }"
      >
        <div class="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
          <span class="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-sky-300 border border-slate-700">
            ${item.categoryLabel}
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badgeStyle}">
            ${item.statusBadge}
          </span>
        </div>

        <div class="font-black text-sm text-white leading-snug mb-1">
          ${item.title}
        </div>

        <div class="text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <span class="truncate">🎯 對象：${item.target}</span>
          <span class="text-sky-400 font-bold shrink-0">${isSelected ? '▼ 檢視 AI 拆解' : '點選查看 ▶'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderAiInspectorToast() {
  const toast = document.getElementById('ai-inspector-toast');
  if (!toast) return;
  const item = SUBSIDY_ITEMS.find(s => s.id === selectedSubsidyId) || SUBSIDY_ITEMS[0];

  const extractedHtml = item.aiExtracted.map(line => `
    <li class="flex items-start gap-1.5 text-[11px] text-slate-200 leading-relaxed">
      <span class="text-sky-400 font-black mt-0.5">▸</span>
      <span>${line}</span>
    </li>
  `).join('');

  toast.innerHTML = `
    <div class="space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-lg">🤖</span>
          <div>
            <div class="text-xs font-black text-amber-300">AI 結構化拆解與狀態依據（供承辦人核對）</div>
            <div class="text-[11px] text-slate-400">選中方案：${item.title}</div>
          </div>
        </div>
        <a
          href="${item.officialUrl}"
          target="_blank"
          rel="noopener"
          class="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-[11px] font-black transition-all"
        >
          🔗 原始官方公告 ↗
        </a>
      </div>

      <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div class="text-[11px] font-black text-emerald-300 mb-1">${item.keyRule}</div>
        <ul class="space-y-1">
          ${extractedHtml}
        </ul>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
        <span class="text-amber-200 font-bold">${item.diffNote}</span>
        <a
          href="https://nutc-hesp-subsidies-2026.nutcqqnice.chatgpt.site/"
          target="_blank"
          rel="noopener"
          class="text-emerald-300 hover:text-emerald-200 font-black underline underline-offset-4"
        >
          🚀 開啟完整戰情表網站 ↗
        </a>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 4. 更新 3D 舞台視覺狀態（分散選單 ➔ 爬蟲與 AI 中樞 ➔ 戰情表大螢幕）
// ---------------------------------------------------------------------
function update3DStageVisuals() {
  const s = STEPS[currentStep - 1];

  document.getElementById('banner-step-num').textContent = s.step;
  document.getElementById('banner-step-title').textContent = s.title;
  document.getElementById('banner-step-tag').textContent = s.tag;
  document.getElementById('banner-voice-subtitle').textContent = `「${s.voiceText}」`;

  document.getElementById('hw-state-source').textContent = s.sourceState;
  document.getElementById('hw-state-ai').textContent = s.aiState;
  document.getElementById('hw-state-warroom').textContent = s.warroomState;
  document.getElementById('ai-core-bubble-text').textContent = s.badgeCmd;

  const wireCrawler = document.getElementById('wire-crawler');
  const wireToWarroom = document.getElementById('wire-to-warroom');
  const wireDiffFeedback = document.getElementById('wire-diff-feedback');

  const sourceHalo = document.getElementById('source-halo');
  const aiHalo = document.getElementById('ai-halo');
  const warroomHalo = document.getElementById('warroom-halo');

  const speechOverlay = document.getElementById('stage-speech-overlay');
  const speechBadge = document.getElementById('speech-box-badge');
  const speechLine1 = document.getElementById('speech-box-line1');
  const speechLine2 = document.getElementById('speech-box-line2');
  const speechBg = document.getElementById('speech-box-bg');

  const warroomScreenTag = document.getElementById('warroom-screen-tag');
  const warroomScreenSub = document.getElementById('warroom-screen-sub');

  [wireCrawler, wireToWarroom, wireDiffFeedback].forEach(w => {
    if (w) w.setAttribute('class', 'opacity-20');
  });

  sourceHalo.setAttribute('opacity', '0.12');
  aiHalo.setAttribute('opacity', '0.12');
  warroomHalo.setAttribute('opacity', '0.12');

  document.getElementById('hw-card-source').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-ai').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-warroom').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';

  speechOverlay.classList.remove('hidden');

  if (currentStep === 1) {
    document.getElementById('hw-card-source').classList.add('glow-active-rose');
    sourceHalo.setAttribute('opacity', '0.45');
    warroomScreenTag.textContent = '⏳ 尚未集中（老師需逐頁尋找）';
    warroomScreenSub.textContent = '準備建立「高教補助戰情表」';

    speechBg.setAttribute('stroke', '#fb7185');
    speechBadge.setAttribute('fill', '#fda4af');
    speechBadge.textContent = '🕸️ 原始痛點：高教深耕官網選單多、公告分散各頁';
    speechLine1.textContent = '老師心聲：「現在到底有哪些補助可以申請？什麼時候截止？」';
    speechLine2.textContent = '辦公室心聲：「每次都要重找連結與解釋規則，先建一張戰情表吧！」';
  } else if (currentStep === 2) {
    document.getElementById('hw-card-source').classList.add('glow-active-blue');
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    sourceHalo.setAttribute('opacity', '0.35');
    aiHalo.setAttribute('opacity', '0.4');
    wireCrawler.setAttribute('class', 'opacity-100 wire-flow-fast');
    warroomScreenTag.textContent = '🕷️ 爬蟲正在抓取官網各頁公告...';
    warroomScreenSub.textContent = '保留官方原始連結與查閱路徑';

    speechBg.setAttribute('stroke', '#38bdf8');
    speechBadge.setAttribute('fill', '#7dd3fc');
    speechBadge.textContent = '🕷️ 自動爬蟲巡檢：把散落在子選單的公告一次抓回來';
    speechLine1.textContent = '自動擷取【競賽補助】、【系所補助】、【教師專業成長社群】等頁面，';
    speechLine2.textContent = '免除人工逐頁點開、複製貼上的繁瑣負擔！';
    playTechSound('scan');
  } else if (currentStep === 3) {
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    aiHalo.setAttribute('opacity', '0.5');
    wireCrawler.setAttribute('class', 'opacity-100 wire-flow');
    wireToWarroom.setAttribute('class', 'opacity-100 wire-flow');
    warroomScreenTag.textContent = '🧠 AI 正在轉換為一致的戰情表欄位...';
    warroomScreenSub.textContent = '名稱 / 對象 / 申請期 / 條件 / 官方連結';

    speechBg.setAttribute('stroke', '#fbbf24');
    speechBadge.setAttribute('fill', '#fde68a');
    speechBadge.textContent = '🧠 AI 資料整理助手：將不同寫法的公告結構化';
    speechLine1.textContent = 'AI 自動辨識「方案名稱、適用對象、申請期間、重要條件、原始連結」，';
    speechLine2.textContent = '把散亂長文排列成整齊劃一的戰情欄位，供承辦同仁核對！';
    playTechSound('scan');
  } else if (currentStep === 4) {
    document.getElementById('hw-card-ai').className += ' glow-active-amber';
    document.getElementById('hw-card-warroom').className += ' glow-active-emerald';
    aiHalo.setAttribute('opacity', '0.5');
    warroomHalo.setAttribute('opacity', '0.35');
    wireToWarroom.setAttribute('class', 'opacity-100 wire-flow-fast');
    warroomScreenTag.textContent = '⚖️ 狀態號誌有依據：前14天 / 隨到隨審 / 用罄';
    warroomScreenSub.textContent = '不確定處標示「待確認」交由承辦人核對';

    speechBg.setAttribute('stroke', '#f59e0b');
    speechBadge.setAttribute('fill', '#fcd34d');
    speechBadge.textContent = '⚖️ 深度語意判讀：區分申請期限、活動日、核銷日與特殊限制';
    speechLine1.textContent = '• 競賽補助：標出「賽前14個工作天」｜• 系所補助：標出「隨到隨審」';
    speechLine2.textContent = '• 教師社群：辨識出「經費用罄」亮紅燈！讓每個狀態標示都有跡可循。';
    playTechSound('alert');
  } else if (currentStep === 5) {
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    warroomHalo.setAttribute('opacity', '0.55');
    wireToWarroom.setAttribute('class', 'opacity-100 wire-flow');
    warroomScreenTag.textContent = '✨ 戰情表已就緒！一眼看清全校補助全貌';
    warroomScreenSub.textContent = '看見方案 ➔ 理解條件 ➔ 掌握時間 ➔ 前往官方公告';

    speechBg.setAttribute('stroke', '#10b981');
    speechBadge.setAttribute('fill', '#6ee7b7');
    speechBadge.textContent = '📊 戰情表總覽成型：老師第一眼找到機會，辦公室一鍵分享';
    speechLine1.textContent = '老師打開頁面就能快速篩選與自己有關的補助，直達官方公告準備申請；';
    speechLine2.textContent = '計畫辦公室分享這一個連結，就能清楚回答 80% 以上的重複詢問！';
    playTechSound('success');
  } else if (currentStep === 6) {
    document.getElementById('hw-card-ai').classList.add('glow-active-amber');
    document.getElementById('hw-card-warroom').classList.add('glow-active-emerald');
    aiHalo.setAttribute('opacity', '0.45');
    warroomHalo.setAttribute('opacity', '0.45');
    wireCrawler.setAttribute('class', 'opacity-100 wire-flow');
    wireToWarroom.setAttribute('class', 'opacity-100 wire-flow');
    wireDiffFeedback.setAttribute('class', 'opacity-100 wire-flow-fast');
    warroomScreenTag.textContent = '🔄 持續巡檢比對差異 ＋ 承辦人核對更新';
    warroomScreenSub.textContent = '延伸：即將截止清單 / 新公告摘要 / 通知信草稿';

    speechBg.setAttribute('stroke', '#38bdf8');
    speechBadge.setAttribute('fill', '#38bdf8');
    speechBadge.textContent = '🔄 可持續更新工作流：AI 比對前後差異 × 承辦人確認後發布';
    speechLine1.textContent = '官網公告調整或經費用罄時，AI 重新擷取並標出「前後差異」供同仁核對；';
    speechLine2.textContent = '未來還能一鍵產出「即將截止提醒、FAQ 與通知草稿」，陪辦公室一起工作！';
    playTechSound('success');
  }
}

// ---------------------------------------------------------------------
// 5. 互動控制：跳轉步驟、點擊方案卡、情境快速模擬、一鍵自動導覽
// ---------------------------------------------------------------------
function goToStep(stepNumber, shouldSpeak = true) {
  currentStep = Math.max(1, Math.min(6, stepNumber));
  renderStepPills();
  renderFilterButtons();
  renderSubsidyCards();
  renderAiInspectorToast();
  update3DStageVisuals();
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

function selectSubsidyCard(id) {
  stopAutoTour();
  selectedSubsidyId = id;
  const item = SUBSIDY_ITEMS.find(s => s.id === id);
  renderSubsidyCards();
  renderAiInspectorToast();
  if (!item) return;

  playTechSound('scan');
  const voiceMsg = `已選取「${item.title}」。${item.keyRule.replace(/[⚠️✅🛑💡]/g, '')}`;
  document.getElementById('banner-voice-subtitle').textContent = `「${voiceMsg}」`;
  speakText(voiceMsg);
}

function simulateRuleScenario(scenarioKey) {
  stopAutoTour();
  activeCategoryFilter = 'all';
  if (scenarioKey === '14days') {
    selectedSubsidyId = 's1';
    goToStep(4, false);
    const msg = '模擬競賽補助判讀：AI 自動從公告長文中抓出「必須在競賽前十四個工作天送件」的隱藏條件，並以黃燈醒目標示，提醒師生提早準備！';
    document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
    speakText(msg);
  } else if (scenarioKey === 'exhausted') {
    selectedSubsidyId = 's3';
    goToStep(6, false);
    const msg = '模擬經費用罄更新：當官網的教師專業成長社群公告加上「經費用罄」時，AI 比對出差異並提醒承辦人，核對後立即切換為紅燈截止狀態！';
    document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
    speakText(msg);
  } else if (scenarioKey === 'rolling') {
    selectedSubsidyId = 's2';
    goToStep(5, false);
    const msg = '模擬系所補助總覽：AI 標示出「隨到隨審、經費用罄為止」，讓系所主任與老師一眼掌握目前仍可提案申請！';
    document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
    speakText(msg);
  }
}

function copyPromptTemplate(btnEl) {
  const promptText = document.getElementById('ai-prompt-template-text').innerText;
  navigator.clipboard.writeText(promptText).then(() => {
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ 已複製 AI 戰情表提示詞！';
    btnEl.classList.add('bg-emerald-400', 'text-slate-950');
    playTechSound('success');
    setTimeout(() => {
      btnEl.innerHTML = orig;
      btnEl.classList.remove('bg-emerald-400', 'text-slate-950');
    }, 2200);
  });
}

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
  activeCategoryFilter = 'all';
  updateVoiceToggleUI();
  updateAutoTourButtonUI();

  const runStep = (stepIdx) => {
    if (!isAutoTouring) return;
    currentStep = stepIdx;
    if (stepIdx === 1 || stepIdx === 2) selectedSubsidyId = 's1';
    if (stepIdx === 3 || stepIdx === 4) selectedSubsidyId = 's1';
    if (stepIdx === 5) selectedSubsidyId = 's2';
    if (stepIdx === 6) selectedSubsidyId = 's3';

    renderStepPills();
    renderFilterButtons();
    renderSubsidyCards();
    renderAiInspectorToast();
    update3DStageVisuals();

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
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition-all';
  } else {
    icon.textContent = '▶️';
    label.textContent = '一鍵語音導覽全流程';
    btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextStep();
  if (e.key === 'ArrowLeft') prevStep();
});

window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  goToStep(1, false);
});
