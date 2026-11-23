import * as THREE from 'three';
import { SoundEngine } from './audio.js';
import {
  createRocket,
  createLaunchpad,
  createMoon,
  createEarth,
  createMeteor,
  createStarPickup,
  createCloudCluster,
  createStarfield,
} from './models.js';

const STORAGE_BEST_KEY = 'lunar_rocket_3d_best_v1';

// Playfield bounds on Z=0 plane
const PLAY_X = 5.4;
const PLAY_Y_MIN = -3.1;
const PLAY_Y_MAX = 2.0;

const PHASES = [
  { id: 'launch',     start: 0.00, label: '🚀 階段 1：火箭發射' },
  { id: 'atmosphere', start: 0.15, label: '☁️ 階段 2：通過大氣層' },
  { id: 'separation', start: 0.33, label: '💥 階段 3：火箭分離' },
  { id: 'lunar',      start: 0.48, label: '🌕 階段 4：抵達月球' },
  { id: 'return',     start: 0.62, label: '🛰️ 階段 5：返航衝刺' },
  { id: 'reentry',    start: 0.82, label: '🔥 階段 6：重返大氣層' },
  { id: 'splashdown', start: 0.94, label: '🪂 階段 7：開傘安全降落' },
];

class LunarRocketGame {
  constructor() {
    this.sound = new SoundEngine();
    this.bestScore = Math.floor(Number(localStorage.getItem(STORAGE_BEST_KEY) || 0));

    // DOM Elements
    this.canvas = document.getElementById('game-canvas');
    this.hud = document.getElementById('hud');
    this.scoreVal = document.getElementById('score-val');
    this.comboVal = document.getElementById('combo-val');
    this.phaseBadge = document.getElementById('phase-badge');
    this.progressFill = document.getElementById('progress-fill');
    this.trackRocket = document.getElementById('track-rocket');
    this.altitudeVal = document.getElementById('altitude-val');
    this.speedVal = document.getElementById('speed-val');
    this.banner = document.getElementById('banner');
    this.bannerSub = document.getElementById('banner-sub');
    this.bannerTitle = document.getElementById('banner-title');
    this.btnSeparate = document.getElementById('btn-separate');
    this.popupLayer = document.getElementById('popup-layer');
    this.touchHint = document.getElementById('touch-hint');
    this.damageFlash = document.getElementById('damage-flash');
    this.cloudVeilFx = document.getElementById('cloud-veil-fx');
    this.reentryFx = document.getElementById('reentry-fx');

    // Screens
    this.screenStart = document.getElementById('screen-start');
    this.screenPause = document.getElementById('screen-pause');
    this.screenGameOver = document.getElementById('screen-gameover');
    this.screenVictory = document.getElementById('screen-victory');
    document.getElementById('start-best-score').textContent = this.bestScore.toLocaleString();

    // Game State
    this.state = 'menu'; // menu | countdown | playing | lunar_pause | paused | exploding | gameover | victory
    this.progress = 0; // 0.0 -> 1.0
    this.score = 0;
    this.combo = 1.0;
    this.dodgedCount = 0;
    this.nearMissCount = 0;
    this.currentPhaseIndex = 0;
    this.stage1Separated = false;
    this.stage2Separated = false;
    this.separationPromptActive = false;
    this.lunarReached = false;
    this.parachuteDeployed = false;

    this.countdownTimer = 0;
    this.lastBeepSecond = 4;
    this.lunarHoldTimer = 0;
    this.explodeTimer = 0;
    this.bannerTimer = 0;
    this.shakeIntensity = 0;

    // Input state
    this.keys = {};
    this.targetPos = new THREE.Vector2(0, -1.6);
    this.pointerActive = false;
    this.lastPointer = { x: 0, y: 0 };

    // Dynamic entity pools
    this.meteors = [];
    this.stars = [];
    this.clouds = [];
    this.particles = [];
    this.detachedParts = [];
    this.meteorSpawnTimer = 0;
    this.starSpawnTimer = 0;
    this.cloudSpawnTimer = 0;
    this.exhaustTimer = 0;

    this.initThree();
    this.bindEvents();

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.skyColor = new THREE.Color(0x38bdf8);
    this.scene.background = this.skyColor.clone();
    this.scene.fog = new THREE.FogExp2(0xe2e8f0, 0.0);

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 250);
    this.baseCamPos = new THREE.Vector3(0, -1.0, 15.5);
    this.camera.position.copy(this.baseCamPos);
    this.camera.lookAt(0, 2.2, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Procedural metallic environment map so Starship's 304L stainless steel gleams realistically
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1e293b);
    const skyPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide })
    );
    skyPanel.position.set(10, 12, 10);
    skyPanel.lookAt(0, 0, 0);
    envScene.add(skyPanel);
    const warmPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffedd5, side: THREE.DoubleSide })
    );
    warmPanel.position.set(-12, 4, 8);
    warmPanel.lookAt(0, 0, 0);
    envScene.add(warmPanel);
    this.scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();

    // Lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.25);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    this.sunLight.position.set(12, 16, 14);
    this.scene.add(this.sunLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    this.rimLight.position.set(-10, -4, -8);
    this.scene.add(this.rimLight);

    // Starfield
    this.starfield = createStarfield(720);
    this.scene.add(this.starfield);

    // Celestial bodies
    this.moon = createMoon();
    this.moon.position.set(0, 48, -22);
    this.moon.visible = false;
    this.scene.add(this.moon);

    this.earth = createEarth();
    this.earth.position.set(0, 56, -26);
    this.earth.visible = false;
    this.scene.add(this.earth);

    // Launchpad
    this.launchpad = createLaunchpad();
    this.scene.add(this.launchpad);

    // Rocket
    this.rocket = createRocket();
    this.rocket.root.position.set(0, 0, 0);
    this.scene.add(this.rocket.root);

    this.onResize();
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / Math.max(h, 1);
    this.camera.aspect = aspect;

    // Ensure full horizontal playfield fits cleanly on narrow mobile portrait screens
    if (aspect < 0.72) {
      this.camera.fov = 64;
      this.baseCamPos.set(0, -1.2, 18.8);
    } else if (aspect < 1.0) {
      this.camera.fov = 58;
      this.baseCamPos.set(0, -1.1, 16.8);
    } else {
      this.camera.fov = 50;
      this.baseCamPos.set(0, -1.0, 15.2);
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' && this.separationPromptActive && this.state === 'playing') {
        e.preventDefault();
        this.triggerStage1Separation(true);
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && (this.state === 'playing' || this.state === 'paused')) {
        this.togglePause();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer & Touch drag (unified across mobile touch & desktop mouse)
    const onPointerDown = (e) => {
      if (e.target.closest('button')) return;
      this.pointerActive = true;
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      this.touchHint.classList.add('hidden');
    };
    const onPointerMove = (e) => {
      if (!this.pointerActive || this.state !== 'playing') return;
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;

      // Scale screen pixels to world playfield smoothly
      const scale = (PLAY_X * 2.25) / Math.min(window.innerWidth, 720);
      this.targetPos.x = THREE.MathUtils.clamp(this.targetPos.x + dx * scale, -PLAY_X, PLAY_X);
      this.targetPos.y = THREE.MathUtils.clamp(this.targetPos.y - dy * scale * 0.85, PLAY_Y_MIN, PLAY_Y_MAX);
    };
    const onPointerUp = () => {
      this.pointerActive = false;
    };

    this.canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Buttons
    document.getElementById('btn-start').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-retry').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-play-again').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-restart-pause').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());

    document.getElementById('btn-sound').addEventListener('click', (e) => {
      const muted = this.sound.toggleMute();
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
    });

    this.btnSeparate.addEventListener('click', () => {
      if (this.separationPromptActive && this.state === 'playing') {
        this.triggerStage1Separation(true);
      }
    });
  }

  clearDynamicEntities() {
    const clearList = (arr) => {
      for (const item of arr) this.scene.remove(item.group || item.mesh || item);
      arr.length = 0;
    };
    clearList(this.meteors);
    clearList(this.stars);
    clearList(this.clouds);
    clearList(this.particles);
    clearList(this.detachedParts);
  }

  rebuildRocket() {
    if (this.rocket && this.rocket.root) {
      this.scene.remove(this.rocket.root);
    }
    this.rocket = createRocket();
    this.rocket.root.position.set(0, -1.4, 0);
    this.rocket.flame1.visible = false;
    this.rocket.flame2.visible = false;
    this.scene.add(this.rocket.root);
  }

  startNewGame() {
    this.sound.init();
    this.sound.stopEngine();

    this.clearDynamicEntities();
    this.rebuildRocket();

    // Reset launchpad & celestial bodies
    this.launchpad.position.set(0, -1.4, 0);
    this.launchpad.visible = true;

    this.moon.position.set(0, 46, -20);
    this.moon.scale.setScalar(1);
    this.moon.visible = false;

    this.earth.position.set(0, 56, -24);
    this.earth.scale.setScalar(1);
    this.earth.visible = false;

    this.skyColor.setHex(0x38bdf8);
    this.scene.background.copy(this.skyColor);
    this.starfield.material.opacity = 0;

    // Reset state
    this.progress = 0;
    this.score = 0;
    this.combo = 1.0;
    this.dodgedCount = 0;
    this.nearMissCount = 0;
    this.currentPhaseIndex = 0;
    this.stage1Separated = false;
    this.stage2Separated = false;
    this.separationPromptActive = false;
    this.lunarReached = false;
    this.parachuteDeployed = false;

    this.targetPos.set(0, -1.4);
    this.shakeIntensity = 0;
    this.meteorSpawnTimer = 1.4;
    this.starSpawnTimer = 2.0;
    this.cloudSpawnTimer = 0.2;

    // UI visibility
    this.screenStart.classList.add('hidden');
    this.screenPause.classList.add('hidden');
    this.screenGameOver.classList.add('hidden');
    this.screenVictory.classList.add('hidden');
    this.btnSeparate.classList.add('hidden');
    this.damageFlash.classList.remove('active');
    this.cloudVeilFx.classList.remove('active');
    this.cloudVeilFx.style.opacity = '0';
    this.reentryFx.classList.remove('active');
    this.reentryFx.style.opacity = '';
    this.scene.fog.density = 0;
    this.hud.classList.remove('hidden');

    // Show touch hint on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.touchHint.classList.remove('hidden');
    }

    // Start 3-second countdown
    this.state = 'countdown';
    this.countdownTimer = 2.4;
    this.lastBeepSecond = 4;
    this.updateHUD();
    this.showBanner('MISSION START', '發射倒數', 1.2);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sound.setEngineState(0.05, 120);
      this.screenPause.classList.remove('hidden');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.screenPause.classList.add('hidden');
      this.clock.getDelta(); // prevent huge dt jump
    }
  }

  showBanner(sub, title, duration = 2.4) {
    this.bannerSub.textContent = sub;
    this.bannerTitle.textContent = title;
    this.banner.classList.remove('hidden');
    this.banner.style.animation = 'none';
    void this.banner.offsetWidth;
    this.banner.style.animation = '';
    this.bannerTimer = duration;
  }

  spawnScorePopup(text, type = '') {
    const el = document.createElement('div');
    el.className = `score-popup ${type}`;
    el.textContent = text;
    // Slight horizontal offset for liveliness
    el.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
    el.style.top = `${42 + (Math.random() - 0.5) * 10}%`;
    this.popupLayer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  addScore(points, popupText = null, type = '') {
    const gained = Math.round(points * this.combo);
    this.score += gained;
    if (popupText) {
      this.spawnScorePopup(`${popupText} +${gained}`, type);
    }
  }

  triggerStage1Separation(isManual = false) {
    if (this.stage1Separated) return;
    this.stage1Separated = true;
    this.separationPromptActive = false;
    this.btnSeparate.classList.add('hidden');

    // Detach Stage 1 into scene with physics
    const worldPos = new THREE.Vector3();
    this.rocket.stage1.getWorldPosition(worldPos);
    const worldQuat = new THREE.Quaternion();
    this.rocket.stage1.getWorldQuaternion(worldQuat);

    this.rocket.root.remove(this.rocket.stage1);
    this.rocket.stage1.position.copy(worldPos);
    this.rocket.stage1.quaternion.copy(worldQuat);
    this.rocket.flame1.visible = false;
    this.scene.add(this.rocket.stage1);

    this.detachedParts.push({
      mesh: this.rocket.stage1,
      vel: new THREE.Vector3((Math.random() - 0.5) * 1.4, -7.5, -0.8),
      rot: new THREE.Vector3(0.4, 0.8, (Math.random() > 0.5 ? 1 : -1) * 1.6),
      life: 4.5,
    });

    // Ignite Stage 2 blue plasma engine
    this.rocket.flame2.visible = true;
    this.sound.playStageSeparation();
    this.shakeIntensity = 0.45;
    this.spawnBurstParticles(worldPos, 0x38bdf8, 18);

    const bonus = isManual ? 800 : 400;
    this.addScore(bonus, isManual ? '完美熱分離！' : '自動熱分離', 'milestone');
    this.showBanner('HOT-STAGING COMPLETE', 'Super Heavy 分離！Starship 進入深空', 2.4);
  }

  triggerStage2Separation() {
    if (this.stage2Separated) return;
    this.stage2Separated = true;
    // Starship keeps its full hull & heat-shield for atmospheric re-entry, cutting main vacuum engines
    this.rocket.flame2.visible = false;
    this.sound.playStageSeparation();
    this.shakeIntensity = 0.45;
  }

  spawnBurstParticles(origin, hexColor, count = 20, speedScale = 1) {
    const geo = new THREE.SphereGeometry(0.18, 6, 6);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = (2.5 + Math.random() * 6.5) * speedScale;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * spd,
          Math.sin(phi) * Math.sin(theta) * spd,
          Math.cos(phi) * spd * 0.6
        ),
        life: 0.65 + Math.random() * 0.55,
        maxLife: 1.2,
        scaleGrow: 1.4,
      });
    }
  }

  spawnExhaustParticle() {
    if (this.parachuteDeployed) return;
    const isStage2 = this.stage1Separated && !this.stage2Separated;
    const isReentry = this.stage2Separated;

    const color = isReentry ? 0xf97316 : isStage2 ? 0x38bdf8 : 0xfbbf24;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(isStage2 ? 0.14 : 0.24, 6, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 })
    );

    const yOffset = isReentry ? 1.3 : isStage2 ? -0.9 : -2.5;
    mesh.position.set(
      this.rocket.root.position.x + (Math.random() - 0.5) * 0.35,
      this.rocket.root.position.y + yOffset,
      (Math.random() - 0.5) * 0.25
    );
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.9, -9.5 - Math.random() * 4, 0),
      life: 0.35,
      maxLife: 0.35,
      scaleGrow: 2.2,
    });
  }

  spawnMeteor() {
    // Difficulty scales with mission progress
    const isReturn = this.progress >= 0.62;
    const isFiery = this.progress > 0.32 && Math.random() < (isReturn ? 0.55 : 0.35);
    const radius = isFiery ? 0.68 + Math.random() * 0.35 : 0.78 + Math.random() * 0.52;

    const m = createMeteor(isFiery, radius);
    // Aim ~35% of meteors near the player's X so dodging stays active & exciting
    const aimed = Math.random() < 0.38;
    const x = aimed
      ? THREE.MathUtils.clamp(this.rocket.root.position.x + (Math.random() - 0.5) * 2.2, -PLAY_X, PLAY_X)
      : (Math.random() * 2 - 1) * (PLAY_X + 0.3);

    m.group.position.set(x, 18.5 + Math.random() * 3.0, 0);
    this.scene.add(m.group);

    const baseSpeed = 9.5 + this.progress * 7.5 + (isFiery ? 3.5 : 0);
    this.meteors.push({
      ...m,
      vx: (Math.random() - 0.5) * (isReturn ? 2.4 : 1.3),
      vy: -baseSpeed,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5
      ),
      minDist: 999,
      passed: false,
    });
  }

  spawnStar() {
    const s = createStarPickup();
    const x = (Math.random() * 2 - 1) * (PLAY_X - 0.4);
    s.group.position.set(x, 18.5, 0);
    this.scene.add(s.group);

    this.stars.push({
      ...s,
      vy: -8.5 - this.progress * 3.5,
    });
  }

  spawnCloud(isForeground = false) {
    const c = createCloudCluster(isForeground);
    const side = isForeground
      ? (Math.random() * 2 - 1) * 7.5
      : (Math.random() * 2 - 1) * 14;
    const z = isForeground
      ? 2.2 + Math.random() * 5.2
      : -3.5 - Math.random() * 11;
    c.position.set(side, 18 + Math.random() * 5, z);
    this.scene.add(c);
    this.clouds.push({
      group: c,
      vy: isForeground ? -17 - Math.random() * 7 : -12 - Math.random() * 6,
    });
  }

  spawnAtmosphericFireSpark(intensity = 1) {
    const color = Math.random() < 0.45 ? 0xfef08a : 0xff5500;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.55 + Math.random() * 0.55, 0.06),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9 * intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const angle = Math.random() * Math.PI * 2;
    const rad = 0.35 + Math.random() * 0.55;
    mesh.position.set(
      this.rocket.root.position.x + Math.cos(angle) * rad,
      this.rocket.root.position.y + 2.1 + Math.random() * 0.6,
      Math.sin(angle) * rad * 0.5
    );
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      vel: new THREE.Vector3(
        Math.cos(angle) * (1.2 + Math.random() * 2.2),
        -15 - Math.random() * 9,
        (Math.random() - 0.5) * 1.5
      ),
      life: 0.28 + Math.random() * 0.18,
      maxLife: 0.46,
      scaleGrow: 0.3,
    });
  }

  triggerDeath() {
    this.state = 'exploding';
    this.explodeTimer = 1.15;
    this.sound.stopEngine();
    this.sound.playExplosion();
    this.shakeIntensity = 0.95;

    this.damageFlash.classList.add('active');
    this.btnSeparate.classList.add('hidden');
    this.cloudVeilFx.classList.remove('active');
    this.cloudVeilFx.style.opacity = '0';
    this.reentryFx.classList.remove('active');
    this.reentryFx.style.opacity = '';
    this.scene.fog.density = 0;

    const pos = this.rocket.root.position.clone();
    pos.y += this.stage1Separated ? 1.1 : 0.3;
    this.spawnBurstParticles(pos, 0xff5500, 32, 1.35);
    this.spawnBurstParticles(pos, 0xfef08a, 18, 1.0);
    this.rocket.root.visible = false;

    this.saveBestScore();
  }

  saveBestScore() {
    const intScore = Math.floor(this.score);
    if (intScore > this.bestScore) {
      this.bestScore = intScore;
      localStorage.setItem(STORAGE_BEST_KEY, String(this.bestScore));
    }
  }

  showGameOver() {
    this.state = 'gameover';
    this.hud.classList.add('hidden');
    this.damageFlash.classList.remove('active');

    document.getElementById('go-score').textContent = Math.floor(this.score).toLocaleString();
    document.getElementById('go-best').textContent = this.bestScore.toLocaleString();
    document.getElementById('go-phase').textContent = PHASES[this.currentPhaseIndex].label.replace(/^.+：/, '');
    document.getElementById('go-dodged').textContent = String(this.dodgedCount);
    document.getElementById('start-best-score').textContent = this.bestScore.toLocaleString();

    this.screenGameOver.classList.remove('hidden');
  }

  showVictory() {
    this.state = 'victory';
    this.sound.stopEngine();
    this.sound.playVictoryFanfare();
    this.addScore(3000);
    this.saveBestScore();

    this.hud.classList.add('hidden');
    this.cloudVeilFx.classList.remove('active');
    this.cloudVeilFx.style.opacity = '0';
    this.reentryFx.classList.remove('active');
    this.reentryFx.style.opacity = '0';
    this.scene.fog.density = 0;

    let rank = 'RANK B';
    if (this.score >= 16000) rank = 'RANK S+';
    else if (this.score >= 12000) rank = 'RANK S';
    else if (this.score >= 8500) rank = 'RANK A';

    document.getElementById('vic-rank').textContent = rank;
    document.getElementById('vic-score').textContent = Math.floor(this.score).toLocaleString();
    document.getElementById('vic-best').textContent = this.bestScore.toLocaleString();
    document.getElementById('vic-dodged').textContent = String(this.dodgedCount);
    document.getElementById('vic-nearmiss').textContent = String(this.nearMissCount);
    document.getElementById('start-best-score').textContent = this.bestScore.toLocaleString();

    this.screenVictory.classList.remove('hidden');
  }

  updatePhaseLogic(dt) {
    // Determine active phase index
    let newIdx = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (this.progress >= PHASES[i].start) {
        newIdx = i;
        break;
      }
    }

    if (newIdx !== this.currentPhaseIndex) {
      this.currentPhaseIndex = newIdx;
      const phase = PHASES[newIdx];

      if (phase.id === 'atmosphere') {
        this.sound.playMilestone();
        this.addScore(500, '突破雲層', 'milestone');
        this.showBanner('PHASE 2', '通過大氣層', 2.2);
      } else if (phase.id === 'separation') {
        this.separationPromptActive = true;
        this.btnSeparate.classList.remove('hidden');
        this.showBanner('PHASE 3', '準備火箭分離！', 2.2);
      } else if (phase.id === 'lunar') {
        this.sound.playMilestone();
        this.moon.visible = true;
        this.showBanner('PHASE 4', '接近月球軌道', 2.4);
      } else if (phase.id === 'return') {
        this.earth.visible = true;
        this.combo = Math.max(this.combo, 2.0);
        this.showBanner('PHASE 5 · 2x SCORE', '返航衝刺：返回地球！', 2.5);
      } else if (phase.id === 'reentry') {
        this.triggerStage2Separation();
        this.showBanner('PHASE 6 · HIGH HEAT', '重返大氣層！隔熱瓦防熱火光', 2.6);
      } else if (phase.id === 'splashdown') {
        this.parachuteDeployed = true;
        this.rocket.parachute.visible = true;
        this.sound.playMilestone();
        this.showBanner('PHASE 7', '降落傘開啟・安全返航', 2.5);
      }
    }

    // Auto-trigger Stage 1 separation if player hasn't clicked by 0.39
    if (this.separationPromptActive && this.progress >= 0.39) {
      this.triggerStage1Separation(false);
    }

    // Trigger Lunar Touchdown Checkpoint at 0.595
    if (!this.lunarReached && this.progress >= 0.595) {
      this.lunarReached = true;
      this.state = 'lunar_pause';
      this.lunarHoldTimer = 2.4;
      this.sound.playMilestone();
      this.sound.setEngineState(0.12, 140);
      this.addScore(1500, '🌕 成功登陸月球！', 'milestone');
      this.showBanner('LUNAR TOUCHDOWN', '抵達月球！準備返航地球', 2.4);
      // Clear active meteors for clean cinematic landing
      for (const m of this.meteors) this.scene.remove(m.group);
      this.meteors.length = 0;
    }

    // Victory at 1.0
    if (this.progress >= 1.0) {
      this.showVictory();
    }
  }

  updateEnvironment(dt) {
    // Sky & Starfield transitions across the round-trip mission
    const blueSky = new THREE.Color(0x38bdf8);
    const highSky = new THREE.Color(0x1d4ed8);
    const spaceBlack = new THREE.Color(0x040712);
    const reentryGlow = new THREE.Color(0x9a3412);

    let starOpacity = 0;
    if (this.progress < 0.16) {
      this.skyColor.copy(blueSky);
    } else if (this.progress < 0.28) {
      const t = (this.progress - 0.16) / 0.12;
      this.skyColor.copy(blueSky).lerp(highSky, t);
      starOpacity = t * 0.35;
    } else if (this.progress < 0.38) {
      const t = (this.progress - 0.28) / 0.10;
      this.skyColor.copy(highSky).lerp(spaceBlack, t);
      starOpacity = 0.35 + t * 0.65;
    } else if (this.progress < 0.82) {
      this.skyColor.copy(spaceBlack);
      starOpacity = 1.0;
    } else if (this.progress < 0.90) {
      const t = (this.progress - 0.82) / 0.08;
      this.skyColor.copy(spaceBlack).lerp(reentryGlow, t);
      starOpacity = 1.0 - t;
    } else {
      const t = Math.min(1, (this.progress - 0.90) / 0.08);
      this.skyColor.copy(reentryGlow).lerp(blueSky, t);
      starOpacity = 0;
    }

    this.scene.background.copy(this.skyColor);
    this.starfield.material.opacity = starOpacity;

    // Scroll starfield downward
    const pos = this.starfield.geometry.attributes.position;
    const starSpeed = 14 + this.progress * 10;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - starSpeed * dt;
      if (y < -55) y = 55;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    // Launchpad drops away on liftoff
    if (this.launchpad.visible && this.state === 'playing') {
      this.launchpad.position.y -= 15 * dt;
      if (this.launchpad.position.y < -30) {
        this.launchpad.visible = false;
      }
    }

    // Moon approach & departure
    if (this.moon.visible) {
      this.moon.rotation.y += 0.12 * dt;
      if (this.progress < 0.62) {
        const t = THREE.MathUtils.clamp((this.progress - 0.48) / 0.115, 0, 1);
        this.moon.position.y = THREE.MathUtils.lerp(42, 13.5, t);
        this.moon.position.z = THREE.MathUtils.lerp(-24, -14, t);
      } else {
        this.moon.position.y -= 14 * dt;
        if (this.moon.position.y < -36) this.moon.visible = false;
      }
    }

    // Earth approach on return leg
    if (this.earth.visible) {
      this.earth.rotation.y += 0.15 * dt;
      const t = THREE.MathUtils.clamp((this.progress - 0.62) / 0.36, 0, 1);
      this.earth.position.y = THREE.MathUtils.lerp(50, 14, t);
      this.earth.position.z = THREE.MathUtils.lerp(-30, -16, t);
    }

    // === Atmospheric Fire Glow (Ascent Breakthrough 0.20..0.33 + Re-entry 0.82..0.94) ===
    let fireIntensity = 0;
    if (this.progress >= 0.20 && this.progress <= 0.33) {
      // Smooth bell curve peaking at 0.265 during supersonic atmosphere breakthrough
      fireIntensity = Math.sin(((this.progress - 0.20) / 0.13) * Math.PI) * 0.88;
    } else if (this.stage2Separated && !this.parachuteDeployed && this.progress >= 0.82 && this.progress <= 0.94) {
      fireIntensity = 0.95;
    }

    if (fireIntensity > 0.04) {
      const flicker = 0.78 + Math.sin(performance.now() * 0.035) * 0.22;
      this.rocket.plasmaOuterMat.opacity = fireIntensity * 0.68 * flicker;
      this.rocket.plasmaInnerMat.opacity = fireIntensity * 0.55 * flicker;
      this.rocket.fireLight.intensity = fireIntensity * 6.5 * flicker;
      this.shakeIntensity = Math.max(this.shakeIntensity, fireIntensity * 0.16);

      // Screen-edge fiery atmospheric glow
      this.reentryFx.classList.add('active');
      this.reentryFx.style.opacity = String((fireIntensity * 0.72).toFixed(2));

      // Streaming glowing sparks whipping off the nosecone & flaps
      if (this.state === 'playing' && Math.random() < fireIntensity * 0.85) {
        this.spawnAtmosphericFireSpark(fireIntensity);
      }
    } else {
      this.rocket.plasmaOuterMat.opacity = 0;
      this.rocket.plasmaInnerMat.opacity = 0;
      this.rocket.fireLight.intensity = 0;
      this.reentryFx.classList.remove('active');
      this.reentryFx.style.opacity = '0';
    }

    // === Cloud-Veil Obstruction & Atmospheric Fog (Ascent 0.12..0.25 + Return 0.89..0.98) ===
    let cloudVeilStrength = 0;
    if (this.progress >= 0.12 && this.progress <= 0.25) {
      cloudVeilStrength = Math.sin(((this.progress - 0.12) / 0.13) * Math.PI);
    } else if (this.progress >= 0.89 && this.progress <= 0.98) {
      cloudVeilStrength = Math.sin(((this.progress - 0.89) / 0.09) * Math.PI) * 0.8;
    }

    if (cloudVeilStrength > 0.03) {
      this.scene.fog.color.setHex(0xe2e8f0);
      this.scene.fog.density = cloudVeilStrength * 0.028;
      this.cloudVeilFx.classList.add('active');
      this.cloudVeilFx.style.opacity = String((cloudVeilStrength * 0.72).toFixed(2));
    } else {
      this.scene.fog.density = 0;
      this.cloudVeilFx.classList.remove('active');
      this.cloudVeilFx.style.opacity = '0';
    }

    // Clouds during launch atmosphere (0.04..0.27) and return descent (0.89..1.0)
    const inClouds = (this.progress > 0.03 && this.progress < 0.27) || this.progress > 0.89;
    if (inClouds && this.state === 'playing') {
      this.cloudSpawnTimer -= dt;
      if (this.cloudSpawnTimer <= 0) {
        // Spawn foreground obscuring cloud banks during dense cloud-veil breakthrough!
        const spawnForeground = cloudVeilStrength > 0.25 && Math.random() < 0.52;
        this.spawnCloud(spawnForeground);
        this.cloudSpawnTimer = cloudVeilStrength > 0.25 ? 0.12 + Math.random() * 0.12 : 0.24 + Math.random() * 0.22;
      }
    }
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.group.position.y += c.vy * dt;
      if (c.group.position.y < -22) {
        this.scene.remove(c.group);
        this.clouds.splice(i, 1);
      }
    }
  }

  updateRocketControl(dt) {
    const moveSpeed = this.stage1Separated ? 11.2 : 9.4;
    let dx = 0;
    let dy = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy += 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy -= 1;

    if (dx !== 0 || dy !== 0) {
      this.targetPos.x = THREE.MathUtils.clamp(this.targetPos.x + dx * moveSpeed * dt, -PLAY_X, PLAY_X);
      this.targetPos.y = THREE.MathUtils.clamp(this.targetPos.y + dy * moveSpeed * 0.7 * dt, PLAY_Y_MIN, PLAY_Y_MAX);
    }

    // Smoothly interpolate rocket position
    const lerpFactor = Math.min(1, dt * 13);
    const prevX = this.rocket.root.position.x;
    this.rocket.root.position.x = THREE.MathUtils.lerp(prevX, this.targetPos.x, lerpFactor);
    this.rocket.root.position.y = THREE.MathUtils.lerp(this.rocket.root.position.y, this.targetPos.y, lerpFactor);

    // Dynamic 3D banking/tilting & Starship aero-flap actuation
    const velX = (this.rocket.root.position.x - prevX) / Math.max(dt, 0.001);
    const targetTiltZ = THREE.MathUtils.clamp(-velX * 0.045, -0.42, 0.42);
    const targetRotY = THREE.MathUtils.clamp(velX * 0.035, -0.35, 0.35);
    this.rocket.root.rotation.z = THREE.MathUtils.lerp(this.rocket.root.rotation.z, targetTiltZ, Math.min(1, dt * 10));
    this.rocket.root.rotation.y = THREE.MathUtils.lerp(this.rocket.root.rotation.y, targetRotY, Math.min(1, dt * 10));

    if (this.rocket.flaps) {
      const flare = this.stage2Separated && !this.parachuteDeployed ? 0.38 : 0.08;
      const steer = THREE.MathUtils.clamp(velX * 0.025, -0.25, 0.25);
      this.rocket.flaps[0].rotation.y = flare + steer;
      this.rocket.flaps[1].rotation.y = -flare + steer;
      this.rocket.flaps[2].rotation.y = flare * 0.8 - steer;
      this.rocket.flaps[3].rotation.y = -flare * 0.8 - steer;
    }

    // Animate engine flames
    const flicker = 0.85 + Math.random() * 0.35;
    if (this.rocket.flame1.visible) {
      this.rocket.flame1.scale.set(1, flicker, 1);
    }
    if (this.rocket.flame2.visible) {
      this.rocket.flame2.scale.set(1, flicker, 1);
    }
    if (this.parachuteDeployed) {
      this.rocket.root.rotation.z = Math.sin(performance.now() * 0.003) * 0.12;
    }

    // Exhaust particles
    this.exhaustTimer -= dt;
    if (this.exhaustTimer <= 0) {
      this.spawnExhaustParticle();
      this.exhaustTimer = 0.035;
    }
  }

  updateObstaclesAndPickups(dt) {
    // Only spawn meteors during active flight segments (not during final parachute splashdown)
    const canSpawnMeteors = this.progress > 0.05 && this.progress < 0.92 && (this.progress < 0.57 || this.progress > 0.63);
    if (canSpawnMeteors) {
      this.meteorSpawnTimer -= dt;
      if (this.meteorSpawnTimer <= 0) {
        this.spawnMeteor();
        // Spawn rate intensifies in space and on the return leg
        const minInterval = this.progress > 0.62 ? 0.34 : this.progress > 0.33 ? 0.44 : 0.72;
        this.meteorSpawnTimer = minInterval + Math.random() * 0.36;
      }
    }

    if (this.progress > 0.08 && this.progress < 0.90) {
      this.starSpawnTimer -= dt;
      if (this.starSpawnTimer <= 0) {
        this.spawnStar();
        this.starSpawnTimer = 2.6 + Math.random() * 2.0;
      }
    }

    // Rocket collision center (adapts as lower stages detach!)
    const rocketCenterX = this.rocket.root.position.x;
    const rocketCenterY = this.rocket.root.position.y + (this.stage2Separated ? 1.8 : this.stage1Separated ? 1.15 : 0.35);
    const rocketHitRadius = this.stage2Separated ? 0.42 : this.stage1Separated ? 0.52 : 0.62;

    // Update Meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.group.position.x += m.vx * dt;
      m.group.position.y += m.vy * dt;
      m.rock.rotation.x += m.rotSpeed.x * dt;
      m.rock.rotation.y += m.rotSpeed.y * dt;
      m.rock.rotation.z += m.rotSpeed.z * dt;
      m.ring.rotation.z += 2.2 * dt;

      // Distance check on X-Y plane
      const dx = m.group.position.x - rocketCenterX;
      const dy = m.group.position.y - rocketCenterY;
      const dist = Math.hypot(dx, dy);
      if (dist < m.minDist) m.minDist = dist;

      // Deadly collision check
      if (dist < m.radius * 0.74 + rocketHitRadius) {
        this.triggerDeath();
        return;
      }

      // Track successful dodges & near misses
      if (!m.passed && m.group.position.y < rocketCenterY - 1.2) {
        m.passed = true;
        this.dodgedCount++;
        if (m.minDist < m.radius + rocketHitRadius + 1.15) {
          this.nearMissCount++;
          this.combo = Math.min(4.0, +(this.combo + 0.15).toFixed(2));
          this.sound.playNearMiss();
          this.addScore(150, '極限閃避!', 'near-miss');
        } else {
          this.addScore(35);
        }
      }

      if (m.group.position.y < -14) {
        this.scene.remove(m.group);
        this.meteors.splice(i, 1);
      }
    }

    // Update Energy Stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.group.position.y += s.vy * dt;
      s.core.rotation.y += 2.8 * dt;
      s.core.rotation.x += 1.6 * dt;
      s.halo.rotation.x += 3.2 * dt;

      const dist = Math.hypot(s.group.position.x - rocketCenterX, s.group.position.y - rocketCenterY);
      if (dist < 1.35) {
        this.sound.playCollectStar();
        this.combo = Math.min(4.0, +(this.combo + 0.25).toFixed(2));
        this.addScore(250, '⭐ 能量星', '');
        this.spawnBurstParticles(s.group.position, 0xfde047, 10, 0.7);
        this.scene.remove(s.group);
        this.stars.splice(i, 1);
        continue;
      }

      if (s.group.position.y < -14) {
        this.scene.remove(s.group);
        this.stars.splice(i, 1);
      }
    }
  }

  updateParticlesAndDebris(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.mesh.position.addScaledVector(p.vel, dt);
      const ratio = p.life / p.maxLife;
      p.mesh.material.opacity = ratio;
      p.mesh.scale.setScalar(1 + (1 - ratio) * p.scaleGrow);
    }

    for (let i = this.detachedParts.length - 1; i >= 0; i--) {
      const d = this.detachedParts[i];
      d.life -= dt;
      d.mesh.position.addScaledVector(d.vel, dt);
      d.mesh.rotation.x += d.rot.x * dt;
      d.mesh.rotation.y += d.rot.y * dt;
      d.mesh.rotation.z += d.rot.z * dt;
      if (d.life <= 0) {
        this.scene.remove(d.mesh);
        this.detachedParts.splice(i, 1);
      }
    }
  }

  updateHUD() {
    this.scoreVal.textContent = Math.floor(this.score).toLocaleString();
    this.comboVal.textContent = `x${this.combo.toFixed(1)}`;
    this.phaseBadge.textContent = PHASES[this.currentPhaseIndex].label;

    const pct = Math.min(100, Math.max(0, this.progress * 100));
    this.progressFill.style.width = `${pct}%`;
    this.trackRocket.style.left = `${pct}%`;

    // Distance from Earth (peaks at 384,400 km at Moon = 60% progress, returns to 0 km at 100%)
    let km = 0;
    if (this.progress <= 0.6) {
      km = Math.round((this.progress / 0.6) * 384400);
    } else {
      km = Math.round(((1 - this.progress) / 0.4) * 384400);
    }
    const speed = this.parachuteDeployed
      ? 0.08
      : this.state === 'lunar_pause'
      ? 0
      : (2.2 + Math.sin(this.progress * Math.PI) * 9.0);

    this.altitudeVal.textContent = `距地球 ${km.toLocaleString()} km`;
    this.speedVal.textContent = `${speed.toFixed(1)} km/s`;
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Banner auto-hide
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.banner.classList.add('hidden');
      }
    }

    if (this.state === 'menu') {
      // Gentle idle showcase on the launchpad
      this.rocket.root.rotation.y += 0.35 * dt;
      this.rocket.root.position.y = -1.35 + Math.sin(performance.now() * 0.002) * 0.06;
    } else if (this.state === 'countdown') {
      this.countdownTimer -= dt;
      const sec = Math.ceil(this.countdownTimer / 0.8);
      if (sec < this.lastBeepSecond && sec >= 1) {
        this.lastBeepSecond = sec;
        this.sound.playCountdownBeep(false);
        this.showBanner('T-MINUS', String(sec), 0.75);
      }

      // Pre-ignition rumble & smoke
      this.shakeIntensity = 0.08;
      if (Math.random() < 0.45) {
        this.spawnBurstParticles(new THREE.Vector3(0, -3.5, 0), 0xe2e8f0, 1, 0.5);
      }

      if (this.countdownTimer <= 0) {
        this.state = 'playing';
        this.rocket.flame1.visible = true;
        this.sound.playCountdownBeep(true);
        this.sound.playIgnitionRoar();
        this.sound.startEngine();
        this.sound.setEngineState(0.85, 340);
        this.shakeIntensity = 0.55;
        this.showBanner('LIFTOFF!', '點火升空！', 2.0);
      }
      this.updateParticlesAndDebris(dt);
    } else if (this.state === 'lunar_pause') {
      this.lunarHoldTimer -= dt;
      this.updateEnvironment(dt);
      this.updateParticlesAndDebris(dt);
      // Gentle hover near Moon
      this.rocket.root.position.x = THREE.MathUtils.lerp(this.rocket.root.position.x, 0, dt * 3);
      this.rocket.root.position.y = THREE.MathUtils.lerp(this.rocket.root.position.y, 0.4, dt * 3);
      this.rocket.root.rotation.z = THREE.MathUtils.lerp(this.rocket.root.rotation.z, 0, dt * 5);

      if (this.lunarHoldTimer <= 0) {
        this.state = 'playing';
        this.progress = 0.62;
        this.sound.playIgnitionRoar();
        this.sound.setEngineState(0.75, 420);
        this.shakeIntensity = 0.4;
      }
      this.updateHUD();
    } else if (this.state === 'playing') {
      // Advance mission progress (~78 seconds full round trip)
      const progressRate = this.parachuteDeployed ? 0.014 : 0.0128;
      this.progress = Math.min(1.0, this.progress + progressRate * dt);
      this.score += dt * 45 * this.combo;

      // Dynamic engine sound modulation
      const engineCutoff = this.parachuteDeployed ? 90 : this.stage1Separated ? 420 : 280;
      const enginePower = this.parachuteDeployed ? 0.08 : 0.65;
      this.sound.setEngineState(enginePower, engineCutoff);

      this.updatePhaseLogic(dt);
      if (this.state === 'playing') {
        this.updateRocketControl(dt);
        this.updateEnvironment(dt);
        this.updateObstaclesAndPickups(dt);
        this.updateParticlesAndDebris(dt);
        this.updateHUD();
      }
    } else if (this.state === 'exploding') {
      this.explodeTimer -= dt;
      this.updateParticlesAndDebris(dt);
      if (this.explodeTimer <= 0) {
        this.showGameOver();
      }
    }

    // Apply camera shake
    if (this.shakeIntensity > 0.005) {
      this.camera.position.set(
        this.baseCamPos.x + (Math.random() - 0.5) * this.shakeIntensity,
        this.baseCamPos.y + (Math.random() - 0.5) * this.shakeIntensity,
        this.baseCamPos.z
      );
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 1.4);
    } else {
      this.camera.position.copy(this.baseCamPos);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new LunarRocketGame();
});
