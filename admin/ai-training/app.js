// ============================================================================
// AI 工作方法與工具選擇｜同仁教育訓練 3D 語音互動入口網站 互動與語音引擎 (app.js)
// ============================================================================

let currentStep = 1;
let voiceEnabled = true;
let isAutoTouring = false;
let autoTourTimer = null;
let audioCtx = null;
let currentFontMode = 'normal'; // 'normal' | 'large' | 'xlarge'

// 五問決策引擎目前選擇狀態
let selectedFiveQ = {
  q1: 'report',
  q2: 'skill',
  q3: 'read_tool',
  q4: 'fixed',
  q5: 'scheduled_share'
};
let activePresetNote = FIVE_QUESTIONS_PRESETS[0].summaryNote;
let activePresetTitle = FIVE_QUESTIONS_PRESETS[0].summaryTitle;

// 圖 4 資料流向目前選擇配置
let currentDataFlowCfgId = 'cfg-hybrid';

// 情境題目前選中題目與作答狀態
let currentQuizIdx = 0;
let userQuizAnswers = {}; // { 'quiz-a': 0, ... }

// ----------------------------------------------------------------------------
// 1. 字體大小切換器（標準大字 / 特大字 / 演講投影超大字）
// ----------------------------------------------------------------------------
function setFontSizeMode(mode) {
  currentFontMode = mode;
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-mode-normal', 'font-mode-large', 'font-mode-xlarge');
  htmlEl.classList.add(`font-mode-${mode}`);

  ['normal', 'large', 'xlarge'].forEach((m) => {
    const btn = document.getElementById(`btn-font-${m}`);
    if (!btn) return;
    if (m === mode) {
      btn.className = 'px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-black text-sm shadow transition-all';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all';
    }
  });
  playTechSound('click');
}

// ----------------------------------------------------------------------------
// 2. Web Audio API 科技音效合成器
// ----------------------------------------------------------------------------
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

function playTechSound(type = 'click') {
  const ctx = getAudioCtx();
  if (!ctx) return;

  if (type === 'click') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } else if (type === 'step') {
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.085);
    });
  } else if (type === 'success') {
    const freqs = [587.33, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  } else if (type === 'warn') {
    const freqs = [440, 349.23];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.09;
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

// ----------------------------------------------------------------------------
// 3. Web Speech API 語音導覽引擎（支援全流程自動劇場與單卡點讀）
// ----------------------------------------------------------------------------
function setSpeakingIndicator(active, subtitleText = '') {
  const wave = document.getElementById('speaking-wave');
  const sub = document.getElementById('banner-voice-subtitle');
  if (wave) {
    if (active) {
      wave.classList.remove('hidden');
      wave.classList.add('inline-flex');
    } else {
      wave.classList.add('hidden');
      wave.classList.remove('inline-flex');
    }
  }
  if (sub && subtitleText) {
    sub.textContent = `「${subtitleText}」`;
  }
}

function speakText(text, onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) setTimeout(onEndCallback, 3000);
    return;
  }
  window.speechSynthesis.cancel();
  setSpeakingIndicator(true, text);

  if (!voiceEnabled) {
    setSpeakingIndicator(false, text);
    if (onEndCallback) setTimeout(onEndCallback, 3500);
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-TW';
  utter.rate = 1.04;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const twVoice =
    voices.find((v) => v.lang.includes('zh-TW') && (v.name.includes('Meijia') || v.name.includes('Google') || v.name.includes('Microsoft'))) ||
    voices.find((v) => v.lang.includes('zh-TW')) ||
    voices.find((v) => v.lang.includes('zh'));
  if (twVoice) utter.voice = twVoice;

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

function toggleVoiceEnabled() {
  voiceEnabled = !voiceEnabled;
  const icon = document.getElementById('voice-icon');
  const label = document.getElementById('voice-label');
  const btn = document.getElementById('btn-voice-toggle');

  if (voiceEnabled) {
    if (icon) icon.textContent = '🔊';
    if (label) label.textContent = '語音導覽：開啟';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400/70 text-sm font-black text-sky-300 transition-all';
    speakCurrentStep(true);
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingIndicator(false);
    if (icon) icon.textContent = '🔇';
    if (label) label.textContent = '語音導覽：靜音';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-sm font-bold text-slate-400 transition-all';
  }
}

function speakCurrentStep(force = false) {
  const stepObj = STAGE_STEPS.find((s) => s.step === currentStep) || STAGE_STEPS[0];
  if (force && !voiceEnabled) {
    voiceEnabled = true;
    const icon = document.getElementById('voice-icon');
    const label = document.getElementById('voice-label');
    if (icon) icon.textContent = '🔊';
    if (label) label.textContent = '語音導覽：開啟';
  }
  speakText(stepObj.voiceText);
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
  if (!voiceEnabled) toggleVoiceEnabled();
  const icon = document.getElementById('tour-icon');
  const label = document.getElementById('tour-label');
  if (icon) icon.textContent = '⏹️';
  if (label) label.textContent = '停止自動導覽';

  runTourStep(currentStep);
}

function stopAutoTour() {
  isAutoTouring = false;
  if (autoTourTimer) clearTimeout(autoTourTimer);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setSpeakingIndicator(false);
  const icon = document.getElementById('tour-icon');
  const label = document.getElementById('tour-label');
  if (icon) icon.textContent = '▶️';
  if (label) label.textContent = '一鍵語音導覽 6 大階梯';
}

function runTourStep(stepNum) {
  if (!isAutoTouring) return;
  goToStep(stepNum, false);
  const stepObj = STAGE_STEPS.find((s) => s.step === stepNum) || STAGE_STEPS[0];
  speakText(stepObj.voiceText, () => {
    if (!isAutoTouring) return;
    autoTourTimer = setTimeout(() => {
      if (!isAutoTouring) return;
      if (currentStep < STAGE_STEPS.length) {
        runTourStep(currentStep + 1);
      } else {
        stopAutoTour();
      }
    }, 900);
  });
}

// ----------------------------------------------------------------------------
// 4. 渲染 90 分鐘課程建議學習順序時間軸
// ----------------------------------------------------------------------------
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = TRAINING_TIMELINE.map((item, idx) => `
    <div
      onclick="handleTimelineClick(${idx})"
      class="card-3d cursor-pointer rounded-2xl bg-slate-900/95 border-2 border-slate-800 hover:border-sky-400/80 p-4 sm:p-5 flex flex-col justify-between transition-all"
    >
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="px-3 py-1 rounded-lg text-sm font-black bg-sky-500/20 text-sky-300 border border-sky-400/40 font-mono-code">
            ⏱️ ${item.time}
          </span>
          <span class="text-xs font-bold text-amber-300">🔊 點擊聽導覽</span>
        </div>
        <h4 class="text-lg sm:text-xl font-black text-white mb-1.5">${idx + 1}. ${item.title}</h4>
        <p class="text-sm sm:text-base text-slate-300 leading-relaxed">${item.desc}</p>
      </div>
      <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm text-sky-400 font-bold">
        <span>對應核心模組</span>
        <span>前往體驗 ➔</span>
      </div>
    </div>
  `).join('');
}

function handleTimelineClick(idx) {
  const item = TRAINING_TIMELINE[idx];
  if (!item) return;
  playTechSound('step');
  if (item.stepIndex) {
    goToStep(item.stepIndex, false);
  }
  speakText(item.voice);
  const el = document.querySelector(item.targetSec);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------------------------------------------
// 5. 渲染 3D 互動主舞台（6 大階梯導覽按鈕 ＋ 3D SVG 狀態連動 ＋ 右側大字條綱解析卡）
// ----------------------------------------------------------------------------
function renderStepPills() {
  const container = document.getElementById('step-pills-container');
  if (!container) return;

  const colorMap = {
    sky: 'border-sky-400 bg-sky-500/20 text-white shadow-lg shadow-sky-500/20',
    emerald: 'border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20',
    amber: 'border-amber-400 bg-amber-500/20 text-white shadow-lg shadow-amber-500/20',
    purple: 'border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20',
    rose: 'border-rose-400 bg-rose-500/20 text-white shadow-lg shadow-rose-500/20'
  };

  container.innerHTML = STAGE_STEPS.map((s) => {
    const isActive = s.step === currentStep;
    const activeCls = isActive
      ? colorMap[s.color] || colorMap.sky
      : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-600 hover:bg-slate-900';

    return `
      <button
        onclick="goToStep(${s.step}, true)"
        class="rounded-2xl border-2 p-3.5 sm:p-4 text-left transition-all flex items-center gap-3.5 ${activeCls}"
      >
        <div class="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
          ${s.icon}
        </div>
        <div class="min-w-0">
          <div class="text-xs font-black tracking-wider uppercase ${isActive ? 'text-amber-300' : 'text-slate-400'}">
            ${s.code}
          </div>
          <div class="text-base sm:text-lg font-black truncate">${s.shortTitle}</div>
        </div>
      </button>
    `;
  }).join('');
}

function goToStep(stepNum, shouldSpeak = true) {
  currentStep = stepNum;
  playTechSound('step');
  renderStepPills();
  updateStageDetailAndSVG();
  if (shouldSpeak) {
    speakCurrentStep(false);
  }
}

function prevStep() {
  if (isAutoTouring) stopAutoTour();
  const next = currentStep > 1 ? currentStep - 1 : STAGE_STEPS.length;
  goToStep(next, true);
}

function nextStep() {
  if (isAutoTouring) stopAutoTour();
  const next = currentStep < STAGE_STEPS.length ? currentStep + 1 : 1;
  goToStep(next, true);
}

function updateStageDetailAndSVG() {
  const s = STAGE_STEPS.find((item) => item.step === currentStep) || STAGE_STEPS[0];

  // 更新橫幅標題與字幕
  const numEl = document.getElementById('banner-step-num');
  const titleEl = document.getElementById('banner-step-title');
  const tagEl = document.getElementById('banner-step-tag');
  const subEl = document.getElementById('banner-voice-subtitle');

  if (numEl) numEl.textContent = s.step;
  if (titleEl) titleEl.textContent = s.title;
  if (tagEl) tagEl.textContent = s.categoryBadge;
  if (subEl) subEl.textContent = `「${s.voiceText}」`;

  // 更新 3D SVG 頂部浮空解說牌
  const svgTitle = document.getElementById('svg-banner-title');
  const svgSub = document.getElementById('svg-banner-sub');
  if (svgTitle) svgTitle.textContent = s.stageBanner;
  if (svgSub) svgSub.textContent = s.stageSub;

  // 高亮對應的 3D 節點光暈與電纜
  const stationIds = ['prompt', 'skill', 'tool', 'agent', 'bot', 'security'];
  stationIds.forEach((id) => {
    const halo = document.getElementById(`halo-${id}`);
    const box = document.getElementById(`box-${id}`);
    if (halo) {
      halo.setAttribute('opacity', s.stageHighlight === id ? '0.65' : '0.15');
    }
    if (box) {
      box.setAttribute('stroke-width', s.stageHighlight === id ? '3.5' : '1.8');
    }
  });

  // 電纜流動效果
  const wires = ['wire-1-2', 'wire-2-3', 'wire-3-4', 'wire-4-5'];
  wires.forEach((wId, idx) => {
    const w = document.getElementById(wId);
    if (!w) return;
    if (currentStep >= idx + 2 || currentStep === 6) {
      w.classList.add('wire-flow');
      w.setAttribute('opacity', '0.95');
    } else {
      w.classList.remove('wire-flow');
      w.setAttribute('opacity', '0.3');
    }
  });

  // 渲染右側大字條綱解析面板
  const detailContainer = document.getElementById('stage-detail-panel');
  if (!detailContainer) return;

  detailContainer.innerHTML = `
    <div class="space-y-5">
      <!-- 1. 核心定義與好壞對照 -->
      <div class="rounded-2xl bg-slate-950/90 border-2 border-slate-800 p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2.5">
            <span class="outline-pill bg-sky-500/20 text-sky-300 border border-sky-400/40">綱要 01</span>
            <h3 class="text-xl sm:text-2xl font-black text-white">核心定位與實務對照</h3>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-slate-800 text-amber-300 border border-slate-700">
            ${s.categoryBadge}
          </span>
        </div>
        <p class="text-base sm:text-lg text-slate-200 leading-relaxed mb-4">
          ${s.definition}
        </p>
        <div class="grid grid-cols-1 gap-3">
          <div class="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3.5 text-sm sm:text-base text-rose-200 font-medium">
            ${s.exampleBad}
          </div>
          <div class="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3.5 text-sm sm:text-base text-emerald-200 font-bold">
            ${s.exampleGood}
          </div>
        </div>
      </div>

      <!-- 2. 能夠做到的功能 vs. 面臨的挑戰與誤區 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 能做到什麼 -->
        <div class="rounded-2xl bg-slate-950/90 border-2 border-emerald-500/40 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <span class="outline-pill bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">綱要 02</span>
              <h4 class="text-lg sm:text-xl font-black text-emerald-300">✅ 能夠做到的功能</h4>
            </div>
            <ul class="space-y-2.5 text-base text-slate-200">
              ${s.canDo.map((item) => `<li class="flex items-start gap-2.5"><span class="text-emerald-400 font-black mt-1">✔</span><span>${item}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- 挑戰與不能推定事項 -->
        <div class="rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <span class="outline-pill bg-amber-500/20 text-amber-300 border border-amber-400/40">綱要 03</span>
              <h4 class="text-lg sm:text-xl font-black text-amber-300">⚠️ 挑戰與常見誤區</h4>
            </div>
            <ul class="space-y-2.5 text-base text-slate-200">
              ${s.challenges.map((item) => `<li class="flex items-start gap-2.5"><span class="text-amber-400 font-black mt-1">▲</span><span>${item}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- 3. 必備驗收證據與真人把關 -->
      <div class="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border-2 border-indigo-400/40 p-5">
        <div class="flex items-center gap-2.5 mb-3">
          <span class="outline-pill bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">綱要 04</span>
          <h4 class="text-lg sm:text-xl font-black text-indigo-200">🔍 功能名稱之外，還要留下哪些「驗收證據」？</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          ${s.evidence.map((ev, i) => `
            <div class="rounded-xl bg-slate-900/90 border border-slate-700 p-3.5 text-sm sm:text-base text-slate-200">
              <span class="inline-block px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-black text-xs mb-1">檢核點 ${i + 1}</span>
              <div>${ev}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 6. 渲染四大層次深度對照表（Prompt vs. Skill vs. 固定流程 vs. Agent）
// ----------------------------------------------------------------------------
function renderComparisonTiers() {
  const container = document.getElementById('comparison-tiers-container');
  if (!container) return;

  const borderColors = {
    sky: 'border-sky-500/50 hover:border-sky-400',
    emerald: 'border-emerald-500/50 hover:border-emerald-400',
    amber: 'border-amber-500/50 hover:border-amber-400',
    purple: 'border-purple-500/50 hover:border-purple-400'
  };

  const badgeColors = {
    sky: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-400/40'
  };

  container.innerHTML = CORE_COMPARISON_TIERS.map((t, idx) => `
    <div class="card-3d rounded-3xl bg-slate-900/95 border-2 ${borderColors[t.color]} p-6 flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span class="px-3.5 py-1 rounded-full text-sm font-black border ${badgeColors[t.color]}">
            ${t.badge}
          </span>
          <button
            onclick="speakTierCard(${idx})"
            class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-amber-300 border border-slate-700 transition"
          >
            🔊 聽語音比較
          </button>
        </div>

        <h3 class="text-2xl font-black text-white mb-1">${t.name}</h3>
        <p class="text-base text-slate-300 font-medium mb-4">${t.tagline}</p>

        <div class="space-y-2.5 mb-4 text-sm sm:text-base bg-slate-950/90 rounded-2xl p-4 border border-slate-800">
          <div><span class="font-black text-sky-300">🕹️ 誰掌握控制權：</span><span class="text-slate-200">${t.controlOwner}</span></div>
          <div><span class="font-black text-emerald-300">♻️ 方法保存方式：</span><span class="text-slate-200">${t.reuseMethod}</span></div>
          <div><span class="font-black text-amber-300">🎯 何時優先選用：</span><span class="text-slate-200">${t.whenToUse}</span></div>
        </div>

        <div class="mb-4">
          <div class="text-base font-black text-emerald-300 mb-2">✅ 能夠做到的功能：</div>
          <ul class="space-y-1.5 text-sm sm:text-base text-slate-200">
            ${t.canDoList.map((c) => `<li class="flex items-start gap-2"><span class="text-emerald-400 font-bold">●</span><span>${c}</span></li>`).join('')}
          </ul>
        </div>

        <div class="mb-4">
          <div class="text-base font-black text-rose-300 mb-2">⚠️ 面臨的挑戰與限制：</div>
          <ul class="space-y-1.5 text-sm sm:text-base text-slate-200">
            ${t.challengeList.map((c) => `<li class="flex items-start gap-2"><span class="text-rose-400 font-bold">▲</span><span>${c}</span></li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="pt-3.5 border-t border-slate-800">
        <div class="text-xs font-black uppercase tracking-wider text-indigo-300 mb-1">🏛️ 學校行政實務代表情境</div>
        <div class="text-sm sm:text-base font-bold text-white">${t.adminCase}</div>
      </div>
    </div>
  `).join('');
}

function speakTierCard(idx) {
  const t = CORE_COMPARISON_TIERS[idx];
  if (!t) return;
  playTechSound('click');
  const text = `${t.name}：${t.tagline}。控制權在於：${t.controlOwner}。適用時機：${t.whenToUse}。主要挑戰是：${t.challengeList.join('；')}。`;
  speakText(text);
}

// ----------------------------------------------------------------------------
// 7. 渲染圖 1「同一項任務可以同時使用這些元件」8 大名詞分工牆
// ----------------------------------------------------------------------------
function renderEightComponents() {
  const container = document.getElementById('eight-components-grid');
  if (!container) return;

  container.innerHTML = EIGHT_COMPONENTS.map((c, idx) => `
    <div
      onclick="speakComponentCard(${idx})"
      class="card-3d cursor-pointer rounded-3xl bg-slate-900/95 border-2 border-slate-800 hover:border-sky-400/70 p-5 sm:p-6 flex flex-col justify-between transition-all"
    >
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl">
              ${c.icon}
            </span>
            <div>
              <h4 class="text-xl font-black text-white">${c.name}</h4>
              <span class="text-sm font-bold text-sky-300">${c.role}</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs sm:text-sm font-black border border-slate-700">
            ${c.questionRef}
          </span>
        </div>

        <div class="mb-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div class="text-xs font-black text-emerald-400 mb-1">✅ 解決的問題</div>
          <p class="text-sm sm:text-base text-slate-200 leading-relaxed">${c.whatItDoes}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
          <div class="text-xs font-black text-rose-300 mb-1">🚫 不能據此推定（常見誤區）</div>
          <p class="text-sm sm:text-base text-rose-100 leading-relaxed">${c.cannotAssume}</p>
        </div>
      </div>

      <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm text-slate-400 font-bold">
        <span>方格位置不代表能力高低</span>
        <span class="text-sky-300">🔊 點擊聽語音解說</span>
      </div>
    </div>
  `).join('');
}

function speakComponentCard(idx) {
  const c = EIGHT_COMPONENTS[idx];
  if (!c) return;
  playTechSound('click');
  speakText(c.voice);
}

// ----------------------------------------------------------------------------
// 8. 渲染圖 2「用五個問題組合工作方式」互動決策引擎
// ----------------------------------------------------------------------------
function renderFiveQuestionsEngine() {
  const presetBar = document.getElementById('fiveq-presets-bar');
  if (presetBar) {
    presetBar.innerHTML = FIVE_QUESTIONS_PRESETS.map((p, idx) => `
      <button
        onclick="applyFiveQPreset(${idx})"
        class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-100 font-bold text-sm sm:text-base border border-slate-700 transition-all"
      >
        ${p.name}
      </button>
    `).join('');
  }

  const qContainer = document.getElementById('fiveq-questions-list');
  if (!qContainer) return;

  const qKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  qContainer.innerHTML = qKeys.map((key) => {
    const qObj = FIVE_QUESTIONS_OPTIONS[key];
    const currentChoiceId = selectedFiveQ[key];

    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-slate-800 p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2.5">
            <span class="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-sm">${qObj.num}</span>
            <h4 class="text-lg sm:text-xl font-black text-white">${qObj.title}</h4>
          </div>
          <span class="text-xs sm:text-sm text-slate-400">${qObj.hint}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          ${qObj.choices.map((ch) => {
            const active = ch.id === currentChoiceId;
            return `
              <button
                onclick="selectFiveQChoice('${key}', '${ch.id}')"
                class="rounded-xl p-4 text-left border-2 transition-all flex flex-col justify-between ${
                  active
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/15'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-600'
                }"
              >
                <div class="text-base font-black mb-2 ${active ? 'text-sky-200' : 'text-white'}">${ch.label}</div>
                <div class="text-xs sm:text-sm ${active ? 'text-amber-200 font-bold' : 'text-slate-400'}">${ch.rec}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  updateFiveQSummaryCard();
}

function selectFiveQChoice(qKey, choiceId) {
  selectedFiveQ[qKey] = choiceId;
  activePresetTitle = '自訂行政任務組合方案';
  activePresetNote = '已依您逐題勾選的五個問題條件，動態組合出最適合且最簡單的 AI 工作方式與驗收重點：';
  playTechSound('click');
  renderFiveQuestionsEngine();
}

function applyFiveQPreset(idx) {
  const p = FIVE_QUESTIONS_PRESETS[idx];
  if (!p) return;
  selectedFiveQ = {
    q1: p.q1,
    q2: p.q2,
    q3: p.q3,
    q4: p.q4,
    q5: p.q5
  };
  activePresetTitle = p.summaryTitle;
  activePresetNote = p.summaryNote;
  playTechSound('success');
  renderFiveQuestionsEngine();
  speakText(`${p.summaryTitle}。${p.summaryNote}`);
}

function updateFiveQSummaryCard() {
  const box = document.getElementById('fiveq-result-box');
  if (!box) return;

  const qKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const recItems = qKeys.map((k) => {
    const qObj = FIVE_QUESTIONS_OPTIONS[k];
    const ch = qObj.choices.find((c) => c.id === selectedFiveQ[k]) || qObj.choices[0];
    return {
      num: qObj.num,
      title: qObj.title,
      choiceLabel: ch.label,
      rec: ch.rec
    };
  });

  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
      <div>
        <span class="px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
          🧭 圖 2 任務組合診斷結果
        </span>
        <h4 class="text-xl sm:text-2xl font-black text-white mt-2">${activePresetTitle}</h4>
      </div>
      <button
        onclick="speakText('${activePresetTitle}。${activePresetNote}')"
        class="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all"
      >
        🔊 朗讀組合建議
      </button>
    </div>

    <p class="text-base sm:text-lg text-amber-200 font-bold leading-relaxed mb-4">
      💡 總評：${activePresetNote}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
      ${recItems.map((r) => `
        <div class="rounded-2xl bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
          <div>
            <div class="text-xs font-black text-sky-400 mb-1">${r.num}｜${r.title}</div>
            <div class="text-sm sm:text-base font-black text-white mb-2">${r.choiceLabel}</div>
          </div>
          <div class="text-xs sm:text-sm text-emerald-300 border-t border-slate-800 pt-2">${r.rec}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 9. 渲染圖 4「介面 × 推論 × 檔案」三位置拆解模擬器 ＋ 第 6 節六大資安檢查卡
// ----------------------------------------------------------------------------
function renderDataFlowSimulator() {
  const btnBar = document.getElementById('dataflow-cfg-buttons');
  if (btnBar) {
    btnBar.innerHTML = DATA_FLOW_CONFIGS.map((cfg) => {
      const active = cfg.id === currentDataFlowCfgId;
      return `
        <button
          onclick="selectDataFlowCfg('${cfg.id}')"
          class="px-4 py-3 rounded-2xl border-2 font-black text-sm sm:text-base text-left transition-all ${
            active
              ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/15'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
          }"
        >
          <div class="text-xs text-amber-300 mb-0.5">${cfg.badge}</div>
          <div>${cfg.name}</div>
        </button>
      `;
    }).join('');
  }

  const cfg = DATA_FLOW_CONFIGS.find((c) => c.id === currentDataFlowCfgId) || DATA_FLOW_CONFIGS[0];
  const display = document.getElementById('dataflow-display-panel');
  if (display) {
    display.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div class="rounded-2xl bg-slate-950 border-2 border-sky-500/50 p-5">
          <div class="text-xs font-black uppercase tracking-wider text-sky-400 mb-1">位置 ①｜使用介面 (UI)</div>
          <div class="text-lg sm:text-xl font-black text-white mb-2">我在哪裡交辦任務？</div>
          <div class="text-base text-sky-200 font-bold">${cfg.uiPos}</div>
        </div>

        <div class="rounded-2xl bg-slate-950 border-2 border-purple-500/50 p-5">
          <div class="text-xs font-black uppercase tracking-wider text-purple-400 mb-1">位置 ②｜模型推論位置 (Model)</div>
          <div class="text-lg sm:text-xl font-black text-white mb-2">誰在負責理解與思考？</div>
          <div class="text-base text-purple-200 font-bold">${cfg.modelPos}</div>
        </div>

        <div class="rounded-2xl bg-slate-950 border-2 border-emerald-500/50 p-5">
          <div class="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">位置 ③｜工具與資料位置 (Storage)</div>
          <div class="text-lg sm:text-xl font-black text-white mb-2">在哪裡讀寫檔案？</div>
          <div class="text-base text-emerald-200 font-bold">${cfg.toolPos}</div>
        </div>
      </div>

      <div class="rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="text-base sm:text-lg font-black text-rose-200">${cfg.whatLeavesPC}</div>
          <div class="text-sm sm:text-base font-bold text-amber-300">${cfg.mythAlert}</div>
        </div>
        <button
          onclick="speakText('${cfg.voice}')"
          class="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-sm shrink-0 transition"
        >
          🔊 聽圖 4 關鍵提醒
        </button>
      </div>
    `;
  }
}

function selectDataFlowCfg(cfgId) {
  currentDataFlowCfgId = cfgId;
  playTechSound('step');
  renderDataFlowSimulator();
  const cfg = DATA_FLOW_CONFIGS.find((c) => c.id === cfgId);
  if (cfg) speakText(cfg.voice);
}

function renderSecurityChecks() {
  const container = document.getElementById('security-checks-grid');
  if (!container) return;

  container.innerHTML = SECURITY_CHECKS.map((chk, idx) => `
    <div
      onclick="speakSecurityCard(${idx})"
      class="card-3d cursor-pointer rounded-3xl bg-slate-900/95 border-2 border-slate-800 hover:border-amber-400/70 p-6 flex flex-col justify-between"
    >
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-400/40">
            ${chk.num}
          </span>
          <span class="text-xs sm:text-sm font-bold text-sky-300">🔊 點擊聽語音</span>
        </div>

        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">${chk.icon}</span>
          <h4 class="text-xl font-black text-white">${chk.title}</h4>
        </div>

        <p class="text-sm sm:text-base font-bold text-amber-200 mb-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          ${chk.summary}
        </p>

        <ul class="space-y-2 text-sm sm:text-base text-slate-200">
          ${chk.points.map((pt) => `<li class="flex items-start gap-2"><span class="text-emerald-400 font-black">✔</span><span>${pt}</span></li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function speakSecurityCard(idx) {
  const chk = SECURITY_CHECKS[idx];
  if (!chk) return;
  playTechSound('click');
  speakText(chk.voice);
}

// ----------------------------------------------------------------------------
// 10. 渲染講義第 7–8 節「三題行政情境練習」與「我的工作五問套用工坊」
// ----------------------------------------------------------------------------
function renderScenarioQuizzes() {
  const tabs = document.getElementById('quiz-tabs-bar');
  if (tabs) {
    tabs.innerHTML = SCENARIO_QUIZZES.map((q, idx) => {
      const active = idx === currentQuizIdx;
      const answered = userQuizAnswers[q.id] !== undefined;
      return `
        <button
          onclick="selectQuizTab(${idx})"
          class="px-5 py-3 rounded-2xl border-2 font-black text-base transition-all flex items-center gap-2 ${
            active
              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-600'
          }"
        >
          <span>${q.code}</span>
          ${answered ? '<span class="text-xs px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300">已作答</span>' : ''}
        </button>
      `;
    }).join('');
  }

  const q = SCENARIO_QUIZZES[currentQuizIdx] || SCENARIO_QUIZZES[0];
  const chosenIdx = userQuizAnswers[q.id];
  const body = document.getElementById('quiz-body-panel');
  if (!body) return;

  body.innerHTML = `
    <div class="rounded-3xl bg-slate-950/90 border-2 border-slate-800 p-6 sm:p-7">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span class="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black text-sm">
          ${q.code}｜課堂情境實戰與互評
        </span>
        <button
          onclick="speakText('${q.voice}')"
          class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-slate-700"
        >
          🔊 聽參考解答語音
        </button>
      </div>

      <h4 class="text-xl sm:text-2xl font-black text-white mb-2">${q.title}</h4>
      <p class="text-base sm:text-lg text-slate-300 mb-5">${q.question}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        ${q.options.map((opt, oIdx) => {
          const isSelected = chosenIdx === oIdx;
          let cardCls = 'bg-slate-900 border-slate-700 hover:border-sky-400 text-slate-100';
          let statusBadge = '';
          if (chosenIdx !== undefined) {
            if (opt.isBest) {
              cardCls = 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg shadow-emerald-500/15';
              statusBadge = '<span class="px-2.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-xs">✅ 講義優先推薦做法</span>';
            } else if (isSelected && !opt.isBest) {
              cardCls = 'bg-rose-950/60 border-rose-400 text-rose-100';
              statusBadge = '<span class="px-2.5 py-0.5 rounded bg-rose-400 text-slate-950 font-black text-xs">⚠️ 非優先做法（請看下方取捨解析）</span>';
            } else {
              cardCls = 'bg-slate-900/50 border-slate-800 text-slate-400';
            }
          }

          return `
            <button
              onclick="answerQuiz('${q.id}', ${oIdx})"
              class="rounded-2xl border-2 p-5 text-left transition-all flex flex-col justify-between ${cardCls}"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-2xl font-black text-sky-300">選項 ${opt.num}</span>
                  ${statusBadge}
                </div>
                <p class="text-base sm:text-lg font-bold leading-relaxed">${opt.text}</p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-slate-800/80 text-xs sm:text-sm font-bold text-sky-300">
                👇 點擊選擇並查看五問解析
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- 解答與五問拆解（作答後展開，或可一鍵直接展開） -->
      <div class="${chosenIdx !== undefined ? 'block' : 'hidden'} rounded-2xl bg-slate-900 border-2 border-emerald-500/50 p-5 sm:p-6 space-y-4">
        <div class="text-xl font-black text-emerald-300">${q.answerTitle}</div>
        <p class="text-base sm:text-lg text-slate-200 leading-relaxed">${q.whyBest}</p>
        <div class="border-t border-slate-800 pt-4">
          <div class="text-base font-black text-amber-300 mb-2.5">📋 用五個問題補上元件、權限邊界與驗收標準（滿分 8 分示範）：</div>
          <ul class="space-y-2 text-sm sm:text-base text-slate-200">
            ${q.fiveQBreakdown.map((line) => `<li class="p-3 rounded-xl bg-slate-950 border border-slate-800">${line}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function selectQuizTab(idx) {
  currentQuizIdx = idx;
  playTechSound('click');
  renderScenarioQuizzes();
}

function answerQuiz(quizId, optionIdx) {
  userQuizAnswers[quizId] = optionIdx;
  const q = SCENARIO_QUIZZES.find((item) => item.id === quizId);
  if (q && q.options[optionIdx]?.isBest) {
    playTechSound('success');
  } else {
    playTechSound('warn');
  }
  renderScenarioQuizzes();
  if (q) speakText(q.voice);
}

// ----------------------------------------------------------------------------
// 11. 「我的工作套用練習」互動產生器與一鍵複製
// ----------------------------------------------------------------------------
function fillPracticePreset(type) {
  const nameEl = document.getElementById('ws-task-name');
  const q1El = document.getElementById('ws-q1');
  const q2El = document.getElementById('ws-q2');
  const q3El = document.getElementById('ws-q3');
  const q4El = document.getElementById('ws-q4');
  const q5El = document.getElementById('ws-q5');

  if (type === 'seminar') {
    nameEl.value = '每週研習報名人數統計與催辦通知草稿';
    q1El.value = '每週產出各單位報名人數統計表、待確認項目清單及通知信草稿；總數須與表單一致，不自動寄出。';
    q2El.value = '是（每週常態重用）。先整理統計口徑（含重複報名與取消處理）與通知範本，穩定後建立並啟用 Skill。';
    q3El.value = '讀取指定報名回覆試算表與核定公告（僅取單位與報名狀態等必要欄位，最小讀取權限），輸出摘要檔。';
    q4El.value = '例行統計由試算表公式或固定流程決定；缺漏或衝突項目交回承辦人裁決（例外追查才評估受限 Agent）。';
    q5El.value = '承辦人先用測試資料手動試跑通過，再設每週一 09:00 (Asia/Taipei) 排程；成果以共享文件供同仁查閱，不建 Bot。';
  } else if (type === 'faq') {
    nameEl.value = '處室常見法規與補助辦法公告問答服務';
    q1El.value = '依據已核定公開之補助公告回答同仁詢問；每則回答必附官方公告連結與核定版本，查無資料則轉人工窗口。';
    q2El.value = '是。保存標準回答口徑、引用格式與轉人工提示語。';
    q3El.value = '僅連接「已核定公開公告資料夾」讀取權限，不連接內部未定稿公文或申請人個資表。';
    q4El.value = '採用固定查詢流程搭配 AI 閱讀指定資料回答，不需要會搜尋全網的動態 Agent。';
    q5El.value = '以 Teams 聊天 Bot 或戰情表網站作為入口；上線前指定內容負責人與技術維護人，並公告錯誤回報管道。';
  }
  playTechSound('success');
  updatePracticePreview();
}

function updatePracticePreview() {
  const name = document.getElementById('ws-task-name')?.value || '（尚未填寫工作名稱）';
  const q1 = document.getElementById('ws-q1')?.value || '（待填寫成果與驗收標準）';
  const q2 = document.getElementById('ws-q2')?.value || '（待填寫重用方式：單次 Prompt / 範本 / Skill）';
  const q3 = document.getElementById('ws-q3')?.value || '（待填寫所需資料、工具與最小權限範圍）';
  const q4 = document.getElementById('ws-q4')?.value || '（待填寫控制權：人 / 固定流程 / 受限 Agent）';
  const q5 = document.getElementById('ws-q5')?.value || '（待填寫啟動方式、使用對象與失敗處理窗口）';

  const preview = document.getElementById('ws-output-preview');
  if (!preview) return;

  preview.textContent = `【AI 行政工作五問規劃與交辦卡】
■ 工作名稱：${name}

1️⃣ 交付什麼成果？如何驗收？
➔ ${q1}

2️⃣ 方法要重複使用嗎？（Prompt / 範本 / Skill）
➔ ${q2}

3️⃣ 需要哪些資料與動作？（工具 / 帳號身分 / 最小權限邊界）
➔ ${q3}

4️⃣ 誰決定下一步？（人 / 固定流程 / 受限 Agent 與理由）
➔ ${q4}

5️⃣ 如何啟動並讓誰使用？（手動 / 排程 / 共享文件 / Bot 維運窗口）
➔ ${q5}

---
【給 AI 的結構化交辦 Prompt 範本】
請協助執行「${name}」。
- 依據與權限範圍：${q3}
- 目標成果與驗收標準：${q1}
- 處理原則：請嚴格依核定資料處理；若遇到資料缺漏、日期或條文衝突，請一律標示為「❓ 待承辦人確認」並附上來源位置，絕對不要自行猜測或擅自執行對外正式動作。`;
}

function copyPracticeOutput(btnEl) {
  const preview = document.getElementById('ws-output-preview');
  if (!preview) return;
  navigator.clipboard.writeText(preview.textContent).then(() => {
    playTechSound('success');
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ 已複製完整五問規劃與 Prompt！';
    setTimeout(() => {
      btnEl.innerHTML = orig;
    }, 2200);
  });
}

// ----------------------------------------------------------------------------
// 初始化入口
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  renderTimeline();
  renderStepPills();
  updateStageDetailAndSVG();
  renderComparisonTiers();
  renderEightComponents();
  renderFiveQuestionsEngine();
  renderDataFlowSimulator();
  renderSecurityChecks();
  renderScenarioQuizzes();
  fillPracticePreset('seminar');
});
