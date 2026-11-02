// ============================================================================
// AI555 3D 互動元宇宙主程式 (app.js)
// 包含：Three.js 5核心星環反應爐、3D 視角控制、模組深度導覽、決策矩陣、6步流水線、語音合成
// ============================================================================

let activeModuleId = 'prompt'; // 'prompt' | 'skill' | 'tool' | 'agent' | 'bot' | 'overview'
let voiceEnabled = true;
let isSpeaking = false;
let autoRotateScene = true;
let wireframeMode = false;
let currentPipelineStep = 1;
let pipelineTimer = null;

// Three.js 全域變數
let scene, camera, renderer, controls;
let threeContainer;
let nodeMeshes = {};
let coreMesh, starField;
let connectingTubes = [];
let raycaster, mouse;
let nodeScreenLabels = [];

// 初始化入口
document.addEventListener('DOMContentLoaded', () => {
  initThreeScene();
  initTabs();
  renderModuleContent(activeModuleId);
  initDecisionMatrix();
  initPipeline();
  initVoiceSystem();
  window.addEventListener('resize', onWindowResize);
});

// ============================================================================
// 1. Three.js 3D 舞台：5 核心星環反應爐 (Cyber Reactor)
// ============================================================================
function initThreeScene() {
  threeContainer = document.getElementById('three-canvas-container');
  if (!threeContainer) return;

  const width = threeContainer.clientWidth;
  const height = threeContainer.clientHeight;

  // 場景
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050814, 0.025);

  // 相機
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 16, 26);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  threeContainer.appendChild(renderer.domElement);

  // 軌道控制器
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 50;
  controls.minDistance = 8;
  controls.maxPolarAngle = Math.PI / 2 + 0.15; // 不穿入地盤下方

  // 燈光系統
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  const pointLightCenter = new THREE.PointLight(0x38bdf8, 2.5, 30);
  pointLightCenter.position.set(0, 0, 0);
  scene.add(pointLightCenter);

  // 星空背景粒子
  createStarField();

  // 中心核心：完成一項工作 (Mission Accomplished)
  createCenterCore();

  // 創建 5 大模組節點
  createOrbitNodes();

  // 底座全息網格地盤
  const gridHelper = new THREE.GridHelper(32, 32, 0x0284c7, 0x1e293b);
  gridHelper.position.y = -3;
  scene.add(gridHelper);

  // 射線檢測
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  threeContainer.addEventListener('mousemove', onCanvasMouseMove);
  threeContainer.addEventListener('click', onCanvasClick);

  // 動畫主循環
  animate();
}

function createStarField() {
  const count = 700;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 80;
    positions[i + 1] = (Math.random() - 0.5) * 60;
    positions[i + 2] = (Math.random() - 0.5) * 80;

    colors[i] = 0.5 + Math.random() * 0.5;
    colors[i + 1] = 0.7 + Math.random() * 0.3;
    colors[i + 2] = 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

function createCenterCore() {
  const group = new THREE.Group();

  // 內部能量球
  const coreGeo = new THREE.SphereGeometry(1.8, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const coreInner = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreInner);

  // 外部幾何網格籠
  const cageGeo = new THREE.IcosahedronGeometry(2.3, 1);
  const cageMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const cage = new THREE.Mesh(cageGeo, cageMat);
  cage.name = "coreCage";
  group.add(cage);

  // 外層旋轉環
  const ringGeo = new THREE.TorusGeometry(3.0, 0.05, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2;
  ring1.name = "ring1";
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.rotation.y = Math.PI / 3;
  ring2.name = "ring2";
  group.add(ring2);

  coreMesh = group;
  scene.add(coreMesh);
}

function createOrbitNodes() {
  const orbitRadius = 10.5;
  const modules = AI555_DATA.modules;
  const count = modules.length;

  modules.forEach((mod, idx) => {
    const angle = (idx / count) * Math.PI * 2;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    const y = 0;

    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(x, y, z);
    nodeGroup.userData = { moduleId: mod.id, modInfo: mod, basePos: new THREE.Vector3(x, y, z) };

    const colorVal = parseInt(mod.colorHex.replace('#', '0x'), 16);

    // 主體球
    const sphereGeo = new THREE.SphereGeometry(1.0, 28, 28);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: colorVal,
      emissive: colorVal,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.userData = { moduleId: mod.id };
    nodeGroup.add(sphere);

    // 外圍懸浮光環
    const haloGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: colorVal,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.name = "halo";
    nodeGroup.add(halo);

    scene.add(nodeGroup);
    nodeMeshes[mod.id] = nodeGroup;

    // 建立連接到中心的能量光束流 (Curve Pipe)
    createEnergyStream(new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0), colorVal);

    // 建立 2D 螢幕投射標籤
    createScreenLabel(mod);
  });
}

function createEnergyStream(fromPos, toPos, colorVal) {
  const curve = new THREE.LineCurve3(fromPos, toPos);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: colorVal,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(tube);
  connectingTubes.push(tube);
}

function createScreenLabel(mod) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'node-label-3d';
  labelDiv.id = `label-node-${mod.id}`;
  labelDiv.innerHTML = `${mod.icon} <span style="color:${mod.colorHex}">${mod.name}</span> <span class="text-slate-400 font-normal">(${mod.chineseName})</span>`;
  threeContainer.appendChild(labelDiv);
  nodeScreenLabels.push({ element: labelDiv, moduleId: mod.id });
}

function updateScreenLabels() {
  if (!camera || !threeContainer) return;
  const widthHalf = threeContainer.clientWidth / 2;
  const heightHalf = threeContainer.clientHeight / 2;

  nodeScreenLabels.forEach(item => {
    const node = nodeMeshes[item.moduleId];
    if (!node) return;

    const tempV = new THREE.Vector3();
    node.getWorldPosition(tempV);
    tempV.y += 1.8; // 標籤在球體上方

    tempV.project(camera);

    // 檢查是否在相機前方
    if (tempV.z > 1) {
      item.element.style.opacity = '0';
      return;
    }

    const x = (tempV.x * widthHalf) + widthHalf;
    const y = -(tempV.y * heightHalf) + heightHalf;

    item.element.style.opacity = '1';
    item.element.style.left = `${x}px`;
    item.element.style.top = `${y}px`;

    if (item.moduleId === activeModuleId) {
      item.element.style.borderColor = '#38bdf8';
      item.element.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.6)';
      item.element.style.zIndex = '20';
    } else {
      item.element.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      item.element.style.boxShadow = 'none';
      item.element.style.zIndex = '10';
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // 中心核心自轉
  if (coreMesh) {
    coreMesh.rotation.y = time * 0.4;
    const cage = coreMesh.getObjectByName("coreCage");
    if (cage) cage.rotation.x = time * -0.3;

    const ring1 = coreMesh.getObjectByName("ring1");
    if (ring1) ring1.rotation.z = time * 0.5;

    const ring2 = coreMesh.getObjectByName("ring2");
    if (ring2) ring2.rotation.x = time * 0.6;
  }

  // 模組節點呼吸與自轉
  Object.values(nodeMeshes).forEach((group, i) => {
    const halo = group.getObjectByName("halo");
    if (halo) {
      halo.rotation.z = time * (1 + i * 0.2);
    }
    // 輕微上下浮動
    group.position.y = Math.sin(time * 2 + i * 1.2) * 0.25;
  });

  // 星空背景旋轉
  if (starField) {
    starField.rotation.y = time * 0.02;
  }

  // 控制器自動旋轉
  if (autoRotateScene && controls) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
  } else if (controls) {
    controls.autoRotate = false;
  }

  controls.update();
  renderer.render(scene, camera);
  updateScreenLabels();
}

function onWindowResize() {
  if (!threeContainer || !camera || !renderer) return;
  const width = threeContainer.clientWidth;
  const height = threeContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onCanvasMouseMove(event) {
  const rect = threeContainer.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const interactiveMeshes = [];
  Object.values(nodeMeshes).forEach(group => {
    group.children.forEach(c => {
      if (c.isMesh) interactiveMeshes.push(c);
    });
  });

  const intersects = raycaster.intersectObjects(interactiveMeshes);

  const hudStatus = document.getElementById('three-hud-status');
  if (intersects.length > 0) {
    threeContainer.style.cursor = 'pointer';
    const hitObj = intersects[0].object;
    const modId = hitObj.userData.moduleId || (hitObj.parent && hitObj.parent.userData.moduleId);
    if (modId) {
      const mod = AI555_DATA.modules.find(m => m.id === modId);
      if (mod && hudStatus) {
        hudStatus.innerHTML = `聚焦節點：<span style="color:${mod.colorHex}">${mod.icon} ${mod.name} (${mod.chineseName})</span> - 點擊展開深度專案`;
      }
    }
  } else {
    threeContainer.style.cursor = 'default';
    if (hudStatus) {
      hudStatus.innerHTML = `可按住滑鼠拖曳旋轉 3D 星環反應爐，或點擊任一行星節點展開`;
    }
  }
}

function onCanvasClick(event) {
  const rect = threeContainer.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const interactiveMeshes = [];
  Object.values(nodeMeshes).forEach(group => {
    group.children.forEach(c => {
      if (c.isMesh) interactiveMeshes.push(c);
    });
  });

  const intersects = raycaster.intersectObjects(interactiveMeshes);
  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    const modId = hitObj.userData.moduleId || (hitObj.parent && hitObj.parent.userData.moduleId);
    if (modId) {
      selectModule(modId);
      focusCameraOnNode(modId);
    }
  }
}

function focusCameraOnNode(modId) {
  const node = nodeMeshes[modId];
  if (!node || !controls) return;

  const targetPos = node.position.clone();
  // 輕微平滑聚焦
  const camTarget = new THREE.Vector3(targetPos.x * 1.5, targetPos.y + 4, targetPos.z * 1.5);

  const startTime = Date.now();
  const startCamPos = camera.position.clone();
  const startControlsTarget = controls.target.clone();

  function tweenCam() {
    const elapsed = (Date.now() - startTime) / 600;
    if (elapsed < 1) {
      camera.position.lerpVectors(startCamPos, camTarget, elapsed);
      controls.target.lerpVectors(startControlsTarget, targetPos, elapsed);
      requestAnimationFrame(tweenCam);
    } else {
      camera.position.copy(camTarget);
      controls.target.copy(targetPos);
    }
  }
  tweenCam();
}

// 3D 鏡頭視角切換控制
function setCameraView(viewType) {
  if (!camera || !controls) return;
  autoRotateScene = false;
  document.getElementById('btn-autorotate-toggle').textContent = "旋轉：已暫停";

  if (viewType === 'overview') {
    camera.position.set(0, 16, 26);
    controls.target.set(0, 0, 0);
  } else if (viewType === 'top') {
    camera.position.set(0, 32, 0.1);
    controls.target.set(0, 0, 0);
  } else if (viewType === 'iso') {
    camera.position.set(20, 20, 20);
    controls.target.set(0, 0, 0);
  }
}

function toggleAutoRotate() {
  autoRotateScene = !autoRotateScene;
  const btn = document.getElementById('btn-autorotate-toggle');
  if (btn) {
    btn.textContent = autoRotateScene ? "旋轉：運轉中" : "旋轉：已暫停";
  }
}

function toggleWireframe() {
  wireframeMode = !wireframeMode;
  scene.traverse(child => {
    if (child.isMesh && child.material && child.name !== "coreCage" && child.name !== "halo") {
      child.material.wireframe = wireframeMode;
    }
  });
  const btn = document.getElementById('btn-wireframe-toggle');
  if (btn) {
    btn.textContent = wireframeMode ? "模式：全息網格" : "模式：實體光影";
  }
}


// ============================================================================
// 2. 標籤導覽系統與主頁面切換
// ============================================================================
function initTabs() {
  const container = document.getElementById('five-page-tabs');
  if (!container) return;

  let html = '';
  AI555_DATA.modules.forEach(mod => {
    html += `
      <button id="tab-btn-${mod.id}" onclick="selectModule('${mod.id}')"
        class="flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left bg-slate-900/60 border-slate-800 hover:border-slate-700">
        <span class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style="background:${mod.colorHex}22; border:1px solid ${mod.colorHex}55;">
          ${mod.icon}
        </span>
        <div class="overflow-hidden">
          <div class="font-black text-sm tracking-wide text-white truncate flex items-center gap-1.5">
            ${mod.name}
            <span class="text-xs px-1.5 py-0.2 rounded font-normal bg-slate-800 text-slate-300">${mod.chineseName}</span>
          </div>
          <div class="text-xs text-slate-400 truncate">${mod.pantone}</div>
        </div>
      </button>
    `;
  });

  // 總覽標籤
  html += `
    <button id="tab-btn-overview" onclick="selectModule('overview')"
      class="flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left bg-slate-900/60 border-slate-800 hover:border-slate-700">
      <span class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-sky-500/20 border border-sky-400/40 text-sky-300">
        🌐
      </span>
      <div class="overflow-hidden">
        <div class="font-black text-sm tracking-wide text-white truncate">全景總覽</div>
        <div class="text-xs text-sky-400 truncate">5核心分工地圖</div>
      </div>
    </button>
  `;

  container.innerHTML = html;
  updateTabHighlight();
}

function selectModule(moduleId) {
  activeModuleId = moduleId;
  updateTabHighlight();
  renderModuleContent(moduleId);

  if (moduleId !== 'overview') {
    focusCameraOnNode(moduleId);
    const mod = AI555_DATA.modules.find(m => m.id === moduleId);
    if (mod && voiceEnabled) {
      speakText(mod.voiceScript);
    }
  } else {
    setCameraView('overview');
    if (voiceEnabled) {
      speakText("現在進入五大模組全景總覽。行政工作的複雜任務，都是由 Prompt、Skill、Tool、Agent 與 Bot 這五個模組自由排列組合、協同完成！");
    }
  }
}

function updateTabHighlight() {
  const allTabs = ['prompt', 'skill', 'tool', 'agent', 'bot', 'overview'];
  allTabs.forEach(id => {
    const btn = document.getElementById(`tab-btn-${id}`);
    if (!btn) return;

    if (id === activeModuleId) {
      btn.classList.remove('bg-slate-900/60', 'border-slate-800');
      if (id === 'overview') {
        btn.classList.add('bg-sky-950/60', 'border-sky-400', 'shadow-lg');
      } else {
        const mod = AI555_DATA.modules.find(m => m.id === id);
        btn.style.borderColor = mod.colorHex;
        btn.style.boxShadow = `0 0 20px ${mod.colorHex}44`;
        btn.classList.add('bg-slate-900/90');
      }
    } else {
      btn.style.borderColor = '';
      btn.style.boxShadow = '';
      btn.classList.remove('bg-sky-950/60', 'border-sky-400', 'shadow-lg', 'bg-slate-900/90');
      btn.classList.add('bg-slate-900/60', 'border-slate-800');
    }
  });
}


// ============================================================================
// 3. 模組內容動態渲染
// ============================================================================
function renderModuleContent(moduleId) {
  const main = document.getElementById('page-main-container');
  if (!main) return;

  if (moduleId === 'overview') {
    renderOverviewPage(main);
    return;
  }

  const mod = AI555_DATA.modules.find(m => m.id === moduleId);
  if (!mod) return;

  main.innerHTML = `
    <div class="space-y-8 animate-fadeIn">
      <!-- 頂部巨幕介紹卡 -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden" style="border-color:${mod.colorHex}55;">
        <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style="background:${mod.colorHex};"></div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl sm:text-4xl">${mod.icon}</span>
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${mod.name} <span class="font-normal text-slate-300">(${mod.chineseName})</span>
              </h2>
              <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-slate-950" style="background:${mod.colorHex};">
                ${mod.pantone}
              </span>
            </div>
            <p class="text-base sm:text-lg font-bold text-slate-200 max-w-3xl leading-relaxed">
              ${mod.shortDesc}
            </p>
            <div class="text-sm italic font-medium" style="color:${mod.colorHex}">
              ${mod.quote}
            </div>
          </div>
          <div class="flex flex-wrap md:flex-col items-start gap-2 shrink-0">
            <button onclick="speakText('${mod.voiceScript.replace(/'/g, "\\'")}')" class="px-4 py-2.5 rounded-xl text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105" style="background:${mod.colorHex};">
              <span>🗣️ 聽專屬語音導覽</span>
            </button>
            <button onclick="focusCameraOnNode('${mod.id}')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors">
              <span>🪐 3D 相機鎖定節點</span>
            </button>
          </div>
        </div>

        <!-- 軟體操作入口提醒 -->
        <div class="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-3 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-4 rounded-2xl">
          <span class="text-amber-400 font-black shrink-0">📍 軟體操作入口：</span>
          <div>${mod.uiEntry}</div>
        </div>
      </div>

      <!-- 核心三段結構 (三塊/三步/三階/閉環) -->
      <div class="space-y-4">
        <h3 class="text-lg font-black text-white flex items-center gap-2">
          <span>📐</span> 模組核心運作機制解構
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-slate-800 relative hover:border-slate-700 transition-all">
            <span class="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-400">${mod.threeStage.stage1.label}</span>
            <div class="font-black text-lg text-white mt-2">${mod.threeStage.stage1.title}</div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">${mod.threeStage.stage1.desc}</p>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-800 relative hover:border-slate-700 transition-all">
            <span class="text-xs font-black px-2 py-0.5 rounded" style="background:${mod.colorHex}22; color:${mod.colorHex}; border:1px solid ${mod.colorHex}44;">${mod.threeStage.stage2.label}</span>
            <div class="font-black text-lg text-white mt-2">${mod.threeStage.stage2.title}</div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">${mod.threeStage.stage2.desc}</p>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-800 relative hover:border-slate-700 transition-all">
            <span class="text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">${mod.threeStage.stage3.label}</span>
            <div class="font-black text-lg text-white mt-2">${mod.threeStage.stage3.title}</div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">${mod.threeStage.stage3.desc}</p>
          </div>
        </div>
      </div>

      <!-- 課堂實戰案例庫 (含一鍵複製指令) -->
      <div class="space-y-4">
        <h3 class="text-lg font-black text-white flex items-center gap-2">
          <span>🎯</span> 簡報收錄真實公務應用實例
        </h3>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          ${mod.cases.map((c, i) => `
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black px-2 py-0.5 rounded text-slate-900 font-bold" style="background:${mod.colorHex};">
                    ${c.tag}
                  </span>
                  <span class="text-xs text-slate-500 font-mono">CASE 0${i + 1}</span>
                </div>
                <h4 class="font-bold text-white text-base">${c.title}</h4>
                <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 relative group">
                  <pre class="whitespace-pre-wrap">${c.promptText}</pre>
                </div>
              </div>
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div class="text-xs text-emerald-400 flex items-center gap-1 truncate">
                  <span>💡 成果：</span>${c.resultSummary}
                </div>
                <button onclick="copyToClipboard(\`${c.promptText.replace(/`/g, "\\`")}\`)" class="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors">
                  📋 複製
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 互動模擬實戰沙盒 (依模組不同提供專屬動態元件) -->
      ${renderInteractiveSandbox(mod)}
    </div>
  `;
}

// 專屬互動沙盒
function renderInteractiveSandbox(mod) {
  if (mod.id === 'prompt') {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-sky-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>🧪</span> Prompt 三模塊提問組裝實驗室
          </h3>
          <span class="text-xs text-sky-400">輸入材料 ➔ 明確規範 ➔ 結構驗收</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div class="font-bold text-sky-300 mb-1">[輸入模塊] 原始材料</div>
            <textarea id="sb-prompt-input" rows="4" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-400">台科大推甄：10/06 截止，1300元；北科大：10/19 截止，1300元；雲科大：10/15 截止，600/1200元。</textarea>
          </div>
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div class="font-bold text-sky-300 mb-1">[處理模塊] 驗收要求</div>
            <textarea id="sb-prompt-rule" rows="4" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-400">請彙整成完整 Markdown 比對表單，欄位包含：學校、截止日期、費用，並按截止日先後排序。</textarea>
          </div>
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div class="font-bold text-emerald-400 mb-1">[輸出模塊] 即時產出模擬</div>
            <div id="sb-prompt-output" class="p-2 rounded bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto h-24 border border-slate-800">
              點擊下方「組裝並生成」按鈕即時預覽...
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button onclick="runPromptSandbox()" class="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm shadow-md transition-all">
            ⚡ 組裝三模塊並生成結構化成果
          </button>
        </div>
      </div>
    `;
  } else if (mod.id === 'skill') {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>🔄</span> 支出證明單 Skill 模組驗證沙盒（保存一次，換資料再做）
          </h3>
          <span class="text-xs text-emerald-400">固化格式 × 匿名帳單 × 批次輸出</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          先測試一份完整資料，再測試一份缺漏資料。Skill 的檢查規則會自動防呆，確保輸出規格 100% 一致。
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div class="font-bold text-white text-sm">測試情境 A：輸入完整海外刷卡帳單 (5 筆)</div>
            <div class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded font-mono">
              1. OpenAI ChatGPT $690 (手續費 $10)<br/>
              2. Anthropic Claude $2,748 (手續費 $41)<br/>
              3. Cursor AI $687 (手續費 $10)
            </div>
            <button onclick="testSkillSandbox('complete')" class="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">
              執行 Skill 套表 ➔ 自動生成 6 頁支出證明單 Word
            </button>
          </div>
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div class="font-bold text-white text-sm">測試情境 B：輸入缺漏資料（缺少手續費金額）</div>
            <div class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded font-mono">
              1. AWS Cloud $539 (國外交易手續費：未記載)
            </div>
            <button onclick="testSkillSandbox('missing')" class="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              觸發 Skill 防呆機制 ➔ 提示缺漏欄位並請求人工確認
            </button>
          </div>
        </div>
        <div id="sb-skill-result" class="hidden p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
        </div>
      </div>
    `;
  } else if (mod.id === 'tool') {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>🔌</span> 115 校園行事曆 PDF ➔ Google 日曆 Tool 串接管線模擬
          </h3>
          <span class="text-xs text-amber-400">PDF 讀取 ➔ MCP 比對 ➔ API 寫入</span>
        </div>
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div class="flex items-center gap-3">
            <span class="text-3xl">📄</span>
            <div>
              <div class="font-bold text-white">日夜間部 PDF 行事曆</div>
              <div class="text-slate-400">原始校園公告檔案 (168469687.pdf)</div>
            </div>
          </div>
          <span class="text-amber-400 text-xl font-bold">➔</span>
          <div class="flex items-center gap-3">
            <span class="text-3xl">⚙️</span>
            <div>
              <div class="font-bold text-white">Tool / MCP 計算調度</div>
              <div class="text-emerald-400 font-mono">日間部 81 筆 / 夜間部 76 筆 自動分流</div>
            </div>
          </div>
          <span class="text-amber-400 text-xl font-bold">➔</span>
          <div class="flex items-center gap-3">
            <span class="text-3xl">📅</span>
            <div>
              <div class="font-bold text-white">Google Calendar API</div>
              <div class="text-sky-400 font-mono">寫入 nutc-115行事曆</div>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button onclick="runToolSimulation()" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow">
            ▶️ 模擬 Tool 執行：日夜間部獨立行程排入日曆
          </button>
        </div>
        <div id="sb-tool-result" class="hidden p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
        </div>
      </div>
    `;
  } else if (mod.id === 'agent') {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>🧠</span> Agent 自主閉環 vs 傳統腳本：面對異常的真實反應
          </h3>
          <span class="text-xs text-purple-400">死板停機等待 vs. 自主動態調整</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl space-y-2">
            <div class="font-bold text-rose-300 flex items-center gap-2">
              <span>❌</span> 傳統寫死的腳本 (Past)
            </div>
            <p class="text-slate-300">讀取名單 ➔ 篩選去重 ➔ 統計人數。</p>
            <div class="p-3 bg-slate-950 rounded text-rose-400 font-mono">
              [報錯] 發現推甄截止日期在不同簡章有差異！程式崩潰，任務終止，停機等待承辦人員手動修復。
            </div>
          </div>
          <div class="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl space-y-2">
            <div class="font-bold text-purple-300 flex items-center gap-2">
              <span>✅</span> Agent 自主大腦 (Present)
            </div>
            <p class="text-slate-300">選擇步驟 ➔ 使用工具 ➔ 觀察結果 ➔ 動態調整 ➔ 交付成果。</p>
            <div class="p-3 bg-slate-950 rounded text-emerald-400 font-mono">
              [動態決策] 發現兩校推甄日期有爭議，Agent 自主調用網頁搜尋 Tool 追查最新官方更正公告，確認無誤後修正，繼續完成交付！
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (mod.id === 'bot') {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>💬</span> LINE 秘書分流模擬器（三層階梯架構實測）
          </h3>
          <span class="text-xs text-rose-400">固定規則 ➔ Skill 模具 ➔ Agent 喚醒</span>
        </div>
        <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div class="text-xs text-slate-300">點選不同行政情境，看 Bot 秘書如何自動分流到正確模組：</div>
          <div class="flex flex-wrap gap-2">
            <button onclick="testBotMessage('分機')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white">
              情境 1：「請問系辦公室分機與各老師分機表？」
            </button>
            <button onclick="testBotMessage('公文')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white">
              情境 2：「幫我套用國科會計畫函復公文模具」
            </button>
            <button onclick="testBotMessage('衝突')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white">
              情境 3：「明天下午院務會議與碩士面試大撞期，請協調」
            </button>
          </div>
          <div id="sb-bot-chat" class="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 min-h-[90px] flex items-center">
            請點擊上方按鈕測試 Bot 的三層喚醒分工...
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

// 實作沙盒模擬函數
function runPromptSandbox() {
  const output = document.getElementById('sb-prompt-output');
  output.innerHTML = `
    | 學校 | 報名截止 | 費用 | 備註 |
    | :--- | :--- | :--- | :--- |
    | 臺灣科技大學 | 10/06 17:00 | 1,300元 | 符合口試另繳500 |
    | 雲林科技大學 | 10/15 23:59 | 600~1,200元 | 依系所不同 |
    | 臺北科技大學 | 10/19 17:00 | 1,300元 | 完整簡章已下載 |
  `;
  showToast("Prompt 三模塊組合產出成功！");
}

function testSkillSandbox(type) {
  const res = document.getElementById('sb-skill-result');
  res.classList.remove('hidden');
  if (type === 'complete') {
    res.innerHTML = `
      <div class="text-emerald-400 font-bold mb-1">✅ Skill 驗證通過（資料完整）：</div>
      已自動將 3 筆國外交易拆解為 6 頁支出證明單（含交易款單據 + 國外交易手續費單據）。<br/>
      依學校審計格式套表完成，已合併存為 <span class="text-sky-300">支出證明單_202611.docx</span>，支援一鍵列印！
    `;
  } else {
    res.innerHTML = `
      <div class="text-amber-400 font-bold mb-1">⚠️ Skill 觸發防呆警告（欄位缺漏）：</div>
      偵測到第 1 筆交易缺少「國外交易手續費」數值。<br/>
      依照保存的檢查規則，系統自動暫停輸出，並在試算表高亮標記該欄位，請承辦人員補齊或勾選「免扣手續費」。
    `;
  }
}

function runToolSimulation() {
  const res = document.getElementById('sb-tool-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="text-sky-300 font-bold mb-1">⚡ Tool 執行日曆排程中：</div>
    - 讀取 PDF 行事曆：完成 157 筆校務重大日期辨識<br/>
    - MCP 邏輯運算：成功分離「日間部 81 筆」與「夜間部 76 筆」獨立日曆類別<br/>
    - 寫入 Google Calendar API：已於使用者日曆「nutc-115行事曆」建立 157 筆行程！
  `;
}

function testBotMessage(type) {
  const chat = document.getElementById('sb-bot-chat');
  if (type === '分機') {
    chat.innerHTML = `
      <div class="space-y-1">
        <div class="text-slate-400">同仁傳送：「請問系辦公室分機與各老師分機表？」</div>
        <div class="text-rose-400 font-bold">🤖 Bot 判定：【第 1 層：觸發固定規則】</div>
        <div class="text-white">回覆：資管系辦公室分機為 #9510，林文彥老師研究室為 #9521。已發送完整通訊錄附件給您！</div>
      </div>
    `;
  } else if (type === '公文') {
    chat.innerHTML = `
      <div class="space-y-1">
        <div class="text-slate-400">同仁傳送：「幫我套用國科會計畫函復公文模具」</div>
        <div class="text-emerald-400 font-bold">🤖 Bot 判定：【第 2 層：啟動 Skill 模具】</div>
        <div class="text-white">回覆：已載入「國科會公文函復 Skill」，請上傳計畫變更核定清單，我將立即產出標準公文草稿。</div>
      </div>
    `;
  } else if (type === '衝突') {
    chat.innerHTML = `
      <div class="space-y-1">
        <div class="text-slate-400">同仁傳送：「明天下午院務會議與碩士面試大撞期，請協調」</div>
        <div class="text-purple-400 font-bold">🤖 Bot 判定：【第 3 層：喚醒 Agent 代理任務】</div>
        <div class="text-white">回覆：已指派 Agent 調閱 5 位委員空檔、院長日曆與備用會議室，正進行多步驟動態排程規劃！</div>
      </div>
    `;
  }
}

// ============================================================================
// 4. 全景總覽頁面渲染
// ============================================================================
function renderOverviewPage(main) {
  main.innerHTML = `
    <div class="space-y-10 animate-fadeIn">
      <!-- 總覽標題 -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
          5 Core Architecture
        </span>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
          AI 行政自動化：五大核心元件分工架構
        </h2>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          所有的複雜行政工作，都是這五個模組的自由排列組合。同一個專案可以搭配多個元件協同完成！
        </p>
      </div>

      <!-- 5 大模組彩色對照卡片矩陣 -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        ${AI555_DATA.modules.map(mod => `
          <div onclick="selectModule('${mod.id}')"
            class="glass-panel p-5 rounded-2xl border cursor-pointer hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            style="border-color:${mod.colorHex}55;">
            <div class="space-y-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style="background:${mod.colorHex}22; border:1px solid ${mod.colorHex}66;">
                ${mod.icon}
              </div>
              <div>
                <div class="font-black text-lg text-white">${mod.name}</div>
                <div class="text-xs font-bold" style="color:${mod.colorHex}">${mod.chineseName}</div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">${mod.shortDesc}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">${mod.pantone}</span>
              <span class="font-bold" style="color:${mod.colorHex}">詳情 →</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 5 個概念的分工電路圖模擬 (Slide 4 概念) -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 class="text-xl font-black text-white text-center">
          五個模組協同核心：「完成一項工作」
        </h3>
        <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <!-- 左側：需求端 -->
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40">
              <div class="font-bold text-sky-300 text-sm">Prompt (提問生成)</div>
              <div class="text-xs text-slate-400">單次指令，精準產出成果。</div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <div class="font-bold text-emerald-300 text-sm">Skill (重複使用技能)</div>
              <div class="text-xs text-slate-400">固化流程，替換資料即可重用。</div>
            </div>
          </div>

          <!-- 中間：核心處理中樞 -->
          <div class="text-center p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-400/60 shadow-2xl relative">
            <div class="w-16 h-16 mx-auto rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-3xl animate-pulse-slow">
              🎯
            </div>
            <div class="font-black text-lg text-white mt-3">完成一項工作</div>
            <div class="text-xs text-slate-400 mt-1">自由排列組合協同</div>
          </div>

          <!-- 右側：執行端 -->
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
              <div class="font-bold text-amber-300 text-sm">Tool (讀取與動作)</div>
              <div class="text-xs text-slate-400">AI 的手腳，串接外部系統與檔案。</div>
            </div>
            <div class="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
              <div class="font-bold text-purple-300 text-sm">Agent (多項任務安排)</div>
              <div class="text-xs text-slate-400">AI 的大腦，根據目標自主觀察與修正。</div>
            </div>
          </div>
        </div>

        <!-- 底部連通：Bot -->
        <div class="max-w-md mx-auto p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center">
          <div class="font-bold text-rose-300 text-sm">Bot (訊息服務入口)</div>
          <div class="text-xs text-slate-400">24小時秘書，人類與系統的最簡對話入口。</div>
        </div>
      </div>
    </div>
  `;
}


// ============================================================================
// 5. 決策矩陣：該選哪一個？(Slide 31)
// ============================================================================
function initDecisionMatrix() {
  const container = document.getElementById('decision-matrix-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${AI555_DATA.decisionMatrix.map((item, idx) => `
          <label class="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
            <input type="checkbox" id="matrix-chk-${item.targetId}" onchange="updateDecisionRecommendation()"
              class="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-950 border-slate-700 mt-0.5" />
            <div class="space-y-1">
              <div class="font-bold text-white text-sm flex items-center gap-2">
                ${item.question}
              </div>
              <div class="text-xs text-slate-400">
                推薦：<span class="font-bold text-sky-300">${item.name}</span> - ${item.reason}
              </div>
            </div>
          </label>
        `).join('')}
      </div>

      <!-- 建議產出卡 -->
      <div id="decision-result-box" class="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm space-y-2">
        <div class="font-bold text-amber-300 flex items-center gap-2">
          <span>💡</span> 你的任務組合建議：
        </div>
        <div id="decision-result-text" class="text-slate-300">
          勾選上方問題，系統將自動為您的行政業務調配最合適的 AI 元件配方！
        </div>
      </div>
    </div>
  `;
}

function updateDecisionRecommendation() {
  const checked = [];
  AI555_DATA.decisionMatrix.forEach(item => {
    const chk = document.getElementById(`matrix-chk-${item.targetId}`);
    if (chk && chk.checked) {
      checked.push(item);
    }
  });

  const resText = document.getElementById('decision-result-text');
  if (!resText) return;

  if (checked.length === 0) {
    resText.innerHTML = "請勾選上方業務特性，立即查看 AI 組合配方。";
    return;
  }

  const recipeNames = checked.map(c => `<span class="px-2 py-0.5 rounded font-black text-xs text-slate-950 bg-sky-400">${c.name}</span>`).join(' + ');

  let explanation = `<div class="mb-2">推薦配方：${recipeNames}</div><ul class="list-disc pl-5 space-y-1 text-xs text-slate-400">`;
  checked.forEach(c => {
    explanation += `<li><strong>${c.name}</strong>：${c.reason}</li>`;
  });
  explanation += `</ul><div class="mt-2 text-xs text-emerald-400">✅ 結論：每個元件都具備明確的使用理由，可複選混搭完成全自動工作流程！</div>`;

  resText.innerHTML = explanation;
}


// ============================================================================
// 6. 從文件到官網的自動化流水線 (Slide 32)
// ============================================================================
function initPipeline() {
  const container = document.getElementById('pipeline-steps-container');
  if (!container) return;

  renderPipelineStep(currentPipelineStep);
}

function renderPipelineStep(stepNum) {
  const container = document.getElementById('pipeline-steps-container');
  if (!container) return;

  const steps = AI555_DATA.pipeline6Steps;
  const currentStep = steps.find(s => s.step === stepNum) || steps[0];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- 步驟進度橫幅 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        ${steps.map(s => `
          <button onclick="setPipelineStep(${s.step})"
            class="p-2.5 rounded-xl border text-left transition-all ${s.step === stepNum ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-bold">STEP 0${s.step}</span>
              <span>${s.icon}</span>
            </div>
            <div class="font-bold text-xs truncate text-white">${s.title}</div>
          </button>
        `).join('')}
      </div>

      <!-- 當前步驟詳情卡 -->
      <div class="glass-panel p-6 rounded-2xl border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black px-2.5 py-0.5 rounded bg-sky-400 text-slate-950">步驟 0${currentStep.step}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">${currentStep.moduleType}</span>
          </div>
          <h4 class="text-xl font-black text-white">${currentStep.title}</h4>
          <p class="text-sm text-slate-200 leading-relaxed">${currentStep.desc}</p>
          <div class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
            📌 執行細節：${currentStep.detail}
          </div>
        </div>

        <div class="flex flex-wrap md:flex-col gap-2 shrink-0">
          <button onclick="nextPipelineStep()" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow">
            下一步 (Step ${stepNum < 6 ? stepNum + 1 : 1}) →
          </button>
          <button onclick="togglePipelineAutoPlay()" id="btn-pipeline-autoplay" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700">
            ▶️ 自動循序演練
          </button>
        </div>
      </div>
    </div>
  `;
}

function setPipelineStep(step) {
  currentPipelineStep = step;
  renderPipelineStep(step);
}

function nextPipelineStep() {
  currentPipelineStep = currentPipelineStep >= 6 ? 1 : currentPipelineStep + 1;
  renderPipelineStep(currentPipelineStep);
}

function togglePipelineAutoPlay() {
  const btn = document.getElementById('btn-pipeline-autoplay');
  if (pipelineTimer) {
    clearInterval(pipelineTimer);
    pipelineTimer = null;
    if (btn) btn.textContent = "▶️ 自動循序演練";
  } else {
    if (btn) btn.textContent = "⏸️ 暫停演練";
    pipelineTimer = setInterval(() => {
      nextPipelineStep();
    }, 2800);
  }
}


// ============================================================================
// 7. 語音合成系統 (Web Speech API)
// ============================================================================
function initVoiceSystem() {
  if (!('speechSynthesis' in window)) {
    console.warn("此瀏覽器不支援 Web Speech API");
  }
}

function speakText(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // 停止先前的發音

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const wave = document.getElementById('speaking-wave');
  const statusText = document.getElementById('voice-status-text');

  utterance.onstart = () => {
    isSpeaking = true;
    if (wave) wave.classList.remove('hidden');
    if (wave) wave.classList.add('flex');
    if (statusText) statusText.textContent = `語音解說中：${text.slice(0, 32)}...`;
  };

  utterance.onend = () => {
    isSpeaking = false;
    if (wave) wave.classList.add('hidden');
    if (wave) wave.classList.remove('flex');
    if (statusText) statusText.textContent = "點選任一模組或按鈕可隨時收聽解說";
  };

  utterance.onerror = () => {
    isSpeaking = false;
    if (wave) wave.classList.add('hidden');
  };

  window.speechSynthesis.speak(utterance);
}

function toggleVoiceEnabled() {
  voiceEnabled = !voiceEnabled;
  if (!voiceEnabled && ('speechSynthesis' in window)) {
    window.speechSynthesis.cancel();
  }
  const btn = document.getElementById('btn-voice-toggle');
  const icon = document.getElementById('voice-icon');
  const label = document.getElementById('voice-label');
  if (btn) {
    if (voiceEnabled) {
      icon.textContent = "🔊";
      label.textContent = "語音：開啟";
      btn.classList.add('border-sky-400', 'text-sky-300');
      btn.classList.remove('border-slate-700', 'text-slate-400');
    } else {
      icon.textContent = "🔇";
      label.textContent = "語音：關閉";
      btn.classList.remove('border-sky-400', 'text-sky-300');
      btn.classList.add('border-slate-700', 'text-slate-400');
    }
  }
}

function speakCurrentPageIntro() {
  if (activeModuleId === 'overview') {
    speakText("歡迎來到 AI 行政自動化五大核心架構全景總覽。從提問生成的 Prompt、重複技能 Skill、外部工具 Tool、代理大腦 Agent 到秘書入口 Bot，帶您重塑辦公效率！");
  } else {
    const mod = AI555_DATA.modules.find(m => m.id === activeModuleId);
    if (mod) speakText(mod.voiceScript);
  }
}


// ============================================================================
// 8. 字體大小模式切換與輔助工具
// ============================================================================
function setFontSizeMode(mode) {
  const root = document.documentElement;
  root.classList.remove('font-mode-normal', 'font-mode-large', 'font-mode-xlarge');
  root.classList.add(`font-mode-${mode}`);

  const modes = ['normal', 'large', 'xlarge'];
  modes.forEach(m => {
    const btn = document.getElementById(`btn-font-${m}`);
    if (btn) {
      if (m === mode) {
        btn.classList.add('bg-sky-500', 'text-slate-950');
        btn.classList.remove('bg-slate-800', 'text-slate-200');
      } else {
        btn.classList.remove('bg-sky-500', 'text-slate-950');
        btn.classList.add('bg-slate-800', 'text-slate-200');
      }
    }
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("已成功複製指令咒語至剪貼簿！");
  }).catch(() => {
    showToast("複製失敗，請手動選取文字");
  });
}

function showToast(msg) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-black text-sm shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>📋</span> <span>${msg}</span>`;
  toast.classList.remove('translate-y-12', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-12', 'opacity-0');
  }, 2500);
}
