// ============================================================================
// AI 工作應用圖文手冊｜極簡大字「動態圖說版」互動與動畫引擎 (app.js)
// ============================================================================

let currentPageId = 'prompt'; // 'prompt' | 'skill' | 'tool' | 'agent' | 'bot' | 'overview'
let currentStep = 1;          // 1 ~ 4
let isPlayingAnim = false;
let animTimer = null;
let voiceEnabled = true;
let audioCtx = null;

// ----------------------------------------------------------------------------
// 1. 字體大小切換（標準大字 / 特大字 / 投影超大）
// ----------------------------------------------------------------------------
function setFontSizeMode(mode) {
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-mode-normal', 'font-mode-large', 'font-mode-xlarge');
  htmlEl.classList.add(`font-mode-${mode}`);

  ['normal', 'large', 'xlarge'].forEach((m) => {
    const btn = document.getElementById(`btn-font-${m}`);
    if (!btn) return;
    btn.className =
      m === mode
        ? 'px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-black text-sm shadow transition-all'
        : 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all';
  });
  playSound('click');
}

// ----------------------------------------------------------------------------
// 2. 音效與語音導覽
// ----------------------------------------------------------------------------
function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type = 'click') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const freqs = type === 'step' ? [523.25, 659.25, 783.99] : [660, 880];
  freqs.forEach((f, idx) => {
    const start = ctx.currentTime + idx * 0.05;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.045, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.075);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.08);
  });
}

function setSpeakingWave(active, text = '') {
  const wave = document.getElementById('speaking-wave');
  const sub = document.getElementById('voice-status-text');
  if (wave) {
    wave.classList.toggle('hidden', !active);
    wave.classList.toggle('inline-flex', active);
  }
  if (sub && text) sub.textContent = text;
}

function speakText(text, onEnd = null) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 2400);
    return;
  }
  window.speechSynthesis.cancel();
  setSpeakingWave(true, text);

  if (!voiceEnabled) {
    setSpeakingWave(false, text);
    if (onEnd) setTimeout(onEnd, 2400);
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-TW';
  utter.rate = 1.04;
  const voices = window.speechSynthesis.getVoices();
  const twVoice =
    voices.find((v) => v.lang.includes('zh-TW') && (v.name.includes('Meijia') || v.name.includes('Google') || v.name.includes('Microsoft'))) ||
    voices.find((v) => v.lang.includes('zh-TW')) ||
    voices.find((v) => v.lang.includes('zh'));
  if (twVoice) utter.voice = twVoice;

  utter.onend = () => {
    setSpeakingWave(false);
    if (onEnd) onEnd();
  };
  utter.onerror = () => {
    setSpeakingWave(false);
    if (onEnd) onEnd();
  };
  window.speechSynthesis.speak(utter);
}

function toggleVoiceEnabled() {
  voiceEnabled = !voiceEnabled;
  const icon = document.getElementById('voice-icon');
  const label = document.getElementById('voice-label');
  const btn = document.getElementById('btn-voice-toggle');
  if (voiceEnabled) {
    if (icon) icon.textContent = '🔊';
    if (label) label.textContent = '語音：開';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400 text-sm font-black text-sky-300 transition-all';
    speakCurrentPageIntro();
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingWave(false);
    if (icon) icon.textContent = '🔇';
    if (label) label.textContent = '語音：關';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border-2 border-slate-700 text-sm font-bold text-slate-400 transition-all';
  }
}

function speakCurrentPageIntro() {
  if (currentPageId === 'overview') {
    speakText('五站總覽圖說：Prompt 交代一次任務，Skill 保存工作方法，Tool 取得執行能力，Agent 委派目標與調整，Bot 提供互動服務。');
    return;
  }
  const page = FIVE_PAGES.find((p) => p.id === currentPageId) || FIVE_PAGES[0];
  speakText(page.pageVoice);
}

// ----------------------------------------------------------------------------
// 3. 頂部 5 大頁面切換列 (Prompt / Skill / Tool / Agent / Bot + 五站總覽)
// ----------------------------------------------------------------------------
function renderTopTabs() {
  const container = document.getElementById('five-page-tabs');
  if (!container) return;

  const activeColor = {
    sky: 'bg-sky-500 text-slate-950 border-sky-200 shadow-lg shadow-sky-500/30 scale-[1.02]',
    emerald: 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-lg shadow-emerald-500/30 scale-[1.02]',
    amber: 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg shadow-amber-400/30 scale-[1.02]',
    purple: 'bg-purple-500 text-white border-purple-200 shadow-lg shadow-purple-500/30 scale-[1.02]',
    rose: 'bg-rose-500 text-white border-rose-200 shadow-lg shadow-rose-500/30 scale-[1.02]'
  };

  const html = FIVE_PAGES.map((p) => {
    const active = currentPageId === p.id;
    const cls = active
      ? activeColor[p.color]
      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700';

    return `
      <button
        onclick="switchPage('${p.id}', true)"
        class="rounded-2xl border-2 px-4 py-3 text-left transition-all flex items-center gap-3 ${cls}"
      >
        <span class="text-3xl shrink-0">${p.icon}</span>
        <div class="min-w-0">
          <div class="text-lg sm:text-xl font-black leading-tight truncate">${p.num} ${p.name}</div>
          <div class="text-xs sm:text-sm font-bold truncate ${active ? 'opacity-95' : 'text-slate-400'}">${p.zhTitle}</div>
        </div>
      </button>
    `;
  }).join('');

  const isOv = currentPageId === 'overview';
  const ovBtn = `
    <button
      onclick="switchPage('overview', true)"
      class="rounded-2xl border-2 px-4 py-3 text-left transition-all flex items-center gap-3 ${
        isOv
          ? 'bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 border-white shadow-lg scale-[1.02]'
          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
      }"
    >
      <span class="text-3xl shrink-0">🗺️</span>
      <div class="min-w-0">
        <div class="text-lg sm:text-xl font-black leading-tight truncate">五站總覽圖</div>
        <div class="text-xs sm:text-sm font-bold truncate ${isOv ? 'opacity-95' : 'text-amber-300'}">同場研習五種用法</div>
      </div>
    </button>
  `;

  container.innerHTML = html + ovBtn;
}

function switchPage(pageId, shouldSpeak = true) {
  stopAnim();
  currentPageId = pageId;
  currentStep = 1;
  playSound('step');
  renderTopTabs();
  renderMainPage();
  if (shouldSpeak) speakCurrentPageIntro();
}

function prevPage() {
  const order = ['prompt', 'skill', 'tool', 'agent', 'bot', 'overview'];
  const idx = order.indexOf(currentPageId);
  switchPage(order[idx > 0 ? idx - 1 : order.length - 1], true);
}

function nextPage() {
  const order = ['prompt', 'skill', 'tool', 'agent', 'bot', 'overview'];
  const idx = order.indexOf(currentPageId);
  switchPage(order[idx < order.length - 1 ? idx + 1 : 0], true);
}

// ----------------------------------------------------------------------------
// 4. 動畫播放控制（自動步進 1 ➔ 2 ➔ 3 ➔ 4 並朗讀圖說）
// ----------------------------------------------------------------------------
function toggleAnim() {
  if (isPlayingAnim) {
    stopAnim();
  } else {
    startAnim();
  }
}

function startAnim() {
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;
  isPlayingAnim = true;
  renderMainPage();
  runStepLoop(1);
}

function stopAnim() {
  isPlayingAnim = false;
  if (animTimer) clearTimeout(animTimer);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setSpeakingWave(false);
  const btn = document.getElementById('btn-play-anim');
  if (btn) {
    btn.innerHTML = '▶️ 播放動畫＋語音圖說';
    btn.className = 'px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg transition-all';
  }
}

function runStepLoop(stepNum) {
  if (!isPlayingAnim) return;
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;

  selectStep(stepNum, false);
  const st = page.steps.find((s) => s.step === stepNum) || page.steps[0];
  speakText(st.voice, () => {
    if (!isPlayingAnim) return;
    animTimer = setTimeout(() => {
      if (!isPlayingAnim) return;
      if (stepNum < page.steps.length) {
        runStepLoop(stepNum + 1);
      } else {
        stopAnim();
      }
    }, 650);
  });
}

function selectStep(stepNum, shouldSpeak = true) {
  currentStep = stepNum;
  playSound('click');
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;

  const svgWrap = document.getElementById('svg-diagram-container');
  if (svgWrap) svgWrap.innerHTML = renderCustomSVG(page.id, currentStep);

  const pillsWrap = document.getElementById('step-pills-bar');
  if (pillsWrap) pillsWrap.innerHTML = renderStepPillsHtml(page);

  const st = page.steps.find((s) => s.step === currentStep) || page.steps[0];
  const capEl = document.getElementById('main-caption-box');
  if (capEl) capEl.textContent = st.caption;

  if (shouldSpeak) speakText(st.voice);
}

// ----------------------------------------------------------------------------
// 5. 每一頁專屬的「大型動態 SVG 圖解」（完全對應手冊 圖 3 ~ 圖 7）
// ----------------------------------------------------------------------------
function renderCustomSVG(pageId, step) {
  const activeStroke = (n, colorHex) => (step === n ? colorHex : '#475569');
  const activeWidth = (n) => (step === n ? '4.5' : '2');
  const activeFill = (n, activeBg) => (step === n ? activeBg : '#0f172a');

  // === 圖 3：01 Prompt 單次內容小循環 ===
  if (pageId === 'prompt') {
    return `
      <svg viewBox="0 0 1000 300" class="w-full h-auto max-h-[340px] select-none">
        <!-- 動態箭頭連線 -->
        <line x1="225" y1="145" x2="275" y2="145" stroke="#38bdf8" stroke-width="5" class="${step >= 2 ? 'flow-line-active' : 'opacity-30'}" />
        <polygon points="275,145 263,137 263,153" fill="#38bdf8" />
        <line x1="475" y1="145" x2="525" y2="145" stroke="#38bdf8" stroke-width="5" class="${step >= 3 ? 'flow-line-active' : 'opacity-30'}" />
        <polygon points="525,145 513,137 513,153" fill="#38bdf8" />
        <line x1="725" y1="145" x2="775" y2="145" stroke="#38bdf8" stroke-width="5" class="${step >= 4 ? 'flow-line-active' : 'opacity-30'}" />
        <polygon points="775,145 763,137 763,153" fill="#38bdf8" />

        <!-- Node 1: 提供材料 -->
        <g class="cursor-pointer" onclick="selectStep(1, true)" transform="translate(25, 45)">
          <rect width="200" height="190" rx="22" fill="${activeFill(1, '#0c4a6e')}" stroke="${activeStroke(1, '#38bdf8')}" stroke-width="${activeWidth(1)}" />
          <text x="100" y="58" text-anchor="middle" font-size="38">📄</text>
          <text x="100" y="102" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">① 提供材料</text>
          <text x="100" y="135" text-anchor="middle" fill="#7dd3fc" font-size="16" font-weight="700">公告・筆記・數據</text>
          <text x="100" y="165" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="700">例：11/20 研習資料</text>
        </g>

        <!-- Node 2: 交代要求 -->
        <g class="cursor-pointer" onclick="selectStep(2, true)" transform="translate(275, 45)">
          <rect width="200" height="190" rx="22" fill="${activeFill(2, '#0c4a6e')}" stroke="${activeStroke(2, '#38bdf8')}" stroke-width="${activeWidth(2)}" />
          <text x="100" y="58" text-anchor="middle" font-size="38">🎯</text>
          <text x="100" y="102" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">② 交代要求</text>
          <text x="100" y="135" text-anchor="middle" fill="#7dd3fc" font-size="16" font-weight="700">對象・格式・限制</text>
          <text x="100" y="165" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="700">缺資料標「待補」</text>
        </g>

        <!-- Node 3: AI 產生內容 -->
        <g class="cursor-pointer" onclick="selectStep(3, true)" transform="translate(525, 45)">
          <rect width="200" height="190" rx="22" fill="${activeFill(3, '#0c4a6e')}" stroke="${activeStroke(3, '#38bdf8')}" stroke-width="${activeWidth(3)}" />
          <text x="100" y="58" text-anchor="middle" font-size="38">🤖</text>
          <text x="100" y="102" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">③ AI 產生內容</text>
          <text x="100" y="135" text-anchor="middle" fill="#7dd3fc" font-size="16" font-weight="700">草稿・摘要・比較</text>
          <text x="100" y="165" text-anchor="middle" fill="#6ee7b7" font-size="14" font-weight="700">產出通知＋待確認項</text>
        </g>

        <!-- Node 4: 由人核對 -->
        <g class="cursor-pointer" onclick="selectStep(4, true)" transform="translate(775, 45)">
          <rect width="200" height="190" rx="22" fill="${activeFill(4, '#0c4a6e')}" stroke="${activeStroke(4, '#38bdf8')}" stroke-width="${activeWidth(4)}" />
          <text x="100" y="58" text-anchor="middle" font-size="38">👩‍💼</text>
          <text x="100" y="102" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">④ 由人核對</text>
          <text x="100" y="135" text-anchor="middle" fill="#7dd3fc" font-size="16" font-weight="700">事實・語氣・缺漏</text>
          <text x="100" y="165" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="700">補齊連結後才發布</text>
        </g>

        <!-- 底部一句話圖說 -->
        <text x="500" y="278" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">
          圖 3｜提供資料與要求，讓本次回覆接近你的需要（寫出文字 ≠ 實際完成動作）
        </text>
      </svg>
    `;
  }

  // === 圖 4：02 Skill 同一方法處理不同資料 ===
  if (pageId === 'skill') {
    return `
      <svg viewBox="0 0 1000 320" class="w-full h-auto max-h-[350px] select-none">
        <!-- 左到中連線 -->
        <line x1="250" y1="65" x2="355" y2="145" stroke="#10b981" stroke-width="4" class="${step >= 2 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="250" y1="150" x2="355" y2="150" stroke="#10b981" stroke-width="4" class="${step >= 2 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="250" y1="235" x2="355" y2="155" stroke="#10b981" stroke-width="4" class="${step >= 2 ? 'flow-line-active' : 'opacity-35'}" />

        <!-- 中到右連線 -->
        <line x1="645" y1="145" x2="750" y2="65" stroke="#10b981" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="645" y1="150" x2="750" y2="150" stroke="#10b981" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="645" y1="155" x2="750" y2="235" stroke="#10b981" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />

        <!-- 左側：研習 A / B / C 資料 (Step 1) -->
        <g class="cursor-pointer" onclick="selectStep(1, true)">
          <rect x="30" y="32" width="220" height="62" rx="14" fill="${activeFill(1, '#064e3b')}" stroke="${activeStroke(1, '#10b981')}" stroke-width="${activeWidth(1)}" />
          <text x="140" y="70" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="900">📥 研習 A 資料 (完整)</text>

          <rect x="30" y="118" width="220" height="62" rx="14" fill="${activeFill(1, '#064e3b')}" stroke="${activeStroke(1, '#10b981')}" stroke-width="${activeWidth(1)}" />
          <text x="140" y="156" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="900">📥 研習 B 資料 (缺連結)</text>

          <rect x="30" y="204" width="220" height="62" rx="14" fill="${activeFill(1, '#064e3b')}" stroke="${activeStroke(1, '#10b981')}" stroke-width="${activeWidth(1)}" />
          <text x="140" y="242" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="900">📥 研習 C 資料 (日衝突)</text>
        </g>

        <!-- 中央：研習通知 Skill 核心盒 (Step 2 & Step 4) -->
        <g class="cursor-pointer" onclick="selectStep(2, true)" transform="translate(355, 28)">
          <rect width="290" height="240" rx="24" fill="${step === 2 || step === 4 ? '#064e3b' : '#0f172a'}" stroke="${step === 2 || step === 4 ? '#34d399' : '#475569'}" stroke-width="${step === 2 || step === 4 ? '4.5' : '2.5'}" />
          <text x="145" y="48" text-anchor="middle" fill="#6ee7b7" font-size="24" font-weight="900">📘 研習通知 Skill</text>
          <text x="40" y="92" fill="#f8fafc" font-size="17" font-weight="700">✔ 適用情境與操作步驟</text>
          <text x="40" y="126" fill="#f8fafc" font-size="17" font-weight="700">✔ 單位通知公版範本</text>
          <text x="40" y="160" fill="#f8fafc" font-size="17" font-weight="700">✔ 必查欄位清單</text>
          <text x="40" y="194" fill="#fde68a" font-size="17" font-weight="700">✔ 缺漏與衝突檢查標準</text>
          <text x="145" y="224" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="700">(SKILL.md ＋ 範本資源)</text>
        </g>

        <!-- 右側：A / B / C 通知草稿 (Step 3) -->
        <g class="cursor-pointer" onclick="selectStep(3, true)">
          <rect x="750" y="32" width="220" height="62" rx="14" fill="${activeFill(3, '#064e3b')}" stroke="${activeStroke(3, '#10b981')}" stroke-width="${activeWidth(3)}" />
          <text x="860" y="70" text-anchor="middle" fill="#6ee7b7" font-size="19" font-weight="900">📋 A 通知草稿 (不混舊)</text>

          <rect x="750" y="118" width="220" height="62" rx="14" fill="${activeFill(3, '#064e3b')}" stroke="${activeStroke(3, '#10b981')}" stroke-width="${activeWidth(3)}" />
          <text x="860" y="156" text-anchor="middle" fill="#fde68a" font-size="19" font-weight="900">📋 B 通知草稿 (標待補)</text>

          <rect x="750" y="204" width="220" height="62" rx="14" fill="${activeFill(3, '#064e3b')}" stroke="${activeStroke(3, '#10b981')}" stroke-width="${activeWidth(3)}" />
          <text x="860" y="242" text-anchor="middle" fill="#fda4af" font-size="19" font-weight="900">📋 C 並列衝突交回人</text>
        </g>

        <text x="500" y="302" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">
          圖 4｜同一方法處理不同資料：方法可以重用，活動資料每次更新；結果仍要驗收
        </text>
      </svg>
    `;
  }

  // === 圖 5：03 Tool 讀取 ➔ 計算與轉換 ➔ 寫入與建立 ===
  if (pageId === 'tool') {
    return `
      <svg viewBox="0 0 1000 310" class="w-full h-auto max-h-[340px] select-none">
        <line x1="305" y1="145" x2="365" y2="145" stroke="#f59e0b" stroke-width="5" class="${step >= 2 ? 'flow-line-active' : 'opacity-30'}" />
        <polygon points="365,145 352,137 352,153" fill="#f59e0b" />
        <line x1="635" y1="145" x2="695" y2="145" stroke="#f59e0b" stroke-width="5" class="${step >= 3 ? 'flow-line-active' : 'opacity-30'}" />
        <polygon points="695,145 682,137 682,153" fill="#f59e0b" />

        <!-- Box 1: 讀取 -->
        <g class="cursor-pointer" onclick="selectStep(1, true)" transform="translate(30, 35)">
          <rect width="275" height="210" rx="22" fill="${activeFill(1, '#78350f')}" stroke="${activeStroke(1, '#fbbf24')}" stroke-width="${activeWidth(1)}" />
          <text x="137" y="55" text-anchor="middle" font-size="40">🔍</text>
          <text x="137" y="100" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="900">① 讀取 (Read)</text>
          <text x="137" y="135" text-anchor="middle" fill="#fde68a" font-size="17" font-weight="700">查資料與取得 6 列名單</text>
          <text x="137" y="170" text-anchor="middle" fill="#cbd5e1" font-size="14.5" font-weight="700">T001~T005 (含重複/取消/待確認)</text>
          <text x="137" y="194" text-anchor="middle" fill="#7dd3fc" font-size="13.5" font-weight="700">🔑 最小讀取權限・不改原表</text>
        </g>

        <!-- Box 2: 計算與轉換 -->
        <g class="cursor-pointer" onclick="selectStep(2, true)" transform="translate(365, 35)">
          <rect width="270" height="210" rx="22" fill="${activeFill(2, '#78350f')}" stroke="${activeStroke(2, '#fbbf24')}" stroke-width="${activeWidth(2)}" />
          <text x="135" y="55" text-anchor="middle" font-size="40">🧮</text>
          <text x="135" y="100" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="900">② 計算與轉換</text>
          <text x="135" y="135" text-anchor="middle" fill="#fde68a" font-size="17" font-weight="700">篩選「有效」＋代碼去重</text>
          <text x="135" y="168" text-anchor="middle" fill="#6ee7b7" font-size="15.5" font-weight="900">✅ 有效 3 人 (教務2・業務1)</text>
          <text x="135" y="194" text-anchor="middle" fill="#fda4af" font-size="13.5" font-weight="700">排除：T001重複、T003取消、T005待確</text>
        </g>

        <!-- Box 3: 寫入與建立 (Step 3 & 4) -->
        <g class="cursor-pointer" onclick="selectStep(3, true)" transform="translate(695, 35)">
          <rect width="275" height="210" rx="22" fill="${step >= 3 ? '#78350f' : '#0f172a'}" stroke="${step >= 3 ? '#fbbf24' : '#475569'}" stroke-width="${step >= 3 ? '4.5' : '2'}" />
          <text x="137" y="55" text-anchor="middle" font-size="40">📂</text>
          <text x="137" y="100" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="900">③ 寫入與查驗產物</text>
          <text x="137" y="135" text-anchor="middle" fill="#fde68a" font-size="17" font-weight="700">建立「報名摘要」檔案</text>
          <text x="137" y="168" text-anchor="middle" fill="#6ee7b7" font-size="15" font-weight="900">✔ 實際開啟檔案核對總數 = 3</text>
          <text x="137" y="194" text-anchor="middle" fill="#fca5a5" font-size="13.5" font-weight="700">⚠️ 聊天寫出檔名 ≠ 檔案已存在</text>
        </g>

        <text x="500" y="288" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">
          圖 5｜工具要已提供且取得授權；AI 說「已完成」後，還要能實際找到成果檔案並核對數字
        </text>
      </svg>
    `;
  }

  // === 圖 6：04 Agent 動態控制與查核迴路 ===
  if (pageId === 'agent') {
    return `
      <svg viewBox="0 0 1000 330" class="w-full h-auto max-h-[360px] select-none">
        <!-- 1 -> 2 -->
        <line x1="275" y1="85" x2="365" y2="85" stroke="#c084fc" stroke-width="4.5" class="${step >= 2 ? 'flow-line-active' : 'opacity-35'}" />
        <polygon points="365,85 353,77 353,93" fill="#c084fc" />
        <!-- 2 -> 3 -->
        <line x1="635" y1="85" x2="715" y2="85" stroke="#c084fc" stroke-width="4.5" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <polygon points="715,85 703,77 703,93" fill="#c084fc" />
        <!-- 3 -> 觀察新結果 -->
        <line x1="845" y1="145" x2="845" y2="185" stroke="#c084fc" stroke-width="4.5" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <polygon points="845,185 837,173 853,173" fill="#c084fc" />
        <!-- 觀察新結果 -> 需要時調整 (回 2) -->
        <path d="M 715 225 L 500 225 L 500 145" fill="none" stroke="#fbbf24" stroke-width="4" stroke-dasharray="8 6" class="${step === 3 ? 'flow-line-active' : 'opacity-45'}" />
        <polygon points="500,145 492,157 508,157" fill="#fbbf24" />
        <text x="605" y="213" text-anchor="middle" fill="#fde68a" font-size="15" font-weight="900">🔄 需要時動態調整下一步</text>

        <!-- 觀察新結果 -> 4 交付或交回人處理 -->
        <line x1="715" y1="255" x2="275" y2="255" stroke="#fb7185" stroke-width="4.5" class="${step === 4 ? 'flow-line-active' : 'opacity-40'}" />
        <polygon points="275,255 287,247 287,263" fill="#fb7185" />

        <!-- Box 1: 目標與邊界 -->
        <g class="cursor-pointer" onclick="selectStep(1, true)" transform="translate(25, 25)">
          <rect width="250" height="120" rx="20" fill="${activeFill(1, '#3b0764')}" stroke="${activeStroke(1, '#c084fc')}" stroke-width="${activeWidth(1)}" />
          <text x="125" y="45" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="900">🎯 ① 目標與邊界</text>
          <text x="125" y="75" text-anchor="middle" fill="#e9d5ff" font-size="15.5" font-weight="700">查清研習日期・限讀三來源</text>
          <text x="125" y="102" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="700">不改原始資料・不擅自寄信</text>
        </g>

        <!-- Box 2: AI 選擇下一步 -->
        <g class="cursor-pointer" onclick="selectStep(2, true)" transform="translate(365, 25)">
          <rect width="270" height="120" rx="20" fill="${activeFill(2, '#3b0764')}" stroke="${activeStroke(2, '#c084fc')}" stroke-width="${activeWidth(2)}" />
          <text x="135" y="45" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="900">🧠 ② AI 選擇下一步</text>
          <text x="135" y="75" text-anchor="middle" fill="#e9d5ff" font-size="15.5" font-weight="700">決定先查什麼或做什麼</text>
          <text x="135" y="102" text-anchor="middle" fill="#7dd3fc" font-size="14" font-weight="700">A公告(11/20) ≠ B網站(11/21)</text>
        </g>

        <!-- Box 3 Top: 使用允許的工具 -->
        <g class="cursor-pointer" onclick="selectStep(3, true)" transform="translate(715, 25)">
          <rect width="260" height="120" rx="20" fill="${activeFill(3, '#3b0764')}" stroke="${activeStroke(3, '#c084fc')}" stroke-width="${activeWidth(3)}" />
          <text x="130" y="45" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="900">🛠️ ③ 使用允許的工具</text>
          <text x="130" y="75" text-anchor="middle" fill="#e9d5ff" font-size="15.5" font-weight="700">再去查 C 主辦單位信件</text>
          <text x="130" y="102" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="700">發現信件寫「時間調整中」</text>
        </g>

        <!-- Box 3 Bottom: 觀察新結果 -->
        <g class="cursor-pointer" onclick="selectStep(3, true)" transform="translate(715, 185)">
          <rect width="260" height="100" rx="20" fill="${activeFill(3, '#3b0764')}" stroke="${activeStroke(3, '#c084fc')}" stroke-width="${activeWidth(3)}" />
          <text x="130" y="42" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900">👀 觀察新結果</text>
          <text x="130" y="72" text-anchor="middle" fill="#fda4af" font-size="15" font-weight="700">三方衝突・仍缺正式確認</text>
        </g>

        <!-- Box 4: 交付或交回人處理 -->
        <g class="cursor-pointer" onclick="selectStep(4, true)" transform="translate(25, 185)">
          <rect width="250" height="100" rx="20" fill="${activeFill(4, '#4c0519')}" stroke="${activeStroke(4, '#fb7185')}" stroke-width="${activeWidth(4)}" />
          <text x="125" y="42" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900">🛑 ④ 交付或交回人處理</text>
          <text x="125" y="72" text-anchor="middle" fill="#fda4af" font-size="14.5" font-weight="900">不亂猜日期！交衝突表給承辦</text>
        </g>

        <text x="500" y="316" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">
          圖 6｜Agent 的特徵是動態控制流程；遇到資訊不足或越界時，必須停下來交回人處理
        </text>
      </svg>
    `;
  }

  // === 圖 7：05 Bot 聊天服務與三種後端分流 ===
  if (pageId === 'bot') {
    return `
      <svg viewBox="0 0 1000 320" class="w-full h-auto max-h-[350px] select-none">
        <line x1="215" y1="150" x2="295" y2="150" stroke="#fb7185" stroke-width="5" class="${step >= 2 ? 'flow-line-active' : 'opacity-35'}" />
        <polygon points="295,150 282,142 282,158" fill="#fb7185" />

        <line x1="590" y1="135" x2="685" y2="62" stroke="#fb7185" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="590" y1="150" x2="685" y2="150" stroke="#fb7185" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />
        <line x1="590" y1="165" x2="685" y2="238" stroke="#fb7185" stroke-width="4" class="${step >= 3 ? 'flow-line-active' : 'opacity-35'}" />

        <!-- Node 1: 同仁提問 -->
        <g class="cursor-pointer" onclick="selectStep(1, true)" transform="translate(25, 65)">
          <rect width="190" height="170" rx="22" fill="${activeFill(1, '#4c0519')}" stroke="${activeStroke(1, '#fb7185')}" stroke-width="${activeWidth(1)}" />
          <text x="95" y="58" text-anchor="middle" font-size="42">🙋</text>
          <text x="95" y="102" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="900">① 同仁提問</text>
          <text x="95" y="132" text-anchor="middle" fill="#fda4af" font-size="14.5" font-weight="700">問時間 / 問報名狀態</text>
          <text x="95" y="154" text-anchor="middle" fill="#fde68a" font-size="13.5" font-weight="700">或問網站日期哪個對</text>
        </g>

        <!-- Node 2: 聊天 Bot 服務入口 -->
        <g class="cursor-pointer" onclick="selectStep(2, true)" transform="translate(295, 50)">
          <rect width="295" height="200" rx="24" fill="${step === 2 || step === 4 ? '#4c0519' : '#0f172a'}" stroke="${step === 2 || step === 4 ? '#fb7185' : '#475569'}" stroke-width="${step === 2 || step === 4 ? '4.5' : '2.5'}" />
          <text x="147" y="52" text-anchor="middle" font-size="38">🤖</text>
          <text x="147" y="92" text-anchor="middle" fill="#ffffff" font-size="23" font-weight="900">② 聊天 Bot 服務入口</text>
          <text x="147" y="125" text-anchor="middle" fill="#fda4af" font-size="16" font-weight="700">接收訊息・辨識請求</text>
          <text x="147" y="155" text-anchor="middle" fill="#fde68a" font-size="15.5" font-weight="900">🔐 查個人狀態必先驗證本人身分</text>
          <text x="147" y="182" text-anchor="middle" fill="#6ee7b7" font-size="14" font-weight="700">公開回答必附［來源與版本］</text>
        </g>

        <!-- Node 3 & 4: 三種後端做法 -->
        <g class="cursor-pointer" onclick="selectStep(3, true)">
          <rect x="685" y="25" width="285" height="72" rx="16" fill="${step >= 3 ? '#4c0519' : '#0f172a'}" stroke="${step >= 3 ? '#fb7185' : '#475569'}" stroke-width="${step >= 3 ? '3.5' : '2'}" />
          <text x="827" y="55" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="900">A. 固定規則</text>
          <text x="827" y="80" text-anchor="middle" fill="#cbd5e1" font-size="14.5" font-weight="700">輸入關鍵字就回覆（如回地址）</text>

          <rect x="685" y="114" width="285" height="72" rx="16" fill="${step >= 3 ? '#4c0519' : '#0f172a'}" stroke="${step >= 3 ? '#fb7185' : '#475569'}" stroke-width="${step >= 3 ? '3.5' : '2'}" />
          <text x="827" y="144" text-anchor="middle" fill="#6ee7b7" font-size="19" font-weight="900">B. AI 問答 (讀核定公告)</text>
          <text x="827" y="169" text-anchor="middle" fill="#cbd5e1" font-size="14.5" font-weight="700">答 11/20 14:00 並附公告來源連結</text>

          <rect x="685" y="203" width="285" height="72" rx="16" fill="${step >= 3 ? '#4c0519' : '#0f172a'}" stroke="${step >= 3 ? '#fb7185' : '#475569'}" stroke-width="${step >= 3 ? '3.5' : '2'}" />
          <text x="827" y="233" text-anchor="middle" fill="#fde68a" font-size="19" font-weight="900">C. 含 Agent 流程 / 轉人工</text>
          <text x="827" y="258" text-anchor="middle" fill="#fda4af" font-size="14.5" font-weight="700">遇 20日/21日衝突 ➔ 保留兩來源轉承辦</text>
        </g>

        <text x="500" y="304" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">
          圖 7｜背後做法依任務選擇：Bot 可以很簡單（固定規則或 AI 問答），不一定需要 Agent
        </text>
      </svg>
    `;
  }

  return '';
}

function renderStepPillsHtml(page) {
  const activeBg = {
    sky: 'bg-sky-500 text-slate-950 border-sky-200 shadow-lg',
    emerald: 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-lg',
    amber: 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg',
    purple: 'bg-purple-500 text-white border-purple-200 shadow-lg',
    rose: 'bg-rose-500 text-white border-rose-200 shadow-lg'
  };

  return page.steps
    .map((s) => {
      const isCurr = s.step === currentStep;
      const cls = isCurr
        ? activeBg[page.color]
        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700';
      return `
        <button
          onclick="selectStep(${s.step}, true)"
          class="rounded-2xl border-2 p-4 text-left transition-all flex items-center gap-3 ${cls}"
        >
          <span class="text-3xl shrink-0">${s.icon}</span>
          <div class="min-w-0">
            <div class="text-lg sm:text-xl font-black truncate">${s.label}</div>
            <div class="text-xs sm:text-sm font-bold truncate ${isCurr ? 'opacity-95' : 'text-slate-400'}">${s.shortSub}</div>
          </div>
        </button>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// 6. 渲染主畫面（極簡圖說版：頂部一句話 ＋ 中央大型動畫 SVG 圖解 ＋ 底部三格圖說卡）
// ----------------------------------------------------------------------------
function renderMainPage() {
  const main = document.getElementById('page-main-container');
  if (!main) return;

  if (currentPageId === 'overview') {
    main.innerHTML = renderOverviewVisualPage();
    return;
  }

  const page = FIVE_PAGES.find((p) => p.id === currentPageId) || FIVE_PAGES[0];
  const st = page.steps.find((s) => s.step === currentStep) || page.steps[0];

  main.innerHTML = `
    <div class="page-fade-in space-y-6">

      <!-- 1. 極簡一句話大標橫幅 -->
      <section class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <span class="text-5xl sm:text-6xl">${page.icon}</span>
          <div>
            <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ${page.num} ${page.name}｜${page.zhTitle}
            </h2>
            <p class="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              🎯 ${page.oneLiner}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-play-anim"
            onclick="toggleAnim()"
            class="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg transition-all"
          >
            ${isPlayingAnim ? '⏹️ 停止動畫' : '▶️ 播放動畫＋語音圖說'}
          </button>
          <button
            onclick="copyPrompt(this)"
            class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-black text-base border border-slate-700 transition-all"
          >
            📋 複製本頁範例指令
          </button>
          <button onclick="prevPage()" class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base border border-slate-700">◀</button>
          <button onclick="nextPage()" class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base border border-slate-700">▶</button>
        </div>
      </section>

      <!-- 2. 中央大型動態 SVG 圖解舞台 ＋ 一句話大字圖說 -->
      <section class="diagram-stage rounded-3xl border-2 border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
        <!-- SVG 圖解本體 -->
        <div id="svg-diagram-container" class="bg-slate-950/85 rounded-2xl border border-slate-800 p-3 sm:p-5">
          ${renderCustomSVG(page.id, currentStep)}
        </div>

        <!-- 4 個步驟點擊按鈕列 -->
        <div id="step-pills-bar" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${renderStepPillsHtml(page)}
        </div>

        <!-- 大字圖說字幕盒 -->
        <div class="rounded-2xl bg-slate-950 border-2 border-amber-400/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div id="main-caption-box" class="text-xl sm:text-2xl font-black text-white leading-snug">
            ${st.caption}
          </div>
          <span class="text-sm sm:text-base font-bold text-amber-300 shrink-0">${page.ruleBanner}</span>
        </div>
      </section>

      <!-- 3. 底部三格圖說卡（少字、條列清楚、一眼秒懂） -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
        ${page.visualCards
          .map(
            (card) => `
          <div class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <span class="inline-block px-3 py-1 rounded-lg bg-slate-800 text-amber-300 font-black text-sm mb-2 border border-slate-700">
                ${card.badge}
              </span>
              <h3 class="text-2xl font-black text-white mb-4">${card.title}</h3>
              <ul class="space-y-3 text-lg sm:text-xl font-bold text-slate-100">
                ${card.items.map((it) => `<li class="p-3 rounded-xl bg-slate-950/90 border border-slate-800">${it}</li>`).join('')}
              </ul>
            </div>
          </div>
        `
          )
          .join('')}
      </section>

    </div>
  `;
}

function copyPrompt(btnEl) {
  const page = FIVE_PAGES.find((p) => p.id === currentPageId) || FIVE_PAGES[0];
  navigator.clipboard.writeText(page.copyPrompt).then(() => {
    playSound('step');
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ 已複製範例指令！';
    setTimeout(() => {
      btnEl.innerHTML = orig;
    }, 1800);
  });
}

// ----------------------------------------------------------------------------
// 7. 五站總覽圖說頁（圖 1 ＋ 圖 2：同一場研習的五種用法，全圖解呈現）
// ----------------------------------------------------------------------------
function renderOverviewVisualPage() {
  return `
    <div class="page-fade-in space-y-6">
      <section class="rounded-3xl bg-slate-900/95 border-2 border-indigo-400/50 p-6 sm:p-7 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl sm:text-4xl font-black text-white">
            🗺️ 圖 1 ＆ 圖 2｜同一場「AI 行政應用研習」的五種用法總覽
          </h2>
          <p class="text-xl text-amber-300 font-black mt-1">
            💡 五站是教學順序，並非互斥選項，也不是能力高低排名！點擊任一圓圈即可進入該頁圖解：
          </p>
        </div>
        <button
          onclick="speakCurrentPageIntro()"
          class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-lg shrink-0"
        >
          🔊 聽總覽圖說
        </button>
      </section>

      <!-- 圖 1：五圓圈視覺導覽 SVG -->
      <section class="diagram-stage rounded-3xl border-2 border-slate-800 p-6 shadow-2xl">
        <svg viewBox="0 0 1050 240" class="w-full h-auto max-h-[260px] select-none">
          <line x1="175" y1="95" x2="245" y2="95" stroke="#64748b" stroke-width="4" />
          <line x1="385" y1="95" x2="455" y2="95" stroke="#64748b" stroke-width="4" />
          <line x1="595" y1="95" x2="665" y2="95" stroke="#64748b" stroke-width="4" />
          <line x1="805" y1="95" x2="875" y2="95" stroke="#64748b" stroke-width="4" />

          <g class="cursor-pointer" onclick="switchPage('prompt', true)" transform="translate(105, 95)">
            <circle r="68" fill="#0c4a6e" stroke="#38bdf8" stroke-width="4" />
            <text y="-10" text-anchor="middle" font-size="34">💬</text>
            <text y="26" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">Prompt</text>
            <text y="105" text-anchor="middle" fill="#7dd3fc" font-size="18" font-weight="900">交代一次任務</text>
          </g>

          <g class="cursor-pointer" onclick="switchPage('skill', true)" transform="translate(315, 95)">
            <circle r="68" fill="#064e3b" stroke="#10b981" stroke-width="4" />
            <text y="-10" text-anchor="middle" font-size="34">📘</text>
            <text y="26" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">Skill</text>
            <text y="105" text-anchor="middle" fill="#6ee7b7" font-size="18" font-weight="900">保存工作方法</text>
          </g>

          <g class="cursor-pointer" onclick="switchPage('tool', true)" transform="translate(525, 95)">
            <circle r="68" fill="#78350f" stroke="#fbbf24" stroke-width="4" />
            <text y="-10" text-anchor="middle" font-size="34">🧰</text>
            <text y="26" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">Tool</text>
            <text y="105" text-anchor="middle" fill="#fde68a" font-size="18" font-weight="900">取得執行能力</text>
          </g>

          <g class="cursor-pointer" onclick="switchPage('agent', true)" transform="translate(735, 95)">
            <circle r="68" fill="#3b0764" stroke="#c084fc" stroke-width="4" />
            <text y="-10" text-anchor="middle" font-size="34">🧭</text>
            <text y="26" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">Agent</text>
            <text y="105" text-anchor="middle" fill="#e9d5ff" font-size="18" font-weight="900">委派目標與調整</text>
          </g>

          <g class="cursor-pointer" onclick="switchPage('bot', true)" transform="translate(945, 95)">
            <circle r="68" fill="#4c0519" stroke="#fb7185" stroke-width="4" />
            <text y="-10" text-anchor="middle" font-size="34">🤖</text>
            <text y="26" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900">Bot</text>
            <text y="105" text-anchor="middle" fill="#fda4af" font-size="18" font-weight="900">提供互動服務</text>
          </g>
        </svg>
      </section>

      <!-- 圖 2：同一場研習的五種用法圖說卡 -->
      <section class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div onclick="switchPage('prompt', true)" class="cursor-pointer rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-sky-500/50 p-5 space-y-2">
          <div class="text-2xl font-black text-sky-300">01 Prompt</div>
          <div class="text-lg font-bold text-white">請幫我寫研習通知</div>
          <div class="text-base text-amber-200 font-bold pt-2 border-t border-slate-800">➔ 得到本次通知草稿</div>
        </div>
        <div onclick="switchPage('skill', true)" class="cursor-pointer rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-emerald-500/50 p-5 space-y-2">
          <div class="text-2xl font-black text-emerald-300">02 Skill</div>
          <div class="text-lg font-bold text-white">依單位方法製作每場通知</div>
          <div class="text-base text-amber-200 font-bold pt-2 border-t border-slate-800">➔ 重用欄位、範本與檢查標準</div>
        </div>
        <div onclick="switchPage('tool', true)" class="cursor-pointer rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-amber-500/50 p-5 space-y-2">
          <div class="text-2xl font-black text-amber-300">03 Tool</div>
          <div class="text-lg font-bold text-white">讀取名單並計算報名人數</div>
          <div class="text-base text-amber-200 font-bold pt-2 border-t border-slate-800">➔ 得到可核對的數據與檔案</div>
        </div>
        <div onclick="switchPage('agent', true)" class="cursor-pointer rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-purple-500/50 p-5 space-y-2">
          <div class="text-2xl font-black text-purple-300">04 Agent</div>
          <div class="text-lg font-bold text-white">查清不同資料中的日期衝突</div>
          <div class="text-base text-amber-200 font-bold pt-2 border-t border-slate-800">➔ 依結果調整步驟並交付證據</div>
        </div>
        <div onclick="switchPage('bot', true)" class="cursor-pointer rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-rose-500/50 p-5 space-y-2">
          <div class="text-2xl font-black text-rose-300">05 Bot</div>
          <div class="text-lg font-bold text-white">讓同仁在訊息介面詢問研習</div>
          <div class="text-base text-amber-200 font-bold pt-2 border-t border-slate-800">➔ 提供可持續使用的問答服務</div>
        </div>
      </section>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  renderTopTabs();
  renderMainPage();
});
