// =========================================================================
// 1. MULTI-INDEX DATA & GLOSSARY DICTIONARY
// =========================================================================

const GLOSSARY_DATA = [
  { term: "容器編排（Orchestration）", tag: "核心概念", desc: "自動管理多個容器的部署、副本數、網路與更新，相當於全天候值班的餐廳經理。", link: "#sec-1" },
  { term: "期望狀態（Desired state）", tag: "核心概念", desc: "你宣告「應該是什麼樣子」（例如我要 3 座工作站），控制器負責讓實際狀態符合它。", link: "#sec-2" },
  { term: "發行版（Distribution）", tag: "K3s 架構", desc: "以上游 Kubernetes 為基礎、另行打包與整合的版本，K3s 即屬此類（小於 100MB 單一執行檔）。", link: "#sec-3" },
  { term: "Pod", tag: "K8s 物件", desc: "Kubernetes 排程的最小單位，像一座工作站，內含一個或數個緊密配合的容器（本課跑 Open WebUI）。", link: "#sec-2" },
  { term: "Deployment / ReplicaSet", tag: "K8s 物件", desc: "宣告並維持指定數量的相同 Pod 訂單，少了就補、多了就收，也負責更新版本。", link: "#sec-2" },
  { term: "Service", tag: "K8s 物件", desc: "為一組 Pod 提供穩定的固定櫃台位址，並把流量分給就緒（Ready）的 Pod。", link: "#sec-2" },
  { term: "Ingress / Ingress Controller", tag: "K8s 物件", desc: "Ingress 是依網域與路徑導流的規則，Controller 是實際執行規則的接待員（K3s 內建 Traefik）。", link: "#sec-2" },
  { term: "HPA (Horizontal Pod Autoscaler)", tag: "K8s 物件", desc: "依指標（如 CPU 使用率）在設定範圍內（如 1~4 個）自動調整 Pod 副本數的調度員。", link: "#sec-2" },
  { term: "Metrics Server", tag: "內建元件", desc: "蒐集並提供 Pod 與節點的 CPU/RAM 資源用量，是 HPA 與 kubectl top 的資料來源。", link: "#sec-3" },
  { term: "requests / limits", tag: "資源管理", desc: "requests 是排程與 HPA 計算使用率百分比的分母基準（沒設會顯示 <unknown>），limits 是資源上限。", link: "#sec-7" },
  { term: "readinessProbe", tag: "健康檢查", desc: "檢查 Pod 是否準備好接收流量，未就緒的 Pod 不會被 Service 導入流量，避免更新或自癒時中斷。", link: "#sec-7" },
  { term: "livenessProbe", tag: "健康檢查", desc: "檢查容器是否仍正常運作（有沒有卡死），失敗時容器會被自動重啟。", link: "#sec-8" },
  { term: "無狀態（Stateless）", tag: "架構設計", desc: "容器內不保存需要長期保留的資料，任何副本被替換都不影響服務（本課教學簡化採用此模式）。", link: "#sec-5" }
];

const SEARCH_INDEX = [
  { title: "一、為什麼 Docker 還不夠（廚房工作站比喻）", cat: "章節", keywords: "docker compose 廚房 工作站 容器編排 orchestration", href: "#sec-1" },
  { title: "二、Kubernetes 的六大核心物件與自癒迴圈", cat: "章節", keywords: "pod deployment replicaset service ingress hpa metrics-server 自癒 期望狀態", href: "#sec-2" },
  { title: "三、K3s 單一執行檔與 7 大內建元件", cat: "章節", keywords: "k3s containerd flannel coredns traefik klipper-lb sqlite3 100mb", href: "#sec-3" },
  { title: "四、本課架構：前端 Open WebUI 進 K3s，重模型 Ollama 留主機", cat: "章節", keywords: "ollama open webui systemd vram 11434 127.0.0.1 卡關", href: "#sec-4" },
  { title: "五、架構的兩大誠實限制：Ollama 排隊與無狀態簡化", cat: "章節", keywords: "OLLAMA_NUM_PARALLEL 512 503 postgresql redis chromadb secret key", href: "#sec-5" },
  { title: "六、業界應用情境：邊緣 AI、私有 LLM、雲端 AKS 移轉", cat: "章節", keywords: "edge iot aks eks gke helm nginx traefik 什麼時候不需要 k3s", href: "#sec-6" },
  { title: "七、三大驗收指標與排錯清單 (<unknown> / 300秒視窗)", cat: "排錯急救", keywords: "unknown requests readinessProbe 300秒 縮減很慢 驗收", href: "#sec-7" },
  { title: "八、課堂 5 大討論題解析與 13 個核心名詞字典", cat: "章節", keywords: "討論題 名詞表 livenessProbe stateless", href: "#sec-8" },
  { title: "⚡ 排錯：為什麼 HPA TARGETS 顯示 <unknown>？", cat: "排錯急救", keywords: "unknown hpa requests cpu kubectl top", href: "#sec-7" },
  { title: "⚡ 排錯：為什麼 Open WebUI Pod 連不上主機 Ollama (11434)？", cat: "排錯急救", keywords: "127.0.0.1 localhost 11434 OLLAMA_HOST OLLAMA_BASE_URL 網路空間", href: "#lab-network" },
  { title: "⚡ 排錯：為什麼壓測停止後 Pod 副本數一直不縮減？", cat: "排錯急救", keywords: "300秒 5分鐘 穩定視窗 scale down 縮減", href: "#sec-7" },
  { title: "⚡ 排錯：為什麼壓測不能打 LLM 聊天 API？", cat: "排錯急救", keywords: "壓測 聊天 api OLLAMA_NUM_PARALLEL 排隊 瓶頸", href: "#lab-hpa-ollama" }
];

// =========================================================================
// 2. MULTI-INDEX DRAWER & COMMAND PALETTE (⌘K)
// =========================================================================

let currentOpenDrawerMode = null;

function toggleIndexDrawer(mode) {
  const drawer = document.getElementById("index-drawer");
  const content = document.getElementById("index-drawer-content");
  const btns = document.querySelectorAll(".index-mode-bar .mode-btn");
  btns.forEach(b => b.classList.remove("active"));

  if (currentOpenDrawerMode === mode && drawer.classList.contains("open")) {
    drawer.classList.remove("open");
    currentOpenDrawerMode = null;
    btns[0].classList.add("active");
    return;
  }

  currentOpenDrawerMode = mode;
  drawer.classList.add("open");

  if (mode === "chapters") {
    btns[0].classList.add("active");
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:var(--primary);">📖 索引視角 1：九大章節學習路徑</h3>
        <button class="mini-btn" onclick="document.getElementById('index-drawer').classList.remove('open')">✕ 收合面板</button>
      </div>
      <div class="card-grid" style="margin-bottom:0;">
        <a href="#sec-1" class="glass-card" style="text-decoration:none; padding:14px;"><strong>01. 為什麼 Docker 還不夠</strong><p style="font-size:0.8rem; color:var(--text-muted);">廚房工作站比喻與容器編排經理</p></a>
        <a href="#sec-2" class="glass-card" style="text-decoration:none; padding:14px;"><strong>02. K8s 核心觀念與六大角色</strong><p style="font-size:0.8rem; color:var(--text-muted);">宣告期望狀態、比對迴圈與自癒</p></a>
        <a href="#sec-3" class="glass-card" style="text-decoration:none; padding:14px;"><strong>03. K3s 單一執行檔架構</strong><p style="font-size:0.8rem; color:var(--text-muted);">&lt;100MB 內建 Traefik 與 Metrics Server</p></a>
        <a href="#sec-4" class="glass-card" style="text-decoration:none; padding:14px;"><strong>04. 前端進 K3s、模型留主機</strong><p style="font-size:0.8rem; color:var(--text-muted);">Open WebUI + Ollama 與 127.0.0.1 陷阱</p></a>
        <a href="#sec-5" class="glass-card" style="text-decoration:none; padding:14px;"><strong>05. 兩大架構限制誠實說明</strong><p style="font-size:0.8rem; color:var(--text-muted);">Ollama 佇列瓶頸 &amp; 無狀態多副本取捨</p></a>
        <a href="#sec-7" class="glass-card" style="text-decoration:none; padding:14px;"><strong>07. 本週任務驗收與排錯對照</strong><p style="font-size:0.8rem; color:var(--text-muted);">三大驗收指標、&lt;unknown&gt; 與 300s 視窗</p></a>
      </div>
    `;
  } else if (mode === "objects") {
    btns[1].classList.add("active");
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:var(--primary);">🧩 索引視角 2：依 Kubernetes / K3s 元件快速定位</h3>
        <button class="mini-btn" onclick="document.getElementById('index-drawer').classList.remove('open')">✕ 收合面板</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="#sec-2" onclick="inspectK8sObject('Pod')" class="btn btn-secondary">📦 Pod (工作站)</a>
        <a href="#sec-2" onclick="inspectK8sObject('Deployment')" class="btn btn-secondary">📋 Deployment (副本訂單)</a>
        <a href="#sec-2" onclick="inspectK8sObject('Service')" class="btn btn-secondary">🎯 Service (固定櫃台)</a>
        <a href="#sec-2" onclick="inspectK8sObject('Ingress')" class="btn btn-secondary">🚪 Ingress &amp; Traefik (大門接待)</a>
        <a href="#sec-2" onclick="inspectK8sObject('HPA')" class="btn btn-secondary">📈 HPA (自動調度員)</a>
        <a href="#sec-3" class="btn btn-secondary">📊 Metrics Server (用量儀表)</a>
        <a href="#sec-3" class="btn btn-secondary">🌐 Flannel &amp; Klipper-lb</a>
        <a href="#sec-4" class="btn btn-secondary">🦙 主機 systemd Ollama</a>
      </div>
    `;
  } else if (mode === "troubleshoot") {
    btns[2].classList.add("active");
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:var(--accent-amber);">🩺 索引視角 3：實作卡關急救索引（點擊直達解法）</h3>
        <button class="mini-btn" onclick="document.getElementById('index-drawer').classList.remove('open')">✕ 收合面板</button>
      </div>
      <div class="card-grid" style="margin-bottom:0;">
        <a href="#lab-network" class="glass-card" style="text-decoration:none; border-color:var(--accent-red); padding:14px;">
          <strong style="color:#fca5a5;">❌ Open WebUI 選不到模型 / 連不上 Ollama</strong>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">檢查主機 <code>OLLAMA_HOST</code> 是否只綁 127.0.0.1，以及 Pod 內 <code>OLLAMA_BASE_URL</code> 是否誤填 localhost。</p>
        </a>
        <a href="#sec-7" class="glass-card" style="text-decoration:none; border-color:var(--accent-amber); padding:14px;">
          <strong style="color:#fcd34d;">❓ HPA 的 TARGETS 顯示 &lt;unknown&gt;/50%</strong>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">Deployment 容器漏寫 <code>resources.requests.cpu</code>，導致 HPA 沒有分母可以算百分比！</p>
        </a>
        <a href="#lab-hpa-ollama" class="glass-card" style="text-decoration:none; border-color:var(--primary); padding:14px;">
          <strong style="color:#7dd3fc;">🐢 壓測半天 HPA 都不擴展，或停止後不縮回</strong>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">壓測別打聊天 API（會卡在 Ollama 佇列）；縮減預設有 300 秒穩定視窗保護。</p>
        </a>
      </div>
    `;
  } else if (mode === "labs") {
    btns[3].classList.add("active");
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:var(--accent-green);">⚡ 索引視角 4：六大互動實驗室總覽</h3>
        <button class="mini-btn" onclick="document.getElementById('index-drawer').classList.remove('open')">✕ 收合面板</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="#lab-kitchen" class="btn btn-primary">🍳 實驗 1：廚房手動 Docker vs K3s 經理</a>
        <a href="#lab-reconcile" class="btn btn-primary">🔄 實驗 2：Pod 自癒與期望狀態控制迴圈</a>
        <a href="#lab-network" class="btn btn-primary">🔌 實驗 3：Pod 連主機 Ollama 網路空間診斷</a>
        <a href="#lab-hpa-ollama" class="btn btn-primary">📈 實驗 4：HPA 擴展 vs Ollama 512 佇列模擬</a>
        <a href="#lab-stateful" class="btn btn-primary">🗄️ 實驗 5：無狀態簡化 vs 正式共享架構切換</a>
        <a href="#lab-decision" class="btn btn-primary">🧭 實驗 6：我該用 K3s 嗎？選型決策幫手</a>
      </div>
    `;
  }
}

function openCmdModal() {
  const modal = document.getElementById("cmd-modal");
  modal.classList.add("open");
  const input = document.getElementById("cmd-search-input");
  input.value = "";
  renderCmdResults("");
  setTimeout(() => input.focus(), 50);
}

function closeCmdModal() {
  document.getElementById("cmd-modal").classList.remove("open");
}

function renderCmdResults(query) {
  const list = document.getElementById("cmd-results-list");
  const q = query.trim().toLowerCase();

  const matches = SEARCH_INDEX.filter(item =>
    !q ||
    item.title.toLowerCase().includes(q) ||
    item.keywords.toLowerCase().includes(q) ||
    item.cat.toLowerCase().includes(q)
  );

  const glossaryMatches = GLOSSARY_DATA.filter(g =>
    q && (g.term.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  );

  let html = "";
  matches.forEach(m => {
    html += `
      <a href="${m.href}" class="cmd-result-item" onclick="closeCmdModal()">
        <div>
          <div style="font-weight:600; font-size:0.93rem;">${m.title}</div>
          <div style="font-size:0.76rem; color:var(--text-muted);">關鍵字：${m.keywords}</div>
        </div>
        <span class="pill-tag pill-blue">${m.cat}</span>
      </a>
    `;
  });

  glossaryMatches.forEach(g => {
    html += `
      <a href="${g.link}" class="cmd-result-item" onclick="closeCmdModal()">
        <div>
          <div style="font-weight:600; font-size:0.93rem; color:var(--primary);">📖 名詞：${g.term}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${g.desc}</div>
        </div>
        <span class="pill-tag pill-purple">${g.tag}</span>
      </a>
    `;
  });

  if (!html) {
    html = `<div style="padding:20px; text-align:center; color:var(--text-muted);">找不到符合「${query}」的項目，試試搜尋 <code>HPA</code>、<code>11434</code>、<code>unknown</code> 或 <code>Traefik</code></div>`;
  }
  list.innerHTML = html;
}

window.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openCmdModal();
  } else if (e.key === "Escape") {
    closeCmdModal();
  }
});

// =========================================================================
// 3. THREE.JS 3D INTERACTIVE CLUSTER & LLM TOPOLOGY ANIMATION
// =========================================================================

let sim3DPodCount = 3;
let sim3DPodMeshes = [];
let sim3DParticles = [];
let threeScene, threeCamera, threeRenderer;

function initHero3D() {
  const canvas = document.getElementById("cluster-3d-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const width = canvas.clientWidth || 500;
  const height = canvas.clientHeight || 350;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  threeCamera.position.set(0, 6.5, 13.5);
  threeCamera.lookAt(0, 0, 0);

  threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  threeScene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(5, 10, 7);
  threeScene.add(dirLight);

  // Subtle floor grid representing the single VM Host
  const gridHelper = new THREE.GridHelper(16, 16, 0x38bdf8, 0x1e293b);
  gridHelper.position.y = -2.2;
  threeScene.add(gridHelper);

  // 1. Traefik Ingress Node (Left Amber Octahedron)
  const traefikGeo = new THREE.OctahedronGeometry(0.95, 0);
  const traefikMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x78350f,
    roughness: 0.2,
    metalness: 0.7
  });
  const traefikMesh = new THREE.Mesh(traefikGeo, traefikMat);
  traefikMesh.position.set(-5.2, 0, 0);
  threeScene.add(traefikMesh);

  // 2. Service Node (Center-Left Blue Torus)
  const svcGeo = new THREE.TorusGeometry(0.85, 0.22, 16, 40);
  const svcMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    roughness: 0.2,
    metalness: 0.8
  });
  const svcMesh = new THREE.Mesh(svcGeo, svcMat);
  svcMesh.position.set(-2.0, 0, 0);
  svcMesh.rotation.y = Math.PI / 2;
  threeScene.add(svcMesh);

  // 3. Host Ollama Node (Right Purple Glowing Brain Sphere + Wireframe Ring)
  const ollamaGeo = new THREE.IcosahedronGeometry(1.35, 1);
  const ollamaMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x581c87,
    roughness: 0.25,
    metalness: 0.6,
    wireframe: false
  });
  const ollamaMesh = new THREE.Mesh(ollamaGeo, ollamaMat);
  ollamaMesh.position.set(5.0, 0, 0);
  threeScene.add(ollamaMesh);

  const ringGeo = new THREE.RingGeometry(1.65, 1.75, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide });
  const ollamaRing = new THREE.Mesh(ringGeo, ringMat);
  ollamaRing.position.set(5.0, 0, 0);
  ollamaRing.rotation.x = Math.PI / 3;
  threeScene.add(ollamaRing);

  // Build Initial Open WebUI Pods
  rebuild3DPods();

  // Spawn continuous request particles
  for (let i = 0; i < 18; i++) {
    spawn3DParticle(i * 0.055);
  }

  // Simple Mouse Drag Orbit
  let isDragging = false;
  let prevX = 0;
  let cameraAngle = 0;

  canvas.addEventListener("mousedown", e => { isDragging = true; prevX = e.clientX; });
  window.addEventListener("mouseup", () => { isDragging = false; });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    prevX = e.clientX;
    cameraAngle -= dx * 0.008;
    threeCamera.position.x = Math.sin(cameraAngle) * 13.5;
    threeCamera.position.z = Math.cos(cameraAngle) * 13.5;
    threeCamera.lookAt(0, 0, 0);
  });

  // Animation Loop
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.018;

    traefikMesh.rotation.y += 0.015;
    traefikMesh.rotation.x += 0.008;
    svcMesh.rotation.z += 0.02;
    ollamaMesh.rotation.y -= 0.012;
    ollamaRing.rotation.z += 0.025;

    // Bobbing Open WebUI Pods
    sim3DPodMeshes.forEach((pod, idx) => {
      pod.rotation.y += 0.015;
      pod.position.y = pod.userData.baseY + Math.sin(clock * 2 + idx) * 0.12;
    });

    // Move request particles along pipeline: Traefik (-5.2) -> Service (-2.0) -> Pod (1.2) -> Ollama (5.0)
    sim3DParticles.forEach(p => {
      p.userData.progress += p.userData.speed;
      if (p.userData.progress > 1) {
        p.userData.progress = 0;
        p.userData.targetPodIndex = Math.floor(Math.random() * Math.max(1, sim3DPodMeshes.length));
      }
      const t = p.userData.progress;
      const podIdx = Math.min(p.userData.targetPodIndex, sim3DPodMeshes.length - 1);
      const podPos = sim3DPodMeshes[podIdx] ? sim3DPodMeshes[podIdx].position : new THREE.Vector3(1.2, 0, 0);

      if (t < 0.3) {
        // Traefik -> Service
        const localT = t / 0.3;
        p.position.x = -5.2 + localT * 3.2;
        p.position.y = Math.sin(localT * Math.PI) * 0.4;
        p.position.z = 0;
      } else if (t < 0.65) {
        // Service -> Selected Open WebUI Pod
        const localT = (t - 0.3) / 0.35;
        p.position.x = -2.0 + localT * (podPos.x - -2.0);
        p.position.y = localT * podPos.y;
        p.position.z = localT * podPos.z;
      } else {
        // Selected Pod -> Host Ollama (Single instance queue!)
        const localT = (t - 0.65) / 0.35;
        p.position.x = podPos.x + localT * (5.0 - podPos.x);
        p.position.y = podPos.y * (1 - localT);
        p.position.z = podPos.z * (1 - localT);
      }
    });

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

function rebuild3DPods() {
  if (!threeScene) return;
  sim3DPodMeshes.forEach(m => threeScene.remove(m));
  sim3DPodMeshes = [];

  const podGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
  const spacing = 1.65;
  const startZ = -((sim3DPodCount - 1) * spacing) / 2;

  for (let i = 0; i < sim3DPodCount; i++) {
    const podMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      roughness: 0.25,
      metalness: 0.5
    });
    const mesh = new THREE.Mesh(podGeo, podMat);
    const zPos = startZ + i * spacing;
    const yPos = (i % 2 === 0 ? 0.35 : -0.35);
    mesh.position.set(1.3, yPos, zPos);
    mesh.userData = { baseY: yPos };
    threeScene.add(mesh);
    sim3DPodMeshes.push(mesh);
  }
  const badge = document.getElementById("3d-pod-count");
  if (badge) badge.textContent = sim3DPodCount;
}

function spawn3DParticle(initialProgress = 0) {
  if (!threeScene) return;
  const geo = new THREE.SphereGeometry(0.14, 10, 10);
  const mat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
  const p = new THREE.Mesh(geo, mat);
  p.userData = {
    progress: initialProgress,
    speed: 0.006 + Math.random() * 0.004,
    targetPodIndex: Math.floor(Math.random() * sim3DPodCount)
  };
  threeScene.add(p);
  sim3DParticles.push(p);
}

function sim3DChangePods(delta) {
  sim3DPodCount = Math.max(1, Math.min(4, sim3DPodCount + delta));
  rebuild3DPods();
}

function sim3DBurstTraffic() {
  for (let i = 0; i < 8; i++) {
    spawn3DParticle(Math.random() * 0.3);
  }
  setTimeout(() => {
    while (sim3DParticles.length > 18) {
      const p = sim3DParticles.pop();
      threeScene.remove(p);
    }
  }, 4000);
}

// =========================================================================
// 4. LAB 1: KITCHEN WORKSTATION VS K3S ORCHESTRATION MANAGER
// =========================================================================

let kitchenMode = "docker"; // 'docker' | 'k3s'
let kitchenQueue = 4;
let kitchenStations = [
  { id: 1, name: "open-webui-1", status: "running", load: 35, inNginx: true },
  { id: 2, name: "open-webui-2", status: "running", load: 35, inNginx: true }
];
let nextStationId = 3;

function setKitchenMode(mode) {
  kitchenMode = mode;
  document.getElementById("btn-mode-docker").classList.toggle("active", mode === "docker");
  document.getElementById("btn-mode-k3s").classList.toggle("active", mode === "k3s");
  document.getElementById("btn-manual-docker-run").style.display = mode === "docker" ? "inline-flex" : "none";

  const hint = document.getElementById("kitchen-hint");
  const mgrStatus = document.getElementById("kitchen-manager-status");
  const lbStatus = document.getElementById("kitchen-lb-status");

  if (mode === "docker") {
    hint.innerHTML = `💡 <strong>目前為「純 Docker 手動模式」</strong>：試著點擊「湧入 15 位客人」或「讓工作站當機」。沒有人會自動幫你開新工作站，壞掉的工作站也不會自動補新副本，必須你自己狂按「手動 docker run」！`;
    mgrStatus.textContent = "無（需人工盯場）";
    mgrStatus.style.color = "var(--accent-red)";
    lbStatus.textContent = "需手動改 Nginx 設定";
    lbStatus.style.color = "var(--text-muted)";
  } else {
    hint.innerHTML = `🤖 <strong>目前為「K3s 容器編排經理模式」</strong>：現在再試一次「湧入 15 位客人」或「讓工作站當機」！K3s 的 Deployment 與 HPA 會自動偵測負載與故障，自動補上新工作站，且 Service 櫃台會自動把流量導給就緒的工作站！`;
    mgrStatus.textContent = "K3s 自動巡檢中 (Deployment + HPA)";
    mgrStatus.style.color = "var(--accent-green)";
    lbStatus.textContent = "K8s Service 自動分流 Ready Pod";
    lbStatus.style.color = "var(--primary)";
    kitchenAutoOrchestrate();
  }
  renderKitchenStations();
}

function kitchenAddCustomers(n) {
  kitchenQueue += n;
  updateKitchenMetrics();
  if (kitchenMode === "k3s") {
    kitchenAutoOrchestrate();
  }
}

function kitchenCrashRandom() {
  const running = kitchenStations.filter(s => s.status === "running");
  if (running.length === 0) return;
  const victim = running[Math.floor(Math.random() * running.length)];
  victim.status = "crashed";
  victim.load = 0;
  renderKitchenStations();

  if (kitchenMode === "k3s") {
    setTimeout(() => kitchenAutoOrchestrate(), 900);
  }
}

function kitchenManualAddStation() {
  if (kitchenStations.length >= 6) return;
  kitchenStations.push({
    id: nextStationId,
    name: `docker-run-${nextStationId}`,
    status: "running",
    load: 40,
    inNginx: true
  });
  nextStationId++;
  renderKitchenStations();
}

function kitchenAutoOrchestrate() {
  if (kitchenMode !== "k3s") return;

  // 1. Self-heal crashed stations
  kitchenStations.forEach((s, idx) => {
    if (s.status === "crashed") {
      kitchenStations[idx] = {
        id: nextStationId++,
        name: `webui-pod-${Math.random().toString(36).substring(2, 6)}`,
        status: "running",
        load: 35,
        inNginx: true
      };
    }
  });

  // 2. HPA Auto-scale up to 4 stations if queue is high
  const runningCount = kitchenStations.filter(s => s.status === "running").length;
  if (kitchenQueue > 10 && runningCount < 4) {
    const needed = Math.min(4 - runningCount, Math.ceil((kitchenQueue - 6) / 8));
    for (let i = 0; i < needed; i++) {
      kitchenStations.push({
        id: nextStationId++,
        name: `webui-pod-${Math.random().toString(36).substring(2, 6)}`,
        status: "running",
        load: 45,
        inNginx: true
      });
    }
  }
  renderKitchenStations();
}

function updateKitchenMetrics() {
  const running = kitchenStations.filter(s => s.status === "running");
  const avgLoad = running.length === 0 ? 100 : Math.min(100, Math.round((kitchenQueue * 18) / running.length + 20));
  running.forEach(s => { s.load = avgLoad; });

  document.getElementById("kitchen-queue-count").textContent = kitchenQueue;
  const loadEl = document.getElementById("kitchen-avg-load");
  loadEl.textContent = `${avgLoad}%`;
  loadEl.style.color = avgLoad > 75 ? "var(--accent-red)" : "var(--primary)";
}

function renderKitchenStations() {
  updateKitchenMetrics();
  const container = document.getElementById("kitchen-stations-container");
  if (!container) return;

  container.innerHTML = kitchenStations.map(s => {
    const isRunning = s.status === "running";
    return `
      <div class="station-card ${s.status}">
        <div class="station-header">
          <span><i class="status-dot ${isRunning ? 'green' : 'red'}"></i> ${s.name}</span>
          <span>${isRunning ? '出菜中' : '💀 當機'}</span>
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted);">
          工作站負載：<strong>${isRunning ? s.load + '%' : '0% (停擺)'}</strong>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${isRunning ? s.load : 0}%; background:${s.load > 80 ? 'var(--accent-red)' : ''}"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-size:0.72rem; color:var(--text-dim);">${kitchenMode === 'k3s' ? 'Service 自動納管' : '手動容器'}</span>
          ${!isRunning && kitchenMode === 'docker' ? `<button class="mini-btn" onclick="kitchenRemoveDead(${s.id})">手動清理</button>` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function kitchenRemoveDead(id) {
  kitchenStations = kitchenStations.filter(s => s.id !== id);
  renderKitchenStations();
}

// Drain kitchen queue slowly over time
setInterval(() => {
  const runningCount = kitchenStations.filter(s => s.status === "running").length;
  if (kitchenQueue > 2 && runningCount > 0) {
    kitchenQueue = Math.max(2, kitchenQueue - runningCount);
    renderKitchenStations();
  }
}, 2200);

// =========================================================================
// 5. SECTION 2: K8S OBJECT YAML INSPECTOR & LAB 2 RECONCILIATION LOOP
// =========================================================================

const K8S_YAML_EXAMPLES = {
  "Pod": {
    title: "📦 Pod：K8s 排程的最小工作站單位",
    desc: "實務上我們很少單獨寫一個裸 Pod 的 YAML，而是寫在 Deployment 的 template 裡面。每個 Pod 都有自己獨立的叢集內部 IP 與網路空間，裡面跑一份 Open WebUI 容器。",
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: open-webui-7d8f9c-x9k2p
  labels:
    app: open-webui
spec:
  containers:
    - name: open-webui
      image: ghcr.io/open-webui/open-webui:main
      ports:
        - containerPort: 8080`
  },
  "Deployment": {
    title: "📋 Deployment：「我要 N 座相同工作站」的期望狀態訂單",
    desc: "宣告 Open WebUI 的映像檔、環境變數（例如連往主機 Ollama 的 OLLAMA_BASE_URL）、readinessProbe 就緒檢查，以及 HPA 計算百分比必備的 resources.requests.cpu！",
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: open-webui
spec:
  replicas: 1 # 初始期望副本數 N (後續交由 HPA 在 1~4 動態調整)
  selector:
    matchLabels:
      app: open-webui
  template:
    metadata:
      labels:
        app: open-webui
    spec:
      containers:
        - name: open-webui
          image: ghcr.io/open-webui/open-webui:main
          env:
            - name: OLLAMA_BASE_URL
              value: "http://<主機內網或cni0位址>:11434"
          resources:
            requests:
              cpu: "100m"    # ⚠️ 必設！否則 HPA TARGETS 會顯示 <unknown>
          readinessProbe:    # ⚠️ 確保新 Pod 準備好才接流量，自癒不中斷
            httpGet:
              path: /health
              port: 8080`
  },
  "Service": {
    title: "🎯 Service：工作站的固定櫃台",
    desc: "Pod 死掉重補時 IP 會一直變，但 Service 的名稱與位址永遠不變！它透過 selector (app: open-webui) 自動找到所有通過 readinessProbe 的健康 Pod 並平均分流。",
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: open-webui-svc
spec:
  selector:
    app: open-webui
  ports:
    - port: 80
      targetPort: 8080`
  },
  "Ingress": {
    title: "🚪 Ingress：餐廳大門的接待規則（由 K3s 內建 Traefik 執行）",
    desc: "定義當外部使用者透過瀏覽器造訪 qN.qqnice.org 時，Traefik 應該把 HTTP 請求轉交給叢集內的 open-webui-svc 櫃台。",
    yaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: open-webui-ingress
spec:
  rules:
    - host: q1.qqnice.org
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: open-webui-svc
                port:
                  number: 80`
  },
  "HPA": {
    title: "📈 HPA (Horizontal Pod Autoscaler)：自動調整訂單數量 N 的調度員",
    desc: "持續向 metrics-server 詢問 Pod 的 CPU 用量。當平均 CPU 使用率超過設定目標（如 50%），就自動把 Deployment 的期望副本數在 1 到 4 之間調整；縮減時預設有 300 秒穩定視窗。",
    yaml: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: open-webui-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: open-webui
  minReplicas: 1
  maxReplicas: 4
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50`
  },
  "metrics-server": {
    title: "📊 metrics-server：提供各 Pod 用量的儀表感測器（K3s 已內建！）",
    desc: "上游 K8s 需自行安裝，但 K3s 開箱即內建！你可以直接執行 kubectl top pods 或 kubectl top nodes 檢視即時 CPU 與記憶體消耗，HPA 就是靠它提供分子數據。",
    yaml: `# 驗證 Metrics Server 是否正常運作的常用指令：
$ kubectl top nodes
$ kubectl top pods
$ kubectl get hpa -w`
  }
};

function inspectK8sObject(objName) {
  const info = K8S_YAML_EXAMPLES[objName];
  if (!info) return;
  document.getElementById("inspector-title").textContent = info.title;
  document.getElementById("inspector-body").innerHTML = `
    <p style="margin-bottom:10px; color:var(--text-main);">${info.desc}</p>
    <pre style="background:#050811; padding:14px; border-radius:10px; border:1px solid var(--border-color); overflow-x:auto; font-family:var(--font-mono); font-size:0.8rem; color:#7dd3fc;">${info.yaml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  `;
}

// Lab 2: Reconciliation Loop
let reconDesired = 3;
let reconPods = [
  { id: "a9f1", status: "Ready" },
  { id: "b3k8", status: "Ready" },
  { id: "c7m2", status: "Ready" }
];

function appendReconLog(msg, cls = "") {
  const term = document.getElementById("recon-terminal");
  if (!term) return;
  const line = document.createElement("div");
  line.className = `log-line ${cls}`;
  const time = new Date().toLocaleTimeString();
  line.textContent = `[${time}] ${msg}`;
  term.prepend(line);
}

function renderReconState() {
  const readyCount = reconPods.filter(p => p.status === "Ready").length;
  document.getElementById("recon-desired-val").textContent = reconDesired;
  document.getElementById("recon-actual-val").textContent = readyCount;

  const badge = document.getElementById("recon-diff-badge");
  if (readyCount === reconDesired && reconPods.length === reconDesired) {
    badge.className = "pill-tag pill-green";
    badge.textContent = "一致 (Actual == Desired)";
  } else {
    badge.className = "pill-tag pill-amber";
    badge.textContent = `自癒調度中 (${readyCount} ➔ ${reconDesired})`;
  }

  const container = document.getElementById("recon-pods-container");
  container.innerHTML = reconPods.map(p => {
    const isReady = p.status === "Ready";
    return `
      <div class="station-card ${isReady ? 'running' : 'creating'}">
        <div class="station-header">
          <span><i class="status-dot ${isReady ? 'green' : 'amber'}"></i> open-webui-${p.id}</span>
          <span>${isReady ? 'Ready' : 'Probing...'}</span>
        </div>
        <div style="font-size:0.76rem; color:var(--text-muted);">
          ${isReady ? '✅ readinessProbe 通過，接收 Service 流量' : '⏳ 容器啟動中，等待 readinessProbe...'}
        </div>
      </div>
    `;
  }).join("");
}

function reconKillPod() {
  if (reconPods.length === 0) return;
  const removed = reconPods.pop();
  appendReconLog(`$ kubectl delete pod open-webui-${removed.id} (手動刪除 Pod)`, "log-err");
  renderReconState();

  setTimeout(() => {
    appendReconLog(`[ReplicaSet Controller] 偵測到差異！實際副本 (${reconPods.length}) < 期望副本 (${reconDesired})，立即建立新 Pod...`, "log-warn");
    const newId = Math.random().toString(36).substring(2, 6);
    reconPods.push({ id: newId, status: "Creating" });
    renderReconState();

    setTimeout(() => {
      const target = reconPods.find(p => p.id === newId);
      if (target) target.status = "Ready";
      appendReconLog(`[Kubelet] Pod open-webui-${newId} 通過 readinessProbe，進入 Ready 並加入 Service 分流！自癒完成。`, "log-ok");
      renderReconState();
    }, 1500);
  }, 700);
}

function reconChangeDesired(delta) {
  const next = Math.max(1, Math.min(4, reconDesired + delta));
  if (next === reconDesired) return;
  reconDesired = next;
  appendReconLog(`[HPA / Deployment] 期望副本數 (Desired N) 更新為 ${reconDesired}`, "log-warn");
  renderReconState();

  if (reconPods.length < reconDesired) {
    const newId = Math.random().toString(36).substring(2, 6);
    reconPods.push({ id: newId, status: "Creating" });
    renderReconState();
    setTimeout(() => {
      const target = reconPods.find(p => p.id === newId);
      if (target) target.status = "Ready";
      appendReconLog(`[ReplicaSet] 新增副本 open-webui-${newId} 已 Ready！`, "log-ok");
      renderReconState();
    }, 1200);
  } else if (reconPods.length > reconDesired) {
    const termPod = reconPods.pop();
    appendReconLog(`[ReplicaSet] 實際副本多於期望，平滑終止 open-webui-${termPod.id}`, "log-ok");
    renderReconState();
  }
}

// =========================================================================
// 6. SECTION 4: SVG ARCHITECTURE FLOW & LAB 3 NETWORK DEBUGGER
// =========================================================================

let svgConnWorking = true;

function triggerSvgPacketFlow() {
  const pkt = document.getElementById("svg-packet");
  if (!pkt) return;
  pkt.setAttribute("visibility", "visible");

  const waypoints = svgConnWorking
    ? [
        { x: 64, y: 180 },
        { x: 232, y: 180 },
        { x: 385, y: 180 },
        { x: 582, y: 180 },
        { x: 838, y: 185 }
      ]
    : [
        { x: 64, y: 180 },
        { x: 232, y: 180 },
        { x: 385, y: 180 },
        { x: 582, y: 180 },
        { x: 690, y: 180 } // Blocked before Ollama!
      ];

  let step = 0;
  function moveNext() {
    if (step >= waypoints.length) {
      setTimeout(() => pkt.setAttribute("visibility", "hidden"), 500);
      return;
    }
    pkt.setAttribute("cx", waypoints[step].x);
    pkt.setAttribute("cy", waypoints[step].y);
    pkt.setAttribute("fill", (!svgConnWorking && step === waypoints.length - 1) ? "#ef4444" : "#38bdf8");
    step++;
    setTimeout(moveNext, 350);
  }
  moveNext();
}

function toggleSvgConnectionState() {
  svgConnWorking = !svgConnWorking;
  const btn = document.getElementById("btn-svg-conn-toggle");
  const label = document.getElementById("svg-conn-label");
  const paths = ["svg-conn-1", "svg-conn-2", "svg-conn-3"].map(id => document.getElementById(id));

  if (svgConnWorking) {
    btn.textContent = "🔧 切換最右邊連線狀態（目前：已打通）";
    label.textContent = "✅ Pod 跨出網路空間成功連上主機 Ollama";
    paths.forEach(p => { p.setAttribute("class", "flow-path-success"); });
  } else {
    btn.textContent = "🔧 切換最右邊連線狀態（目前：127.0.0.1 卡關斷線）";
    label.textContent = "❌ 卡關！Ollama 只綁 127.0.0.1 或 Pod 連錯位址";
    paths.forEach(p => { p.setAttribute("class", "flow-path-error"); });
  }
  triggerSvgPacketFlow();
}

// Lab 3: Pod -> Host Ollama Network Namespace Debugger
let netSimHost = "127.0.0.1";
let netSimPod = "localhost";

function setNetSimHost(val) {
  netSimHost = val;
  document.getElementById("opt-host-loopback").classList.toggle("selected", val === "127.0.0.1");
  document.getElementById("opt-host-internal").classList.toggle("selected", val === "host-internal");
  document.getElementById("opt-host-public-exposed").classList.toggle("selected", val === "public-exposed");
  evaluateNetSim();
}

function setNetSimPod(val) {
  netSimPod = val;
  document.getElementById("opt-pod-localhost").classList.toggle("selected", val === "localhost");
  document.getElementById("opt-pod-hostip").classList.toggle("selected", val === "host-ip");
  evaluateNetSim();
}

function evaluateNetSim() {
  const out = document.getElementById("net-sim-console");
  if (!out) return;

  if (netSimPod === "localhost") {
    out.innerHTML = `
      <div class="log-line log-err">❌ <strong>連線失敗 (Connection Refused)：封包根本沒離開 Open WebUI Pod！</strong></div>
      <div class="log-line">原因診斷：每個 K8s Pod 都有自己獨立的 Network Namespace。當你在 Pod 裡設定 <code>OLLAMA_BASE_URL=http://127.0.0.1:11434</code> 時，Open WebUI 會去敲<strong>「Pod 自己內部」</strong>的 11434 埠，而不是外面的 Linux 主機！</div>
      <div class="log-line log-warn">👉 請將右側第 2 項切換為「指向主機在內網/cni0 的 IP」。</div>
    `;
  } else if (netSimHost === "127.0.0.1") {
    out.innerHTML = `
      <div class="log-line log-err">❌ <strong>連線失敗 (Connection Refused)：封包到達主機，但被 Ollama 拒於門外！</strong></div>
      <div class="log-line">原因診斷：Pod 已經正確往主機 IP 發送請求，但主機上的 Ollama 預設只綁定 <code>127.0.0.1:11434</code>（只收主機自己發給自己的 Loopback 封包），拒絕來自 K3s Flannel/cni0 網橋的封包。</div>
      <div class="log-line log-warn">👉 請將左側第 1 項切換為「綁定主機內網 / 虛擬介面」。</div>
    `;
  } else if (netSimHost === "public-exposed") {
    out.innerHTML = `
      <div class="log-line log-warn">⚠️ <strong>連線成功，但存在嚴重資安風險（違反任務書規範）！</strong></div>
      <div class="log-line">原因診斷：Open WebUI Pod 可以連上 Ollama 了，但因為你綁定了 <code>0.0.0.0:11434</code> 且沒有用防火牆擋掉外部公網，現在網際網路上任何人都能直接打你的 <code>主機公網IP:11434</code> 免費呼叫模型或把你的佇列塞爆！</div>
      <div class="log-line log-ok">👉 講義特別提醒：「同時要記得，Ollama 的 11434 埠不應該對公網開放。」請改選左側第二個安全選項。</div>
    `;
  } else {
    out.innerHTML = `
      <div class="log-line log-ok">🎉 <strong>完美打通且符合資安規範！(驗收指標 1 通過)</strong></div>
      <div class="log-line">診斷結果：Open WebUI Pod 透過主機內網/虛擬網卡位址跨越 Pod 網路空間，且主機 systemd 的 Ollama 允許該介面連線，同時 11434 埠不對公網裸露（對外只由 Traefik 開 80/443）。</div>
    `;
  }
}

// =========================================================================
// 7. LAB 4: HPA AUTO-SCALING VS OLLAMA QUEUE BOTTLENECK SIMULATOR
// =========================================================================

let loadTestMode = "idle"; // 'idle' | 'frontend' | 'chat'
let simCpu = 12;
let simReplicas = 1;
let simOllamaQueue = 0;
let simCooldown = 0;

function logHpaSim(msg, cls = "") {
  const box = document.getElementById("hpa-sim-log");
  if (!box) return;
  const div = document.createElement("div");
  div.className = `log-line ${cls}`;
  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  box.prepend(div);
}

function startLoadTest(type) {
  loadTestMode = type;
  simCooldown = 0;
  if (type === "frontend") {
    document.getElementById("sim-mode-text").textContent = "🚀 壓測前端 API";
    document.getElementById("sim-mode-text").style.color = "var(--primary)";
    logHpaSim("開始壓測 Open WebUI 網頁前端端點！前端容器 CPU 迅速攀升...", "log-warn");
  } else {
    document.getElementById("sim-mode-text").textContent = "🐢 壓測聊天 API";
    document.getElementById("sim-mode-text").style.color = "var(--accent-red)";
    logHpaSim("開始同時發送大量 LLM 聊天請求！注意觀察：壓力全部卡在主機 Ollama (OLLAMA_NUM_PARALLEL=1)...", "log-err");
  }
}

function stopLoadTest() {
  if (loadTestMode === "idle") return;
  loadTestMode = "idle";
  document.getElementById("sim-mode-text").textContent = "⏹️ 停止壓測 (冷卻中)";
  document.getElementById("sim-mode-text").style.color = "var(--accent-amber)";
  if (simReplicas > 1) {
    simCooldown = 300; // 300s stabilization window
    logHpaSim("已停止壓測，CPU 下降。但因 HPA 預設有 300 秒縮減穩定視窗 (Stabilization Window)，Pod 不會馬上縮回！", "log-warn");
  }
}

setInterval(() => {
  if (loadTestMode === "frontend") {
    simOllamaQueue = Math.max(0, simOllamaQueue - 5);
    simCpu = Math.min(185, simCpu + 35);
    if (simCpu > 50 && simReplicas < 4) {
      simReplicas++;
      simCpu = Math.round(simCpu * 0.68);
      logHpaSim(`[HPA] TARGETS (${simCpu}%/50%) 超過門檻！將 Open WebUI REPLICAS 擴展至 ${simReplicas}`, "log-ok");
      sim3DChangePods(1);
    }
  } else if (loadTestMode === "chat") {
    // Chat requests block waiting for Ollama single model queue! Frontend CPU stays low!
    simCpu = 24;
    simOllamaQueue = Math.min(520, simOllamaQueue + 85);
    if (simOllamaQueue >= 512) {
      logHpaSim(`[Ollama] 佇列已達上限 512 筆 (OLLAMA_NUM_PARALLEL=1)！後續請求回傳 HTTP 503 過載錯誤！而前端 CPU 僅 ${simCpu}%，HPA 完全不會觸發！`, "log-err");
    } else {
      logHpaSim(`[瓶頸警告] Ollama 排隊佇列累積至 ${simOllamaQueue} 筆，前端 Pod 只是在乾等 I/O，CPU (${simCpu}%/50%) 不足以觸發 HPA！`, "log-warn");
    }
  } else {
    // Idle
    simCpu = Math.max(10, Math.round(simCpu * 0.7));
    simOllamaQueue = Math.max(0, simOllamaQueue - 30);
    if (simCooldown > 0) {
      simCooldown = Math.max(0, simCooldown - 30); // Accelerated countdown for demo
      if (simCooldown === 0 && simReplicas > 1) {
        simReplicas = 1;
        logHpaSim(`[HPA] 300 秒縮減穩定視窗結束，確認負載穩定偏低，REPLICAS 縮回 1。`, "log-ok");
        sim3DPodCount = 1;
        rebuild3DPods();
      }
    }
  }

  const cpuEl = document.getElementById("sim-cpu-text");
  if (cpuEl) {
    cpuEl.textContent = `${simCpu}% / 50%`;
    cpuEl.style.color = simCpu > 50 ? "var(--accent-amber)" : "var(--primary)";
  }
  const repEl = document.getElementById("sim-replicas-text");
  if (repEl) repEl.textContent = `${simReplicas} / 4`;

  const qEl = document.getElementById("sim-ollama-q-text");
  if (qEl) {
    qEl.textContent = simOllamaQueue >= 512 ? `512 (503 過載!)` : `${simOllamaQueue} 筆排隊`;
    qEl.style.color = simOllamaQueue > 100 ? "var(--accent-red)" : "var(--secondary)";
  }

  const cdEl = document.getElementById("sim-cooldown-text");
  if (cdEl) {
    cdEl.textContent = simCooldown > 0 ? `${simCooldown} 秒 (保護中)` : "--";
  }
}, 1400);

// =========================================================================
// 8. LAB 5: STATELESS COURSE LAB VS STATEFUL PRODUCTION MULTI-REPLICA
// =========================================================================

function switchScalingArch(mode) {
  document.getElementById("btn-arch-course").classList.toggle("active", mode === "course");
  document.getElementById("btn-arch-prod").classList.toggle("active", mode === "prod");
  const box = document.getElementById("scaling-arch-visual");
  if (!box) return;

  if (mode === "course") {
    box.innerHTML = `
      <div class="callout warn" style="margin:0;">
        <strong>🎓 目前檢視：本課教學簡化架構（無狀態、不持久化）</strong><br>
        • 每個 Open WebUI Pod 各自抱著自己內部的 <code>SQLite</code> 與嵌入式 <code>ChromaDB</code>，彼此<strong>完全不共享資料</strong>。<br>
        • 唯一共享的是透過 K8s Secret 注入相同的 <code>WEBUI_SECRET_KEY</code>（避免 401 登入循環）。<br>
        • <strong>取捨後果：</strong>對話紀錄不會跨 Pod 保留、必須關閉多帳號登入（採單一使用者模式）、且<strong>實作時絕對不要上傳文件</strong>（多副本同時寫入嵌入式 ChromaDB 可能導致崩潰）。
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="callout" style="margin:0; border-left-color:var(--accent-green); background:rgba(16,185,129,0.08);">
        <strong>🏢 目前檢視：官方正式環境多副本架構（Production High Availability）</strong><br>
        • 將所有狀態外移到共享服務：所有 Open WebUI Pod 透過 <code>DATABASE_URL</code> 連接同一座 <strong>PostgreSQL</strong>，並透過 <strong>Redis</strong> 進行即時狀態協調。<br>
        • 文件與 RAG 知識庫改接外部向量資料庫（如 PGVector / Qdrant）與共享物件儲存（S3 / NFS）。<br>
        • <strong>取捨後果：</strong>任何一個 Pod 隨時被 HPA 增減或自癒重啟，使用者的對話紀錄、帳號與上傳文件都完全一致不遺失；但團隊必須額外維運 PostgreSQL、Redis 與共享儲存的高可用性。
      </div>
    `;
  }
}

// =========================================================================
// 9. LAB 6: DECISION WIZARD & GLOSSARY RENDERER
// =========================================================================

function showDecisionCase(caseNum) {
  const box = document.getElementById("decision-result-box");
  if (!box) return;

  if (caseNum === 1) {
    box.innerHTML = `
      <div style="color:var(--accent-green); font-weight:700; font-size:1.05rem; margin-bottom:6px;">
        ✅ 推薦選擇：Docker Compose（不需要 K3s！）
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        <strong>理由：</strong>單一主機、單一服務、20 人流量穩定且不需要自動擴展（HPA）。根據講義第六節：「Docker Compose 已經足夠，硬上編排反而增加維運負擔。是否要用編排工具，要看的是需求，而不是工具本身是否流行。」
      </p>
    `;
  } else if (caseNum === 2) {
    box.innerHTML = `
      <div style="color:var(--primary); font-weight:700; font-size:1.05rem; margin-bottom:6px;">
        ✅ 推薦選擇：K3s + 主機本地 Ollama（本課標準架構）
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        <strong>理由：</strong>工廠與分店現場屬於典型的 Edge 邊緣場景，硬體資源有限（一臺小型主機）且現場沒有專職維運人員。K3s 只需要極低資源就能提供 Deployment 自癒機制與內建 Traefik / HPA，搭配本地模型還能確保內部資料不出廠！
      </p>
    `;
  } else {
    box.innerHTML = `
      <div style="color:var(--secondary); font-weight:700; font-size:1.05rem; margin-bottom:6px;">
        ✅ 推薦選擇：雲端託管 Kubernetes (如 Azure AKS / AWS EKS / GCP GKE) + 外部共享資料庫
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        <strong>理由：</strong>跨國高併發場景需要在模型推論端也具備多張 GPU 節點擴充，並搭配託管 PostgreSQL、Redis 與外部向量庫。你在 K3s 學到的 Deployment、Service、Ingress、HPA 觀念可以 100% 無痛移轉到 AKS！
      </p>
    `;
  }
}

function filterGlossary(query = "") {
  const container = document.getElementById("glossary-container");
  if (!container) return;
  const q = query.trim().toLowerCase();

  const filtered = GLOSSARY_DATA.filter(item =>
    !q || item.term.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
  );

  container.innerHTML = filtered.map(item => `
    <div class="glossary-item">
      <div class="glossary-term">
        <span>${item.term}</span>
        <span class="pill-tag pill-blue" style="font-size:0.68rem;">${item.tag}</span>
      </div>
      <div class="glossary-desc">${item.desc}</div>
    </div>
  `).join("");
}

// =========================================================================
// 10. SCROLL SPY & READING PROGRESS
// =========================================================================

window.addEventListener("scroll", () => {
  const docEl = document.documentElement;
  const scrollTotal = docEl.scrollHeight - docEl.clientHeight;
  const pct = scrollTotal > 0 ? (docEl.scrollTop / scrollTotal) * 100 : 0;
  const bar = document.getElementById("reading-progress");
  if (bar) bar.style.width = `${pct}%`;

  // Highlight active chapter in sidebar
  const sections = document.querySelectorAll(".lecture-section");
  const navLinks = document.querySelectorAll("#chapter-nav .nav-link");
  let currentId = "sec-1";

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 140) {
      currentId = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
});

// Initialize everything on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  initHero3D();
  renderKitchenStations();
  renderReconState();
  evaluateNetSim();
  switchScalingArch("course");
  filterGlossary("");
  inspectK8sObject("Deployment");
});
