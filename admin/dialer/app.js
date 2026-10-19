// =====================================================================
// 考生聯絡半自動撥號｜3D 語音互動導覽劇場 互動邏輯與語音引擎 (app.js)
// =====================================================================

let currentStep = 1;
let selectedCandidateId = 'c1';
let lastSimMode = 'answered'; // 'answered' | 'busy'
let voiceEnabled = true;
let isAutoTouring = false;
let autoTourTimer = null;
let audioCtx = null;

// ---------------------------------------------------------------------
// 1. Web Audio API 擬真電話音效合成器 (撥號音 DTMF / 響鈴音 / 忙線音)
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

function playDtmfSequence() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const freqs = [
    [697, 1209], [770, 1336], [852, 1477],
    [697, 1336], [770, 1209], [852, 1336], [941, 1336]
  ];
  freqs.forEach((pair, idx) => {
    const start = ctx.currentTime + idx * 0.075;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.frequency.value = pair[0];
    osc2.frequency.value = pair[1];
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + 0.065);
    osc2.stop(start + 0.065);
  });
}

function playLineTone(type = 'ring') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (type === 'busy') {
    for (let i = 0; i < 3; i++) {
      const start = ctx.currentTime + i * 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 480;
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.setValueAtTime(0.001, start + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    }
  } else {
    const start = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.frequency.value = 440;
    osc2.frequency.value = 480;
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + 0.66);
    osc2.stop(start + 0.66);
  }
}

// ---------------------------------------------------------------------
// 2. Web Speech API 中文語音導覽與 TTS 模擬引擎
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
// 3. 渲染頂部 7 步驟進度膠囊、左側考生名單、與電腦狀態卡
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

function renderCandidateList() {
  const listEl = document.getElementById('candidate-list');
  listEl.innerHTML = CANDIDATES.map(c => {
    const isSelected = c.id === selectedCandidateId;
    const badgeStyles = {
      slate: 'bg-slate-800 text-slate-300 border-slate-700',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      sky: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }[c.statusColor] || 'bg-slate-800 text-slate-300 border-slate-700';

    return `
      <div class="p-3 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-slate-800/95 border-sky-400 shadow-lg shadow-sky-500/10'
          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
      }">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl ${isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'} font-black flex items-center justify-center text-sm">
              ${c.name.slice(0, 1)}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-sm text-white">${c.name}</span>
                <span class="text-[11px] text-slate-400">報考：${c.dept}</span>
              </div>
              <div class="text-[11px] text-slate-400">${c.note}</div>
            </div>
          </div>

          <button
            onclick="clickCandidatePhone('${c.id}')"
            class="px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
              isSelected && currentStep >= 2 && currentStep <= 6
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 text-sky-300 border border-sky-400/40'
            }"
          >
            <span>📞</span>
            <span class="underline decoration-dotted underline-offset-4">${c.phone}</span>
          </button>
        </div>

        <div class="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
          <span class="text-slate-400">聯絡紀錄：</span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyles}">
            ${c.statusText}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function renderPcToast() {
  const toast = document.getElementById('pc-status-toast');
  const cand = CANDIDATES.find(c => c.id === selectedCandidateId) || CANDIDATES[0];

  if (currentStep === 1) {
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">👆</span>
          <div>
            <div class="text-xs font-black text-white">等待點選電話號碼</div>
            <div class="text-[11px] text-slate-400">直接點上方任一組藍色電話號碼即可自動撥號</div>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">待命中</span>
      </div>
    `;
  } else if (currentStep === 2 || currentStep === 3) {
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-xl animate-bounce">📟</span>
          <div>
            <div class="text-xs font-black text-amber-300">正在透過 Modem 自動撥號給 ${cand.name}...</div>
            <div class="text-[11px] text-slate-300 font-mono">指令：ATZ ➔ ATDT ${cand.phone.replace(/-/g, '')}</div>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold">撥號中</span>
      </div>
    `;
  } else if (currentStep === 4) {
    if (lastSimMode === 'busy') {
      toast.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">⚡</span>
            <div>
              <div class="text-xs font-black text-rose-300">Modem 回應碼：BUSY（對方忙線中）</div>
              <div class="text-[11px] text-amber-200">系統已自動登記「10:20 忙線，待重撥」，可直接點下一位！</div>
            </div>
          </div>
          <button onclick="clickCandidatePhone('c1')" class="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-black text-xs">改撥林同學 ▶</button>
        </div>
      `;
    } else {
      toast.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl animate-pulse">🔔</span>
            <div>
              <div class="text-xs font-black text-sky-300">狀態：撥號中 ➔ 響鈴中 (Ringing...)</div>
              <div class="text-[11px] text-slate-300">若忙線或無人接，Modem 會自動記錄並跳下一位</div>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[11px] font-bold">響鈴中</span>
        </div>
      `;
    }
  } else if (currentStep === 5) {
    toast.innerHTML = `
      <div class="p-1 rounded-xl bg-emerald-950/80 border border-emerald-400/60">
        <div class="flex items-center justify-between px-2 py-1">
          <div class="flex items-center gap-2">
            <span class="text-xl animate-bounce">📢</span>
            <div>
              <div class="text-xs sm:text-sm font-black text-emerald-300">✅ 已接通！正在播 TTS 開場白，請拿起話機！</div>
              <div class="text-[11px] text-emerald-100">電腦正替您表明臺中科大身分，爭取拿起話機的黃金幾秒鐘</div>
            </div>
          </div>
          <button onclick="goToStep(6)" class="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shrink-0 shadow">
            ✋ 拿起話機
          </button>
        </div>
      </div>
    `;
  } else if (currentStep === 6) {
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">👩‍💼</span>
          <div>
            <div class="text-xs font-black text-emerald-300">真人通話中（Modem 已掛斷讓出線路）</div>
            <div class="text-[11px] text-slate-300">不錄音、不透過 AI，同仁直接用實體話機與 ${cand.name} 自然對談</div>
          </div>
        </div>
        <button onclick="goToStep(7)" class="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0">
          掛上話機 ▶
        </button>
      </div>
    `;
  } else if (currentStep === 7) {
    toast.innerHTML = `
      <div>
        <div class="text-xs font-black text-amber-300 mb-2">📌 通話結束！請一鍵點選「${cand.name}」的聯絡結果：</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button onclick="saveCallResult('✅ 已聯絡（確認報到）', 'emerald')" class="py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold text-xs">
            ✅ 已聯絡
          </button>
          <button onclick="saveCallResult('🔄 需再追蹤（考慮中）', 'sky')" class="py-1.5 px-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold text-xs">
            🔄 需再追蹤
          </button>
          <button onclick="saveCallResult('🙅 婉拒就讀', 'amber')" class="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-bold text-xs">
            🙅 拒絕
          </button>
          <button onclick="saveCallResult('❌ 號碼錯誤', 'rose')" class="py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 font-bold text-xs">
            ❌ 號碼錯誤
          </button>
        </div>
      </div>
    `;
  }
}

// ---------------------------------------------------------------------
// 4. 更新 3D 舞台視覺狀態（線路電流、LED 燈、聽筒抬起、考生手機畫面）
// ---------------------------------------------------------------------
function update3DStageVisuals() {
  const s = STEPS[currentStep - 1];

  document.getElementById('banner-step-num').textContent = s.step;
  document.getElementById('banner-step-title').textContent = s.title;
  document.getElementById('banner-step-tag').textContent = s.tag;
  document.getElementById('banner-voice-subtitle').textContent = `「${s.voiceText}」`;

  document.getElementById('hw-state-pc').textContent = s.pcState;
  document.getElementById('hw-state-modem').textContent = s.modemState;
  document.getElementById('hw-state-phone').textContent = s.phoneState;
  document.getElementById('modem-bubble-text').textContent = s.modemCmd;

  const wireSerial = document.getElementById('wire-serial');
  const wireModemLine = document.getElementById('wire-modem-line');
  const wirePhoneParallel = document.getElementById('wire-phone-parallel');
  const wirePstn = document.getElementById('wire-pstn');

  const ledTx = document.getElementById('led-tx');
  const ledRx = document.getElementById('led-rx');
  const ledOh = document.getElementById('led-oh');

  const phoneHandset = document.getElementById('phone-handset');
  const staffAvatar = document.getElementById('staff-avatar');
  const studentBody = document.getElementById('student-phone-body');
  const studentIcon = document.getElementById('student-screen-icon');
  const studentStatus = document.getElementById('student-screen-status');
  const studentSub = document.getElementById('student-screen-sub');
  const speechOverlay = document.getElementById('stage-speech-overlay');
  const speechBadge = document.getElementById('speech-box-badge');
  const speechLine1 = document.getElementById('speech-box-line1');
  const speechLine2 = document.getElementById('speech-box-line2');
  const speechBg = document.getElementById('speech-box-bg');

  [wireSerial, wireModemLine, wirePhoneParallel, wirePstn].forEach(w => {
    w.setAttribute('class', 'opacity-20');
  });
  ledTx.setAttribute('fill', '#475569');
  ledRx.setAttribute('fill', '#475569');
  ledOh.setAttribute('fill', '#475569');
  phoneHandset.classList.remove('handset-lifted');
  studentBody.classList.remove('handset-ringing');
  staffAvatar.classList.remove('opacity-100');
  staffAvatar.classList.add('opacity-50');
  speechOverlay.classList.add('hidden');

  document.getElementById('hw-card-pc').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-modem').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';
  document.getElementById('hw-card-phone').className = 'rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center gap-3 transition-all';

  if (currentStep === 1) {
    document.getElementById('hw-card-pc').classList.add('glow-active-blue');
    studentIcon.textContent = '📱';
    studentStatus.textContent = '考生手機待命中';
    studentSub.textContent = '來電將顯示學校代表號';
  } else if (currentStep === 2) {
    document.getElementById('hw-card-pc').classList.add('glow-active-blue');
    wireSerial.setAttribute('class', 'opacity-100 wire-flow');
    ledRx.setAttribute('fill', '#38bdf8');
    studentIcon.textContent = '📱';
    studentStatus.textContent = '電腦已送出號碼';
    studentSub.textContent = '免按話機按鍵，零誤撥';
  } else if (currentStep === 3) {
    document.getElementById('hw-card-modem').classList.add('glow-active-amber');
    wireSerial.setAttribute('class', 'opacity-100 wire-flow');
    wireModemLine.setAttribute('class', 'opacity-100 wire-flow');
    wirePstn.setAttribute('class', 'opacity-100 wire-flow');
    ledTx.setAttribute('fill', '#fbbf24');
    ledOh.setAttribute('fill', '#ef4444');
    studentIcon.textContent = '📡';
    studentStatus.textContent = '市話基地台連線中';
    studentSub.textContent = '來電顯示：04-2219-XXXX';
    playDtmfSequence();
  } else if (currentStep === 4) {
    document.getElementById('hw-card-modem').classList.add('glow-active-amber');
    wireModemLine.setAttribute('class', 'opacity-100 wire-flow');
    wirePstn.setAttribute('class', 'opacity-100 wire-flow');
    ledRx.setAttribute('fill', '#fbbf24');
    ledOh.setAttribute('fill', '#ef4444');

    if (lastSimMode === 'busy') {
      studentIcon.textContent = '🚫';
      studentStatus.textContent = '考生通話忙線中 (BUSY)';
      studentSub.textContent = 'Modem 自動回傳忙線並登記名單';
      document.getElementById('modem-bubble-text').textContent = 'BUSY -> 自動記一筆';
      playLineTone('busy');
    } else {
      studentBody.classList.add('handset-ringing');
      studentIcon.textContent = '🔔';
      studentStatus.textContent = '考生手機響鈴中！';
      studentSub.textContent = '看到臺中科大號碼，準備接聽';
      playLineTone('ring');
    }
  } else if (currentStep === 5) {
    document.getElementById('hw-card-pc').classList.add('glow-active-blue');
    document.getElementById('hw-card-modem').classList.add('glow-active-amber');
    wireSerial.setAttribute('class', 'opacity-100 wire-flow');
    wireModemLine.setAttribute('class', 'opacity-100 wire-flow');
    wirePstn.setAttribute('class', 'opacity-100 wire-flow');
    ledTx.setAttribute('fill', '#22c55e');
    ledOh.setAttribute('fill', '#ef4444');

    studentIcon.textContent = '🎧';
    studentStatus.textContent = '已接聽！收聽學校開場白';
    studentSub.textContent = '「您好，這裡是國立臺中科技大學...」';

    speechOverlay.classList.remove('hidden');
    speechBg.setAttribute('stroke', '#38bdf8');
    speechBadge.setAttribute('fill', '#38bdf8');
    speechBadge.textContent = '🤖 電腦自動播 TTS 開場白（表明身分＋爭取幾秒鐘）：';
    speechLine1.textContent = '「您好，這裡是國立臺中科技大學，關於您報考○○的相關事項，';
    speechLine2.textContent = '　我們的同仁要跟您說明一下，請稍候。」';
  } else if (currentStep === 6) {
    document.getElementById('hw-card-phone').classList.add('glow-active-emerald');
    phoneHandset.classList.add('handset-lifted');
    staffAvatar.classList.remove('opacity-50');
    staffAvatar.classList.add('opacity-100');
    wirePhoneParallel.setAttribute('class', 'opacity-100 wire-flow');
    wirePstn.setAttribute('class', 'opacity-100 wire-flow');

    studentIcon.textContent = '🗣️';
    studentStatus.textContent = '與學校同仁真人通話中';
    studentSub.textContent = '通話不斷線，自然親切對談';

    speechOverlay.classList.remove('hidden');
    speechBg.setAttribute('stroke', '#10b981');
    speechBadge.setAttribute('fill', '#34d399');
    speechBadge.textContent = '👩‍💼 同仁拿起實體話機（Modem 自動掛斷讓出線路）：';
    speechLine1.textContent = '「林同學您好！我是招生處老師，恭喜您通過第一階段，';
    speechLine2.textContent = '　想跟您確認下週六面試的報到時間方便嗎？」';
  } else if (currentStep === 7) {
    document.getElementById('hw-card-pc').classList.add('glow-active-blue');
    studentIcon.textContent = '✅';
    studentStatus.textContent = '通話完成，掛斷電話';
    studentSub.textContent = '同仁在名單勾選結果，繼續下一位';
  }
}

// ---------------------------------------------------------------------
// 5. 互動控制：跳轉步驟、點擊考生電話、儲存聯絡結果、一鍵自動導覽
// ---------------------------------------------------------------------
function goToStep(stepNumber, shouldSpeak = true) {
  currentStep = Math.max(1, Math.min(7, stepNumber));
  renderStepPills();
  renderCandidateList();
  renderPcToast();
  update3DStageVisuals();
  if (shouldSpeak) {
    speakCurrentStep(false);
  }
}

function nextStep() {
  stopAutoTour();
  const next = currentStep < 7 ? currentStep + 1 : 1;
  goToStep(next, true);
}

function prevStep() {
  stopAutoTour();
  const prev = currentStep > 1 ? currentStep - 1 : 7;
  goToStep(prev, true);
}

function clickCandidatePhone(candId) {
  stopAutoTour();
  selectedCandidateId = candId;
  const cand = CANDIDATES.find(c => c.id === candId);
  if (!cand) return;

  lastSimMode = cand.mode;

  if (cand.mode === 'busy') {
    goToStep(2, false);
    speakText(`點選${cand.name}的電話，電腦自動對 Modem 下達撥號指令。`, () => {
      goToStep(4, false);
      cand.statusText = '10:22 忙線，待重撥 (Modem自動記)';
      cand.statusColor = 'amber';
      renderCandidateList();
      renderPcToast();
      speakText('Modem 偵測到對方忙線回應碼，系統自動在名單記上一筆「忙線待重撥」，同仁完全不用手寫，直接跳下一位！');
    });
  } else {
    goToStep(2, true);
  }
}

function simulateQuickScenario(mode) {
  stopAutoTour();
  lastSimMode = mode;
  if (mode === 'busy') {
    selectedCandidateId = 'c2';
    const cand = CANDIDATES.find(c => c.id === 'c2');
    cand.statusText = '10:25 忙線，待重撥 (Modem自動記)';
    cand.statusColor = 'amber';
    goToStep(4, false);
    const msg = '模擬忙線情境：Modem 收到 BUSY 回應碼，系統自動在名單記一筆「忙線、待重撥」，同仁直接點下一位！';
    document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
    speakText(msg);
  } else {
    selectedCandidateId = 'c1';
    goToStep(5, true);
  }
}

function saveCallResult(resultLabel, color) {
  const cand = CANDIDATES.find(c => c.id === selectedCandidateId);
  if (cand) {
    cand.statusText = resultLabel;
    cand.statusColor = color;
  }
  const nextCand = CANDIDATES.find(c => c.id !== selectedCandidateId && c.statusText === '待聯絡') || CANDIDATES[2];
  if (nextCand) selectedCandidateId = nextCand.id;

  renderCandidateList();
  const msg = `已登記結果為「${resultLabel}」！名單自動往下推進，可以點下一支電話繼續聯絡。`;
  document.getElementById('banner-voice-subtitle').textContent = `「${msg}」`;
  speakText(msg);
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
  lastSimMode = 'answered';
  selectedCandidateId = 'c1';
  updateVoiceToggleUI();
  updateAutoTourButtonUI();

  const runStep = (stepIdx) => {
    if (!isAutoTouring) return;
    currentStep = stepIdx;
    renderStepPills();
    renderCandidateList();
    renderPcToast();
    update3DStageVisuals();

    const stepObj = STEPS[stepIdx - 1];
    speakText(stepObj.voiceText, () => {
      if (!isAutoTouring) return;
      if (stepIdx < 7) {
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
