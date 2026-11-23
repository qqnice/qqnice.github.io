/**
 * sprites.js — 程式碼動態繪製 16-bit 復古像素風格 Tilemap 與角色精靈圖
 * 所有圖塊與角色以 16x16 原生像素繪製並快取於離屏 Canvas，渲染時採整數倍放大保持銳利像素感。
 */

const BASE = 16;

function createOffscreen(w = BASE, h = BASE) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas: c, ctx };
}

function drawMatrix(ctx, rows, palette, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
    }
  }
}

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/* =========================================================
   1. 16x16 環境地形圖塊 (Tiles)
   ========================================================= */

function makeGrassTile(variant = 0) {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#3a7d44');
  // 細微像素紋理
  const patches = [
    [2, 3], [6, 1], [11, 5], [4, 10], [13, 12], [8, 14], [1, 13], [14, 2]
  ];
  for (const [x, y] of patches) {
    px(ctx, x, y, 2, 1, '#316b3a');
  }
  const blades = [
    [3, 5], [10, 3], [7, 11], [13, 8]
  ];
  for (const [x, y] of blades) {
    px(ctx, x, y, 1, 2, '#51a35a');
  }
  if (variant === 1) {
    // 小白花
    px(ctx, 5, 6, 1, 1, '#fef08a');
    px(ctx, 4, 6, 1, 1, '#f8fafc');
    px(ctx, 6, 6, 1, 1, '#f8fafc');
    px(ctx, 5, 5, 1, 1, '#f8fafc');
    px(ctx, 5, 7, 1, 1, '#f8fafc');
  } else if (variant === 2) {
    // 小藍花
    px(ctx, 11, 10, 1, 1, '#fde047');
    px(ctx, 10, 10, 1, 1, '#7dd3fc');
    px(ctx, 12, 10, 1, 1, '#7dd3fc');
    px(ctx, 11, 9, 1, 1, '#7dd3fc');
    px(ctx, 11, 11, 1, 1, '#7dd3fc');
  }
  return canvas;
}

function makeCobbleTile(variant = 0) {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#64748b');
  // 鵝卵石縫隙
  px(ctx, 0, 7, 16, 1, '#475569');
  px(ctx, 0, 15, 16, 1, '#475569');
  px(ctx, 7, 0, 1, 8, '#475569');
  px(ctx, 15, 0, 1, 8, '#475569');
  px(ctx, 3, 8, 1, 8, '#475569');
  px(ctx, 11, 8, 1, 8, '#475569');
  // 石塊亮面
  px(ctx, 1, 1, 5, 5, '#7c8ea6');
  px(ctx, 9, 1, 5, 5, '#74869e');
  px(ctx, 5, 9, 5, 5, '#7c8ea6');
  px(ctx, 13, 9, 3, 5, '#708299');
  px(ctx, 0, 9, 2, 5, '#74869e');
  // 高光
  px(ctx, 1, 1, 4, 1, '#94a3b8');
  px(ctx, 9, 1, 4, 1, '#94a3b8');
  px(ctx, 5, 9, 4, 1, '#94a3b8');
  if (variant === 1) {
    // 淡淡青苔點綴
    px(ctx, 7, 7, 2, 1, '#4d8b55');
  }
  return canvas;
}

function makePlazaTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#8b9bb4');
  px(ctx, 0, 0, 16, 1, '#b8c4d9');
  px(ctx, 0, 0, 1, 16, '#b8c4d9');
  px(ctx, 0, 15, 16, 1, '#5a6988');
  px(ctx, 15, 0, 1, 16, '#5a6988');
  px(ctx, 3, 3, 10, 10, '#9aaac2');
  px(ctx, 4, 4, 8, 8, '#8b9bb4');
  return canvas;
}

function makeWallTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#3b4252');
  // 石牆磚塊
  px(ctx, 1, 1, 6, 6, '#566178');
  px(ctx, 8, 1, 7, 6, '#4c566a');
  px(ctx, 0, 8, 4, 7, '#4c566a');
  px(ctx, 5, 8, 6, 7, '#566178');
  px(ctx, 12, 8, 4, 7, '#4c566a');
  // 頂緣高光
  px(ctx, 1, 1, 6, 1, '#7b88a1');
  px(ctx, 8, 1, 7, 1, '#6f7c96');
  px(ctx, 5, 8, 6, 1, '#7b88a1');
  return canvas;
}

function makeGateArchTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#64748b');
  // 城門石磚地板 + 金色門檻
  px(ctx, 0, 0, 16, 16, '#7c8ea6');
  px(ctx, 0, 13, 16, 3, '#c9a227');
  px(ctx, 0, 13, 16, 1, '#fde047');
  px(ctx, 0, 0, 2, 16, '#475569');
  px(ctx, 14, 0, 2, 16, '#475569');
  return canvas;
}

function makeTreeTile() {
  const { canvas, ctx } = createOffscreen();
  // 先畫草地底
  ctx.drawImage(makeGrassTile(0), 0, 0);
  // 陰影
  px(ctx, 3, 13, 10, 3, 'rgba(15, 23, 42, 0.35)');
  // 樹幹
  px(ctx, 6, 10, 4, 5, '#6b4226');
  px(ctx, 7, 10, 1, 5, '#8c5a36');
  // 樹冠多層像素
  px(ctx, 2, 4, 12, 7, '#1b4332');
  px(ctx, 3, 2, 10, 8, '#2d6a4f');
  px(ctx, 4, 1, 8, 6, '#40916c');
  px(ctx, 5, 2, 5, 3, '#52b788');
  px(ctx, 6, 2, 2, 1, '#74c69d');
  return canvas;
}

function makeRoofTile(colorMain = '#9b2c2c', colorLight = '#c53030', colorDark = '#63171b') {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, colorDark);
  for (let y = 0; y < 16; y += 4) {
    px(ctx, 0, y, 16, 3, colorMain);
    px(ctx, 0, y, 16, 1, colorLight);
    for (let x = (y % 8 === 0 ? 0 : 2); x < 16; x += 4) {
      px(ctx, x, y + 1, 1, 2, colorDark);
    }
  }
  return canvas;
}

function makeHouseWallTile(hasWindow = false, hasDoor = false) {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#d9c5a0');
  // 木樑結構
  px(ctx, 0, 0, 16, 2, '#5c3a21');
  px(ctx, 0, 14, 16, 2, '#5c3a21');
  px(ctx, 0, 0, 2, 16, '#6e472b');
  px(ctx, 14, 0, 2, 16, '#6e472b');
  if (hasWindow) {
    px(ctx, 4, 4, 8, 7, '#3b2415');
    px(ctx, 5, 5, 6, 5, '#38bdf8');
    px(ctx, 5, 5, 3, 2, '#bae6fd');
    px(ctx, 7, 5, 2, 5, '#5c3a21');
    px(ctx, 5, 7, 6, 1, '#5c3a21');
  }
  if (hasDoor) {
    px(ctx, 4, 4, 8, 12, '#4a2c16');
    px(ctx, 5, 5, 6, 11, '#7c4a26');
    px(ctx, 9, 10, 1, 1, '#f5c542');
  }
  return canvas;
}

function makeVaultWallTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#1e293b');
  px(ctx, 1, 1, 14, 14, '#27354d');
  // 神秘向量符文線條
  px(ctx, 2, 3, 12, 1, '#38e8ff');
  px(ctx, 4, 6, 8, 1, '#818cf8');
  px(ctx, 7, 4, 2, 8, '#38e8ff');
  px(ctx, 3, 12, 10, 1, '#475569');
  return canvas;
}

function makeVaultDoorTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#1e293b');
  px(ctx, 2, 1, 12, 15, '#0f172a');
  px(ctx, 3, 2, 10, 14, '#312e81');
  // 發光閘門
  px(ctx, 4, 3, 8, 12, '#4338ca');
  px(ctx, 6, 5, 4, 8, '#38e8ff');
  px(ctx, 7, 6, 2, 6, '#e0f2fe');
  return canvas;
}

function makeWaterTile() {
  const { canvas, ctx } = createOffscreen();
  px(ctx, 0, 0, 16, 16, '#1d4ed8');
  px(ctx, 2, 3, 5, 1, '#60a5fa');
  px(ctx, 9, 8, 5, 1, '#60a5fa');
  px(ctx, 4, 13, 6, 1, '#93c5fd');
  return canvas;
}

function makeSignpostTile() {
  const { canvas, ctx } = createOffscreen();
  ctx.drawImage(makeGrassTile(0), 0, 0);
  px(ctx, 7, 9, 2, 6, '#6b4226');
  px(ctx, 2, 3, 12, 7, '#8c5a36');
  px(ctx, 3, 4, 10, 5, '#c49a6c');
  px(ctx, 4, 5, 8, 1, '#5c3a21');
  px(ctx, 4, 7, 6, 1, '#5c3a21');
  return canvas;
}

function makeLampTile() {
  const { canvas, ctx } = createOffscreen();
  ctx.drawImage(makeCobbleTile(0), 0, 0);
  px(ctx, 7, 6, 2, 9, '#334155');
  px(ctx, 6, 14, 4, 2, '#1e293b');
  px(ctx, 5, 2, 6, 5, '#475569');
  px(ctx, 6, 3, 4, 3, '#fde047');
  px(ctx, 7, 4, 2, 1, '#ffffff');
  return canvas;
}

/* =========================================================
   2. 16x16 互動物件與特殊地標精靈
   ========================================================= */

function makeOrbMonument() {
  // 32x32 的「全知水晶球」核心地標
  const { canvas, ctx } = createOffscreen(32, 32);
  // 底座陰影
  px(ctx, 4, 24, 24, 6, 'rgba(15, 23, 42, 0.45)');
  // 石造祭壇底座
  px(ctx, 5, 20, 22, 8, '#475569');
  px(ctx, 6, 19, 20, 4, '#64748b');
  px(ctx, 8, 17, 16, 4, '#94a3b8');
  // 底座紫色數據導管
  px(ctx, 14, 20, 4, 8, '#a855f7');
  px(ctx, 15, 20, 2, 8, '#e879f9');
  // 水晶球主體
  px(ctx, 9, 4, 14, 14, '#581c87');
  px(ctx, 10, 3, 12, 16, '#7e22ce');
  px(ctx, 8, 6, 16, 10, '#9333ea');
  px(ctx, 10, 5, 12, 12, '#a855f7');
  px(ctx, 11, 6, 9, 9, '#38e8ff');
  px(ctx, 12, 7, 6, 6, '#bae6fd');
  // 水晶高光與核心之眼
  px(ctx, 11, 5, 3, 2, '#ffffff');
  px(ctx, 14, 9, 4, 4, '#0f172a');
  px(ctx, 15, 10, 2, 2, '#f43f5e');
  return canvas;
}

function makeWishingPool() {
  // 32x32 免費許願池
  const { canvas, ctx } = createOffscreen(32, 32);
  px(ctx, 2, 4, 28, 24, '#64748b');
  px(ctx, 4, 6, 24, 20, '#94a3b8');
  px(ctx, 6, 8, 20, 16, '#1d4ed8');
  px(ctx, 7, 9, 18, 14, '#2563eb');
  // 閃亮水波與許願硬幣
  px(ctx, 9, 11, 5, 1, '#93c5fd');
  px(ctx, 18, 19, 5, 1, '#93c5fd');
  px(ctx, 11, 17, 2, 2, '#fde047');
  px(ctx, 20, 12, 2, 2, '#fde047');
  // 中央小型感應柱（秘密吸取數據的發射器）
  px(ctx, 14, 10, 4, 9, '#cbd5e1');
  px(ctx, 14, 8, 4, 3, '#c084fc');
  px(ctx, 15, 9, 2, 1, '#ffffff');
  return canvas;
}

function makeMerchantStall() {
  // 32x32 智慧自動販賣機 / 商販攤位
  const { canvas, ctx } = createOffscreen(32, 32);
  // 陰影
  px(ctx, 2, 26, 28, 4, 'rgba(15, 23, 42, 0.4)');
  // 攤位雨棚（紫金條紋）
  for (let x = 2; x < 30; x += 4) {
    px(ctx, x, 2, 4, 8, (x / 4) % 2 === 0 ? '#7e22ce' : '#f5c542');
  }
  px(ctx, 2, 10, 28, 2, '#581c87');
  // 攤位支柱
  px(ctx, 3, 12, 2, 15, '#5c3a21');
  px(ctx, 27, 12, 2, 15, '#5c3a21');
  // 櫃檯與魔法價目螢幕
  px(ctx, 3, 17, 26, 10, '#7c4a26');
  px(ctx, 4, 18, 24, 2, '#a16207');
  // 發光顯示屏（大數據動態定價看板）
  px(ctx, 8, 12, 16, 6, '#0f172a');
  px(ctx, 9, 13, 14, 4, '#22d3ee');
  px(ctx, 10, 14, 5, 2, '#0f172a');
  px(ctx, 17, 14, 5, 2, '#f43f5e');
  // 商品藥水瓶
  px(ctx, 7, 21, 3, 4, '#ef4444');
  px(ctx, 12, 21, 3, 4, '#38bdf8');
  px(ctx, 17, 21, 3, 4, '#4ade80');
  px(ctx, 22, 21, 3, 4, '#f5c542');
  return canvas;
}

/* =========================================================
   3. 16x16 角色精靈圖生成器（支援 4 方向 + 行走動畫）
   ========================================================= */

function createCharacterSprite(config, dir = 'down', frame = 0) {
  const { canvas, ctx } = createOffscreen(16, 16);
  const {
    hair = '#3b2415',
    skin = '#fbd3b6',
    cloak = '#0f766e',
    cloakLight = '#14b8a6',
    accent = '#f5c542',
    boots = '#1e293b',
    visor = null,
    helmet = false,
  } = config;

  // 腳底陰影
  px(ctx, 4, 13, 8, 3, 'rgba(0, 0, 0, 0.32)');

  const stepOffset = frame === 1 ? 1 : 0;
  const bob = frame === 1 ? -1 : 0;

  // 雙腳
  if (dir === 'left' || dir === 'right') {
    px(ctx, 6 - stepOffset, 12, 2, 3, boots);
    px(ctx, 8 + stepOffset, 12, 2, 3, boots);
  } else {
    px(ctx, 5, 12 + (frame === 1 ? 0 : 1), 2, 3, boots);
    px(ctx, 9, 12 + (frame === 1 ? 1 : 0), 2, 3, boots);
  }

  // 身體與斗篷
  px(ctx, 4, 7 + bob, 8, 6, cloak);
  px(ctx, 5, 7 + bob, 6, 5, cloakLight);
  // 腰帶 / 飾品
  px(ctx, 4, 10 + bob, 8, 1, accent);

  // 頭部
  px(ctx, 4, 2 + bob, 8, 6, skin);
  if (helmet) {
    px(ctx, 3, 1 + bob, 10, 4, hair);
    px(ctx, 6, 0 + bob, 4, 2, accent); // 頭盔羽飾
  } else {
    px(ctx, 4, 1 + bob, 8, 3, hair);
    px(ctx, 3, 2 + bob, 1, 4, hair);
    px(ctx, 12, 2 + bob, 1, 4, hair);
  }

  // 臉部朝向細節
  if (dir === 'down') {
    if (visor) {
      px(ctx, 4, 4 + bob, 8, 2, '#0f172a');
      px(ctx, 5, 4 + bob, 6, 2, visor);
    } else {
      px(ctx, 5, 5 + bob, 1, 2, '#0f172a');
      px(ctx, 10, 5 + bob, 1, 2, '#0f172a');
    }
  } else if (dir === 'up') {
    // 背面全頭髮/帽兜
    px(ctx, 4, 2 + bob, 8, 6, hair);
    px(ctx, 4, 7 + bob, 8, 6, cloak);
  } else if (dir === 'left') {
    px(ctx, 4, 2 + bob, 3, 6, skin);
    px(ctx, 7, 2 + bob, 5, 6, hair);
    if (visor) {
      px(ctx, 4, 4 + bob, 3, 2, visor);
    } else {
      px(ctx, 5, 5 + bob, 1, 2, '#0f172a');
    }
  } else if (dir === 'right') {
    px(ctx, 9, 2 + bob, 3, 6, skin);
    px(ctx, 4, 2 + bob, 5, 6, hair);
    if (visor) {
      px(ctx, 9, 4 + bob, 3, 2, visor);
    } else {
      px(ctx, 10, 5 + bob, 1, 2, '#0f172a');
    }
  }

  return canvas;
}

function makeGargoyleSprite() {
  // 24x24 守門石像鬼 AI
  const { canvas, ctx } = createOffscreen(24, 24);
  px(ctx, 4, 19, 16, 4, 'rgba(0, 0, 0, 0.45)');
  // 石翼
  px(ctx, 1, 6, 6, 9, '#475569');
  px(ctx, 2, 7, 4, 6, '#64748b');
  px(ctx, 17, 6, 6, 9, '#475569');
  px(ctx, 18, 7, 4, 6, '#64748b');
  // 身體與底座
  px(ctx, 7, 9, 10, 11, '#64748b');
  px(ctx, 8, 10, 8, 9, '#94a3b8');
  // 胸口 AI 符文核心
  px(ctx, 10, 12, 4, 4, '#0f172a');
  px(ctx, 11, 13, 2, 2, '#38e8ff');
  // 頭部與角
  px(ctx, 8, 3, 8, 7, '#64748b');
  px(ctx, 9, 4, 6, 5, '#94a3b8');
  px(ctx, 7, 1, 2, 3, '#475569');
  px(ctx, 15, 1, 2, 3, '#475569');
  // 發紅光的警戒眼
  px(ctx, 9, 6, 2, 2, '#fb7185');
  px(ctx, 13, 6, 2, 2, '#fb7185');
  return canvas;
}

/* =========================================================
   4. 匯出統一快取圖庫
   ========================================================= */

export function buildSpriteAtlas() {
  const tiles = {
    grass0: makeGrassTile(0),
    grass1: makeGrassTile(1),
    grass2: makeGrassTile(2),
    cobble0: makeCobbleTile(0),
    cobble1: makeCobbleTile(1),
    plaza: makePlazaTile(),
    wall: makeWallTile(),
    gate: makeGateArchTile(),
    tree: makeTreeTile(),
    roofRed: makeRoofTile('#9b2c2c', '#c53030', '#63171b'),
    roofBlue: makeRoofTile('#2b4c7e', '#3b69ad', '#1a2f4f'),
    roofPurple: makeRoofTile('#5b21b6', '#7c3aed', '#3b0764'),
    houseWall: makeHouseWallTile(false, false),
    houseWin: makeHouseWallTile(true, false),
    houseDoor: makeHouseWallTile(false, true),
    vaultWall: makeVaultWallTile(),
    vaultDoor: makeVaultDoorTile(),
    water: makeWaterTile(),
    sign: makeSignpostTile(),
    lamp: makeLampTile(),
  };

  const objects = {
    orbMonument: makeOrbMonument(),
    wishingPool: makeWishingPool(),
    merchantStall: makeMerchantStall(),
    gargoyle: makeGargoyleSprite(),
  };

  const playerCfg = {
    hair: '#1e293b',
    skin: '#fde2c8',
    cloak: '#0f766e',
    cloakLight: '#14b8a6',
    accent: '#f5c542',
    boots: '#0f172a',
    visor: '#38e8ff',
  };

  const dirs = ['down', 'up', 'left', 'right'];
  const player = {};
  for (const d of dirs) {
    player[d] = [
      createCharacterSprite(playerCfg, d, 0),
      createCharacterSprite(playerCfg, d, 1),
    ];
  }

  const npcs = {
    guard: createCharacterSprite({
      hair: '#94a3b8',
      skin: '#fbd3b6',
      cloak: '#334155',
      cloakLight: '#64748b',
      accent: '#f5c542',
      boots: '#1e293b',
      helmet: true,
    }, 'down', 0),
    merchant: createCharacterSprite({
      hair: '#4c1d95',
      skin: '#fbd3b6',
      cloak: '#6d28d9',
      cloakLight: '#8b5cf6',
      accent: '#fde047',
      boots: '#3b0764',
    }, 'down', 0),
    villagerA: createCharacterSprite({
      hair: '#78350f',
      skin: '#fde2c8',
      cloak: '#9a3412',
      cloakLight: '#ea580c',
      accent: '#fed7aa',
      boots: '#431407',
    }, 'down', 0),
    villagerB: createCharacterSprite({
      hair: '#1e3a8a',
      skin: '#fbd3b6',
      cloak: '#1d4ed8',
      cloakLight: '#3b82f6',
      accent: '#bfdbfe',
      boots: '#172554',
    }, 'down', 0),
    villagerC: createCharacterSprite({
      hair: '#d1d5db',
      skin: '#f3d5b5',
      cloak: '#3f6212',
      cloakLight: '#65a30d',
      accent: '#ecfccb',
      boots: '#1a2e05',
    }, 'down', 0),
  };

  return { tiles, objects, player, npcs };
}
