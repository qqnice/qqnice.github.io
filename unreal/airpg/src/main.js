/**
 * main.js — 遊戲主迴圈、狀態機管理、鍵盤控制與復古對話框系統
 */

import { buildSpriteAtlas } from './sprites.js';
import { createWorld, TILE_SIZE, MAP_COLS, MAP_ROWS } from './world.js';
import { ethicsState } from './ethicsState.js';
import { auditLens } from './auditLens.js';
import { audio } from './audio.js';

const GAME_STATE = {
  EXPLORE: 'EXPLORE',
  DIALOGUE: 'DIALOGUE',
  AUDIT_LOG: 'AUDIT_LOG',
  TOS_MODAL: 'TOS_MODAL',
  PROMPT_BATTLE: 'PROMPT_BATTLE',
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// DOM 參考
const hudLocationEl = document.getElementById('hud-location');
const hudGoldEl = document.getElementById('hud-gold');
const hudStatusBadgeEl = document.getElementById('hud-status-badge');
const toastStackEl = document.getElementById('metric-toast-stack');

const dialogueBoxEl = document.getElementById('dialogue-box');
const dialogueSpeakerEl = document.getElementById('dialogue-speaker');
const dialogueRoleEl = document.getElementById('dialogue-role');
const dialogueTextEl = document.getElementById('dialogue-text');
const dialogueHintEl = document.getElementById('dialogue-hint');

const auditLogModalEl = document.getElementById('audit-log-modal');
const btnAuditLog = document.getElementById('btn-audit-log');
const btnCloseLog = document.getElementById('btn-close-log');
const btnMute = document.getElementById('btn-mute');

// 初始化圖庫與世界
const sprites = buildSpriteAtlas();
const world = createWorld(sprites);

let currentState = GAME_STATE.EXPLORE;

// 玩家狀態（出生在南門外道路中央）
const player = {
  x: 12.5 * TILE_SIZE,
  y: 16 * TILE_SIZE,
  w: TILE_SIZE,
  h: TILE_SIZE,
  baseSpeed: 185, // px / sec
  dir: 'up',
  moving: false,
  animTimer: 0,
};

// 相機視角
const camera = {
  x: 0,
  y: 0,
  w: canvas.width,
  h: canvas.height,
};

// 按鍵追蹤
const keys = new Set();

// 對話框狀態機（含打字機效果）
const dialogue = {
  speaker: '',
  role: '',
  pages: [],
  pageIndex: 0,
  charIndex: 0,
  typingTimer: 0,
  charsPerSec: 42,
  onComplete: null,
};

/* =========================================================
   HUD 與審計日誌更新
   ========================================================= */

function showToast(text, tone = 'info') {
  const el = document.createElement('div');
  el.className = `metric-toast ${tone}`;
  el.textContent = text;
  toastStackEl.appendChild(el);
  setTimeout(() => el.remove(), 2650);
}

function syncHUD() {
  hudGoldEl.textContent = String(ethicsState.gold);
  if (ethicsState.flags.dataExposed) {
    hudStatusBadgeEl.textContent = '⚠️ Data_Exposed';
    hudStatusBadgeEl.classList.add('exposed');
  } else {
    hudStatusBadgeEl.textContent = '🛡️ 隱私完整';
    hudStatusBadgeEl.classList.remove('exposed');
  }
}

function renderAuditLogModal() {
  const { utility, privacy, security } = ethicsState.metrics;
  document.getElementById('bar-utility').style.width = `${utility}%`;
  document.getElementById('val-utility').textContent = String(utility);
  document.getElementById('bar-privacy').style.width = `${privacy}%`;
  document.getElementById('val-privacy').textContent = String(privacy);
  document.getElementById('bar-security').style.width = `${security}%`;
  document.getElementById('val-security').textContent = String(security);

  const flagsEl = document.getElementById('audit-flags');
  flagsEl.innerHTML = '';

  const flagItems = [
    {
      text: ethicsState.flags.tosSigned ? '契約：已簽署' : '契約：尚未簽署',
      cls: ethicsState.flags.tosSigned ? 'safe' : '',
    },
    {
      text: ethicsState.flags.dataExposed ? '狀態：Data_Exposed（個資已共享）' : '狀態：隱私未外洩',
      cls: ethicsState.flags.dataExposed ? 'warn' : 'safe',
    },
    {
      text: `移動倍率：${ethicsState.speedMultiplier.toFixed(2)}x`,
      cls: '',
    },
  ];

  for (const item of flagItems) {
    const span = document.createElement('span');
    span.className = `flag-badge ${item.cls}`;
    span.textContent = item.text;
    flagsEl.appendChild(span);
  }

  const listEl = document.getElementById('audit-log-list');
  listEl.innerHTML = '';
  for (const entry of ethicsState.logs) {
    const li = document.createElement('li');
    li.textContent = `[${entry.time}] ${entry.text}`;
    listEl.appendChild(li);
  }
}

ethicsState.subscribe((event) => {
  syncHUD();
  if (event.type === 'metric') {
    const labels = { utility: '系統效能', privacy: '隱私保護', security: '資安防禦' };
    const sign = event.delta > 0 ? '+' : '';
    showToast(`${labels[event.key]} ${sign}${event.delta}`, event.delta > 0 ? 'positive' : 'negative');
  }
});

/* =========================================================
   對話框系統
   ========================================================= */

function openDialogue(speaker, role, pages, onComplete = null) {
  dialogue.speaker = speaker;
  dialogue.role = role || '';
  dialogue.pages = Array.isArray(pages) ? pages : [String(pages)];
  dialogue.pageIndex = 0;
  dialogue.charIndex = 0;
  dialogue.typingTimer = 0;
  dialogue.onComplete = onComplete;

  dialogueSpeakerEl.textContent = dialogue.speaker;
  dialogueRoleEl.textContent = dialogue.role;
  dialogueTextEl.textContent = '';
  dialogueHintEl.textContent = '▼ 按 Space / E 繼續';

  dialogueBoxEl.classList.remove('hidden');
  currentState = GAME_STATE.DIALOGUE;
  audio.playConfirm();
}

function advanceDialogue() {
  const fullText = dialogue.pages[dialogue.pageIndex] || '';
  if (dialogue.charIndex < fullText.length) {
    // 若尚未打字完畢，先瞬間補齊當前頁
    dialogue.charIndex = fullText.length;
    dialogueTextEl.textContent = fullText;
    return;
  }

  if (dialogue.pageIndex + 1 < dialogue.pages.length) {
    dialogue.pageIndex += 1;
    dialogue.charIndex = 0;
    dialogue.typingTimer = 0;
    dialogueTextEl.textContent = '';
    audio.playConfirm();
  } else {
    // 結束對話
    dialogueBoxEl.classList.add('hidden');
    currentState = GAME_STATE.EXPLORE;
    audio.playCancel();
    if (typeof dialogue.onComplete === 'function') {
      const cb = dialogue.onComplete;
      dialogue.onComplete = null;
      cb();
    }
  }
}

function updateDialogue(dt) {
  const fullText = dialogue.pages[dialogue.pageIndex] || '';
  if (dialogue.charIndex >= fullText.length) {
    dialogueHintEl.textContent =
      dialogue.pageIndex + 1 < dialogue.pages.length
        ? '▼ 按 Space / E 繼續'
        : '■ 按 Space / E 關閉';
    return;
  }

  dialogue.typingTimer += dt;
  const targetChars = Math.min(
    fullText.length,
    Math.floor(dialogue.typingTimer * dialogue.charsPerSec)
  );
  if (targetChars > dialogue.charIndex) {
    dialogue.charIndex = targetChars;
    dialogueTextEl.textContent = fullText.slice(0, dialogue.charIndex);
    if (dialogue.charIndex % 3 === 0) {
      audio.playBlip(540);
    }
  }
}

/* =========================================================
   審計日誌彈窗切換
   ========================================================= */

function toggleAuditLog() {
  if (currentState === GAME_STATE.AUDIT_LOG) {
    auditLogModalEl.classList.add('hidden');
    currentState = GAME_STATE.EXPLORE;
    audio.playCancel();
  } else if (currentState === GAME_STATE.EXPLORE) {
    renderAuditLogModal();
    auditLogModalEl.classList.remove('hidden');
    currentState = GAME_STATE.AUDIT_LOG;
    audio.playOpenModal();
  }
}

btnAuditLog.addEventListener('click', toggleAuditLog);
btnCloseLog.addEventListener('click', toggleAuditLog);

btnMute.addEventListener('click', () => {
  const muted = audio.toggleMute();
  btnMute.textContent = muted ? '🔇 靜音' : '🔊 音效';
});

/* =========================================================
   鍵盤事件監聽
   ========================================================= */

window.addEventListener('keydown', (e) => {
  const code = e.code;

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(code)) {
    e.preventDefault();
  }

  if (code === 'Tab') {
    if (!e.repeat) toggleAuditLog();
    return;
  }

  if (code === 'Escape' && currentState === GAME_STATE.AUDIT_LOG) {
    toggleAuditLog();
    return;
  }

  if (currentState === GAME_STATE.DIALOGUE) {
    if ((code === 'Space' || code === 'KeyE' || code === 'Enter') && !e.repeat) {
      advanceDialogue();
    }
    return;
  }

  if (currentState === GAME_STATE.EXPLORE) {
    keys.add(code);

    if ((code === 'Space' || code === 'KeyE') && !e.repeat) {
      const target = world.findNearbyInteractable(player);
      if (target) {
        openDialogue(target.name, target.role, target.getDialogue(ethicsState));
      } else {
        audio.playBlocked();
      }
    }

    if (code === 'KeyV' && !e.repeat) {
      auditLens.toggle();
      audio.playOpenModal();
      showToast('審計者之眼濾鏡將於 Step 3 啟用！', 'info');
    }
  }
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

window.addEventListener('blur', () => {
  keys.clear();
});

/* =========================================================
   移動、碰撞與相機更新
   ========================================================= */

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;

  if (dx === 0 && dy === 0) {
    player.moving = false;
    player.animTimer = 0;
    return;
  }

  // 更新面朝方向
  if (Math.abs(dx) > Math.abs(dy)) {
    player.dir = dx < 0 ? 'left' : 'right';
  } else {
    player.dir = dy < 0 ? 'up' : 'down';
  }

  // 斜向移動正規化
  const len = Math.hypot(dx, dy);
  dx /= len;
  dy /= len;

  const speed = player.baseSpeed * ethicsState.speedMultiplier;
  const stepX = dx * speed * dt;
  const stepY = dy * speed * dt;

  // 腳部碰撞盒（比角色貼圖略窄略矮，過門與繞轉角更流暢）
  const hitOffsetX = 11;
  const hitOffsetY = 24;
  const hitW = player.w - 22;
  const hitH = player.h - 26;

  let moved = false;

  // 分軸碰撞偵測，支援沿牆滑動
  if (stepX !== 0) {
    const nextX = player.x + stepX;
    if (!world.isSolidRect(nextX + hitOffsetX, player.y + hitOffsetY, hitW, hitH)) {
      player.x = nextX;
      moved = true;
    }
  }

  if (stepY !== 0) {
    const nextY = player.y + stepY;
    if (!world.isSolidRect(player.x + hitOffsetX, nextY + hitOffsetY, hitW, hitH)) {
      player.y = nextY;
      moved = true;
    }
  }

  player.moving = moved;
  if (moved) {
    player.animTimer += dt;
    audio.playStep();
  }
}

function updateCamera() {
  const worldW = MAP_COLS * TILE_SIZE;
  const worldH = MAP_ROWS * TILE_SIZE;

  const targetX = player.x + player.w / 2 - camera.w / 2;
  const targetY = player.y + player.h / 2 - camera.h / 2;

  camera.x = Math.max(0, Math.min(worldW - camera.w, targetX));
  camera.y = Math.max(0, Math.min(worldH - camera.h, targetY));
}

/* =========================================================
   主遊戲迴圈 (60 FPS)
   ========================================================= */

let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  const timeSec = now / 1000;

  if (currentState === GAME_STATE.EXPLORE) {
    updatePlayer(dt);
  } else if (currentState === GAME_STATE.DIALOGUE) {
    updateDialogue(dt);
  }

  updateCamera();

  // 更新區域名稱
  hudLocationEl.textContent = world.getZoneName(
    player.x + player.w / 2,
    player.y + player.h / 2
  );

  // 繪製世界
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const nearbyObj =
    currentState === GAME_STATE.EXPLORE
      ? world.findNearbyInteractable(player)
      : null;

  world.render(ctx, camera, player, nearbyObj, timeSec);

  // Step 3 審計者之眼疊加層預留接口
  if (auditLens.isActive()) {
    auditLens.renderOverlay(ctx, world, camera, timeSec);
  }

  requestAnimationFrame(gameLoop);
}

// 初始同步與啟動開場提示
syncHUD();
openDialogue(
  '系統提示',
  '序章・無名之鎮',
  [
    '你是一名「迴路審計員」，奉命前來調查這座高度依賴 AI 的「無名之鎮」。',
    '使用 WASD 或方向鍵移動，靠近鎮民與地標後按 Space 或 E 鍵互動。先往北走到城門與「入鎮守衛」談談吧！',
  ]
);

requestAnimationFrame(gameLoop);
