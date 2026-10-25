// app.js - AI 時代評量探索與三軌來源交互驗證互動邏輯
// 版本標籤: v20261025

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

let currentActiveClaimId = "claim-1";
let rubricScores = {
  dim1: 20,
  dim2: 15,
  dim3: 20,
  dim4: 18
};

function initApp() {
  renderBenchmarks();
  renderSandboxPaper();
  selectClaim("claim-1");
  renderAssessmentModels();
  selectModel("model-1");
  renderRubricCalculator();
  updateRubricTotal();
  setupTabNavigation();
}

// 1. 渲染頂部權威政策與理論基準
function renderBenchmarks() {
  const container = document.getElementById("benchmark-cards-container");
  if (!container) return;

  container.innerHTML = ASSESSMENT_DATA.benchmarks.map(b => `
    <div class="glass-card p-5 rounded-2xl flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-${b.badgeColor}-500/20 text-${b.badgeColor}-300 border border-${b.badgeColor}-500/30">
            ${b.institution} • ${b.year}
          </span>
          <button onclick="copyCitation('${b.id}')" class="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1" title="複製 APA 引用">
            <i class="fa-regular fa-copy"></i> 引用
          </button>
        </div>
        <h4 class="font-bold text-slate-100 text-base mb-2">${b.title}</h4>
        <p class="text-xs font-medium text-indigo-300 mb-3 bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
          🎯 核心主張：${b.coreTheme}
        </p>
        <ul class="text-xs text-slate-300 space-y-1.5 mb-4">
          ${b.keyPoints.map(p => `<li class="flex items-start gap-1.5"><span class="text-indigo-400 mt-0.5">•</span><span>${formatMarkdown(p)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <span class="text-[11px] text-slate-400 truncate max-w-[200px]">${b.leadAuthors || b.institution}</span>
        ${b.sourceUrl !== '#' ? `
          <a href="${b.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            官方文獻 <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// 2. 渲染三軌來源交互驗證沙盒
function renderSandboxPaper() {
  const textContainer = document.getElementById("sandbox-paper-content");
  const claimsListContainer = document.getElementById("sandbox-claims-list");
  if (!textContainer || !claimsListContainer) return;

  const paper = ASSESSMENT_DATA.sandboxPaper;

  // 渲染學生報告原文與標記
  textContainer.innerHTML = `
    <div class="border-b border-slate-700 pb-3 mb-4">
      <span class="text-xs font-mono text-indigo-400">📄 學生期末報告審查樣張（含 AI 生成痕跡）</span>
      <h3 class="text-lg font-bold text-white mt-1">${paper.paperTitle}</h3>
      <div class="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
        <span><i class="fa-solid fa-user-graduate text-slate-500"></i> ${paper.studentInfo}</span>
        <span><i class="fa-regular fa-calendar text-slate-500"></i> 繳交日期：${paper.submissionDate}</span>
      </div>
    </div>
    <div class="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
      <p>
        <strong>【摘要】</strong> 本研究針對近年大專教育現場導入生成式 AI 之效能進行實證考察。
        <span class="claim-pill claim-warning" id="pill-claim-1" onclick="selectClaim('claim-1')">
          根據 2024 年全台大專院校跨校調查，有高達 87.5% 的學生表示使用 ChatGPT 後自主學習動機顯著增加（p &lt; 0.01）。
          <span class="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 ml-1 font-mono">⚠️ 待核查[1]</span>
        </span>
        然而，工具之過度依賴亦引發學界高度關注。
        <span class="claim-pill claim-hallucinated" id="pill-claim-2" onclick="selectClaim('claim-2')">
          Brown &amp; Smith (2023) 在 Computers &amp; Education 指出，AI 能提供鷹架引導，但過度依賴會降低工作記憶容量。
          <span class="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300 ml-1 font-mono">❌ 假引用[2]</span>
        </span>
      </p>
      <p>
        在法規遵循與學術誠信架構方面，
        <span class="claim-pill claim-verified" id="pill-claim-3" onclick="selectClaim('claim-3')">
          教育部《大專校院學生使用生成式AI注意事項》明定學生必須對 AI 生成內容負完全學術與查證責任，絕不能以『AI 生成錯誤』作為抄襲免責辯護。
          <span class="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 ml-1 font-mono">✅ 官方指引[3]</span>
        </span>
        且在技術原理層面，
        <span class="claim-pill claim-verified" id="pill-claim-4" onclick="selectClaim('claim-4')">
          Transformer 架構的自注意力機制計算核心為 Attention(Q, K, V) = softmax(QK^T / √d_k)V，透過縮放因子防止點積在維度過大時梯度消失。
          <span class="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 ml-1 font-mono">✅ 權威定理[4]</span>
        </span>
      </p>
      <p>
        針對評量機制改革，本研究借鏡國際最新政策趨勢。
        <span class="claim-pill claim-verified" id="pill-claim-5" onclick="selectClaim('claim-5')">
          澳洲 TEQSA 2023 年發布之高等教育評量改革白皮書強調：AI 時代的評量必須區分為『受保護驗證學習 (Category 1)』與『與 AI 協同學習 (Category 2)』兩種互補範式。
          <span class="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 ml-1 font-mono">✅ 國際白皮書[5]</span>
        </span>
        最後在教學實踐成效部分，有研究宣稱：
        <span class="claim-pill claim-warning" id="pill-claim-6" onclick="selectClaim('claim-6')">
          導入某商用 AI 輔助寫作工具後，受測班級在三週內之批判思考測驗平均成績暴增 45 分，證明該軟體具備神奇之教學療效。
          <span class="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 ml-1 font-mono">⚠️ 因果謬誤[6]</span>
        </span>
      </p>
    </div>
  `;

  // 渲染右側清單列表
  claimsListContainer.innerHTML = paper.claims.map(c => {
    const iconMap = {
      verified: 'fa-circle-check text-emerald-400',
      warning: 'fa-triangle-exclamation text-amber-400',
      hallucinated: 'fa-circle-xmark text-rose-400'
    };
    return `
      <div id="card-${c.id}" onclick="selectClaim('${c.id}')" class="p-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 cursor-pointer transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-${c.statusColor}-500/20 text-${c.statusColor}-300 border border-${c.statusColor}-500/30 flex items-center gap-1.5">
            <i class="fa-solid ${iconMap[c.status]}"></i> ${c.statusLabel}
          </span>
          <span class="text-[11px] text-slate-400">${c.claimType}</span>
        </div>
        <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${c.anchorText}</p>
      </div>
    `;
  }).join('');
}

// 點擊選取某一項宣稱並展開三軌驗證詳情
function selectClaim(claimId) {
  currentActiveClaimId = claimId;
  const paper = ASSESSMENT_DATA.sandboxPaper;
  const claim = paper.claims.find(c => c.id === claimId);
  if (!claim) return;

  // 更新文本中的 pill 高亮
  document.querySelectorAll('.claim-pill').forEach(el => el.classList.remove('active'));
  const activePill = document.getElementById(`pill-${claimId}`);
  if (activePill) activePill.classList.add('active');

  // 更新右側選單 active 狀態
  document.querySelectorAll('[id^="card-claim-"]').forEach(el => {
    el.classList.remove('ring-2', 'ring-indigo-500', 'bg-slate-800');
  });
  const activeCard = document.getElementById(`card-${claimId}`);
  if (activeCard) {
    activeCard.classList.add('ring-2', 'ring-indigo-500', 'bg-slate-800');
  }

  // 渲染三軌檢核面板
  const detailPanel = document.getElementById("claim-detail-panel");
  if (!detailPanel) return;

  const statusBadgeMap = {
    verified: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40', icon: 'fa-check-circle', title: '✅ 查核無誤：真實權威文獻與數據' },
    warning: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', icon: 'fa-exclamation-triangle', title: '⚠️ 查核警示：過度延伸推論或樣本偏誤' },
    hallucinated: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40', icon: 'fa-times-circle', title: '❌ 查核違規：AI 幻覺捏造假文獻 / 幽靈引用' }
  };
  const currentBadge = statusBadgeMap[claim.status];

  detailPanel.innerHTML = `
    <div class="p-4 rounded-xl ${currentBadge.bg} border ${currentBadge.border} mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold ${currentBadge.text} flex items-center gap-2">
          <i class="fa-solid ${currentBadge.icon}"></i> ${currentBadge.title}
        </span>
        <span class="text-xs font-mono text-slate-400">類別：${claim.claimType}</span>
      </div>
      <p class="text-xs text-slate-200 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
        "${claim.anchorText}"
      </p>
    </div>

    <!-- 三軌交互驗證分析區 -->
    <div class="space-y-3 mb-4">
      <!-- 軌道一 -->
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <i class="fa-solid fa-book-bookmark text-indigo-400"></i> ${claim.track1.name}
          </span>
          <span class="text-[11px] px-2 py-0.5 rounded font-mono ${claim.status === 'verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}">
            ${claim.track1.verdict}
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${claim.track1.detail}</p>
      </div>

      <!-- 軌道二 -->
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-sky-300 flex items-center gap-1.5">
            <i class="fa-solid fa-chart-pie text-sky-400"></i> ${claim.track2.name}
          </span>
          <span class="text-[11px] px-2 py-0.5 rounded font-mono ${claim.status === 'verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
            ${claim.track2.verdict}
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${claim.track2.detail}</p>
      </div>

      <!-- 軌道三 -->
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <i class="fa-solid fa-terminal text-purple-400"></i> ${claim.track3.name}
          </span>
          <span class="text-[11px] px-2 py-0.5 rounded font-mono bg-purple-950 text-purple-300 border border-purple-800">
            ${claim.track3.verdict}
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${claim.track3.detail}</p>
      </div>
    </div>

    <!-- 評量與處方建議 -->
    <div class="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30">
      <h5 class="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
        <i class="fa-solid fa-stethoscope"></i> 教師評量處方與扣分/給分指引
      </h5>
      <p class="text-xs text-slate-300 leading-relaxed">${claim.remediation}</p>
    </div>
  `;
}

// 3. 渲染五大評量革新模式
function renderAssessmentModels() {
  const tabsContainer = document.getElementById("models-tabs-container");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = ASSESSMENT_DATA.assessmentModels.map(m => `
    <button onclick="selectModel('${m.id}')" id="model-tab-${m.id}" class="text-left p-3.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 transition-all flex items-start gap-3 w-full">
      <div class="w-9 h-9 rounded-lg bg-${m.color}-500/20 text-${m.color}-400 border border-${m.color}-500/30 flex items-center justify-center shrink-0 mt-0.5">
        <i class="fa-solid ${m.icon}"></i>
      </div>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold text-white">${m.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">${m.tag}</span>
        </div>
        <p class="text-[11px] text-slate-400 line-clamp-1">${m.summary}</p>
      </div>
    </button>
  `).join('');
}

function selectModel(modelId) {
  const model = ASSESSMENT_DATA.assessmentModels.find(m => m.id === modelId);
  if (!model) return;

  // 更新選單 active
  document.querySelectorAll('[id^="model-tab-"]').forEach(el => {
    el.classList.remove('ring-2', 'ring-indigo-500', 'bg-slate-800');
  });
  const activeTab = document.getElementById(`model-tab-${modelId}`);
  if (activeTab) {
    activeTab.classList.add('ring-2', 'ring-indigo-500', 'bg-slate-800');
  }

  // 渲染模式詳情
  const contentContainer = document.getElementById("model-detail-container");
  if (!contentContainer) return;

  contentContainer.innerHTML = `
    <div class="glass-card p-6 rounded-2xl border border-slate-700/80">
      <div class="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
        <div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-${model.color}-500/20 text-${model.color}-300 border border-${model.color}-500/30">
            ${model.tag}
          </span>
          <h3 class="text-xl font-bold text-white mt-2">${model.name}</h3>
          <p class="text-xs font-mono text-slate-400 mt-0.5">${model.subName}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-${model.color}-500/20 text-${model.color}-300 border border-${model.color}-500/30 flex items-center justify-center text-xl">
          <i class="fa-solid ${model.icon}"></i>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">💡 為什麼這個模式能破解 AI 弊端？</h4>
          <p class="text-sm text-slate-200 leading-relaxed bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">${model.whyItWorks}</p>
        </div>

        <div>
          <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">⚙️ 具體執行三步驟與指引</h4>
          <div class="space-y-2">
            ${model.executionSteps.map(step => `
              <div class="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex items-start gap-2">
                <i class="fa-solid fa-angle-right text-indigo-400 mt-0.5"></i>
                <span>${step}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
          <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">🎯 評量規準（Rubrics）重心</h4>
          <p class="text-xs text-slate-300">${model.rubricFocus}</p>
        </div>
      </div>
    </div>
  `;
}

// 4. 渲染動態評量規準器 (Rubric Calculator)
function renderRubricCalculator() {
  const container = document.getElementById("rubric-sliders-container");
  if (!container) return;

  container.innerHTML = ASSESSMENT_DATA.rubricDimensions.map(dim => `
    <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-xs font-bold text-slate-200">${dim.name}</label>
        <span class="text-xs font-bold text-indigo-400 font-mono" id="score-val-${dim.id}">${rubricScores[dim.id]} / ${dim.weight}分</span>
      </div>
      <p class="text-[11px] text-slate-400 mb-3">${dim.description}</p>
      
      <input type="range" min="0" max="${dim.weight}" value="${rubricScores[dim.id]}" 
        class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
        oninput="handleRubricChange('${dim.id}', this.value)">
        
      <div class="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
        <span>0分 (不足)</span>
        <span>15分 (合格)</span>
        <span>${dim.weight}分 (卓越)</span>
      </div>
    </div>
  `).join('');
}

function handleRubricChange(dimId, value) {
  rubricScores[dimId] = parseInt(value, 10);
  const valEl = document.getElementById(`score-val-${dimId}`);
  if (valEl) {
    valEl.textContent = `${value} / 25分`;
  }
  updateRubricTotal();
}

function updateRubricTotal() {
  const total = rubricScores.dim1 + rubricScores.dim2 + rubricScores.dim3 + rubricScores.dim4;
  const totalEl = document.getElementById("rubric-total-score");
  const badgeEl = document.getElementById("rubric-grade-badge");
  const commentEl = document.getElementById("rubric-feedback-narrative");
  if (!totalEl || !badgeEl || !commentEl) return;

  totalEl.textContent = total;

  let grade = "待加強 (Unsatisfactory)";
  let gradeColor = "rose";
  let narrative = "";

  if (total >= 90) {
    grade = "🏆 卓越 (Distinction) - 人機協作典範";
    gradeColor = "emerald";
    narrative = `【整體評語】表現極為卓越！該生展現高度的認知主體性與嚴謹的學術紀律。不僅問題界定深刻具在地價值，在三軌來源交互驗證上更精確查核出 AI 的潛在假文獻並主動補正 DOI 與原始數據。Prompt 紀錄展現多次深刻質疑與迭代，口試答辯掌控全局，足為 AI 時代人機協作之示範作品。`;
  } else if (total >= 75) {
    grade = "✨ 精熟 (Proficient) - 良好把關者";
    gradeColor = "blue";
    narrative = `【整體評語】具備良好的把關能力。能善用 AI 進行架構梳理，大部分引用與數據皆經查證屬實。建議未來可加強對反向推論與非主流觀點的交叉質疑，並在報告中進一步深化自身批判性觀點，避免受限於 AI 的既定模板。`;
  } else if (total >= 60) {
    grade = "⚖️ 基礎 (Competent) - 需強化查核";
    gradeColor = "amber";
    narrative = `【整體評語】達到基本及格標準，能產出完整結構之專題報告。惟在三軌來源驗證上有部分數據未附原始出處，疑似存在過度推論與照單全收現象。建議下次繳交時務必附上詳細 Prompt 歷程與問卷原始檔，以展現獨立思考過程。`;
  } else {
    grade = "⚠️ 待重修/補正 (Novice) - 涉思考外包";
    gradeColor = "rose";
    narrative = `【整體評語】未達及格標準。本報告存在明顯的思考外包與未經查核的假引用現象（AI 幻覺），且 Prompt 紀錄顯示缺乏反思與多次追問。請依教育部學術誠信指引，在兩週內完成三軌來源重新檢核並重行預約微型口試答辯。`;
  }

  badgeEl.className = `px-3 py-1 rounded-full text-xs font-bold bg-${gradeColor}-500/20 text-${gradeColor}-300 border border-${gradeColor}-500/30`;
  badgeEl.textContent = grade;
  commentEl.textContent = narrative;
}

function copyFeedback() {
  const commentEl = document.getElementById("rubric-feedback-narrative");
  if (!commentEl) return;
  navigator.clipboard.writeText(commentEl.textContent).then(() => {
    alert("✅ 已成功複製教師回饋評語至剪貼簿！");
  });
}

function copyCitation(benchmarkId) {
  const b = ASSESSMENT_DATA.benchmarks.find(item => item.id === benchmarkId);
  if (!b) return;
  navigator.clipboard.writeText(b.citationAPA).then(() => {
    alert(`✅ 已複製 ${b.institution} 參考文獻 APA 格式至剪貼簿！`);
  });
}

// 5. 導覽標籤切換
function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.remove('hidden');
    });
  });
}

// Markdown 粗體簡易解析
function formatMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
}
