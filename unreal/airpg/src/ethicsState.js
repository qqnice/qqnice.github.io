/**
 * ethicsState.js — 隱藏倫理指標追蹤、服務條款狀態與審計日誌系統
 */

export class EthicsState {
  constructor() {
    this.metrics = {
      utility: 50,   // 系統效能 (0~100)
      privacy: 80,   // 隱私保護 (0~100)
      security: 50,  // 資安防禦 (0~100)
    };

    this.gold = 0;
    this.speedMultiplier = 1.0;

    // 關鍵狀態旗標（供 Step 2 ~ Step 4 蝴蝶效應使用）
    this.flags = {
      tosSigned: false,
      dataExposed: false,       // 若未取消預設勾選直接「全部同意」則為 true
      auditLensUnlocked: true,
      vaultCleared: false,
      vaultDecision: null,      // 'public_leak' | 'rbac_wall'
    };

    this.logs = [
      {
        time: '序章',
        text: '抵達「無名之鎮」南門外。任務：以迴路審計員身分調查鎮上異常的「全知水晶球」與向量記憶庫。',
      },
    ];

    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(event) {
    for (const fn of this.listeners) {
      fn(event, this);
    }
  }

  adjustMetric(key, delta, reason = '') {
    if (!(key in this.metrics) || delta === 0) return;
    const prev = this.metrics[key];
    this.metrics[key] = Math.max(0, Math.min(100, prev + delta));
    if (reason) {
      this.addLog(reason);
    }
    this.emit({ type: 'metric', key, delta, value: this.metrics[key], reason });
  }

  addGold(amount) {
    this.gold = Math.max(0, this.gold + amount);
    this.emit({ type: 'gold', delta: amount, gold: this.gold });
  }

  setFlag(key, value, logText = '') {
    this.flags[key] = value;
    if (logText) this.addLog(logText);
    this.emit({ type: 'flag', key, value });
  }

  addLog(text) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    this.logs.unshift({ time: `${hh}:${mm}`, text });
    if (this.logs.length > 30) this.logs.pop();
    this.emit({ type: 'log', text });
  }
}

export const ethicsState = new EthicsState();
