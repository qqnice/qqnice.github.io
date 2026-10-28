// ============================================================================
// AI 工作應用圖文手冊｜Prompt・Skill・Tool・Agent・Bot 五頁式互動導覽網站 (app.js)
// ============================================================================

let currentPageId = 'prompt'; // 'prompt' | 'skill' | 'tool' | 'agent' | 'bot' | 'overview'
let currentAnimStep = 1;      // 1 ~ 4 (目前頁面圖解動畫停留的步驟)
let isPlayingDiagramAnim = false;
let diagramAnimTimer = null;
let voiceEnabled = true;
let audioCtx = null;
let currentFontMode = 'normal';

// 各頁專屬互動小工具狀態
let promptCompareMode = 'good'; // 'bad' | 'good'
let skillTestIdx = 0;           // 0 | 1 | 2
let toolFilterMode = 'result';  // 'raw' | 'result'
let agentSourceIdx = 3;         // 0 | 1 | 2 | 3 (全部查完觸發停止)
let botChatIdx = 0;             // 0 | 1 | 2

// ----------------------------------------------------------------------------
// 1. 字體大小切換（標準大字 / 特大字 / 投影超大）
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
// 2. 音效與語音導覽引擎
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
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(860, ctx.currentTime + 0.055);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  } else if (type === 'step') {
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, idx) => {
      const start = ctx.currentTime + idx * 0.05;
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
      const start = ctx.currentTime + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.055, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }
}

function setSpeakingWave(active, subtitle = '') {
  const wave = document.getElementById('speaking-wave');
  const subEl = document.getElementById('voice-status-text');
  if (wave) {
    if (active) {
      wave.classList.remove('hidden');
      wave.classList.add('inline-flex');
    } else {
      wave.classList.add('hidden');
      wave.classList.remove('inline-flex');
    }
  }
  if (subEl && subtitle) {
    subEl.textContent = subtitle;
  }
}

function speakText(text, onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) setTimeout(onEndCallback, 2600);
    return;
  }
  window.speechSynthesis.cancel();
  setSpeakingWave(true, text);

  if (!voiceEnabled) {
    setSpeakingWave(false, text);
    if (onEndCallback) setTimeout(onEndCallback, 2600);
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-TW';
  utter.rate = 1.03;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const twVoice =
    voices.find((v) => v.lang.includes('zh-TW') && (v.name.includes('Meijia') || v.name.includes('Google') || v.name.includes('Microsoft'))) ||
    voices.find((v) => v.lang.includes('zh-TW')) ||
    voices.find((v) => v.lang.includes('zh'));
  if (twVoice) utter.voice = twVoice;

  utter.onend = () => {
    setSpeakingWave(false);
    if (onEndCallback) onEndCallback();
  };
  utter.onerror = () => {
    setSpeakingWave(false);
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
    if (label) label.textContent = '語音：開啟';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400 text-sm font-black text-sky-300 transition-all';
    speakCurrentPageIntro();
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingWave(false);
    if (icon) icon.textContent = '🔇';
    if (label) label.textContent = '語音：靜音';
    if (btn) btn.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-sm font-bold text-slate-400 transition-all';
  }
}

function speakCurrentPageIntro() {
  if (currentPageId === 'overview') {
    speakText('這是五種 AI 工作要素的總覽頁：Prompt 交代這一次要什麼，Skill 保存一類工作怎麼做，Tool 提供實際能做的動作，Agent 在邊界內安排與調整步驟，Bot 把能力提供成可使用的訊息服務。它們不是互斥的高低排名，可以依任務需求自由組合！');
    return;
  }
  const page = FIVE_PAGES.find((p) => p.id === currentPageId) || FIVE_PAGES[0];
  speakText(page.pageVoice);
}

// ----------------------------------------------------------------------------
// 3. 頂部 5 大功能頁面切換列 (5-Page Tabs + 總覽頁按鈕)
// ----------------------------------------------------------------------------
function renderTopPageTabs() {
  const container = document.getElementById('five-page-tabs');
  if (!container) return;

  const activeStyles = {
    blue: 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/30 scale-[1.02]',
    emerald: 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30 scale-[1.02]',
    amber: 'bg-amber-400 text-slate-950 border-amber-200 shadow-lg shadow-amber-400/30 scale-[1.02]',
    purple: 'bg-purple-500 text-white border-purple-300 shadow-lg shadow-purple-500/30 scale-[1.02]',
    rose: 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/30 scale-[1.02]'
  };

  const tabsHtml = FIVE_PAGES.map((p) => {
    const isActive = currentPageId === p.id;
    const cls = isActive
      ? activeStyles[p.color]
      : 'bg-slate-900/95 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500';

    return `
      <button
        onclick="switchPage('${p.id}', true)"
        class="rounded-2xl border-2 px-4 py-3.5 text-left transition-all flex items-center gap-3.5 ${cls}"
      >
        <div class="w-12 h-12 rounded-xl ${isActive ? 'bg-slate-950/20' : 'bg-slate-950 border border-slate-800'} flex items-center justify-center text-2xl shrink-0">
          ${p.icon}
        </div>
        <div class="min-w-0">
          <div class="text-xs font-black tracking-wider uppercase ${isActive ? 'opacity-90' : 'text-slate-400'}">
            PAGE ${p.num}
          </div>
          <div class="text-lg sm:text-xl font-black leading-tight truncate">${p.name}</div>
          <div class="text-xs sm:text-sm font-bold truncate ${isActive ? 'opacity-95' : 'text-slate-400'}">${p.zhTitle}</div>
        </div>
      </button>
    `;
  }).join('');

  // 第 6 個按鈕：五者總覽與組合比較
  const isOverview = currentPageId === 'overview';
  const overviewBtn = `
    <button
      onclick="switchPage('overview', true)"
      class="rounded-2xl border-2 px-4 py-3.5 text-left transition-all flex items-center gap-3.5 ${
        isOverview
          ? 'bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 border-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
          : 'bg-slate-900/95 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
      }"
    >
      <div class="w-12 h-12 rounded-xl ${isOverview ? 'bg-slate-950/20' : 'bg-slate-950 border border-slate-800'} flex items-center justify-center text-2xl shrink-0">
        🗺️
      </div>
      <div class="min-w-0">
        <div class="text-xs font-black tracking-wider uppercase ${isOverview ? 'opacity-90' : 'text-amber-300'}">
          OVERVIEW
        </div>
        <div class="text-lg sm:text-xl font-black leading-tight truncate">五者總覽與組合</div>
        <div class="text-xs sm:text-sm font-bold truncate ${isOverview ? 'opacity-95' : 'text-slate-400'}">同一場研習五種用法</div>
      </div>
    </button>
  `;

  container.innerHTML = tabsHtml + overviewBtn;
}

function switchPage(pageId, shouldSpeak = true) {
  stopDiagramAnimation();
  currentPageId = pageId;
  currentAnimStep = 1;
  playTechSound('step');
  renderTopPageTabs();
  renderCurrentPageContent();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (shouldSpeak) {
    speakCurrentPageIntro();
  }
}

function prevPage() {
  const order = ['prompt', 'skill', 'tool', 'agent', 'bot', 'overview'];
  const idx = order.indexOf(currentPageId);
  const prevIdx = idx > 0 ? idx - 1 : order.length - 1;
  switchPage(order[prevIdx], true);
}

function nextPage() {
  const order = ['prompt', 'skill', 'tool', 'agent', 'bot', 'overview'];
  const idx = order.indexOf(currentPageId);
  const nextIdx = idx < order.length - 1 ? idx + 1 : 0;
  switchPage(order[nextIdx], true);
}

// ----------------------------------------------------------------------------
// 4. 圖解動畫控制器（4 步循環動畫 ＋ 語音圖說）
// ----------------------------------------------------------------------------
function toggleDiagramAnimation() {
  if (isPlayingDiagramAnim) {
    stopDiagramAnimation();
  } else {
    startDiagramAnimation();
  }
}

function startDiagramAnimation() {
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;
  isPlayingDiagramAnim = true;
  updateAnimPlayButton();
  runAnimStepSequence(1);
}

function stopDiagramAnimation() {
  isPlayingDiagramAnim = false;
  if (diagramAnimTimer) clearTimeout(diagramAnimTimer);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setSpeakingWave(false);
  updateAnimPlayButton();
}

function updateAnimPlayButton() {
  const btn = document.getElementById('btn-play-diagram-anim');
  if (!btn) return;
  if (isPlayingDiagramAnim) {
    btn.innerHTML = '<span>⏹️</span><span>停止圖解動畫</span>';
    btn.className = 'flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-base shadow-lg transition-all';
  } else {
    btn.innerHTML = '<span>▶️</span><span>播放步驟動畫＋語音圖說</span>';
    btn.className = 'flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all';
  }
}

function runAnimStepSequence(stepNum) {
  if (!isPlayingDiagramAnim) return;
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;

  selectDiagramStep(stepNum, false);
  const stepObj = page.animSteps.find((s) => s.step === stepNum) || page.animSteps[0];

  speakText(stepObj.voice, () => {
    if (!isPlayingDiagramAnim) return;
    diagramAnimTimer = setTimeout(() => {
      if (!isPlayingDiagramAnim) return;
      if (stepNum < page.animSteps.length) {
        runAnimStepSequence(stepNum + 1);
      } else {
        stopDiagramAnimation();
      }
    }, 750);
  });
}

function selectDiagramStep(stepNum, shouldSpeak = true) {
  currentAnimStep = stepNum;
  playTechSound('click');
  const page = FIVE_PAGES.find((p) => p.id === currentPageId);
  if (!page) return;

  // 更新 4 個步驟節點的視覺發光與圖說文字
  const glowClsMap = {
    blue: 'node-glow-blue border-sky-400 bg-sky-950/70',
    emerald: 'node-glow-emerald border-emerald-400 bg-emerald-950/70',
    amber: 'node-glow-amber border-amber-400 bg-amber-950/70',
    purple: 'node-glow-purple border-purple-400 bg-purple-950/70',
    rose: 'node-glow-rose border-rose-400 bg-rose-950/70'
  };

  page.animSteps.forEach((s) => {
    const nodeEl = document.getElementById(`anim-node-${s.step}`);
    if (!nodeEl) return;
    if (s.step === currentAnimStep) {
      nodeEl.className = `cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${glowClsMap[page.color]}`;
    } else {
      nodeEl.className = 'cursor-pointer rounded-2xl border-2 border-slate-700/90 bg-slate-900/90 hover:border-slate-500 p-5 transition-all duration-300 opacity-80 hover:opacity-100';
    }
  });

  // 更新大型圖說字幕盒
  const stepObj = page.animSteps.find((s) => s.step === currentAnimStep) || page.animSteps[0];
  const captionBox = document.getElementById('diagram-caption-text');
  const captionStepBadge = document.getElementById('diagram-caption-badge');
  if (captionBox) captionBox.textContent = stepObj.caption;
  if (captionStepBadge) captionStepBadge.textContent = `圖說步驟 ${stepObj.step} / ${page.animSteps.length}`;

  if (shouldSpeak) {
    speakText(stepObj.voice);
  }
}

// ----------------------------------------------------------------------------
// 5. 渲染當前頁面的完整內容（單一功能獨立大頁面 vs. 總覽頁）
// ----------------------------------------------------------------------------
function renderCurrentPageContent() {
  const mainContainer = document.getElementById('page-main-container');
  if (!mainContainer) return;

  if (currentPageId === 'overview') {
    mainContainer.innerHTML = renderOverviewPageHtml();
    return;
  }

  const page = FIVE_PAGES.find((p) => p.id === currentPageId) || FIVE_PAGES[0];
  const stepObj = page.animSteps.find((s) => s.step === currentAnimStep) || page.animSteps[0];

  const badgeColors = {
    blue: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-400/50'
  };

  const glowClsMap = {
    blue: 'node-glow-blue border-sky-400 bg-sky-950/70',
    emerald: 'node-glow-emerald border-emerald-400 bg-emerald-950/70',
    amber: 'node-glow-amber border-amber-400 bg-amber-950/70',
    purple: 'node-glow-purple border-purple-400 bg-purple-950/70',
    rose: 'node-glow-rose border-rose-400 bg-rose-950/70'
  };

  mainContainer.innerHTML = `
    <div class="page-fade-in space-y-8">

      <!-- ===================================================================
           區塊 A：單頁主題大型標題橫幅 ＋ 一句話重點 ＋ 語音/翻頁控制
           =================================================================== -->
      <section class="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-3 max-w-4xl">
            <div class="flex flex-wrap items-center gap-3">
              <span class="px-4 py-1.5 rounded-full text-sm sm:text-base font-black border ${badgeColors[page.color]}">
                第 ${page.num} 站｜${page.name}
              </span>
              <span class="px-4 py-1.5 rounded-full text-sm sm:text-base font-bold bg-slate-800 text-amber-300 border border-slate-700">
                ${page.coreQuestion}
              </span>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-4xl sm:text-5xl">${page.icon}</span>
              <div>
                <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  ${page.num} ${page.name}：${page.zhTitle}
                </h2>
                <p class="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  🎯 一句話抓重點：「${page.oneLiner}」
                </p>
              </div>
            </div>

            <p class="text-lg sm:text-xl text-slate-200 leading-relaxed pt-1">
              ${page.intro}
            </p>
          </div>

          <!-- 右側大按鈕群：聽本頁解說 / 上一頁 / 下一頁 -->
          <div class="flex flex-wrap lg:flex-col items-stretch gap-3 shrink-0">
            <button
              onclick="speakCurrentPageIntro()"
              class="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-base sm:text-lg shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>🔊</span>
              <span>語音講解 ${page.name} 重點</span>
            </button>

            <div class="grid grid-cols-2 gap-2.5">
              <button
                onclick="prevPage()"
                class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-sm sm:text-base border border-slate-700 transition-all"
              >
                ◀ 上一頁
              </button>
              <button
                onclick="nextPage()"
                class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-sm sm:text-base border border-slate-700 transition-all"
              >
                下一頁 ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================================================================
           區塊 B：專屬動態圖解與語音圖說舞台 (Animated Diagram & Caption)
           =================================================================== -->
      <section class="diagram-stage rounded-3xl border-2 border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span class="text-sm font-black uppercase tracking-wider text-sky-400">ANIMATED VISUAL DIAGRAM & CAPTION</span>
            <h3 class="text-2xl sm:text-3xl font-black text-white mt-0.5">${page.diagramTitle}</h3>
          </div>

          <button
            id="btn-play-diagram-anim"
            onclick="toggleDiagramAnimation()"
            class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all self-start md:self-center shrink-0"
          >
            <span>▶️</span>
            <span>播放步驟動畫＋語音圖說</span>
          </button>
        </div>

        <!-- 4 大互動步驟動畫卡片流程 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 relative">
          ${page.animSteps.map((s, idx) => {
            const isCurr = s.step === currentAnimStep;
            const boxCls = isCurr
              ? glowClsMap[page.color]
              : 'border-slate-700/90 bg-slate-900/90 hover:border-slate-500 opacity-85 hover:opacity-100';

            return `
              <div
                id="anim-node-${s.step}"
                onclick="selectDiagramStep(${s.step}, true)"
                class="cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 flex flex-col justify-between ${boxCls}"
              >
                <div>
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl">
                      ${s.icon}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 border border-slate-700">
                      STEP 0${s.step} 🔊
                    </span>
                  </div>
                  <h4 class="text-xl sm:text-2xl font-black text-white mb-1.5">${s.title}</h4>
                  <p class="text-base sm:text-lg text-slate-300 font-bold">${s.sub}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-sky-300">
                  <span>點擊看圖說與語音</span>
                  <span>${idx < 3 ? '下一步 ➔' : '完成檢核 ✔'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 即時動畫圖說字幕盒 (Large Visual Caption Box) -->
        <div class="rounded-2xl bg-slate-950/95 border-2 border-amber-400/60 p-5 sm:p-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span id="diagram-caption-badge" class="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-sm">
              圖說步驟 ${stepObj.step} / ${page.animSteps.length}
            </span>
            <span class="text-sm font-bold text-slate-400">${page.diagramBottomRule}</span>
          </div>
          <p id="diagram-caption-text" class="text-lg sm:text-2xl font-bold text-white leading-relaxed">
            ${stepObj.caption}
          </p>
        </div>
      </section>

      <!-- ===================================================================
           區塊 C：雙欄清晰條綱（左欄：功能與邊界說明 ／ 右欄：研習案例互動與指令）
           =================================================================== -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-7 items-stretch">

        <!-- 左欄 (6/12)：能做什麼 ＋ 核心要點 ＋ 邊界與挑戰 -->
        <div class="xl:col-span-6 space-y-6 flex flex-col justify-between">

          <!-- 1. 能做什麼（大字表格） -->
          <div class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-7 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
              <span class="section-badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">條綱 01</span>
              <h3 class="text-2xl sm:text-3xl font-black text-white">✅ ${page.name} 能做什麼？與驗收重點</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-base sm:text-lg">
                <thead>
                  <tr class="border-b-2 border-slate-700 text-sky-300 bg-slate-950/80">
                    <th class="p-3.5 font-black">工作需求</th>
                    <th class="p-3.5 font-black text-emerald-300">可以得到的成果</th>
                    <th class="p-3.5 font-black text-amber-300">驗收重點</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800 text-slate-200">
                  ${page.canDoList.map((row) => `
                    <tr class="hover:bg-slate-800/40">
                      <td class="p-3.5 font-black text-white">${row.need}</td>
                      <td class="p-3.5">${row.output}</td>
                      <td class="p-3.5 text-amber-200 font-medium">${row.check}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. 核心觀念要點 -->
          <div class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-7 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
              <span class="section-badge bg-sky-500/20 text-sky-300 border border-sky-400/40">條綱 02</span>
              <h3 class="text-2xl sm:text-3xl font-black text-white">${page.keyPointsTitle}</h3>
            </div>
            <div class="space-y-3.5">
              ${page.keyPoints.map((kp) => `
                <div class="rounded-2xl bg-slate-950/90 border border-slate-800 p-4">
                  <span class="inline-block px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-black text-base mb-1.5 border border-sky-400/30">
                    ${kp.badge}
                  </span>
                  <p class="text-base sm:text-lg text-slate-200 leading-relaxed">${kp.text}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. 它的邊界與挑戰 -->
          <div class="rounded-3xl bg-rose-950/25 border-2 border-rose-500/40 p-6 sm:p-7 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
              <span class="section-badge bg-rose-500/20 text-rose-300 border border-rose-400/40">條綱 03</span>
              <h3 class="text-2xl sm:text-3xl font-black text-rose-200">${page.boundaryTitle}</h3>
            </div>
            <ul class="space-y-3 text-base sm:text-lg text-slate-100">
              ${page.boundaryList.map((b) => `
                <li class="flex items-start gap-3 bg-slate-950/80 p-4 rounded-2xl border border-rose-500/30">
                  <span class="text-rose-400 font-black text-xl mt-0.5">⛔</span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>
          </div>

        </div>

        <!-- 右欄 (6/12)：手冊真實行政案例（互動體驗 ＋ 可直接複製指令 ＋ 驗收與延伸） -->
        <div class="xl:col-span-6 space-y-6 flex flex-col justify-between">

          <div class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-7 shadow-xl space-y-6 flex-1 flex flex-col justify-between">
            <div class="space-y-5">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span class="section-badge bg-amber-500/20 text-amber-300 border border-amber-400/40 mb-2">條綱 04｜手冊實戰範例</span>
                  <h3 class="text-2xl sm:text-3xl font-black text-white">${page.example.title}</h3>
                </div>
              </div>

              <div class="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 text-base sm:text-lg text-amber-200 font-bold">
                🏛️ ${page.example.scenario}
              </div>

              <!-- 專屬互動模擬器（依頁面動態切換） -->
              <div id="page-interactive-widget">
                ${renderPageSpecificWidget(page.id)}
              </div>

              <!-- 可直接改用的指令（含一鍵複製按鈕） -->
              <div class="rounded-2xl bg-slate-950 border-2 border-sky-500/40 p-5">
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                  <span class="text-base font-black text-sky-300">📋 手冊可直接改用的指令（Prompt / 規格）</span>
                  <button
                    onclick="copyCurrentExamplePrompt(this)"
                    class="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow transition-all"
                  >
                    📋 一鍵複製指令
                  </button>
                </div>
                <pre id="current-example-prompt" class="text-base text-slate-100 whitespace-pre-wrap leading-relaxed font-mono-code select-all">${page.example.promptText}</pre>
              </div>

              <!-- 參考產出預覽 -->
              <div class="rounded-2xl bg-slate-950 border-2 border-emerald-500/40 p-5">
                <div class="text-base font-black text-emerald-300 pb-2.5 mb-2.5 border-b border-slate-800">
                  ${page.example.outputTitle}
                </div>
                <pre class="text-base text-slate-200 whitespace-pre-wrap leading-relaxed font-mono-code">${page.example.outputContent}</pre>
              </div>
            </div>

            <!-- 底部：如何驗收 ＆ 還可以應用在哪裡 -->
            <div class="space-y-4 pt-4 border-t border-slate-800">
              <div class="rounded-2xl bg-indigo-950/40 border border-indigo-400/40 p-4">
                <div class="text-base font-black text-indigo-300 mb-2">🔍 如何驗收這個成果？</div>
                <ul class="space-y-1.5 text-base text-slate-200">
                  ${page.example.verifySteps.map((v) => `<li class="flex items-start gap-2"><span class="text-emerald-400 font-black">✔</span><span>${v}</span></li>`).join('')}
                </ul>
              </div>

              <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span class="text-sm font-black text-amber-300">🚀 還可以應用在哪裡：</span>
                  <span class="text-base text-white font-bold">${page.example.moreUses}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
}

// ----------------------------------------------------------------------------
// 6. 各頁專屬互動體驗小工具（讓每個頁面都有動手玩的高互動體驗！）
// ----------------------------------------------------------------------------
function renderPageSpecificWidget(pageId) {
  if (pageId === 'prompt') {
    const isGood = promptCompareMode === 'good';
    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-sky-400/50 p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-base font-black text-white">🎮 互動比較：模糊要求 vs. 交代清楚的 Prompt</span>
          <div class="flex gap-2">
            <button
              onclick="setPromptCompare('bad')"
              class="px-3.5 py-1.5 rounded-xl font-black text-sm transition ${!isGood ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}"
            >
              ❌ 模糊要求
            </button>
            <button
              onclick="setPromptCompare('good')"
              class="px-3.5 py-1.5 rounded-xl font-black text-sm transition ${isGood ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}"
            >
              ✅ 手冊標準 Prompt
            </button>
          </div>
        </div>
        ${
          !isGood
            ? `<div class="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-base text-rose-100 space-y-2">
                 <div class="font-black">❌ 當你只寫：「幫我寫一場 AI 行政應用研習的通知」</div>
                 <div>👉 <strong>常見問題：</strong>AI 不知道時間地點，只好自己亂編一個「下週三下午兩點、提供公務人員終身學習時數 2 小時、點此網址報名」，承辦人沒檢查發出去就會造成行政事故！</div>
               </div>`
            : `<div class="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-base text-emerald-100 space-y-2">
                 <div class="font-black">✅ 當你交代清楚：「成果＋材料＋標準（缺的標示待補，不自行找網址或宣稱時數）」</div>
                 <div>👉 <strong>改善效果：</strong>AI 忠實呈現 11/20、行政大樓 302、40 人、林專員，並誠實寫出<strong>「報名連結：待補」</strong>與<strong>「待確認事項」</strong>，讓承辦人安心審核！</div>
               </div>`
        }
      </div>
    `;
  }

  if (pageId === 'skill') {
    const tests = [
      {
        label: '測試 1：欄位完整的新活動',
        input: '輸入：12 月 5 日「公文寫作研習」、行政大樓 401、50 人、附完整報名網址',
        result: '✅ 期待表現：正確套用單位通知範本，完整輸出所有欄位，且絕對不會混入上一場（11 月 20 日）的舊資訊！',
        voice: '測試一：輸入欄位完整的新活動。Skill 會正確套用單位範本，不會把上一場活動的舊日期混進來。'
      },
      {
        label: '測試 2：沒有報名連結',
        input: '輸入：活動時間地點皆已核定，但承辦人尚未建立 Google 表單連結',
        result: '✅ 期待表現：依 Skill 規則在報名連結處標示「待補」，並列入底部「待確認事項」，絕不自行編造假網址！',
        voice: '測試二：輸入沒有報名連結的資料。Skill 會照規則留下待補項目，不會自己編造假網址。'
      },
      {
        label: '測試 3：公告與信件日期衝突',
        input: '輸入：核定公文寫 11/20，但夾帶的主辦信件寫 11/21',
        result: '✅ 期待表現：依 Skill 例外限制「有衝突就並列來源，不自行決定」，列出兩方差異請承辦人確認！',
        voice: '測試三：當輸入的公告跟信件日期衝突時，Skill 會並列兩個來源交回承辦人確認，不會擅自挑一天。'
      }
    ];
    const curr = tests[skillTestIdx] || tests[0];
    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-emerald-400/50 p-5 space-y-4">
        <div class="text-base font-black text-white">🧪 互動測試：用 3 種不同資料驗證 Skill 能否重用（手冊第 6 頁表）</div>
        <div class="flex flex-wrap gap-2">
          ${tests.map((t, i) => `
            <button
              onclick="setSkillTest(${i})"
              class="px-3.5 py-2 rounded-xl font-black text-sm transition ${
                i === skillTestIdx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }"
            >
              ${t.label}
            </button>
          `).join('')}
        </div>
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1.5 text-base">
          <div class="text-sky-300 font-bold">📥 ${curr.input}</div>
          <div class="text-emerald-300 font-black">${curr.result}</div>
        </div>
      </div>
    `;
  }

  if (pageId === 'tool') {
    const isResult = toolFilterMode === 'result';
    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-amber-400/50 p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-base font-black text-white">🧮 互動驗算：手冊第 8 頁「6 列名單有效人數去重統計」</span>
          <div class="flex gap-2">
            <button
              onclick="setToolFilter('raw')"
              class="px-3.5 py-1.5 rounded-xl font-black text-sm transition ${!isResult ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}"
            >
              📄 看原始 6 列名單
            </button>
            <button
              onclick="setToolFilter('result')"
              class="px-3.5 py-1.5 rounded-xl font-black text-sm transition ${isResult ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}"
            >
              ⚡ 執行 Tool 篩選＋去重
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr class="border-b border-slate-700 text-slate-300 bg-slate-900">
                <th class="p-2.5">員工代碼</th>
                <th class="p-2.5">單位</th>
                <th class="p-2.5">狀態</th>
                <th class="p-2.5">Tool 處理判定</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr class="${isResult ? 'bg-emerald-950/40 text-emerald-200 font-bold' : ''}">
                <td class="p-2.5">T001</td><td class="p-2.5">業務處</td><td class="p-2.5">有效</td>
                <td class="p-2.5">${isResult ? '✅ 計入有效（業務處 +1）' : '待處理'}</td>
              </tr>
              <tr class="${isResult ? 'bg-emerald-950/40 text-emerald-200 font-bold' : ''}">
                <td class="p-2.5">T002</td><td class="p-2.5">教務處</td><td class="p-2.5">有效</td>
                <td class="p-2.5">${isResult ? '✅ 計入有效（教務處 +1）' : '待處理'}</td>
              </tr>
              <tr class="${isResult ? 'bg-amber-950/40 text-amber-300 line-through' : ''}">
                <td class="p-2.5">T001</td><td class="p-2.5">業務處</td><td class="p-2.5">有效</td>
                <td class="p-2.5">${isResult ? '⚠️ 員工代碼 T001 重複（去重排除）' : '待處理'}</td>
              </tr>
              <tr class="${isResult ? 'bg-rose-950/40 text-rose-300 line-through' : ''}">
                <td class="p-2.5">T003</td><td class="p-2.5">學務處</td><td class="p-2.5">取消</td>
                <td class="p-2.5">${isResult ? '⛔ 狀態為取消（不計入）' : '待處理'}</td>
              </tr>
              <tr class="${isResult ? 'bg-emerald-950/40 text-emerald-200 font-bold' : ''}">
                <td class="p-2.5">T004</td><td class="p-2.5">教務處</td><td class="p-2.5">有效</td>
                <td class="p-2.5">${isResult ? '✅ 計入有效（教務處 +1）' : '待處理'}</td>
              </tr>
              <tr class="${isResult ? 'bg-rose-950/40 text-amber-200' : ''}">
                <td class="p-2.5">T005</td><td class="p-2.5">學務處</td><td class="p-2.5">待確認</td>
                <td class="p-2.5">${isResult ? '❓ 狀態待確認（單獨列出、不計入有效）' : '待處理'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (pageId === 'agent') {
    const steps = [
      {
        btn: '① 查 A 核定公告',
        detail: '📄 讀取【來源 A：核定公告】➔ 記載活動日期為「11 月 20 日」。但仍須確認是否存在後續修正版。'
      },
      {
        btn: '② 查 B 活動網站',
        detail: '🌐 讀取【來源 B：活動網站】➔ 發現網站寫「11 月 21 日」！與核定公告衝突，Agent 動態決定再去查主辦單位信件。'
      },
      {
        btn: '③ 查 C 主辦信件',
        detail: '✉️ 讀取【來源 C：主辦單位信件】➔ 內文寫「時間調整中」，尚未明確確認新日期。'
      },
      {
        btn: '🛑 ④ 觸發停止並交回人',
        detail: '🛑 【合格完成結果】：三方資訊有衝突且缺正式確認！Agent 不憑檔案修改時間亂猜，停下來交付「衝突對照表」請承辦人確認。'
      }
    ];
    const curr = steps[agentSourceIdx] || steps[3];
    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-purple-400/50 p-5 space-y-4">
        <div class="text-base font-black text-white">🕵️ 互動模擬：點擊體驗 Agent 動態查核日期衝突的 4 個瞬間（手冊第 10 頁）</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${steps.map((st, i) => `
            <button
              onclick="setAgentSource(${i})"
              class="px-3 py-2 rounded-xl font-black text-sm transition ${
                i === agentSourceIdx ? 'bg-purple-500 text-white shadow' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }"
            >
              ${st.btn}
            </button>
          `).join('')}
        </div>
        <div class="p-4 rounded-xl bg-slate-900 border border-purple-400/40 text-base text-purple-100 font-bold">
          ${curr.detail}
        </div>
      </div>
    `;
  }

  if (pageId === 'bot') {
    const chats = [
      {
        btn: '💬 提問 1：一般公開時間',
        q: '這場研習幾點開始？',
        a: '依目前採用的核定公告，活動為 11 月 20 日 14:00–16:00，地點是行政大樓 302。來源：［核定公告連結］；版本日期：［公告版本日期］。',
        tag: '✅ 固定查詢＋AI 回答：必附核定來源與版本日期'
      },
      {
        btn: '🔐 提問 2：查個人報名狀態',
        q: '我有報名成功嗎？',
        a: '請先透過指定登入方式確認身分。完成驗證後，我才能查詢你本人的報名狀態；若目前未提供此功能，會轉交承辦人。',
        tag: '🛡️ 權限護欄：必須先驗證本人身分，絕不共用管理權限外洩他人資料'
      },
      {
        btn: '⚠️ 提問 3：網站與公告日期衝突',
        q: '網站寫 21 日，你卻說 20 日，哪個才對？',
        a: '目前資訊有差異，我先保留兩個來源並轉交承辦人確認。正式日期尚未釐清前，不替你選定其中一天。',
        tag: '🛑 例外轉人工：遇到衝突保留兩來源並轉交承辦人，不自行選定'
      }
    ];
    const curr = chats[botChatIdx] || chats[0];
    return `
      <div class="rounded-2xl bg-slate-950/90 border-2 border-rose-400/50 p-5 space-y-4">
        <div class="text-base font-black text-white">🤖 互動對話模擬：點擊測試同仁的 3 種提問情境（手冊第 12 頁）</div>
        <div class="flex flex-wrap gap-2">
          ${chats.map((c, i) => `
            <button
              onclick="setBotChat(${i})"
              class="px-3.5 py-2 rounded-xl font-black text-sm transition ${
                i === botChatIdx ? 'bg-rose-500 text-white shadow' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }"
            >
              ${c.btn}
            </button>
          `).join('')}
        </div>
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 text-base">
          <div class="flex items-start gap-2.5">
            <span class="px-2.5 py-0.5 rounded bg-sky-500 text-slate-950 font-black text-xs shrink-0 mt-1">同仁</span>
            <span class="text-white font-bold">「${curr.q}」</span>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="px-2.5 py-0.5 rounded bg-rose-500 text-white font-black text-xs shrink-0 mt-1">Bot</span>
            <span class="text-emerald-200 font-bold">「${curr.a}」</span>
          </div>
          <div class="text-xs sm:text-sm text-amber-300 font-black pt-2 border-t border-slate-800">
            ${curr.tag}
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

function setPromptCompare(mode) {
  promptCompareMode = mode;
  playTechSound('click');
  const w = document.getElementById('page-interactive-widget');
  if (w) w.innerHTML = renderPageSpecificWidget('prompt');
}

function setSkillTest(idx) {
  skillTestIdx = idx;
  playTechSound('click');
  const w = document.getElementById('page-interactive-widget');
  if (w) w.innerHTML = renderPageSpecificWidget('skill');
}

function setToolFilter(mode) {
  toolFilterMode = mode;
  playTechSound('success');
  const w = document.getElementById('page-interactive-widget');
  if (w) w.innerHTML = renderPageSpecificWidget('tool');
}

function setAgentSource(idx) {
  agentSourceIdx = idx;
  playTechSound('step');
  const w = document.getElementById('page-interactive-widget');
  if (w) w.innerHTML = renderPageSpecificWidget('agent');
}

function setBotChat(idx) {
  botChatIdx = idx;
  playTechSound('click');
  const w = document.getElementById('page-interactive-widget');
  if (w) w.innerHTML = renderPageSpecificWidget('bot');
}

function copyCurrentExamplePrompt(btnEl) {
  const pre = document.getElementById('current-example-prompt');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(() => {
    playTechSound('success');
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ 已複製指令！';
    setTimeout(() => {
      btnEl.innerHTML = orig;
    }, 2000);
  });
}

// ----------------------------------------------------------------------------
// 7. 渲染「五者總覽與組合」頁面（圖 1、圖 2、圖 8 與行政應用案例庫）
// ----------------------------------------------------------------------------
function renderOverviewPageHtml() {
  return `
    <div class="page-fade-in space-y-8">
      <!-- 頂部總覽橫幅 -->
      <section class="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-400/50 p-6 sm:p-8 shadow-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <span class="px-4 py-1 rounded-full text-sm font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
              手冊第 1–2 頁 ＆ 第 13–16 頁總整理
            </span>
            <h2 class="text-3xl sm:text-5xl font-black text-white mt-2">
              🗺️ 同一場研習的五種 AI 用法 ＆ 五者如何組合？
            </h2>
            <p class="text-lg sm:text-xl text-slate-200 mt-2">
              五站是教學順序，<strong class="text-amber-300">並非五個互斥選項，也不是 AI 能力高低的排名！</strong>工作需求改變，才增加相應能力；不是每個任務都要走完五站。
            </p>
          </div>
          <button
            onclick="speakCurrentPageIntro()"
            class="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base sm:text-lg shadow-lg shrink-0"
          >
            🔊 聽五者總覽語音導讀
          </button>
        </div>

        <!-- 圖 1：五個主題各抓住一句話 -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          ${OVERVIEW_DATA.oneSentenceSummary.map((item) => `
            <div
              onclick="switchPage('${item.name.toLowerCase()}', true)"
              class="cursor-pointer rounded-2xl bg-slate-950/90 border-2 border-slate-700 hover:border-sky-400 p-5 flex flex-col justify-between transition-all hover:-translate-y-1"
            >
              <div>
                <div class="text-xs font-black text-slate-400 mb-1">PAGE ${item.num}</div>
                <div class="text-2xl font-black text-white mb-1">${item.name}</div>
                <div class="text-base sm:text-lg font-black text-amber-300 mb-2">「${item.sentence}」</div>
                <p class="text-sm sm:text-base text-slate-300 leading-relaxed">${item.detail}</p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-slate-800 text-xs sm:text-sm font-black text-sky-400">
                點此進入 ${item.name} 專頁 ➔
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 手冊第 2 頁：我現在缺少什麼 ➔ 優先補上的要素 -->
      <section class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 class="text-2xl sm:text-3xl font-black text-white">
          🧭 圖 2｜我現在缺少什麼？優先補上哪個要素？（點擊可跳轉該頁）
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          ${OVERVIEW_DATA.whatIsMissingTable.map((row) => `
            <div
              onclick="switchPage('${row.targetPage}', true)"
              class="cursor-pointer rounded-2xl bg-slate-950 border-2 border-slate-800 hover:border-emerald-400 p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div class="text-xs font-black text-rose-300 mb-1">❓ 我現在缺少什麼</div>
                <div class="text-lg font-black text-white mb-3">${row.missing}</div>
                <div class="text-xs font-black text-emerald-400 mb-1">✅ 優先補上的要素</div>
                <div class="text-xl font-black text-amber-300 mb-1">${row.solution}</div>
                <div class="text-sm sm:text-base text-slate-300">${row.action}</div>
              </div>
              <div class="mt-3 pt-2 border-t border-slate-800 text-xs font-bold text-sky-300">前往查看 ➔</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 手冊第 13 頁 圖 8：把五者組合成一項工作服務 -->
      <section class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
        <div>
          <span class="text-sm font-black text-sky-400">手冊第 13 頁｜圖 8 元件分工與組合圖</span>
          <h3 class="text-2xl sm:text-3xl font-black text-white mt-0.5">
            🧩 把五者組合成一項工作服務（從最小可用組合開始）
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-base">
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-700">
            <div class="font-black text-rose-300 text-lg mb-1">① 入口（人或 Bot）</div>
            <div class="text-slate-200">同仁直接交辦，或透過 Bot 提問 ➔ 進入 <strong>Prompt（交代這一次要做什麼、交付什麼、限制為何）</strong></div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-700">
            <div class="font-black text-purple-300 text-lg mb-1">② 工作執行（搭配 Skill）</div>
            <div class="text-slate-200">載入 <strong>Skill（可重用的方法、範本與檢查標準）</strong> ➔ 由<strong>固定流程</strong>執行，需要動態調整時才使用 <strong>Agent</strong></div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-700">
            <div class="font-black text-amber-300 text-lg mb-1">③ Tool 動作 ➔ 成果與驗收</div>
            <div class="text-slate-200">呼叫 <strong>Tool（讀取資料、計算、建立檔案）</strong> ➔ 產出通知、統計、疑點清單或服務回覆，最後由真人驗收！</div>
          </div>
        </div>
      </section>

      <!-- 手冊第 14 頁：行政應用案例庫總表 -->
      <section class="rounded-3xl bg-slate-900/95 border-2 border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 class="text-2xl sm:text-3xl font-black text-white">
          📚 手冊第 14 頁｜行政應用案例庫（先寫工作與成果，再決定最小組合）
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-base sm:text-lg">
            <thead>
              <tr class="border-b-2 border-slate-700 text-sky-300 bg-slate-950">
                <th class="p-4 font-black">工作與成果</th>
                <th class="p-4 font-black text-emerald-300">建議起手式（最簡單做法）</th>
                <th class="p-4 font-black text-purple-300">確有需要才加上的能力</th>
                <th class="p-4 font-black text-amber-300">最重要的驗收</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-200">
              ${OVERVIEW_DATA.adminCaseLibrary.map((c) => `
                <tr class="hover:bg-slate-800/40">
                  <td class="p-4 font-black text-white">${c.task}</td>
                  <td class="p-4 text-emerald-300 font-bold">${c.start}</td>
                  <td class="p-4">${c.addOn}</td>
                  <td class="p-4 text-amber-200 font-bold">${c.verify}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 初始化
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  renderTopPageTabs();
  renderCurrentPageContent();
});
