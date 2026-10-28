// ============================================================================
// AI 工作應用圖文手冊 × ChatGPT 服務與頁面對照（具體圖說互動版主程式）
// 支援：5 大頁面切換、具體 UI 入口＋辦研習 SVG 動畫圖解、單行圖說、一鍵複製課堂指令、語音導覽
// ============================================================================

let currentPageId = 'prompt'; // 'prompt' | 'skill' | 'tool' | 'agent' | 'bot' | 'overview'
let currentStepIdx = 0;       // 0, 1, 2
let animTimer = null;
let voiceEnabled = true;
let fontSizeMode = 'normal';  // 'normal' | 'large' | 'xlarge'

const COLOR_STYLES = {
  sky: {
    border: 'border-sky-400',
    bgSoft: 'bg-sky-500/15',
    text: 'text-sky-300',
    btn: 'bg-sky-400 hover:bg-sky-300 text-slate-950',
    badge: 'bg-sky-500/20 text-sky-200 border-sky-400/50',
    glow: 'shadow-[0_0_30px_rgba(56,189,248,0.28)]'
  },
  emerald: {
    border: 'border-emerald-400',
    bgSoft: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    btn: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950',
    badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.28)]'
  },
  amber: {
    border: 'border-amber-400',
    bgSoft: 'bg-amber-500/15',
    text: 'text-amber-300',
    btn: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.28)]'
  },
  purple: {
    border: 'border-purple-400',
    bgSoft: 'bg-purple-500/15',
    text: 'text-purple-300',
    btn: 'bg-purple-400 hover:bg-purple-300 text-slate-950',
    badge: 'bg-purple-500/20 text-purple-200 border-purple-400/50',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.28)]'
  },
  rose: {
    border: 'border-rose-400',
    bgSoft: 'bg-rose-500/15',
    text: 'text-rose-300',
    btn: 'bg-rose-400 hover:bg-rose-300 text-slate-950',
    badge: 'bg-rose-500/20 text-rose-200 border-rose-400/50',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.28)]'
  }
};

// ----------------------------------------------------------------------------
// 1. 語音導覽 (Web Speech API)
// ----------------------------------------------------------------------------
function speakText(text, force = false) {
  const statusEl = document.getElementById('voice-status-text');
  const waveEl = document.getElementById('speaking-wave');
  if (statusEl) statusEl.textContent = text;

  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!voiceEnabled && !force) {
    if (waveEl) waveEl.classList.add('hidden');
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-TW';
  utter.rate = 1.03;

  const voices = window.speechSynthesis.getVoices();
  const zhVoice =
    voices.find(v => v.lang.includes('zh-TW') && (v.name.includes('Meijia') || v.name.includes('Google') || v.name.includes('Microsoft'))) ||
    voices.find(v => v.lang.includes('zh-TW') || v.lang.includes('zh_TW')) ||
    voices.find(v => v.lang.includes('zh'));
  if (zhVoice) utter.voice = zhVoice;

  utter.onstart = () => {
    if (waveEl) {
      waveEl.classList.remove('hidden');
      waveEl.classList.add('inline-flex');
    }
  };
  utter.onend = () => {
    if (waveEl) {
      waveEl.classList.add('hidden');
      waveEl.classList.remove('inline-flex');
    }
  };
  utter.onerror = () => {
    if (waveEl) waveEl.classList.add('hidden');
  };

  window.speechSynthesis.speak(utter);
}

function toggleVoiceEnabled() {
  voiceEnabled = !voiceEnabled;
  const iconEl = document.getElementById('voice-icon');
  const labelEl = document.getElementById('voice-label');
  const btnEl = document.getElementById('btn-voice-toggle');
  if (voiceEnabled) {
    if (iconEl) iconEl.textContent = '🔊';
    if (labelEl) labelEl.textContent = '語音：開啟';
    if (btnEl) btnEl.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400 text-sm font-black text-sky-300 transition-all';
    speakCurrentPageIntro();
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (iconEl) iconEl.textContent = '🔇';
    if (labelEl) labelEl.textContent = '語音：靜音';
    if (btnEl) btnEl.className = 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-sm font-bold text-slate-400 transition-all';
  }
}

function speakCurrentPageIntro() {
  if (currentPageId === 'overview') {
    speakText('五站總覽圖：這五個概念是理解工作的五個角度，不是 ChatGPT 的五種付費等級，也不是五個互斥按鈕。我們用「辦一場校內研習」串聯五個概念與實際操作入口！', true);
    return;
  }
  const page = FIVE_PAGES.find(p => p.id === currentPageId);
  if (page) speakText(page.voiceIntro, true);
}

// ----------------------------------------------------------------------------
// 2. 字體大小切換
// ----------------------------------------------------------------------------
function setFontSizeMode(mode) {
  fontSizeMode = mode;
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-mode-normal', 'font-mode-large', 'font-mode-xlarge');
  htmlEl.classList.add(`font-mode-${mode}`);

  ['normal', 'large', 'xlarge'].forEach(m => {
    const btn = document.getElementById(`btn-font-${m}`);
    if (!btn) return;
    if (m === mode) {
      btn.className = 'px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-black text-sm shadow transition-all';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all';
    }
  });
}

// ----------------------------------------------------------------------------
// 3. 頂部 5 大頁面切換列
// ----------------------------------------------------------------------------
function renderTopTabs() {
  const container = document.getElementById('five-page-tabs');
  if (!container) return;

  const pageButtons = FIVE_PAGES.map(p => {
    const isActive = currentPageId === p.id;
    const st = COLOR_STYLES[p.color];
    return `
      <button onclick="switchPage('${p.id}')"
        class="page-tab-btn text-left px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
          isActive
            ? `${st.bgSoft} ${st.border} ${st.glow} scale-[1.01]`
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
        }">
        <span class="text-3xl shrink-0">${p.icon}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black px-2 py-0.5 rounded-md bg-slate-950/90 ${st.text}">${p.stepNum}</span>
            <span class="font-black text-base sm:text-lg text-white truncate">${p.name}</span>
          </div>
          <div class="text-xs sm:text-sm font-bold text-slate-300 truncate mt-0.5">${p.zhName}</div>
        </div>
      </button>
    `;
  }).join('');

  const isOverview = currentPageId === 'overview';
  const overviewBtn = `
    <button onclick="switchPage('overview')"
      class="page-tab-btn text-left px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
        isOverview
          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.28)] scale-[1.01]'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 opacity-85 hover:opacity-100'
      }">
      <span class="text-3xl shrink-0">🗺️</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-black px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-300">總覽</span>
          <span class="font-black text-base sm:text-lg text-white truncate">五站對照</span>
        </div>
        <div class="text-xs sm:text-sm font-bold text-slate-300 truncate mt-0.5">辦研習串聯五概念</div>
      </div>
    </button>
  `;

  container.innerHTML = pageButtons + overviewBtn;
}

function switchPage(pageId) {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  currentPageId = pageId;
  currentStepIdx = 0;
  renderTopTabs();
  renderMainPage();

  if (pageId === 'overview') {
    speakText('五站對照總覽：這五個概念不是五種付費等級，也不是五個互斥按鈕。點擊下方「辦一場校內研習」的任一階段，即可查看在 ChatGPT 哪裡操作！');
  } else {
    const page = FIVE_PAGES.find(p => p.id === pageId);
    if (page) speakText(page.voiceIntro);
  }
}

// ----------------------------------------------------------------------------
// 4. 針對 5 大頁面繪製「ChatGPT 具體畫面入口 ＋ 辦研習流程 ＋ 驗收成果」SVG 圖解
// ----------------------------------------------------------------------------
function renderCustomSVG(pageId, activeStep) {
  const s1 = activeStep === 0;
  const s2 = activeStep === 1;
  const s3 = activeStep === 2;

  const boxStyle = (active, hex) =>
    active
      ? `stroke="${hex}" stroke-width="4" fill="#0f172a" filter="url(#glow)"`
      : `stroke="#334155" stroke-width="2.5" fill="#0f172a" opacity="0.88"`;

  // 01 PROMPT：Chat 新對話輸入框 ➔ 3 條件要求 ➔ 250 字摘要＋待確認事項
  if (pageId === 'prompt') {
    return `
      <svg viewBox="0 0 1050 370" class="w-full h-auto select-none">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="arr-sky" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
          </marker>
        </defs>

        <!-- Step 1: 左側 ChatGPT 畫面入口 -->
        <g onclick="selectStep(0)" class="cursor-pointer">
          <rect x="20" y="22" width="315" height="325" rx="18" ${boxStyle(s1, '#38bdf8')}/>
          <rect x="20" y="22" width="315" height="44" rx="18" fill="#0284c7"/>
          <text x="177" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">① 在哪裡按：Chat 新對話輸入框</text>
          
          <!-- 模擬 ChatGPT 頂部切換與輸入框 -->
          <rect x="40" y="82" width="275" height="36" rx="10" fill="#1e293b" stroke="#475569"/>
          <text x="177" y="105" text-anchor="middle" fill="#bae6fd" font-size="15" font-weight="800">🌐 chatgpt.com ➔ 建立「新對話」</text>

          <rect x="40" y="132" width="275" height="145" rx="14" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
          <text x="55" y="160" fill="#38bdf8" font-size="15" font-weight="900">💬 訊息輸入框（直接打字）：</text>
          <text x="55" y="188" fill="#e2e8f0" font-size="14" font-weight="700">「請根據下方公告，整理給</text>
          <text x="55" y="212" fill="#e2e8f0" font-size="14" font-weight="700">校內同仁閱讀的研習摘要...」</text>
          <rect x="55" y="228" width="185" height="32" rx="8" fill="#1e293b"/>
          <text x="68" y="249" fill="#94a3b8" font-size="13" font-weight="700">📄 ［貼上教學用研習公告］</text>
          <circle cx="290" cy="252" r="14" fill="#38bdf8"/>
          <text x="290" y="257" text-anchor="middle" fill="#0f172a" font-size="15" font-weight="900">↑</text>

          <text x="177" y="312" text-anchor="middle" fill="#7dd3fc" font-size="14" font-weight="800">💡 Work 交辦工作時同樣需要 Prompt</text>
        </g>

        <!-- 連接箭頭 1 -> 2 -->
        <line x1="338" y1="185" x2="375" y2="185" stroke="#38bdf8" stroke-width="4" stroke-dasharray="7 5" class="${s1 || s2 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-sky)"/>

        <!-- Step 2: 中間 Prompt 三大條件 -->
        <g onclick="selectStep(1)" class="cursor-pointer">
          <rect x="382" y="22" width="290" height="325" rx="18" ${boxStyle(s2, '#38bdf8')}/>
          <rect x="382" y="22" width="290" height="44" rx="18" fill="#0369a1"/>
          <text x="527" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">② 怎麼交代：說清楚 3 件事</text>

          <rect x="402" y="84" width="250" height="70" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="418" y="110" fill="#38bdf8" font-size="16" font-weight="900">🎯 1. 指定 6 個必填欄位</text>
          <text x="418" y="135" fill="#e2e8f0" font-size="13" font-weight="700">名稱、日期、地點、對象、期限、方式</text>

          <rect x="402" y="168" width="250" height="70" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="418" y="194" fill="#38bdf8" font-size="16" font-weight="900">📏 2. 限制格式與字數</text>
          <text x="418" y="219" fill="#e2e8f0" font-size="13" font-weight="700">全文 ≤ 250 字 ＋ 另列待確認事項</text>

          <rect x="402" y="252" width="250" height="74" rx="12" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
          <text x="418" y="279" fill="#fbbf24" font-size="16" font-weight="900">🛡️ 3. 防亂編邊界（關鍵！）</text>
          <text x="418" y="305" fill="#fde68a" font-size="13" font-weight="800">沒寫的標示「未提供」，不自行補上</text>
        </g>

        <!-- 連接箭頭 2 -> 3 -->
        <line x1="675" y1="185" x2="712" y2="185" stroke="#38bdf8" stroke-width="4" stroke-dasharray="7 5" class="${s2 || s3 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-sky)"/>

        <!-- Step 3: 右側 預期成果與驗收 -->
        <g onclick="selectStep(2)" class="cursor-pointer">
          <rect x="720" y="22" width="310" height="325" rx="18" ${boxStyle(s3, '#10b981')}/>
          <rect x="720" y="22" width="310" height="44" rx="18" fill="#059669"/>
          <text x="875" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">③ 驗收成果：摘要＋缺漏清單</text>

          <rect x="740" y="84" width="270" height="150" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
          <text x="756" y="110" fill="#34d399" font-size="16" font-weight="900">📋 產出：校內研習摘要（≤250字）</text>
          <text x="756" y="136" fill="#e2e8f0" font-size="14" font-weight="700">• 活動名稱、日期時間、地點</text>
          <text x="756" y="160" fill="#e2e8f0" font-size="14" font-weight="700">• 參加對象、報名期限與方式</text>
          <text x="756" y="190" fill="#fbbf24" font-size="14" font-weight="800">⚠️ 承辦人待確認：報名連結［未提供］</text>
          <text x="756" y="215" fill="#94a3b8" font-size="13" font-weight="700">（人工核對日期、地點、對象是否正確）</text>

          <rect x="740" y="250" width="270" height="76" rx="12" fill="#450a0a" stroke="#f87171" stroke-width="2"/>
          <text x="875" y="278" text-anchor="middle" fill="#fca5a5" font-size="15" font-weight="900">🚨 課堂必講觀念：</text>
          <text x="875" y="305" text-anchor="middle" fill="#fecaca" font-size="14" font-weight="800">請它寫出通知草稿 ≠ 已經寄出通知！</text>
        </g>
      </svg>
    `;
  }

  // 02 SKILL：側邊欄 Skills ＋ @skill-creator ➔ 輸入 @ 呼叫 ➔ 換新活動自動套用與抓漏
  if (pageId === 'skill') {
    return `
      <svg viewBox="0 0 1050 370" class="w-full h-auto select-none">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="arr-em" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
          </marker>
        </defs>

        <!-- Step 1: 建立與保存方法 -->
        <g onclick="selectStep(0)" class="cursor-pointer">
          <rect x="20" y="22" width="315" height="325" rx="18" ${boxStyle(s1, '#10b981')}/>
          <rect x="20" y="22" width="315" height="44" rx="18" fill="#059669"/>
          <text x="177" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">① 怎麼存：呼叫 @skill-creator</text>

          <rect x="40" y="84" width="275" height="65" rx="12" fill="#1e293b" stroke="#10b981"/>
          <text x="56" y="110" fill="#6ee7b7" font-size="15" font-weight="900">Step A：先完成 1 次滿意的通知</text>
          <text x="56" y="134" fill="#cbd5e1" font-size="13" font-weight="700">確認欄位、文字風格與檢查規則都正確</text>

          <rect x="40" y="164" width="275" height="160" rx="12" fill="#090d16" stroke="#10b981" stroke-width="2"/>
          <text x="56" y="192" fill="#34d399" font-size="16" font-weight="900">Step B：在 Work 輸入</text>
          <rect x="56" y="204" width="160" height="28" rx="6" fill="#065f46"/>
          <text x="66" y="223" fill="#a7f3d0" font-size="15" font-weight="900">@skill-creator</text>
          <text x="56" y="255" fill="#e2e8f0" font-size="14" font-weight="700">📦 封裝成「研習通知」技能：</text>
          <text x="56" y="279" fill="#94a3b8" font-size="13" font-weight="700">• 步驟：檢查欄位→列缺漏→寫通知</text>
          <text x="56" y="302" fill="#fbbf24" font-size="13" font-weight="800">• 限制：沒給講師/時數不得自行補寫</text>
        </g>

        <line x1="338" y1="185" x2="375" y2="185" stroke="#10b981" stroke-width="4" stroke-dasharray="7 5" class="${s1 || s2 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-em)"/>

        <!-- Step 2: 在哪裡按：側邊欄 Skills 與 @ 選單 -->
        <g onclick="selectStep(1)" class="cursor-pointer">
          <rect x="382" y="22" width="290" height="325" rx="18" ${boxStyle(s2, '#10b981')}/>
          <rect x="382" y="22" width="290" height="44" rx="18" fill="#047857"/>
          <text x="527" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">② 在哪裡按：Skills 側欄與 @</text>

          <!-- 模擬桌面版左側邊欄 -->
          <rect x="402" y="84" width="250" height="95" rx="12" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
          <text x="418" y="110" fill="#6ee7b7" font-size="15" font-weight="900">🖥️ 桌面版左側邊欄 ➔「Skills」</text>
          <text x="418" y="135" fill="#e2e8f0" font-size="13" font-weight="700">• 查看與啟用獨立 Skill</text>
          <text x="418" y="158" fill="#94a3b8" font-size="13" font-weight="700">• 或使用 Plugin 附帶的 Skill</text>

          <!-- 模擬對話框輸入 @ 彈出選單 -->
          <rect x="402" y="195" width="250" height="130" rx="12" fill="#090d16" stroke="#10b981" stroke-width="2"/>
          <text x="418" y="222" fill="#34d399" font-size="15" font-weight="900">💬 對話框輸入「@」跳出選單：</text>
          <rect x="418" y="234" width="218" height="34" rx="8" fill="#065f46" stroke="#34d399"/>
          <text x="430" y="256" fill="#ffffff" font-size="15" font-weight="900">📦 @研習通知（已啟用技能）</text>
          <text x="418" y="294" fill="#cbd5e1" font-size="13" font-weight="700">➕ 貼入「第二場研習活動資料」</text>
          <text x="418" y="314" fill="#94a3b8" font-size="12" font-weight="700">（不必再重貼整串規則！）</text>
        </g>

        <line x1="675" y1="185" x2="712" y2="185" stroke="#10b981" stroke-width="4" stroke-dasharray="7 5" class="${s2 || s3 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-em)"/>

        <!-- Step 3: 換場次重用與抓漏驗收 -->
        <g onclick="selectStep(2)" class="cursor-pointer">
          <rect x="720" y="22" width="310" height="325" rx="18" ${boxStyle(s3, '#f59e0b')}/>
          <rect x="720" y="22" width="310" height="44" rx="18" fill="#d97706"/>
          <text x="875" y="50" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="900">③ 驗收成果：換資料重用＋抓漏</text>

          <rect x="740" y="84" width="270" height="115" rx="12" fill="#1e293b" stroke="#10b981"/>
          <text x="756" y="112" fill="#34d399" font-size="16" font-weight="900">🔄 每次變的 vs 固定不變的</text>
          <text x="756" y="138" fill="#e2e8f0" font-size="14" font-weight="700">• 每次換：日期、地點、報名連結</text>
          <text x="756" y="164" fill="#6ee7b7" font-size="14" font-weight="800">• 保持一致：欄位、風格、缺漏檢查</text>

          <rect x="740" y="215" width="270" height="110" rx="12" fill="#451a03" stroke="#fbbf24" stroke-width="2"/>
          <text x="756" y="242" fill="#fbbf24" font-size="15" font-weight="900">🧪 課堂驗收絕招（防呆測試）：</text>
          <text x="756" y="268" fill="#fde68a" font-size="14" font-weight="700">故意給一份「漏掉報名連結」的資料</text>
          <text x="756" y="294" fill="#ffffff" font-size="14" font-weight="900">➔ 確認 Skill 會主動指出缺漏！</text>
        </g>
      </svg>
    `;
  }

  // 03 TOOL：上傳報名 Excel / Plugins 頁面 ➔ 去重與計算（區分 Tool/MCP/Plugin） ➔ 產出可核對統計檔
  if (pageId === 'tool') {
    return `
      <svg viewBox="0 0 1050 370" class="w-full h-auto select-none">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="arr-am" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
          </marker>
        </defs>

        <!-- Step 1: 內建工具與 Plugins 頁面 -->
        <g onclick="selectStep(0)" class="cursor-pointer">
          <rect x="20" y="22" width="315" height="325" rx="18" ${boxStyle(s1, '#f59e0b')}/>
          <rect x="20" y="22" width="315" height="44" rx="18" fill="#d97706"/>
          <text x="177" y="50" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="900">① 在哪裡按：讀檔與 Plugins</text>

          <rect x="40" y="84" width="275" height="98" rx="12" fill="#1e293b" stroke="#f59e0b"/>
          <text x="56" y="110" fill="#fbbf24" font-size="15" font-weight="900">📎 入口 A：對話內建能力</text>
          <text x="56" y="136" fill="#e2e8f0" font-size="14" font-weight="700">• 直接上傳「研習報名名單.xlsx」</text>
          <text x="56" y="160" fill="#94a3b8" font-size="13" font-weight="700">• 內建搜尋、檔案讀取與資料計算</text>

          <rect x="40" y="198" width="275" height="128" rx="12" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
          <text x="56" y="224" fill="#fbbf24" font-size="15" font-weight="900">🔌 入口 B：chatgpt.com/plugins</text>
          <text x="56" y="250" fill="#e2e8f0" font-size="13" font-weight="700">安裝並連接帳號，在對話打「@」呼叫：</text>
          <text x="56" y="274" fill="#fde68a" font-size="13" font-weight="800">• Google Drive（查雲端文件）</text>
          <text x="56" y="295" fill="#fde68a" font-size="13" font-weight="800">• Gmail（擬草稿）／ Calendar（查行程）</text>
        </g>

        <line x1="338" y1="185" x2="375" y2="185" stroke="#f59e0b" stroke-width="4" stroke-dasharray="7 5" class="${s1 || s2 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-am)"/>

        <!-- Step 2: 執行計算 ＋ 區分 Tool / MCP / Plugin -->
        <g onclick="selectStep(1)" class="cursor-pointer">
          <rect x="382" y="22" width="290" height="325" rx="18" ${boxStyle(s2, '#f59e0b')}/>
          <rect x="382" y="22" width="290" height="44" rx="18" fill="#b45309"/>
          <text x="527" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">② 怎麼執行：實際計算＋秒懂區別</text>

          <rect x="402" y="84" width="250" height="105" rx="12" fill="#1e293b" stroke="#fbbf24"/>
          <text x="418" y="110" fill="#fbbf24" font-size="15" font-weight="900">⚙️ 辦研習：核對報名名單</text>
          <text x="418" y="135" fill="#e2e8f0" font-size="13" font-weight="700">1. 只篩選狀態＝「有效」的紀錄</text>
          <text x="418" y="157" fill="#e2e8f0" font-size="13" font-weight="700">2. 依「報名編號」去除重複</text>
          <text x="418" y="179" fill="#34d399" font-size="13" font-weight="800">3. 保護原檔：絕不修改原始 Excel</text>

          <rect x="402" y="203" width="250" height="123" rx="12" fill="#090d16" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="418" y="228" fill="#38bdf8" font-size="15" font-weight="900">🧭 3 個名詞一眼分清：</text>
          <text x="418" y="253" fill="#e2e8f0" font-size="13" font-weight="700">• <tspan fill="#fbbf24" font-weight="900">Tool</tspan>：具體功能（讀檔/算人數）</text>
          <text x="418" y="277" fill="#e2e8f0" font-size="13" font-weight="700">• <tspan fill="#38bdf8" font-weight="900">MCP</tspan>：連接外部服務的協定</text>
          <text x="418" y="301" fill="#e2e8f0" font-size="13" font-weight="700">• <tspan fill="#34d399" font-weight="900">Plugin</tspan>：打包 Skill/MCP 的套件</text>
        </g>

        <line x1="675" y1="185" x2="712" y2="185" stroke="#f59e0b" stroke-width="4" stroke-dasharray="7 5" class="${s2 || s3 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-am)"/>

        <!-- Step 3: 交付統計成果與驗收 -->
        <g onclick="selectStep(2)" class="cursor-pointer">
          <rect x="720" y="22" width="310" height="325" rx="18" ${boxStyle(s3, '#10b981')}/>
          <rect x="720" y="22" width="310" height="44" rx="18" fill="#059669"/>
          <text x="875" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">③ 驗收成果：統計表＋實體檔案</text>

          <rect x="740" y="84" width="270" height="145" rx="12" fill="#1e293b" stroke="#10b981"/>
          <text x="756" y="110" fill="#34d399" font-size="15" font-weight="900">📊 產出可核對的統計結果：</text>
          <text x="756" y="136" fill="#e2e8f0" font-size="13" font-weight="700">• 原始筆數 / 有效筆數 / 去重後人數</text>
          <text x="756" y="160" fill="#e2e8f0" font-size="13" font-weight="700">• 各單位報名人數統計表</text>
          <text x="756" y="184" fill="#fbbf24" font-size="13" font-weight="800">• 異常清單：重複編號、取消、待確認</text>
          <text x="756" y="210" fill="#6ee7b7" font-size="13" font-weight="800">💾 另存實際可開啟的統計結果檔</text>

          <rect x="740" y="245" width="270" height="80" rx="12" fill="#450a0a" stroke="#f87171" stroke-width="2"/>
          <text x="875" y="273" text-anchor="middle" fill="#fca5a5" font-size="15" font-weight="900">🚨 驗收時必分清楚：</text>
          <text x="875" y="300" text-anchor="middle" fill="#fecaca" font-size="14" font-weight="800">「說明如何做」≠「工具已真正執行」</text>
        </g>
      </svg>
    `;
  }

  // 04 AGENT：頂部切換到 ChatGPT Work ➔ 比對 3 份衝突資料追查依據 ➔ 觸發停止條件交回差異表
  if (pageId === 'agent') {
    return `
      <svg viewBox="0 0 1050 370" class="w-full h-auto select-none">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="arr-pu" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7"/>
          </marker>
        </defs>

        <!-- Step 1: 頂部切換到 Work -->
        <g onclick="selectStep(0)" class="cursor-pointer">
          <rect x="20" y="22" width="315" height="325" rx="18" ${boxStyle(s1, '#a855f7')}/>
          <rect x="20" y="22" width="315" height="44" rx="18" fill="#7e22ce"/>
          <text x="177" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">① 在哪裡按：切換到 Work</text>

          <!-- 模擬 Chat / Work 切換器 -->
          <rect x="45" y="84" width="265" height="50" rx="25" fill="#090d16" stroke="#a855f7" stroke-width="2"/>
          <text x="110" y="115" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="800">Chat</text>
          <rect x="165" y="90" width="138" height="38" rx="19" fill="#9333ea"/>
          <text x="234" y="115" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="900">● Work 入口</text>

          <rect x="40" y="150" width="275" height="175" rx="12" fill="#1e293b" stroke="#c084fc"/>
          <text x="56" y="178" fill="#e9d5ff" font-size="15" font-weight="900">🧭 交辦 Work 的 4 大要素：</text>
          <text x="56" y="204" fill="#e2e8f0" font-size="13" font-weight="700">1. <tspan fill="#c084fc" font-weight="900">目標成果</tspan>：來源、差異與待確認表</text>
          <text x="56" y="228" fill="#e2e8f0" font-size="13" font-weight="700">2. <tspan fill="#c084fc" font-weight="900">授權範圍</tspan>：只用指定且已授權來源</text>
          <text x="56" y="252" fill="#fbbf24" font-size="13" font-weight="800">3. <tspan fill="#fbbf24" font-weight="900">停止條件</tspan>：無依據時停下交回人工</text>
          <text x="56" y="276" fill="#fca5a5" font-size="13" font-weight="800">4. <tspan fill="#fca5a5" font-weight="900">禁止越權</tspan>：不改公告、不寄送訊息</text>
          <text x="56" y="306" fill="#94a3b8" font-size="12" font-weight="700">（註：程式與版本測試可選桌面版 Codex）</text>
        </g>

        <line x1="338" y1="185" x2="375" y2="185" stroke="#a855f7" stroke-width="4" stroke-dasharray="7 5" class="${s1 || s2 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-pu)"/>

        <!-- Step 2: 發現衝突並依結果調整下一步 -->
        <g onclick="selectStep(1)" class="cursor-pointer">
          <rect x="382" y="22" width="290" height="325" rx="18" ${boxStyle(s2, '#a855f7')}/>
          <rect x="382" y="22" width="290" height="44" rx="18" fill="#6b21a8"/>
          <text x="527" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">② 怎麼運作：發現衝突自動追查</text>

          <rect x="402" y="82" width="250" height="110" rx="12" fill="#1e293b" stroke="#c084fc"/>
          <text x="418" y="106" fill="#e9d5ff" font-size="15" font-weight="900">📂 比對 3 份研習資料發現矛盾：</text>
          <text x="418" y="130" fill="#e2e8f0" font-size="13" font-weight="700">• 核定公告：11/15（五）14:00</text>
          <text x="418" y="152" fill="#fbbf24" font-size="13" font-weight="800">• 活動網頁：11/16（六）⚡日期衝突</text>
          <text x="418" y="174" fill="#fbbf24" font-size="13" font-weight="800">• 主辦信件：11/15 但地點不同⚡</text>

          <rect x="402" y="206" width="250" height="120" rx="12" fill="#090d16" stroke="#a855f7" stroke-width="2"/>
          <text x="418" y="232" fill="#d8b4fe" font-size="15" font-weight="900">🔄 Agent 依中途結果調整步驟：</text>
          <text x="418" y="256" fill="#e2e8f0" font-size="13" font-weight="700">• 不只是機械式逐份摘要</text>
          <text x="418" y="280" fill="#e2e8f0" font-size="13" font-weight="700">• 判斷還需查哪份授權依據</text>
          <text x="418" y="304" fill="#fde68a" font-size="13" font-weight="800">• 不因信件較新就擅自認定已核定！</text>
        </g>

        <line x1="675" y1="185" x2="712" y2="185" stroke="#a855f7" stroke-width="4" stroke-dasharray="7 5" class="${s2 || s3 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-pu)"/>

        <!-- Step 3: 停止條件與人工核決 -->
        <g onclick="selectStep(2)" class="cursor-pointer">
          <rect x="720" y="22" width="310" height="325" rx="18" ${boxStyle(s3, '#10b981')}/>
          <rect x="720" y="22" width="310" height="44" rx="18" fill="#059669"/>
          <text x="875" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">③ 驗收成果：附來源差異查核表</text>

          <rect x="740" y="84" width="270" height="145" rx="12" fill="#1e293b" stroke="#10b981"/>
          <text x="756" y="110" fill="#34d399" font-size="15" font-weight="900">📑 交付《來源、差異與待確認表》</text>
          <text x="756" y="136" fill="#e2e8f0" font-size="13" font-weight="700">• 每個結論均清楚標註文件來源</text>
          <text x="756" y="160" fill="#fbbf24" font-size="13" font-weight="800">• 找不到判定依據 ➔ 觸發停止條件</text>
          <text x="756" y="184" fill="#e2e8f0" font-size="13" font-weight="700">• 列出待確認問題，交回承辦人裁決</text>
          <text x="756" y="210" fill="#6ee7b7" font-size="13" font-weight="800">✅ 未經核准，絕不修改公告或寄信</text>

          <rect x="740" y="245" width="270" height="80" rx="12" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
          <text x="875" y="273" text-anchor="middle" fill="#c7d2fe" font-size="15" font-weight="900">💡 教材精準觀念：</text>
          <text x="875" y="299" text-anchor="middle" fill="#e0e7ff" font-size="13" font-weight="800">固定加總用公式即可；需追查調整才用 Agent</text>
        </g>
      </svg>
    `;
  }

  // 05 BOT：Slack / Teams 輸入 @ChatGPT ➔ 區分 Slack Plugin vs Slack Bot ➔ 群組回覆與權限可見範圍
  return `
    <svg viewBox="0 0 1050 370" class="w-full h-auto select-none">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="arr-ro" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
        </marker>
      </defs>

      <!-- Step 1: 同仁在 Slack / Teams 輸入 @ChatGPT -->
      <g onclick="selectStep(0)" class="cursor-pointer">
        <rect x="20" y="22" width="315" height="325" rx="18" ${boxStyle(s1, '#f43f5e')}/>
        <rect x="20" y="22" width="315" height="44" rx="18" fill="#e11d48"/>
        <text x="177" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">① 在哪裡按：群組打 @ChatGPT</text>

        <rect x="40" y="84" width="275" height="150" rx="12" fill="#090d16" stroke="#f43f5e" stroke-width="2"/>
        <text x="56" y="110" fill="#fda4af" font-size="15" font-weight="900">💬 Slack ／ Teams 研習工作頻道：</text>
        <rect x="56" y="122" width="105" height="26" rx="6" fill="#881337"/>
        <text x="65" y="140" fill="#fecdd3" font-size="14" font-weight="900">@ChatGPT</text>
        <text x="56" y="168" fill="#e2e8f0" font-size="13" font-weight="700">「請依本對話提供的核定公告，說明</text>
        <text x="56" y="190" fill="#e2e8f0" font-size="13" font-weight="700">研習日期、地點與報名期限並附來源；</text>
        <text x="56" y="212" fill="#fbbf24" font-size="13" font-weight="800">沒提到的請回答『目前無法確認』。」</text>

        <rect x="40" y="248" width="275" height="78" rx="12" fill="#1e293b" stroke="#475569"/>
        <text x="56" y="274" fill="#cbd5e1" font-size="14" font-weight="900">⚙️ 管理員後台設定入口：</text>
        <text x="56" y="298" fill="#94a3b8" font-size="13" font-weight="700">admin.openai.com ➔ Agents 設定權限</text>
      </g>

      <line x1="338" y1="185" x2="375" y2="185" stroke="#f43f5e" stroke-width="4" stroke-dasharray="7 5" class="${s1 || s2 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-ro)"/>

      <!-- Step 2: 最容易混淆對照：Slack Plugin (Tool) vs Slack @ChatGPT (Bot) -->
      <g onclick="selectStep(1)" class="cursor-pointer">
        <rect x="382" y="22" width="290" height="325" rx="18" ${boxStyle(s2, '#f43f5e')}/>
        <rect x="382" y="22" width="290" height="44" rx="18" fill="#be123c"/>
        <text x="527" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">② 秒懂區別：看「人在哪裡輸入」</text>

        <rect x="402" y="84" width="250" height="112" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="418" y="110" fill="#fbbf24" font-size="15" font-weight="900">🔌 在 ChatGPT 用 Slack Plugin</text>
        <text x="418" y="134" fill="#e2e8f0" font-size="13" font-weight="700">• 人在哪裡輸入：<tspan fill="#fde68a" font-weight="900">ChatGPT 對話框</tspan></text>
        <text x="418" y="156" fill="#e2e8f0" font-size="13" font-weight="700">• 說法：「請讀取 Slack 討論並摘要」</text>
        <text x="418" y="178" fill="#fbbf24" font-size="13" font-weight="900">➔ 教材對應：Tool（連接資料與動作）</text>

        <rect x="402" y="210" width="250" height="116" rx="12" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
        <text x="418" y="236" fill="#fda4af" font-size="15" font-weight="900">🤖 在 Slack 裡叫 @ChatGPT</text>
        <text x="418" y="260" fill="#e2e8f0" font-size="13" font-weight="700">• 人在哪裡輸入：<tspan fill="#fecdd3" font-weight="900">Slack 的對話串</tspan></text>
        <text x="418" y="282" fill="#e2e8f0" font-size="13" font-weight="700">• 說法：「@ChatGPT 請整理這段討論」</text>
        <text x="418" y="304" fill="#fda4af" font-size="13" font-weight="900">➔ 教材對應：Bot（訊息服務入口）</text>
      </g>

      <line x1="675" y1="185" x2="712" y2="185" stroke="#f43f5e" stroke-width="4" stroke-dasharray="7 5" class="${s2 || s3 ? 'svg-flow-line' : 'opacity-40'}" marker-end="url(#arr-ro)"/>

      <!-- Step 3: 群組回覆與權限驗收 -->
      <g onclick="selectStep(2)" class="cursor-pointer">
        <rect x="720" y="22" width="310" height="325" rx="18" ${boxStyle(s3, '#10b981')}/>
        <rect x="720" y="22" width="310" height="44" rx="18" fill="#059669"/>
        <text x="875" y="50" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="900">③ 驗收成果：群組回覆＋權限檢查</text>

        <rect x="740" y="84" width="270" height="125" rx="12" fill="#1e293b" stroke="#10b981"/>
        <text x="756" y="110" fill="#34d399" font-size="15" font-weight="900">✅ 群組直接收到有來源的回答：</text>
        <text x="756" y="135" fill="#e2e8f0" font-size="13" font-weight="700">• 顯示研習日期、地點、報名期限</text>
        <text x="756" y="158" fill="#e2e8f0" font-size="13" font-weight="700">• 清楚附上「核定公告」來源</text>
        <text x="756" y="182" fill="#fbbf24" font-size="13" font-weight="800">• 查無資料時回答「目前無法確認」</text>

        <rect x="740" y="224" width="270" height="102" rx="12" fill="#450a0a" stroke="#f87171" stroke-width="2"/>
        <text x="756" y="250" fill="#fca5a5" font-size="15" font-weight="900">🔐 權限與可見範圍必查：</text>
        <text x="756" y="274" fill="#fecaca" font-size="13" font-weight="700">1. 權限看「實際執行身分」（共用服務帳號）</text>
        <text x="756" y="298" fill="#fecaca" font-size="13" font-weight="700">2. 頻道回覆會被頻道內其他成員看到！</text>
      </g>
    </svg>
  `;
}

// ----------------------------------------------------------------------------
// 5. 渲染單一功能頁面（極簡具體圖說版：頂部入口標章 ＋ 大幅 SVG ＋ 單句圖說 ＋ 3 圖卡 ＋ 一鍵複製指令）
// ----------------------------------------------------------------------------
function renderMainPage() {
  const container = document.getElementById('page-main-container');
  if (!container) return;

  if (currentPageId === 'overview') {
    container.innerHTML = renderOverviewVisualPage();
    return;
  }

  const page = FIVE_PAGES.find(p => p.id === currentPageId) || FIVE_PAGES[0];
  const st = COLOR_STYLES[page.color];
  const activeStepObj = page.steps[currentStepIdx] || page.steps[0];

  const prevIdx = (FIVE_PAGES.findIndex(p => p.id === page.id) - 1 + FIVE_PAGES.length) % FIVE_PAGES.length;
  const nextIdx = (FIVE_PAGES.findIndex(p => p.id === page.id) + 1) % FIVE_PAGES.length;
  const prevPage = FIVE_PAGES[prevIdx];
  const nextPage = FIVE_PAGES[nextIdx];

  container.innerHTML = `
    <div class="space-y-5">

      <!-- 1. 頂部標題與「ChatGPT 畫面入口標章」 -->
      <section class="glass-card rounded-3xl p-5 sm:p-6 border-2 ${st.border} ${st.glow} flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-4">
          <div class="w-16 h-16 rounded-2xl ${st.bgSoft} border-2 ${st.border} flex items-center justify-center text-4xl shrink-0">
            ${page.icon}
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-0.5 rounded-full text-xs font-black border ${st.badge}">${page.badge}</span>
              <h2 class="text-2xl sm:text-3xl font-black text-white">${page.name}｜${page.zhName}</h2>
            </div>
            <p class="text-base sm:text-xl font-black ${st.text} mt-1">
              「${page.oneLiner}」
            </p>
            <div class="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-black text-amber-300">
              ${page.uiEntryBadge}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <button onclick="playStepAnimation()" class="px-5 py-3 rounded-2xl ${st.btn} font-black text-base shadow-lg transition-all flex items-center gap-2">
            ▶️ 播放 3 步圖說＋語音
          </button>
          <button onclick="speakText('${page.voiceIntro.replace(/'/g, "\\'")}', true)" class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-all">
            🔊 唸本頁重點
          </button>
        </div>
      </section>

      <!-- 2. 中央大幅「ChatGPT 具體畫面入口 ＋ 辦研習流程」SVG 圖解 ＋ 單句圖說 -->
      <section class="glass-card rounded-3xl p-5 sm:p-6 border-2 border-slate-800">
        <!-- 步驟切換按鈕列 -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex flex-wrap items-center gap-2">
            ${page.steps.map((s, idx) => `
              <button onclick="selectStep(${idx})"
                class="px-4 py-2 rounded-xl font-black text-sm sm:text-base transition-all border-2 ${
                  idx === currentStepIdx
                    ? `${st.btn} border-white shadow`
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }">
                ${s.label}
              </button>
            `).join('')}
          </div>
          <span class="text-xs sm:text-sm font-bold text-slate-400">💡 點擊圖中 ① ② ③ 區塊可直接聽該步語音與圖說</span>
        </div>

        <!-- 大幅互動 SVG 畫布 -->
        <div id="svg-stage-box" class="bg-slate-950/95 rounded-2xl p-3 sm:p-4 border border-slate-800">
          ${renderCustomSVG(page.id, currentStepIdx)}
        </div>

        <!-- 單句大字圖說列 -->
        <div class="mt-4 rounded-2xl p-4 sm:p-5 bg-slate-900/95 border-2 ${st.border} flex items-center gap-3.5">
          <span class="px-3 py-1.5 rounded-xl ${st.btn} font-black text-sm shrink-0">
            步驟圖說 ${currentStepIdx + 1}/3
          </span>
          <p id="active-caption-text" class="text-lg sm:text-xl font-black text-white leading-snug">
            ${activeStepObj.caption}
          </p>
        </div>
      </section>

      <!-- 3. 底部 3 張具體對照圖卡 -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${page.visualCards.map(c => `
          <div onclick="speakText('${c.title}。${c.caption}', true)"
            class="cursor-pointer glass-card rounded-2xl p-5 border-2 border-slate-800 hover:${st.border} transition-all flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl ${st.bgSoft} border ${st.border} flex items-center justify-center text-2xl shrink-0">
              ${c.icon}
            </div>
            <div>
              <span class="text-xs font-black uppercase tracking-wider ${st.text}">${c.tag}</span>
              <h3 class="text-lg sm:text-xl font-black text-white mt-0.5">${c.title}</h3>
              <p class="text-sm sm:text-base font-bold text-slate-300 mt-1 leading-relaxed">${c.caption}</p>
            </div>
          </div>
        `).join('')}
      </section>

      <!-- 4. 課堂實作指令（一鍵複製）＋ 官方文件依據 -->
      <section class="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-950/80">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black text-white">${page.demoPromptTitle}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <a href="${page.officialLink}" target="_blank" rel="noopener noreferrer"
              class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-xs sm:text-sm font-bold transition-all">
              🔗 ${page.officialLabel} ↗
            </a>
            <button onclick="copyCurrentDemoPrompt()" id="btn-copy-prompt"
              class="px-4 py-2 rounded-xl ${st.btn} font-black text-xs sm:text-sm shadow transition-all">
              📋 一鍵複製指令
            </button>
          </div>
        </div>
        <pre class="bg-slate-900/95 border border-slate-800 rounded-xl p-4 text-sm sm:text-base font-bold text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">${page.demoPrompt}</pre>
      </section>

      <!-- 5. 上一頁 / 下一頁快速導航 -->
      <section class="flex items-center justify-between gap-4 pt-1">
        <button onclick="switchPage('${prevPage.id}')" class="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-black text-sm sm:text-base flex items-center gap-2">
          ← 上一頁：${prevPage.stepNum} ${prevPage.name}（${prevPage.zhName}）
        </button>
        <button onclick="switchPage('overview')" class="px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-black text-sm sm:text-base">
          🗺️ 看「辦研習」五站總覽對照
        </button>
        <button onclick="switchPage('${nextPage.id}')" class="px-5 py-3 rounded-2xl ${st.btn} font-black text-sm sm:text-base flex items-center gap-2 shadow-lg">
          下一頁：${nextPage.stepNum} ${nextPage.name}（${nextPage.zhName}） →
        </button>
      </section>

    </div>
  `;
}

function copyCurrentDemoPrompt() {
  const page = FIVE_PAGES.find(p => p.id === currentPageId);
  if (!page || !page.demoPrompt) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(page.demoPrompt).then(() => {
      const btn = document.getElementById('btn-copy-prompt');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ 已複製到剪貼簿！';
        setTimeout(() => { btn.textContent = orig; }, 1800);
      }
    });
  }
}

function selectStep(stepIdx) {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  currentStepIdx = stepIdx;
  const page = FIVE_PAGES.find(p => p.id === currentPageId);
  if (!page) return;
  renderMainPage();
  const stepObj = page.steps[stepIdx];
  if (stepObj) speakText(stepObj.voice, true);
}

function playStepAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  const page = FIVE_PAGES.find(p => p.id === currentPageId);
  if (!page) return;

  currentStepIdx = 0;
  renderMainPage();
  speakText(page.steps[0].voice, true);

  animTimer = setInterval(() => {
    currentStepIdx++;
    if (currentStepIdx >= page.steps.length) {
      clearInterval(animTimer);
      animTimer = null;
      currentStepIdx = page.steps.length - 1;
      renderMainPage();
      return;
    }
    renderMainPage();
    speakText(page.steps[currentStepIdx].voice, true);
  }, 5500);
}

// ----------------------------------------------------------------------------
// 6. 五站總覽頁（對應文件第 1、7、8、9 節：架構圖 ＋ 辦一場校內研習五步串聯 ＋ 自訂 GPT 位置）
// ----------------------------------------------------------------------------
function renderOverviewVisualPage() {
  const scenarioSteps = [
    { id: 'prompt', num: '1', need: '「幫我把公告寫成通知」', entry: 'Chat 對話輸入框', diff: 'Prompt 把本次成果說清楚', icon: '💬', color: 'sky' },
    { id: 'skill', num: '2', need: '「每場都照同一套標準寫」', entry: 'Skills 側欄 ＋ @ 對話呼叫', diff: 'Skill 保存可重用的方法', icon: '📦', color: 'emerald' },
    { id: 'tool', num: '3', need: '「讀取名單並計算人數」', entry: '內建檔案工具 ／ Plugins', diff: 'Tool 實際取得資料與執行動作', icon: '🔌', color: 'amber' },
    { id: 'agent', num: '4', need: '「發現資料矛盾時繼續找依據」', entry: '切換到 Work ＋ 已授權工具', diff: 'Agent 根據結果調整工作步驟', icon: '🧭', color: 'purple' },
    { id: 'bot', num: '5', need: '「讓同仁在群組直接詢問」', entry: 'Slack／Teams 的 @ChatGPT', diff: 'Bot 把能力提供為訊息服務', icon: '🤖', color: 'rose' }
  ];

  return `
    <div class="space-y-6">
      <!-- 頂部核心破題 -->
      <section class="glass-card rounded-3xl p-6 border-2 border-amber-400/70 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
              先看懂：五個概念對應哪些服務？
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-white mt-2">
              五個概念是理解工作的五個角度，可以組合使用！
            </h2>
            <p class="text-base sm:text-lg font-bold text-amber-200 mt-1">
              ⚠️ 它們不是 ChatGPT 的五種付費等級，也不是五個互斥的按鈕。
            </p>
          </div>
          <button onclick="switchPage('prompt')" class="px-5 py-3 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-base shadow-lg">
            🚀 從第 1 頁 Prompt 開始看圖解
          </button>
        </div>
      </section>

      <!-- 圖解 1：文件第 1 節 Mermaid 概念對照 SVG 圖（五者共同完成一項工作） -->
      <section class="glass-card rounded-3xl p-6 border-2 border-slate-800">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 class="text-xl sm:text-2xl font-black text-white">🗺️ 圖說一：五個概念如何共同完成一項工作？（點任一積木可跳頁）</h3>
          <span class="text-xs sm:text-sm font-bold text-slate-400">對應《ChatGPT 五大概念服務與頁面對照》第 1 節架構圖</span>
        </div>

        <div class="bg-slate-950/95 rounded-2xl p-4 border border-slate-800">
          <svg viewBox="0 0 1050 290" class="w-full h-auto select-none">
            <defs>
              <marker id="arr-ov" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
              </marker>
            </defs>

            <!-- 左側 5 個概念入口 -->
            <g onclick="switchPage('prompt')" class="cursor-pointer">
              <rect x="20" y="15" width="290" height="44" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
              <text x="38" y="43" fill="#38bdf8" font-size="16" font-weight="900">💬 Prompt：這次要做什麼</text>
            </g>
            <g onclick="switchPage('skill')" class="cursor-pointer">
              <rect x="20" y="70" width="290" height="44" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="2.5"/>
              <text x="38" y="98" fill="#34d399" font-size="16" font-weight="900">📦 Skill：可重用的方法</text>
            </g>
            <g onclick="switchPage('tool')" class="cursor-pointer">
              <rect x="20" y="125" width="290" height="44" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5"/>
              <text x="38" y="153" fill="#fbbf24" font-size="16" font-weight="900">🔌 Tool：讀取、計算、寫入</text>
            </g>
            <g onclick="switchPage('agent')" class="cursor-pointer">
              <rect x="20" y="180" width="290" height="44" rx="10" fill="#0f172a" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="6 4"/>
              <text x="38" y="208" fill="#c084fc" font-size="16" font-weight="900">🧭 Agent：依結果安排下一步</text>
            </g>
            <g onclick="switchPage('bot')" class="cursor-pointer">
              <rect x="20" y="235" width="290" height="44" rx="10" fill="#0f172a" stroke="#f43f5e" stroke-width="2.5"/>
              <text x="38" y="263" fill="#fda4af" font-size="16" font-weight="900">🤖 Bot：訊息服務入口 (@ChatGPT)</text>
            </g>

            <!-- 匯流連線 -->
            <line x1="312" y1="37" x2="415" y2="120" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-ov)"/>
            <line x1="312" y1="92" x2="415" y2="135" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-ov)"/>
            <line x1="312" y1="147" x2="415" y2="147" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-ov)"/>
            <line x1="312" y1="202" x2="415" y2="160" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#arr-ov)"/>
            <line x1="312" y1="257" x2="415" y2="175" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-ov)"/>

            <!-- 中央核心工作區 -->
            <rect x="420" y="85" width="250" height="125" rx="20" fill="#1e293b" stroke="#f8fafc" stroke-width="3"/>
            <text x="545" y="135" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900">💻 Chat 對話</text>
            <text x="545" y="165" text-anchor="middle" fill="#38bdf8" font-size="20" font-weight="900">或 Work 工作</text>
            <text x="545" y="192" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="700">（五者協同運作的舞台）</text>

            <!-- 輸出箭頭 -->
            <line x1="672" y1="147" x2="735" y2="147" stroke="#10b981" stroke-width="4" class="svg-flow-line" marker-end="url(#arr-ov)"/>

            <!-- 右側最終成果 -->
            <rect x="742" y="75" width="285" height="145" rx="20" fill="#064e3b" stroke="#10b981" stroke-width="3"/>
            <text x="884" y="122" text-anchor="middle" fill="#6ee7b7" font-size="19" font-weight="900">✅ 可核對的成果</text>
            <text x="884" y="152" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="800">• 答案與通知草稿</text>
            <text x="884" y="176" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="800">• 統計檔案與差異查核表</text>
            <text x="884" y="200" text-anchor="middle" fill="#fde68a" font-size="14" font-weight="800">• 經授權與核對的系統動作</text>
          </svg>
        </div>
      </section>

      <!-- 圖解 2：用同一個任務「辦一場校內研習」連起五個主題 -->
      <section class="glass-card rounded-3xl p-6 border-2 border-slate-800">
        <h3 class="text-xl sm:text-2xl font-black text-white mb-1">${OVERVIEW_DATA.scenarioTitle}</h3>
        <p class="text-sm sm:text-base font-bold text-slate-400 mb-4">${OVERVIEW_DATA.scenarioSubtitle}</p>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          ${scenarioSteps.map(s => {
            const st = COLOR_STYLES[s.color];
            return `
              <div onclick="switchPage('${s.id}')"
                class="cursor-pointer rounded-2xl p-4 bg-slate-900/95 border-2 ${st.border} hover:scale-[1.02] transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-950 ${st.text}">示範順序 ${s.num}</span>
                    <span class="text-2xl">${s.icon}</span>
                  </div>
                  <div class="text-base sm:text-lg font-black text-white leading-snug">${s.need}</div>
                  <div class="mt-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black text-amber-300">
                    📍 入口：${s.entry}
                  </div>
                </div>
                <div class="mt-3 pt-2.5 border-t border-slate-800 text-xs sm:text-sm font-black ${st.text}">
                  👉 ${s.diff}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 圖解 3：以前的「自訂 GPT」放在哪裡？ ＋ 授課前可用入口核對表 -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card rounded-2xl p-5 border-2 border-slate-800">
          <h4 class="text-lg sm:text-xl font-black text-amber-300">${OVERVIEW_DATA.customGptNote.title}</h4>
          <p class="text-sm sm:text-base font-bold text-slate-300 mt-2 leading-relaxed">${OVERVIEW_DATA.customGptNote.desc}</p>
          <div class="mt-3 space-y-2">
            ${OVERVIEW_DATA.customGptNote.items.map(it => `
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm sm:text-base font-black text-white">
                ${it}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-card rounded-2xl p-5 border-2 border-slate-800">
          <h4 class="text-lg sm:text-xl font-black text-sky-300">📋 授課前檢查：ChatGPT 五大服務實際入口速查</h4>
          <p class="text-xs sm:text-sm font-bold text-slate-400 mt-1 mb-3">沒看到入口時先確認帳號方案與工作區權限，不要把「找不到按鈕」當成操作錯誤：</p>
          <div class="space-y-2">
            ${OVERVIEW_DATA.preClassChecklist.map(row => `
              <div class="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm">
                <span class="font-black text-white">${row.item}</span>
                <span class="font-bold text-amber-300">📍 ${row.entry}</span>
                <span class="font-bold text-slate-400">${row.note}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 7. 初始化
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  renderTopTabs();
  renderMainPage();
});
