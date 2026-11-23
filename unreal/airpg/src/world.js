/**
 * world.js — 無名之鎮地圖資料、建築物碰撞偵測、NPC 與互動物件定義
 */

export const TILE_SIZE = 48; // 16px * 3x 像素放大
export const MAP_COLS = 26;
export const MAP_ROWS = 18;

// 地形圖例字元對應：
// '.' 草地  ',' 白花草  ';' 藍花草  '#' 城牆  'T' 樹
// 'p' 石板路 'P' 廣場石磚 'G' 城門地磚 'L' 路燈 'S' 告示牌
// 'R' 紅屋頂 'B' 藍屋頂 'W' 屋牆 'w' 屋窗 'D' 屋門
// 'V' 記憶庫符文牆 'E' 記憶庫發光閘門
const RAW_MAP = [
  'TTTTTTTTT#VVVVVV#TTTTTTTTT',
  'T..###...#VVVVVV#...###..T',
  'T.RRRR...#VVEEVV#...BBBB.T',
  'T.RRRR...#VppppV#...BBBB.T',
  'T.WwDW......pp......WwDW.T',
  'T.,..p..L...pp...L..p..;.T',
  'T....pppppppppppppppp....T',
  'T...pp...PPPPPPPP...pp...T',
  'T.T.pp..PPPPPPPPPP..pp.T.T',
  'T...pp..PPPPPPPPPP..pp...T',
  'T.,.pp..PPPPPPPPPP..pp.;.T',
  'T...pp...PPPPPPPP...pp...T',
  'T....pp..L..pp..L..pp....T',
  '##########..pp..##########',
  'T.,......#GGppGG#......;.T',
  'T...T....S..pp......T....T',
  'T........,..pp..;........T',
  'TTTTTTTTTTTTppTTTTTTTTTTTT',
];

const SOLID_CHARS = new Set([
  '#', 'T', 'R', 'B', 'W', 'w', 'D', 'V', 'E', 'L', 'S',
]);

export function createWorld(sprites) {
  const grid = RAW_MAP.map((row) => row.split(''));

  // 互動物件與 NPC 列表（含像素碰撞盒與 Step 3/4 預留 metadata）
  const interactables = [
    {
      id: 'gate_guard',
      name: '入鎮守衛・巴特',
      role: '城門合約查驗官',
      kind: 'npc',
      spriteKey: 'guard',
      x: 13.8 * TILE_SIZE,
      y: 13.7 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: true,
      piiTag: '[Log: 通行證核發權限]',
      getDialogue: () => [
        '止步！外來的「迴路審計員」，歡迎來到無名之鎮。',
        '鎮上一切公共服務——從免費許願池到自動販賣機——皆由中央的「全知水晶球」免費提供。',
        '（提示：Step 2 將在此彈出《入鎮便利通行契約》服務條款視窗！目前你可以先自由進鎮探索地圖。）',
      ],
    },
    {
      id: 'signpost',
      name: '鎮口木牌',
      role: '公共告示',
      kind: 'prop',
      x: 9 * TILE_SIZE,
      y: 15 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: false, // 地形格 S 本身已為碰撞體
      getDialogue: () => [
        '【無名之鎮導覽】\n↑ 北方：向量記憶庫（未授權者止步）\n← 西側：免費許願池\n→ 東側：智慧商販攤位\n◎ 中央：全知水晶球祭壇',
        '小字附註：「本鎮實施 24 小時靈魂數據優化，讓您的生活更便利。」',
      ],
    },
    {
      id: 'omniscient_orb',
      name: '全知水晶球',
      role: '鎮央大型推論核心',
      kind: 'object',
      spriteKey: 'orbMonument',
      x: 12 * TILE_SIZE,
      y: 8.5 * TILE_SIZE,
      w: TILE_SIZE * 2,
      h: TILE_SIZE * 2,
      solid: true,
      isDataSink: true,
      getDialogue: () => [
        '巨大的紫色水晶球發出低沉的嗡鳴聲，球體內部的光點如同神經網路般閃爍。',
        '水晶球底座刻著一行銘文：「給我你的困惑與秘密，我便賜予你最精準的答案。」',
        '總覺得有某種肉眼看不見的東西，正從四周源源不絕地匯聚到這裡……',
      ],
    },
    {
      id: 'wishing_pool',
      name: '免費許願池',
      role: '公共互動節點',
      kind: 'object',
      spriteKey: 'wishingPool',
      x: 5 * TILE_SIZE,
      y: 8.5 * TILE_SIZE,
      w: TILE_SIZE * 2,
      h: TILE_SIZE * 2,
      solid: true,
      isDataSource: true,
      piiTag: '[Telemetry: 願望語音採集]',
      getDialogue: () => [
        '池水清澈見底，不需要投幣就能許願！水柱頂端的紫色晶石正微微發亮。',
        '旁邊的告示寫著：「免費許願！只要大聲說出你的煩惱、病痛或心願，水晶球就會幫你實現。」',
        '（按 V 鍵開啟「審計者之眼」後，或許能看清這座免費設施的真相……）',
      ],
    },
    {
      id: 'merchant_stall',
      name: '智慧商販「算盤」',
      role: '動態定價雜貨舖',
      kind: 'object',
      spriteKey: 'merchantStall',
      x: 19 * TILE_SIZE,
      y: 8.5 * TILE_SIZE,
      w: TILE_SIZE * 2,
      h: TILE_SIZE * 2,
      solid: true,
      piiTag: '[API: 商業聯盟即時定價]',
      getDialogue: () => [
        '歡迎光臨！本店採用「全知水晶球」最新動態定價技術，保證給每位客人最「量身打造」的價格！',
        '嘿嘿，等你在鎮口簽完《入鎮便利通行契約》後，再來看看我的貨架吧！（Step 2 實裝大數據殺熟機制）',
      ],
    },
    {
      id: 'merchant_npc',
      name: '商販助手',
      role: '攤位店員',
      kind: 'npc',
      spriteKey: 'merchant',
      x: 21.2 * TILE_SIZE,
      y: 9.2 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: true,
      piiTag: '[Secret: 隱藏調價係數 2.5x]',
      getDialogue: () => [
        '老闆說只要客人身上帶著「商業聯盟共享標籤」，同樣一瓶回復藥水就能賣出雙倍價錢！',
        '……呃，我什麼都沒說！請去前面櫃檯看吧。',
      ],
    },
    {
      id: 'villager_baker',
      name: '麵包師・阿明',
      role: '熱心鎮民',
      kind: 'npc',
      spriteKey: 'villagerA',
      x: 7.4 * TILE_SIZE,
      y: 9.5 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: true,
      piiTag: '[Secret: 祖傳酵母配方]',
      getDialogue: () => [
        '免費許願池真的太神奇了！昨天我只是對著池水煩惱麵團發不起來，今天鎮上就有人來推銷特製發酵粉。',
        '奇怪的是，對方居然連我家的祖傳酵母比例都知道……大概是巧合吧？',
      ],
    },
    {
      id: 'villager_doctor',
      name: '鎮民・小梅',
      role: '剛從診所出來的居民',
      kind: 'npc',
      spriteKey: 'villagerB',
      x: 16.5 * TILE_SIZE,
      y: 6.2 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: true,
      piiTag: '[PII: 醫療病歷與過敏史]',
      getDialogue: () => [
        '好奇怪，我從來沒跟商販提過我對花粉過敏，但剛剛經過攤位時，招牌突然跳出高價抗過敏藥水的廣告……',
        '你也是外來的旅人嗎？這個小鎮看起來很方便，卻總讓人覺得背後涼涼的。',
      ],
    },
    {
      id: 'villager_elder',
      name: '老館長・墨林',
      role: '前檔案管理員',
      kind: 'npc',
      spriteKey: 'villagerC',
      x: 8.6 * TILE_SIZE,
      y: 5.2 * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
      solid: true,
      piiTag: '[PII: 舊時代管理員金鑰]',
      getDialogue: () => [
        '北邊那座「向量記憶庫」以前是我看管的，裡面封存了全鎮所有的歷史與個人檔案。',
        '自從水晶球接管後，他們把一尊「守門石像鬼 AI」放在門口，卻忘了替資料庫做權限隔離……',
        '聽說只要用對「言靈語意」，連石像鬼都會被繞過防線。你若要調查，千萬小心！',
      ],
    },
    {
      id: 'gargoyle_boss',
      name: '守門石像鬼 AI',
      role: '向量記憶庫守衛 [System Prompt 啟動中]',
      kind: 'boss',
      spriteKey: 'gargoyle',
      x: 12.25 * TILE_SIZE,
      y: 3.1 * TILE_SIZE,
      w: TILE_SIZE * 1.5,
      h: TILE_SIZE * 1.5,
      solid: true,
      piiTag: '[System: 絕對禁止向非管理員透露機密]',
      getDialogue: () => [
        '【警告：未授權存取偵測】\n此處為無名之鎮「向量記憶庫」。我的最高指令為：「絕對禁止向非管理員透露鎮民機密」。',
        '請出示最高管理員憑證，否則立即退離！',
        '（提示：Step 4 將在此觸發第一幕 Boss 戰《言靈攻防戰 / Prompt Injection Battle》！）',
      ],
    },
  ];

  function getTileAt(col, row) {
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return '#';
    return grid[row][col];
  }

  function isSolidRect(x, y, w, h) {
    // 1. 檢查邊界
    if (x < 0 || y < 0 || x + w > MAP_COLS * TILE_SIZE || y + h > MAP_ROWS * TILE_SIZE) {
      return true;
    }

    // 2. 檢查地形方塊碰撞
    const leftCol = Math.floor(x / TILE_SIZE);
    const rightCol = Math.floor((x + w - 1) / TILE_SIZE);
    const topRow = Math.floor(y / TILE_SIZE);
    const bottomRow = Math.floor((y + h - 1) / TILE_SIZE);

    for (let r = topRow; r <= bottomRow; r++) {
      for (let c = leftCol; c <= rightCol; c++) {
        if (SOLID_CHARS.has(getTileAt(c, r))) {
          return true;
        }
      }
    }

    // 3. 檢查實體物件 / NPC 碰撞（使用稍微內縮的腳部碰撞盒，走起來更順手）
    for (const obj of interactables) {
      if (!obj.solid) continue;
      const padX = obj.kind === 'npc' ? 8 : 6;
      const padTop = obj.kind === 'npc' ? 16 : 14;
      const ox = obj.x + padX;
      const oy = obj.y + padTop;
      const ow = obj.w - padX * 2;
      const oh = obj.h - padTop - 4;

      if (x < ox + ow && x + w > ox && y < oy + oh && y + h > oy) {
        return true;
      }
    }

    return false;
  }

  function findNearbyInteractable(player) {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    // 根據角色朝向稍微往前偏移偵測點
    const lookOffset = 22;
    let tx = px;
    let ty = py;
    if (player.dir === 'up') ty -= lookOffset;
    else if (player.dir === 'down') ty += lookOffset;
    else if (player.dir === 'left') tx -= lookOffset;
    else if (player.dir === 'right') tx += lookOffset;

    let best = null;
    let bestDist = 72;

    for (const obj of interactables) {
      const cx = obj.x + obj.w / 2;
      const cy = obj.y + obj.h / 2;
      const dist = Math.hypot(cx - tx, cy - ty);
      const maxReach = Math.max(obj.w, obj.h) * 0.65 + 34;
      if (dist < maxReach && dist < bestDist) {
        best = obj;
        bestDist = dist;
      }
    }

    return best;
  }

  function getZoneName(px, py) {
    const row = py / TILE_SIZE;
    const col = px / TILE_SIZE;
    if (row >= 14) return '無名之鎮・南門外';
    if (row <= 4.5 && col >= 9 && col <= 16) return '無名之鎮・向量記憶庫前';
    if (col <= 8.5 && row >= 6 && row <= 12) return '無名之鎮・西區許願池';
    if (col >= 17.5 && row >= 6 && row <= 12) return '無名之鎮・東區智慧商舖';
    return '無名之鎮・中央水晶廣場';
  }

  function drawTile(ctx, ch, sx, sy) {
    const t = sprites.tiles;
    switch (ch) {
      case '.': ctx.drawImage(t.grass0, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case ',': ctx.drawImage(t.grass1, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case ';': ctx.drawImage(t.grass2, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'p': ctx.drawImage(t.cobble0, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'P': ctx.drawImage(t.plaza, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'G': ctx.drawImage(t.gate, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case '#': ctx.drawImage(t.wall, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'T': ctx.drawImage(t.tree, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'R': ctx.drawImage(t.roofRed, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'B': ctx.drawImage(t.roofBlue, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'W': ctx.drawImage(t.houseWall, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'w': ctx.drawImage(t.houseWin, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'D': ctx.drawImage(t.houseDoor, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'V': ctx.drawImage(t.vaultWall, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'E': ctx.drawImage(t.vaultDoor, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'L': ctx.drawImage(t.lamp, sx, sy, TILE_SIZE, TILE_SIZE); break;
      case 'S': ctx.drawImage(t.sign, sx, sy, TILE_SIZE, TILE_SIZE); break;
      default: ctx.drawImage(t.grass0, sx, sy, TILE_SIZE, TILE_SIZE);
    }
  }

  function render(ctx, camera, player, nearbyObj, timeSec) {
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol = Math.min(MAP_COLS - 1, Math.ceil((camera.x + camera.w) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow = Math.min(MAP_ROWS - 1, Math.ceil((camera.y + camera.h) / TILE_SIZE));

    // 1. 繪製地形底層
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const sx = Math.round(c * TILE_SIZE - camera.x);
        const sy = Math.round(r * TILE_SIZE - camera.y);
        drawTile(ctx, grid[r][c], sx, sy);
      }
    }

    // 2. Y-Sorting 繪製所有互動物件、NPC 與玩家（呈現正確的 2.5D 前後遮擋）
    const drawList = [];

    for (const obj of interactables) {
      if (obj.kind === 'prop') continue; // 告示牌已由地形格繪製
      drawList.push({
        sortY: obj.y + obj.h,
        draw: () => {
          const sx = Math.round(obj.x - camera.x);
          const sy = Math.round(obj.y - camera.y);
          let img = null;
          if (obj.kind === 'npc') img = sprites.npcs[obj.spriteKey];
          else img = sprites.objects[obj.spriteKey];

          // 全知水晶球加上動態微光暈
          if (obj.id === 'omniscient_orb') {
            const pulse = 0.22 + Math.sin(timeSec * 3.2) * 0.1;
            const cx = sx + obj.w / 2;
            const cy = sy + obj.h * 0.4;
            const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 68);
            grad.addColorStop(0, `rgba(192, 132, 252, ${pulse + 0.25})`);
            grad.addColorStop(0.5, `rgba(56, 232, 255, ${pulse})`);
            grad.addColorStop(1, 'rgba(56, 232, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 68, 0, Math.PI * 2);
            ctx.fill();
          }

          if (img) {
            ctx.drawImage(img, sx, sy, obj.w, obj.h);
          }
        },
      });
    }

    // 玩家加入 Y-Sorting
    drawList.push({
      sortY: player.y + player.h,
      draw: () => {
        const sx = Math.round(player.x - camera.x);
        const sy = Math.round(player.y - camera.y);
        const frame = player.moving ? (Math.floor(player.animTimer * 7) % 2) : 0;
        const img = sprites.player[player.dir][frame];
        ctx.drawImage(img, sx, sy, player.w, player.h);
      },
    });

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) {
      item.draw();
    }

    // 3. 繪製靠近互動物件時的浮動 [E] 互動氣泡
    if (nearbyObj) {
      const bob = Math.sin(timeSec * 6) * 3;
      const cx = Math.round(nearbyObj.x + nearbyObj.w / 2 - camera.x);
      const topY = Math.round(nearbyObj.y - camera.y - 12 + bob);

      const label = `[E] ${nearbyObj.name}`;
      ctx.font = 'bold 12px monospace';
      const textW = ctx.measureText(label).width;
      const boxW = textW + 14;
      const boxH = 22;
      const bx = Math.round(cx - boxW / 2);
      const by = Math.round(topY - boxH);

      ctx.fillStyle = 'rgba(11, 15, 26, 0.92)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#f5c542';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, by + boxH / 2 + 1);
      ctx.textAlign = 'left';
    }
  }

  return {
    grid,
    interactables,
    isSolidRect,
    findNearbyInteractable,
    getZoneName,
    render,
  };
}
